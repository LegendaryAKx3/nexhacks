# Run the Voice Agents (Web + Backend + Agent Service)

This guide connects the web app to a LiveKit room so you can talk to Peter and Stewie via voice from the `/agents` page.

## 1) Configure environment variables

### Backend (`backend/.env` or root `.env`)
Make sure these are set:

```env
LIVEKIT_URL=wss://your-livekit-server.livekit.cloud
LIVEKIT_API_KEY=your-livekit-api-key
LIVEKIT_API_SECRET=your-livekit-api-secret
CORS_ORIGINS=http://localhost:5173
```

Notes:
- LiveKit clients require a **ws/wss URL** and a **token** to connect. citeturn0search0turn0search1
- Rooms are created automatically when the first participant joins with a valid token. citeturn0search0turn0search1

### Agent (`agent/.env`)
```env
LIVEKIT_URL=wss://your-livekit-server.livekit.cloud
LIVEKIT_API_KEY=your-livekit-api-key
LIVEKIT_API_SECRET=your-livekit-api-secret
LIVEKIT_ROOM=deepresearchpod-duo

GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.5-flash

ELEVENLABS_API_KEY=your-elevenlabs-api-key
ELEVENLABS_MODEL_ID=eleven_multilingual_v2
ELEVENLABS_OUTPUT_FORMAT=pcm_16000
ELEVENLABS_VOICE_ID_PETER=voice_id_for_peter
ELEVENLABS_VOICE_ID_STEWIE=voice_id_for_stewie

AGENT_INPUT_MODE=livekit
```

The agent listens for LiveKit **data messages** (`type: user_text`) and replies over audio + data messages (`type: agent_text`). This is based on LiveKit’s data packet flow. citeturn0search8

---

## 2) Start the backend API
```bash
cd backend
python -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

If you prefer to run from the repo root, use:

```bash
uvicorn app.main:app --reload --app-dir backend
```

This avoids the `ModuleNotFoundError: No module named 'app'` error when `uvicorn` runs from the root directory.

The backend issues LiveKit access tokens using your API key/secret, which are required for the client to join the room. citeturn0search5turn0search7

---

## 3) Start the agent service
```bash
cd agent
python -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
python duo_room.py
```

This starts **two** LiveKit participants (Peter and Stewie) in the same room.

---

## 4) Start the frontend
```bash
cd frontend
npm install
npm run dev
```

Open the app at `http://localhost:5173/agents`.

### Using the `/agents` page
1. Click **Connect**.
2. Allow microphone access when prompted.
3. Click **Start Talking** and speak.
4. The browser speech recognizer converts your voice to text and sends it to the agents.

---

## Troubleshooting: “Network Error”
If the web page shows a **Network Error**, check these in order:

1) **Backend is running**
- Confirm `http://localhost:8000/health` returns `{"status":"ok"}`.

2) **CORS is allowed**
- Ensure `CORS_ORIGINS=http://localhost:5173` is set for backend.

3) **LiveKit URL is correct**
- Must be `ws://...` or `wss://...` (no `http://`). citeturn0search0turn0search1

4) **Token is valid**
- Tokens must be generated with a `roomJoin` grant for the same room name. citeturn0search5turn0search7

5) **Room name is consistent**
- Frontend uses `deepresearchpod-duo`. The agent must use the same value.

---

## What’s running where
- **Backend**: issues LiveKit tokens
- **Agent**: connects as Peter + Stewie and replies with ElevenLabs voices
- **Frontend**: joins room, sends `user_text` data, and plays audio
