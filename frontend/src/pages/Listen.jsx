import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import MediaPlayer from "../components/MediaPlayer.jsx";
import "./ContentPage.css";

const Listen = () => {
  const { contentId } = useParams();
  const [showQuestion, setShowQuestion] = useState(false);
  const [question, setQuestion] = useState("");

  const handleInterrupt = (currentTime) => {
    setShowQuestion(true);
  };

  const handleAskQuestion = () => {
    console.log("Question asked:", question);
    setQuestion("");
    setShowQuestion(false);
  };

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
        onInterrupt={handleInterrupt}
      />

      {showQuestion && (
        <div className="question-modal">
          <div className="question-modal__content card">
            <h3>Ask a Question</h3>
            <p>Pause the podcast and get an answer in the same voice.</p>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What would you like clarified?"
              rows={3}
            />
            <div className="question-modal__actions">
              <button className="btn btn-ghost" onClick={() => setShowQuestion(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleAskQuestion}>
                Ask
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Listen;
