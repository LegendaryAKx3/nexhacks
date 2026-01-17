from fastapi import APIRouter

from app.models.schemas import (
    ArticleResponse,
    GenerateArticleRequest,
    GenerateScriptRequest,
    InterruptRequest,
    InterruptResponse,
    ScriptResponse,
)

router = APIRouter()


@router.post("/generate/script", response_model=ScriptResponse)
async def generate_script(payload: GenerateScriptRequest) -> ScriptResponse:
    return ScriptResponse(
        script_id="script_0001",
        segments=[],
        total_duration_seconds=0,
    )


@router.post("/generate/article", response_model=ArticleResponse)
async def generate_article(payload: GenerateArticleRequest) -> ArticleResponse:
    return ArticleResponse(
        article_id="article_0001",
        title="Sample Article",
        content="",
        sections=[],
    )


@router.post("/interrupt", response_model=InterruptResponse)
async def interrupt(payload: InterruptRequest) -> InterruptResponse:
    return InterruptResponse(
        response_text="",
        audio_url=None,
        resume_position_seconds=payload.current_position_seconds,
    )
