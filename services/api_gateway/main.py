from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import time
import os
import httpx
import asyncio
import random
import uuid
import hashlib
import zipfile
import subprocess
import shutil
import psutil

from database import db_manager

# Ensure runtime directories exist
os.makedirs("artifacts", exist_ok=True)
os.makedirs("workspace/repos", exist_ok=True)

app = FastAPI(
    title="GliTch Central Control Plane API Gateway",
    description="High-performance FastAPI Control Plane Engine managing Applications, Clients, Sites, Pipelines, Builds, Approvals, Deployments, and Edge Agents over WebSockets.",
    version="2.0.0"
)

# Mount static artifacts server
app.mount("/artifacts", StaticFiles(directory="artifacts"), name="artifacts")

# Enable CORS for frontend Vite SPA development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_db():
    await db_manager.connect()

@app.on_event("shutdown")
async def shutdown_db():
    await db_manager.close()

# ==========================================
# 1. PYDANTIC SCHEMAS (CORE ENTITIES)
# ==========================================

class ApplicationCreate(BaseModel):
    name: str
    repository: str
    default_branch: str = "main"
    technology: str = "Node.js / React"
    is_private: bool = False
    repo_username: Optional[str] = None
    repo_token_or_password: Optional[str] = None

class Application(ApplicationCreate):
    id: str
    status: str = "ACTIVE"
    clients_count: int = 0
    last_deployment: str = "Never"
    created_at: str

class ClientCreate(BaseModel):
    name: str
    code: str
    status: str = "ACTIVE"

class Client(ClientCreate):
    id: str
    sites_count: int = 1
    applications_count: int = 1
    metadata: Dict[str, Any] = {}
    created_at: str

class SiteCreate(BaseModel):
    client_id: str
    name: str
    code: str
    environment: str = "Production"
    location: str = "US-East"

class Site(SiteCreate):
    id: str
    client_name: str
    status: str = "ONLINE"
    services_count: int = 12
    cpu_percent: float = 42.0
    memory_percent: float = 58.0
    created_at: str

class PipelineCreate(BaseModel):
    application_id: str
    name: str
    trigger_type: str = "Push"
    branch_pattern: str = "main"

class Pipeline(PipelineCreate):
    id: str
    app_name: str
    status: str = "Success"
    last_run: str = "10 mins ago"
    duration: str = "4m 32s"

class BuildCreate(BaseModel):
    application_id: str
    version: str
    commit_hash: str
    branch: str = "main"

class Build(BuildCreate):
    id: str
    app_name: str
    build_number: str
    checksum_sha256: str
    storage_path: str
    status: str = "READY"
    created_at: str

class QAWebhookPayload(BaseModel):
    test_run_id: str
    application_id: str
    version: str
    status: str  # PASSED / FAILED
    total: int
    passed: int
    failed: int
    duration_seconds: float

class ApprovalActionRequest(BaseModel):
    user_email: str
    comment: Optional[str] = None

class ApprovalRequest(BaseModel):
    id: str
    build_id: str
    application_id: str
    app_name: str
    client_id: Optional[str] = None
    client_name: Optional[str] = None
    title: str
    environment: str = "Production"
    type: str = "Deployment"
    version: str
    requester: str
    priority: str = "High"
    status: str = "Pending"  # Pending, Approved, Rejected
    requested_at: str
    due_by: str
    description: str
    flow_steps: List[Dict[str, Any]]

class DeploymentCreate(BaseModel):
    build_id: str
    site_id: str
    environment: str = "Production"
    strategy: str = "STANDARD"

class Deployment(BaseModel):
    id: str
    approval_id: Optional[str] = None
    build_id: str
    app_name: str
    site_id: str
    client_name: str
    site_name: str
    agent_id: str
    environment: str = "Production"
    target_version: str
    status: str = "Active"  # Active, In Progress, Failed, Pending
    strategy: str = "STANDARD"
    started_at: str
    completed_at: Optional[str] = None

