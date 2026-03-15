# pyright: reportMissingImports=false
# pyright: reportGeneralTypeIssues=false
"""MongoDB connection and utilities."""
import os
from motor.motor_asyncio import AsyncIOMotorClient # type: ignore
from typing import Optional

_client: Optional[AsyncIOMotorClient] = None
_db = None


async def connect_db():
    """Connect to MongoDB."""
    global _client, _db
    uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    db_name = os.getenv("MONGODB_DB_NAME", "knowflux")
    try:
        _client = AsyncIOMotorClient(uri, serverSelectionTimeoutMS=5000)
        _db = _client[db_name]
        await _client.admin.command("ping")
        print(f"✅ Connected to MongoDB: {db_name}")
    except Exception as e:
        print(f"⚠️ MongoDB connection failed: {e}. Running with in-memory fallback.")
        _client = None
        _db = None


async def close_db():
    """Close MongoDB connection."""
    global _client
    if _client:
        _client.close()
        print("🔌 MongoDB connection closed.")


def get_db():
    """Get database instance."""
    return _db


def get_collection(name: str):
    """Get a specific collection."""
    if _db is None:
        return None
    return _db[name]
