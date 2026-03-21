import type { ActionFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { getDb } from "~/lib/db.server";
import { queryOne } from "~/lib/db.server";
import {
  upsertSubscription,
  deleteSubscription,
} from "~/services/subscription.server";
import { updateUserPlan } from "~/services/user.server";
import type { PlanType } from "~/lib/plans";
import Stripe from "stripe";
import { checkRateLimit } from "~/lib/rate-limit.server";

export async function action(args: ActionFunctionArgs) {
  if (args.request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  // Rate limiting
  const rateLimitDb = getDb(args.context);
  const ip = args.request.headers.get("CF-Connecting-IP") || "unknown";
  const rateLimit = await checkRateLimit(rateLimitDb, `api:stripe-webhook:${ip}`, 100, 1);
  if (!rateLimit.allowed) {
    return json(
      { error: "Rate limit exceeded. Try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": "60",
          "X-RateLimit-Remaining": String(rateLimit.remaining),
        },
      }
    );
  }

  const env = args.context.cloudflare.env as unknown as Env;
  const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-12-18.acacia",
  });

  const body = await args.request.text();
  const signature = args.request.headers.get("stripe-signature");

  if (!signature) {
    return json({ error: "Missing Stripe signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return json({ error: "Invalid signature" }, { status: 400 });
  }

  const db = getDb(args.context);

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode !== "subscription" || !session.subscription) break;

      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      );

      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id;

      // Find user by stripe customer ID
      const user = await queryOne<{ id: string }>(
        db,
        "SELECT id FROM users WHERE stripe_customer_id = ?",
        [customerId]
      );

      if (!user) {
        console.error(
          "No user found for Stripe customer:",
          customerId
        );
        break;
      }

      const priceId = subscription.items.data[0]?.price?.id;
      const plan = determinePlan(env, priceId);

      await upsertSubscription(db, {
        id: subscription.id,
        userId: user.id,
        stripePriceId: priceId || "",
        status: subscription.status,
        currentPeriodStart: new Date(
          subscription.current_period_start * 1000
        ).toISOString(),
        currentPeriodEnd: new Date(
          subscription.current_period_end * 1000
        ).toISOString(),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      });

      await updateUserPlan(db, user.id, plan);
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id;

      const user = await queryOne<{ id: string }>(
        db,
        "SELECT id FROM users WHERE stripe_customer_id = ?",
        [customerId]
      );

      if (!user) break;

      const priceId = subscription.items.data[0]?.price?.id;
      const plan = determinePlan(env, priceId);

      await upsertSubscription(db, {
        id: subscription.id,
        userId: user.id,
        stripePriceId: priceId || "",
        status: subscription.status,
        currentPeriodStart: new Date(
          subscription.current_period_start * 1000
        ).toISOString(),
        currentPeriodEnd: new Date(
          subscription.current_period_end * 1000
        ).toISOString(),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      });

      // Update plan based on subscription status
      if (
        subscription.status === "active" ||
        subscription.status === "trialing"
      ) {
        await updateUserPlan(db, user.id, plan);
      } else if (
        subscription.status === "canceled" ||
        subscription.status === "unpaid"
      ) {
        await updateUserPlan(db, user.id, "free");
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id;

      const user = await queryOne<{ id: string }>(
        db,
        "SELECT id FROM users WHERE stripe_customer_id = ?",
        [customerId]
      );

      if (!user) break;

      await deleteSubscription(db, subscription.id);
      await updateUserPlan(db, user.id, "free");
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId =
        typeof invoice.customer === "string"
          ? invoice.customer
          : invoice.customer?.id;

      if (!customerId) break;

      const user = await queryOne<{ id: string }>(
        db,
        "SELECT id FROM users WHERE stripe_customer_id = ?",
        [customerId]
      );

      if (!user) break;

      // Log payment failure; keep current plan active for now
      console.error(
        `Payment failed for user ${user.id}, invoice ${invoice.id}`
      );
      break;
    }

    default:
      // Unhandled event type
      break;
  }

  return json({ received: true }, { status: 200 });
}

function determinePlan(env: Env, priceId: string | undefined): PlanType {
  if (!priceId) return "free";

  if (
    priceId === env.STRIPE_PRO_MONTHLY_PRICE_ID ||
    priceId === env.STRIPE_PRO_ANNUAL_PRICE_ID
  ) {
    return "pro";
  }

  if (priceId === env.STRIPE_TEAM_MONTHLY_PRICE_ID) {
    return "team";
  }

  return "free";
}
