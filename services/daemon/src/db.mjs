import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const require = createRequire(import.meta.url);

/**
 * Dynamically resolves SQLite driver:
 * 1. 'better-sqlite3' for maximum cross-version stability (Node 18, 20, 22, 24)
 * 2. Native built-in 'node:sqlite' on Node 22.5+ and Node 24+ when no npm packages are installed
 */
let DatabaseSync;
try {
  DatabaseSync = require("better-sqlite3");
} catch {
  try {
    DatabaseSync = require("node:sqlite").DatabaseSync;
  } catch {
    throw new Error(
      "No SQLite driver available. Please run 'npm install' in services/daemon or use Node.js 22.5+."
    );
  }
}

const DEFAULT_DB_PATH = process.env.GLITCH_DB_PATH || path.resolve(process.cwd(), "data", "glitch.db");

/**
 * Hash a password using PBKDF2 with a random salt.
 */
export function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

/**
 * Verify a plain text password against a stored salt:hash string.
 */
export function verifyPassword(password, stored) {
  if (!stored) return false;
  // Also allow plain match for development fallback if needed
  if (!stored.includes(":")) {
    return password === stored;
  }
  const [salt, originalHash] = stored.split(":");
  const testHash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  return crypto.timingSafeEqual(Buffer.from(originalHash, "hex"), Buffer.from(testHash, "hex"));
}

/**
 * Initialize SQLite database connection and run schema migrations.
 */
