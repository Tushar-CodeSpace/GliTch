# AGENT.md - Coding Agent Master Specification & Implementation Blueprint
> **GliTch** - Enterprise Edge Deployment & Control Plane Engine

This document contains the complete technical specification, architectural blueprint, schemas, API contracts, execution protocols, and step-by-step implementation instructions required for any AI coding agent to build, replicate, or extend the **GliTch Control Plane & Edge Deployment System** from scratch.

---

## 1. System Overview & Core Capabilities

**GliTch** is a high-performance Edge Agent Deployment & Control Plane Engine. It orchestrates software delivery across distributed edge nodes using an outbound-only WebSocket architecture.

### Key Capabilities
- **Application & Repository Registry**: Git repo connection (`https://`, `git@`), private access tokens, branch selection.
- **Cryptographic Supply Chain Security**: Automated bundle compilation (`package.zip`), 64-character SHA-256 hash checksum generation, static file distribution (`/artifacts/`).
- **Autonomous Edge Agent Fleet**: Outbound WebSocket connection (`/ws/agent`), hardware telemetry sampling (`psutil` CPU/RAM), atomic archive extraction, zero-downtime deployment execution.
- **Remote Agent Shell Console**: Remote subshell execution (`agent.command.exec`) on connected edge nodes streaming stdout/stderr back over WebSockets.
- **Automated Version Rollback Engine**: Instant snapshot restoration (`backups/<app>/<ver>`) with real-time stage progress.
- **Live Telemetry & Log Streaming**: Unified WebSocket channel (`/ws/telemetry`) streaming system metrics, audit trails, and live agent log streams.

---

## 2. Technology Stack & Prerequisites

| Component | Framework / Technology | Role |
|---|---|---|
| **Control Plane API** | Python 3.12+, FastAPI, Uvicorn, Pydantic v2 | Gateway, REST API, WebSockets, Lifespan Async Manager |
| **Database** | MongoDB / AWS DocumentDB (Motor async driver) | Persistent storage with clean in-memory fallback |
| **Edge Agent Daemon** | Python 3.12+, `websockets`, `httpx`, `psutil`, `uv` | Daemon running on target hardware/virtual machines |
| **Frontend UI** | React 18, TypeScript, Vite, Lucide Icons, Vanilla CSS | Command Center SPA with real-time charts & terminals |
| **Testing** | `pytest`, `httpx`, FastAPI `TestClient` | Automated unit & integration testing |
| **Package Manager** | `uv` (Python), `npm` (Frontend) | Ultra-fast dependency resolution |

---

## 3. Architecture & Data Flow

```
                                  +------------------------------------+
                                  |     GliTch React + Vite Frontend   |
                                  |        (Port 5173 / Production)    |
                                  +------------------+-----------------+
                                                     |
                                                REST | WebSockets (/ws/telemetry)
                                                     v
  +-----------------------+        +-----------------+-----------------+        +-----------------------+
  |  MongoDB / DocumentDB |  <---> |    FastAPI Control Plane Gateway   |  <---> |  Artifact Static Host |
  |  (Port 27017)         |        |         (Port 8000 / uvicorn)      |        |  (/artifacts/...)     |
  +-----------------------+        +-----------------+-----------------+        +-----------------------+
                                                     ^
                                      Outbound WS    | Commands &
                                      Heartbeats     | Telemetry (/ws/agent)
                                                     v
                                   +-----------------+-----------------+
                                   |      GliTch Python Edge Agent     |
                                   |      (Local Hardware Daemon)      |
                                   +-----------------+-----------------+
                                                     |
                                                     v
                                   +-----------------------------------+
                                   | Target Deployments & Snapshots    |
                                   | (deployments/ and backups/)       |
                                   +-----------------------------------+
```

---

## 4. Directory Structure Blueprint

