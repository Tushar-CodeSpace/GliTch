# Local SQLite Database Guide 🗄️

GliTch uses a local-first embedded SQLite 3 database for all credentials, host telemetry, incident management, and copilot history. No cloud servers, external credentials, or third-party databases are required.

---

## 1. Database Configuration & Location

* **Path**: `data/glitch.db`
* **Journal Mode**: `WAL` (Write-Ahead Logging) for high-performance concurrent readers and writers.
* **Integrity Constraints**: `PRAGMA foreign_keys = ON;`
* **Sync Mode**: `PRAGMA synchronous = NORMAL;`

---

## 2. Table Schemas

### `users`
Local DevOps operator accounts and PBKDF2 hashed credentials.
```sql
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'operator',
  created_at TEXT NOT NULL
);
```

### `sessions`
Active bearer authentication tokens and session lifecycles.
```sql
CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### `incidents`
SRE alerts, system warnings, and remediation statuses.
```sql
CREATE TABLE IF NOT EXISTS incidents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  service TEXT NOT NULL,
  severity TEXT NOT NULL CHECK(severity IN ('critical', 'warning', 'advisory')),
  status TEXT NOT NULL DEFAULT 'investigating' CHECK(status IN ('investigating', 'mitigating', 'resolved')),
  description TEXT,
  playbook_command TEXT,
  created_at TEXT NOT NULL,
  resolved_at TEXT
);
```

### `services`
Docker container and host system service states.
```sql
CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL DEFAULT 'container',
  status TEXT NOT NULL DEFAULT 'running',
  cpu_percent REAL DEFAULT 0.0,
  memory_mb REAL DEFAULT 0.0,
  restarts INTEGER DEFAULT 0,
  last_restart TEXT,
  updated_at TEXT NOT NULL
);
```

### `pipelines`
CI/CD deployment runs and stage results.
```sql
CREATE TABLE IF NOT EXISTS pipelines (
  id TEXT PRIMARY KEY,
  pipeline_name TEXT NOT NULL,
  branch TEXT NOT NULL,
  commit_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'running',
  stage TEXT NOT NULL,
  duration_seconds INTEGER DEFAULT 0,
  created_at TEXT NOT NULL
);
```

### `copilot_chats`
Conversation logs and executed remediation playbooks.
```sql
CREATE TABLE IF NOT EXISTS copilot_chats (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  playbook_executed TEXT,
  timestamp TEXT NOT NULL
);
```

### `metrics_history`
Time-series host telemetry (CPU, RAM, Disk, Load Average).
```sql
CREATE TABLE IF NOT EXISTS metrics_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cpu_percent REAL NOT NULL,
  memory_percent REAL NOT NULL,
  disk_percent REAL NOT NULL,
  timestamp TEXT NOT NULL
);
```

### `db_meta`
Schema migration and database health records.
```sql
CREATE TABLE IF NOT EXISTS db_meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

---

## 3. Default Operator Accounts

Upon initial startup, the database auto-seeds default credentials:

| Username | Password | Role |
| :--- | :--- | :--- |
| `admin` | `admin` | Administrator |
| `operator` | `glitch` | Operator |

> **Security Note**: All passwords are encrypted with PBKDF2 (100,000 iterations, SHA-512) with unique random salt values and verified via constant-time comparison (`crypto.timingSafeEqual`).

---

## 4. Querying & Inspecting the Database

### Health & Integrity Inspection
```bash
# Run CLI status tool
npm run db:status

# Or query HTTP endpoint directly:
curl http://127.0.0.1:4780/api/db/status
```

### Direct CLI Access
You can inspect the database directly using the SQLite CLI:
```bash
sqlite3 data/glitch.db "SELECT * FROM incidents;"
```
