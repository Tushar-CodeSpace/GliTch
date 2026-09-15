from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import time
import os
import httpx
import asyncio
import random
import uuid

from database import db_manager

app = FastAPI(
    title="GliTch Central Control Plane API Gateway",
    description="High-performance FastAPI Control Plane Engine managing Applications, Clients, Sites, Pipelines, Builds, Approvals, Deployments, and Edge Agents over WebSockets.",
    version="2.0.0"
)

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

class Application(ApplicationCreate):
    id: str
    status: str = "ACTIVE"
    clients_count: int = 1
    last_deployment: str = "Just now"
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
# 3. IN-MEMORY DATA STORES (PRE-POPULATED)
# ==========================================

applications_db: List[Application] = [
    Application(id="app-001", name="Ecom Pro", repository="github.com/company/ecom-pro", default_branch="main", technology="Node.js / React", status="ACTIVE", clients_count=3, last_deployment="10 mins ago", created_at="2026-01-10 10:00:00"),
    Application(id="app-002", name="LogTrack", repository="github.com/company/logtrack", default_branch="develop", technology="Python / FastAPI", status="ACTIVE", clients_count=2, last_deployment="2 hours ago", created_at="2026-02-15 11:30:00"),
    Application(id="app-003", name="RetailApp", repository="github.com/company/retail-app", default_branch="main", technology="Go / React", status="ACTIVE", clients_count=2, last_deployment="1 day ago", created_at="2026-03-01 09:15:00"),
    Application(id="app-004", name="PharmaSuite", repository="github.com/company/pharmasuite", default_branch="main", technology="Java / Spring Boot", status="ACTIVE", clients_count=1, last_deployment="3 days ago", created_at="2026-04-12 14:20:00")
]

clients_db: List[Client] = [
    Client(id="client-001", name="BlueDart", code="BLUEDART", status="ACTIVE", sites_count=4, applications_count=2, metadata={"region": "APAC"}, created_at="2026-01-01 08:00:00"),
    Client(id="client-002", name="MedPlus", code="MEDPLUS", status="ACTIVE", sites_count=3, applications_count=3, metadata={"region": "India"}, created_at="2026-01-15 10:00:00"),
    Client(id="client-003", name="RetailMax", code="RETAILMAX", status="ACTIVE", sites_count=2, applications_count=2, metadata={"region": "US"}, created_at="2026-02-01 12:00:00"),
    Client(id="client-004", name="EduCare", code="EDUCARE", status="ACTIVE", sites_count=1, applications_count=1, metadata={"region": "Global"}, created_at="2026-03-10 16:45:00")
]

sites_db: List[Site] = [
    Site(id="site-001", client_id="client-001", client_name="BlueDart", name="BLR-DC01", code="BLR-01", environment="Production", location="Bangalore, IN", status="ONLINE", services_count=12, cpu_percent=42.0, memory_percent=58.0, created_at="2026-01-02 09:00:00"),
    Site(id="site-002", client_id="client-001", client_name="BlueDart", name="MUM-DC01", code="MUM-01", environment="Staging", location="Mumbai, IN", status="ONLINE", services_count=8, cpu_percent=28.5, memory_percent=44.0, created_at="2026-01-05 14:00:00"),
    Site(id="site-003", client_id="client-002", client_name="MedPlus", name="HYD-DC01", code="HYD-01", environment="Production", location="Hyderabad, IN", status="ONLINE", services_count=15, cpu_percent=65.2, memory_percent=72.1, created_at="2026-01-20 11:30:00"),
    Site(id="site-004", client_id="client-003", client_name="RetailMax", name="US-EAST01", code="USE-01", environment="Production", location="Virginia, US", status="ONLINE", services_count=20, cpu_percent=51.0, memory_percent=62.4, created_at="2026-02-05 15:10:00")
]

pipelines_db: List[Pipeline] = [
    Pipeline(id="pipe-001", application_id="app-001", app_name="Ecom Pro", name="Ecom Pro CI/CD", trigger_type="Push", branch_pattern="main", status="Success", last_run="10 mins ago", duration="4m 32s"),
    Pipeline(id="pipe-002", application_id="app-002", app_name="LogTrack", name="LogTrack Pipeline", trigger_type="Pull Request", branch_pattern="develop", status="Failed", last_run="1 hour ago", duration="6m 12s"),
    Pipeline(id="pipe-003", application_id="app-003", app_name="RetailApp", name="RetailApp Release", trigger_type="Schedule", branch_pattern="release/*", status="Success", last_run="1 day ago", duration="5m 14s")
]

