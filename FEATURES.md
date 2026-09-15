# GliTch - Enterprise Edge Deployment & Control Plane Engine
## Full Technical Features & Architecture Documentation

GliTch is a modern, real-world Edge Agent Deployment and Control Plane Engine built for managing application builds, private/public Git repository integrations, artifact compilation, cryptographic verification, and fleet deployment across distributed edge agents.

---

## 1. System Architecture

```
                                +-----------------------------------+
                                |     GliTch React + Vite Frontend  |
                                |       (Port 5173 / Production)    |
                                +-----------------+-----------------+
                                                  |
                                             REST | API
                                                  v
+-----------------------+       +-----------------+-----------------+       +-----------------------+
|  MongoDB / DocumentDB | <---> |   FastAPI Control Plane Engine    | <---> | Artifact Static Host  |
|  (Port 27017)         |       |        (API Gateway :8000)        |       | (/artifacts/...)      |
+-----------------------+       +-----------------+-----------------+       +-----------------------+
                                                  ^
                                       Heartbeat  | Download &
                                      & Telemetry | Verify ZIP
                                                  v
                                +-----------------+-----------------+
                                |     GliTch Python Edge Agent      |
                                |     (Local Hardware Host/Daemon)  |
                                +-----------------+-----------------+
                                                  |
                                                  v
                                +-----------------------------------+
                                | Local Directory Bundle Extraction |
                                | (deployments/<app_name>/<ver>/)   |
                                +-----------------------------------+
```

### Tech Stack
- **Control Plane Backend (`services/api_gateway`)**: Python 3.12+, FastAPI, Uvicorn, Motor/PyMongo, Pydantic, `psutil`, `uv`.
- **Edge Daemon (`services/glitch_agent`)**: Python 3.12+, `httpx`, `psutil`, `uv`.
- **Frontend UI (`services/frontend`)**: React 18, TypeScript, Vite, Lucide Icons, Vanilla CSS design system.
- **Database**: MongoDB / AWS DocumentDB.

---

## 2. Comprehensive Feature Matrix

### A. Application Management & Git Repository Integration
- **Public & Private Repository Support**:
  - Configure Git repository URLs (`https://`, `git@`, or custom origins).
  - Branch selection (e.g., `main`, `master`, `release/v2`).
  - **Private Credentials Gate**: Dedicated options for Git Username and Personal Access Tokens / Passwords for authenticated cloning.
  - Visual lock badge indicators for Private repositories in the Applications UI.
- **Application Registry**:
  - Store application metadata, environment variables, default ports, and build scripts.
  - Quick deployment counts and active agent association counts.

### B. Artifact Compilation & Cryptographic Integrity Engine
- **Automated Bundle Packaging**:
  - Real zip archive creation (`package.zip`) containing runtime files (`manifest.json`, source code, entrypoints) upon triggering a build.
  - Stored under version-isolated paths: `services/api_gateway/artifacts/<app_id>/<version>/package.zip`.
- **Cryptographic Supply Chain Security (SHA-256)**:
  - Generates a 64-character SHA-256 hash (`hashlib.sha256`) for every compiled artifact zip file.
  - Persists `checksum_sha256` and `storage_path` in MongoDB for auditing.
- **Static Artifact Distribution Server**:
  - Mounts static artifact routing at `/artifacts/{path:path}` over HTTP/HTTPS for edge agents to fetch securely.

### C. Edge Agent Fleet & Telemetry Engine
- **Autonomous Enrollment & Heartbeats**:
  - Edge agents poll the control plane periodically (default 10s interval) to register their availability and state (`online`, `syncing`, `degraded`, `offline`).
- **Hardware Telemetry Sampling (`psutil`)**:
  - Real hardware metric collection from host machine OS:
    - **CPU Utilization (%)** via `psutil.cpu_percent()`.
    - **Virtual Memory / RAM Utilization (%)** via `psutil.virtual_memory().percent`.
    - **Host OS & Platform Details** (OS version, architecture, IP addresses).
- **Deployment Execution & Atomic Extraction**:
  - Agents fetch assigned deployment build packages from the Control Plane.
  - **Checksum Validation**: Verifies local artifact SHA-256 hash against the control plane record prior to extraction.
  - **Atomic Extraction**: Unzips package archives to target execution directories (`services/glitch_agent/deployments/<app_name>/<version>/`).

### D. Pipeline & Automated Workflow Engine
- **Multi-Environment Promotion**:
  - Support for `Development`, `Staging`, `QA`, and `Production` environments.
