import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import MediaPlayer from "../components/MediaPlayer.jsx";
import "./ContentPage.css";

const Watch = () => {
  const { contentId } = useParams();
  const [showQuestion, setShowQuestion] = useState(false);
  const [question, setQuestion] = useState("");

  const handleInterrupt = (currentTime) => {
    setShowQuestion(true);
  };

  const handleAskQuestion = () => {
    // API call would go here
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
        <span className="content-badge">Video Panel</span>
        <h1>Interactive News Breakdown</h1>
      </header>

      <MediaPlayer
        type="video"
        title="Character Discussion"
        description="Watch animated characters discuss and debate the latest news"
        onInterrupt={handleInterrupt}
      />

      {showQuestion && (
        <div className="question-modal">
          <div className="question-modal__content card">
            <h3>Ask a Question</h3>
            <p>The characters will pause to answer your question.</p>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What would you like to know more about?"
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

export default Watch;
