import { queryOne } from "./db.server";

export async function validateCliToken(
  db: D1Database,
  token: string
): Promise<{ userId: string } | null> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const tokenHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  const row = await queryOne<{ user_id: string; expires_at: string | null }>(
    db,
    "SELECT user_id, expires_at FROM cli_tokens WHERE token_hash = ?",
    [tokenHash]
  );

  if (!row) return null;

  if (row.expires_at && new Date(row.expires_at) < new Date()) {
    return null;
  }

  // Update last_used_at
  await db
    .prepare("UPDATE cli_tokens SET last_used_at = datetime('now') WHERE token_hash = ?")
    .bind(tokenHash)
    .run();

  return { userId: row.user_id };
}

export function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