- **Continuous Integration / Continuous Deployment (CI/CD)**:
  - Visual stage progress: `Source Checkout` -> `Build Compilation` -> `SHA256 Verification` -> `QA Verification` -> `Edge Deployment`.
  - Manual & automated approval steps before production rollout.

### E. QA & Test Automation Integration
- **Test Suite Orchestration**:
  - Track unit, integration, and end-to-end test execution records per build.
  - Record pass rates, durations, failed assertions, and coverage metrics.
- **Deployment Blockers**:
  - Automatically flag builds that fail QA criteria to block deployment to production edge agents.

### F. Real-Time Telemetry & Monitoring Dashboard
- **Fleet Performance Metrics**:
  - Aggregated system metrics across all registered edge nodes.
  - Live charts and progress bars for CPU and RAM consumption.
- **Active Node Pulse**:
  - Live status indicators showing heartbeat response times and sync delays.

### G. System Logging & Audit Trails
- **Structured Log Streaming**:
  - Stores audit events for builds, deployments, agent syncs, and approval decisions.
- **Multi-Level Filtering**:
  - Filter log entries by severity (`INFO`, `WARN`, `ERROR`, `DEBUG`) and module (`BUILD_ENGINE`, `AGENT_HOST`, `CONTROL_PLANE`, `QA_RUNNER`).

### H. Release Approvals & Security Control
- **Manual Gatekeeper Approvals**:
  - Gate production deployments requiring explicit approval from DevOps engineers or system administrators.
  - Audit logs record approver ID, timestamp, and review comments.

---

## 3. Database Collection Schemas

| Collection Name | Key Fields | Description |
|---|---|---|
| `applications` | `_id`, `name`, `repo_url`, `is_private`, `repo_username`, `repo_token_or_password`, `created_at` | Stores application configurations and Git credentials. |
| `builds` | `_id`, `app_id`, `app_name`, `version`, `status`, `checksum_sha256`, `storage_path`, `created_at` | Tracks compiled release zips and cryptographic hashes. |
| `deployments` | `_id`, `app_id`, `build_id`, `agent_id`, `status`, `environment`, `deployed_at` | Tracks deployment assignments to edge agents. |
| `agents` | `_id`, `hostname`, `ip_address`, `status`, `cpu_percent`, `memory_percent`, `last_heartbeat` | Edge agent fleet registry and real-time hardware telemetry. |
| `logs` | `_id`, `level`, `source`, `message`, `timestamp` | System audit logs across all microservices. |
| `qa_runs` | `_id`, `build_id`, `status`, `passed_tests`, `total_tests`, `duration_ms` | Quality assurance test execution records. |
| `pipelines` | `_id`, `name`, `stages`, `active_build_id`, `status` | Orchestration pipelines connecting builds to deployments. |
| `approvals` | `_id`, `build_id`, `requested_by`, `status`, `reviewer_comments` | Sign-off workflow records for deployment gates. |

---

## 4. API Endpoints Reference

### Health & System
- `GET /api/health`: Returns API Gateway status, Python version, and MongoDB connection status.

### Applications
- `GET /api/applications`: List all configured applications.
- `POST /api/applications`: Create a new application (supports `is_private`, `repo_username`, `repo_token_or_password`).
- `GET /api/applications/{app_id}`: Fetch single application details.

### Builds & Artifacts
- `GET /api/builds`: List all compiled builds.
- `POST /api/builds`: Trigger a new build, compile `package.zip`, compute SHA256 checksum, and host at `/artifacts/`.
- `GET /artifacts/{path:path}`: Static file server serving compiled zip bundles.

### Deployments
- `GET /api/deployments`: List active and past deployments.
- `POST /api/deployments`: Assign a build deployment to target edge agents.

### Edge Agents
- `GET /api/agents`: List registered edge agents with real-time `psutil` metrics.
- `POST /api/agents/heartbeat`: Endpoint consumed by edge agents to post status and telemetry.

### Telemetry, Logs & QA
- `GET /api/logs`: Fetch system audit logs.
- `GET /api/qa-tests`: List QA test suite execution results.
- `GET /api/approvals`: List deployment approval requests.

---

## 5. Quick Start & Service Execution Commands

### Control Plane Backend (FastAPI)
```bash
cd services/api_gateway
uv run uvicorn main:app --port 8000 --reload
```

### Edge Agent Daemon (Python)
```bash
cd services/glitch_agent
uv run python main.py
```

### Frontend User Interface (React + Vite)
```bash
cd services/frontend
npm run dev
```

### Run Automated Unit & Integration Tests
```bash
cd services/api_gateway
uv run pytest
```