```
GliTch/
├── AGENT.md                       # Coding agent master instruction guide
├── FEATURES.md                    # Technical features documentation
├── README.md                      # Project readme & getting started guide
├── docker-compose.yml             # Local MongoDB docker setup
├── docker-compose.prod.yml        # Production stack setup
└── services/
    ├── api_gateway/               # FastAPI Control Plane Backend
    │   ├── artifacts/             # Compiled zip bundle static storage
    │   ├── workspace/repos/       # Git clone working directory
    │   ├── database.py            # Motor MongoDB async database manager
    │   ├── main.py                # FastAPI endpoints, Pydantic schemas, WebSockets
    │   ├── pyproject.toml         # Dependencies & pytest config
    │   └── tests/
    │       └── test_main.py       # Pytest suite
    ├── glitch_agent/              # Edge Daemon Service
    │   ├── backups/               # Rollback snapshot storage
    │   ├── deployments/           # Target application execution directories
    │   ├── downloads/             # Downloaded ZIP package artifacts
    │   ├── main.py                # Agent WebSocket client loop, exec & rollback handlers
    │   └── pyproject.toml         # Dependencies
    └── frontend/                  # React + Vite Frontend App
        ├── src/
        │   ├── components/
        │   │   ├── Dashboard.tsx
        │   │   ├── Navbar.tsx
        │   │   ├── Sidebar.tsx
        │   │   └── devops/
        │   │       ├── AgentSwarmPage.tsx    # Remote Shell Modal & Swarm Matrix
        │   │       ├── ApplicationsPage.tsx  # Git Repo Integration & Registry
        │   │       ├── BuildsPage.tsx        # Artifact Compilation & SHA256 Hashes
        │   │       ├── DeploymentsPage.tsx   # Edge Rollouts & Automated Rollbacks
        │   │       └── LogsPage.tsx         # Live Streaming WebSocket Log Terminal
        │   ├── index.css
        │   └── main.tsx
        ├── package.json
        └── vite.config.ts
```

---

## 5. Core Entities & Database Schemas

### 1. Applications (`applications`)
```json
{
  "id": "app-a1b2c3",
  "name": "E-Commerce Core API",
  "repository": "https://github.com/org/ecom-api.git",
  "default_branch": "main",
  "technology": "Node.js / React",
  "is_private": true,
  "repo_username": "git-deploy-user",
  "repo_token_or_password": "ghp_secret_token",
  "status": "ACTIVE",
  "clients_count": 3,
  "last_deployment": "2026-09-15 22:00:00",
  "created_at": "2026-09-15 20:00:00"
}
```

### 2. Builds & Cryptographic Artifacts (`builds`)
```json
{
  "id": "build-1024",
  "application_id": "app-a1b2c3",
  "app_name": "E-Commerce Core API",
  "version": "v2.4.0",
  "commit_hash": "7f8a9b0",
  "branch": "main",
  "build_number": "1024",
  "checksum_sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "storage_path": "artifacts/app-a1b2c3/v2.4.0/package.zip",
  "status": "READY",
  "created_at": "2026-09-15 21:00:00"
}
```

### 3. Deployments & Rollback Snapshots (`deployments`)
```json
{
  "id": "dep-9042",
  "approval_id": "appr-001",
  "build_id": "build-1024",
  "app_name": "E-Commerce Core API",
  "site_id": "site-001",
  "client_name": "Acme Corp",
  "site_name": "BLR-01",
  "agent_id": "agent-01",
  "environment": "Production",
  "target_version": "v2.4.0",
  "status": "Active",
  "strategy": "STANDARD",
  "started_at": "2026-09-15 21:30:00",
  "completed_at": "2026-09-15 21:31:00"
}
```

### 4. Edge Agents (`agents`)
```json
{
  "id": "agent-01",
  "site_id": "site-001",
  "agent_code": "AGENT-BLR-01",
  "hostname": "edge-node-01.acme.internal",
  "ip_address": "192.168.1.105",
  "site_name": "BLR-01",
  "version": "v2.4.0",
  "status": "ONLINE",
  "cpu_percent": 18.5,
  "memory_percent": 42.1,
  "requests_per_sec": 1420,
  "last_seen": "10s ago"
}
```

---

## 6. API Endpoints & WebSocket Protocol Specifications

