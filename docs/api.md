# REST API Reference 📡

The GliTch background daemon exposes a local HTTP JSON API listening on `http://127.0.0.1:4780`.

---

## Base URL
```
http://127.0.0.1:4780
```

---

## Endpoints

### 1. Health Check
* **`GET /api/health`**
* **Description**: Returns daemon status, uptime, and database engine confirmation.
* **Response**:
  ```json
  {
    "status": "healthy",
    "service": "glitch-daemon",
    "version": "0.1.0",
    "uptime_seconds": 124.5,
    "db_engine": "sqlite"
  }
  ```

---

### 2. Database Status
* **`GET /api/db/status`**
* **Description**: Returns SQLite integrity check status and row counts across all tables.
* **Response**:
  ```json
  {
    "status": "online",
    "engine": "sqlite",
    "wal_mode": true,
    "integrity": "ok",
    "table_counts": {
      "users": 2,
      "incidents": 3,
      "services": 4,
      "pipelines": 3,
      "copilot_chats": 1
    }
  }
  ```

---

### 3. Host System Telemetry
* **`GET /api/metrics`**
* **Description**: Returns live CPU, memory, disk, and OS statistics.
* **Response**:
  ```json
  {
    "hostname": "devops-station",
    "platform": "linux",
    "arch": "x64",
    "uptime_seconds": 86400,
    "cpu_percent": 14.8,
    "memory": {
      "used_percent": 42.1,
      "used_bytes": 7080000000,
      "total_bytes": 16800000000
    },
    "disk": {
      "used_percent": 58.2,
      "used_bytes": 240000000000,
      "total_bytes": 412000000000
    },
    "load_average": [0.45, 0.52, 0.61],
    "updated_at": "2026-10-30T03:30:00Z"
  }
  ```

---

### 4. Operator Authentication
* **`POST /api/auth/login`**
* **Description**: Authenticates operator credentials and issues an active session token.
* **Request Body**:
  ```json
  {
    "username": "admin",
    "password": "admin"
  }
  ```
* **Response (Success `200 OK`)**:
  ```json
  {
    "token": "a1b2c3d4e5...",
    "user": {
      "id": "usr_admin",
      "username": "admin",
      "role": "admin"
    }
  }
  ```

---

### 5. SRE Incident Triage
* **`GET /api/incidents`**
  * Returns list of all active and resolved incidents.
* **`POST /api/incidents/:id/resolve`**
  * Marks the specified incident as resolved.

---

### 6. Copilot Chat Persistence
* **`GET /api/copilot/chats`**
  * Retrieves persistent chat history with the AI DevOps copilot.
* **`POST /api/copilot/chats`**
  * Logs a user query or assistant response into SQLite.
  ```json
  {
    "role": "user",
    "content": "Check cluster pod memory usage",
    "playbook_executed": "kubectl top pods"
  }
  ```
