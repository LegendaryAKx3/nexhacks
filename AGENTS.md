# AGENTS.md

This document provides guidelines for AI agents working on the DeepResearchPod codebase.

## Project Overview

DeepResearchPod is a deep-research news platform that transforms news into engaging content across three formats: video panels (Unity), podcasts (audio), and articles (text). The stack includes:
- **Backend**: Python + FastAPI
- **Frontend**: React + Vite
- **Database**: MongoDB Atlas
- **AI**: Gemini for content generation
- **Voice**: ElevenLabs + LiveKit for real-time audio

## Build Commands

### Backend (FastAPI)

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Run development server with auto-reload
uvicorn app.main:app --reload

# Run on specific port
uvicorn app.main:app --reload --port 8000

# Health check
curl http://localhost:8000/health
```

### Frontend (React + Vite)

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Agents (LiveKit Voice AI - separate project in /agents)

```bash
cd agents

# Install dependencies (uses uv)
uv sync

# Run development server
uv run python -m agent

# Run tests
uv run pytest

# Run a single test
uv run pytest tests/test_agent.py::test_offers_assistance

# Lint and format code
uv run ruff check
uv run ruff format
```

## Testing

### Backend Tests
Currently, backend tests should be added to a `tests/` directory. Run with:
```bash
cd backend
pytest
pytest tests/ -v
pytest tests/test_file.py::test_function -v
```

### Frontend Tests
Frontend tests (if added) run with:
```bash
cd frontend
npm test
npm test -- --watch
```

### Agent Tests
The agents project has comprehensive tests:
```bash
cd agents
uv run pytest
uv run pytest -v
uv run pytest tests/test_agent.py -v
uv run pytest tests/test_agent.py::test_offers_assistance -v
```

## Code Style Guidelines

### Python (Backend & Agents)

**Imports**:
- Use absolute imports with package prefix: `from app.models.schemas import Topic`
- Group imports: stdlib → third-party → local application
- Separate import groups with a blank line
- Use `from __future__ import annotations` for complex type hints (optional)

**Formatting**:
- Use ruff formatter: `uv run ruff format` (agents project)
- Line length: 88 characters (ruff default)
- Indentation: 4 spaces (Python standard)
- Double quotes for strings, single quotes only when needed

**Type Hints**:
- Use type hints for function signatures and class attributes
- Use `| None` syntax (Python 3.10+) over `Optional[]`
- Use `list[T]` over `List[T]` for generics
- Return type annotations required for public functions
- Example:
  ```python
  from typing import List, Optional

  def get_topics(limit: int = 10) -> List[Topic]:
      ...
  ```

**Naming Conventions**:
- `snake_case` for functions, variables, and module names
- `PascalCase` for classes and exception names
- `UPPER_SNAKE_CASE` for constants
- Private methods/attributes: prefix with `_` (e.g., `_internal_method`)
- Prefix async functions with `a_` (optional convention for clarity)

**Pydantic Models**:
- Use `BaseModel` from pydantic for all schemas
- Define models in `backend/app/models/schemas.py`
- Use `Optional[T]` with default `None` for nullable fields
- Order fields logically: required → optional with defaults → optional
- Example:
  ```python
  class Source(BaseModel):
      title: str
      url: str
      snippet: Optional[str] = None
      source_name: Optional[str] = None
  ```

**Error Handling**:
- Use specific exceptions: `ValueError`, `RuntimeError`, `TimeoutError`
- Log errors with appropriate level before raising
- Use `try/except` blocks with explicit exception types
- Avoid bare `except:` clauses
- Example:
  ```python
  try:
      result = await operation()
  except TimeoutError:
      _logger.error("Operation timed out")
      raise
  except Exception as exc:
      _logger.exception("Unexpected error")
      raise RuntimeError(f"Failed: {exc}") from exc
  ```

**Logging**:
- Use `logging.getLogger(__name__)` for module loggers
- Log levels: `DEBUG` (detail), `INFO` (normal), `WARNING` (issue), `ERROR` (failure)
- Use %-style formatting for log messages
- Example:
  ```python
  _logger = logging.getLogger(__name__)

  _logger.info("Task %s created with run_id=%s", task_id, run_id)
  _logger.error("Failed to process request: %s", exc)
  ```

**Async/Await**:
- Use `async def` for functions that await async operations
- Use `asyncio.to_thread()` for CPU-bound sync operations
- Prefer `async with` for context managers that support it
- Example:
  ```python
  async def fetch_data(url: str) -> dict:
      async with httpx.AsyncClient() as client:
          response = await client.get(url)
          return response.json()
  ```

### JavaScript/React (Frontend)

**Imports**:
- Use ES modules with `import` syntax
- Group imports: React → third-party → local components → CSS
- Use consistent spacing and ordering

**Formatting**:
- 2 spaces for indentation (Vite default)
- Semicolons at end of statements
- Double quotes for strings
- Use Prettier if added (not currently configured)

**Components**:
- Use functional components with hooks (`useState`, `useEffect`, etc.)
- Use `.jsx` extension for files with JSX
- Use `PascalCase` for component names
- Example:
  ```jsx
  import { useState, useEffect } from "react";
  import axios from "axios";
  import TopicCard from "../components/TopicCard.jsx";

  const Home = () => {
      const [topics, setTopics] = useState([]);

      useEffect(() => {
          // Effect logic
      }, []);

      return (
          <div className="home">
              {topics.map(topic => (
                  <TopicCard key={topic.id} topic={topic} />
              ))}
          </div>
      );
  };

  export default Home;
  ```

**Naming**:
- `camelCase` for variables and functions
- `PascalCase` for components
- `kebab-case` for CSS class names (used in project)

**CSS Classes**:
- Use BEM-style naming: `block__element--modifier`
- Component-scoped classes: component name as block
- Example classes from project: `hero__content`, `topics-grid`, `section-header`

**State Management**:
- Use `useState` for local component state
- Use `useEffect` for side effects (API calls, subscriptions)
- Use `useCallback` and `useMemo` for optimization (optional)

**API Calls**:
- Use `axios` for HTTP requests
- Centralize API URL in `frontend/src/config.js`
- Example:
  ```jsx
  import axios from "axios";
  import { API_URL } from "../config.js";

  const response = await axios.get(`${API_URL}/topics`);
  ```

## Project Structure

```
/
  backend/
    app/
      db/           # Database connection (MongoDB)
      models/       # Pydantic schemas
      routers/      # API endpoints
      services/     # External integrations (Parallel.ai, Gemini, etc.)
      main.py       # FastAPI app entry point
    requirements.txt
  frontend/
    src/
      components/   # Reusable React components
      pages/        # Route pages
      App.jsx       # Main app component
      main.jsx      # Entry point
      config.js     # API configuration
    vite.config.js
  agents/           # LiveKit voice AI agents (separate project)
    src/
    tests/
    pyproject.toml
  unity/            # Unity project for video panels
  docs/             # Documentation
  CLAUDE.md         # AI context document
