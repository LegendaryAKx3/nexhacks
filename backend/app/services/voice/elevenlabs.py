import os
from typing import Tuple

import httpx


async def generate_voice(text: str, voice_id: str) -> Tuple[bytes, str]:
    api_key = os.getenv("ELEVENLABS_API_KEY", "").strip()
    if not api_key:
        raise RuntimeError("ELEVENLABS_API_KEY is required")
    if not voice_id:
        raise RuntimeError("ELEVENLABS voice_id is required")

    model_id = os.getenv("ELEVENLABS_MODEL_ID", "eleven_multilingual_v2")
    output_format = os.getenv("ELEVENLABS_OUTPUT_FORMAT", "mp3_44100_128")

    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
    headers = {
        "xi-api-key": api_key,
        "accept": "audio/mpeg",
        "content-type": "application/json",
    }
    payload = {
        "text": text,
        "model_id": model_id,
        "voice_settings": {
            "stability": 0.4,
            "similarity_boost": 0.7,
        },
    }

    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(
            url, headers=headers, json=payload, params={"output_format": output_format}
        )
        response.raise_for_status()
        content_type = response.headers.get("content-type", "audio/mpeg")
        return response.content, content_type
