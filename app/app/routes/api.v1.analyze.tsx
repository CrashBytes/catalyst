import type { ActionFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { getAuth } from "@clerk/remix/ssr.server";
import { getDb } from "~/lib/db.server";
import { validateCliToken } from "~/lib/auth.server";
import { getUserById } from "~/services/user.server";
import {
  createAnalysis,
  completeAnalysis,
  getAnalysisCountThisMonth,
} from "~/services/analysis.server";
import { canRunAnalysis } from "~/lib/plans";
import { checkRateLimit } from "~/lib/rate-limit.server";

export async function action(args: ActionFunctionArgs) {
  if (args.request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  const db = getDb(args.context);

  // Rate limiting
  const ip = args.request.headers.get("CF-Connecting-IP") || "unknown";
  const rateLimit = await checkRateLimit(db, `api:analyze:${ip}`, 30, 1);
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

  // Authenticate: try CLI token first, then Clerk
  let userId: string | null = null;

  const authHeader = args.request.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const result = await validateCliToken(db, token);
    if (result) {
      userId = result.userId;
    }
  }

  if (!userId) {
    try {
      const auth = await getAuth(args);
      userId = auth.userId;
    } catch {
      // Not authenticated via Clerk either
    }
  }

  if (!userId) {
    return json(
      { error: "Authentication required. Provide a Bearer token or sign in." },
      { status: 401 }
    );
  }

  // Get user and check plan
  const user = await getUserById(db, userId);
  if (!user) {
    return json({ error: "User not found" }, { status: 404 });
  }

  let body: {
    projectId: string;
    type: string;
    summary?: string;
    results?: string;
    configs?: string;
  };

  try {
    body = await args.request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { projectId, type } = body;

  if (!projectId || !type) {
    return json(
      { error: "projectId and type are required" },
      { status: 400 }
    );
  }

  // Check plan limits
  const currentMonthCount = await getAnalysisCountThisMonth(db, userId);
  const check = canRunAnalysis(user.plan, type, currentMonthCount);

  if (!check.allowed) {
    return json(
      { error: check.reason, code: "PLAN_LIMIT_EXCEEDED" },
      { status: 403 }
    );
  }

  // Create analysis record
  const analysisId = crypto.randomUUID();
  await createAnalysis(db, {
    id: analysisId,
    projectId,
    userId,
    type,
  });

  // If results are provided inline, complete immediately
  if (body.summary && body.results && body.configs) {
    await completeAnalysis(db, analysisId, {
      summary: body.summary,
      results:
        typeof body.results === "string"
          ? body.results
          : JSON.stringify(body.results),
      configs:
        typeof body.configs === "string"
          ? body.configs
          : JSON.stringify(body.configs),
    });

    return json(
      { id: analysisId, status: "completed" },
      { status: 201 }
    );
  }

  return json(
    { id: analysisId, status: "pending" },
    { status: 201 }
  );
}