```

## API Conventions

### Backend Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/topics` | List ranked topics |
| GET | `/topics/{id}` | Get topic details |
| POST | `/research/refresh` | Refresh research |
| POST | `/generate/article` | Generate article |
| POST | `/generate/script` | Generate podcast/video script |
| POST | `/interrupt` | Handle user interruption |

### Response Formats
- Use Pydantic models for response validation
- Return JSON with consistent structure
- Include appropriate HTTP status codes

## Environment Variables

Required variables in `.env`:
```bash
# Backend
MONGODB_URI=mongodb+srv://...
GEMINI_API_KEY=...
PARALLEL_API_KEY=...

# Voice
ELEVENLABS_API_KEY=...
LIVEKIT_API_KEY=...
LIVEKIT_API_SECRET=...
LIVEKIT_URL=...

# Config
ENV=development
CORS_ORIGINS=http://localhost:3000
```

## Key Patterns

### Async Operation with Polling
The Parallel.ai service uses polling for long-running tasks (see `backend/app/services/parallel_ai.py`):
```python
async def run_task(query: str, timeout_seconds: float = 300.0) -> ResearchResult:
    def _run():
        # Create task
        task_run = client.task_run.create(...)
        # Poll for result
        result = _poll_for_result(client, task_run.run_id, timeout_seconds, 3.0)
        return result
    return await asyncio.to_thread(_run)
```

### Router Pattern
Use FastAPI routers for endpoint organization:
```python
from fastapi import APIRouter

router = APIRouter()

@router.get("/topics", response_model=TopicsResponse)
async def list_topics() -> TopicsResponse:
    ...
```

## Linting & Formatting

### Agents Project (ruff)
```bash
cd agents
uv run ruff check          # Check for issues
uv run ruff format         # Auto-format code
uv run ruff check --fix    # Auto-fix issues
```

### Backend/Frontend
No explicit linting configured. Consider adding:
- `ruff` for Python (add to backend requirements.txt)
- ESLint + Prettier for JavaScript (add to frontend)

## Common Tasks

### Adding a New API Endpoint
1. Create router in `backend/app/routers/`
2. Define Pydantic models in `backend/app/models/schemas.py`
3. Register router in `backend/app/main.py`

### Adding a New Frontend Page
1. Create component in `frontend/src/pages/`
2. Add route in `frontend/src/App.jsx`
3. Create CSS file if needed

### Running Full Stack
```bash
# Terminal 1: Backend
cd backend && uvicorn app.main:app --reload

# Terminal 2: Frontend
cd frontend && npm run dev
```

## Documentation

- `CLAUDE.md` - Comprehensive AI context document
- `README.md` - Project overview and setup
- `docs/` - Additional documentation
