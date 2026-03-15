import { queryOne, queryAll, execute } from "~/lib/db.server";
import type { PlanType } from "~/lib/plans";

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  plan: PlanType;
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
}

export async function getUserById(
  db: D1Database,
  id: string
): Promise<User | null> {
  return queryOne<User>(db, "SELECT * FROM users WHERE id = ?", [id]);
}

export async function getUserByEmail(
  db: D1Database,
  email: string
): Promise<User | null> {
  return queryOne<User>(db, "SELECT * FROM users WHERE email = ?", [email]);
}

export async function createUser(
  db: D1Database,
  user: { id: string; email: string; name?: string; avatar_url?: string }
): Promise<void> {
  await execute(
    db,
    "INSERT INTO users (id, email, name, avatar_url) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET email = ?, name = ?, avatar_url = ?, updated_at = datetime('now')",
    [
      user.id,
      user.email,
      user.name || null,
      user.avatar_url || null,
      user.email,
      user.name || null,
      user.avatar_url || null,
    ]
  );
}

export async function updateUserPlan(
  db: D1Database,
  userId: string,
  plan: PlanType
): Promise<void> {
  await execute(
    db,
    "UPDATE users SET plan = ?, updated_at = datetime('now') WHERE id = ?",
    [plan, userId]
  );
}

export async function updateUserStripeCustomerId(
  db: D1Database,
  userId: string,
  stripeCustomerId: string
): Promise<void> {
  await execute(
    db,
    "UPDATE users SET stripe_customer_id = ?, updated_at = datetime('now') WHERE id = ?",
    [stripeCustomerId, userId]
  );
}
