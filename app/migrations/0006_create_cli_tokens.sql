CREATE TABLE IF NOT EXISTS cli_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,       -- SHA-256 hash of the token
  name TEXT NOT NULL DEFAULT 'CLI',
  last_used_at TEXT,
  expires_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_cli_tokens_user_id ON cli_tokens(user_id);
CREATE INDEX idx_cli_tokens_token_hash ON cli_tokens(token_hash);
