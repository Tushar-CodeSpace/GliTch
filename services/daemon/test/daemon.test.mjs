import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { initDatabase, hashPassword, verifyPassword } from "../src/db.mjs";
import { createServer } from "../src/server.mjs";
import { collectDeviceMetrics } from "../src/system.mjs";
import { determineBumpType, calculateNextVersion } from "../../../scripts/version.mjs";

const TEST_DB_PATH = path.resolve(process.cwd(), "data", "test_glitch.db");
const TEST_PORT = 4789;
let serverInstance;
let testDb;

describe("SQLite Database Layer", () => {
  before(() => {
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }
    const { db } = initDatabase(TEST_DB_PATH);
    testDb = db;
  });

  after(() => {
    if (testDb) {
      testDb.close();
    }
    for (const ext of ["", "-wal", "-shm"]) {
      const p = TEST_DB_PATH + ext;
      if (fs.existsSync(p)) fs.unlinkSync(p);
    }
  });

  test("Database initialized in WAL mode and foreign keys enabled", () => {
    const journalMode = testDb.prepare("PRAGMA journal_mode").get().journal_mode;
    assert.equal(journalMode.toLowerCase(), "wal");

    const foreignKeys = testDb.prepare("PRAGMA foreign_keys").get().foreign_keys;
    assert.equal(foreignKeys, 1);
  });

  test("All required tables are created", () => {
    const tables = testDb.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'").all();
    const tableNames = tables.map((t) => t.name);
    
    const required = ["db_meta", "users", "sessions", "incidents", "services", "pipelines", "copilot_chats", "metrics_history"];
    for (const req of required) {
      assert.ok(tableNames.includes(req), `Missing table: ${req}`);
    }
  });

  test("Password hashing and timing-safe verification", () => {
    const rawPass = "super_secure_devops_pass_123";
    const hashed = hashPassword(rawPass);
    assert.ok(hashed.includes(":"), "Hash must contain salt:hash delimiter");

    assert.equal(verifyPassword(rawPass, hashed), true);
    assert.equal(verifyPassword("wrong_password", hashed), false);
  });

  test("Default operator accounts are seeded", () => {
    const admin = testDb.prepare("SELECT * FROM users WHERE username = 'admin'").get();
    assert.ok(admin, "admin user should exist");
    assert.equal(admin.role, "admin");
    assert.equal(verifyPassword("admin", admin.password_hash), true);

    const operator = testDb.prepare("SELECT * FROM users WHERE username = 'operator'").get();
    assert.ok(operator, "operator user should exist");
    assert.equal(operator.role, "operator");
    assert.equal(verifyPassword("glitch", operator.password_hash), true);
  });

  test("Incidents seeded and resolvable", () => {
    const incidents = testDb.prepare("SELECT * FROM incidents").all();
    assert.ok(incidents.length >= 3, "At least 3 initial incidents seeded");

    const resolveStmt = testDb.prepare("UPDATE incidents SET status = 'resolved' WHERE id = 'INC-307'");
    resolveStmt.run();

    const updated = testDb.prepare("SELECT status FROM incidents WHERE id = 'INC-307'").get();
    assert.equal(updated.status, "resolved");
  });
});

describe("System Telemetry Collector", () => {
  test("collectDeviceMetrics returns expected host telemetry format", () => {
    const metrics = collectDeviceMetrics();
    assert.ok(metrics.hostname, "Hostname must be present");
    assert.ok(metrics.platform, "Platform must be present");
    assert.equal(typeof metrics.uptime_seconds, "number");
    assert.equal(typeof metrics.cpu_percent, "number");
    assert.equal(typeof metrics.memory.used_percent, "number");
    assert.equal(typeof metrics.disk.used_percent, "number");
    assert.equal(Array.isArray(metrics.load_average), true);
    assert.equal(metrics.db, "sqlite");
  });
});

