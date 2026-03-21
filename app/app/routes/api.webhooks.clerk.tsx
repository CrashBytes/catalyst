import type { ActionFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { getDb } from "~/lib/db.server";
import { createUser } from "~/services/user.server";
import { execute } from "~/lib/db.server";
import { checkRateLimit } from "~/lib/rate-limit.server";

interface WebhookEvent {
  type: string;
  data: {
    id: string;
    email_addresses?: Array<{ email_address: string }>;
    first_name?: string | null;
    last_name?: string | null;
    image_url?: string | null;
  };
}

export async function action(args: ActionFunctionArgs) {
  if (args.request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  // Rate limiting
  const rateLimitDb = getDb(args.context);
  const ip = args.request.headers.get("CF-Connecting-IP") || "unknown";
  const rateLimit = await checkRateLimit(rateLimitDb, `api:clerk-webhook:${ip}`, 100, 1);
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
  const webhookSecret = env.CLERK_WEBHOOK_SECRET;

  // Verify webhook signature using svix headers
  const svixId = args.request.headers.get("svix-id");
  const svixTimestamp = args.request.headers.get("svix-timestamp");
  const svixSignature = args.request.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return json({ error: "Missing svix headers" }, { status: 400 });
  }

  const body = await args.request.text();

  // Verify the webhook signature
  const encoder = new TextEncoder();
  const signedContent = `${svixId}.${svixTimestamp}.${body}`;
  const secretBytes = Uint8Array.from(
    atob(webhookSecret.replace("whsec_", "")),
    (c) => c.charCodeAt(0)
  );
  const key = await crypto.subtle.importKey(
    "raw",
    secretBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(signedContent)
  );
  const computedSignature = btoa(
    String.fromCharCode(...new Uint8Array(signatureBuffer))
  );

  // svix-signature can contain multiple signatures separated by spaces
  const signatures = svixSignature.split(" ").map((sig) => {
    const parts = sig.split(",");
    return parts.length > 1 ? parts[1] : parts[0];
  });

  const isValid = signatures.some((sig) => sig === computedSignature);
  if (!isValid) {
    return json({ error: "Invalid signature" }, { status: 401 });
  }

  const db = getDb(args.context);
  const event: WebhookEvent = JSON.parse(body);

  switch (event.type) {
    case "user.created":
    case "user.updated": {
      const { id, email_addresses, first_name, last_name, image_url } =
        event.data;
      const email = email_addresses?.[0]?.email_address || "";
      const name = [first_name, last_name].filter(Boolean).join(" ") || null;

      await createUser(db, {
        id,
        email,
        name: name || undefined,
        avatar_url: image_url || undefined,
      });
      break;
    }

    case "user.deleted": {
      const { id } = event.data;
      await execute(db, "DELETE FROM users WHERE id = ?", [id]);
      break;
    }

    default:
      // Unhandled event type, ignore
      break;
  }

  return json({ received: true }, { status: 200 });
}
