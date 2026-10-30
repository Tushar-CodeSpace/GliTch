package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"

	"github.com/Tushar-CodeSpace/GliTch/services/daemon/internal/db"
	"github.com/Tushar-CodeSpace/GliTch/services/daemon/internal/server"
	"github.com/Tushar-CodeSpace/GliTch/services/daemon/internal/system"
)

func cleanupTestDB(basePath string) {
	for _, ext := range []string{"", "-wal", "-shm"} {
		_ = os.Remove(basePath + ext)
	}
}

func TestSQLiteDatabaseLayer(t *testing.T) {
	testDBPath := filepath.Join(os.TempDir(), fmt.Sprintf("glitch_test_layer_%d.db", os.Getpid()))
	cleanupTestDB(testDBPath)
	defer cleanupTestDB(testDBPath)

	database, resolvedPath, err := db.InitDatabase(testDBPath)
	if err != nil {
		t.Fatalf("InitDatabase failed: %v", err)
	}
	defer database.Close()

	// 1. WAL mode
	var journalMode string
	if err := database.QueryRow("PRAGMA journal_mode;").Scan(&journalMode); err != nil {
		t.Fatalf("failed to query journal_mode: %v", err)
	}
	if journalMode != "wal" {
		t.Errorf("expected journal_mode 'wal', got '%s'", journalMode)
	}

	// 2. Foreign keys
	var foreignKeys int
	if err := database.QueryRow("PRAGMA foreign_keys;").Scan(&foreignKeys); err != nil {
		t.Fatalf("failed to query foreign_keys: %v", err)
	}
	if foreignKeys != 1 {
		t.Errorf("expected foreign_keys 1, got %d", foreignKeys)
	}

	// 3. Required tables
	requiredTables := []string{
		"db_meta", "users", "sessions", "incidents", "services",
		"pipelines", "copilot_chats", "metrics_history",
	}
	for _, table := range requiredTables {
		var exists int
		err := database.QueryRow(
			"SELECT COUNT(*) FROM sqlite_master WHERE type = 'table' AND name = ?",
			table,
		).Scan(&exists)
		if err != nil || exists != 1 {
			t.Errorf("missing required table: %s", table)
		}
	}

	// 4. Password hashing
	rawPass := "super_secure_devops_pass_123"
	hashed := db.HashPassword(rawPass)
	if !db.VerifyPassword(rawPass, hashed) {
		t.Errorf("password verification failed for valid password")
	}
	if db.VerifyPassword("wrong_password", hashed) {
		t.Errorf("password verification unexpectedly succeeded for wrong password")
	}

	// 5. Default seeded users
	var adminRole, adminHash string
	err = database.QueryRow("SELECT role, password_hash FROM users WHERE username = 'admin'").Scan(&adminRole, &adminHash)
	if err != nil {
		t.Fatalf("admin user not found: %v", err)
	}
	if adminRole != "admin" {
		t.Errorf("expected admin role 'admin', got '%s'", adminRole)
	}
	if !db.VerifyPassword("admin", adminHash) {
		t.Errorf("failed to verify default admin password")
	}

	var opRole, opHash string
	err = database.QueryRow("SELECT role, password_hash FROM users WHERE username = 'operator'").Scan(&opRole, &opHash)
	if err != nil {
		t.Fatalf("operator user not found: %v", err)
	}
	if opRole != "operator" {
		t.Errorf("expected operator role 'operator', got '%s'", opRole)
	}
	if !db.VerifyPassword("glitch", opHash) {
		t.Errorf("failed to verify default operator password")
	}

	// 6. Incidents seeded & resolvable
	var incidentCount int
	if err := database.QueryRow("SELECT COUNT(*) FROM incidents").Scan(&incidentCount); err != nil {
		t.Fatalf("failed to query incidents count: %v", err)
	}
	if incidentCount < 3 {
		t.Errorf("expected at least 3 seeded incidents, got %d", incidentCount)
	}

	_, err = database.Exec("UPDATE incidents SET status = 'resolved' WHERE id = 'INC-307'")
	if err != nil {
		t.Fatalf("failed to resolve incident: %v", err)
	}
	var incStatus string
	_ = database.QueryRow("SELECT status FROM incidents WHERE id = 'INC-307'").Scan(&incStatus)
	if incStatus != "resolved" {
		t.Errorf("expected incident status 'resolved', got '%s'", incStatus)
	}

	_ = resolvedPath
}

