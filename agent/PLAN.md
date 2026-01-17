# Project Plan (LiveKit + MCP Deep Research + Gemini + ElevenLabs)

## Objective
Build a voice agent using LiveKit that:
- Uses Gemini API as the base LLM.
- Uses a custom ElevenLabs voice for TTS.
- Performs deep research through an MCP connection.

## Milestones
1) Foundations
- Decide on language/runtime (e.g., Python LiveKit Agents).
- Set up LiveKit project, API keys, and local dev environment.
- Validate Gemini API credentials and model choice.
- Validate ElevenLabs custom voice ID.
- Choose STT provider (Deepgram, Google, Whisper, etc.).

2) Core Agent (Voice)
- Create LiveKit room joiner and audio pipeline.
- Wire STT -> LLM (Gemini) -> TTS (ElevenLabs).
- Implement a minimal conversation loop with basic prompts.
- Confirm audio input/output quality and latency.

3) MCP Deep Research Integration
- Pick MCP server(s) and define research tools (search, browse, summarize).
- Implement MCP client connection and tool calling.
- Add tool selection policies and safety constraints.
- Ensure sources are cited in responses.

4) Orchestration + Guardrails
- System prompt with goals, tone, safety, and citation rules.
- Conversation memory strategy (short-term + optional long-term).
- Timeouts, retries, and fallback behaviors.

5) UX and Deployment
- Define how user starts/stops research and voice sessions.
- Add logging/telemetry (latency, errors, tool usage).
- Deployment target (local, container, cloud) and configuration.

## MVP Scope
- Join a room, listen, respond with Gemini, speak with ElevenLabs.
- MCP research tool available via explicit trigger phrase.
- Responses include citations when research was used.

## Success Criteria
- End-to-end voice conversation works reliably in a LiveKit room.
- Research request triggers MCP tools and returns a cited summary.
- Average response latency acceptable for a voice assistant.

## Open Questions
- Target platform: web, desktop, or telephony?
- Primary use-case: Q&A, tutoring, customer support, etc.?
- STT provider selection and language support.
- Privacy constraints for research data and logging.

## Risks
- Latency from multi-hop pipeline (STT -> LLM -> MCP -> TTS).
- Cost control for LLM + research + voice.
- Voice quality and stability for custom ElevenLabs voice.

## Next Actions (Suggested)
- Choose language/runtime and create a minimal LiveKit agent skeleton.
- Confirm Gemini model and ElevenLabs voice ID.
- Identify MCP server(s) for deep research.
