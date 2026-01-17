# DeepResearchPod

Deep-research news platform that uses Parallel.ai to discover fresh articles, then synthesizes them into engaging content across three formats: video panels, podcasts, and articles.

## Vision

News is overwhelming and fragmented. DeepResearchPod turns “what’s happening?” into a structured, source-backed brief and lets users choose the format and time commitment.

## Stack

| Layer | Technology |
|-------|------------|
| Backend | Python, FastAPI |
| Frontend | React |
| Database | MongoDB Atlas |
| AI | Gemini (generation) |
| Voice + Realtime | ElevenLabs + LiveKit |
| Video | Unity (character panels) |
| Hosting | DigitalOcean |
| CI/CD | GitHub Actions |
| Domain | .tech |

## How It Works

```
Parallel.ai search --> Normalize + dedupe articles --> Store news data in MongoDB
                                                                                 |
                                                                                 v
                                                                      Topic grouping + ranking
                                                                                                          |
                                                          +-------------+---------+---------+
                                                          |             |                   |
                                                   Video        Podcast             Article
                                           (Unity panels)   (audio only)     (text + Q&A)
```

## User Flow

1. **Browse topics** via a ranked feed
2. **Select duration**: 5, 10, 15, or 30 minutes
3. **Pick format**: Video, Audio, or Text
4. **Consume content** generated from curated research
5. **Interrupt anytime** (video/audio) to ask questions

## Platform Support

| Platform | Video | Audio | Text |
|----------|-------|-------|------|
| Desktop  | Yes   | Yes   | Yes  |
| Mobile   | No    | Yes   | Yes  |

Unity-based video panels require desktop. Mobile users get podcasts and articles.

## Features

- **Topic Feed**: Ranked, continuously refreshed list of researchable topics
- **Character Panels**: Familiar characters (Peter Griffin, SpongeBob, etc.) discuss topics
- **Live Interruption**: Pause panelists mid-discussion to ask questions
- **Text Highlighting**: Ask questions about specific passages in articles
- **Duration Control**: Fit news consumption to your available time

## Getting Started

See [setup.md](setup.md) for environment setup and local development.

See [plan.md](plan.md) for technical architecture details.
