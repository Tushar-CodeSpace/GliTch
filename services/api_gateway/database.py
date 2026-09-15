import os
import asyncio
from typing import Optional, Dict, Any
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
import pymongo
from dotenv import load_dotenv

# Load .env configuration if present
load_dotenv()

# Environment Configuration for MongoDB Container / Amazon DocumentDB
MONGO_URI = os.getenv("MONGODB_URI") or os.getenv("DOCUMENTDB_URI") or "mongodb://localhost:27017"
MONGO_DB_NAME = os.getenv("MONGODB_DB_NAME") or os.getenv("DOCUMENTDB_DB_NAME") or "glitch_db"
MONGO_TLS_CA_FILE = os.getenv("MONGODB_TLS_CA_FILE") or os.getenv("DOCUMENTDB_TLS_CA_FILE") or "global-bundle.pem"
MONGO_ENABLE_TLS = (os.getenv("MONGODB_ENABLE_TLS") or os.getenv("DOCUMENTDB_ENABLE_TLS") or "false").lower() in ("true", "1", "yes")

class MongoDBManager:
    """
    MongoDB / DocumentDB Async Client Manager.
    Supports local MongoDB containers (port 27017) and optional AWS DocumentDB TLS options.
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

            if MONGO_ENABLE_TLS:
                connect_kwargs.update({
                    "tls": True,
                    "tlsCAFile": MONGO_TLS_CA_FILE,
                    "replicaSet": "rs0",
                    "readPreference": "secondaryPreferred",
                    "retryWrites": False
                })

            target_host = MONGO_URI.split("@")[-1]
            print(f" Connecting to MongoDB container / database at {target_host} (TLS: {MONGO_ENABLE_TLS})...")
            self.client = AsyncIOMotorClient(MONGO_URI, **connect_kwargs)
            self.db = self.client[MONGO_DB_NAME]

            # Ping database to verify connection
            await self.client.admin.command('ping')
            self.is_connected = True
            print(f" MongoDB connection established: Database [{MONGO_DB_NAME}].")

            # Create Indexes
            await self._create_indexes()

        except Exception as err:
            print(f" MongoDB connection unavailable ({err}). Falling back to active memory mode.")
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
            print(" MongoDB collection indexes initialized.")
        except Exception as index_err:
            print(f" Index initialization warning: {index_err}")

    async def close(self):
        if self.client:
            self.client.close()
            self.is_connected = False
            print(" MongoDB connection closed.")

# Backward-compatible alias
DocumentDBManager = MongoDBManager
db_manager = MongoDBManager()

