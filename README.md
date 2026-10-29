# GliTch ⚡
> **Your Virtual AI DevOps Engineer & Autonomous Infrastructure Copilot.**

Glitch is like having a senior DevOps engineer and Site Reliability Engineer (SRE) running 24/7 on your machine, but virtual and AI-powered.

---

## ⚡ What Glitch Does

- **Virtual AI DevOps Copilot (`Glitch Copilot`)**: An interactive AI chat console that answers DevOps questions, analyzes telemetry in real-time, writes bash scripts & Terraform configs, and proposes automated remediation playbooks.
- **Autonomous Incident Triage**: Automatically monitors service health and memory pressure, triages alerts (Critical, Warning, Advisory), and auto-generates playbooks with 1-click execution.
- **Service Mesh & Container Orchestration**: Real-time status for Docker containers, system services, and databases with resource stats, live log streams, and restart controls.
- **Continuous Delivery (CI/CD)**: Visual step progress for build and deployment pipelines, with instant manual triggers and failure analysis.
- **Interactive DevOps Terminal**: Embedded terminal shell with support for the `glitch` CLI toolset (`glitch status`, `glitch triage`, `glitch fix --all`, `docker ps`).
- **Local-First & Private with SQLite**: Uses an embedded SQLite database (`data/glitch.db`) for all credentials, incident logs, service status, and copilot history. No external cloud or third-party database server needed.

---

## 🗄️ Local SQLite Setup

Glitch runs entirely local-first using **SQLite 3** in WAL (Write-Ahead Logging) mode.

- **Database file**: `data/glitch.db` (auto-created on first run)
- **Engine**: Embedded SQLite (zero cloud dependency, zero external database setup)
- **Tables**:
  - `users`: Local DevOps operator accounts and PBKDF2 hashed credentials.
  - `sessions`: Active bearer tokens and local workspace authorization.
  - `incidents`: SRE alerts and remediation status (active, investigating, resolved).
  - `services`: Docker & system service telemetry, logs, and restart timestamps.
  - `pipelines`: CI/CD build runs, commit details, and stage results.
  - `copilot_chats`: Local conversation history and executed remediation playbooks.
  - `metrics_history`: Time-series host telemetry (CPU, RAM, Disk, load average).
  - `db_meta`: Schema versioning and health metadata.

### Pre-Seeded Default Operator Accounts
| Username | Password | Role |
| :--- | :--- | :--- |
| `admin` | `admin` | Administrator |
| `operator` | `glitch` | Operator |

---

## 🏷️ Branch-Driven Semantic Versioning

Glitch uses automated Semantic Versioning driven directly by Git branch naming:

| Branch Pattern | Version Bump | Example Transition | Purpose |
| :--- | :--- | :--- | :--- |
| **`fix/...`** (or `patch/...`) | **PATCH** | `0.1.0` → `0.1.1` | Bug fixes, UI contrast, security hotfixes |
| **`feature/...`** (or `feat/...`) | **MINOR** | `0.1.0` → `0.2.0` | New copilot tools, SRE playbooks, integrations |
| **`major/...`** (or `breaking/...`) | **MAJOR** | `0.1.0` → `1.0.0` | Breaking changes, core architecture upgrades |
| **`main` / `master`** | Current Base | `0.1.0` | Production release tracking |

### Versioning CLI Commands
```bash
# Preview next version based on current branch
npm run version

# Print exact target version string
npm run version:next
# e.g., on branch 'feature/alertmanager' -> outputs 0.2.0

# Validate branch name against naming rules (used in CI)
npm run version:check

# Bump all package.json files to branch target version
npm run version:bump
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 22+ (Active LTS) or Node 24+ (provides native built-in 'node:sqlite')
- npm

### 1-Step Installation & Setup
```bash
# Standard local setup
./install.sh

# Complete system setup with APT update hooks & CLI symlink
sudo ./install.sh --apt --cli
```

---

## 🔄 Automatic Updates via `sudo apt update`

Glitch integrates directly with Debian/Ubuntu's APT package manager using `/etc/apt/apt.conf.d/99glitch-update`:

1. **`sudo apt update`** automatically invokes `glitch-update --check-only` via `APT::Update::Post-Invoke-Success`. If updates are found, it alerts you directly in the terminal.
2. **`sudo apt upgrade`** automatically pulls updates, migrates the local SQLite database schemas, and restarts the daemon service via `DPkg::Post-Invoke`.

### Building Debian Package (.deb)
To produce a standalone installable Debian `.deb` package:
```bash
./scripts/build-deb.sh
sudo apt install ./dist/glitch_0.1.0_all.deb
```

### Running the Services

#### 1. Start the SQLite Local Daemon (Port 4780)
```bash
npm run daemon
# or
node services/daemon/src/index.mjs
```

#### 2. Start the Web UI (Port 5173)
```bash
npm run web
# or
cd packages/web && npm run dev
```

Visit: **`http://127.0.0.1:5173`**

### Inspecting SQLite Database Status
```bash
npm run db:status
# or query endpoint:
curl http://127.0.0.1:4780/api/db/status
```

---

## 📦 Production Build

```bash
npm run build
```
