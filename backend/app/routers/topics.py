from fastapi import APIRouter

from app.models.schemas import TopicDetailResponse, TopicsResponse

router = APIRouter()


@router.get("/topics", response_model=TopicsResponse)
async def list_topics() -> TopicsResponse:
    return TopicsResponse(topics=[])


@router.get("/topics/{topic_id}", response_model=TopicDetailResponse)
async def get_topic(topic_id: str) -> TopicDetailResponse:
    return TopicDetailResponse(
        id=topic_id,
        label="Sample Topic",
        emoji="📰",
        article_count=0,
        last_refreshed_at=None,
        research_summary=None,
        sources=[],
    )
