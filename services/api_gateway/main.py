from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import time
import os
import httpx
import asyncio
import random

app = FastAPI(
    title="GliTch API Gateway",
    description="FastAPI API Gateway for GliTch React application",
    version="1.0.0"
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ItemCreate(BaseModel):
    title: str
    description: str
    category: Optional[str] = "General"

class Item(ItemCreate):
    id: int
    created_at: str
    status: str = "active"

class ChatRequest(BaseModel):
    prompt: str

class PipelineApproveRequest(BaseModel):
    user_email: str

# Scraper Agent URL (configurable via env var for local dev vs Docker network)
SCRAPER_AGENT_URL = os.getenv("SCRAPER_AGENT_URL", "http://127.0.0.1:8001")

# WebSocket Connection Manager
class ConnectionManager:
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

manager = ConnectionManager()

# In-memory storage for basic application demonstration
items_db: List[Item] = [
    Item(
        id=1,
        title="FastAPI + uv Backend",
        description="High-performance Python backend server managed via uv package manager.",
        category="Backend",
        created_at=time.strftime("%Y-%m-%d %H:%M:%S"),
        status="active"
    ),
    Item(
        id=2,
        title="React + Vite Frontend",
        description="Modern dark mode glassmorphism UI with responsive design & micro-interactions.",
        category="Frontend",
        created_at=time.strftime("%Y-%m-%d %H:%M:%S"),
        status="active"
    ),
    Item(
        id=3,
        title="Playwright Scraper Agent",
        description="Automated web scraping microservice with ChatGPT textbox sensing.",
        category="Architecture",
        created_at=time.strftime("%Y-%m-%d %H:%M:%S"),
        status="active"
    )
]

@app.get("/")
def read_root():
    return {
        "message": "Welcome to GliTch API",
        "docs": "/docs",
        "health": "/api/health",
        "items": "/api/items"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "service": "GliTch FastAPI Engine",
        "version": "1.0.0",
        "timestamp": time.time(),
        "python_version": "3.12"
    }

@app.websocket("/ws/telemetry")
async def websocket_telemetry(websocket: WebSocket):
    await manager.connect(websocket)
    
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
                    await manager.broadcast(data)
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
                "service": "GliTch FastAPI Engine",
                "version": "v2.4.0",
                "python_version": "3.12",
                "cpu_percent": cpu,
                "ram_usage_gb": ram,
                "requests_per_sec": requests_sec,
                "latency_ms": latency,
                "agents": [
                    {
                        "id": "agent-01",
                        "name": "GliTch Edge Agent #1",
                        "site": "Client Alpha (US-East)",
                        "ip": "10.0.4.12",
                        "version": "v2.4.0",
                        "status": "ONLINE",
                        "lastSync": "Just now",
                        "requestsPerSec": random.randint(1380, 1480)
                    },
                    {
                        "id": "agent-02",
                        "name": "GliTch Edge Agent #2",
                        "site": "Client Beta (EU-West)",
                        "ip": "10.2.1.88",
                        "version": "v2.4.0",
                        "status": "ONLINE",
                        "lastSync": "Just now",
                        "requestsPerSec": random.randint(950, 1040)
                    },
                    {
                        "id": "agent-03",
                        "name": "GliTch Edge Agent #3",
                        "site": "Client Gamma (AP-South)",
                        "ip": "10.5.12.3",
                        "version": "v2.4.0",
                        "status": "ONLINE",
                        "lastSync": "Just now",
                        "requestsPerSec": random.randint(2100, 2250)
                    }
                ],
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
        manager.disconnect(websocket)

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
    await manager.broadcast({
        "type": "item_created",
        "item": new_item.model_dump()
    })
    return new_item

@app.delete("/api/items/{item_id}")
async def delete_item(item_id: int):
    global items_db
    initial_len = len(items_db)
    items_db = [item for item in items_db if item.id != item_id]
    if len(items_db) == initial_len:
        raise HTTPException(status_code=404, detail="Item not found")
    await manager.broadcast({
        "type": "item_deleted",
        "item_id": item_id
    })
    return {"message": f"Item {item_id} deleted successfully"}

@app.post("/api/pipeline/approve")
async def approve_pipeline(req: PipelineApproveRequest):
    event = {
        "type": "approval_granted",
        "user": req.user_email,
        "timestamp": time.strftime("%H:%M:%S"),
        "log": {
            "id": f"log-{Date_now_ts()}",
            "time": "Just now",
            "type": "approval",
            "title": "Production Release Approved",
            "status": "approved",
            "details": f"Deployment approval granted by {req.user_email}. Ready for Edge Client Agent pull."
        }
    }
    await manager.broadcast(event)
    return {"status": "approved", "user": req.user_email}

def Date_now_ts():
    return int(time.time() * 1000)

