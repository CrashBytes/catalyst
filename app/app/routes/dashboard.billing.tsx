import type {
  LoaderFunctionArgs,
  ActionFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare";
import { json, redirect } from "@remix-run/cloudflare";
import { useLoaderData, Form, useNavigation, useRouteError, isRouteErrorResponse } from "@remix-run/react";
import { getAuth } from "@clerk/remix/ssr.server";
import { getDb } from "~/lib/db.server";
import { getUserById, updateUserStripeCustomerId } from "~/services/user.server";
import { getActiveSubscription } from "~/services/subscription.server";
import { PLANS, type PlanType } from "~/lib/plans";
import {
  getStripe,
  createCheckoutSession,
  createCustomerPortalSession,
  createStripeCustomer,
} from "~/lib/stripe.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Billing - Catalyst" },
    { name: "description", content: "Manage your Catalyst subscription and billing." },
    { name: "theme-color", content: "#16a34a" },
  ];
};

export async function loader(args: LoaderFunctionArgs) {
  const { userId } = await getAuth(args);
  if (!userId) return redirect("/sign-in");

  const db = getDb(args.context);
  const user = await getUserById(db, userId);
  if (!user) {
    throw new Response("User not found", { status: 404 });
  }

  const subscription = await getActiveSubscription(db, userId);

  return json({
    user: {
      id: user.id,
      email: user.email,
      plan: user.plan,
      stripeCustomerId: user.stripe_customer_id,
    },
    subscription,
    plans: PLANS,
  });
}

export async function action(args: ActionFunctionArgs) {
  const { userId } = await getAuth(args);
  if (!userId) return redirect("/sign-in");

  const db = getDb(args.context);
  const env = args.context.cloudflare.env as unknown as Env;
  const stripe = getStripe(env);

  const formData = await args.request.formData();
  const intent = formData.get("intent") as string;

  const user = await getUserById(db, userId);
  if (!user) {
    return json({ error: "User not found." }, { status: 404 });
  }

  const url = new URL(args.request.url);
  const baseUrl = `${url.protocol}//${url.host}`;

  if (intent === "checkout") {
    const planType = formData.get("plan") as PlanType;
    const interval = (formData.get("interval") as string) || "monthly";

    let priceId: string;
    if (planType === "pro") {
      priceId =
        interval === "annual"
          ? env.STRIPE_PRO_ANNUAL_PRICE_ID
          : env.STRIPE_PRO_MONTHLY_PRICE_ID;
    } else if (planType === "team") {
      priceId = env.STRIPE_TEAM_MONTHLY_PRICE_ID;
    } else {
      return json({ error: "Invalid plan." }, { status: 400 });
    }

    // Create or retrieve Stripe customer
    let customerId = user.stripe_customer_id;
    if (!customerId) {
      const customer = await createStripeCustomer(
        stripe,
        user.email,
        user.name || undefined
      );
      customerId = customer.id;
      await updateUserStripeCustomerId(db, userId, customerId);
    }

    const session = await createCheckoutSession(stripe, {
      customerId,
      priceId,
      successUrl: `${baseUrl}/dashboard/billing?success=true`,
      cancelUrl: `${baseUrl}/dashboard/billing?canceled=true`,
    });

    return redirect(session.url!);
  }

  if (intent === "portal") {
    if (!user.stripe_customer_id) {
      return json(
        { error: "No billing account found. Subscribe to a plan first." },
        { status: 400 }
      );
    }

    const session = await createCustomerPortalSession(
      stripe,
      user.stripe_customer_id,
      `${baseUrl}/dashboard/billing`
    );

    return redirect(session.url);
  }

  return json({ error: "Invalid action." }, { status: 400 });
}

