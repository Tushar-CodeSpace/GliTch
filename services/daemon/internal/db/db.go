package db

import (
	"database/sql"
	"fmt"
	"os"
	"path/filepath"

	_ "modernc.org/sqlite"
)

// InitDatabase initializes the SQLite database with WAL mode and runs schema migrations.
func InitDatabase(dbPath string) (*sql.DB, string, error) {
	if dbPath == "" {
		envPath := os.Getenv("GLITCH_DB_PATH")
		if envPath != "" {
			dbPath = envPath
		} else {
			cwd, _ := os.Getwd()
			dbPath = filepath.Join(cwd, "data", "glitch.db")
		}
	}

	dir := filepath.Dir(dbPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return nil, "", fmt.Errorf("failed to create db directory %s: %w", dir, err)
	}

	// Connect to SQLite
	db, err := sql.Open("sqlite", dbPath)
	if err != nil {
		return nil, "", fmt.Errorf("failed to open sqlite database: %w", err)
	}

	// In WAL mode, SQLite supports multiple concurrent readers and serialized writers.
	db.SetMaxOpenConns(10)
	db.SetMaxIdleConns(5)

	// Enable WAL mode, foreign keys, and busy timeout for high performance concurrent local access
	if _, err := db.Exec("PRAGMA journal_mode = WAL;"); err != nil {
		return nil, "", fmt.Errorf("failed to enable WAL mode: %w", err)
	}
	if _, err := db.Exec("PRAGMA foreign_keys = ON;"); err != nil {
		return nil, "", fmt.Errorf("failed to enable foreign keys: %w", err)
	}
	if _, err := db.Exec("PRAGMA busy_timeout = 5000;"); err != nil {
		return nil, "", fmt.Errorf("failed to set busy timeout: %w", err)
	}

	// Run table creation schemas
	schema := `
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
		severity TEXT NOT NULL,
		service TEXT NOT NULL,
		timestamp TEXT NOT NULL,
		status TEXT DEFAULT 'active',
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
		category TEXT NOT NULL,
		status TEXT DEFAULT 'running',
		cpu REAL DEFAULT 0.0,
		memory TEXT DEFAULT '0 MB',
		uptime TEXT,
		port TEXT,
		version TEXT,
		logs_json TEXT,
		updated_at TEXT DEFAULT CURRENT_TIMESTAMP
	);

	-- CI/CD Pipelines
	CREATE TABLE IF NOT EXISTS pipelines (
		id TEXT PRIMARY KEY,
		name TEXT NOT NULL,
		branch TEXT NOT NULL,
		commit_hash TEXT NOT NULL,
		author TEXT NOT NULL,
		status TEXT NOT NULL,
		duration TEXT,
		timestamp TEXT,
		stages_json TEXT,
		updated_at TEXT DEFAULT CURRENT_TIMESTAMP
	);

	-- Copilot Chat History
	CREATE TABLE IF NOT EXISTS copilot_chats (
		id TEXT PRIMARY KEY,
		sender TEXT NOT NULL,
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
		temperature_celsius REAL DEFAULT 0.0,
		memory_used_percent REAL,
		memory_used_bytes INTEGER,
		memory_total_bytes INTEGER,
		disk_used_percent REAL,
		disk_used_bytes INTEGER,
		disk_total_bytes INTEGER,
		disk_read_mb_per_sec REAL DEFAULT 0.0,
		disk_write_mb_per_sec REAL DEFAULT 0.0,
		net_rx_kb_per_sec REAL DEFAULT 0.0,
		net_tx_kb_per_sec REAL DEFAULT 0.0,
		process_count INTEGER DEFAULT 0,
		load_1m REAL,
		load_5m REAL,
		load_15m REAL,
		recorded_at TEXT DEFAULT CURRENT_TIMESTAMP
	);
	`
	if _, err := db.Exec(schema); err != nil {
		db.Close()
		return nil, "", fmt.Errorf("failed to execute database schema: %w", err)
	}

	// Schema migrations for metrics_history new columns (safe & idempotent)
	_, _ = db.Exec("ALTER TABLE metrics_history ADD COLUMN temperature_celsius REAL DEFAULT 0.0;")
	_, _ = db.Exec("ALTER TABLE metrics_history ADD COLUMN disk_read_mb_per_sec REAL DEFAULT 0.0;")
	_, _ = db.Exec("ALTER TABLE metrics_history ADD COLUMN disk_write_mb_per_sec REAL DEFAULT 0.0;")
	_, _ = db.Exec("ALTER TABLE metrics_history ADD COLUMN net_rx_kb_per_sec REAL DEFAULT 0.0;")
	_, _ = db.Exec("ALTER TABLE metrics_history ADD COLUMN net_tx_kb_per_sec REAL DEFAULT 0.0;")
	_, _ = db.Exec("ALTER TABLE metrics_history ADD COLUMN process_count INTEGER DEFAULT 0;")

	// Update metadata
	version := os.Getenv("GLITCH_VERSION")
	if version == "" {
		version = "0.1.0"
	}
	_, _ = db.Exec("INSERT OR REPLACE INTO db_meta (key, value, updated_at) VALUES ('version', ?, CURRENT_TIMESTAMP)", version)
	_, _ = db.Exec("INSERT OR REPLACE INTO db_meta (key, value, updated_at) VALUES ('engine', 'SQLite', CURRENT_TIMESTAMP)")
	_, _ = db.Exec("INSERT OR REPLACE INTO db_meta (key, value, updated_at) VALUES ('db_path', ?, CURRENT_TIMESTAMP)", dbPath)

	// Seed default records if tables are empty
	if err := SeedDefaults(db); err != nil {
		db.Close()
		return nil, "", fmt.Errorf("failed to seed defaults: %w", err)
	}

	return db, dbPath, nil
}
