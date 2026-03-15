CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,                  -- Stripe subscription ID
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_price_id TEXT NOT NULL,
  status TEXT NOT NULL,                 -- 'active' | 'canceled' | 'past_due' | 'trialing'
  current_period_start TEXT NOT NULL,
  current_period_end TEXT NOT NULL,
  cancel_at_period_end INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
