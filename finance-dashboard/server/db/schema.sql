CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  institution TEXT NOT NULL,
  institution_id TEXT,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  subtype TEXT,
  balance REAL DEFAULT 0,
  available_balance REAL,
  currency TEXT DEFAULT 'USD',
  access_token_enc TEXT,
  enrollment_id TEXT,
  last_synced TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES accounts(id),
  date TEXT NOT NULL,
  description TEXT NOT NULL,
  merchant TEXT,
  amount REAL NOT NULL,
  currency TEXT DEFAULT 'USD',
  category TEXT,
  category_confidence REAL,
  source TEXT NOT NULL,
  status TEXT DEFAULT 'posted',
  raw_json TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS net_worth_snaps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TEXT DEFAULT (datetime('now')),
  total_assets REAL NOT NULL,
  total_liabilities REAL NOT NULL,
  net_worth REAL NOT NULL,
  breakdown_json TEXT
);

CREATE TABLE IF NOT EXISTS sync_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TEXT DEFAULT (datetime('now')),
  source TEXT NOT NULL,
  status TEXT NOT NULL,
  records_added INTEGER DEFAULT 0,
  error_message TEXT,
  duration_ms INTEGER
);