describe("REST API Endpoints", () => {
  before(async () => {
    const { db } = initDatabase(TEST_DB_PATH);
    testDb = db;
    serverInstance = createServer(db, TEST_DB_PATH);
    await new Promise((res) => serverInstance.listen(TEST_PORT, "127.0.0.1", res));
  });

  after(async () => {
    await new Promise((res) => serverInstance.close(res));
    if (testDb) testDb.close();
    for (const ext of ["", "-wal", "-shm"]) {
      const p = TEST_DB_PATH + ext;
      if (fs.existsSync(p)) fs.unlinkSync(p);
    }
  });

  test("GET /api/health returns 200 OK with sqlite engine", async () => {
    const res = await fetch(`http://127.0.0.1:${TEST_PORT}/api/health`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, "ok");
    assert.equal(data.db, "sqlite");
    assert.equal(data.mode, "local");
  });

  test("GET /api/db/status returns table stats and integrity check", async () => {
    const res = await fetch(`http://127.0.0.1:${TEST_PORT}/api/db/status`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.engine, "SQLite 3");
    assert.equal(data.integrity_check, "ok");
    assert.ok(data.tables.length >= 8);
  });

  test("POST /api/auth/login rejects invalid credentials with 401", async () => {
    const res = await fetch(`http://127.0.0.1:${TEST_PORT}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "admin", password: "bad_password" }),
    });
    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.success, false);
  });

  test("POST /api/auth/login authenticates valid operator and issues token", async () => {
    const res = await fetch(`http://127.0.0.1:${TEST_PORT}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "admin", password: "admin" }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.token, "Must return session token");
    assert.equal(data.user.username, "admin");
    assert.equal(data.user.role, "admin");
  });

  test("GET /api/incidents and POST /api/incidents/:id/resolve", async () => {
    const getRes = await fetch(`http://127.0.0.1:${TEST_PORT}/api/incidents`);
    assert.equal(getRes.status, 200);
    const incidents = await getRes.json();
    assert.ok(Array.isArray(incidents));

    const target = incidents[0];
    const resolveRes = await fetch(`http://127.0.0.1:${TEST_PORT}/api/incidents/${target.id}/resolve`, {
      method: "POST",
    });
    assert.equal(resolveRes.status, 200);
    const resolveData = await resolveRes.json();
    assert.equal(resolveData.status, "resolved");
  });

  test("POST /api/copilot/chats persists conversation to SQLite", async () => {
    const newMsg = {
      id: "test-msg-1",
      sender: "user",
      text: "glitch status check",
      timestamp: "12:00 PM",
    };
    const postRes = await fetch(`http://127.0.0.1:${TEST_PORT}/api/copilot/chats`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newMsg),
    });
    assert.equal(postRes.status, 201);

    const getRes = await fetch(`http://127.0.0.1:${TEST_PORT}/api/copilot/chats`);
    const chats = await getRes.json();
    assert.ok(chats.some((c) => c.id === "test-msg-1"));
  });
});

describe("Branch-based SemVer Engine", () => {
  test("fix/ branches trigger PATCH bump (0.1.0 -> 0.1.1)", () => {
    assert.equal(determineBumpType("fix/login-contrast"), "patch");
    assert.equal(determineBumpType("bugfix/sqlite-wal"), "patch");
    assert.equal(determineBumpType("patch/celery-oom"), "patch");
    assert.equal(calculateNextVersion("0.1.0", "fix/login-contrast"), "0.1.1");
    assert.equal(calculateNextVersion("1.4.9", "fix/docker-prune"), "1.4.10");
  });

  test("feature/ branches trigger MINOR bump (0.1.0 -> 0.2.0)", () => {
    assert.equal(determineBumpType("feature/ai-copilot"), "minor");
    assert.equal(determineBumpType("feat/systemd-service"), "minor");
    assert.equal(calculateNextVersion("0.1.0", "feature/ai-copilot"), "0.2.0");
    assert.equal(calculateNextVersion("0.3.5", "feature/auth-biometric"), "0.4.0");
  });

  test("major/ branches trigger MAJOR bump (0.1.0 -> 1.0.0)", () => {
    assert.equal(determineBumpType("major/v2-redesign"), "major");
    assert.equal(determineBumpType("breaking/protocol-v3"), "major");
    assert.equal(calculateNextVersion("0.1.0", "major/v2-redesign"), "1.0.0");
    assert.equal(calculateNextVersion("1.2.3", "major/kernel-v2"), "2.0.0");
  });

  test("main / tracking branches preserve version", () => {
    assert.equal(determineBumpType("main"), null);
    assert.equal(determineBumpType("master"), null);
    assert.equal(calculateNextVersion("0.1.0", "main"), "0.1.0");
  });
});

