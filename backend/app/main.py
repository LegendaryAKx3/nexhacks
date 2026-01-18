import os
from pathlib import Path

try:
    from dotenv import load_dotenv
except Exception:  # pragma: no cover - optional dependency
    load_dotenv = None

if load_dotenv is not None:
    backend_dir = Path(__file__).resolve().parents[1]
    repo_root = backend_dir.parent
    load_dotenv(repo_root / ".env")
    load_dotenv(backend_dir / ".env")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import generate, research, topics, voice


def _get_cors_origins() -> list[str]:
    raw = os.getenv("CORS_ORIGINS", "")
    origins = [origin.strip() for origin in raw.split(",") if origin.strip()]
    if "*" in origins:
        return ["*"]

    if os.getenv("ENV", "development").lower() == "development":
        for origin in (
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:3000",
            "http://127.0.0.1:3000",
        ):
            if origin not in origins:
                origins.append(origin)

    return origins


app = FastAPI(title="GENzNEWS API")

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

# Trigger reload