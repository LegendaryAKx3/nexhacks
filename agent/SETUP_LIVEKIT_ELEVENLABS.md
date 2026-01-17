# Setup Guide: LiveKit Cloud + ElevenLabs (Peter & Stewie)

This guide walks through account creation, project setup, API keys, and custom voices for the duo LiveKit voice agents in this repo.

---

## 1) LiveKit Cloud setup (account -> project -> keys)

### A. Create a LiveKit Cloud account
1. Sign up for a LiveKit Cloud account.
2. After signup, open your LiveKit Cloud dashboard.

### B. Create a project
1. Create a new project (e.g., `deepresearchpod-dev`).
2. Open the project dashboard.

### C. Get the project URL + API keys
1. In the project dashboard, open **Settings** and then **API Keys**.
2. Create a new API key if needed.
3. Copy these values:
   - WebSocket Project URL (starts with `wss://`)
   - API Key
   - API Secret

These map to the env vars used by the agent:
- `LIVEKIT_URL`
- `LIVEKIT_API_KEY`
- `LIVEKIT_API_SECRET`

### D. Create a LiveKit room (detailed)
Rooms are created automatically the moment the first participant joins. You can create one explicitly in the dashboard, or let the agents create it when they connect.

**Option 1: Create a room in the LiveKit Cloud dashboard**
1. In your project dashboard, open **Rooms**.
2. Click **Create Room**.
3. Set **Room Name** to `deepresearchpod-duo` (or your preferred name).
4. Leave the defaults unless you need:
   - **Empty room timeout** (auto close after empty)
   - **Max participants**
   - **Egress or recording settings**
5. Click **Create**.

**Option 2: Let the agents auto-create the room**
1. Set `LIVEKIT_ROOM=deepresearchpod-duo` in `.env`.
2. Start `duo_room.py`.
3. LiveKit will auto-create the room as soon as Peter or Stewie joins with a valid token.

**Option 3: Create a room via LiveKit CLI**
1. Install the CLI (see below).
2. Authenticate: `lk cloud auth`
3. Create a room (if you want it created before any join):

```bash
lk room create deepresearchpod-duo
```

### E. (Optional) Install LiveKit CLI and generate tokens
If you want to generate access tokens manually for testing:
1. Install the LiveKit CLI.
2. (Optional) Link your LiveKit Cloud project in the CLI:

```bash
lk cloud auth
```

3. Run token creation for a room/identity:

```bash
lk token create \
  --api-key <PROJECT_KEY> \
  --api-secret <PROJECT_SECRET> \
  --join \
  --room deepresearchpod-duo \
  --identity peter \
  --valid-for 24h
```

You can repeat for `stewie`.

Optional CLI install commands (choose your OS):

```bash
# macOS
brew install livekit-cli

# Linux
curl -sSL https://get.livekit.io/cli | bash

# Windows
winget install LiveKit.LiveKitCLI
```

---

## 2) ElevenLabs setup (account -> API key -> custom voices)

### A. Create an ElevenLabs account
1. Sign up for ElevenLabs and open the web app.

### B. Create an API key
1. In the left sidebar, open **Developers**.
2. Go to the **API Keys** tab.
3. Create a new API key and name it.
4. Copy the key and store it securely (you will only see the full key once).
5. (Optional) Set scope restrictions and credit limits for the key.

This maps to:
- `ELEVENLABS_API_KEY`

### C. Create or add custom voices
You have two main options for Peter and Stewie:

**Option 1: Create a custom voice**
1. Open **Voices**.
2. Choose **Voice Cloning** and select **Instant** or **Professional**.
3. Upload clean audio samples (single speaker, no background noise).
4. Name your voice (e.g., `Peter`, `Stewie`).
5. Follow the verification flow if you choose Professional Voice Cloning.

Notes:
- You must have rights to clone any voice you upload.
- Professional Voice Cloning can only be created for your own voice.

**Option 2: Use a voice from the Voice Library**
1. Open **Voices** > **Explore**.
2. Find a voice and add it to **My Voices**.

### D. Get each voice ID
1. Go to **Voices** > **My Voices**.
2. Click the three-dot menu on a voice.
3. Choose **Copy voice ID**.

These map to:
- `ELEVENLABS_VOICE_ID_PETER`
- `ELEVENLABS_VOICE_ID_STEWIE`

---

## 3) Configure this project

1. Copy the template env file:

```bash
cd agent
cp .env.example .env
```

2. Fill in the values:

```env
LIVEKIT_URL=...
LIVEKIT_API_KEY=...
LIVEKIT_API_SECRET=...
LIVEKIT_ROOM=deepresearchpod-duo

GEMINI_API_KEY=...
GEMINI_MODEL=gemini-2.5-flash

ELEVENLABS_API_KEY=...
ELEVENLABS_MODEL_ID=eleven_multilingual_v2
ELEVENLABS_OUTPUT_FORMAT=pcm_16000
ELEVENLABS_VOICE_ID_PETER=...
ELEVENLABS_VOICE_ID_STEWIE=...
```

---

## 4) Quick sanity check (local)

```bash
cd agent
python -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
python duo_room.py
```

The agents will connect to the LiveKit room and speak in Peter/Stewie voices.

---

## Notes
- Only clone voices you have the rights to use.
- Keep API keys private and out of version control.
- If you change output formats or sample rates, update the LiveKit audio settings accordingly.
