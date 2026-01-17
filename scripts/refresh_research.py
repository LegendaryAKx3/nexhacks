import asyncio
import os

import httpx

API_URL = os.getenv("API_URL", "http://localhost:8000")
TOPIC_ID = os.getenv("TOPIC_ID", "")


async def main() -> None:
    if not TOPIC_ID:
        raise SystemExit("TOPIC_ID is required")

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{API_URL}/research/refresh",
            json={"topic_id": TOPIC_ID},
            timeout=30,
        )
        response.raise_for_status()
        print(response.json())


if __name__ == "__main__":
    asyncio.run(main())
