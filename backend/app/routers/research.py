from fastapi import APIRouter

from app.models.schemas import ResearchRefreshRequest, ResearchRefreshResponse

router = APIRouter()


@router.post("/research/refresh", response_model=ResearchRefreshResponse)
async def refresh_research(payload: ResearchRefreshRequest) -> ResearchRefreshResponse:
    return ResearchRefreshResponse(topic_id=payload.topic_id, status="queued")
