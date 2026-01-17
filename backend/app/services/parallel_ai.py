from typing import List

from app.models.schemas import Source


async def search_sources(query: str, limit: int = 10) -> List[Source]:
    return []
