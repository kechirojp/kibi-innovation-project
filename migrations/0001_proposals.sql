CREATE TABLE IF NOT EXISTS proposals (
  id TEXT PRIMARY KEY,
  municipality TEXT NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  detail TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL,
  issue_url TEXT
);
CREATE INDEX IF NOT EXISTS proposals_status_created ON proposals(status, created_at);
