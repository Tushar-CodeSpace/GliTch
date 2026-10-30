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

## 📚 Documentation

For in-depth guides, specifications, and reference manuals, explore the `docs/` directory:

| Document | Description |
| :--- | :--- |
| 🏛️ [**Architecture**](docs/architecture.md) | Component diagrams, daemon microservices, and telemetry pipeline. |
| 🛠️ [**Installation & APT Guide**](docs/installation.md) | 1-step setup, `sudo apt update` auto-update hooks, and `.deb` packaging. |
| 🗄️ [**SQLite Database**](docs/database.md) | SQLite 3 WAL schema, tables, PBKDF2 credentials, and queries. |
| 🏷️ [**Branch-Based Versioning**](docs/versioning.md) | Automatic SemVer bumps from `fix/*`, `feature/*`, and `major/*` branches. |
| 📡 [**REST API Reference**](docs/api.md) | Daemon HTTP endpoints, payload formats, and authentication tokens. |
| 💻 [**CLI Reference**](docs/cli.md) | `glitch` and `glitch-update` command-line manuals. |

---

## 🚀 Quick Start

### ⚡ 1-Line Quick Install
Run this single command in your terminal to automatically download, configure, and install GliTch:

```bash
curl -fsSL https://raw.githubusercontent.com/Tushar-CodeSpace/GliTch/main/install.sh | bash
```

Or for complete system setup (APT update integration & global CLI symlinks in `/usr/local/bin`):
```bash
curl -fsSL https://raw.githubusercontent.com/Tushar-CodeSpace/GliTch/main/install.sh | sudo bash
```

*(Alternatively with wget: `wget -qO- https://raw.githubusercontent.com/Tushar-CodeSpace/GliTch/main/install.sh | bash`)*

---

### Prerequisites & Auto-Installation
- **Go 1.22+** (Golang native daemon compiler)
- **Node.js & npm** (for web frontend bundle building)
> 💡 *Note:* The installer automatically installs Go, Node.js, and npm if they are missing.

### Manual / Local Clone Setup
If you have already cloned the repository locally:
```bash
# Standard local setup (builds Go daemon & web UI)
./install.sh

# Or full system setup with APT update hooks & CLI symlink
sudo ./install.sh --apt --cli
```

### 3. Running Services

#### Start the Local Daemon (Port 4780)
```bash
./bin/glitch start
# or
npm run daemon
```

#### Start the Web UI (Port 5173)
```bash
npm run web
```
Visit: **`http://127.0.0.1:5173`**

### Default Operator Credentials
| Username | Password | Role |
| :--- | :--- | :--- |
| `admin` | `admin` | Administrator |
| `operator` | `glitch` | Operator |

---

## 🧪 Testing & Verification

Run the complete test suite (unit tests, integration tests, and production build):
```bash
npm test
```
