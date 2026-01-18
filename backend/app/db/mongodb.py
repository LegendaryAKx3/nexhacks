import os
import json
import asyncio
from pathlib import Path
from typing import Any, Dict, List, Optional

# from motor.motor_asyncio import AsyncIOMotorClient


# _client: AsyncIOMotorClient | None = None


# def get_client() -> AsyncIOMotorClient:
#     global _client
#     if _client is None:
#         mongo_uri = os.getenv("MONGODB_URI", "")
#         # Set a short server selection timeout so we fail fast if MongoDB is unavailable
#         _client = AsyncIOMotorClient(
#             mongo_uri,
#             serverSelectionTimeoutMS=5000,  # 5 seconds
#             connectTimeoutMS=5000,
#         )
#     return _client


# def get_database():
#     db_name = os.getenv("MONGODB_DB", "deepresearchpod")
#     return get_client()[db_name]


# --- Local JSON File Storage Implementation ---

DB_FILE = Path("local_data.json")

class LocalJsonCollection:
    def __init__(self, name: str, db_file: Path):
        self.name = name
        self.db_file = db_file

    def _load_data(self) -> Dict[str, List[Dict[str, Any]]]:
        if not self.db_file.exists():
            return {}
        try:
            with open(self.db_file, "r") as f:
                return json.load(f)
        except json.JSONDecodeError:
            return {}

    def _save_data(self, data: Dict[str, List[Dict[str, Any]]]):
        with open(self.db_file, "w") as f:
            json.dump(data, f, indent=2, default=str)

    async def find_one(self, filter: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        # Simulate async
        await asyncio.sleep(0)
        data = self._load_data()
        collection_data = data.get(self.name, [])
        
        for doc in collection_data:
            if all(doc.get(k) == v for k, v in filter.items()):
                return doc
        return None

    async def insert_one(self, document: Dict[str, Any]):
        await asyncio.sleep(0)
        data = self._load_data()
        if self.name not in data:
            data[self.name] = []
        
        # Simple duplicate check on _id if present
        if "_id" in document:
            for doc in data[self.name]:
                if doc.get("_id") == document["_id"]:
                    raise ValueError(f"Duplicate key error: {document['_id']}")

        data[self.name].append(document)
        self._save_data(data)
        return type('InsertOneResult', (object,), {"inserted_id": document.get("_id")})()

    async def update_one(self, filter: Dict[str, Any], update: Dict[str, Any], upsert: bool = False):
        await asyncio.sleep(0)
        data = self._load_data()
        if self.name not in data:
            data[self.name] = []
        
        collection_data = data[self.name]
        match_idx = -1
        
        for i, doc in enumerate(collection_data):
            if all(doc.get(k) == v for k, v in filter.items()):
                match_idx = i
                break
        
        if match_idx != -1:
            # Update existing
            doc = collection_data[match_idx]
            if "$set" in update:
                for k, v in update["$set"].items():
                    doc[k] = v
            # Save back
            collection_data[match_idx] = doc
            self._save_data(data)
            return type('UpdateResult', (object,), {"modified_count": 1, "upserted_id": None})()
        
        elif upsert:
            # Insert new
            new_doc = filter.copy()
            if "$set" in update:
                new_doc.update(update["$set"])
            
            collection_data.append(new_doc)
            self._save_data(data)
            return type('UpdateResult', (object,), {"modified_count": 0, "upserted_id": new_doc.get("_id")})()
        
        return type('UpdateResult', (object,), {"modified_count": 0, "upserted_id": None})()


class LocalJsonDatabase:
    def __init__(self):
        self.db_file = DB_FILE

    def __getitem__(self, name: str):
        return LocalJsonCollection(name, self.db_file)


def get_database():
    return LocalJsonDatabase()