### REST Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health & MongoDB connection status |
| `GET` | `/api/v1/applications` | List registered applications |
| `POST` | `/api/v1/applications` | Create app with Git repository credentials |
| `DELETE` | `/api/v1/applications/{id}` | Delete application entry |
| `GET` | `/api/v1/builds` | List compiled builds & SHA-256 hashes |
| `POST` | `/api/v1/builds` | Trigger build compilation & packaging |
| `GET` | `/api/v1/deployments` | List edge deployments |
| `POST` | `/api/v1/deployments` | Assign build deployment to target agent |
| `POST` | `/api/v1/deployments/{id}/rollback` | Trigger automated backup snapshot rollback |
| `GET` | `/api/v1/agents` | List edge agents & telemetry metrics |
| `POST` | `/api/v1/agents/{id}/exec` | Execute remote subshell command on edge agent |
| `GET` | `/api/v1/logs` | Query system audit logs |
| `GET` | `/artifacts/{path}` | Static file server serving compiled zip packages |

---

### WebSocket Protocol Messages

#### 1. Agent Outbound Socket: `/ws/agent?agent_id={agent_id}`
- **Heartbeat Ping (`agent.ping`)**:
  ```json
  {
    "event": "agent.ping",
    "agentId": "agent-01",
    "siteCode": "BLR-01",
    "cpuPercent": 14.2,
    "memoryPercent": 38.6,
    "status": "ONLINE",
    "timestamp": 1726419000
  }
  ```
- **Deployment Dispatch (`agent.command.deploy`)** *(Gateway -> Agent)*:
  ```json
  {
    "event": "agent.command.deploy",
    "deploymentId": "dep-9042",
    "payload": {
      "application": "E-Commerce Core API",
      "version": "v2.4.0",
      "artifactUrl": "http://127.0.0.1:8000/artifacts/dep-9042/package.zip",
      "checksum": "sha256:e3b0c442..."
    }
  }
  ```
- **Remote Subshell Command (`agent.command.exec`)** *(Gateway -> Agent)*:
  ```json
  {
    "event": "agent.command.exec",
    "execId": "exec-a1b2c3",
    "command": "uptime",
    "timestamp": 1726419000
  }
  ```
- **Remote Subshell Response (`agent.exec.response`)** *(Agent -> Gateway)*:
  ```json
  {
    "event": "agent.exec.response",
    "agentId": "agent-01",
    "execId": "exec-a1b2c3",
    "command": "uptime",
    "stdout": " 22:30:00 up 4 days,  3:12,  load average: 0.15, 0.10, 0.08\n",
    "stderr": "",
    "exitCode": 0,
    "timestamp": 1726419001
  }
  ```
- **Rollback Request (`agent.command.rollback`)** *(Gateway -> Agent)*:
  ```json
  {
    "event": "agent.command.rollback",
    "rollbackId": "rb-101",
    "deploymentId": "dep-9042",
    "payload": {
      "application": "E-Commerce Core API",
      "version": "v2.4.0",
      "reason": "QA assertion failed"
    }
  }
  ```

#### 2. Telemetry Broadcast Socket: `/ws/telemetry`
Broadcasts real-time telemetry frames, `agent_progress_update`, `agent_exec_response`, `agent_rollback_progress`, `agent_log_stream`, and `log_entry` to connected UI clients every 1.2 seconds.

---

## 7. Step-by-Step Instructions for Coding Agents

### Phase 1: API Gateway (Control Plane Backend)
1. Initialize FastAPI app in `services/api_gateway/main.py` using standard `asynccontextmanager` lifespan:
   ```python
   from contextlib import asynccontextmanager

   @asynccontextmanager
   async def lifespan(app: FastAPI):
       await db_manager.connect()
       yield
       await db_manager.close()

   app = FastAPI(title="GliTch Central Control Plane", lifespan=lifespan)
   ```
