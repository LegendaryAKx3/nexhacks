import uuid
from fastapi import APIRouter, HTTPException

from app.models.schemas import (
    ArticleResponse,
    GenerateArticleRequest,
    GeneratePodcastRequest,
    GenerateScriptRequest,
    InterruptRequest,
    InterruptResponse,
    PodcastResponse,
    ScriptResponse,
)
from app.services.research import get_research_result, normalize_research_summary
from app.services.llm import (
    generate_script_content,
    generate_article_content,
    generate_podcast_script,
)
from app.services.voice.elevenlabs import generate_voice
import base64
import os

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
        summary = normalize_research_summary(research.get("summary", ""))
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
        summary = normalize_research_summary(research.get("summary", ""))
    
    title, intro, sections = await generate_article_content(
        topic=payload.topic_id,
        research_summary=summary,
        duration_minutes=payload.duration_minutes
    )
    
    return ArticleResponse(
        article_id=str(uuid.uuid4()),
        title=title,
        content=intro, # Using intro as main content preview
        sections=sections,
    )


@router.post("/generate/podcast", response_model=PodcastResponse)
async def generate_podcast(payload: GeneratePodcastRequest) -> PodcastResponse:
    db_topic_id = resolve_topic_id(payload.topic_id)
    research = await get_research_result(db_topic_id)
    summary = ""
    if research:
        summary = normalize_research_summary(research.get("summary", ""))

    segments = await generate_podcast_script(
        topic=payload.topic_id,
        research_summary=summary,
        duration_minutes=payload.duration_minutes,
    )

    script_text = "\n\n".join([seg.text for seg in segments])
    voice_id = os.getenv("ELEVENLABS_PODCAST_VOICE_ID", "").strip()
    if not voice_id:
        raise HTTPException(
            status_code=500,
            detail="ELEVENLABS_PODCAST_VOICE_ID is not configured",
        )

    audio_bytes, mime_type = await generate_voice(script_text, voice_id)
    audio_base64 = base64.b64encode(audio_bytes).decode("utf-8")

    total_duration = sum([s.end_seconds - s.start_seconds for s in segments])

    return PodcastResponse(
        podcast_id=str(uuid.uuid4()),
        segments=segments,
        audio_base64=audio_base64,
        mime_type=mime_type,
        total_duration_seconds=int(total_duration),
    )


@router.post("/interrupt", response_model=InterruptResponse)
async def interrupt(payload: InterruptRequest) -> InterruptResponse:
    # Stub for now
    return InterruptResponse(
        response_text="I hear you. Let's pivot.",
        audio_url=None,
        resume_position_seconds=payload.current_position_seconds,
    )
