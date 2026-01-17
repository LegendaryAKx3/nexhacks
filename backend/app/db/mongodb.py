import os

from motor.motor_asyncio import AsyncIOMotorClient


_client: AsyncIOMotorClient | None = None


def get_client() -> AsyncIOMotorClient:
    global _client
    if _client is None:
        mongo_uri = os.getenv("MONGODB_URI", "")
        _client = AsyncIOMotorClient(mongo_uri)
    return _client


def get_database():
    db_name = os.getenv("MONGODB_DB", "deepresearchpod")
    return get_client()[db_name]
