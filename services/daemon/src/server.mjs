import http from "node:http";
import crypto from "node:crypto";
import fs from "node:fs";
import { collectDeviceMetrics } from "./system.mjs";
import { hashPassword, verifyPassword } from "./db.mjs";

/**
 * Creates and returns the Node HTTP server.
 */
export function createServer(db, dbPath) {
  const server = http.createServer(async (req, res) => {
    // Enable CORS for web UI
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept");

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    const parsedUrl = new URL(req.url, `http://${req.headers.host || "127.0.0.1:4780"}`);
    const pathname = parsedUrl.pathname;

    try {
      // 1. Health check
      if (req.method === "GET" && pathname === "/api/health") {
        const metaVer = db.prepare("SELECT value FROM db_meta WHERE key = 'version'").get();
        const version = metaVer?.value || process.env.GLITCH_VERSION || "0.1.0";

        return sendJson(res, 200, {
          status: "ok",
          service: "glitch-local-daemon",
          mode: "local",
          db: "sqlite",
          db_path: dbPath,
          version,
          timestamp: new Date().toISOString(),
        });
      }

      // 2. Metrics endpoint
      if (req.method === "GET" && pathname === "/api/metrics") {
        const metrics = collectDeviceMetrics();

        // Asynchronously persist sample to SQLite history (non-blocking)
        try {
          const insertHistory = db.prepare(`
            INSERT INTO metrics_history (
              hostname, platform, uptime_seconds, cpu_percent,
              memory_used_percent, memory_used_bytes, memory_total_bytes,
              disk_used_percent, disk_used_bytes, disk_total_bytes,
              load_1m, load_5m, load_15m
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);
          insertHistory.run(
            metrics.hostname,
            metrics.platform,
            metrics.uptime_seconds,
            metrics.cpu_percent,
            metrics.memory.used_percent,
            metrics.memory.used_bytes,
            metrics.memory.total_bytes,
            metrics.disk.used_percent,
            metrics.disk.used_bytes,
            metrics.disk.total_bytes,
            metrics.load_average[0] || 0,
            metrics.load_average[1] || 0,
            metrics.load_average[2] || 0
          );
        } catch (e) {
          console.error("Failed to write metrics history to SQLite:", e.message);
        }

        return sendJson(res, 200, metrics);
      }

      // 3. Auth login endpoint
      if (req.method === "POST" && pathname === "/api/auth/login") {
        const body = await parseJsonBody(req);
        const { username, password } = body;

        if (!username || !password) {
          return sendJson(res, 400, {
            success: false,
            error: "Username and password are required.",
          });
        }

        const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username.trim());

        if (!user || !verifyPassword(password, user.password_hash)) {
          return sendJson(res, 401, {
            success: false,
            error: "Invalid credentials. Please verify your username and password.",
          });
        }

        // Generate session token
        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

        const insertSession = db.prepare(`
          INSERT INTO sessions (token, user_id, username, role, expires_at)
          VALUES (?, ?, ?, ?, ?)
        `);
        insertSession.run(token, user.id, user.username, user.role, expiresAt);

        return sendJson(res, 200, {
          success: true,
          token,
          user: {
            id: user.id,
            username: user.username,
            role: user.role,
          },
        });
      }

      // 4. Auth register endpoint
      if (req.method === "POST" && pathname === "/api/auth/register") {
        const body = await parseJsonBody(req);
        const { username, password, role = "operator" } = body;

        if (!username || !password) {
          return sendJson(res, 400, { success: false, error: "Username and password required." });
        }

        const existing = db.prepare("SELECT id FROM users WHERE username = ?").get(username.trim());
        if (existing) {
          return sendJson(res, 409, { success: false, error: "Username already exists." });
        }

        const hashed = hashPassword(password);
        const insert = db.prepare("INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)");
        const result = insert.run(username.trim(), hashed, role);

        return sendJson(res, 201, {
          success: true,
          user: { id: result.lastInsertRowid, username: username.trim(), role },
        });
      }

      // 5. Incidents endpoints
      if (req.method === "GET" && pathname === "/api/incidents") {
        const rows = db.prepare("SELECT * FROM incidents ORDER BY created_at DESC").all();
        const formatted = rows.map((row) => ({
          id: row.id,
          title: row.title,
          description: row.description,
          severity: row.severity,
          service: row.service,
          timestamp: row.timestamp,
          status: row.status,
          suggestedAction: row.suggested_action,
          command: row.command,
          impact: row.impact,
          resolvedAt: row.resolved_at,
        }));
        return sendJson(res, 200, formatted);
      }

      if (req.method === "POST" && pathname.startsWith("/api/incidents/") && pathname.endsWith("/resolve")) {
        const parts = pathname.split("/");
        const incidentId = parts[3];

        const update = db.prepare("UPDATE incidents SET status = 'resolved', resolved_at = CURRENT_TIMESTAMP WHERE id = ?");
        update.run(incidentId);

        return sendJson(res, 200, { success: true, incidentId, status: "resolved" });
      }

      // 6. Services endpoints
      if (req.method === "GET" && pathname === "/api/services") {
        const rows = db.prepare("SELECT * FROM services ORDER BY name ASC").all();
        const formatted = rows.map((row) => ({
          id: row.id,
          name: row.name,
          category: row.category,
          status: row.status,
          cpu: row.cpu,
          memory: row.memory,
          uptime: row.uptime,
          port: row.port,
          version: row.version,
          logs: JSON.parse(row.logs_json || "[]"),
        }));
        return sendJson(res, 200, formatted);
      }

      if (req.method === "POST" && pathname.startsWith("/api/services/") && pathname.endsWith("/restart")) {
        const parts = pathname.split("/");
        const serviceId = parts[3];

        const update = db.prepare("UPDATE services SET status = 'running', cpu = 5.0, updated_at = CURRENT_TIMESTAMP WHERE id = ? OR name = ?");
        update.run(serviceId, serviceId);

        return sendJson(res, 200, { success: true, serviceId, status: "running" });
      }

      // 7. Pipelines endpoints
      if (req.method === "GET" && pathname === "/api/pipelines") {
        const rows = db.prepare("SELECT * FROM pipelines ORDER BY updated_at DESC").all();
        const formatted = rows.map((row) => ({
          id: row.id,
          name: row.name,
          branch: row.branch,
          commit: row.commit_hash,
          author: row.author,
          status: row.status,
          duration: row.duration,
          timestamp: row.timestamp,
          stages: JSON.parse(row.stages_json || "[]"),
        }));
        return sendJson(res, 200, formatted);
      }

      // 8. Copilot chat history
      if (req.method === "GET" && pathname === "/api/copilot/chats") {
        const rows = db.prepare("SELECT * FROM copilot_chats ORDER BY created_at ASC").all();
        const formatted = rows.map((row) => ({
          id: row.id,
          sender: row.sender,
          text: row.text,
          timestamp: row.timestamp,
          actionId: row.action_id,
          actionTitle: row.action_title,
          actionCommand: row.action_command,
          actionExecuted: Boolean(row.action_executed),
          tags: JSON.parse(row.tags_json || "[]"),
        }));
        return sendJson(res, 200, formatted);
      }

      if (req.method === "POST" && pathname === "/api/copilot/chats") {
        const body = await parseJsonBody(req);
        const { id = "msg-" + Date.now(), sender, text, timestamp, actionId, actionTitle, actionCommand, actionExecuted = 0, tags = [] } = body;

        const insert = db.prepare(`
          INSERT INTO copilot_chats (id, sender, text, timestamp, action_id, action_title, action_command, action_executed, tags_json)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        insert.run(id, sender, text, timestamp, actionId || null, actionTitle || null, actionCommand || null, actionExecuted ? 1 : 0, JSON.stringify(tags));

        return sendJson(res, 201, { success: true, id });
      }

      // 9. SQLite Database status & inspection
      if (req.method === "GET" && pathname === "/api/db/status") {
        const stats = fs.existsSync(dbPath) ? fs.statSync(dbPath) : null;
        const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();
        
        const counts = {};
        for (const { name } of tables) {
          try {
            counts[name] = db.prepare(`SELECT COUNT(*) as count FROM "${name}"`).get().count;
          } catch {
            counts[name] = 0;
          }
        }

        const integrity = db.prepare("PRAGMA integrity_check").get();

        return sendJson(res, 200, {
          engine: "SQLite 3",
          database_path: dbPath,
          size_bytes: stats ? stats.size : 0,
          size_formatted: stats ? `${(stats.size / 1024).toFixed(1)} KB` : "0 KB",
          tables: tables.map((t) => t.name),
          counts,
          integrity_check: integrity?.integrity_check || "ok",
          wal_mode: true,
        });
      }

      // Fallback 404
      return sendJson(res, 404, {
        error: `Endpoint not found: ${req.method} ${pathname}`,
      });
    } catch (err) {
      console.error("API error:", err);
      return sendJson(res, 500, {
        error: "Internal Daemon Error",
        message: err.message,
      });
    }
  });

  return server;
}

function sendJson(res, statusCode, data) {
  const json = JSON.stringify(data);
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(json),
  });
  res.end(json);
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      // Protection against giant payloads
      if (body.length > 1e6) {
        req.destroy();
        reject(new Error("Payload too large"));
      }
    });
    req.on("end", () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