export function initDatabase(dbPath = DEFAULT_DB_PATH) {
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const db = new DatabaseSync(dbPath);

  // Enable WAL mode and foreign keys for high-performance concurrent local access
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA foreign_keys = ON;");

  // Create tables
  db.exec(`
    -- Metadata table
    CREATE TABLE IF NOT EXISTS db_meta (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Operators & Users
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'operator',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Active Sessions / Tokens
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      username TEXT NOT NULL,
      role TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- DevOps Incidents
    CREATE TABLE IF NOT EXISTS incidents (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      severity TEXT NOT NULL, -- critical, warning, info
      service TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      status TEXT DEFAULT 'active', -- active, investigating, resolved
      suggested_action TEXT,
      command TEXT,
      impact TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      resolved_at TEXT
    );

    -- Monitored System Services
    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      category TEXT NOT NULL, -- proxy, database, worker, api, cache, container
      status TEXT DEFAULT 'running', -- running, degraded, stopped
      cpu REAL DEFAULT 0.0,
      memory TEXT DEFAULT '0 MB',
      uptime TEXT,
      port TEXT,
      version TEXT,
      logs_json TEXT, -- JSON array of strings
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- CI/CD Pipelines
    CREATE TABLE IF NOT EXISTS pipelines (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      branch TEXT NOT NULL,
      commit_hash TEXT NOT NULL,
      author TEXT NOT NULL,
      status TEXT NOT NULL, -- success, running, failed
      duration TEXT,
      timestamp TEXT,
      stages_json TEXT, -- JSON array of pipeline stages
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Copilot Chat History
    CREATE TABLE IF NOT EXISTS copilot_chats (
      id TEXT PRIMARY KEY,
      sender TEXT NOT NULL, -- user, glitch
      text TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      action_id TEXT,
      action_title TEXT,
      action_command TEXT,
      action_executed INTEGER DEFAULT 0,
      tags_json TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Telemetry Metrics History
    CREATE TABLE IF NOT EXISTS metrics_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hostname TEXT,
      platform TEXT,
      uptime_seconds REAL,
      cpu_percent REAL,
      memory_used_percent REAL,
      memory_used_bytes INTEGER,
      memory_total_bytes INTEGER,
      disk_used_percent REAL,
      disk_used_bytes INTEGER,
      disk_total_bytes INTEGER,
      load_1m REAL,
      load_5m REAL,
      load_15m REAL,
      recorded_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Record metadata
  const pkgVersion = process.env.GLITCH_VERSION || (() => {
    try {
      const p = path.resolve(process.cwd(), "package.json");
      return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf-8")).version : "0.1.0";
    } catch {
      return "0.1.0";
    }
  })();

  const insertMeta = db.prepare("INSERT OR REPLACE INTO db_meta (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)");
  insertMeta.run("version", pkgVersion);
  insertMeta.run("engine", "SQLite");
  insertMeta.run("db_path", dbPath);

  // Seed default operators if users table is empty
  seedDefaults(db);

  return { db, dbPath };
}

/**
 * Seed initial users, incidents, services, and pipelines if tables are empty.
 */
function seedDefaults(db) {
  // 1. Users
  const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get().count;
  if (userCount === 0) {
    const insertUser = db.prepare("INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)");
    insertUser.run("admin", hashPassword("admin"), "admin");
    insertUser.run("operator", hashPassword("glitch"), "operator");
  }

  // 2. Incidents
  const incidentCount = db.prepare("SELECT COUNT(*) as count FROM incidents").get().count;
  if (incidentCount === 0) {
    const insertIncident = db.prepare(`
      INSERT INTO incidents (id, title, description, severity, service, timestamp, status, suggested_action, command, impact)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertIncident.run(
      "INC-308",
      "Celery Worker Memory Leak & OOM Risk",
      "worker-pool-2 resident memory escalated past 1.4 GB threshold following asynchronous batch indexing.",
      "critical",
      "celery-worker-cluster",
      "6m ago",
      "active",
      "Gracefully rolling restart worker-pool-2 and enforce max-tasks-per-child=1000",
      "glitch remediate worker-pool-2 --graceful --recycle-workers",
      "Job processing latency degraded by +420ms"
    );

    insertIncident.run(
      "INC-307",
      "Docker Disk Space Warning (>82%)",
      "Dangling build cache and unused container layers occupying 22.4 GB in /var/lib/docker.",
      "warning",
      "docker-daemon",
      "24m ago",
      "active",
      "Prune dangling images and expired buildkit cache",
      "docker system prune --volumes -f",
      "Root volume I/O throttling imminent"
    );

    insertIncident.run(
      "INC-305",
      "SSL Certificate Expiring in 5 Days",
      "TLS wildcard cert for *.glitch.internal expires on Nov 3, 2026.",
      "info",
      "ingress-nginx",
      "2h ago",
      "active",
      "Trigger automated certbot renew sequence via Let's Encrypt DNS-01",
      "glitch certs renew *.glitch.internal --provider cloudflare",
      "No current outage; proactive maintenance"
    );
  }

  // 3. Services
  const serviceCount = db.prepare("SELECT COUNT(*) as count FROM services").get().count;
  if (serviceCount === 0) {
    const insertService = db.prepare(`
      INSERT INTO services (id, name, category, status, cpu, memory, uptime, port, version, logs_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertService.run(
      "srv-1",
      "ingress-nginx",
      "proxy",
      "running",
      4.2,
      "184 MB",
      "14d 6h",
      "443 / 80",
      "v1.9.4-alpine",
      JSON.stringify([
        "[INFO] 192.168.1.45 GET /api/v1/health 200 4ms",
        "[INFO] TLS handshake successful for worker-02",
        "[INFO] Reloaded configuration from dynamic upstream map",
      ])
    );

    insertService.run(
      "srv-2",
      "postgresql-primary",
      "database",
      "running",
      11.8,
      "1.2 GB",
      "28d 11h",
      "5432",
      "16.2-bullseye",
      JSON.stringify([
        "[LOG] checkpoint starting: time",
        "[LOG] checkpoint complete: wrote 412 buffers (2.5%); 0 WAL file(s) added",
        "[LOG] autovacuum: vacuumed table 'telemetry_events'",
      ])
    );

    insertService.run(
      "srv-3",
      "celery-worker-cluster",
      "worker",
      "degraded",
      84.6,
      "1.42 GB",
      "4d 18h",
      "internal",
      "v5.3.6",
      JSON.stringify([
        "[WARNING] Worker-pool-2 resident memory 1,420 MB > threshold 1,024 MB",
        "[CRITICAL] task_sync_github_repos taking 14.8s (SLO 2.0s exceeded)",
        "[ALERT] High memory pressure detected on worker pid 4192",
      ])
    );

    insertService.run(
      "srv-4",
      "redis-cache",
      "cache",
      "running",
      2.1,
      "340 MB",
      "32d 4h",
      "6379",
      "7.2.4-alpine",
      JSON.stringify([
        "* 10000 changes in 60 seconds. Saving...",
        "* Background saving started by pid 3241",
        "* DB saved on disk",
      ])
    );

    insertService.run(
      "srv-5",
      "api-gateway",
      "api",
      "running",
      8.4,
      "412 MB",
      "14d 6h",
      "8080",
      "v2.1.0-distroless",
      JSON.stringify([
        "2026-10-30 02:00:12 [INFO] HTTP 200 /api/v1/telemetry 1.2ms",
        "2026-10-30 02:00:15 [INFO] Token refreshed for sub:admin",
        "2026-10-30 02:00:19 [INFO] Upstream health probe nominal (3/3 healthy)",
      ])
    );

    insertService.run(
      "srv-6",
      "docker-daemon",
      "container",
      "running",
      8.9,
      "512 MB",
      "8d 2h",
      "unix:///sock",
      "26.1.1",
      JSON.stringify([
        "time='2026-10-30T01:50:00Z' level=info msg='shim disconnected'",
        "time='2026-10-30T01:52:00Z' level=warning msg='disk space warning on /var/lib/docker: 82% used'",
        "time='2026-10-30T01:55:00Z' level=info msg='container started 94f8a3c2'",
      ])
    );
  }

  // 4. Pipelines
  const pipelineCount = db.prepare("SELECT COUNT(*) as count FROM pipelines").get().count;
  if (pipelineCount === 0) {
    const insertPipeline = db.prepare(`
      INSERT INTO pipelines (id, name, branch, commit_hash, author, status, duration, timestamp, stages_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertPipeline.run(
      "pip-1",
      "deploy-prod-eu",
      "main",
      "8f3c2a1",
      "tushar@glitch.internal",
      "success",
      "4m 12s",
      "12m ago",
      JSON.stringify([
        { name: "Lint & Static Analysis", status: "success", duration: "32s" },
        { name: "Unit & Integration Tests", status: "success", duration: "1m 45s" },
        { name: "Docker Multi-Arch Build", status: "success", duration: "1m 15s" },
        { name: "Canary Rollout (10%)", status: "success", duration: "40s" },
      ])
    );

    insertPipeline.run(
      "pip-2",
      "api-integration-tests",
      "feature/db-sqlite-local",
      "3d9a04b",
      "devops-bot",
      "running",
      "1m 45s",
      "in progress",
      JSON.stringify([
        { name: "Database Migrations", status: "success", duration: "18s" },
        { name: "Schema Validation", status: "success", duration: "24s" },
        { name: "End-to-End Test Suite", status: "running", duration: "1m 03s" },
        { name: "Artifact Publishing", status: "pending", duration: "-" },
      ])
    );

    insertPipeline.run(
      "pip-3",
      "security-container-scan",
      "main",
      "8f3c2a1",
      "security-bot",
      "success",
      "2m 04s",
      "1h ago",
      JSON.stringify([
        { name: "Trivy Vulnerability Scan", status: "success", duration: "45s" },
        { name: "SBOM Generation", status: "success", duration: "30s" },
        { name: "Cosign Signature Verify", status: "success", duration: "49s" },
      ])
    );
  }

  // 5. Initial Copilot chat messages
  const chatCount = db.prepare("SELECT COUNT(*) as count FROM copilot_chats").get().count;
  if (chatCount === 0) {
    const insertChat = db.prepare(`
      INSERT INTO copilot_chats (id, sender, text, timestamp, action_id, action_title, action_command, action_executed, tags_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertChat.run(
      "msg-1",
      "glitch",
      "⚡ **Glitch Local SRE Engine initialized.**\nConnected to host via local SQLite database.\n\nI have scanned your local services and detected **1 Critical incident** requiring immediate attention:\n• `celery-worker-cluster`: Memory leak (1.42 GB) with OOM kill hazard.\n\nReady to remediate on your authorization.",
      "10:14 AM",
      "fix-celery",
      "Execute Graceful Worker Recycle",
      "glitch remediate worker-pool-2 --graceful --recycle-workers",
      0,
      JSON.stringify(["Root Cause Found", "Playbook Ready"])
    );
  }
}

