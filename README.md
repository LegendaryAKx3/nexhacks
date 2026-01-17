# DeepResearchPod

> Transform overwhelming news into engaging, source-backed content—watch, listen, or read on your schedule.

[![Deploy Status](https://github.com/LegendaryAKx3/nexhacks/workflows/Deploy/badge.svg)](https://github.com/LegendaryAKx3/nexhacks/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🎯 Vision

News is overwhelming and fragmented. **DeepResearchPod** turns "what's happening?" into a structured, source-backed brief and lets you choose the format and time commitment—whether you have 5 minutes or 30.

## ✨ Features

- 📰 **Topic Feed**: Continuously refreshed, ranked list of breaking and trending topics
- 🎭 **Character Panels**: Familiar characters (Peter Griffin, SpongeBob, etc.) discuss topics in engaging video format
- 🎙️ **Podcast Mode**: Audio-only content for on-the-go consumption
- 📝 **Article Format**: Deep-dive text articles with source links
- ⏸️ **Live Interruption**: Pause mid-content to ask questions (video/audio modes)
- 🔗 **Source Transparency**: All content linked to original research sources
- ⏱️ **Duration Control**: Choose 5, 10, 15, or 30-minute content

## 🏗️ Architecture

```
Parallel.ai → Articles → MongoDB → Topic Grouping
                                         ↓
                              ┌──────────┼──────────┐
                              ↓          ↓          ↓
                           Video     Podcast    Article
                        (Unity)    (Audio)     (Text)
```

### Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Python, FastAPI, Docker |
| **Frontend** | React |
| **Database** | MongoDB Atlas |
| **AI** | Gemini (generation) |
| **Voice** | ElevenLabs + LiveKit |
| **Video** | Unity (character panels) |
| **Hosting** | DigitalOcean |
| **CI/CD** | GitHub Actions |
| **Domain** | .tech |

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for frontend development)
- Python 3.11+ (for backend development)
- API keys for: Gemini, Parallel.ai, ElevenLabs, LiveKit

### Local Development

```bash
# Clone repository
git clone https://github.com/LegendaryAKx3/nexhacks.git
cd nexhacks

# Setup environment variables
cp .env.example .env
# Edit .env with your API keys

# Start services with Docker Compose
docker compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Environment Variables

Create a `.env` file with the following:

```bash
# MongoDB
MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB=deepresearchpod

# AI Services
GEMINI_API_KEY=your-gemini-api-key
PARALLEL_API_KEY=your-parallel-api-key

# Voice Services
ELEVENLABS_API_KEY=your-elevenlabs-api-key
LIVEKIT_API_KEY=your-livekit-api-key
LIVEKIT_API_SECRET=your-livekit-api-secret
LIVEKIT_URL=wss://your-livekit-server.livekit.cloud

# Character Voice IDs (ElevenLabs)
VOICE_PETER_GRIFFIN=voice_id_here
VOICE_STEWIE_GRIFFIN=voice_id_here
VOICE_SPONGEBOB=voice_id_here
VOICE_PATRICK=voice_id_here

# Environment
ENV=development
LOG_LEVEL=INFO
CORS_ORIGINS=http://localhost:3000
```

## 📱 Platform Support

| Platform | Video | Audio | Text |
|----------|-------|-------|------|
| Desktop  | ✓     | ✓     | ✓    |
| Mobile   | ✗     | ✓     | ✓    |

*Unity-based video panels require desktop. Mobile users get full access to podcasts and articles.*

## 🎮 How It Works

1. **Discover**: Browse a ranked feed of current topics powered by Parallel.ai
2. **Choose Duration**: Select 5, 10, 15, or 30 minutes
3. **Pick Format**: Video panels, audio podcast, or text article
4. **Consume**: Engage with AI-generated content backed by real sources
5. **Interact**: Interrupt anytime to ask questions or dig deeper

### User Flow

```
Browse Topics → Select Duration → Choose Format → Consume Content
                                                        ↓
                                              Interrupt to Ask Questions
                                              (Video/Audio modes only)
```

## 📚 Documentation

- [**CLAUDE.md**](CLAUDE.md) - Comprehensive AI context document
- [**docs/plan.md**](docs/plan.md) - Technical architecture details
- [**docs/setup.md**](docs/setup.md) - Deployment and environment setup
- [**docs/README.md**](docs/README.md) - Project overview

## 🛠️ Development

### Backend (FastAPI)

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend (React)

```bash
cd frontend
npm install
npm start
```

### Unity Client

Unity project for desktop video panels. See `unity/` directory for setup instructions.

## 🚢 Deployment

### DigitalOcean

```bash
# SSH into droplet
ssh root@your-droplet-ip

# Clone repository
git clone https://github.com/LegendaryAKx3/nexhacks.git
cd nexhacks

# Setup environment
cp .env.example .env
nano .env  # Add production API keys

# Deploy with Docker Compose
docker compose -f docker-compose.prod.yml up -d --build

# Verify deployment
curl http://localhost:8000/health
```

### CI/CD

Automated deployment via GitHub Actions on push to `main` branch. See [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test

# Integration tests
docker compose -f docker-compose.test.yml up --abort-on-container-exit
```

## 📡 API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/topics` | Ranked topic feed  |
| `GET` | `/topics/{id}` | Topic details with research |
| `POST` | `/research/refresh` | Refresh research for topic |
| `POST` | `/generate/article` | Generate text article |
| `POST` | `/generate/script` | Generate podcast/video script |
| `POST` | `/interrupt` | Handle user interruption |
| `GET` | `/watch/{content_id}` | Video content page |
| `GET` | `/listen/{content_id}` | Audio/podcast page |
| `GET` | `/read/{content_id}` | Article page |

Full API documentation available at `/docs` when running locally.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Parallel.ai** - Research and article discovery
- **Google Gemini** - Content generation
- **ElevenLabs** - Character voice synthesis
- **LiveKit** - Real-time audio streaming
- **MongoDB Atlas** - Database hosting

## 📧 Contact

Project Link: [https://github.com/LegendaryAKx3/nexhacks](https://github.com/LegendaryAKx3/nexhacks)

---

Built with ❤️ for NexHacks 2026
