import asyncio
from dataclasses import dataclass
from typing import Optional

from livekit import rtc
from livekit.api import AccessToken, VideoGrant


@dataclass
class LiveKitConfig:
    url: str
    api_key: str
    api_secret: str
    room_name: str


def build_token(
    config: LiveKitConfig,
    identity: str,
    name: str,
    pre_generated_token: Optional[str] = None,
) -> str:
    if pre_generated_token:
        return pre_generated_token

    token = AccessToken(config.api_key, config.api_secret)
    token.with_identity(identity)
    token.with_name(name)
    token.with_grants(VideoGrant(room_join=True, room=config.room_name))
    return token.to_jwt()


async def connect_room(config: LiveKitConfig, token: str) -> rtc.Room:
    room = rtc.Room()
    await room.connect(config.url, token)
    return room


async def publish_audio_track(room: rtc.Room, track_name: str, sample_rate: int, channels: int) -> rtc.AudioSource:
    audio_source = rtc.AudioSource(sample_rate, channels)
    audio_track = rtc.LocalAudioTrack.create_audio_track(track_name, audio_source)
    await room.local_participant.publish_track(audio_track)
    return audio_source


async def play_pcm(
    audio_source: rtc.AudioSource,
    pcm_bytes: bytes,
    sample_rate: int,
    channels: int,
    frame_duration_ms: int = 20,
) -> None:
    bytes_per_sample = 2
    samples_per_channel = int(sample_rate * frame_duration_ms / 1000)
    frame_size = samples_per_channel * channels * bytes_per_sample

    for offset in range(0, len(pcm_bytes), frame_size):
        chunk = pcm_bytes[offset : offset + frame_size]
        if len(chunk) < frame_size:
            chunk = chunk + b"\x00" * (frame_size - len(chunk))
        frame = rtc.AudioFrame(
            data=chunk,
            sample_rate=sample_rate,
            num_channels=channels,
            samples_per_channel=samples_per_channel,
        )
        await audio_source.capture_frame(frame)
        await asyncio.sleep(frame_duration_ms / 1000)
