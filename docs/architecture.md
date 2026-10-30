# GliTch Architecture 🏛️

GliTch operates as a local-first, zero-cloud-dependency DevOps copilot and observability agent. It is composed of three primary subsystems:

```
┌─────────────────────────────────────────────────────────────────┐
│                    User Interface / Browser                     │
│            React + TypeScript + Vite + TailwindCSS              │
│       (Digital Cyber Console served on :4780 / Dev on :5173)    │
└────────────────────────────────┬────────────────────────────────┘
                                 │ HTTP / JSON API (:4780)
┌────────────────────────────────▼────────────────────────────────┐
│                    GliTch Background Daemon                     │
│               Go Native HTTP Microservice Binary                │
│  ┌─────────────────────────────┬─────────────────────────────┐  │
│  │     Authentication & API    │  Telemetry & Health Monitor │  │
│  │   PBKDF2 Sessions & Tokens  │ Host Metrics (CPU, RAM, OS) │  │
│  └──────────────┬──────────────┴──────────────┬──────────────┘  │
│                 │                             │                 │
│  ┌──────────────▼─────────────────────────────▼──────────────┐  │
│  │                 Embedded SQLite 3 Layer                   │  │
│  │      WAL Mode • PRAGMA Foreign Keys • data/glitch.db      │  │
│  └───────────────────────────────────────────────────────────┘  │
└────────────────────────────────▲────────────────────────────────┘
                                 │
┌────────────────────────────────┴────────────────────────────────┐
│                      Command Line & System                      │
│     bin/glitch • bin/glitch-daemon • APT Hooks (/etc/apt)       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Core Components

### 1. Web Frontend (`packages/web`)
* **Technology**: React 18, TypeScript, Vite, Tailwind CSS, Lucide icons, GSAP.
* **Aesthetic**: Cyberpunk / high-tech terminal interface with scanline animations and digital glitch accents.
* **Role**: Real-time observability dashboard, incident triaging, service mesh inspection, and interactive AI DevOps Copilot.

### 2. Backend Daemon (`services/daemon`)
* **Technology**: Native Go (Golang 1.22+), compiling to a standalone binary `bin/glitch-daemon` with pure Go SQLite driver (`modernc.org/sqlite`).
* **Port**: Listens on `http://127.0.0.1:4780`.
* **Zero CGO / Pure Go**: Compiles anywhere without C compiler requirements, lightweight (<15MB RAM), sub-millisecond startup times.

### 3. Local SQLite Database Layer (`data/glitch.db`)
* **Storage**: Single file embedded SQLite database stored at `data/glitch.db`.
* **Reliability**: Configured with `PRAGMA journal_mode = WAL` (Write-Ahead Logging) and `PRAGMA foreign_keys = ON;` for concurrent read/write stability and data integrity.
* **Security**: Passwords salted and hashed with PBKDF2 (SHA-512) and verified with constant-time comparison (`subtle.ConstantTimeCompare`).

### 4. CLI Binaries & APT Integration (`bin/`, `etc/`)
* **`bin/glitch`**: Unified command-line interface for querying system status, checking DB health, and running remediation playbooks.
* **`bin/glitch-daemon`**: Standalone Go binary serving REST API, SQLite queries, and static web UI.
* **`bin/glitch-update`**: Self-contained updater supporting background check mode (`--check-only`) and automated migrations.
* **APT Hooks**: Configured in `/etc/apt/apt.conf.d/99glitch-update` to trigger checks whenever the system runs `sudo apt update`.

