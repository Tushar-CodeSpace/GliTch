package db

import (
	"database/sql"
	"encoding/json"
	"fmt"
)

// SeedDefaults populates default users, incidents, services, pipelines, and chats if tables are empty.
func SeedDefaults(db *sql.DB) error {
	// 1. Users
	var userCount int
	if err := db.QueryRow("SELECT COUNT(*) FROM users").Scan(&userCount); err != nil {
		return fmt.Errorf("error checking users count: %w", err)
	}
	if userCount == 0 {
		stmt, err := db.Prepare("INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)")
		if err != nil {
			return err
		}
		defer stmt.Close()

		if _, err := stmt.Exec("admin", HashPassword("admin"), "admin"); err != nil {
			return err
		}
		if _, err := stmt.Exec("operator", HashPassword("glitch"), "operator"); err != nil {
			return err
		}
	}

	// 2. Incidents
	var incidentCount int
	if err := db.QueryRow("SELECT COUNT(*) FROM incidents").Scan(&incidentCount); err != nil {
		return fmt.Errorf("error checking incidents count: %w", err)
	}
	if incidentCount == 0 {
		stmt, err := db.Prepare(`
			INSERT INTO incidents (id, title, description, severity, service, timestamp, status, suggested_action, command, impact)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		`)
		if err != nil {
			return err
		}
		defer stmt.Close()

		_, _ = stmt.Exec(
			"INC-308",
			"Celery Worker Memory Leak & OOM Risk",
			"worker-pool-2 resident memory escalated past 1.4 GB threshold following asynchronous batch indexing.",
			"critical",
			"celery-worker-cluster",
			"6m ago",
			"active",
			"Gracefully rolling restart worker-pool-2 and enforce max-tasks-per-child=1000",
			"glitch remediate worker-pool-2 --graceful --recycle-workers",
			"Job processing latency degraded by +420ms",
		)

		_, _ = stmt.Exec(
			"INC-307",
			"Docker Disk Space Warning (>82%)",
			"Dangling build cache and unused container layers occupying 22.4 GB in /var/lib/docker.",
			"warning",
			"docker-daemon",
			"24m ago",
			"active",
			"Prune dangling images and expired buildkit cache",
			"docker system prune --volumes -f",
			"Root volume I/O throttling imminent",
		)

		_, _ = stmt.Exec(
			"INC-305",
			"SSL Certificate Expiring in 5 Days",
			"TLS wildcard cert for *.glitch.internal expires on Nov 3, 2026.",
			"info",
			"ingress-nginx",
			"2h ago",
			"active",
			"Trigger automated certbot renew sequence via Let's Encrypt DNS-01",
			"glitch certs renew *.glitch.internal --provider cloudflare",
			"No current outage; proactive maintenance",
		)
	}

	// 3. Services
	var serviceCount int
	if err := db.QueryRow("SELECT COUNT(*) FROM services").Scan(&serviceCount); err != nil {
		return fmt.Errorf("error checking services count: %w", err)
	}
	if serviceCount == 0 {
		stmt, err := db.Prepare(`
			INSERT INTO services (id, name, category, status, cpu, memory, uptime, port, version, logs_json)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		`)
		if err != nil {
			return err
		}
		defer stmt.Close()

		logs1, _ := json.Marshal([]string{
			"[INFO] 192.168.1.45 GET /api/v1/health 200 4ms",
			"[INFO] TLS handshake successful for worker-02",
			"[INFO] Reloaded configuration from dynamic upstream map",
		})
		_, _ = stmt.Exec("srv-1", "ingress-nginx", "proxy", "running", 4.2, "184 MB", "14d 6h", "443 / 80", "v1.9.4-alpine", string(logs1))

		logs2, _ := json.Marshal([]string{
			"[LOG] checkpoint starting: time",
			"[LOG] checkpoint complete: wrote 412 buffers (2.5%); 0 WAL file(s) added",
			"[LOG] autovacuum: vacuumed table 'telemetry_events'",
		})
		_, _ = stmt.Exec("srv-2", "postgresql-primary", "database", "running", 11.8, "1.2 GB", "28d 11h", "5432", "16.2-bullseye", string(logs2))

		logs3, _ := json.Marshal([]string{
			"[WARNING] Worker-pool-2 resident memory 1,420 MB > threshold 1,024 MB",
			"[CRITICAL] task_sync_github_repos taking 14.8s (SLO 2.0s exceeded)",
			"[ALERT] High memory pressure detected on worker pid 4192",
		})
		_, _ = stmt.Exec("srv-3", "celery-worker-cluster", "worker", "degraded", 84.6, "1.42 GB", "4d 18h", "internal", "v5.3.6", string(logs3))

		logs4, _ := json.Marshal([]string{
			"* 10000 changes in 60 seconds. Saving...",
			"* Background saving started by pid 3241",
			"* DB saved on disk",
		})
		_, _ = stmt.Exec("srv-4", "redis-cache", "cache", "running", 2.1, "340 MB", "32d 4h", "6379", "7.2.4-alpine", string(logs4))

		logs5, _ := json.Marshal([]string{
			"2026-10-30 02:00:12 [INFO] HTTP 200 /api/v1/telemetry 1.2ms",
			"2026-10-30 02:00:15 [INFO] Token refreshed for sub:admin",
			"2026-10-30 02:00:19 [INFO] Upstream health probe nominal (3/3 healthy)",
		})
		_, _ = stmt.Exec("srv-5", "api-gateway", "api", "running", 8.4, "412 MB", "14d 6h", "8080", "v2.1.0-distroless", string(logs5))

		logs6, _ := json.Marshal([]string{
			"time='2026-10-30T01:50:00Z' level=info msg='shim disconnected'",
			"time='2026-10-30T01:52:00Z' level=warning msg='disk space warning on /var/lib/docker: 82% used'",
			"time='2026-10-30T01:55:00Z' level=info msg='container started 94f8a3c2'",
		})
		_, _ = stmt.Exec("srv-6", "docker-daemon", "container", "running", 8.9, "512 MB", "8d 2h", "unix:///sock", "26.1.1", string(logs6))
	}

	// 4. Pipelines
	var pipelineCount int
	if err := db.QueryRow("SELECT COUNT(*) FROM pipelines").Scan(&pipelineCount); err != nil {
		return fmt.Errorf("error checking pipelines count: %w", err)
	}
	if pipelineCount == 0 {
		stmt, err := db.Prepare(`
			INSERT INTO pipelines (id, name, branch, commit_hash, author, status, duration, timestamp, stages_json)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
		`)
		if err != nil {
			return err
		}
		defer stmt.Close()

		stages1, _ := json.Marshal([]map[string]string{
			{"name": "Lint & Static Analysis", "status": "success", "duration": "32s"},
			{"name": "Unit & Integration Tests", "status": "success", "duration": "1m 45s"},
			{"name": "Docker Multi-Arch Build", "status": "success", "duration": "1m 15s"},
			{"name": "Canary Rollout (10%)", "status": "success", "duration": "40s"},
		})
		_, _ = stmt.Exec("pip-1", "deploy-prod-eu", "main", "8f3c2a1", "tushar@glitch.internal", "success", "4m 12s", "12m ago", string(stages1))

		stages2, _ := json.Marshal([]map[string]string{
			{"name": "Database Migrations", "status": "success", "duration": "18s"},
			{"name": "Schema Validation", "status": "success", "duration": "24s"},
			{"name": "End-to-End Test Suite", "status": "running", "duration": "1m 03s"},
			{"name": "Artifact Publishing", "status": "pending", "duration": "-"},
		})
		_, _ = stmt.Exec("pip-2", "api-integration-tests", "feature/db-sqlite-local", "3d9a04b", "devops-bot", "running", "1m 45s", "in progress", string(stages2))

		stages3, _ := json.Marshal([]map[string]string{
			{"name": "Trivy Vulnerability Scan", "status": "success", "duration": "45s"},
			{"name": "SBOM Generation", "status": "success", "duration": "30s"},
			{"name": "Cosign Signature Verify", "status": "success", "duration": "49s"},
		})
		_, _ = stmt.Exec("pip-3", "security-container-scan", "main", "8f3c2a1", "security-bot", "success", "2m 04s", "1h ago", string(stages3))
	}

	// 5. Copilot Chat
	var chatCount int
	if err := db.QueryRow("SELECT COUNT(*) FROM copilot_chats").Scan(&chatCount); err != nil {
		return fmt.Errorf("error checking copilot_chats count: %w", err)
	}
	if chatCount == 0 {
		stmt, err := db.Prepare(`
			INSERT INTO copilot_chats (id, sender, text, timestamp, action_id, action_title, action_command, action_executed, tags_json)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
		`)
		if err != nil {
			return err
		}
		defer stmt.Close()

		tags, _ := json.Marshal([]string{"Root Cause Found", "Playbook Ready"})
		_, _ = stmt.Exec(
			"msg-1",
			"glitch",
			"⚡ **Glitch Local SRE Engine initialized.**\nConnected to host via local SQLite database.\n\nI have scanned your local services and detected **1 Critical incident** requiring immediate attention:\n• `celery-worker-cluster`: Memory leak (1.42 GB) with OOM kill hazard.\n\nReady to remediate on your authorization.",
			"10:14 AM",
			"fix-celery",
			"Execute Graceful Worker Recycle",
			"glitch remediate worker-pool-2 --graceful --recycle-workers",
			0,
			string(tags),
		)
	}

	return nil
}
