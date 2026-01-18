import os

from motor.motor_asyncio import AsyncIOMotorClient


_client: AsyncIOMotorClient | None = None


def get_client() -> AsyncIOMotorClient:
    global _client
    if _client is None:
        mongo_uri = os.getenv("MONGODB_URI", "")
        # Set a short server selection timeout so we fail fast if MongoDB is unavailable
        _client = AsyncIOMotorClient(
            mongo_uri,
            serverSelectionTimeoutMS=5000,  # 5 seconds
            connectTimeoutMS=5000,
        )
    return _client


def get_database():
    db_name = os.getenv("MONGODB_DB", "deepresearchpod")
    return get_client()[db_name]
