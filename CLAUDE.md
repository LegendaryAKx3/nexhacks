# Claude AI Context Document

This document provides comprehensive context about the DeepResearchPod project for AI assistants like Claude to better understand the codebase and architecture.

## Project Overview

**DeepResearchPod** is a deep-research news platform that transforms overwhelming news into engaging, source-backed content. It uses Parallel.ai to discover fresh articles, then synthesizes them into three consumption formats: interactive video panels with character discussions, podcasts, and articles.

### Core Value Proposition
News is overwhelming and fragmented. DeepResearchPod answers "what's happening?" with a structured, source-backed brief that users can consume in their preferred format and time commitment.

## Technology Stack

```
Backend:       Python, FastAPI, Docker
Frontend:      React
Database:      MongoDB Atlas
AI:            Gemini (generation)
Voice:         ElevenLabs + LiveKit
Video:         Unity (character panels)
Infrastructure: DigitalOcean
CI/CD:         GitHub Actions
Domain:        .tech
```

## System Architecture

```
+------------------+     +------------------+     +------------------+
|   React Frontend |<--->|  FastAPI Backend |<--->|  MongoDB Atlas   |
+------------------+     +------------------+     +------------------+
           |                    |                          |
        +----------+     +----------+     +----------+
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
|  Unity Client    |  (Desktop only)
+------------------+
```

## Data Flow

1. **Parallel.ai search** → Fetch fresh articles for topics
2. **Normalize + dedupe** → Store articles in MongoDB
3. **Topic grouping** → Rank topics by recency, volume, novelty
4. **Content generation** → Create video scripts, podcasts, or articles via Gemini
5. **Voice synthesis** → Generate character audio via ElevenLabs
6. **Delivery** → Stream via LiveKit or serve static content

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/topics` | Ranked topic feed  |
| GET | `/topics/{id}` | Topic details with research + sources |
| POST | `/research/refresh` | Refresh research for a topic |
| POST | `/generate/article` | Generate text article |
| POST | `/generate/script` | Generate podcast/video script |
| POST | `/interrupt` | Handle user interruption mid-content |
| GET | `/watch/{content_id}` | Shareable video content page |
| GET | `/listen/{content_id}` | Shareable audio/podcast page |
| GET | `/read/{content_id}` | Shareable article page |

## Database Schema (MongoDB)

### collections: sources, articles, topics, research, scripts, articles

**sources**
- Store raw article sources from Parallel.ai
- Fields: provider, title, url, snippet, source_name, published_at, fetched_at

**articles**
- Normalized articles with topic associations
- Fields: source_id, canonical_url, title, excerpt, topic_id, published_at, fetched_at

**topics**
- Grouped themes from articles
- Fields: label, emoji, article_ids, last_refreshed_at, created_at

**research**
- Synthesized research briefs per topic
- Fields: topic_id, sources, summary, key_claims, open_questions, disagreements, generated_at

**scripts**
- Generated podcast/video scripts
- Fields: topic_id, research_id, duration_minutes, format, segments (speaker, text, timing, audio_url), status

**articles**
- Generated long-form articles
- Fields: topic_id, research_id, duration_minutes, title, content (markdown), sections

## AI Integration

### Gemini
- **Models**: `gemini-2.5-flash` (stable) or `gemini-3-flash-preview` (latest)
- **Use cases**: Script generation, article writing, research summarization, interruption responses
- **Character personalities**: Peter Griffin (casual, jokes), Stewie Griffin (intellectual, condescending), SpongeBob (optimistic, clarifying), Patrick (confused but insightful)

### Parallel.ai
- Primary research engine for article discovery
- Searches for fresh articles by topic query and trending terms
- Provides source-backed research data

### ElevenLabs
- Text-to-speech for character voices
- Voice IDs mapped to specific characters
- Generated audio cached in object storage

### LiveKit
- Real-time audio streaming for playback
- Handles interruptions and live Q&A

## Key Features

1. **Topic Feed**: Ranked, continuously refreshed list of researchable topics
2. **Multi-Format Content**: Video panels (Unity), audio podcasts, text articles
3. **Duration Control**: 5, 10, 15, or 30-minute content options
4. **Live Interruption**: Pause mid-content to ask questions (video/audio)
5. **Text Highlighting**: Ask questions about specific passages (articles)

## Platform Support

| Platform | Video | Audio | Text |
|----------|-------|-------|------|
| Desktop  | ✓     | ✓     | ✓    |
| Mobile   | ✗     | ✓     | ✓    |

Unity-based video panels are desktop-only. Mobile users get podcasts and articles.

## User Interruption Flow

```
User clicks "Interrupt" button
        ↓
