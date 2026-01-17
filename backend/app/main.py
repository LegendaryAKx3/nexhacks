import os

try:
    from dotenv import load_dotenv
except Exception:  # pragma: no cover - optional dependency
    load_dotenv = None

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import generate, research, topics, voice


def _get_cors_origins() -> list[str]:
    raw = os.getenv("CORS_ORIGINS", "")
    origins = [origin.strip() for origin in raw.split(",") if origin.strip()]
    if origins:
        return origins
    if os.getenv("ENV", "development").lower() == "development":
        return ["*"]
    return []


if load_dotenv is not None:
    load_dotenv()

app = FastAPI(title="DeepResearchPod API")

origins = _get_cors_origins()
if origins:
    allow_credentials = origins != ["*"]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=allow_credentials,
        allow_methods=["*"],
        allow_headers=["*"],
    )


@app.get("/health")
async def health_check() -> dict:
    return {"status": "ok"}


app.include_router(topics.router, tags=["topics"])
app.include_router(research.router, tags=["research"])
app.include_router(generate.router, tags=["generate"])
app.include_router(voice.router, tags=["voice"])
