package server

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"os"
	"path/filepath"

	"github.com/Tushar-CodeSpace/GliTch/services/daemon/internal/system"
)

type Server struct {
	db        *sql.DB
	dbPath    string
	staticDir string
	version   string
	mux       *http.ServeMux
}

func resolveStaticDir(staticDir string) string {
	// If explicitly provided and contains index.html, use it
	if staticDir != "" {
		if _, err := os.Stat(filepath.Join(staticDir, "index.html")); err == nil {
			return staticDir
		}
	}

	// Check environment variable
	if envDir := os.Getenv("GLITCH_STATIC_DIR"); envDir != "" {
		if _, err := os.Stat(filepath.Join(envDir, "index.html")); err == nil {
			return envDir
		}
	}

	// Check relative to executable
	if exe, err := os.Executable(); err == nil {
		exeDir := filepath.Dir(exe)
		candidate := filepath.Join(exeDir, "..", "packages", "web", "dist")
		if _, err := os.Stat(filepath.Join(candidate, "index.html")); err == nil {
			return candidate
		}
	}

	// Check relative to current working directory
	if cwd, err := os.Getwd(); err == nil {
		candidate := filepath.Join(cwd, "packages", "web", "dist")
		if _, err := os.Stat(filepath.Join(candidate, "index.html")); err == nil {
			return candidate
		}
	}

	// Check standard global install paths
	for _, candidate := range []string{
		"/opt/glitch/packages/web/dist",
		"/usr/share/glitch/packages/web/dist",
	} {
		if _, err := os.Stat(filepath.Join(candidate, "index.html")); err == nil {
			return candidate
		}
	}

	if staticDir != "" {
		return staticDir
	}
	cwd, _ := os.Getwd()
	return filepath.Join(cwd, "packages", "web", "dist")
}

func NewServer(db *sql.DB, dbPath, staticDir, version string) *Server {
	if version == "" {
		version = "0.1.0"
	}
	staticDir = resolveStaticDir(staticDir)

	s := &Server{
		db:        db,
		dbPath:    dbPath,
		staticDir: staticDir,
		version:   version,
		mux:       http.NewServeMux(),
	}

	s.registerRoutes()
	return s
}

func (s *Server) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	// CORS Headers
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return
	}

	s.mux.ServeHTTP(w, r)
}

func (s *Server) registerRoutes() {
	// API Endpoints
	s.mux.HandleFunc("/api/health", s.handleHealth)
	s.mux.HandleFunc("/api/metrics", s.handleMetrics)
	s.mux.HandleFunc("/api/metrics/history", s.handleMetricsHistory)
	s.mux.HandleFunc("/api/auth/login", s.handleLogin)
	s.mux.HandleFunc("/api/auth/register", s.handleRegister)
	s.mux.HandleFunc("/api/auth/verify", s.handleVerifyAuth)
	s.mux.HandleFunc("/api/auth/logout", s.handleLogout)
	s.mux.HandleFunc("/api/incidents", s.handleIncidents)
	s.mux.HandleFunc("/api/incidents/", s.handleIncidentSubroute)
	s.mux.HandleFunc("/api/services", s.handleServices)
	s.mux.HandleFunc("/api/services/", s.handleServiceSubroute)
	s.mux.HandleFunc("/api/pipelines", s.handlePipelines)
	s.mux.HandleFunc("/api/copilot/chats", s.handleCopilotChats)
	s.mux.HandleFunc("/api/db/status", s.handleDBStatus)

	// Static Assets & SPA Fallback for Root and UI paths
	s.mux.HandleFunc("/", s.handleStatic)
}

func (s *Server) sendJSON(w http.ResponseWriter, statusCode int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	_ = json.NewEncoder(w).Encode(data)
}

func (s *Server) sendError(w http.ResponseWriter, statusCode int, msg string) {
	s.sendJSON(w, statusCode, map[string]interface{}{
		"success": false,
		"error":   msg,
	})
}

func (s *Server) handleHealth(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		s.sendError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	ver := s.version
	var dbVer string
	if err := s.db.QueryRow("SELECT value FROM db_meta WHERE key = 'version'").Scan(&dbVer); err == nil && dbVer != "" {
		ver = dbVer
	}

	s.sendJSON(w, http.StatusOK, map[string]interface{}{
		"status":    "ok",
		"service":   "glitch-local-daemon",
		"mode":      "local",
		"db":        "sqlite",
		"db_path":   s.dbPath,
		"version":   ver,
		"timestamp": system.CollectDeviceMetrics().UpdatedAt,
	})
}
