import asyncio
import logging
import os
import time
from typing import List

from parallel import Parallel
from parallel.types import TaskSpecParam, TextSchemaParam

from app.models.schemas import ResearchResult, Source


_client: Parallel | None = None
_logger = logging.getLogger(__name__)


def _get_client() -> Parallel:
    global _client
    if _client is None:
        api_key = os.getenv("PARALLEL_API_KEY", "").strip()
        if not api_key:
            raise RuntimeError("PARALLEL_API_KEY is required")
        _client = Parallel(api_key=api_key)
    return _client


def _poll_for_result(client: Parallel, run_id: str, timeout_seconds: float, poll_interval: float):
    """Poll for task result with proper timeout handling."""
    start_time = time.time()
    while True:
        elapsed = time.time() - start_time
        if elapsed >= timeout_seconds:
            raise TimeoutError(f"Task {run_id} did not complete within {timeout_seconds} seconds")
        
        # Check task status
        task_run = client.task_run.retrieve(run_id)
        status = getattr(task_run, "status", None)
        _logger.info("Task %s status: %s (elapsed: %.1fs)", run_id, status, elapsed)
        
        if status == "completed":
            # Task is complete, get the result
            return client.task_run.result(run_id, api_timeout=30)
        elif status == "failed":
            error_msg = getattr(task_run, "error", "Unknown error")
            raise RuntimeError(f"Task failed: {error_msg}")
        elif status in ("pending", "running", "queued"):
            # Still processing, wait and poll again
            time.sleep(poll_interval)
        else:
            # Unknown status, try to get result anyway
            _logger.warning("Unknown task status: %s, attempting to get result", status)
            try:
                return client.task_run.result(run_id, api_timeout=30)
            except Exception:
                time.sleep(poll_interval)


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
    poll_interval: float = 3.0,
    timeout_seconds: float | None = None,
) -> ResearchResult:
    """Run a research task with proper polling for long-running tasks.
    
    The Parallel.ai 'ultra' processor can take several minutes, so we use
    polling instead of a single blocking call.
    
    Timeout can be configured via PARALLEL_TIMEOUT_SECONDS environment variable.
    Default is 300 seconds (5 minutes) for ultra processor.
    """
    processor = os.getenv("PARALLEL_PROCESSOR", "ultra")
    
    # Get timeout from env or use default based on processor
    if timeout_seconds is None:
        default_timeout = 300.0 if processor == "ultra" else 120.0
        timeout_seconds = float(os.getenv("PARALLEL_TIMEOUT_SECONDS", str(default_timeout)))

    def _run() -> ResearchResult:
        try:
            client = _get_client()
            _logger.info("Creating Parallel.ai task with processor=%s for query: %s", processor, query[:100])
            
            task_run = client.task_run.create(
                input=query,
                processor=processor,
                task_spec=TaskSpecParam(output_schema=TextSchemaParam()),
            )
            run_id = task_run.run_id
            _logger.info("Task created with run_id=%s", run_id)
            
            # Poll for result instead of using blocking api_timeout
            run_result = _poll_for_result(client, run_id, timeout_seconds, poll_interval)

            output = getattr(run_result, "output", None)
            summary = ""
            sources: List[Source] = []

            if isinstance(output, dict):
                summary = output.get("summary") or output.get("answer") or ""
                sources = _normalize_sources(output.get("sources") or output.get("results"))
            else:
                # Handle TaskRunTextOutput or similar objects with content/citations
                content = getattr(output, "content", None)
                citations = getattr(output, "citations", None)
                
                if content is not None:
                    summary = str(content)
                else:
                    summary = str(output) if output is not None else ""
                
                # Extract sources from citations if available
                if citations and isinstance(citations, list):
                    for citation in citations:
                        url = getattr(citation, "url", None) or (citation.get("url") if isinstance(citation, dict) else None)
                        title = getattr(citation, "title", None) or (citation.get("title") if isinstance(citation, dict) else None)
                        if url:
                            sources.append(Source(
                                title=title or "Source",
                                url=url,
                                snippet=None,
                                source_name=None,
                                published_at=None,
                            ))

            _logger.info("Task %s completed successfully with %d sources", run_id, len(sources))
            return ResearchResult(summary=summary, sources=sources)
        except TimeoutError as exc:
            _logger.error("Parallel.ai task timed out: %s", exc)
            raise
        except Exception as exc:  # noqa: BLE001
            response = getattr(exc, "response", None)
            if response is not None:
                status = getattr(response, "status_code", "unknown")
                body = getattr(response, "text", None)
                _logger.error("Parallel.ai error status=%s body=%s", status, body)
            _logger.exception("Parallel.ai request failed")
            raise

    return await asyncio.to_thread(_run)


async def search_sources(query: str, limit: int = 10) -> List[Source]:
    result = await run_task(query, limit=limit)
    return result.sources
