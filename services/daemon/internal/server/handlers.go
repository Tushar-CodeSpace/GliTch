package server

import (
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/Tushar-CodeSpace/GliTch/services/daemon/internal/db"
	"github.com/Tushar-CodeSpace/GliTch/services/daemon/internal/system"
)

func (s *Server) handleMetrics(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		s.sendError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	metrics := system.CollectDeviceMetrics()

	// Persist sample to SQLite asynchronously (non-blocking)
	go func(m system.DeviceMetrics) {
		_ = db.RecordMetricsSample(s.db, m)
	}(metrics)

	s.sendJSON(w, http.StatusOK, metrics)
}

func (s *Server) handleMetricsHistory(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		s.sendError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	limit := 60
	if limitStr := r.URL.Query().Get("limit"); limitStr != "" {
		if val, err := strconv.Atoi(limitStr); err == nil && val > 0 {
			limit = val
		}
	}

	timeRange := r.URL.Query().Get("range")
	if timeRange == "" {
		timeRange = "1h"
	}

	points, err := db.GetMetricsHistory(s.db, limit, timeRange)
	if err != nil {
		s.sendError(w, http.StatusInternalServerError, err.Error())
		return
	}

	if points == nil {
		points = []db.MetricHistoryPoint{}
	}

	s.sendJSON(w, http.StatusOK, points)
}

func (s *Server) handleLogin(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		s.sendError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	var req struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Username == "" || req.Password == "" {
		s.sendError(w, http.StatusBadRequest, "Username and password are required.")
		return
	}

	var user db.User
	err := s.db.QueryRow(
		"SELECT id, username, password_hash, role, created_at FROM users WHERE username = ?",
		strings.TrimSpace(req.Username),
	).Scan(&user.ID, &user.Username, &user.PasswordHash, &user.Role, &user.CreatedAt)

	if err != nil || !db.VerifyPassword(req.Password, user.PasswordHash) {
		s.sendError(w, http.StatusUnauthorized, "Invalid credentials. Please verify your username and password.")
		return
	}

	// Generate 32-byte session token
	tokenBytes := make([]byte, 32)
	_, _ = rand.Read(tokenBytes)
	token := hex.EncodeToString(tokenBytes)
	expiresAt := time.Now().Add(30 * 24 * time.Hour).UTC().Format(time.RFC3339)

	_, _ = s.db.Exec(`
		INSERT INTO sessions (token, user_id, username, role, expires_at)
		VALUES (?, ?, ?, ?, ?)
	`, token, user.ID, user.Username, user.Role, expiresAt)

	s.sendJSON(w, http.StatusOK, map[string]interface{}{
		"success": true,
		"token":   token,
		"user": map[string]interface{}{
			"id":       user.ID,
			"username": user.Username,
			"role":     user.Role,
		},
	})
}

func (s *Server) handleVerifyAuth(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		s.sendError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	authHeader := r.Header.Get("Authorization")
	var token string
	if strings.HasPrefix(authHeader, "Bearer ") {
		token = strings.TrimPrefix(authHeader, "Bearer ")
	} else {
		token = r.URL.Query().Get("token")
	}

	if token == "" {
		s.sendError(w, http.StatusUnauthorized, "Missing authorization token.")
		return
	}

	var username, role, expiresAt string
	var userID int64
	err := s.db.QueryRow(`
		SELECT user_id, username, role, expires_at
		FROM sessions
		WHERE token = ? AND expires_at > CURRENT_TIMESTAMP
	`, token).Scan(&userID, &username, &role, &expiresAt)

	if err != nil {
		s.sendError(w, http.StatusUnauthorized, "Session expired or invalid.")
		return
	}

	s.sendJSON(w, http.StatusOK, map[string]interface{}{
		"success": true,
		"user": map[string]interface{}{
			"id":       userID,
			"username": username,
			"role":     role,
		},
	})
}

