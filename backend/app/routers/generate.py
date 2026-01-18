import uuid
from fastapi import APIRouter, HTTPException

from app.models.schemas import (
    ArticleResponse,
    GenerateArticleRequest,
    GenerateScriptRequest,
    InterruptRequest,
    InterruptResponse,
    ScriptResponse,
)
from app.services.research import get_research_result
from app.services.llm import generate_script_content, generate_article_content

router = APIRouter()

TOPIC_ID_MAPPING = {
    "politics": "tell me the latest news pertaining to american politics",
    "sports": "tell me the latest news pertaining to american sports",
    "climate": "tell me the latest news pertaining to climate change",
    "tech": "tell me the latest news pertaining to tech and ai",
    "economy": "tell me the latest news pertaining to global economy",
    "health": "tell me the latest news pertaining to health and science",
}

def resolve_topic_id(topic_id: str) -> str:
    """Resolve short topic ID to the full query ID used in the database."""
    return TOPIC_ID_MAPPING.get(topic_id, topic_id)


@router.post("/generate/script", response_model=ScriptResponse)
async def generate_script(payload: GenerateScriptRequest) -> ScriptResponse:
    # Resolve topic ID to db key
    db_topic_id = resolve_topic_id(payload.topic_id)
    
    # Fetch research context
    research = await get_research_result(db_topic_id)
    summary = ""
    if research:
        summary = research.get("summary", "")
        # Optionally append source titles for context
        sources = research.get("sources", [])
        if sources:
            source_titles = ", ".join([s.get("title", "Unknown") for s in sources])
            summary += f"\n\nSources: {source_titles}"
    
    # Generate script
    segments = await generate_script_content(
        topic=payload.topic_id, # Use original ID/Label for prompt context if preferred, or db_topic_id
        research_summary=summary,
        duration_minutes=payload.duration_minutes,
        format_type=payload.format
    )
    
    total_duration = sum([s.end_seconds - s.start_seconds for s in segments])
    
    return ScriptResponse(
        script_id=str(uuid.uuid4()),
        segments=segments,
        total_duration_seconds=int(total_duration),
    )


@router.post("/generate/article", response_model=ArticleResponse)
async def generate_article(payload: GenerateArticleRequest) -> ArticleResponse:
    # Resolve topic ID to db key
    db_topic_id = resolve_topic_id(payload.topic_id)

    # Fetch research context
    research = await get_research_result(db_topic_id)
    summary = ""
    if research:
        summary = research.get("summary", "")
    
    title, intro, sections = await generate_article_content(
        topic=payload.topic_id,
        research_summary=summary
    )
    
    return ArticleResponse(
        article_id=str(uuid.uuid4()),
        title=title,
        content=intro, # Using intro as main content preview
        sections=sections,
    )


@router.post("/interrupt", response_model=InterruptResponse)
async def interrupt(payload: InterruptRequest) -> InterruptResponse:
    # Stub for now
    return InterruptResponse(
        response_text="I hear you. Let's pivot.",
        audio_url=None,
        resume_position_seconds=payload.current_position_seconds,
    )
