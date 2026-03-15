import { queryOne, queryAll, execute } from "~/lib/db.server";

export interface Subscription {
  id: string;
  user_id: string;
  stripe_price_id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: number;
  created_at: string;
  updated_at: string;
}

export async function getActiveSubscription(
  db: D1Database,
  userId: string
): Promise<Subscription | null> {
  return queryOne<Subscription>(
    db,
    "SELECT * FROM subscriptions WHERE user_id = ? AND status IN ('active', 'trialing') ORDER BY created_at DESC LIMIT 1",
    [userId]
  );
}

export async function upsertSubscription(
  db: D1Database,
  sub: {
    id: string;
    userId: string;
    stripePriceId: string;
    status: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
  }
): Promise<void> {
  await execute(
    db,
    `INSERT INTO subscriptions (id, user_id, stripe_price_id, status, current_period_start, current_period_end, cancel_at_period_end)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       status = ?, current_period_start = ?, current_period_end = ?,
       cancel_at_period_end = ?, updated_at = datetime('now')`,
    [
      sub.id,
      sub.userId,
      sub.stripePriceId,
      sub.status,
      sub.currentPeriodStart,
      sub.currentPeriodEnd,
      sub.cancelAtPeriodEnd ? 1 : 0,
      sub.status,
      sub.currentPeriodStart,
      sub.currentPeriodEnd,
      sub.cancelAtPeriodEnd ? 1 : 0,
    ]
  );
}

export async function deleteSubscription(
  db: D1Database,
  subscriptionId: string
): Promise<void> {
  await execute(
    db,
    "UPDATE subscriptions SET status = 'canceled', updated_at = datetime('now') WHERE id = ?",
    [subscriptionId]
  );
}
