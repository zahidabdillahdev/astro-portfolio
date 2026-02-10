CREATE TABLE IF NOT EXISTS profile_assets (
  id INTEGER PRIMARY KEY,
  avatar_key TEXT,
  photo_key TEXT,
  resume_key TEXT,
  updated_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);
