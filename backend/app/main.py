import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import generate, research, topics


def _get_cors_origins() -> list[str]:
    raw = os.getenv("CORS_ORIGINS", "")
    return [origin.strip() for origin in raw.split(",") if origin.strip()]


app = FastAPI(title="DeepResearchPod API")

origins = _get_cors_origins()
if origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


@app.get("/health")
async def health_check() -> dict:
    return {"status": "ok"}


app.include_router(topics.router, tags=["topics"])
app.include_router(research.router, tags=["research"])
app.include_router(generate.router, tags=["generate"])