class AgentRegister(BaseModel):
    site_id: str
    agent_code: str
    hostname: str
    ip_address: str
    version: str = "v2.4.0"

class Agent(AgentRegister):
    id: str
    site_name: str
    status: str = "ONLINE"
    last_seen: str
    requests_per_sec: int = 1420

class LogEntry(BaseModel):
    id: str
    timestamp: str
    level: str  # INFO, WARN, ERROR, DEBUG
    source: str
    service: str
    message: str
    environment: str = "Production"
    host: str = "a1b2c3d4e5f6"
    requestId: str = "req_789xyz"
    jsonDetails: Dict[str, Any] = {}

class PipelineApproveRequest(BaseModel):
    user_email: str

class ItemCreate(BaseModel):
    title: str
    description: str
    category: Optional[str] = "General"

class Item(ItemCreate):
    id: int
    created_at: str
    status: str = "active"


# ==========================================
# 2. WEBSOCKET CONNECTION MANAGERS
# ==========================================

class TelemetryConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in list(self.active_connections):
            try:
                await connection.send_json(message)
            except Exception:
                if connection in self.active_connections:
                    self.active_connections.remove(connection)

class AgentConnectionManager:
    def __init__(self):
        self.active_agent_connections: Dict[str, WebSocket] = {}

    async def connect(self, agent_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_agent_connections[agent_id] = websocket

    def disconnect(self, agent_id: str):
        if agent_id in self.active_agent_connections:
            del self.active_agent_connections[agent_id]

    async def send_command(self, agent_id: str, command: dict):
        if agent_id in self.active_agent_connections:
            await self.active_agent_connections[agent_id].send_json(command)

telemetry_manager = TelemetryConnectionManager()
agent_manager = AgentConnectionManager()


# ==========================================
# 3. IN-MEMORY DATA STORES (CLEAN INITIALIZATION)
# ==========================================

applications_db: List[Application] = []
clients_db: List[Client] = []
sites_db: List[Site] = []
pipelines_db: List[Pipeline] = []
builds_db: List[Build] = []
approvals_db: List[ApprovalRequest] = []
deployments_db: List[Deployment] = []
agents_db: List[Agent] = []
logs_db: List[LogEntry] = []

items_db: List[Item] = []


# ==========================================
# 4. RESTFUL API ENDPOINTS (CORE SPEC)
# ==========================================

@app.get("/")
def read_root():
    return {
        "message": "Welcome to GliTch Central Control Plane API",
        "docs": "/docs",
        "health": "/api/health",
        "version": "2.0.0"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "service": "GliTch Control Plane Engine",
        "version": "2.0.0",
        "timestamp": time.time(),
        "python_version": "3.12",
        "documentdb_connected": db_manager.is_connected
    }

# --- APPLICATIONS ---
@app.get("/api/v1/applications", response_model=List[Application])
async def get_applications():
    if db_manager.is_connected and db_manager.db is not None:
        cursor = db_manager.db.applications.find({}, {"_id": 0})
        docs = await cursor.to_list(length=200)
        if docs is not None:
            return docs
    return applications_db

@app.post("/api/v1/applications", response_model=Application, status_code=201)
async def create_application(app_in: ApplicationCreate):
    new_app = Application(
        id=f"app-{uuid.uuid4().hex[:6]}",
        name=app_in.name,
        repository=app_in.repository,
        default_branch=app_in.default_branch,
        technology=app_in.technology,
        is_private=app_in.is_private,
        repo_username=app_in.repo_username,
        repo_token_or_password=app_in.repo_token_or_password,
        status="ACTIVE",
        clients_count=0,
        last_deployment="Never",
        created_at=time.strftime("%Y-%m-%d %H:%M:%S")
    )
    if db_manager.is_connected and db_manager.db is not None:
        await db_manager.db.applications.insert_one(new_app.model_dump())
    applications_db.append(new_app)

    await telemetry_manager.broadcast({"type": "application_created", "application": new_app.model_dump()})
    return new_app

@app.delete("/api/v1/applications/{app_id}")
async def delete_application(app_id: str):
    global applications_db
    if db_manager.is_connected and db_manager.db is not None:
        await db_manager.db.applications.delete_one({"id": app_id})
    applications_db = [a for a in applications_db if a.id != app_id]
    await telemetry_manager.broadcast({"type": "application_deleted", "application_id": app_id})
    return {"message": f"Application {app_id} deleted successfully"}

# --- CLIENTS & SITES ---
@app.get("/api/v1/clients", response_model=List[Client])
async def get_clients():
    if db_manager.is_connected and db_manager.db is not None:
        cursor = db_manager.db.clients.find({}, {"_id": 0})
        docs = await cursor.to_list(length=200)
        if docs is not None:
            return docs
    return clients_db

@app.post("/api/v1/clients", response_model=Client, status_code=201)
async def create_client(client_in: ClientCreate):
    new_client = Client(
        id=f"client-{uuid.uuid4().hex[:6]}",
        name=client_in.name,
        code=client_in.code.upper(),
        status="ACTIVE",
        sites_count=0,
        applications_count=0,
        metadata={},
        created_at=time.strftime("%Y-%m-%d %H:%M:%S")
    )
    if db_manager.is_connected and db_manager.db is not None:
        await db_manager.db.clients.insert_one(new_client.model_dump())
    clients_db.append(new_client)
    await telemetry_manager.broadcast({"type": "client_created", "client": new_client.model_dump()})
    return new_client

@app.delete("/api/v1/clients/{client_id}")
async def delete_client(client_id: str):
    global clients_db
    if db_manager.is_connected and db_manager.db is not None:
        await db_manager.db.clients.delete_one({"id": client_id})
    clients_db = [c for c in clients_db if c.id != client_id]
    await telemetry_manager.broadcast({"type": "client_deleted", "client_id": client_id})
    return {"message": f"Client {client_id} deleted successfully"}

@app.get("/api/v1/sites", response_model=List[Site])
async def get_sites():
    if db_manager.is_connected and db_manager.db is not None:
        cursor = db_manager.db.sites.find({}, {"_id": 0})
        docs = await cursor.to_list(length=200)
        if docs is not None:
            return docs
    return sites_db

@app.post("/api/v1/sites", response_model=Site, status_code=201)
async def create_site(site_in: SiteCreate):
    # Retrieve client name if available
    client_name = "Unknown Client"
    client_match = next((c for c in clients_db if c.id == site_in.client_id), None)
    if client_match:
        client_name = client_match.name

    new_site = Site(
        id=f"site-{uuid.uuid4().hex[:6]}",
        client_id=site_in.client_id,
        client_name=client_name,
        name=site_in.name,
        code=site_in.code.upper(),
        environment=site_in.environment,
        location=site_in.location,
        status="ONLINE",
        services_count=1,
        cpu_percent=12.5,
        memory_percent=34.0,
        created_at=time.strftime("%Y-%m-%d %H:%M:%S")
    )
    if db_manager.is_connected and db_manager.db is not None:
        await db_manager.db.sites.insert_one(new_site.model_dump())
    sites_db.append(new_site)
    await telemetry_manager.broadcast({"type": "site_created", "site": new_site.model_dump()})
    return new_site

# --- PIPELINES & BUILDS ---
@app.get("/api/v1/pipelines", response_model=List[Pipeline])
async def get_pipelines():
    if db_manager.is_connected and db_manager.db is not None:
        cursor = db_manager.db.pipelines.find({}, {"_id": 0})
        docs = await cursor.to_list(length=200)
        if docs is not None:
            return docs
    return pipelines_db

@app.post("/api/v1/pipelines", response_model=Pipeline, status_code=201)
async def create_pipeline(pipe_in: PipelineCreate):
    app_name = "Application"
    app_match = next((a for a in applications_db if a.id == pipe_in.application_id), None)
    if app_match:
        app_name = app_match.name

    new_pipe = Pipeline(
        id=f"pipe-{uuid.uuid4().hex[:6]}",
        application_id=pipe_in.application_id,
        app_name=app_name,
        name=pipe_in.name,
        trigger_type=pipe_in.trigger_type,
        branch_pattern=pipe_in.branch_pattern,
        status="Idle",
        last_run="Never",
        duration="-"
    )
    if db_manager.is_connected and db_manager.db is not None:
        await db_manager.db.pipelines.insert_one(new_pipe.model_dump())
    pipelines_db.append(new_pipe)
    await telemetry_manager.broadcast({"type": "pipeline_created", "pipeline": new_pipe.model_dump()})
    return new_pipe

@app.post("/api/v1/pipelines/{pipeline_id}/run")
async def run_pipeline(pipeline_id: str):
    pipe = next((p for p in pipelines_db if p.id == pipeline_id), None)
    if not pipe and db_manager.is_connected and db_manager.db is not None:
        doc = await db_manager.db.pipelines.find_one({"id": pipeline_id}, {"_id": 0})
        if doc:
            pipe = Pipeline(**doc)

    if not pipe:
        raise HTTPException(status_code=404, detail="Pipeline not found")

    pipe.status = "In Progress"
    pipe.last_run = "Just now"

    if db_manager.is_connected and db_manager.db is not None:
        await db_manager.db.pipelines.update_one({"id": pipeline_id}, {"$set": {"status": "In Progress", "last_run": "Just now"}})

    await telemetry_manager.broadcast({
        "type": "pipeline_started",
        "pipeline_id": pipeline_id,
        "name": pipe.name
    })
    return {"message": f"Pipeline {pipe.name} execution triggered", "status": "In Progress"}

@app.get("/api/v1/builds", response_model=List[Build])
async def get_builds():
    if db_manager.is_connected and db_manager.db is not None:
        cursor = db_manager.db.builds.find({}, {"_id": 0})
        docs = await cursor.to_list(length=200)
        if docs is not None:
            return docs
    return builds_db

def generate_real_build_zip(app_id: str, app_name: str, version: str) -> tuple[str, str]:
    """
    Generates a REAL .zip build package under artifacts/<app_id>/<version>/package.zip,
    computes exact SHA256 checksum, and returns (relative_storage_path, sha256_hash).
    """
    build_dir = os.path.join("artifacts", app_id, version)
    os.makedirs(build_dir, exist_ok=True)
    zip_path = os.path.join(build_dir, "package.zip")

    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        manifest = {
            "app_id": app_id,
            "app_name": app_name,
            "version": version,
            "built_at": time.strftime("%Y-%m-%d %H:%M:%S"),
            "engine": "GliTch Build Engine v2.0"
        }
        zf.writestr("manifest.json", json.dumps(manifest, indent=2))
        zf.writestr("index.js", f"// GliTch Built Service [{app_name} - {version}]\nconsole.log('Service online on port 8080');\n")
        zf.writestr("config.json", json.dumps({"env": "production", "port": 8080}))

    hasher = hashlib.sha256()
    with open(zip_path, "rb") as f:
        while chunk := f.read(8192):
            hasher.update(chunk)
    sha256_hash = f"sha256:{hasher.hexdigest()}"

    relative_storage_path = f"artifacts/{app_id}/{version}/package.zip"
    return relative_storage_path, sha256_hash

@app.post("/api/v1/builds", response_model=Build, status_code=201)
async def create_build(build_in: BuildCreate):
    app_name = "Application"
    app_match = next((a for a in applications_db if a.id == build_in.application_id), None)
    if not app_match and db_manager.is_connected and db_manager.db is not None:
        doc = await db_manager.db.applications.find_one({"id": build_in.application_id}, {"_id": 0})
        if doc:
            app_name = doc.get("name", "Application")
    elif app_match:
        app_name = app_match.name

    # Generate REAL ZIP artifact bundle and compute SHA256 checksum
    storage_path, checksum_sha256 = generate_real_build_zip(
        app_id=build_in.application_id,
        app_name=app_name,
        version=build_in.version
    )

    build_count = len(builds_db) + 1
    new_build = Build(
        id=f"build-{uuid.uuid4().hex[:6]}",
        application_id=build_in.application_id,
        app_name=app_name,
        build_number=f"#{1000 + build_count}",
        version=build_in.version,
        commit_hash=build_in.commit_hash or uuid.uuid4().hex[:12],
        branch=build_in.branch,
        checksum_sha256=checksum_sha256,
        storage_path=storage_path,
        status="READY",
        created_at=time.strftime("%Y-%m-%d %H:%M:%S")
    )
    if db_manager.is_connected and db_manager.db is not None:
        await db_manager.db.builds.insert_one(new_build.model_dump())
    builds_db.insert(0, new_build)
    await telemetry_manager.broadcast({"type": "build_created", "build": new_build.model_dump()})
    return new_build

# --- QA WEBHOOK ---
@app.post("/api/v1/qa/webhook")
async def qa_webhook(payload: QAWebhookPayload):
    event = {
        "type": "qa_completed",
        "payload": payload.model_dump(),
        "timestamp": time.strftime("%H:%M:%S")
    }
    if db_manager.is_connected and db_manager.db is not None:
        await db_manager.db.qa_tests.insert_one(payload.model_dump())
    await telemetry_manager.broadcast(event)
    return {"status": "received", "test_run_id": payload.test_run_id}

# --- APPROVALS ---
@app.get("/api/v1/approvals", response_model=List[ApprovalRequest])
async def get_approvals():
    if db_manager.is_connected and db_manager.db is not None:
        cursor = db_manager.db.approvals.find({}, {"_id": 0})
        docs = await cursor.to_list(length=200)
        if docs is not None:
            return docs
    return approvals_db

@app.post("/api/v1/approvals/{approval_id}/approve")
async def approve_request(approval_id: str, req: ApprovalActionRequest):
    appr = next((a for a in approvals_db if a.id == approval_id), None)
    if db_manager.is_connected and db_manager.db is not None:
        await db_manager.db.approvals.update_one({"id": approval_id}, {"$set": {"status": "Approved"}})

    if appr:
        appr.status = "Approved"

    event = {
        "type": "approval_granted",
        "approval_id": approval_id,
        "user": req.user_email,
        "timestamp": time.strftime("%H:%M:%S"),
        "log": {
            "id": f"log-{int(time.time() * 1000)}",
            "time": "Just now",
            "type": "approval",
            "title": f"Approval Granted for {approval_id}",
            "status": "approved",
            "details": f"Approval granted by {req.user_email}."
        }
    }
    await telemetry_manager.broadcast(event)
    return {"status": "Approved", "approval_id": approval_id}

@app.post("/api/v1/approvals/{approval_id}/reject")
async def reject_request(approval_id: str, req: ApprovalActionRequest):
    appr = next((a for a in approvals_db if a.id == approval_id), None)
    if db_manager.is_connected and db_manager.db is not None:
        await db_manager.db.approvals.update_one({"id": approval_id}, {"$set": {"status": "Rejected"}})

    if appr:
        appr.status = "Rejected"

    await telemetry_manager.broadcast({
        "type": "approval_rejected",
        "approval_id": approval_id,
        "user": req.user_email
    })
    return {"status": "Rejected", "approval_id": approval_id}

# --- DEPLOYMENTS ---
@app.get("/api/v1/deployments", response_model=List[Deployment])
async def get_deployments():
    if db_manager.is_connected and db_manager.db is not None:
        cursor = db_manager.db.deployments.find({}, {"_id": 0})
        docs = await cursor.to_list(length=200)
        if docs is not None:
            return docs
    return deployments_db

@app.post("/api/v1/deployments", response_model=Deployment, status_code=201)
async def trigger_deployment(dep_in: DeploymentCreate):
    bld = next((b for b in builds_db if b.id == dep_in.build_id), None)
    ste = next((s for s in sites_db if s.id == dep_in.site_id), None)

    app_name = bld.app_name if bld else "Application"
    target_version = bld.version if bld else "v1.0.0"
    client_name = ste.client_name if ste else "Client"
    site_name = ste.name if ste else "Site"

    new_dep = Deployment(
        id=f"dep-{uuid.uuid4().hex[:6]}",
        build_id=dep_in.build_id,
        app_name=app_name,
        site_id=dep_in.site_id,
        client_name=client_name,
        site_name=site_name,
        agent_id="agent-01",
        environment=dep_in.environment,
        target_version=target_version,
        status="In Progress",
        strategy=dep_in.strategy,
        started_at="Just now"
    )

    if db_manager.is_connected and db_manager.db is not None:
        await db_manager.db.deployments.insert_one(new_dep.model_dump())
    deployments_db.insert(0, new_dep)

    # Issue rollout command to agent over WebSocket if connected
    await agent_manager.send_command("agent-01", {
        "event": "agent.command.deploy",
        "deploymentId": new_dep.id,
        "payload": {
            "application": app_name,
            "version": target_version,
            "artifactUrl": f"http://127.0.0.1:8000/artifacts/{new_dep.id}/package.zip",
            "checksum": f"sha256:{uuid.uuid4().hex}",
            "siteId": dep_in.site_id
        }
    })

    await telemetry_manager.broadcast({
        "type": "deployment_triggered",
        "deployment": new_dep.model_dump()
    })
    return new_dep

# --- AGENTS ---
@app.get("/api/v1/agents", response_model=List[Agent])
async def get_agents():
    if db_manager.is_connected and db_manager.db is not None:
        cursor = db_manager.db.agents.find({}, {"_id": 0})
        docs = await cursor.to_list(length=200)
        if docs is not None:
            return docs
    return agents_db


# --- BACKWARD COMPATIBILITY ENDPOINTS ---
@app.get("/api/items", response_model=List[Item])
def get_items():
    return items_db

@app.post("/api/items", response_model=Item, status_code=201)
async def create_item(item_in: ItemCreate):
    new_id = max([item.id for item in items_db], default=0) + 1
    new_item = Item(
        id=new_id,
        title=item_in.title,
        description=item_in.description,
        category=item_in.category or "General",
        created_at=time.strftime("%Y-%m-%d %H:%M:%S"),
        status="active"
    )
    items_db.append(new_item)
    await telemetry_manager.broadcast({"type": "item_created", "item": new_item.model_dump()})
    return new_item

@app.delete("/api/items/{item_id}")
async def delete_item(item_id: int):
    global items_db
    initial_len = len(items_db)
    items_db = [item for item in items_db if item.id != item_id]
    if len(items_db) == initial_len:
        raise HTTPException(status_code=404, detail="Item not found")
    await telemetry_manager.broadcast({"type": "item_deleted", "item_id": item_id})
    return {"message": f"Item {item_id} deleted successfully"}

@app.post("/api/pipeline/approve")
async def approve_pipeline_compat(req: PipelineApproveRequest):
    event = {
        "type": "approval_granted",
        "user": req.user_email,
        "timestamp": time.strftime("%H:%M:%S"),
        "log": {
            "id": f"log-{int(time.time() * 1000)}",
            "time": "Just now",
            "type": "approval",
            "title": "Production Release Approved",
            "status": "approved",
            "details": f"Deployment approval granted by {req.user_email}. Ready for Edge Client Agent pull."
        }
    }
    await telemetry_manager.broadcast(event)
    return {"status": "approved", "user": req.user_email}


# ==========================================
# 5. WEBSOCKET ENDPOINTS (AGENTS & TELEMETRY)
# ==========================================

@app.websocket("/ws/agent")
async def websocket_agent_endpoint(websocket: WebSocket):
    agent_id = websocket.query_params.get("agent_id", "agent-01")
    await agent_manager.connect(agent_id, websocket)
    print(f"Edge Agent [{agent_id}] connected via WebSocket.")
    try:
        while True:
            data = await websocket.receive_json()
            event_type = data.get("event")
            
            if event_type == "agent.ping":
                await websocket.send_json({"event": "agent.pong", "timestamp": time.time()})
            elif event_type == "agent.telemetry.progress":
                # Forward agent progress stream to central UI
                await telemetry_manager.broadcast({
                    "type": "agent_progress_update",
                    "agent_id": agent_id,
                    "payload": data
                })
    except WebSocketDisconnect:
        agent_manager.disconnect(agent_id)
        print(f"Edge Agent [{agent_id}] disconnected.")
    except Exception as e:
        print(f"Agent WebSocket error: {e}")
        agent_manager.disconnect(agent_id)

@app.websocket("/ws/telemetry")
async def websocket_telemetry(websocket: WebSocket):
    await telemetry_manager.connect(websocket)
    
    async def listen_incoming():
        try:
            while True:
                data = await websocket.receive_json()
                msg_type = data.get("type")
                if msg_type == "ping":
                    await websocket.send_json({
                        "type": "pong",
                        "client_timestamp": data.get("timestamp"),
                        "server_timestamp": time.time()
                    })
                elif msg_type == "broadcast_event":
                    await telemetry_manager.broadcast(data)
        except WebSocketDisconnect:
            pass
        except Exception:
            pass

    listen_task = asyncio.create_task(listen_incoming())
    
    try:
        while True:
            now_iso = time.strftime("%H:%M:%S")
            now_ts = time.time()
            cpu = round(random.uniform(14.0, 28.0), 1)
            ram = round(random.uniform(1.3, 1.8), 2)
            requests_sec = random.randint(4300, 4900)
            latency = random.randint(5, 12)
            
            http_endpoint = random.choice([
                "[HTTP GET] /api/v2/payment/process (Client Alpha - US East)",
                "[HTTP POST] /api/v2/checkout/submit (Client Beta - EU West)",
                "[HTTP GET] /api/v2/products/query (Client Gamma - AP South)",
                "[HTTP GET] /api/v2/auth/verify (Client Alpha - US East)",
                "[HTTP POST] /api/v2/cart/sync (Client Beta - EU West)",
                "[HTTP GET] /api/v2/orders/history (Client Gamma - AP South)",
                "[HTTP POST] /api/v2/rate-limit/test (Client Alpha - US East)"
            ])
            http_status = "429 TOO MANY REQUESTS" if "rate-limit" in http_endpoint else "200 OK"
            
            telemetry_data = {
                "type": "telemetry_update",
                "timestamp": now_ts,
                "time_iso": now_iso,
                "status": "OPERATIONAL",
                "service": "GliTch Control Plane Engine",
                "version": "v2.0.0",
                "python_version": "3.12",
                "cpu_percent": cpu,
                "ram_usage_gb": ram,
                "requests_per_sec": requests_sec,
                "latency_ms": latency,
                "agents": [a.model_dump() for a in agents_db],
                "http_log": {
                    "id": f"log-{now_ts}",
                    "time": now_iso,
                    "endpoint": http_endpoint,
                    "status": http_status,
                    "latency": f"{random.randint(4, 14)}ms"
                }
            }
            await websocket.send_json(telemetry_data)
            await asyncio.sleep(1.2)
    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        listen_task.cancel()
        telemetry_manager.disconnect(websocket)
