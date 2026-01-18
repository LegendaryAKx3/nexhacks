import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import {
  Room,
  RoomEvent,
  Track,
  createLocalAudioTrack,
} from "livekit-client";

import { API_URL } from "../config.js";

const Agents = () => {
  const [room, setRoom] = useState(null);
  const [roomName, setRoomName] = useState("deepresearchpod-duo");
  const [status, setStatus] = useState("disconnected");
  const [error, setError] = useState("");
  const [transcript, setTranscript] = useState([]);
  const [listening, setListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [textInput, setTextInput] = useState("");
  const [shareMic, setShareMic] = useState(false);
  const [forceRelay, setForceRelay] = useState(false);

  const audioContainerRef = useRef(null);
  const recognitionRef = useRef(null);
  const localTrackRef = useRef(null);
  const shouldListenRef = useRef(false);

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

  const loadConfig = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/voice/config`);
      if (response.data?.room) {
        setRoomName(response.data.room);
      }
    } catch (configError) {
      return;
    }
  }, []);

  const connectRoom = useCallback(async () => {
    try {
      if (status === "connecting" || status === "connected") return;
      setStatus("connecting");
      setError("");

      const identity = `web-${crypto.randomUUID()}`;
      const response = await axios.post(`${API_URL}/voice/token`, {
        room: roomName,
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
      const setupRoom = () => {
        const nextRoom = new Room();

        nextRoom.on(RoomEvent.TrackSubscribed, (track) => {
          if (track.kind !== Track.Kind.Audio) return;
          const element = track.attach();
          element.autoplay = true;
          element.controls = false;
          element.playsInline = true;
          audioContainerRef.current?.appendChild(element);
          element.play().catch(() => {});
        });

        nextRoom.on(RoomEvent.TrackUnsubscribed, (track) => {
          if (track.kind !== Track.Kind.Audio) return;
          track.detach().forEach((element) => element.remove());
        });

        nextRoom.on(RoomEvent.DataReceived, (payload) => {
          try {
            const decoded =
              typeof payload === "string"
                ? payload
                : new TextDecoder().decode(payload);
            const message = JSON.parse(decoded);
            if (message?.type === "agent_text") {
              appendTranscript(message.speaker ?? "Agent", message.text ?? "");
            }
          } catch (decodeError) {
            return;
          }
        });

        nextRoom.on(RoomEvent.ConnectionStateChanged, (state) => {
          if (state === "connected") setStatus("connected");
          if (state === "disconnected") setStatus("disconnected");
          if (state === "reconnecting") setStatus("connecting");
        });

        nextRoom.on(RoomEvent.Disconnected, (reason) => {
          setStatus("disconnected");
          if (reason) {
            setError(`Disconnected: ${reason}`);
          }
        });

        return nextRoom;
      };

      const connectWithOptions = async (useRelay) => {
        const nextRoom = setupRoom();
        const connectOptions = useRelay
          ? { rtcConfig: { iceTransportPolicy: "relay" } }
          : undefined;
        const connectPromise = nextRoom.connect(url, token, connectOptions);
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(
            () =>
              reject(
                new Error(
                  "Timed out connecting to LiveKit. Check network/firewall."
                )
              ),
            12000
          );
        });
        await Promise.race([connectPromise, timeoutPromise]);
        return nextRoom;
      };

      let newRoom;
      try {
        newRoom = await connectWithOptions(forceRelay);
      } catch (connectError) {
        const message = connectError?.message ?? "";
        if (!forceRelay && message.includes("pc connection")) {
          setForceRelay(true);
          newRoom = await connectWithOptions(true);
        } else {
          throw connectError;
        }
      }

      setRoom(newRoom);
      setStatus("connected");

      if (shareMic) {
        try {
          localTrackRef.current = await createLocalAudioTrack();
          await newRoom.localParticipant.publishTrack(localTrackRef.current);
        } catch (audioError) {
          setShareMic(false);
          setError(
            audioError?.message ||
              "Microphone permission failed. Allow mic access and retry."
          );
        }
      }
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
  }, [forceRelay, roomName, shareMic, status]);

  const setMicPublishing = useCallback(
    async (enabled) => {
      setShareMic(enabled);
      if (!room) return;

      if (!enabled) {
        if (localTrackRef.current) {
          try {
            room.localParticipant?.unpublishTrack?.(localTrackRef.current);
          } catch (unpublishError) {
            return;
          } finally {
            localTrackRef.current.stop();
            localTrackRef.current = null;
          }
        }
        return;
      }

      if (localTrackRef.current) return;

      try {
        localTrackRef.current = await createLocalAudioTrack();
        await room.localParticipant.publishTrack(localTrackRef.current);
      } catch (audioError) {
        setShareMic(false);
        setError(
          audioError?.message ||
            "Microphone permission failed. Allow mic access and retry."
        );
      }
    },
    [room]
  );

  const disconnectRoom = useCallback(() => {
    shouldListenRef.current = false;
    if (localTrackRef.current) {
      room?.localParticipant?.unpublishTrack?.(localTrackRef.current);
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
    shouldListenRef.current = true;
    try {
      recognitionRef.current.start();
    } catch (startError) {
      return;
    }
  }, [speechSupported]);

  const stopListening = useCallback(() => {
    shouldListenRef.current = false;
    recognitionRef.current?.stop();
  }, []);

  useEffect(() => {
    loadConfig();
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
    recognition.onend = () => {
      setListening(false);
      if (shouldListenRef.current) {
        setTimeout(() => {
          try {
            recognition.start();
          } catch (restartError) {
            return;
          }
        }, 200);
      }
    };
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
  }, [appendTranscript, sendUserText, loadConfig]);

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
    <section className="agents-page">
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Newsreader:opsz,wght@6..72,400;6..72,600&display=swap");

        :root {
          --ink: #1a1a1a;
          --muted: #4d5b5a;
          --accent: #1b6f6a;
          --accent-2: #d9792b;
          --card: #f7f4ef;
          --card-strong: #efe9df;
          --danger: #c0392b;
          --border: rgba(26, 26, 26, 0.12);
          --shadow: 0 22px 60px rgba(15, 35, 34, 0.14);
        }

        .agents-page {
          font-family: "Space Grotesk", "Trebuchet MS", sans-serif;
          color: var(--ink);
          background:
            radial-gradient(circle at top left, rgba(27, 111, 106, 0.12), transparent 55%),
            radial-gradient(circle at top right, rgba(217, 121, 43, 0.18), transparent 48%),
            linear-gradient(120deg, #f9f2e7 0%, #f5f8f2 100%);
          padding: 32px;
          border-radius: 24px;
          box-shadow: var(--shadow);
          max-width: 1100px;
        }

        .agents-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 24px;
        }

        .agents-title h2 {
          font-family: "Newsreader", "Georgia", serif;
          font-size: 32px;
          margin: 0 0 8px;
        }

        .agents-title p {
          margin: 0;
          color: var(--muted);
          max-width: 520px;
          line-height: 1.5;
        }

        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          border-radius: 999px;
          background: var(--card-strong);
          border: 1px solid var(--border);
          font-weight: 600;
          font-size: 14px;
        }

        .status-dot {
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: ${status === "connected" ? "var(--accent)" : status === "connecting" ? "var(--accent-2)" : "var(--danger)"};
          box-shadow: 0 0 0 4px rgba(27, 111, 106, 0.08);
        }

        .agents-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
          gap: 24px;
        }

        .card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 20px;
        }

        .controls {
          display: grid;
          gap: 16px;
        }

        .button-row {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .button {
          border: 1px solid transparent;
          background: var(--accent);
          color: #fff;
          padding: 10px 18px;
          border-radius: 999px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
          box-shadow: 0 10px 20px rgba(27, 111, 106, 0.18);
        }

        .button.secondary {
          background: #ffffff;
          color: var(--ink);
          border-color: var(--border);
          box-shadow: none;
        }

        .button.ghost {
          background: transparent;
          color: var(--ink);
          border-color: var(--border);
        }

        .button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          box-shadow: none;
          transform: none;
        }

        .button:not(:disabled):hover {
          transform: translateY(-1px);
        }

        .mic-toggle {
          display: flex;
          align-items: center;
          gap: 12px;
          background: var(--card-strong);
          padding: 14px;
          border-radius: 16px;
          border: 1px solid var(--border);
        }

        .pulse {
          width: 14px;
          height: 14px;
          border-radius: 999px;
          background: ${listening ? "var(--accent-2)" : "var(--border)"};
          position: relative;
        }

        .pulse::after {
          content: "";
          position: absolute;
          inset: -8px;
          border-radius: 999px;
          border: 1px solid rgba(217, 121, 43, 0.5);
          opacity: ${listening ? 1 : 0};
          animation: ${listening ? "pulse 1.6s infinite" : "none"};
        }

        @keyframes pulse {
          0% { transform: scale(0.7); opacity: 0.6; }
          100% { transform: scale(1.2); opacity: 0; }
        }

        .input-row {
          display: flex;
          gap: 12px;
        }

        .input-row input {
          flex: 1;
          padding: 10px 14px;
          border-radius: 12px;
          border: 1px solid var(--border);
          background: #fff;
          font-family: inherit;
          font-size: 14px;
        }

        .mic-share {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #ffffff;
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 10px 12px;
          font-size: 14px;
          color: var(--muted);
        }

        .mic-share input {
          width: 16px;
          height: 16px;
        }

        .relay-toggle {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #ffffff;
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 10px 12px;
          font-size: 14px;
          color: var(--muted);
        }

        .callout {
          background: #ffffff;
          border-radius: 16px;
          padding: 14px;
          border: 1px dashed rgba(27, 111, 106, 0.3);
          color: var(--muted);
          font-size: 14px;
          line-height: 1.4;
        }

        .error {
          background: rgba(192, 57, 43, 0.1);
          color: var(--danger);
          border: 1px solid rgba(192, 57, 43, 0.3);
          padding: 10px 12px;
          border-radius: 12px;
          font-size: 14px;
        }

        .transcript {
          max-height: 260px;
          overflow-y: auto;
          background: #ffffff;
          border-radius: 16px;
          padding: 12px;
          border: 1px solid var(--border);
          display: grid;
          gap: 8px;
        }

        .bubble {
          background: var(--card-strong);
          padding: 10px 12px;
          border-radius: 14px;
          font-size: 14px;
          line-height: 1.4;
        }

        .bubble strong {
          color: var(--accent);
        }

        .meta-list {
          display: grid;
          gap: 10px;
          font-size: 14px;
          color: var(--muted);
        }

        .meta-item {
          display: flex;
          justify-content: space-between;
          gap: 8px;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(26, 26, 26, 0.08);
        }

        .meta-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        @media (max-width: 900px) {
          .agents-page {
            padding: 20px;
          }
          .agents-grid {
            grid-template-columns: 1fr;
          }
          .agents-header {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>

      <div className="agents-header">
        <div className="agents-title">
          <h2>Agents Room</h2>
          <p>
            Jump into a live conversation with Peter and Stewie. Connect your
            mic, speak naturally, and the agents respond in real time.
          </p>
        </div>
        <div className="status-pill">
          <span className="status-dot" />
          {connectionLabel}
        </div>
      </div>

      <div className="agents-grid">
        <div className="card controls">
          <div className="button-row">
            <button
              className="button"
              onClick={connectRoom}
              disabled={status === "connected"}
            >
              Connect room
            </button>
            <button
              className="button secondary"
              onClick={disconnectRoom}
              disabled={status !== "connected"}
            >
              Disconnect
            </button>
          </div>

          <div className="mic-toggle">
            <span className="pulse" />
            <div style={{ flex: 1 }}>
              <strong>{listening ? "Listening…" : "Mic idle"}</strong>
              <div style={{ color: "var(--muted)", fontSize: 13 }}>
                {speechSupported
                  ? "Use the buttons to start or stop speaking."
                  : "Speech recognition not supported in this browser."}
              </div>
            </div>
            <div className="button-row">
              <button
                className="button"
                onClick={startListening}
                disabled={!speechSupported || status !== "connected" || listening}
              >
                Start
              </button>
              <button
                className="button ghost"
                onClick={stopListening}
                disabled={!listening || status !== "connected"}
              >
                Stop
              </button>
            </div>
          </div>

          <form onSubmit={handleSendText} className="input-row">
            <input
              type="text"
              placeholder="Type a message (optional)"
              value={textInput}
              onChange={(event) => setTextInput(event.target.value)}
            />
            <button type="submit" className="button secondary">
              Send
            </button>
          </form>

          <label className="mic-share">
            <input
              type="checkbox"
              checked={shareMic}
              onChange={(event) => setMicPublishing(event.target.checked)}
              disabled={status !== "connected"}
            />
            Share microphone audio with the room (optional)
          </label>

          <label className="relay-toggle">
            <input
              type="checkbox"
              checked={forceRelay}
              onChange={(event) => setForceRelay(event.target.checked)}
              disabled={status === "connected"}
            />
            Force TURN relay (helps on restrictive networks)
          </label>

          <div className="callout">
            Ensure the agent service is running with{" "}
            <code>AGENT_INPUT_MODE=livekit</code> and the same room name.
          </div>

          {error ? <div className="error">{error}</div> : null}

          <div>
            <h3 style={{ margin: "16px 0 8px" }}>Transcript</h3>
            {transcript.length === 0 ? (
              <div className="callout">No messages yet.</div>
            ) : (
              <div className="transcript">
                {transcript.map((entry, idx) => (
                  <div className="bubble" key={`${entry.who}-${idx}`}>
                    <strong>{entry.who}:</strong> {entry.text}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Room details</h3>
          <div className="meta-list">
            <div className="meta-item">
              <span>Room</span>
              <strong>{roomName}</strong>
            </div>
            <div className="meta-item">
              <span>Mode</span>
              <strong>Voice + Text</strong>
            </div>
            <div className="meta-item">
              <span>Agents</span>
              <strong>Peter & Stewie</strong>
            </div>
          </div>

          <div style={{ height: 16 }} />

          <h3 style={{ marginTop: 0 }}>Try saying</h3>
          <div className="meta-list">
            <div className="meta-item">
              <span>“Summarize today’s AI news.”</span>
            </div>
            <div className="meta-item">
              <span>“Debate pros and cons of WebRTC.”</span>
            </div>
            <div className="meta-item">
              <span>“Give me a quick tech briefing.”</span>
            </div>
          </div>
        </div>
      </div>

      <div ref={audioContainerRef} />
    </section>
  );
};

export default Agents;
