import asyncio
import os
from typing import Any, Dict, List, Optional

import httpx

from app.models.schemas import ResearchResult, Source


def _build_url(path_template: str, task_id: Optional[str] = None) -> str:
    base_url = os.getenv("PARALLEL_BASE_URL", "https://api.parallel.ai").rstrip("/")
    path = path_template
    if task_id:
        path = path_template.format(task_id=task_id)
    if not path.startswith("/"):
        path = f"/{path}"
    return f"{base_url}{path}"


def _auth_headers() -> Dict[str, str]:
    api_key = os.getenv("PARALLEL_API_KEY", "").strip()
    if not api_key:
        return {}
    return {"Authorization": f"Bearer {api_key}"}


def _normalize_status(raw_status: str) -> str:
    status = (raw_status or "").lower()
    if status in {"complete", "completed", "succeeded", "success", "done"}:
        return "complete"
    if status in {"error", "failed", "failure"}:
        return "error"
    if status in {"queued", "pending"}:
        return "queued"
    if status in {"running", "in_progress", "processing"}:
        return "running"
    return status or "unknown"


def _extract_sources(payload: Any) -> List[Source]:
    if not payload:
        return []

    candidates = None
    if isinstance(payload, dict):
        for key in ("sources", "results", "items", "articles"):
            if key in payload:
                candidates = payload.get(key)
                break
    if candidates is None:
        candidates = payload if isinstance(payload, list) else []

    sources: List[Source] = []
    for item in candidates or []:
        if not isinstance(item, dict):
            continue
        sources.append(
            Source(
                title=item.get("title", ""),
                url=item.get("url", ""),
                snippet=item.get("snippet") or item.get("summary"),
                source_name=item.get("source_name") or item.get("source"),
                published_at=item.get("published_at"),
            )
        )
    return sources


async def submit_task(query: str, limit: Optional[int] = None) -> str:
    task_path = os.getenv("PARALLEL_TASK_PATH", "/task")
    payload: Dict[str, Any] = {"query": query}
    if limit is not None:
        payload["limit"] = limit

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(
            _build_url(task_path),
            json=payload,
            headers=_auth_headers(),
        )
        response.raise_for_status()
        data = response.json()

    task_id = data.get("task_id") or data.get("taskId") or data.get("id")
    if not task_id:
        raise RuntimeError("Parallel.ai TaskAPI did not return a task id.")
    return task_id


async def fetch_task(task_id: str) -> Dict[str, Any]:
    status_path = os.getenv("PARALLEL_TASK_STATUS_PATH", "/task/{task_id}")
    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.get(
            _build_url(status_path, task_id=task_id),
            headers=_auth_headers(),
        )
        response.raise_for_status()
        return response.json()


async def run_task(
    query: str,
    limit: int = 10,
    poll_interval: float = 1.5,
    timeout_seconds: float = 60,
) -> ResearchResult:
    task_id = await submit_task(query, limit=limit)
    deadline = asyncio.get_event_loop().time() + timeout_seconds

    while True:
        payload = await fetch_task(task_id)
        raw_status = payload.get("status") or payload.get("state") or ""
        status = _normalize_status(raw_status)

        if status == "complete":
            result_payload = payload.get("result") or payload.get("output") or payload
            summary = (
                result_payload.get("summary")
                if isinstance(result_payload, dict)
                else None
            )
            if not summary and isinstance(result_payload, dict):
                summary = (
                    result_payload.get("answer")
                    or result_payload.get("synthesis")
                    or result_payload.get("overview")
                )
            sources = _extract_sources(result_payload)
            return ResearchResult(summary=summary, sources=sources)

        if status == "error":
            error_message = (
                payload.get("error")
                or payload.get("message")
                or "Parallel.ai TaskAPI failed"
            )
            raise RuntimeError(error_message)

        if asyncio.get_event_loop().time() >= deadline:
            raise TimeoutError("Parallel.ai TaskAPI timed out while waiting for task.")

        await asyncio.sleep(poll_interval)


async def search_sources(query: str, limit: int = 10) -> List[Source]:
    result = await run_task(query, limit=limit)
    return result.sources
