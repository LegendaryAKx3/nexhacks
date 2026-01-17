import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import {
  Room,
  RoomEvent,
  Track,
  createLocalAudioTrack,
} from "livekit-client";

import { API_URL } from "../config.js";

const ROOM_NAME = "deepresearchpod-duo";

const Agents = () => {
  const [room, setRoom] = useState(null);
  const [status, setStatus] = useState("disconnected");
  const [error, setError] = useState("");
  const [transcript, setTranscript] = useState([]);
  const [listening, setListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [textInput, setTextInput] = useState("");

  const audioContainerRef = useRef(null);
  const recognitionRef = useRef(null);
  const localTrackRef = useRef(null);

  const connectionLabel = useMemo(() => {
    if (status === "connecting") return "Connecting...";
    if (status === "connected") return "Connected";
    if (status === "error") return "Error";
    return "Disconnected";
  }, [status]);

  const appendTranscript = useCallback((who, text) => {
    setTranscript((prev) => [...prev, { who, text }]);
  }, []);

  const sendUserText = useCallback(
    (text) => {
      if (!room) return;
      const payload = JSON.stringify({ type: "user_text", text });
      const data = new TextEncoder().encode(payload);
      room.localParticipant.publishData(data, { reliable: true });
    },
    [room]
  );

  const connectRoom = useCallback(async () => {
    try {
      setStatus("connecting");
      setError("");

      const identity = `web-${crypto.randomUUID()}`;
      const response = await axios.post(`${API_URL}/voice/token`, {
        room: ROOM_NAME,
        identity,
        name: "You",
      });

      const { token, url } = response.data;
      if (!url || !url.startsWith("ws")) {
        throw new Error("LiveKit URL is missing or invalid.");
      }
      if (!token) {
        throw new Error("LiveKit token is missing from the backend response.");
      }
      const newRoom = new Room();

      newRoom.on(RoomEvent.TrackSubscribed, (track) => {
        if (track.kind !== Track.Kind.Audio) return;
        const element = track.attach();
        element.autoplay = true;
        element.controls = false;
        audioContainerRef.current?.appendChild(element);
      });

      newRoom.on(RoomEvent.TrackUnsubscribed, (track) => {
        if (track.kind !== Track.Kind.Audio) return;
        track.detach().forEach((element) => element.remove());
      });

      newRoom.on(RoomEvent.DataReceived, (payload) => {
        try {
          const decoded = new TextDecoder().decode(payload);
          const message = JSON.parse(decoded);
          if (message?.type === "agent_text") {
            appendTranscript(message.speaker ?? "Agent", message.text ?? "");
          }
        } catch (decodeError) {
          return;
        }
      });

      newRoom.on(RoomEvent.Disconnected, () => {
        setStatus("disconnected");
      });

      await newRoom.connect(url, token);

      try {
        localTrackRef.current = await createLocalAudioTrack();
        await newRoom.localParticipant.publishTrack(localTrackRef.current);
      } catch (audioError) {
        setError(
          audioError?.message ||
            "Microphone permission failed. Allow mic access and retry."
        );
      }

      setRoom(newRoom);
      setStatus("connected");
    } catch (err) {
      setStatus("error");
      const apiMessage =
        err?.response?.data?.detail || err?.response?.data?.error;
      const message =
        apiMessage ||
        err?.message ||
        err?.toString?.() ||
        "Failed to connect. Check backend and LiveKit settings.";
      setError(message);
    }
  }, []);

  const disconnectRoom = useCallback(() => {
    if (localTrackRef.current) {
      localTrackRef.current.stop();
      localTrackRef.current = null;
    }
    room?.disconnect();
    setRoom(null);
    setStatus("disconnected");
  }, [room]);

  const startListening = useCallback(() => {
    if (!speechSupported) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }

    if (!recognitionRef.current) return;
    recognitionRef.current.start();
  }, [speechSupported]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return undefined;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = (event) => {
      setListening(false);
      setError(event?.error ?? "Speech recognition error.");
    };

    recognition.onresult = (event) => {
      const text = event.results?.[0]?.[0]?.transcript?.trim();
      if (!text) return;
      appendTranscript("You", text);
      sendUserText(text);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
      recognitionRef.current = null;
    };
  }, [appendTranscript, sendUserText]);

  useEffect(() => {
    return () => disconnectRoom();
  }, [disconnectRoom]);

  const handleSendText = (event) => {
    event.preventDefault();
    if (!textInput.trim()) return;
    appendTranscript("You", textInput.trim());
    sendUserText(textInput.trim());
    setTextInput("");
  };

  return (
    <section style={{ maxWidth: 720 }}>
      <h2>Voice Agents</h2>
      <p>
        Talk to Peter and Stewie in the LiveKit room. Click connect, then use the
        mic button to speak. Your speech is transcribed in-browser and sent to
        the agents.
      </p>
      <p>
        Make sure the agent service is running with{" "}
        <code>AGENT_INPUT_MODE=livekit</code> and connected to the same room.
      </p>

      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <button onClick={connectRoom} disabled={status === "connected"}>
          Connect
        </button>
        <button onClick={disconnectRoom} disabled={status !== "connected"}>
          Disconnect
        </button>
        <span>Status: {connectionLabel}</span>
      </div>

      <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
        <button
          onClick={startListening}
          disabled={!speechSupported || status !== "connected" || listening}
        >
          {listening ? "Listening..." : "Start Talking"}
        </button>
        <button
          onClick={stopListening}
          disabled={!listening || status !== "connected"}
        >
          Stop
        </button>
      </div>

      <form onSubmit={handleSendText} style={{ marginTop: 16 }}>
        <input
          type="text"
          placeholder="Type a message (optional)"
          value={textInput}
          onChange={(event) => setTextInput(event.target.value)}
          style={{ padding: 8, width: "60%" }}
        />
        <button type="submit" style={{ marginLeft: 8 }}>
          Send
        </button>
      </form>

      {error ? (
        <p style={{ marginTop: 12, color: "crimson" }}>{error}</p>
      ) : null}

      <div style={{ marginTop: 20 }}>
        <h3>Transcript</h3>
        {transcript.length === 0 ? (
          <p>No messages yet.</p>
        ) : (
          <div
            style={{
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: 12,
              maxHeight: 240,
              overflowY: "auto",
              background: "#fafafa",
            }}
          >
            {transcript.map((entry, idx) => (
              <p key={`${entry.who}-${idx}`}>
                <strong>{entry.who}:</strong> {entry.text}
              </p>
            ))}
          </div>
        )}
      </div>

      <div ref={audioContainerRef} />
    </section>
  );
};

export default Agents;