builds_db: List[Build] = [
    Build(id="build-1024", application_id="app-001", app_name="Ecom Pro", build_number="#1024", version="v2.4.1", commit_hash="a1b2c3d4e5f6", branch="main", checksum_sha256="sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", storage_path="artifacts/ecom-pro/v2.4.1/ecom-pro-v2.4.1.zip", status="READY", created_at="2026-09-12 10:20:00"),
    Build(id="build-1023", application_id="app-002", app_name="LogTrack", build_number="#1023", version="v1.8.0", commit_hash="f4e5d6c7b8a9", branch="develop", checksum_sha256="sha256:8f4e2b1c9a0d3e5f7b8a9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f", storage_path="artifacts/logtrack/v1.8.0/logtrack-v1.8.0.zip", status="READY", created_at="2026-09-12 09:10:00")
]

approvals_db: List[ApprovalRequest] = [
    ApprovalRequest(
        id="#1084",
        build_id="build-1024",
        application_id="app-001",
        app_name="Ecom Pro",
        client_id="client-001",
        client_name="BlueDart",
        title="Deploy v2.4.1 to Production",
        environment="Production",
        type="Deployment",
        version="v2.4.1",
        requester="johndoe",
        priority="High",
        status="Pending",
        requested_at="12 Sep 2026 10:24 AM",
        due_by="12 Sep 2026, 02:00 PM",
        description="This release includes performance improvements, bug fixes, and new features for the checkout flow.",
        flow_steps=[
            {"title": "Requested by johndoe", "status": "completed", "subtext": "12 Sep 2026, 10:24 AM"},
            {"title": "Pending approval (sachin)", "status": "current", "subtext": "Waiting for review"},
            {"title": "Pending approval (asfak)", "status": "pending"},
            {"title": "Deploy to Production", "status": "pending"}
        ]
    )
]

deployments_db: List[Deployment] = [
    Deployment(id="dep-9042", approval_id="#1084", build_id="build-1024", app_name="Ecom Pro", site_id="site-001", client_name="BlueDart", site_name="BLR-DC01", agent_id="agent-01", environment="Production", target_version="v2.4.1", status="Active", strategy="STANDARD", started_at="10 mins ago", completed_at="8 mins ago")
]

agents_db: List[Agent] = [
    Agent(id="agent-01", site_id="site-001", site_name="Client Alpha (US-East)", agent_code="agent-01", hostname="edge-blr-01.internal", ip_address="10.0.4.12", version="v2.4.0", status="ONLINE", last_seen="Just now", requests_per_sec=1420),
    Agent(id="agent-02", site_id="site-002", site_name="Client Beta (EU-West)", agent_code="agent-02", hostname="edge-mum-01.internal", ip_address="10.2.1.88", version="v2.4.0", status="ONLINE", last_seen="Just now", requests_per_sec=980),
    Agent(id="agent-03", site_id="site-003", site_name="Client Gamma (AP-South)", agent_code="agent-03", hostname="edge-hyd-01.internal", ip_address="10.5.12.3", version="v2.4.0", status="ONLINE", last_seen="Just now", requests_per_sec=2150)
]

items_db: List[Item] = [
    Item(id=1, title="FastAPI + uv Backend", description="High-performance Python backend server managed via uv package manager.", category="Backend", created_at=time.strftime("%Y-%m-%d %H:%M:%S"), status="active"),
    Item(id=2, title="React + Vite Frontend", description="Modern dark mode glassmorphism UI with responsive design & micro-interactions.", category="Frontend", created_at=time.strftime("%Y-%m-%d %H:%M:%S"), status="active")
]


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
        docs = await cursor.to_list(length=100)
        if docs:
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
        status="ACTIVE",
        created_at=time.strftime("%Y-%m-%d %H:%M:%S")
    )
    if db_manager.is_connected and db_manager.db is not None:
        await db_manager.db.applications.insert_one(new_app.model_dump())
    else:
        applications_db.append(new_app)

    await telemetry_manager.broadcast({"type": "application_created", "application": new_app.model_dump()})
    return new_app

@app.delete("/api/v1/applications/{app_id}")
async def delete_application(app_id: str):
    global applications_db
    applications_db = [a for a in applications_db if a.id != app_id]
    return {"message": f"Application {app_id} deleted successfully"}

# --- CLIENTS & SITES ---
@app.get("/api/v1/clients", response_model=List[Client])
def get_clients():
    return clients_db

@app.post("/api/v1/clients", response_model=Client, status_code=201)
async def create_client(client_in: ClientCreate):
    new_client = Client(
        id=f"client-{uuid.uuid4().hex[:6]}",
        name=client_in.name,
        code=client_in.code.upper(),
        status="ACTIVE",
        created_at=time.strftime("%Y-%m-%d %H:%M:%S")
    )
    clients_db.append(new_client)
    return new_client

