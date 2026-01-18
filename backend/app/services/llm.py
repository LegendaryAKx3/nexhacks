import os
import json
import asyncio
import re
import logging
from typing import List, Optional
import google.generativeai as genai
from app.models.schemas import ScriptSegment, ArticleSection

_logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash-lite-preview-02-05")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

def fix_double_encoded_utf8(text: str) -> str:
    """Fix double-encoded UTF-8 text (e.g., em dash showing as garbled characters instead of '—').
    
    When UTF-8 bytes are incorrectly decoded as Latin-1/CP1252, multi-byte characters become
    sequences of Latin-1 characters. This function uses regex to find and fix these patterns
    while preserving valid Unicode characters in the text.
    """
    if not text:
        return text
    
    def fix_utf8_sequence(match):
        """Fix a single corrupted 3-byte UTF-8 sequence."""
        try:
            # Get the 3 characters that represent the corrupted UTF-8 bytes
            chars = match.group(0)
            # Encode to latin-1 to get the original bytes, then decode as UTF-8
            return chars.encode('latin-1').decode('utf-8')
        except (UnicodeDecodeError, UnicodeEncodeError):
            return match.group(0)  # Return original if fix fails
    
    # Pattern to match 3-byte UTF-8 sequences that were decoded as Latin-1
    # First byte: 0xE0-0xEF (in Latin-1: à-ï, but we focus on common ones)
    # Second & third bytes: 0x80-0xBF (in Latin-1: control chars + special)
    # Common pattern for corrupted UTF-8: starts with â (0xE2) followed by €/€ (0x80) and other chars
    pattern = r'[\u00e0-\u00ef][\u0080-\u00bf][\u0080-\u00bf]'
    
    fixed = re.sub(pattern, fix_utf8_sequence, text)
    
    # Also fix 2-byte sequences (for characters like ©, ®, etc.)
    pattern_2byte = r'[\u00c2-\u00df][\u0080-\u00bf]'
    fixed = re.sub(pattern_2byte, fix_utf8_sequence, fixed)
    
    return fixed

def clean_markdown(text: str) -> str:
    """Remove common markdown formatting symbols and fix encoding issues."""
    # First, try to fix double-encoded UTF-8
    text = fix_double_encoded_utf8(text)
    
    # Convert escaped newlines to actual newlines for consistent processing
    text = text.replace('\\n', '\n')
    
    # Remove bold markers
    text = re.sub(r'\*\*(.*?)\*\*', r'\1', text)
    text = re.sub(r'__(.*?)__', r'\1', text)
    
    # Remove header symbols (## Header -> Header)
    text = re.sub(r'(^|\n)#+\s*', r'\1', text)
    
    # Remove horizontal rules
    text = re.sub(r'(^|\n)---+\s*(\n|$)', r'\1', text)
    
    # Remove list markers (* item or - item -> item)
    text = re.sub(r'(^|\n)\s*[\*\-]\s+', r'\1• ', text)
    
    # Remove reference-style link markers [1], [2], etc.
    text = re.sub(r'\s*\[\d+\]', '', text)
    
    # Collapse multiple newlines into double newlines (paragraph breaks)
    text = re.sub(r'\n{3,}', '\n\n', text)
    
    # Collapse multiple spaces
    text = re.sub(r' {2,}', ' ', text)
    
    return text.strip()

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
                text=clean_markdown(seg.get("text", "")),
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
    research_summary: str,
    duration_minutes: int = 2
) -> tuple[str, str, List[ArticleSection]]:
    if not GEMINI_API_KEY:
        return (
            f"Article about {topic}",
            "Please configure GEMINI_API_KEY.",
            []
        )

    # Average reading rate ~200 words per minute
    target_word_count = duration_minutes * 200

    prompt = f"""
    You are an expert journalist.
    Topic: {topic}
    Target Duration: {duration_minutes} minutes.
    Target Word Count: Approximately {target_word_count} words total.
    
    Research Material:
    {research_summary}
    
    Write a comprehensive article based on the research.
    
    IMPORTANT:
    1. The article MUST be concise enough to be read in {duration_minutes} minutes.
    2. The total word count (intro + all sections) should be close to {target_word_count} words.
    3. Do NOT exceed the target length significantly.
    4. Do NOT use Markdown formatting symbols like ##, **, or __ in the text. The structure is already provided by the JSON format. Headings should be plain text.
    
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
        
        title = clean_markdown(data.get("title", f"Article: {topic}"))
        intro = clean_markdown(data.get("intro", ""))
        raw_sections = data.get("sections", [])
        
        sections = [
            ArticleSection(
                heading=clean_markdown(s.get("heading", "")), 
                body=clean_markdown(s.get("body", ""))
            )
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
