import os
from typing import Optional

from livekit import api


async def create_room(name: str) -> Optional[str]:
    return None


def create_access_token(identity: str, room: str, name: Optional[str] = None) -> str:
    api_key = os.getenv("LIVEKIT_API_KEY", "")
    api_secret = os.getenv("LIVEKIT_API_SECRET", "")

    if not api_key or not api_secret:
        raise RuntimeError("LIVEKIT_API_KEY and LIVEKIT_API_SECRET are required")

    token = api.AccessToken(api_key, api_secret)
    token.with_identity(identity)
    if name:
        token.with_name(name)
    token.with_grants(api.VideoGrants(room_join=True, room=room))
    return token.to_jwt()


def get_livekit_url() -> str:
    return os.getenv("LIVEKIT_URL", "")
