# GENzNEWS

**News that adapts to you—watch, listen, or read.**

---

## The Problem

News is overwhelming. 100+ sources daily. AI summaries oversimplify. Full articles take hours. No single format fits every moment.

## Our Solution

One research query → three formats:
- **Watch**: Character video panels (Peter & Stewie debate the news)
- **Listen**: Podcast with full transcript
- **Read**: Long-form article with sections

Pick your duration (5–30 min). Get source-backed content tailored to the time you have.

---

## How It Works

```
Topic → Parallel.ai → Gemini → Watch / Listen / Read
           ↓            ↓
        Sources    ElevenLabs + LiveKit (voice)
            Unity (video panels)
```

**Key Features**:
- Dual-agent conversations (Peter: casual & funny, Stewie: analytical & sharp)
- Real-time voice AI with LiveKit Agents
- Every claim linked to sources—no hallucination hand-waving
- Background research tasks with live status polling

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Backend | FastAPI, MongoDB, Pydantic |
| Frontend | React, Vite |
| Research | Parallel.ai (ultra processor) |
| Generation | Gemini 2.5 Flash Lite |
| Voice | ElevenLabs, Cartesia, AssemblyAI, LiveKit Agents |
| Video | Unity |

---

## What Makes It Work

**The Research Pipeline**: Parallel.ai tasks run 2–5 minutes. We built a polling system with MongoDB-backed task queues so users see real-time progress without HTTP timeouts.

**Dual-Agent Voices**: Peter and Stewie alternate responses with shared conversation history. Not a monologue—an actual discussion powered by character-specific Gemini prompts and ElevenLabs voices.

**Editorial Design**: Playfair Display + Source Serif 4 typography. Rich black with cream text and burnt orange accents. This isn't generic AI slop—it looks like a premium publication.

---

## Challenges We Solved

| Challenge | Solution |
|-----------|----------|
| 5-minute research tasks timing out | Background queue + polling endpoint |
| AI agents talking over each other | Turn-based history with identity filtering |
| Different formats from same research | Format-specific prompts targeting words/minute |
| MongoDB down during dev | Automatic JSON file fallback |

---

## What's Next

- Finish Unity lip-sync for video panels
- WebSocket research updates (replace polling)
- Mobile apps for podcast-on-the-go
- More characters beyond Peter & Stewie

---

## Why Vote for Us

**It runs.** Video, podcast, and article generation from live research.

**Five AI services orchestrated.** Parallel.ai → Gemini → ElevenLabs → LiveKit → Unity.

**Production patterns.** Async queues, type safety, graceful fallbacks.

**Looks good.** Editorial design that signals quality.

GENzNEWS: news that finally works the way it should.

---

*Built for NexHacks 2026*
