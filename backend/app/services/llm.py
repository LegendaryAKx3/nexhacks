import os
import json
import asyncio
from typing import List, Optional
import google.generativeai as genai
from app.models.schemas import ScriptSegment, ArticleSection

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash-lite-preview-02-05")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

async def generate_script_content(
    topic: str,
    research_summary: str,
    duration_minutes: int,
    format_type: str
) -> List[ScriptSegment]:
    if not GEMINI_API_KEY:
        return [
            ScriptSegment(
                speaker="Host",
                text=f"Welcome to our {format_type} about {topic}. Please configure GEMINI_API_KEY to generate real content.",
                start_seconds=0,
                end_seconds=10
            )
        ]

    # Average speaking rate ~150 words per minute
    target_word_count = duration_minutes * 150
    
    prompt = f"""
    You are an expert scriptwriter for a {format_type}.
    Topic: {topic}
    Target Duration: {duration_minutes} minutes.
    Target Word Count: Approximately {target_word_count} words.
    
    Research Material:
    {research_summary}
    
    Generate a compelling, natural-sounding script based on the research.
    
    IMPORTANT:
    1. The script MUST be long enough to fill the target duration of {duration_minutes} minutes.
    2. The total word count should be close to {target_word_count} words.
    3. Ensure the dialogue is engaging and informative.
    
    Return the response as a valid JSON object with a key "segments", which is a list of objects.
    Each segment object must have:
    - "speaker": Name of the speaker (e.g., "Host", "Guest", "Narrator").
    - "text": The spoken text.
    - "estimated_duration": Estimated duration in seconds (integer).
    
    Example format:
    {{
        "segments": [
            {{"speaker": "Host", "text": "Hello world.", "estimated_duration": 2}}
        ]
    }}
    """

    try:
        model = genai.GenerativeModel(GEMINI_MODEL)
        response = await model.generate_content_async(
            prompt,
            generation_config=genai.types.GenerationConfig(
                response_mime_type="application/json",
            ),
        )
        
        data = json.loads(response.text)
        raw_segments = data.get("segments", [])
        
        segments = []
        current_time = 0
        for seg in raw_segments:
            duration = seg.get("estimated_duration", 5)
            segments.append(ScriptSegment(
                speaker=seg.get("speaker", "Host"),
                text=seg.get("text", ""),
                start_seconds=current_time,
                end_seconds=current_time + duration
            ))
            current_time += duration
            
        return segments

    except Exception as e:
        print(f"Error generating script: {e}")
        return [
            ScriptSegment(
                speaker="System",
                text=f"Error generating script: {str(e)}",
                start_seconds=0,
                end_seconds=5
            )
        ]

async def generate_article_content(
    topic: str,
    research_summary: str
) -> tuple[str, str, List[ArticleSection]]:
    if not GEMINI_API_KEY:
        return (
            f"Article about {topic}",
            "Please configure GEMINI_API_KEY.",
            []
        )

    prompt = f"""
    You are an expert journalist.
    Topic: {topic}
    
    Research Material:
    {research_summary}
    
    Write a comprehensive article based on the research.
    
    Return the response as a valid JSON object with the following keys:
    - "title": The title of the article.
    - "intro": A brief introduction (2-3 paragraphs).
    - "sections": A list of objects, each having:
        - "heading": Section heading.
        - "body": The content of the section.
    """

    try:
        model = genai.GenerativeModel(GEMINI_MODEL)
        response = await model.generate_content_async(
            prompt,
            generation_config=genai.types.GenerationConfig(
                response_mime_type="application/json",
            ),
        )
        
        data = json.loads(response.text)
        
        title = data.get("title", f"Article: {topic}")
        intro = data.get("intro", "")
        raw_sections = data.get("sections", [])
        
        sections = [
            ArticleSection(heading=s.get("heading", ""), body=s.get("body", ""))
            for s in raw_sections
        ]
        
        return title, intro, sections

    except Exception as e:
        print(f"Error generating article: {e}")
        return (
            f"Error: {topic}",
            f"An error occurred: {str(e)}",
            []
        )


async def generate_podcast_script(
    topic: str,
    research_summary: str,
    duration_minutes: int,
) -> List[ScriptSegment]:
    if not GEMINI_API_KEY:
        return [
            ScriptSegment(
                speaker="Host",
                text=f"Welcome to our podcast about {topic}. Please configure GEMINI_API_KEY to generate real content.",
                start_seconds=0,
                end_seconds=10,
            )
        ]

    target_word_count = duration_minutes * 150
    prompt = f"""
    You are an expert podcast producer and host.
    Topic: {topic}
    Target Duration: {duration_minutes} minutes.
    Target Word Count: Approximately {target_word_count} words.

    Research Material:
    {research_summary}

    Write a narrative podcast script that summarizes the key points from the research.
    Keep the tone conversational, structured, and engaging.

    Return the response as a valid JSON object with a key "segments", which is a list of objects.
    Each segment object must have:
    - "speaker": Name of the speaker (e.g., "Host", "Guest").
    - "text": The spoken text.
    - "estimated_duration": Estimated duration in seconds (integer).
    """

    try:
        model = genai.GenerativeModel(GEMINI_MODEL)
        response = await model.generate_content_async(
            prompt,
            generation_config=genai.types.GenerationConfig(
                response_mime_type="application/json",
            ),
        )

        data = json.loads(response.text)
        raw_segments = data.get("segments", [])

        segments = []
        current_time = 0
        for seg in raw_segments:
            duration = seg.get("estimated_duration", 5)
            segments.append(
                ScriptSegment(
                    speaker=seg.get("speaker", "Host"),
                    text=seg.get("text", ""),
                    start_seconds=current_time,
                    end_seconds=current_time + duration,
                )
            )
            current_time += duration

        return segments
    except Exception as e:
        print(f"Error generating podcast script: {e}")
        return [
            ScriptSegment(
                speaker="System",
                text=f"Error generating podcast script: {str(e)}",
                start_seconds=0,
                end_seconds=5,
            )
        ]