@app.get("/api/v1/sites", response_model=List[Site])
def get_sites():
    return sites_db

# --- PIPELINES & BUILDS ---
@app.get("/api/v1/pipelines", response_model=List[Pipeline])
def get_pipelines():
    return pipelines_db

@app.post("/api/v1/pipelines/{pipeline_id}/run")
async def run_pipeline(pipeline_id: str):
    pipe = next((p for p in pipelines_db if p.id == pipeline_id), None)
    if not pipe:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    pipe.status = "In Progress"
    pipe.last_run = "Just now"
    await telemetry_manager.broadcast({
        "type": "pipeline_started",
        "pipeline_id": pipeline_id,
        "name": pipe.name
    })
    return {"message": f"Pipeline {pipe.name} execution triggered", "status": "In Progress"}

@app.get("/api/v1/builds", response_model=List[Build])
def get_builds():
    return builds_db

# --- QA WEBHOOK ---
@app.post("/api/v1/qa/webhook")
async def qa_webhook(payload: QAWebhookPayload):
    event = {
        "type": "qa_completed",
        "payload": payload.model_dump(),
        "timestamp": time.strftime("%H:%M:%S")
    }
    await telemetry_manager.broadcast(event)
    return {"status": "received", "test_run_id": payload.test_run_id}

# --- APPROVALS ---
@app.get("/api/v1/approvals", response_model=List[ApprovalRequest])
def get_approvals():
    return approvals_db

@app.post("/api/v1/approvals/{approval_id}/approve")
async def approve_request(approval_id: str, req: ApprovalActionRequest):
    appr = next((a for a in approvals_db if a.id == approval_id), None)
    if not appr:
        raise HTTPException(status_code=404, detail="Approval request not found")
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
            "title": f"Approval Granted for {appr.title}",
            "status": "approved",
            "details": f"Approval granted by {req.user_email}."
        }
    }
    await telemetry_manager.broadcast(event)
    return {"status": "Approved", "approval_id": approval_id}

@app.post("/api/v1/approvals/{approval_id}/reject")
async def reject_request(approval_id: str, req: ApprovalActionRequest):
    appr = next((a for a in approvals_db if a.id == approval_id), None)
    if not appr:
        raise HTTPException(status_code=404, detail="Approval request not found")
    appr.status = "Rejected"
    await telemetry_manager.broadcast({
        "type": "approval_rejected",
        "approval_id": approval_id,
        "user": req.user_email
    })
    return {"status": "Rejected", "approval_id": approval_id}

# --- DEPLOYMENTS ---
@app.get("/api/v1/deployments", response_model=List[Deployment])
def get_deployments():
    return deployments_db

@app.post("/api/v1/deployments", response_model=Deployment, status_code=201)
async def trigger_deployment(dep_in: DeploymentCreate):
    bld = next((b for b in builds_db if b.id == dep_in.build_id), builds_db[0])
    ste = next((s for s in sites_db if s.id == dep_in.site_id), sites_db[0])
    
    new_dep = Deployment(
        id=f"dep-{uuid.uuid4().hex[:6]}",
        build_id=bld.id,
        app_name=bld.app_name,
        site_id=ste.id,
        client_name=ste.client_name,
        site_name=ste.name,
        agent_id="agent-01",
        environment=dep_in.environment,
        target_version=bld.version,
        status="In Progress",
        strategy=dep_in.strategy,
        started_at="Just now"
    )
    deployments_db.insert(0, new_dep)

    # Issue rollout command to agent over WebSocket if connected
    await agent_manager.send_command("agent-01", {
        "event": "agent.command.deploy",
        "deploymentId": new_dep.id,
        "payload": {
            "application": bld.app_name,
            "version": bld.version,
            "artifactUrl": f"http://127.0.0.1:8000/{bld.storage_path}",
            "checksum": bld.checksum_sha256,
            "siteId": ste.code
        }
    })

    await telemetry_manager.broadcast({
        "type": "deployment_triggered",
        "deployment": new_dep.model_dump()
    })
    return new_dep

@app.post("/api/v1/deployments/{dep_id}/rollback")
async def rollback_deployment(dep_id: str):
    dep = next((d for d in deployments_db if d.id == dep_id), None)
    if not dep:
        raise HTTPException(status_code=404, detail="Deployment not found")
    dep.status = "In Progress"
    await telemetry_manager.broadcast({
        "type": "deployment_rollback_started",
        "deployment_id": dep_id
    })
    return {"message": f"Rollback initiated for deployment {dep_id}", "status": "In Progress"}

# --- AGENTS ---
@app.get("/api/v1/agents", response_model=List[Agent])
def get_agents():
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
