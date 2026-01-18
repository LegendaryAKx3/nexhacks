import asyncio
import json
import os
from dataclasses import dataclass
from typing import List

from livekit import rtc

from livekit_room import LiveKitConfig, build_token, connect_room, publish_audio_track, play_pcm
from prompts import PETER_SYSTEM_PROMPT, STEWIE_SYSTEM_PROMPT
from providers.elevenlabs_tts import get_voice_id, load_elevenlabs_from_env
from providers.gemini import load_gemini_from_env

try:
    from dotenv import load_dotenv
except Exception:  # pragma: no cover - optional dependency
    load_dotenv = None

@dataclass
class AgentProfile:
    name: str
    identity: str
    voice_id: str
    system_prompt: str


@dataclass
class AgentState:
    profile: AgentProfile
    room: rtc.Room
    audio_source: rtc.AudioSource


class History:
    def __init__(self, max_turns: int) -> None:
        self.max_turns = max_turns
        self.turns: List[str] = []

    def add(self, speaker: str, text: str) -> None:
        self.turns.append(f"{speaker}: {text}")
        if len(self.turns) > self.max_turns:
            self.turns = self.turns[-self.max_turns :]

    def render(self) -> str:
        return "\n".join(self.turns)


async def read_stdin(queue: asyncio.Queue) -> None:
    loop = asyncio.get_event_loop()
    while True:
        user_text = await loop.run_in_executor(None, input, "You: ")
        await queue.put(user_text)


def _decode_user_text(data_packet: rtc.DataPacket) -> str | None:
    try:
        payload = json.loads(data_packet.data.decode("utf-8"))
        if isinstance(payload, dict) and payload.get("type") == "user_text":
            text = payload.get("text", "")
        elif isinstance(payload, str):
            text = payload
        else:
            text = ""
    except json.JSONDecodeError:
        text = data_packet.data.decode("utf-8", errors="ignore")

    text = text.strip()
    return text or None


def attach_data_listener(
    room: rtc.Room,
    queue: asyncio.Queue,
    loop: asyncio.AbstractEventLoop,
    ignore_identities: set[str],
) -> None:
    def _on_data(data_packet: rtc.DataPacket) -> None:
        participant = data_packet.participant
        if participant and participant.identity in ignore_identities:
            return

        text = _decode_user_text(data_packet)
        if text:
            loop.call_soon_threadsafe(queue.put_nowait, text)

    room.on("data_received", _on_data)


def build_messages(system_prompt: str, history: History, user_text: str) -> List[dict]:
    prompt = system_prompt
    if history.turns:
        prompt += "\n\nConversation so far:\n" + history.render()
    prompt += f"\n\nUser: {user_text}"
    return [{"role": "user", "content": prompt}]


async def init_agent(profile: AgentProfile, config: LiveKitConfig) -> AgentState:
    token = build_token(
        config=config,
        identity=profile.identity,
        name=profile.name,
        pre_generated_token=os.getenv(f"LIVEKIT_TOKEN_{profile.identity.upper()}", ""),
    )
    room = await connect_room(config, token)
    audio_source = await publish_audio_track(
        room,
        track_name=f"{profile.identity}-voice",
        sample_rate=16000,
        channels=1,
    )
    return AgentState(profile=profile, room=room, audio_source=audio_source)


async def speak(agent: AgentState, tts, text: str) -> None:
    payload = json.dumps(
        {"type": "agent_text", "speaker": agent.profile.name, "text": text}
    )
    await agent.room.local_participant.publish_data(payload, reliable=True)
    pcm_audio = tts.synthesize(text=text, voice_id=agent.profile.voice_id)
    await play_pcm(agent.audio_source, pcm_audio, sample_rate=16000, channels=1)


async def run_duo() -> None:
    if load_dotenv is not None:
        load_dotenv()

    input_mode = os.getenv("AGENT_INPUT_MODE", "stdin").strip().lower()
    max_history = int(os.getenv("MAX_HISTORY_TURNS", "6"))

    config = LiveKitConfig(
        url=os.getenv("LIVEKIT_URL", ""),
        api_key=os.getenv("LIVEKIT_API_KEY", ""),
        api_secret=os.getenv("LIVEKIT_API_SECRET", ""),
        room_name=os.getenv("LIVEKIT_ROOM", ""),
    )

    if not config.url or not config.room_name:
        raise ValueError("LIVEKIT_URL and LIVEKIT_ROOM are required")

    gemini = load_gemini_from_env()
    tts = load_elevenlabs_from_env()

    peter = AgentProfile(
        name="Peter",
        identity="peter",
        voice_id=get_voice_id("peter") or "",
        system_prompt=PETER_SYSTEM_PROMPT,
    )
    stewie = AgentProfile(
        name="Stewie",
        identity="stewie",
        voice_id=get_voice_id("stewie") or "",
        system_prompt=STEWIE_SYSTEM_PROMPT,
    )

    if not peter.voice_id or not stewie.voice_id:
        raise ValueError("ELEVENLABS_VOICE_ID_PETER and ELEVENLABS_VOICE_ID_STEWIE are required")

    peter_state, stewie_state = await asyncio.gather(
        init_agent(peter, config),
        init_agent(stewie, config),
    )

    queue: asyncio.Queue = asyncio.Queue()
    loop = asyncio.get_running_loop()
    attach_data_listener(
        room=peter_state.room,
        queue=queue,
        loop=loop,
        ignore_identities={peter_state.profile.identity, stewie_state.profile.identity},
    )

    if input_mode == "stdin":
        asyncio.create_task(read_stdin(queue))
    elif input_mode != "livekit":
        raise ValueError("AGENT_INPUT_MODE must be 'stdin' or 'livekit'")

    history = History(max_turns=max_history)
    turn = 0

    await speak(peter_state, tts, "Hey, I am Peter. Ask us anything!")
    await speak(stewie_state, tts, "Stewie here. Do try to keep up.")

    while True:
        user_text = await queue.get()
        if not user_text:
            continue

        history.add("User", user_text)
        active_agent = peter_state if turn % 2 == 0 else stewie_state
        messages = build_messages(active_agent.profile.system_prompt, history, user_text)
        response = gemini.generate(active_agent.profile.system_prompt, messages)

        if not response:
            response = "I had trouble with that request. Could you rephrase?"

        history.add(active_agent.profile.name, response)
        await speak(active_agent, tts, response)
        turn += 1


if __name__ == "__main__":
    asyncio.run(run_duo())