2. Configure CORS middleware allowing all origins (`*`) for local SPA development.
3. Mount static file serving: `app.mount("/artifacts", StaticFiles(directory="artifacts"), name="artifacts")`.
4. Create Pydantic v2 schemas: `ApplicationCreate`, `Application`, `BuildCreate`, `Build`, `DeploymentCreate`, `Deployment`, `AgentRegister`, `Agent`, `LogEntry`, `AgentExecRequest`, `RollbackRequest`.
5. Implement `DatabaseManager` in `database.py` with `motor.motor_asyncio.AsyncIOMotorClient` and robust fallback handling.
6. Implement `TelemetryConnectionManager` and `AgentConnectionManager`.
7. Add REST endpoints (`/api/v1/applications`, `/api/v1/builds`, `/api/v1/deployments`, `/api/v1/deployments/{id}/rollback`, `/api/v1/agents`, `/api/v1/agents/{id}/exec`, `/api/v1/logs`).
8. Add WebSocket endpoints `/ws/agent` and `/ws/telemetry`.
9. Write unit tests in `services/api_gateway/tests/test_main.py` using `fastapi.testclient.TestClient`.

### Phase 2: Edge Agent Daemon (`services/glitch_agent`)
1. Create `services/glitch_agent/main.py`. Ensure runtime folders exist (`deployments/`, `backups/`, `downloads/`).
2. Establish outbound WebSocket client loop using `websockets.connect("ws://127.0.0.1:8000/ws/agent?agent_id=agent-01")`.
3. Implement 5-second background heartbeat task sampling system metrics via `psutil.cpu_percent()` and `psutil.virtual_memory().percent`.
4. Implement `run_deployment_flow`:
   - 10-stage execution pipeline (`PREPARING` -> `DOWNLOADING` -> `VERIFYING` -> `BACKING_UP` -> `STOPPING` -> `INSTALLING` -> `CONFIGURING` -> `STARTING` -> `HEALTH_CHECK` -> `SUCCESS`).
   - Package download via `httpx.AsyncClient`.
   - SHA-256 validation via `hashlib.sha256()`.
   - Backup snapshot copy creation in `backups/<app>/<ver>`.
   - Atomic extraction using `zipfile.ZipFile`.
5. Implement `run_remote_shell`:
   - Execute command using `asyncio.create_subprocess_shell`.
   - 15-second timeout safeguard.
   - Stream `agent.exec.response` containing `stdout`, `stderr`, and `exitCode`.
6. Implement `run_rollback_flow`:
   - Restore previous version snapshot from `backups/` directory to `deployments/`.
   - Stream `agent.rollback.progress` updates.

### Phase 3: Frontend UI (`services/frontend`)
1. Setup React 18 + Vite + TypeScript application in `services/frontend`.
2. Configure layout with `Navbar`, `Sidebar`, and active view routing.
3. Build `ApplicationsPage.tsx`: Application registry table, Git credentials form, private repository badges.
4. Build `BuildsPage.tsx`: Build creation trigger, ZIP compiler, SHA-256 hash displays.
5. Build `DeploymentsPage.tsx`: Deployment rollouts list, trigger modal, "Trigger Rollback" action button & confirmation dialog, live rollback progress updates.
6. Build `AgentSwarmPage.tsx`: Edge node matrix cards, hardware telemetry indicators, interactive **Remote Shell Console Modal** with preset quick command pills (`uptime`, `ps aux`, `df -h`, `ls -la deployments/`, `python --version`) and live streaming terminal output.
7. Build `LogsPage.tsx`: Real-time WebSocket log stream, severity level filter pills (`ALL`, `INFO`, `WARN`, `ERROR`, `DEBUG`), search query filter, clear log action.

### Phase 4: Verification & Execution
1. Run backend unit tests:
   ```bash
   cd services/api_gateway
   uv run pytest
   ```
2. Verify all tests pass with 0 errors.

---

## 8. CLI & Service Execution Commands Cheat Sheet

### 1. Control Plane Backend (FastAPI Gateway)
```bash
cd services/api_gateway
uv run uvicorn main:app --port 8000 --reload
```

### 2. Edge Agent Daemon (Python Edge Daemon)
```bash
cd services/glitch_agent
uv run python main.py
```

### 3. Frontend User Interface (React + Vite SPA)
```bash
cd services/frontend
npm run dev
```

### 4. Run Automated Pytest Test Suite
```bash
cd services/api_gateway
uv run pytest
```

### 5. Start Local MongoDB Container (Optional)
```bash
docker-compose up -d
```