func (s *Server) handleLogout(w http.ResponseWriter, r *http.Request) {
	authHeader := r.Header.Get("Authorization")
	var token string
	if strings.HasPrefix(authHeader, "Bearer ") {
		token = strings.TrimPrefix(authHeader, "Bearer ")
	} else {
		token = r.URL.Query().Get("token")
	}

	if token != "" {
		_, _ = s.db.Exec("DELETE FROM sessions WHERE token = ?", token)
	}

	s.sendJSON(w, http.StatusOK, map[string]interface{}{
		"success": true,
	})
}

func (s *Server) handleRegister(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		s.sendError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	var req struct {
		Username string `json:"username"`
		Password string `json:"password"`
		Role     string `json:"role"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Username == "" || req.Password == "" {
		s.sendError(w, http.StatusBadRequest, "Username and password required.")
		return
	}

	role := req.Role
	if role == "" {
		role = "operator"
	}

	username := strings.TrimSpace(req.Username)
	var existingID int64
	if err := s.db.QueryRow("SELECT id FROM users WHERE username = ?", username).Scan(&existingID); err == nil {
		s.sendError(w, http.StatusConflict, "Username already exists.")
		return
	}

	hash := db.HashPassword(req.Password)
	res, err := s.db.Exec("INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)", username, hash, role)
	if err != nil {
		s.sendError(w, http.StatusInternalServerError, "Failed to register user.")
		return
	}

	newID, _ := res.LastInsertId()
	s.sendJSON(w, http.StatusCreated, map[string]interface{}{
		"success": true,
		"user": map[string]interface{}{
			"id":       newID,
			"username": username,
			"role":     role,
		},
	})
}

func (s *Server) handleIncidents(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		s.sendError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	rows, err := s.db.Query(`
		SELECT id, title, description, severity, service, timestamp, status,
		       suggested_action, command, impact, resolved_at
		FROM incidents ORDER BY created_at DESC
	`)
	if err != nil {
		s.sendError(w, http.StatusInternalServerError, err.Error())
		return
	}
	defer rows.Close()

	var incidents []db.Incident
	for rows.Next() {
		var inc db.Incident
		var desc, action, cmd, imp, resAt sql.NullString
		if err := rows.Scan(
			&inc.ID, &inc.Title, &desc, &inc.Severity, &inc.Service, &inc.Timestamp, &inc.Status,
			&action, &cmd, &imp, &resAt,
		); err == nil {
			inc.Description = desc.String
			inc.SuggestedAction = action.String
			inc.Command = cmd.String
			inc.Impact = imp.String
			if resAt.Valid {
				inc.ResolvedAt = &resAt.String
			}
			incidents = append(incidents, inc)
		}
	}

	s.sendJSON(w, http.StatusOK, incidents)
}

func (s *Server) handleIncidentSubroute(w http.ResponseWriter, r *http.Request) {
	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	// e.g. ["api", "incidents", "INC-307", "resolve"]
	if len(parts) == 4 && parts[3] == "resolve" && r.Method == http.MethodPost {
		incidentID := parts[2]
		_, err := s.db.Exec("UPDATE incidents SET status = 'resolved', resolved_at = CURRENT_TIMESTAMP WHERE id = ?", incidentID)
		if err != nil {
			s.sendError(w, http.StatusInternalServerError, err.Error())
			return
		}
		s.sendJSON(w, http.StatusOK, map[string]interface{}{
			"success":    true,
			"incidentId": incidentID,
			"status":     "resolved",
		})
		return
	}

	s.sendError(w, http.StatusNotFound, "Endpoint not found")
}

func (s *Server) handleServices(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		s.sendError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	rows, err := s.db.Query(`
		SELECT id, name, category, status, cpu, memory, uptime, port, version, logs_json
		FROM services ORDER BY name ASC
	`)
	if err != nil {
		s.sendError(w, http.StatusInternalServerError, err.Error())
		return
	}
	defer rows.Close()

	var services []db.Service
	for rows.Next() {
		var srv db.Service
		var logsJSON sql.NullString
		if err := rows.Scan(
			&srv.ID, &srv.Name, &srv.Category, &srv.Status, &srv.CPU, &srv.Memory, &srv.Uptime, &srv.Port, &srv.Version, &logsJSON,
		); err == nil {
			srv.Logs = []string{}
			if logsJSON.Valid && logsJSON.String != "" {
				_ = json.Unmarshal([]byte(logsJSON.String), &srv.Logs)
			}
			services = append(services, srv)
		}
	}

	s.sendJSON(w, http.StatusOK, services)
}

func (s *Server) handleServiceSubroute(w http.ResponseWriter, r *http.Request) {
	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	// e.g. ["api", "services", "srv-1", "restart"]
	if len(parts) == 4 && parts[3] == "restart" && r.Method == http.MethodPost {
		serviceID := parts[2]
		_, err := s.db.Exec("UPDATE services SET status = 'running', cpu = 5.0, updated_at = CURRENT_TIMESTAMP WHERE id = ? OR name = ?", serviceID, serviceID)
		if err != nil {
			s.sendError(w, http.StatusInternalServerError, err.Error())
			return
		}
		s.sendJSON(w, http.StatusOK, map[string]interface{}{
			"success":   true,
			"serviceId": serviceID,
			"status":    "running",
		})
		return
	}

	s.sendError(w, http.StatusNotFound, "Endpoint not found")
}

func (s *Server) handlePipelines(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		s.sendError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	rows, err := s.db.Query(`
		SELECT id, name, branch, commit_hash, author, status, duration, timestamp, stages_json
		FROM pipelines ORDER BY updated_at DESC
	`)
	if err != nil {
		s.sendError(w, http.StatusInternalServerError, err.Error())
		return
	}
	defer rows.Close()

	var pipelines []db.Pipeline
	for rows.Next() {
		var pip db.Pipeline
		var stagesJSON sql.NullString
		if err := rows.Scan(
			&pip.ID, &pip.Name, &pip.Branch, &pip.Commit, &pip.Author, &pip.Status, &pip.Duration, &pip.Timestamp, &stagesJSON,
		); err == nil {
			pip.Stages = []interface{}{}
			if stagesJSON.Valid && stagesJSON.String != "" {
				_ = json.Unmarshal([]byte(stagesJSON.String), &pip.Stages)
			}
			pipelines = append(pipelines, pip)
		}
	}

	s.sendJSON(w, http.StatusOK, pipelines)
}

func (s *Server) handleCopilotChats(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		rows, err := s.db.Query(`
			SELECT id, sender, text, timestamp, action_id, action_title, action_command, action_executed, tags_json
			FROM copilot_chats ORDER BY created_at ASC
		`)
		if err != nil {
			s.sendError(w, http.StatusInternalServerError, err.Error())
			return
		}
		defer rows.Close()

		var chats []db.CopilotChat
		for rows.Next() {
			var chat db.CopilotChat
			var actID, actTitle, actCmd, tagsJSON sql.NullString
			var executed int
			if err := rows.Scan(
				&chat.ID, &chat.Sender, &chat.Text, &chat.Timestamp,
				&actID, &actTitle, &actCmd, &executed, &tagsJSON,
			); err == nil {
				if actID.Valid {
					chat.ActionID = &actID.String
				}
				if actTitle.Valid {
					chat.ActionTitle = &actTitle.String
				}
				if actCmd.Valid {
					chat.ActionCommand = &actCmd.String
				}
				chat.ActionExecuted = executed != 0
				chat.Tags = []string{}
				if tagsJSON.Valid && tagsJSON.String != "" {
					_ = json.Unmarshal([]byte(tagsJSON.String), &chat.Tags)
				}
				chats = append(chats, chat)
			}
		}

		s.sendJSON(w, http.StatusOK, chats)

	case http.MethodPost:
		var req struct {
			ID             string   `json:"id"`
			Sender         string   `json:"sender"`
			Text           string   `json:"text"`
			Timestamp      string   `json:"timestamp"`
			ActionID       *string  `json:"actionId"`
			ActionTitle    *string  `json:"actionTitle"`
			ActionCommand  *string  `json:"actionCommand"`
			ActionExecuted bool     `json:"actionExecuted"`
			Tags           []string `json:"tags"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Sender == "" || req.Text == "" {
			s.sendError(w, http.StatusBadRequest, "Sender and text are required.")
			return
		}

		id := req.ID
		if id == "" {
			id = fmt.Sprintf("msg-%d", time.Now().UnixMilli())
		}
		timestamp := req.Timestamp
		if timestamp == "" {
			timestamp = time.Now().Format("3:04 PM")
		}

		tagsJSON, _ := json.Marshal(req.Tags)
		execInt := 0
		if req.ActionExecuted {
			execInt = 1
		}

		_, err := s.db.Exec(`
			INSERT INTO copilot_chats (id, sender, text, timestamp, action_id, action_title, action_command, action_executed, tags_json)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
		`, id, req.Sender, req.Text, timestamp, req.ActionID, req.ActionTitle, req.ActionCommand, execInt, string(tagsJSON))

		if err != nil {
			s.sendError(w, http.StatusInternalServerError, err.Error())
			return
		}

		s.sendJSON(w, http.StatusCreated, map[string]interface{}{
			"success": true,
			"id":      id,
		})

	default:
		s.sendError(w, http.StatusMethodNotAllowed, "Method not allowed")
	}
}

