# Design Doc (Draft)

## 1) Summary
Build a LiveKit-based voice agent that uses Gemini as the base LLM, a custom ElevenLabs voice for speech output, and an MCP-based deep research layer for tool-driven information gathering.

## 2) Goals
- Natural, low-latency voice interaction in a LiveKit room.
- Gemini as the primary LLM for reasoning and response generation.
- MCP deep research tools for high-quality, cited answers.
- ElevenLabs TTS with a custom voice for output.

## 3) Non-Goals (for MVP)
- Multi-agent orchestration.
- Long-term user memory across sessions.
- Fully automated browsing without explicit user intent.

## 4) Architecture Overview
### Components
1) LiveKit Agent Runtime
- Connects to LiveKit room and manages audio I/O.
- Orchestrates STT, LLM, MCP tools, and TTS.

2) STT (Speech-to-Text)
- Converts user audio to text.
- Provider TBD (Deepgram/Google/Whisper, etc.).

3) LLM (Gemini)
- Base reasoning model.
- Controls tool use and response synthesis.

4) MCP Deep Research
- MCP client connects to one or more MCP servers.
- Provides tools such as search, browse, and summarize.
- Returns citations and supporting evidence.

5) TTS (ElevenLabs)
- Converts final text to speech using a custom voice.

### Data Flow
User audio -> STT -> Gemini (prompt + history) -> optional MCP tools -> Gemini synthesis -> ElevenLabs TTS -> audio to LiveKit room.

## 5) Key Design Decisions
- Gemini is the default LLM; only switch models for fallback or cost control.
- Research is tool-gated: only run MCP tools for explicit research intent.
- Responses that use research must include citations.

## 6) Tooling & Integrations
### LiveKit
- Use LiveKit Agents SDK for voice pipeline and room handling.

### Gemini API
- Configure API key and model in environment.
- Include system prompt and tool definitions.

### MCP
- MCP client configuration for tool discovery.
- Define a research policy (e.g., max tools per query, timeouts).

### ElevenLabs
- Use custom voice ID and TTS API key.
- Configure streaming or chunked output to reduce latency.

## 7) System Prompt (Draft)
- Role: helpful, concise voice assistant.
- Must cite sources when using research tools.
- Ask clarifying questions before long research calls.

## 8) Observability
- Log timestamps for STT, LLM, MCP, and TTS.
- Track token usage and tool call counts.
- Record high-level errors without storing raw audio.

## 9) Security & Privacy
- Do not store raw audio by default.
- Redact or avoid logging secrets.
- Limit MCP tools to approved domains (if applicable).

## 10) Configuration
Suggested environment variables:
- LIVEKIT_URL
- LIVEKIT_API_KEY
- LIVEKIT_API_SECRET
- GEMINI_API_KEY
- GEMINI_MODEL
- MCP_SERVER_URL
- ELEVENLABS_API_KEY
- ELEVENLABS_VOICE_ID
- STT_PROVIDER

## 11) Open Questions
- Preferred STT provider and languages?
- Target latency and quality requirements?
- Which MCP server(s) for deep research?

## 12) MVP Acceptance Criteria
- Joins a LiveKit room and responds to speech.
- Gemini produces responses and can call MCP tools.
- ElevenLabs voice output plays in the room.
- Research responses include citations.
