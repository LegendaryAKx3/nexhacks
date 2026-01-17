# PolyPod

Prediction-powered news platform that transforms Polymarket data and news sources into engaging content across three formats: video panels, podcasts, and articles.

## Vision

Traditional news lacks concrete predictions and often carries bias. PolyPod combines Polymarket's crowd-sourced probabilities with mainstream news sources to deliver balanced, forward-looking coverage. Users choose their format and time commitment.

## Stack

| Layer | Technology |
|-------|------------|
| Backend | Python, FastAPI, Docker |
| Frontend | React |
| Database | MongoDB Atlas (vector search) |
| AI | Gemini (embeddings + generation) |
| Voice | 11Labs, fish.audio, livekit |
| Video | Unity (character panels) |
| Hosting | DigitalOcean |
| CI/CD | GitHub Actions |
| Domain | .tech |

## How It Works

```
Polymarket API --> Embed titles/descriptions --> MongoDB vectors
                                                      |
                                                      v
                                              Cluster + TSNE
                                                      |
                                                      v
                                          Interactive topic map
                                                      |
                              +-------------+---------+---------+
                              |             |                   |
                           Video        Podcast             Article
                       (Unity panels)   (audio only)     (text + Q&A)
```

## User Flow

1. **Browse topics** via TSNE visualization or feed view
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

- **TSNE Topic Map**: Interactive visualization of clustered Polymarket predictions
- **Character Panels**: Familiar characters (Peter Griffin, SpongeBob, etc.) discuss topics
- **Live Interruption**: Pause panelists mid-discussion to ask questions
- **Text Highlighting**: Ask questions about specific passages in articles
- **Duration Control**: Fit news consumption to your available time

## Getting Started

See [setup.md](setup.md) for environment setup and local development.

See [plan.md](plan.md) for technical architecture details.
