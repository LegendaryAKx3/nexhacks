from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from uuid import uuid4

from app.db.mongodb import get_database
from pymongo.errors import PyMongoError, ServerSelectionTimeoutError
import re
from app.models.schemas import ResearchResult, Source
from app.services.parallel_ai import run_task


TASK_COLLECTION = "research_tasks"
RESEARCH_COLLECTION = "research"
_in_memory_tasks: Dict[str, Dict[str, Any]] = {}


def _tasks_collection():
    return get_database()[TASK_COLLECTION]


def _research_collection():
    return get_database()[RESEARCH_COLLECTION]


async def create_research_task(topic_id: str, query: str) -> str:
    task_id = str(uuid4())
    now = datetime.now(timezone.utc)
    try:
        await _tasks_collection().insert_one(
            {
                "_id": task_id,
                "task_id": task_id,
                "topic_id": topic_id,
                "query": query,
                "status": "queued",
                "created_at": now,
                "updated_at": now,
            }
        )
    except ServerSelectionTimeoutError:
        _in_memory_tasks[task_id] = {
            "_id": task_id,
            "task_id": task_id,
            "topic_id": topic_id,
            "query": query,
            "status": "queued",
            "created_at": now,
            "updated_at": now,
            "storage": "memory",
        }
    except PyMongoError as exc:
        raise RuntimeError(f"MongoDB error: {exc}") from exc
    return task_id


async def get_research_task(task_id: str) -> Optional[Dict[str, Any]]:
    if task_id in _in_memory_tasks:
        return _in_memory_tasks.get(task_id)
    try:
        return await _tasks_collection().find_one({"_id": task_id})
    except ServerSelectionTimeoutError:
        return _in_memory_tasks.get(task_id)


async def update_research_task(task_id: str, updates: Dict[str, Any]) -> None:
    updates["updated_at"] = datetime.now(timezone.utc)
    if task_id in _in_memory_tasks:
        _in_memory_tasks[task_id].update(updates)
        return
    try:
        await _tasks_collection().update_one({"_id": task_id}, {"$set": updates})
    except ServerSelectionTimeoutError:
        _in_memory_tasks[task_id] = {"_id": task_id, **updates, "storage": "memory"}


async def run_research_task(task_id: str) -> None:
    task = await get_research_task(task_id)
    if not task:
        return

    topic_id = task.get("topic_id")
    query = task.get("query") or topic_id

    await update_research_task(task_id, {"status": "running"})

    try:
        result: ResearchResult = await run_task(query)
        summary = result.summary or ""
        sources = [source.model_dump() for source in result.sources]
        try:
            await _research_collection().update_one(
                {"topic_id": topic_id},
                {
                    "$set": {
                        "topic_id": topic_id,
                        "summary": summary,
                        "sources": sources,
                        "generated_at": datetime.now(timezone.utc),
                    }
                },
                upsert=True,
            )
        except ServerSelectionTimeoutError:
            pass

        await update_research_task(
            task_id,
            {
                "status": "complete",
                "result": {"summary": summary, "sources": sources},
                "error": None,
            },
        )
    except Exception as exc:  # noqa: BLE001
        await update_research_task(
            task_id,
            {
                "status": "error",
                "error": str(exc),
            },
        )


async def get_research_result(topic_id: str) -> Optional[Dict[str, Any]]:
    try:
        return await _research_collection().find_one({"topic_id": topic_id})
    except ServerSelectionTimeoutError:
        return None


def normalize_research_summary(summary: str) -> str:
    if not summary:
        return ""

    if "TaskRunTextOutput" in summary and "content=" in summary:
        start = summary.find("content=")
        if start != -1:
            start += len("content=")
            if start < len(summary) and summary[start] in {"'", "\""}:
                quote = summary[start]
                start += 1
                end = summary.rfind(f"{quote}, type=")
                if end == -1:
                    end = summary.rfind(quote)
                if end > start:
                    extracted = summary[start:end]
                    # Return directly - unicode_escape corrupts UTF-8 multi-byte chars
                    return extracted

    cleaned = re.sub(r"^TaskRunTextOutput\\(.*?content=", "", summary, flags=re.DOTALL)
    return cleaned.strip()


async def synthesize_research(topic_id: str, sources: List[Source]) -> str:
    return ""