Frontend pauses audio/video
        ↓
POST /interrupt with:
  - script_id
  - current_position_seconds
  - user question
        ↓
Backend:
  1. Get script context up to current position
  2. Generate response via Gemini (with character personality)
  3. Generate audio via ElevenLabs
  4. Return response + audio URL
        ↓
Frontend:
  1. Play response audio
  2. Resume original content from saved position
```

## Background Tasks

| Task | Frequency | Description |
|------|-----------|-------------|
| Parallel.ai refresh | Every 30–60 min | Fetch new articles for configured queries/topics |
| Topic grouping | Every 1–2 hours | Update topic groups and rankings |
| Research refresh | Every 1–2 hours | Update research briefs per topic |
| Audio cleanup | Daily | Remove unused audio files |

## Development Environment

### Local Setup
```bash
# Clone and setup
git clone <repo-url>
cd deepresearchpod
cp .env.example .env
# Edit .env with API keys

# Start with Docker Compose
docker compose up --build

# Access services
# Backend: http://localhost:8000
# Frontend: http://localhost:3000
```

### Environment Variables
```bash
MONGODB_URI=mongodb+srv://...
GEMINI_API_KEY=...
PARALLEL_API_KEY=...
ELEVENLABS_API_KEY=...
LIVEKIT_API_KEY=...
VOICE_PETER_GRIFFIN=voice_id
VOICE_STEWIE_GRIFFIN=voice_id
VOICE_SPONGEBOB=voice_id
VOICE_PATRICK=voice_id
```

## Folder Structure

```
/
  backend/           # FastAPI application
    app/
      routers/       # API endpoints (topics, generate, research)
      services/      # External integrations (Parallel, Gemini, voice)
      models/        # Pydantic schemas
      db/            # MongoDB connection
  frontend/          # React web application
    src/
      components/    # Reusable UI components
      pages/         # Route pages (Home, Topic, Watch, Listen, Read)
  unity/             # Unity project for character panels
  scripts/           # Deployment and automation scripts
  docs/              # Documentation (plan.md, setup.md, README.md)
```

## Unity Integration

Unity project (desktop-only) handles:
- Character models with lip sync
- Animation controllers synced to audio
- WebSocket/REST communication with backend
- Real-time event handling (interruptions)

## Deployment

### DigitalOcean
- Ubuntu 22.04 droplet (2-4GB RAM)
- Docker + Docker Compose
- Nginx or Caddy for SSL
- GitHub Actions for CI/CD

### Domain
- .tech TLD
- A record to droplet IP
- SSL via Let's Encrypt

## Key Request/Response Examples

### GET /topics
```json
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
```

### POST /generate/script
```json
// Request
{
  "topic_id": "topic_123",
  "duration_minutes": 15,
  "format": "podcast"
}

// Response
{
  "script_id": "script_456",
  "segments": [...],
  "total_duration_seconds": 892
}
```

### POST /interrupt
```json
// Request
{
  "script_id": "script_456",
  "current_position_seconds": 245,
  "question": "What about the opposing view?"
}

// Response
{
  "response_text": "...",
  "audio_url": "https://...",
  "resume_position_seconds": 245
}
```

## Development Guidelines

1. **API-first**: Backend endpoints should be RESTful and well-documented
2. **Character consistency**: Maintain distinct personalities in script generation
3. **Source transparency**: Always link back to original sources
4. **Duration accuracy**: Generated content should match requested duration
5. **Error handling**: Graceful degradation when services fail
6. **Caching**: Cache generated audio and content aggressively
7. **Real-time**: Use WebSockets/LiveKit for interactive features

## Testing Strategy

- Unit tests for services (Parallel.ai, research synthesis)
- Integration tests for API endpoints
- End-to-end tests for complete user flows
- CI/CD via GitHub Actions

## Security Considerations

- API key management via environment variables
- MongoDB Atlas IP whitelisting
- CORS configuration for production
- Rate limiting on API endpoints
- Input validation on all user-provided data

## Performance Optimization

- Cache research briefs (1-2 hour TTL)
- Pre-generate audio for segments
- CDN for static assets
- Database indexing on topic_id, published_at
- Lazy loading for frontend components

---

*Last Updated: January 17, 2026*
