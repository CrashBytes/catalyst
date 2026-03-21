CREATE TABLE IF NOT EXISTS rate_limits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX idx_rate_limits_key_created ON rate_limits(key, created_at);
