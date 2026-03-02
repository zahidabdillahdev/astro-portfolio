CREATE TABLE IF NOT EXISTS profile (
  id INTEGER PRIMARY KEY DEFAULT 1,
  full_name TEXT DEFAULT '', title TEXT DEFAULT '',
  about TEXT DEFAULT '', summary TEXT DEFAULT '',
  email TEXT DEFAULT '', tel TEXT DEFAULT '',
  location TEXT DEFAULT '', location_link TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '', resume_url TEXT DEFAULT '',
  linkedin_url TEXT DEFAULT '', instagram_url TEXT DEFAULT '',
  website_url TEXT DEFAULT '',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS work_experience (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company TEXT NOT NULL, company_link TEXT DEFAULT '',
  role TEXT NOT NULL, description TEXT DEFAULT '',
  start_date TEXT NOT NULL, end_date TEXT DEFAULT NULL,
  is_current INTEGER DEFAULT 0,
  achievements TEXT DEFAULT '[]', badges TEXT DEFAULT '[]',
  logo_url TEXT DEFAULT '', order_index INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS education (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  school TEXT NOT NULL, degree TEXT DEFAULT '',
  start_year TEXT NOT NULL, end_year TEXT DEFAULT NULL,
  order_index INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS skills (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL, category TEXT DEFAULT '',
  order_index INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL, slug TEXT UNIQUE NOT NULL,
  description TEXT DEFAULT '', category TEXT DEFAULT '',
  client TEXT DEFAULT '', thumbnail_url TEXT DEFAULT '',
  link_type TEXT DEFAULT 'url', link_url TEXT DEFAULT '',
  results TEXT DEFAULT '{}', tags TEXT DEFAULT '[]',
  is_featured INTEGER DEFAULT 0, order_index INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS certifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL, issuer TEXT DEFAULT '',
  issue_date TEXT DEFAULT '', expiry_date TEXT DEFAULT '',
  credential_id TEXT DEFAULT '', credential_url TEXT DEFAULT '',
  certificate_url TEXT DEFAULT '', thumbnail_url TEXT DEFAULT '',
  order_index INTEGER DEFAULT 0
);
