# GliTch Architecture 🏛️

GliTch operates as a local-first, zero-cloud-dependency DevOps copilot and observability agent. It is composed of three primary subsystems:

```
┌─────────────────────────────────────────────────────────────────┐
│                    User Interface / Browser                     │
│            React + TypeScript + Vite + TailwindCSS              │
│                (Digital Cyber Terminal on :5173)                │
└────────────────────────────────┬────────────────────────────────┘
                                 │ HTTP / JSON API (:4780)
┌────────────────────────────────▼────────────────────────────────┐
│                    GliTch Background Daemon                     │
│                Node.js Native HTTP Microservice                 │
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
│     bin/glitch • bin/glitch-update • APT Hooks (/etc/apt)       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Core Components

### 1. Web Frontend (`packages/web`)
* **Technology**: React 18, TypeScript, Vite, Tailwind CSS, Lucide icons, GSAP.
* **Aesthetic**: Cyberpunk / high-tech terminal interface with scanline animations and digital glitch accents.
* **Role**: Real-time observability dashboard, incident triaging, service mesh inspection, and interactive AI DevOps Copilot.

### 2. Backend Daemon (`services/daemon`)
* **Technology**: Node.js 22+ (Active LTS), utilizing native HTTP and standard library modules (`node:sqlite`, `node:crypto`, `node:os`).
* **Port**: Listens on `http://127.0.0.1:4780`.
* **Zero Dependency**: Runs purely on Node standard libraries without external native binary addon fragility.

### 3. Local SQLite Database Layer (`data/glitch.db`)
* **Storage**: Single file embedded SQLite database stored at `data/glitch.db`.
* **Reliability**: Configured with `PRAGMA journal_mode = WAL` (Write-Ahead Logging) and `PRAGMA synchronous = NORMAL` for concurrent read/write stability and data integrity.
* **Security**: Passwords salted and hashed with PBKDF2 (100,000 iterations, SHA-512) and verified with constant-time comparison (`crypto.timingSafeEqual`).

### 4. CLI Binaries & APT Integration (`bin/`, `etc/`)
* **`bin/glitch`**: Unified command-line interface for querying system status, checking DB health, and running remediation playbooks.
* **`bin/glitch-update`**: Self-contained updater supporting background check mode (`--check-only`) and automated migrations.
* **APT Hooks**: Configured in `/etc/apt/apt.conf.d/99glitch-update` to trigger checks whenever the system runs `sudo apt update`.

