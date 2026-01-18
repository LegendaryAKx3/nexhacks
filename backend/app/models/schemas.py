from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class Source(BaseModel):
    title: str
    url: str
    snippet: Optional[str] = None
    source_name: Optional[str] = None
    published_at: Optional[datetime] = None


class Topic(BaseModel):
    id: str
    label: str
    emoji: str
    article_count: int
    last_refreshed_at: Optional[datetime] = None


class TopicsResponse(BaseModel):
    topics: List[Topic]


class TopicDetailResponse(BaseModel):
    id: str
    label: str
    emoji: str
    article_count: int
    last_refreshed_at: Optional[datetime] = None
    research_summary: Optional[str] = None
    sources: List[Source]


class ScriptSegment(BaseModel):
    speaker: str
    text: str
    start_seconds: int
    end_seconds: int
    audio_url: Optional[str] = None


class GenerateScriptRequest(BaseModel):
    topic_id: str
    duration_minutes: int
    format: str


class ScriptResponse(BaseModel):
    script_id: str
    segments: List[ScriptSegment]
    total_duration_seconds: int


class GeneratePodcastRequest(BaseModel):
    topic_id: str
    duration_minutes: int


class PodcastResponse(BaseModel):
    podcast_id: str
    segments: List[ScriptSegment]
    audio_base64: str
    mime_type: str
    total_duration_seconds: int


class InterruptRequest(BaseModel):
    script_id: str
    current_position_seconds: int
    question: str


class InterruptResponse(BaseModel):
    response_text: str
    audio_url: Optional[str] = None
    resume_position_seconds: int


class ArticleSection(BaseModel):
    heading: str
    body: str


class GenerateArticleRequest(BaseModel):
    topic_id: str
    duration_minutes: int


class ArticleResponse(BaseModel):
    article_id: str
    title: str
    content: str
    sections: List[ArticleSection]


class GenerateVideoScriptRequest(BaseModel):
    article_title: Optional[str] = None
    article_text: str


class VideoScriptResponse(BaseModel):
    script_id: str
    script_text: str


class ResearchRefreshRequest(BaseModel):
    topic_id: str
    query: Optional[str] = None


class ResearchRefreshResponse(BaseModel):
    topic_id: str
    status: str


class ResearchResult(BaseModel):
    summary: Optional[str] = None
    sources: List[Source] = []


class ResearchTaskResponse(BaseModel):
    task_id: str
    status: str


class ResearchTaskStatusResponse(BaseModel):
    task_id: str
    status: str
    result: Optional[ResearchResult] = None
    error: Optional[str] = None


class ResearchResultResponse(BaseModel):
    topic_id: str
    summary: Optional[str] = None
    sources: List[Source] = []
    generated_at: Optional[datetime] = None
