import os
import asyncio
from typing import Optional, Dict, Any
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
import pymongo

# Environment Configuration for Amazon DocumentDB
DOCUMENTDB_URI = os.getenv("DOCUMENTDB_URI", "mongodb://localhost:27017")
DOCUMENTDB_DB_NAME = os.getenv("DOCUMENTDB_DB_NAME", "glitch_db")
DOCUMENTDB_TLS_CA_FILE = os.getenv("DOCUMENTDB_TLS_CA_FILE", "global-bundle.pem")
DOCUMENTDB_ENABLE_TLS = os.getenv("DOCUMENTDB_ENABLE_TLS", "false").lower() in ("true", "1", "yes")

class DocumentDBManager:
    """
    Amazon DocumentDB (MongoDB-compatible) Async Client Manager.
    Configured specifically for AWS DocumentDB connection options:
    - tls=True
    - tlsCAFile=global-bundle.pem
    - replicaSet='rs0'
    - readPreference='secondaryPreferred'
    - retryWrites=False
    """
    def __init__(self):
        self.client: Optional[AsyncIOMotorClient] = None
        self.db: Optional[AsyncIOMotorDatabase] = None
        self.is_connected: bool = False

    async def connect(self):
        try:
            connect_kwargs: Dict[str, Any] = {
                "serverSelectionTimeoutMS": 2500
            }

            if DOCUMENTDB_ENABLE_TLS:
                connect_kwargs.update({
                    "tls": True,
                    "tlsCAFile": DOCUMENTDB_TLS_CA_FILE,
                    "replicaSet": "rs0",
                    "readPreference": "secondaryPreferred",
                    "retryWrites": False
                })

            print(f" Connecting to Amazon DocumentDB at {DOCUMENTDB_URI.split('@')[-1]} (TLS: {DOCUMENTDB_ENABLE_TLS})...")
            self.client = AsyncIOMotorClient(DOCUMENTDB_URI, **connect_kwargs)
            self.db = self.client[DOCUMENTDB_DB_NAME]

            # Ping database to verify connection
            await self.client.admin.command('ping')
            self.is_connected = True
            print(f" Amazon DocumentDB connection established: Database [{DOCUMENTDB_DB_NAME}].")

            # Create Indexes
            await self._create_indexes()

        except Exception as err:
            print(f" Amazon DocumentDB connection unavailable ({err}). Falling back to active memory mode.")
            self.is_connected = False

    async def _create_indexes(self):
        if not self.is_connected or self.db is None:
            return

        try:
            # Applications Index
            await self.db.applications.create_index([("name", pymongo.ASCENDING)], unique=True)
            # Clients Index
            await self.db.clients.create_index([("code", pymongo.ASCENDING)], unique=True)
            # Sites Index
            await self.db.sites.create_index([("code", pymongo.ASCENDING)], unique=True)
            # Agents Index
            await self.db.agents.create_index([("agent_code", pymongo.ASCENDING)], unique=True)
            # Deployments Index
            await self.db.deployments.create_index([("started_at", pymongo.DESCENDING)])
            # Logs Index
            await self.db.logs.create_index([("timestamp", pymongo.DESCENDING)])
            print(" Amazon DocumentDB collection indexes initialized.")
        except Exception as index_err:
            print(f" Index initialization warning: {index_err}")

    async def close(self):
        if self.client:
            self.client.close()
            self.is_connected = False
            print(" Amazon DocumentDB connection closed.")

db_manager = DocumentDBManager()
