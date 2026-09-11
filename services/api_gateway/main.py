from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import time
import os
import httpx

app = FastAPI(
    title="GliTch API",
    description="FastAPI backend for GliTch React application",
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

# Scraper Agent URL (configurable via env var for local dev vs Docker network)
SCRAPER_AGENT_URL = os.getenv("SCRAPER_AGENT_URL", "http://127.0.0.1:8001")

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



@app.get("/api/items", response_model=List[Item])
def get_items():
    return items_db

@app.post("/api/items", response_model=Item, status_code=201)
def create_item(item_in: ItemCreate):
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
    return new_item

@app.delete("/api/items/{item_id}")
def delete_item(item_id: int):
    global items_db
    initial_len = len(items_db)
    items_db = [item for item in items_db if item.id != item_id]
    if len(items_db) == initial_len:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"message": f"Item {item_id} deleted successfully"}
