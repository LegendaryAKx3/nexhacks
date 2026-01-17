# PolyPod Technical Architecture

## Service Overview

```
+------------------+     +------------------+     +------------------+
|   React Frontend |<--->|  FastAPI Backend |<--->|  MongoDB Atlas   |
+------------------+     +------------------+     +------------------+
                               |     |
                    +----------+     +----------+
                    |                           |
              +-----v-----+              +------v------+
              |  11Labs   |              |   Gemini    |
              |  (Voice)  |              | (AI/Embed)  |
              +-----------+              +-------------+

+------------------+
|  Unity Client    |  (Desktop only, communicates with backend)
+------------------+
```

## Backend API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/topics` | TSNE visualization data (clusters + coordinates) |
| GET | `/topics/{id}` | Topic details with research |
| GET | `/feed` | YouTube-style topic feed (alternative to TSNE) |
| POST | `/generate/article` | Generate text article for topic |
| POST | `/generate/script` | Generate podcast/video script |
| POST | `/interrupt` | Handle user interruption mid-content |
| GET | `/markets/sync` | Trigger Polymarket data refresh |
| GET | `/watch/{content_id}` | Shareable video content page |
| GET | `/listen/{content_id}` | Shareable audio/podcast page |
| GET | `/read/{content_id}` | Shareable article page |

### Key Request/Response Shapes

```python
# GET /topics
{
  "clusters": [
    {
      "id": "cluster_123",
      "label": "US Politics",
      "emoji": "🇺🇸",
      "tsne_x": 0.45,
      "tsne_y": -0.23,
      "market_count": 42
    }
  ]
}

# POST /generate/script
Request: {
  "topic_id": "cluster_123",
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
  "audio_url": "https://...",  # 11Labs generated
  "resume_position_seconds": 245
}
```

## MongoDB Collections

### markets
```javascript
{
  _id: ObjectId,
  polymarket_id: String,        // Unique ID from Polymarket
  title: String,
  description: String,
  probability: Number,          // 0.0 - 1.0
  volume: Number,
  end_date: Date,
  embedding: [Number],          // Gemini embedding vector
  embedding_model: String,
  cluster_id: ObjectId,         // Reference to cluster
  fetched_at: Date,
  updated_at: Date
}
```

### clusters
```javascript
{
  _id: ObjectId,
  label: String,                // Human-readable topic name
  emoji: String,                // Visual identifier
  tsne_x: Number,
  tsne_y: Number,
  market_ids: [ObjectId],
  centroid: [Number],           // Cluster center in embedding space
  created_at: Date
}
```

### research
```javascript
{
  _id: ObjectId,
  cluster_id: ObjectId,
  sources: [{
    title: String,
    url: String,
    snippet: String,
    source_name: String,        // "Reuters", "AP", etc.
    published_at: Date
  }],
  summary: String,              // Gemini-generated summary
  sentiment_polymarket: String, // Aggregated from market probabilities
  sentiment_mainstream: String, // Aggregated from news sources
  generated_at: Date
}
```

### scripts
```javascript
{
  _id: ObjectId,
  cluster_id: ObjectId,
  research_id: ObjectId,
  duration_minutes: Number,     // 5, 10, 15, or 30
  format: String,               // "podcast" or "video"
  segments: [{
    speaker: String,            // "peter_griffin", "spongebob", etc.
    text: String,
    start_seconds: Number,
    end_seconds: Number,
    audio_url: String           // 11Labs generated audio
  }],
  status: String,               // "generating", "ready", "failed"
  created_at: Date
}
```

### articles
```javascript
{
  _id: ObjectId,
  cluster_id: ObjectId,
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

## Vector Search Index

```json
{
  "name": "markets_vector_search",
  "type": "vectorSearch",
  "definition": {
    "fields": [
      { "type": "vector", "path": "embedding", "numDimensions": 768, "similarity": "cosine" }
    ]
  }
}
```

## Gemini Integration

### Embeddings
- Model: `gemini-embedding-001` (GA, top MTEB leaderboard)
- Dimensions: 768
- Use `RETRIEVAL_DOCUMENT` for indexing markets
- Use `RETRIEVAL_QUERY` for search

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
- **11Labs** - Primary TTS for character voices
- **fish.audio** - Alternative TTS option
- **livekit** - Real-time audio streaming

### Usage
- Generate audio for each script segment
- Voice IDs mapped to characters
- Cache generated audio in object storage
- Stream audio to frontend for playback

## TSNE Visualization

1. Fetch all market embeddings from MongoDB
2. Run TSNE dimensionality reduction (768D -> 2D)
3. Apply clustering (k-means or DBSCAN)
4. Assign labels/emojis to clusters (Gemini)
5. Store cluster metadata in MongoDB
6. Frontend renders interactive scatter plot

### Visualization Requirements
- Clusters visually distinct (color-coded)
- Hover shows cluster label + emoji
- Click navigates to topic detail
- Responsive for desktop

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
  3. Generate audio via 11Labs
  4. Return response + audio URL
        |
        v
Frontend:
  1. Play response audio
  2. Resume original content from saved position
```

## Research Pipeline Options

### Option A: Gemini Grounding
- Use Gemini's built-in search/grounding capability
- Simpler integration
- Less control over sources

### Option B: External News API
- Fetch from NewsAPI, Google News, or similar
- More control over sources and filtering
- Requires API key management
- Can curate specific outlets

Decision deferred to implementation phase.

## Cron Jobs / Background Tasks

| Task | Frequency | Description |
|------|-----------|-------------|
| Polymarket sync | Every 1 hour | Fetch latest markets from Polymarket API |
| Embedding update | After sync | Generate embeddings for new/updated markets |
| Clustering | Every hour | Re-run TSNE + clustering |
| Research refresh | Every 2 hours | Update news articles per cluster |
| Audio cleanup | Daily | Remove unused audio files |
