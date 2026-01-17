import os
from typing import Optional

import requests


class ElevenLabsTTS:
    def __init__(self, api_key: str, model_id: str, output_format: str) -> None:
        if not api_key:
            raise ValueError("ELEVENLABS_API_KEY is required")
        if not model_id:
            raise ValueError("ELEVENLABS_MODEL_ID is required")
        if not output_format:
            raise ValueError("ELEVENLABS_OUTPUT_FORMAT is required")
        self.api_key = api_key
        self.model_id = model_id
        self.output_format = output_format

    def synthesize(self, text: str, voice_id: str) -> bytes:
        if not voice_id:
            raise ValueError("Voice ID is required")

        url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
        headers = {
            "xi-api-key": self.api_key,
            "accept": "audio/pcm",
            "content-type": "application/json",
        }
        payload = {
            "text": text,
            "model_id": self.model_id,
            "voice_settings": {
                "stability": 0.4,
                "similarity_boost": 0.7,
            },
        }
        response = requests.post(
            url,
            headers=headers,
            json=payload,
            params={"output_format": self.output_format},
            timeout=60,
        )
        response.raise_for_status()
        return response.content


def load_elevenlabs_from_env() -> ElevenLabsTTS:
    return ElevenLabsTTS(
        api_key=os.getenv("ELEVENLABS_API_KEY", ""),
        model_id=os.getenv("ELEVENLABS_MODEL_ID", ""),
        output_format=os.getenv("ELEVENLABS_OUTPUT_FORMAT", ""),
    )


def get_voice_id(name: str) -> Optional[str]:
    env_map = {
        "peter": "ELEVENLABS_VOICE_ID_PETER",
        "stewie": "ELEVENLABS_VOICE_ID_STEWIE",
    }
    key = env_map.get(name.lower())
    return os.getenv(key, "") if key else None
