import type {
  LoaderFunctionArgs,
  ActionFunctionArgs,
} from "@remix-run/cloudflare";
import { json, redirect } from "@remix-run/cloudflare";
import { useLoaderData, useActionData, Form } from "@remix-run/react";
import { getAuth } from "@clerk/remix/ssr.server";
import { UserProfile } from "@clerk/remix";
import { getDb } from "~/lib/db.server";
import { queryAll, execute } from "~/lib/db.server";
import { generateToken, hashToken } from "~/lib/auth.server";
import { useState } from "react";

interface CliToken {
  id: string;
  name: string;
  last_used_at: string | null;
  created_at: string;
}

export async function loader(args: LoaderFunctionArgs) {
  const { userId } = await getAuth(args);
  if (!userId) return redirect("/sign-in");

  const db = getDb(args.context);
  const tokens = await queryAll<CliToken>(
    db,
    "SELECT id, name, last_used_at, created_at FROM cli_tokens WHERE user_id = ? ORDER BY created_at DESC",
    [userId]
  );

  return json({ tokens });
}

export async function action(args: ActionFunctionArgs) {
  const { userId } = await getAuth(args);
  if (!userId) return redirect("/sign-in");

  const db = getDb(args.context);
  const formData = await args.request.formData();
  const intent = formData.get("intent") as string;

  if (intent === "create-token") {
    const name = (formData.get("tokenName") as string) || "CLI";

    const rawToken = generateToken();
    const tokenHash = await hashToken(rawToken);
    const id = crypto.randomUUID();

    await execute(
      db,
      "INSERT INTO cli_tokens (id, user_id, token_hash, name) VALUES (?, ?, ?, ?)",
      [id, userId, tokenHash, name.trim()]
    );

    return json({ newToken: rawToken, tokenName: name.trim() });
  }

  if (intent === "delete-token") {
    const tokenId = formData.get("tokenId") as string;
    if (!tokenId) {
      return json({ error: "Token ID is required." }, { status: 400 });
    }

    await execute(
      db,
      "DELETE FROM cli_tokens WHERE id = ? AND user_id = ?",
      [tokenId, userId]
    );

    return json({ deleted: true });
  }

  return json({ error: "Invalid action." }, { status: 400 });
}

export default function SettingsPage() {
  const { tokens } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [showCreateToken, setShowCreateToken] = useState(false);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="mt-1 text-sm text-guard-400">
          Manage your account and CLI access tokens.
        </p>
      </div>

      {/* Clerk User Profile */}
      <div className="rounded-lg border border-guard-700/50 bg-guard-900/50 p-6">
        <h2 className="text-lg font-semibold text-guard-100 mb-4">Profile</h2>
        <UserProfile
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "shadow-none border-0 p-0",
            },
          }}
        />
      </div>

      {/* CLI Tokens */}
      <div className="rounded-lg border border-guard-700/50 bg-guard-900/50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-guard-100">
              CLI Access Tokens
            </h2>
            <p className="mt-1 text-sm text-guard-400">
              Generate tokens to authenticate the Catalyst CLI.
            </p>
          </div>
          <button
            onClick={() => setShowCreateToken(!showCreateToken)}
            className="rounded-lg bg-catalyst-600 px-4 py-2 text-sm font-medium text-white hover:bg-catalyst-500"
          >
            New Token
          </button>
        </div>

        {/* New token created message */}
        {actionData && "newToken" in actionData && (
          <div className="mt-4 rounded-lg border border-green-800 bg-green-900/30 p-4">
            <p className="text-sm font-medium text-green-400">
              Token &quot;{actionData.tokenName}&quot; created successfully.
              Copy it now -- you won&apos;t be able to see it again.
            </p>
            <div className="mt-2 flex items-center gap-2">
              <code className="flex-1 rounded bg-guard-800 px-3 py-2 text-sm font-mono text-guard-100 border border-green-800">
                {actionData.newToken}
              </code>
              <button
                onClick={() =>
                  navigator.clipboard.writeText(
                    (actionData as { newToken: string }).newToken
                  )
                }
                className="rounded-lg border border-guard-700/50 px-3 py-2 text-sm font-medium text-guard-300 hover:bg-guard-800/60"
              >
                Copy
              </button>
            </div>
          </div>
        )}

        {/* Create Token Form */}
        {showCreateToken && (
          <Form method="post" className="mt-4 flex items-end gap-3">
            <input type="hidden" name="intent" value="create-token" />
            <div className="flex-1">
              <label
                htmlFor="tokenName"
                className="block text-sm font-medium text-guard-300"
              >
                Token Name
              </label>
              <input
                type="text"
                id="tokenName"
                name="tokenName"
                defaultValue="CLI"
                className="mt-1 block w-full rounded-lg border border-guard-700 bg-guard-800 px-3 py-2 text-sm text-guard-100 placeholder-guard-500 focus:border-catalyst-500 focus:outline-none focus:ring-1 focus:ring-catalyst-500"
                placeholder="e.g., Work Laptop"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-catalyst-600 px-4 py-2 text-sm font-medium text-white hover:bg-catalyst-500"
            >
              Generate
            </button>
          </Form>
        )}

        {/* Token List */}
        <div className="mt-6">
          {tokens.length === 0 ? (
            <p className="text-sm text-guard-500">
              No tokens yet. Create one to use the CLI.
            </p>
          ) : (
            <div className="divide-y divide-guard-700/50">
              {tokens.map((token) => (
                <div
                  key={token.id}
                  className="flex items-center justify-between py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-guard-100">
                      {token.name}
                    </p>
                    <p className="text-xs text-guard-500">
                      Created{" "}
                      {new Date(token.created_at).toLocaleDateString()}
                      {token.last_used_at &&
                        ` | Last used ${new Date(
                          token.last_used_at
                        ).toLocaleDateString()}`}
                    </p>
                  </div>
                  <Form method="post">
                    <input type="hidden" name="intent" value="delete-token" />
                    <input type="hidden" name="tokenId" value={token.id} />
                    <button
                      type="submit"
                      onClick={(e) => {
                        if (
                          !confirm(
                            "Are you sure you want to revoke this token?"
                          )
                        ) {
                          e.preventDefault();
                        }
                      }}
                      className="text-sm text-red-400 hover:text-red-300"
                    >
                      Revoke
                    </button>
                  </Form>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
