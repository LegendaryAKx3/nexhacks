# DeepResearchPod Setup Guide

## Folder Structure

```
/
  docker-compose.yml          # Development
  docker-compose.prod.yml     # Production (DigitalOcean)
  .env.example
  README.md
  plan.md
  setup.md

  backend/
    Dockerfile
    requirements.txt
    app/
      __init__.py
      main.py
      routers/
        topics.py
        generate.py
        research.py
      services/
        parallel_ai.py
        research.py
        voice/
          elevenlabs.py
          livekit.py
      models/
        schemas.py
      db/
        mongodb.py

  frontend/
    package.json
    src/
      App.jsx
      components/
        TopicCard.jsx
        MediaPlayer.jsx
        ArticleView.jsx
      pages/
        Home.jsx
        Topic.jsx
        Watch.jsx        # /watch/{content_id}
        Listen.jsx       # /listen/{content_id}
        Read.jsx         # /read/{content_id}
      config.js

  unity/
    # Unity project (separate repo or subfolder)
    # Character panel scene
    # WebSocket client for backend communication

  scripts/
    digitalocean_setup.sh
    refresh_research.py

  .github/
    workflows/
      deploy.yml
      tests.yml
```

## Environment Variables

Create `.env` from `.env.example`:

```bash
# MongoDB Atlas
MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB=deepresearchpod

# Gemini API
GEMINI_API_KEY=your-gemini-api-key

# Parallel.ai
PARALLEL_API_KEY=your-parallel-api-key
PARALLEL_BASE_URL=https://api.parallel.ai  # optional

# Voice Providers
ELEVENLABS_API_KEY=your-elevenlabs-api-key
LIVEKIT_API_KEY=your-livekit-api-key
LIVEKIT_API_SECRET=your-livekit-api-secret
LIVEKIT_URL=wss://your-livekit-server.livekit.cloud

# Character voice IDs (ElevenLabs)
VOICE_PETER_GRIFFIN=voice_id_here
VOICE_STEWIE_GRIFFIN=voice_id_here
VOICE_SPONGEBOB=voice_id_here
VOICE_PATRICK=voice_id_here

# News API (Option B for research)
NEWS_API_KEY=optional

# Environment
ENV=development
LOG_LEVEL=INFO
CORS_ORIGINS=http://localhost:3000
```

## Docker Compose (Development)

```yaml
version: "3.8"

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    env_file: .env
    volumes:
      - ./backend/app:/app/app  # Hot reload
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    volumes:
      - ./frontend/src:/app/src
    environment:
      - REACT_APP_API_URL=http://localhost:8000
```

## Docker Compose (Production)

```yaml
version: "3.8"

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    env_file: .env
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    restart: unless-stopped
    depends_on:
      - backend
```

## Local Development

```bash
# Clone repo
git clone <repo-url>
cd deepresearchpod

# Setup environment
cp .env.example .env
# Edit .env with your API keys

# Start services
docker compose up --build

# Backend: http://localhost:8000
# Frontend: http://localhost:3000

# Test health
curl http://localhost:8000/health
```

## Backend Requirements

`backend/requirements.txt`:
```
fastapi
uvicorn[standard]
motor
pymongo
google-generativeai
httpx
pydantic
python-dotenv
```

## Frontend Setup

```bash
cd frontend
npm install
npm start
```

Key dependencies:
- React
- axios
- react-router-dom

## DigitalOcean Deployment

### 1. Create Droplet
- Ubuntu 22.04
- 2GB RAM minimum (4GB recommended)
- Enable monitoring

### 2. Initial Setup

SSH into droplet and run:

```bash
# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker

# Install Docker Compose
apt install docker-compose-plugin -y

# Clone repo
git clone <repo-url>
cd deepresearchpod

# Setup env
cp .env.example .env
nano .env  # Add production values

# Start
docker compose -f docker-compose.prod.yml up -d --build

# Verify
docker compose -f docker-compose.prod.yml ps
curl http://localhost:8000/health
```

### 3. Domain Setup (.tech)

1. Purchase domain from registrar
2. Add A record pointing to Droplet IP
3. Configure nginx or Caddy for SSL (optional but recommended)

Example Caddy config:
```
deepresearchpod.tech {
    reverse_proxy frontend:80
}

api.deepresearchpod.tech {
    reverse_proxy backend:8000
}
```

## GitHub Actions

### Deploy Workflow

`.github/workflows/deploy.yml`:
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to DigitalOcean
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.DO_HOST }}
          username: root
          key: ${{ secrets.DO_SSH_KEY }}
          script: |
            cd /root/deepresearchpod
            git pull
            docker compose -f docker-compose.prod.yml up -d --build
```

### Test Workflow

`.github/workflows/tests.yml`:
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
          pip install pytest

      - name: Run tests
        run: |
          cd backend
          pytest
```

## MongoDB Atlas Setup

1. Create cluster at mongodb.com/atlas
2. Create database user
3. Whitelist IPs (or allow from anywhere for dev)
4. Get connection string
5. Create the required collections (`sources`, `articles`, `topics`, `research`) as needed (MongoDB will also create them automatically on first insert).

## Unity Setup

Unity project is developed separately. Communication with backend:

1. Unity connects to backend WebSocket or REST API
2. Receives script segments with timing
3. Plays character animations synced to audio
4. Sends interrupt events back to backend

Unity requirements:
- Character models with lip sync capability
- Animation controller for each character
- Audio playback system
- WebSocket client for real-time events

## Quick Reference

| Service | Local URL | Purpose |
|---------|-----------|---------|
| Backend | http://localhost:8000 | API |
| Frontend | http://localhost:3000 | Web UI |
| MongoDB | Atlas connection | Database |
