package db

import (
	"database/sql"
	"fmt"
)

// SeedDefaults populates default administrative users if the users table is empty.
// No demo incidents, services, pipelines, or chats are seeded to ensure a clean console.
// It also cleans up legacy demo records from prior versions if present.
func SeedDefaults(db *sql.DB) error {
	// Purge legacy demo records from prior installations
	_, _ = db.Exec("DELETE FROM incidents WHERE id IN ('INC-308', 'INC-307', 'INC-305')")
	_, _ = db.Exec("DELETE FROM services WHERE id IN ('srv-1', 'srv-2', 'srv-3', 'srv-4', 'srv-5', 'srv-6') OR name IN ('ingress-nginx', 'postgresql-primary', 'celery-worker-cluster', 'redis-cache', 'api-gateway', 'docker-daemon')")
	_, _ = db.Exec("DELETE FROM pipelines WHERE id IN ('pip-1', 'pip-2', 'pip-3')")
	_, _ = db.Exec("DELETE FROM copilot_chats WHERE id = 'msg-1' OR text LIKE '%celery%'")

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

	return nil
}
