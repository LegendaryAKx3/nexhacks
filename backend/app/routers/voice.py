from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.voice.livekit import create_access_token, get_livekit_url


router = APIRouter()


class TokenRequest(BaseModel):
    room: str
    identity: str
    name: str | None = None


@router.post("/voice/token")
def issue_token(payload: TokenRequest) -> dict:
    if not payload.room:
        raise HTTPException(status_code=400, detail="room is required")
    if not payload.identity:
        raise HTTPException(status_code=400, detail="identity is required")

    url = get_livekit_url()
    if not url:
        raise HTTPException(status_code=500, detail="LIVEKIT_URL is not configured")

    try:
        token = create_access_token(
            identity=payload.identity,
            room=payload.room,
            name=payload.name,
        )
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    return {"token": token, "url": url, "room": payload.room}