func (s *Server) handleDBStatus(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		s.sendError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	var sizeBytes int64
	if stat, err := os.Stat(s.dbPath); err == nil {
		sizeBytes = stat.Size()
	}

	rows, err := s.db.Query("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'")
	if err != nil {
		s.sendError(w, http.StatusInternalServerError, err.Error())
		return
	}

	var tables []string
	for rows.Next() {
		var name string
		if err := rows.Scan(&name); err == nil {
			tables = append(tables, name)
		}
	}
	rows.Close()

	counts := make(map[string]int)
	for _, name := range tables {
		var c int
		_ = s.db.QueryRow(fmt.Sprintf(`SELECT COUNT(*) FROM "%s"`, name)).Scan(&c)
		counts[name] = c
	}

	var integrityCheck string
	_ = s.db.QueryRow("PRAGMA integrity_check").Scan(&integrityCheck)
	if integrityCheck == "" {
		integrityCheck = "ok"
	}

	status := db.DBStatus{
		Engine:         "SQLite 3",
		DatabasePath:   s.dbPath,
		SizeBytes:      sizeBytes,
		SizeFormatted:  fmt.Sprintf("%.1f KB", float64(sizeBytes)/1024.0),
		Tables:         tables,
		Counts:         counts,
		IntegrityCheck: integrityCheck,
		WALMode:        true,
	}

	s.sendJSON(w, http.StatusOK, status)
}

