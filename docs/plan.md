# DeepResearchPod Technical Architecture

## Service Overview

```
+------------------+     +------------------+     +------------------+
|   React Frontend |<--->|  FastAPI Backend |<--->|  MongoDB Atlas   |
+------------------+     +------------------+     +------------------+
           |     |     |
        +----------+     |     +----------+
        |                |                |
      +-----v-----+    +-----v-----+    +-----v-----+
      | ElevenLabs|    | Parallel  |    |  Gemini   |
      |  (Voice)  |    |   .ai     |    | (Generate)|
      +-----------+    +-----------+    +-----------+

                    +------------------+
                    |     LiveKit      |
                    | (Realtime audio) |
                    +------------------+

+------------------+
|  Unity Client    |  (Desktop only, communicates with backend)
+------------------+
```

## Backend API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/topics` | Ranked topic feed  |
| GET | `/topics/{id}` | Topic details with research + sources |
| POST | `/research/refresh` | Refresh research for a topic (Parallel.ai search + synthesis) |
| POST | `/generate/article` | Generate text article for topic |
| POST | `/generate/script` | Generate podcast/video script |
| POST | `/interrupt` | Handle user interruption mid-content |
| GET | `/watch/{content_id}` | Shareable video content page |
| GET | `/listen/{content_id}` | Shareable audio/podcast page |
| GET | `/read/{content_id}` | Shareable article page |

### Key Request/Response Shapes

```python
# GET /topics
{
  "topics": [
    {
      "id": "topic_123",
      "label": "US Politics",
      "emoji": "🇺🇸",
      "article_count": 42,
      "last_refreshed_at": "2026-01-17T12:00:00Z"
    }
  ]
}

# POST /generate/script
Request: {
  "topic_id": "topic_123",
  "duration_minutes": 15,
  "format": "podcast"  # or "video"
}
Response: {
  "script_id": "script_456",
  "segments": [...],
  "total_duration_seconds": 892
}

# POST /interrupt
Request: {
  "script_id": "script_456",
  "current_position_seconds": 245,
  "question": "What about the opposing view?"
}
Response: {
  "response_text": "...",
  "audio_url": "https://...",  # ElevenLabs generated
  "resume_position_seconds": 245
}
```

## MongoDB Collections

### sources
```javascript
{
  _id: ObjectId,
  provider: String,             // "parallel_ai" (or other)
  title: String,
  url: String,
  snippet: String,
  source_name: String,          // "Reuters", "AP", etc.
  published_at: Date,
  fetched_at: Date
}
```

### articles
```javascript
{
  _id: ObjectId,
  source_id: ObjectId,
  canonical_url: String,
  title: String,
  excerpt: String,
  published_at: Date,
  topic_id: ObjectId,           // Reference to topic (optional until clustered)
  fetched_at: Date,
  updated_at: Date
}
```

### topics
```javascript
{
  _id: ObjectId,
  label: String,
  emoji: String,
  article_ids: [ObjectId],
  last_refreshed_at: Date,
  created_at: Date
}
```

### research
```javascript
{
  _id: ObjectId,
  topic_id: ObjectId,
  sources: [{
    title: String,
    url: String,
    snippet: String,
    source_name: String,        // "Reuters", "AP", etc.
    published_at: Date
  }],
  summary: String,              // Gemini-generated summary
  key_claims: [String],
  open_questions: [String],
  disagreements: [String],
  generated_at: Date
}
```

### scripts
```javascript
{
  _id: ObjectId,
  topic_id: ObjectId,
  research_id: ObjectId,
  duration_minutes: Number,     // 5, 10, 15, or 30
  format: String,               // "podcast" or "video"
  segments: [{
    speaker: String,            // "peter_griffin", "spongebob", etc.
    text: String,
    start_seconds: Number,
    end_seconds: Number,
    audio_url: String           // ElevenLabs generated audio
  }],
  status: String,               // "generating", "ready", "failed"
  created_at: Date
}
```

### articles
```javascript
{
  _id: ObjectId,
  topic_id: ObjectId,
  research_id: ObjectId,
  duration_minutes: Number,
  title: String,
  content: String,              // Markdown
  sections: [{
    heading: String,
    body: String
  }],
  created_at: Date
}
```

## Gemini Integration

### Generation
- Model: `gemini-2.5-flash` (stable) or `gemini-3-flash-preview` (latest)
- Used for: script generation, article writing, research summarization, interruption responses

### Prompting Strategy
Scripts include character personalities:
```
You are generating a podcast script between characters discussing {topic}.

Characters:
- Peter Griffin: Casual, makes jokes, sometimes misses the point
- Stewie Griffin: Intellectual, condescending, uses complex vocabulary
- SpongeBob: Optimistic, asks clarifying questions
- Patrick: Confused but occasionally insightful

Duration target: {duration} minutes
Research context: {research_summary}
```

## Voice Integration

### Providers
- **ElevenLabs** - Primary TTS for character voices
- **LiveKit** - Real-time audio rooms for playback + interruptions

### Usage
- Generate audio for each script segment
- Voice IDs mapped to characters
- Cache generated audio in object storage
- Stream audio via LiveKit (or deliver URLs for non-realtime clients)

## Topic Discovery (Feed-Based)

1. Parallel.ai searches for fresh articles (by topic query and/or trending terms)
2. Store normalized sources/articles in MongoDB
3. Group articles into topics using simple heuristics (keywords/entities) and recency
5. Rank topics for the feed (recency + volume + novelty)
6. Frontend renders a ranked list/grid feed

## User Interruption Flow

```
User clicks "Interrupt" button
        |
        v
Frontend pauses audio/video
        |
        v
POST /interrupt with:
  - script_id
  - current_position_seconds
  - user question
        |
        v
Backend:
  1. Get script context up to current position
  2. Generate response via Gemini (with character personality)
  3. Generate audio via ElevenLabs
  4. Return response + audio URL
        |
        v
Frontend:
  1. Play response audio
  2. Resume original content from saved position
```

## Research Pipeline Options

### Primary: Parallel.ai
- Use Parallel.ai to search and retrieve relevant recent articles
- Dedupe + normalize sources, then synthesize a structured brief with Gemini

### Fallback: Gemini Grounding (Optional)
- Use Gemini search/grounding only if Parallel.ai is unavailable

## Cron Jobs / Background Tasks

| Task | Frequency | Description |
|------|-----------|-------------|
| Parallel.ai refresh | Every 30–60 min | Fetch new articles for configured queries/topics |
| Topic grouping | Every 1–2 hours | Update topic groups and rankings |
| Research refresh | Every 1–2 hours | Update research briefs per topic |
| Audio cleanup | Daily | Remove unused audio files |
