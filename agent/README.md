# LiveKit Duo Voice Agents (Peter + Stewie)

This folder contains a minimal dual-agent setup that joins a single LiveKit room, alternates responses between two agents, and uses Gemini for generation plus ElevenLabs for custom voices.

## What this does
- Connects **two agent participants** (Peter + Stewie) to the same LiveKit room.
- Alternates responses so the agents feel collaborative instead of duplicative.
- Uses **Gemini API** for LLM output.
- Uses **custom ElevenLabs voices** (one per agent).

## Quick start
```bash
cd agent
cp .env.example .env
# Fill in keys + voice IDs

python -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt

# Run in CLI mode (stdin)
python duo_room.py
```

This script loads env vars from `.env` automatically if present.

## Input modes
- `AGENT_INPUT_MODE=stdin`: type messages in the terminal. Agents respond in the LiveKit room using their voices.
- `AGENT_INPUT_MODE=livekit`: listens for LiveKit data messages (`type: user_text`) and responds in-room.

When using the web app voice page, set `AGENT_INPUT_MODE=livekit` before starting `duo_room.py`.

## Files
- `duo_room.py`: main runner that launches both agents and alternates replies.
- `livekit_room.py`: LiveKit helpers (token, connect, publish audio, play PCM).
- `providers/gemini.py`: Gemini REST client.
- `providers/elevenlabs_tts.py`: ElevenLabs TTS client (PCM output).
- `.env.example`: required environment variables.

## Notes / TODOs
- Add STT if you want the agents to listen to user audio directly in the room.
- Wire LiveKit data channel input if you want text input inside the room instead of stdin.
- Tune ElevenLabs output format + sample rate if your LiveKit setup requires 48k.

## Environment variables
See `.env.example` for the full list.
