import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../config.js";
import MediaPlayer from "../components/MediaPlayer.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import "./ContentPage.css";

const Listen = () => {
  const { contentId } = useParams();
  const [loading, setLoading] = useState(true);
  const [scriptData, setScriptData] = useState(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [showTranscript, setShowTranscript] = useState(false);
  const [currentTimeSec, setCurrentTimeSec] = useState(0);

  useEffect(() => {
    const generateScript = async () => {
      try {
        setLoading(true);
        // contentId format: "topicId_format_duration"
        const parts = contentId.split("_");
        const topicId = parts[0];
        const duration = parseInt(parts[2], 10) || 5;

        const response = await axios.post(`${API_URL}/generate/podcast`, {
          topic_id: topicId,
          duration_minutes: duration,
        });

        setScriptData(response.data);
        if (response.data?.audio_base64) {
          const byteCharacters = atob(response.data.audio_base64);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i += 1) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], {
            type: response.data?.mime_type || "audio/mpeg",
          });
          const url = URL.createObjectURL(blob);
          setAudioUrl(url);
        }
      } catch (err) {
        console.error("Failed to generate script:", err);
      } finally {
        setLoading(false);
      }
    };

    if (contentId) {
      generateScript();
    }
  }, [contentId]);

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  if (loading) {
     return <LoadingSpinner size="large" text="Generating Script..." />;
  }

  const segments = scriptData?.segments || [];
  const currentSegment = segments.find(
    (segment) =>
      currentTimeSec >= segment.start_seconds &&
      currentTimeSec < segment.end_seconds
  );
  const transcriptSegments = currentSegment ? [currentSegment] : segments;

  return (
    <div className="content-page">
      <Link to="/" className="back-link">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to topics
      </Link>

      <header className="content-header">
        <span className="content-badge content-badge--audio">Podcast</span>
        <h1>Audio Deep Dive</h1>
      </header>

      <MediaPlayer
        type="audio"
        title="News Podcast"
        description="Listen to an engaging discussion of the key stories"
        audioSrc={audioUrl}
        onTimeUpdate={(time) => setCurrentTimeSec(time)}
      />

      {scriptData && (
        <div className="transcript-section">
          <div className="transcript-header">
            <h3>Transcript</h3>
            <button
              className="btn btn--outline"
              onClick={() => setShowTranscript((prev) => !prev)}
            >
              {showTranscript ? "Hide" : "Show"}
            </button>
          </div>
          {showTranscript ? (
            <div className="transcript-container">
              {transcriptSegments.map((segment, idx) => (
                <div key={idx} className="transcript-segment">
                  <strong>{segment.speaker}: </strong>
                  <span>{segment.text}</span>
                </div>
              ))}
              {currentSegment ? (
                <div className="transcript-note">Showing current segment.</div>
              ) : null}
            </div>
          ) : (
            <p className="transcript-collapsed">
              Transcript is hidden. Use “Show” to view the current segment.
            </p>
          )}
        </div>
      )}

    </div>
  );
};

export default Listen;
