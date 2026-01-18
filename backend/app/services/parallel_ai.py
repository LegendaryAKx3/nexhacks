import asyncio
import os
from typing import List

from parallel import Parallel
from parallel.types import TaskSpecParam, TextSchemaParam

from app.models.schemas import ResearchResult, Source


_client: Parallel | None = None


def _get_client() -> Parallel:
    global _client
    if _client is None:
        api_key = os.getenv("PARALLEL_API_KEY", "").strip()
        if not api_key:
            raise RuntimeError("PARALLEL_API_KEY is required")
        _client = Parallel(api_key=api_key)
    return _client


def _normalize_sources(raw_sources) -> List[Source]:
    sources: List[Source] = []
    if not isinstance(raw_sources, list):
        return sources
    for item in raw_sources:
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


async def run_task(
    query: str,
    limit: int = 10,
    poll_interval: float = 1.5,
    timeout_seconds: float = 60,
) -> ResearchResult:
    processor = os.getenv("PARALLEL_PROCESSOR", "ultra")

    def _run() -> ResearchResult:
        client = _get_client()
        task_run = client.task_run.create(
            input=query,
            processor=processor,
            task_spec=TaskSpecParam(output_schema=TextSchemaParam()),
        )
        run_result = client.task_run.result(
            task_run.run_id,
            api_timeout=int(timeout_seconds),
        )

        output = getattr(run_result, "output", None)
        summary = ""
        sources: List[Source] = []

        if isinstance(output, dict):
            summary = output.get("summary") or output.get("answer") or ""
            sources = _normalize_sources(output.get("sources") or output.get("results"))
        else:
            summary = str(output) if output is not None else ""

        return ResearchResult(summary=summary, sources=sources)

    return await asyncio.to_thread(_run)


async def search_sources(query: str, limit: int = 10) -> List[Source]:
    result = await run_task(query, limit=limit)
    return result.sources
