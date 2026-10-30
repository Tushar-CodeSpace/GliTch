package main

import (
	"context"
	"flag"
	"fmt"
	"net"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"syscall"
	"time"

	"github.com/Tushar-CodeSpace/GliTch/services/daemon/internal/db"
	"github.com/Tushar-CodeSpace/GliTch/services/daemon/internal/server"
)

func main() {
	// CLI subcommands check
	if len(os.Args) > 1 {
		switch os.Args[1] {
		case "db":
			runDBCli()
			return
		case "triage":
			runTriageCli()
			return
		case "version", "--version", "-v":
			fmt.Println("glitch-daemon v0.1.0 (Go native engine)")
			return
		}
	}

	port := os.Getenv("GLITCH_PORT")
	if port == "" {
		port = "4780"
	}
	host := os.Getenv("GLITCH_HOST")
	if host == "" {
		host = "127.0.0.1"
	}
	dbPath := os.Getenv("GLITCH_DB_PATH")
	if dbPath == "" {
		cwd, _ := os.Getwd()
		dbPath = filepath.Join(cwd, "data", "glitch.db")
	}

	var (
		flagPort   = flag.String("port", port, "Port for daemon HTTP server")
		flagHost   = flag.String("host", host, "Host address for daemon HTTP server")
		flagDB     = flag.String("db", dbPath, "Path to SQLite database file")
		flagStatic = flag.String("static", "", "Path to built frontend static assets")
	)
	flag.Parse()

	fmt.Println("⚡ [Glitch] Initializing Local SQLite Database (Go Engine)...")
	database, resolvedDBPath, err := db.InitDatabase(*flagDB)
	if err != nil {
		fmt.Fprintf(os.Stderr, "❌ Database initialization failed: %v\n", err)
		os.Exit(1)
	}
	defer database.Close()

	fmt.Printf("✔ [Glitch] SQLite database initialized at: %s\n", resolvedDBPath)

	srvHandler := server.NewServer(database, resolvedDBPath, *flagStatic, "0.1.0")
	addr := fmt.Sprintf("%s:%s", *flagHost, *flagPort)

	httpServer := &http.Server{
		Addr:         addr,
		Handler:      srvHandler,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	go func() {
		fmt.Printf(`
╔══════════════════════════════════════════════════════════════════╗
║                    GLITCH LOCAL DEVOPS DAEMON                    ║
║                        Go & SQLite Engine                        ║
╠══════════════════════════════════════════════════════════════════╣
║  • Endpoint:   http://%-47s ║
║  • Database:   %-49s ║
║  • Engine:     Go 1.22+ · SQLite 3 (WAL mode enabled)            ║
║  • Status:     ONLINE (Local-First · Zero Cloud Dependency)      ║
║  • Seed Users: admin (pw: admin) · operator (pw: glitch)         ║
╚══════════════════════════════════════════════════════════════════╝
`, addr, resolvedDBPath)

		// Opportunistic companion redirect on port 5173
		// Smoothly redirects any browser requests navigating to :5173 to :4780
		if *flagPort != "5173" {
			go func() {
				devAddr := fmt.Sprintf("%s:5173", *flagHost)
				ln, err := net.Listen("tcp", devAddr)
				if err != nil {
					return
				}
				defer ln.Close()
				devMux := http.NewServeMux()
				devMux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
					target := fmt.Sprintf("http://%s:%s%s", *flagHost, *flagPort, r.RequestURI)
					http.Redirect(w, r, target, http.StatusTemporaryRedirect)
				})
				_ = http.Serve(ln, devMux)
			}()
		}

		if err := httpServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			fmt.Fprintf(os.Stderr, "❌ Server error: %v\n", err)
			os.Exit(1)
		}
	}()

	// Graceful shutdown on SIGINT / SIGTERM
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)
	<-sigChan

	fmt.Println("\n⚡ [Glitch] Gracefully shutting down Go SQLite daemon...")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_ = httpServer.Shutdown(ctx)
	fmt.Println("✔ [Glitch] Server and database closed cleanly.")
}

func runDBCli() {
	dbPath := os.Getenv("GLITCH_DB_PATH")
	database, resolvedDBPath, err := db.InitDatabase(dbPath)
	if err != nil {
		fmt.Printf("❌ Failed to open database: %v\n", err)
		return
	}
	defer database.Close()

	stat, _ := os.Stat(resolvedDBPath)
	var sizeStr string
	if stat != nil {
		sizeStr = fmt.Sprintf("%.1f KB", float64(stat.Size())/1024.0)
	} else {
		sizeStr = "0 KB"
	}

	fmt.Println("⚡ GLITCH SQLITE DATABASE INSPECTION")
	fmt.Printf("• Path:      %s\n", resolvedDBPath)
	fmt.Printf("• Size:      %s\n", sizeStr)

	rows, err := database.Query("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'")
	if err != nil {
		return
	}

	var tableNames []string
	for rows.Next() {
		var name string
		if err := rows.Scan(&name); err == nil {
			tableNames = append(tableNames, name)
		}
	}
	rows.Close()

	fmt.Println("\nTable Record Counts:")
	for _, name := range tableNames {
		var count int
		_ = database.QueryRow(fmt.Sprintf(`SELECT COUNT(*) FROM "%s"`, name)).Scan(&count)
		fmt.Printf("  • %-18s : %d\n", name, count)
	}
}

func runTriageCli() {
	dbPath := os.Getenv("GLITCH_DB_PATH")
	database, _, err := db.InitDatabase(dbPath)
	if err != nil {
		fmt.Printf("❌ Failed to open database: %v\n", err)
		return
	}
	defer database.Close()

	rows, err := database.Query("SELECT id, title, severity, service, status, command FROM incidents ORDER BY created_at DESC")
	if err != nil {
		return
	}
	defer rows.Close()

	fmt.Println("⚡ ACTIVE INCIDENT TRIAGE:")
	for rows.Next() {
		var id, title, sev, srv, status string
		var cmd *string
		if err := rows.Scan(&id, &title, &sev, &srv, &status, &cmd); err == nil {
			color := "\x1b[33m[WARNING]\x1b[0m"
			if sev == "critical" {
				color = "\x1b[31m[CRITICAL]\x1b[0m"
			}
			command := "N/A"
			if cmd != nil {
				command = *cmd
			}
			fmt.Printf("%s %s: %s (%s)\n", color, id, title, status)
			fmt.Printf("   Service: %s\n", srv)
			fmt.Printf("   Command: %s\n\n", command)
		}
	}
}