func (s *Server) handleStatic(w http.ResponseWriter, r *http.Request) {
	if strings.HasPrefix(r.URL.Path, "/api/") {
		s.sendError(w, http.StatusNotFound, "Endpoint not found: "+r.Method+" "+r.URL.Path)
		return
	}

	cleanPath := filepath.Clean(r.URL.Path)
	fullPath := filepath.Join(s.staticDir, cleanPath)

	// If directory, look for index.html inside
	if info, err := os.Stat(fullPath); err == nil && info.IsDir() {
		fullPath = filepath.Join(fullPath, "index.html")
	}

	// If file doesn't exist, fallback to root index.html (SPA routing)
	if _, err := os.Stat(fullPath); os.IsNotExist(err) {
		fullPath = filepath.Join(s.staticDir, "index.html")
	}

	if _, err := os.Stat(fullPath); os.IsNotExist(err) {
		s.sendError(w, http.StatusNotFound, "Static files not found. Build web UI first.")
		return
	}

	// Cache control: no-cache for index.html, immutable for hashed assets
	if strings.HasSuffix(fullPath, "index.html") {
		w.Header().Set("Cache-Control", "no-cache")
	} else {
		w.Header().Set("Cache-Control", "public, max-age=31536000, immutable")
	}

	http.ServeFile(w, r, fullPath)
}
