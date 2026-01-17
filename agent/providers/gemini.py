import os
from typing import List, Dict, Any

import requests


class GeminiClient:
    def __init__(self, api_key: str, model: str) -> None:
        if not api_key:
            raise ValueError("GEMINI_API_KEY is required")
        if not model:
            raise ValueError("GEMINI_MODEL is required")
        self.api_key = api_key
        self.model = model

    def generate(self, system_prompt: str, messages: List[Dict[str, str]]) -> str:
        """
        messages: list of {"role": "user"|"assistant", "content": "..."}
        """
        url = (
            f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent"
            f"?key={self.api_key}"
        )

        contents: List[Dict[str, Any]] = []
        if system_prompt:
            contents.append({"role": "user", "parts": [{"text": system_prompt}]})

        for msg in messages:
            role = "user" if msg["role"] == "user" else "model"
            contents.append({"role": role, "parts": [{"text": msg["content"]}]})

        payload = {"contents": contents}
        response = requests.post(url, json=payload, timeout=60)
        response.raise_for_status()
        data = response.json()

        candidates = data.get("candidates", [])
        if not candidates:
            return ""
        content = candidates[0].get("content", {})
        parts = content.get("parts", [])
        if not parts:
            return ""
        return parts[0].get("text", "")


def load_gemini_from_env() -> GeminiClient:
    return GeminiClient(
        api_key=os.getenv("GEMINI_API_KEY", ""),
        model=os.getenv("GEMINI_MODEL", ""),
    )
