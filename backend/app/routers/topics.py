from fastapi import APIRouter

from app.models.schemas import Topic, TopicDetailResponse, TopicsResponse

router = APIRouter()


@router.get("/topics", response_model=TopicsResponse)
async def list_topics() -> TopicsResponse:
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)
    
    return TopicsResponse(topics=[
        Topic(id="politics", label="US Politics", emoji="🇺🇸", article_count=42, last_refreshed_at=now),
        Topic(id="sports", label="Sports", emoji="⚽", article_count=12, last_refreshed_at=now),
        Topic(id="climate", label="Climate Change", emoji="🌍", article_count=35, last_refreshed_at=now),
        Topic(id="tech", label="Tech & AI", emoji="🤖", article_count=28, last_refreshed_at=now),
        Topic(id="economy", label="Global Economy", emoji="📈", article_count=19, last_refreshed_at=now),
        Topic(id="health", label="Health & Science", emoji="🧬", article_count=24, last_refreshed_at=now),
    ])


@router.get("/topics/{topic_id}", response_model=TopicDetailResponse)
async def get_topic(topic_id: str) -> TopicDetailResponse:
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)

    # Define topic data
    topics_data = {
        "politics": {"label": "US Politics", "emoji": "🇺🇸"},
        "sports": {"label": "Sports", "emoji": "⚽"},
        "climate": {"label": "Climate Change", "emoji": "🌍"},
        "tech": {"label": "Tech & AI", "emoji": "🤖"},
        "economy": {"label": "Global Economy", "emoji": "📈"},
        "health": {"label": "Health & Science", "emoji": "🧬"},
    }

    # Get data or default
    data = topics_data.get(topic_id, {"label": topic_id.capitalize(), "emoji": "📰"})

    return TopicDetailResponse(
        id=topic_id,
        label=data["label"],
        emoji=data["emoji"],
        article_count=15, # Mock count
        last_refreshed_at=now,
        research_summary=f"This is a deep dive into {data['label']}. We have analyzed multiple sources to bring you the latest updates and comprehensive analysis on this topic.",
        sources=[
             {
                "title": f"Latest updates on {data['label']}",
                "url": "https://example.com",
                "source_name": "DeepResearch News",
                "published_at": now
            }
        ],
    )
