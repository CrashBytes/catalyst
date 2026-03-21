import type {
  LoaderFunctionArgs,
  ActionFunctionArgs,
} from "@remix-run/cloudflare";
import { json, redirect } from "@remix-run/cloudflare";
import { getAuth } from "@clerk/remix/ssr.server";
import { getDb } from "~/lib/db.server";
import { queryAll, execute } from "~/lib/db.server";
import { validateCliToken, generateToken, hashToken } from "~/lib/auth.server";
import { getUserById } from "~/services/user.server";
import { checkRateLimit } from "~/lib/rate-limit.server";

export async function loader(args: LoaderFunctionArgs) {
  // GET: validate bearer token from Authorization header, return user info
  const db = getDb(args.context);

  // Rate limiting
  const ip = args.request.headers.get("CF-Connecting-IP") || "unknown";
  const rateLimit = await checkRateLimit(db, `api:cli-token:${ip}`, 60, 1);
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

  const authHeader = args.request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return json({ error: "Missing or invalid Authorization header" }, { status: 401 });
  }

  const token = authHeader.slice(7);
  const result = await validateCliToken(db, token);
  if (!result) {
    return json({ error: "Invalid or expired token" }, { status: 401 });
  }

  const user = await getUserById(db, result.userId);
  if (!user) {
    return json({ error: "User not found" }, { status: 404 });
  }

  return json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
    },
  });
}

export async function action(args: ActionFunctionArgs) {
  const db = getDb(args.context);
  const method = args.request.method;

  if (method === "POST") {
    // Authenticated via Clerk, create new CLI token
    const { userId } = await getAuth(args);
    if (!userId) {
      return json({ error: "Authentication required" }, { status: 401 });
    }

    const formData = await args.request.formData();
    const name = (formData.get("name") as string) || "CLI";

    const rawToken = generateToken();
    const tokenHash = await hashToken(rawToken);
    const id = crypto.randomUUID();

    await execute(
      db,
      "INSERT INTO cli_tokens (id, user_id, token_hash, name) VALUES (?, ?, ?, ?)",
      [id, userId, tokenHash, name.trim()]
    );

    return json({
      id,
      token: rawToken,
      name: name.trim(),
      message:
        "Store this token securely. It will not be shown again.",
    });
  }

  if (method === "DELETE") {
    // Authenticated via Clerk, delete CLI token
    const { userId } = await getAuth(args);
    if (!userId) {
      return json({ error: "Authentication required" }, { status: 401 });
    }

    const formData = await args.request.formData();
    const tokenId = formData.get("tokenId") as string;

    if (!tokenId) {
      return json({ error: "Token ID is required" }, { status: 400 });
    }

    await execute(
      db,
      "DELETE FROM cli_tokens WHERE id = ? AND user_id = ?",
      [tokenId, userId]
    );

    return json({ deleted: true });
  }

  return json({ error: "Method not allowed" }, { status: 405 });
}
