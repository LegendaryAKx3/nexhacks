# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PolyPod is a full-stack prediction-powered news platform that transforms Polymarket data and news sources into three content formats: video panels (Unity-based, desktop only), podcasts/audio, and articles. The platform uses vector embeddings for topic clustering and TSNE visualization.

## Development Commands

```bash
# Start all services (backend on :8000, frontend on :3000)
docker compose up --build

# Backend only (without Docker)
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Frontend only
cd frontend
npm install
npm start

# Run backend tests
cd backend
pytest

# Production deployment
docker compose -f docker-compose.prod.yml up -d --build

# Health check
curl http://localhost:8000/health
```

## Architecture

**Data Flow:**
```
Polymarket API -> Gemini Embeddings -> MongoDB (vector search)
                                            |
                                    TSNE + k-means clustering
                                            |
                                    Interactive topic map
                                            |
                        +--------+----------+-----------+
                        |        |                      |
                     Video    Podcast               Article
                   (Unity)   (11Labs)             (Markdown)
```

**Stack:**
- Backend: Python/FastAPI with Motor (async MongoDB driver)
- Frontend: React with react-plotly.js for TSNE visualization
- Database: MongoDB Atlas with vector search (768-dim Gemini embeddings)
- AI: Gemini for embeddings (`gemini-embedding-001`) and generation (`gemini-2.5-flash`)
- Voice: 11Labs (primary), fish.audio, LiveKit for real-time streaming
- Video: Unity (separate project, communicates via WebSocket/REST)

**Key Backend Structure:**
- `app/routers/` - API endpoints (topics, generate, markets)
- `app/services/` - Business logic (polymarket sync, embeddings, clustering, research, voice/)
- `app/models/schemas.py` - Pydantic models
- `app/db/mongodb.py` - Database connection

**Key Frontend Structure:**
- `src/components/` - TSNEVisualization, TopicCard, MediaPlayer, ArticleView
- `src/pages/` - Home, Topic, Watch, Listen, Read (shareable content pages)

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/topics` | TSNE visualization data (clusters + coordinates) |
| GET | `/topics/{id}` | Topic details with research |
| GET | `/feed` | Alternative feed view to TSNE |
| POST | `/generate/article` | Generate text article |
| POST | `/generate/script` | Generate podcast/video script |
| POST | `/interrupt` | Handle user interruption mid-content |
| GET | `/markets/sync` | Trigger Polymarket data refresh |

## MongoDB Collections

- `markets` - Polymarket data with embeddings (768-dim vector field)
- `clusters` - TSNE coordinates and cluster metadata
- `research` - News summaries per cluster
- `scripts` - Generated podcast/video scripts with audio URLs
- `articles` - Generated articles in Markdown

## Background Tasks

- Polymarket sync: hourly
- Embedding updates: after each sync
- TSNE clustering: hourly
- Research refresh: every 2 hours

## Environment Variables

Required in `.env`:
- `MONGODB_URI`, `MONGODB_DB` - MongoDB Atlas connection
- `GEMINI_API_KEY` - For embeddings and generation
- `ELEVENLABS_API_KEY` - Primary voice synthesis
- `VOICE_*` - Character voice IDs (PETER_GRIFFIN, STEWIE_GRIFFIN, SPONGEBOB, PATRICK)
- `CORS_ORIGINS` - Frontend URL for CORS

## Python Conventions

Use `uv` for pip and `py` for python when running commands locally (outside Docker).
