from fastapi import APIRouter, BackgroundTasks, HTTPException

from app.models.schemas import (
    ResearchRefreshRequest,
    ResearchTaskResponse,
    ResearchTaskStatusResponse,
    ResearchResultResponse,
)
from app.services.research import (
    create_research_task,
    get_research_task,
    get_research_result,
    run_research_task,
)

router = APIRouter()


@router.post("/research/refresh", response_model=ResearchTaskResponse)
async def refresh_research(
    payload: ResearchRefreshRequest,
    background_tasks: BackgroundTasks,
) -> ResearchTaskResponse:
    query = payload.query or payload.topic_id
    try:
        task_id = await create_research_task(payload.topic_id, query)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    background_tasks.add_task(run_research_task, task_id)
    return ResearchTaskResponse(task_id=task_id, status="queued")


@router.get("/research/status/{task_id}", response_model=ResearchTaskStatusResponse)
async def get_research_status(task_id: str) -> ResearchTaskStatusResponse:
    task = await get_research_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return ResearchTaskStatusResponse(
        task_id=task_id,
        status=task.get("status", "unknown"),
        result=task.get("result"),
        error=task.get("error"),
    )


@router.get("/research/{topic_id}", response_model=ResearchResultResponse)
async def get_research(topic_id: str) -> ResearchResultResponse:
    doc = await get_research_result(topic_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Research not found")
    return ResearchResultResponse(
        topic_id=topic_id,
        summary=doc.get("summary"),
        sources=doc.get("sources", []),
        generated_at=doc.get("generated_at"),
    )