export default function BillingPage() {
  const { user, subscription, plans } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const searchParams =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams();
  const showSuccess = searchParams.get("success") === "true";
  const showCanceled = searchParams.get("canceled") === "true";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Billing</h1>
        <p className="mt-1 text-sm text-guard-400">
          Manage your subscription and billing details.
        </p>
      </div>

      {showSuccess && (
        <div className="rounded-lg border border-green-800 bg-green-900/30 p-4">
          <p className="text-sm text-green-400">
            Your subscription has been activated. Welcome to Catalyst{" "}
            {plans[user.plan]?.name || user.plan}!
          </p>
        </div>
      )}

      {showCanceled && (
        <div className="rounded-lg border border-yellow-800 bg-yellow-900/30 p-4">
          <p className="text-sm text-yellow-400">
            Checkout was canceled. No charges were made.
          </p>
        </div>
      )}

      {/* Current Subscription */}
      <div className="rounded-lg border border-guard-700/50 bg-guard-900/50 p-6">
        <h2 className="text-lg font-semibold text-guard-100">
          Current Subscription
        </h2>
        <div className="mt-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-white">
              {plans[user.plan]?.name || "Free"} Plan
            </span>
            {subscription && (
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  subscription.status === "active"
                    ? "bg-green-900/50 text-green-400"
                    : subscription.status === "trialing"
                    ? "bg-catalyst-900/50 text-catalyst-400"
                    : "bg-guard-800/60 text-guard-400"
                }`}
              >
                {subscription.status}
              </span>
            )}
          </div>
          {subscription && (
            <div className="mt-2 text-sm text-guard-400">
              <p>
                Current period:{" "}
                {new Date(
                  subscription.current_period_start
                ).toLocaleDateString()}{" "}
                -{" "}
                {new Date(
                  subscription.current_period_end
                ).toLocaleDateString()}
              </p>
              {subscription.cancel_at_period_end === 1 && (
                <p className="mt-1 text-knowledge-500">
                  Cancels at end of billing period.
                </p>
              )}
            </div>
          )}
          {user.stripeCustomerId && (
            <Form method="post" className="mt-4">
              <input type="hidden" name="intent" value="portal" />
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg border border-guard-700/50 px-4 py-2 text-sm font-medium text-guard-300 hover:bg-guard-800/60 disabled:opacity-50"
              >
                {isSubmitting ? "Redirecting..." : "Manage Billing in Stripe"}
              </button>
            </Form>
          )}
        </div>
      </div>

      {/* Plan Selector */}
      <div>
        <h2 className="text-lg font-semibold text-guard-100 mb-4">
          {user.plan === "free" ? "Upgrade your plan" : "Available Plans"}
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {(Object.entries(plans) as [PlanType, (typeof plans)[PlanType]][]).map(
            ([type, plan]) => (
              <div
                key={type}
                className={`rounded-lg border p-6 ${
                  user.plan === type
                    ? "border-catalyst-500 bg-catalyst-900/20"
                    : "border-guard-700/50 bg-guard-900/50"
                }`}
              >
                <h3 className="text-lg font-semibold text-guard-100">
                  {plan.name}
                </h3>
                <div className="mt-2">
                  {plan.price ? (
                    <p className="text-3xl font-bold text-white">
                      ${plan.price.monthly}
                      <span className="text-base font-normal text-guard-500">
                        /mo
                      </span>
                    </p>
                  ) : (
                    <p className="text-3xl font-bold text-white">Free</p>
                  )}
                </div>
                <ul className="mt-4 space-y-2">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm text-guard-400"
                    >
                      <span className="text-catalyst-500 mt-0.5">&#10003;</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  {user.plan === type ? (
                    <span className="block text-center text-sm font-medium text-catalyst-400">
                      Current plan
                    </span>
                  ) : type === "free" ? (
                    <span className="block text-center text-sm text-guard-500">
                      --
                    </span>
                  ) : (
                    <Form method="post">
                      <input type="hidden" name="intent" value="checkout" />
                      <input type="hidden" name="plan" value={type} />
                      <input
                        type="hidden"
                        name="interval"
                        value="monthly"
                      />
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-lg bg-catalyst-600 px-4 py-2 text-sm font-medium text-white hover:bg-catalyst-500 disabled:opacity-50"
                      >
                        {isSubmitting
                          ? "Redirecting..."
                          : user.plan === "free"
                            ? `Upgrade to ${plan.name}`
                            : `Switch to ${plan.name}`}
                      </button>
                    </Form>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  return (
    <div className="rounded-xl border border-red-800/50 bg-red-900/20 p-6">
      <h2 className="text-lg font-semibold text-red-400">Something went wrong</h2>
      <p className="mt-2 text-sm text-guard-400">
        {isRouteErrorResponse(error)
          ? `${error.status}: ${error.data}`
          : error instanceof Error
            ? error.message
            : "An unexpected error occurred."}
      </p>
      <a href="/dashboard" className="mt-4 inline-block text-sm text-catalyst-400 hover:text-catalyst-300">
        Back to dashboard
      </a>
    </div>
  );
}