func TestSystemTelemetryCollector(t *testing.T) {
	metrics := system.CollectDeviceMetrics()

	if metrics.Hostname == "" {
		t.Errorf("expected non-empty hostname")
	}
	if metrics.Platform == "" {
		t.Errorf("expected non-empty platform")
	}
	if metrics.UptimeSeconds <= 0 {
		t.Errorf("expected positive uptime, got %d", metrics.UptimeSeconds)
	}
	if metrics.Memory.TotalBytes <= 0 {
		t.Errorf("expected positive total memory bytes")
	}
	if metrics.Disk.TotalBytes <= 0 {
		t.Errorf("expected positive total disk bytes")
	}
	if len(metrics.LoadAverage) != 3 {
		t.Errorf("expected 3 load average values, got %d", len(metrics.LoadAverage))
	}
	if metrics.DB != "sqlite" {
		t.Errorf("expected db engine 'sqlite', got '%s'", metrics.DB)
	}
}

func TestRESTAPIEndpoints(t *testing.T) {
	testDBPath := filepath.Join(os.TempDir(), fmt.Sprintf("glitch_test_api_%d.db", os.Getpid()))
	cleanupTestDB(testDBPath)
	defer cleanupTestDB(testDBPath)

	database, resolvedPath, err := db.InitDatabase(testDBPath)
	if err != nil {
		t.Fatalf("InitDatabase failed: %v", err)
	}
	defer database.Close()

	srvHandler := server.NewServer(database, resolvedPath, "", "0.1.0")
	ts := httptest.NewServer(srvHandler)
	defer ts.Close()

	// 1. GET /api/health
	res, err := http.Get(ts.URL + "/api/health")
	if err != nil || res.StatusCode != 200 {
		t.Fatalf("GET /api/health failed: status %v, err %v", res.StatusCode, err)
	}
	var healthData map[string]interface{}
	_ = json.NewDecoder(res.Body).Decode(&healthData)
	res.Body.Close()
	if healthData["status"] != "ok" || healthData["db"] != "sqlite" {
		t.Errorf("unexpected health payload: %v", healthData)
	}

	// 2. GET /api/db/status
	res, err = http.Get(ts.URL + "/api/db/status")
	if err != nil || res.StatusCode != 200 {
		t.Fatalf("GET /api/db/status failed: status %v, err %v", res.StatusCode, err)
	}
	var dbStatus db.DBStatus
	_ = json.NewDecoder(res.Body).Decode(&dbStatus)
	res.Body.Close()
	if dbStatus.Engine != "SQLite 3" || dbStatus.IntegrityCheck != "ok" || len(dbStatus.Tables) < 8 {
		t.Errorf("unexpected db status: %+v", dbStatus)
	}

	// 3. POST /api/auth/login invalid credentials
	badLoginPayload, _ := json.Marshal(map[string]string{"username": "admin", "password": "wrong_password"})
	res, err = http.Post(ts.URL+"/api/auth/login", "application/json", bytes.NewReader(badLoginPayload))
	if err != nil || res.StatusCode != 401 {
		t.Errorf("expected 401 for bad login, got %v", res.StatusCode)
	}
	res.Body.Close()

	// 4. POST /api/auth/login valid credentials
	goodLoginPayload, _ := json.Marshal(map[string]string{"username": "admin", "password": "admin"})
	res, err = http.Post(ts.URL+"/api/auth/login", "application/json", bytes.NewReader(goodLoginPayload))
	if err != nil || res.StatusCode != 200 {
		t.Fatalf("expected 200 for valid login, got %v", res.StatusCode)
	}
	var loginResp map[string]interface{}
	_ = json.NewDecoder(res.Body).Decode(&loginResp)
	res.Body.Close()
	if loginResp["token"] == nil || loginResp["token"] == "" {
		t.Errorf("expected session token in login response")
	}

	// 5. GET /api/incidents & POST /api/incidents/:id/resolve
	res, err = http.Get(ts.URL + "/api/incidents")
	if err != nil || res.StatusCode != 200 {
		t.Fatalf("GET /api/incidents failed: %v", res.StatusCode)
	}
	var incidents []db.Incident
	_ = json.NewDecoder(res.Body).Decode(&incidents)
	res.Body.Close()
	if len(incidents) == 0 {
		t.Fatalf("expected incidents list")
	}

	resolveRes, err := http.Post(fmt.Sprintf("%s/api/incidents/%s/resolve", ts.URL, incidents[0].ID), "application/json", nil)
	if err != nil || resolveRes.StatusCode != 200 {
		t.Errorf("resolve incident failed: %v", resolveRes.StatusCode)
	}
	resolveRes.Body.Close()

	// 6. POST & GET /api/copilot/chats
	newChat, _ := json.Marshal(map[string]interface{}{
		"id":        "test-chat-go-1",
		"sender":    "user",
		"text":      "glitch system status",
		"timestamp": "12:00 PM",
	})
	chatPostRes, err := http.Post(ts.URL+"/api/copilot/chats", "application/json", bytes.NewReader(newChat))
	if err != nil || chatPostRes.StatusCode != 201 {
		t.Errorf("POST /api/copilot/chats failed: %v", chatPostRes.StatusCode)
	}
	chatPostRes.Body.Close()

	chatsGetRes, err := http.Get(ts.URL + "/api/copilot/chats")
	if err != nil || chatsGetRes.StatusCode != 200 {
		t.Fatalf("GET /api/copilot/chats failed: %v", chatsGetRes.StatusCode)
	}
	var chats []db.CopilotChat
	_ = json.NewDecoder(chatsGetRes.Body).Decode(&chats)
	chatsGetRes.Body.Close()

	foundChat := false
	for _, c := range chats {
		if c.ID == "test-chat-go-1" {
			foundChat = true
			break
		}
	}
	if !foundChat {
		t.Errorf("expected to find test-chat-go-1 in copilot chats")
	}

	// 7. GET /api/services
	srvRes, err := http.Get(ts.URL + "/api/services")
	if err != nil || srvRes.StatusCode != 200 {
		t.Fatalf("GET /api/services failed: %v", srvRes.StatusCode)
	}
	var services []db.Service
	_ = json.NewDecoder(srvRes.Body).Decode(&services)
	srvRes.Body.Close()
	if len(services) < 4 {
		t.Errorf("expected at least 4 seeded services, got %d", len(services))
	}

	// 8. GET /api/pipelines
	pipeRes, err := http.Get(ts.URL + "/api/pipelines")
	if err != nil || pipeRes.StatusCode != 200 {
		t.Fatalf("GET /api/pipelines failed: %v", pipeRes.StatusCode)
	}
	var pipelines []db.Pipeline
	_ = json.NewDecoder(pipeRes.Body).Decode(&pipelines)
	pipeRes.Body.Close()
	if len(pipelines) < 3 {
		t.Errorf("expected at least 3 seeded pipelines, got %d", len(pipelines))
	}

	// 9. Static file test (404 when staticDir not found is expected, without crash)
	staticRes, err := http.Get(ts.URL + "/some-unknown-path")
	if err != nil {
		t.Fatalf("static request failed: %v", err)
	}
	_, _ = io.ReadAll(staticRes.Body)
	staticRes.Body.Close()
}
