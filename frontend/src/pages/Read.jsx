import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../config.js";
import ArticleView from "../components/ArticleView.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import "./ContentPage.css";

const Read = () => {
  const { contentId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [articleData, setArticleData] = useState(null);

  useEffect(() => {
    const generateContent = async () => {
      try {
        setLoading(true);
        // contentId format: "topicId_format_duration"
        const parts = contentId.split("_");
        const topicId = parts[0];
        const duration = parseInt(parts[2], 10) || 5;

        const response = await axios.post(`${API_URL}/generate/article`, {
          topic_id: topicId,
          duration_minutes: duration
        });

        setArticleData(response.data);
      } catch (err) {
        console.error("Failed to generate article:", err);
        setError("Failed to generate article. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (contentId) {
      generateContent();
    }
  }, [contentId]);

  if (loading) {
    return <LoadingSpinner size="large" text="Generating Article..." />;
  }

  if (error) {
    return (
      <div className="content-page">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <Link to="/" className="btn btn--outline">Back to topics</Link>
        </div>
      </div>
    );
  }

  if (!articleData) return null;

  // Construct full content from intro and sections
  const fullContent = (
    <div>
      <div className="article-intro">{articleData.content}</div>
      {articleData.sections && articleData.sections.map((section, idx) => (
        <div key={idx} className="article-section">
          <h3>{section.heading}</h3>
          <p>{section.body}</p>
        </div>
      ))}
    </div>
  );

  return (
    <div className="content-page content-page--article">
      <Link to="/" className="back-link">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to topics
      </Link>

      <header className="content-header">
        <span className="content-badge content-badge--article">Article</span>
        <h1>{articleData.title}</h1>
      </header>

      <ArticleView
        title={articleData.title}
        content={fullContent} 
        sources={[]} // Sources are not currently returned in ArticleResponse, could be added later
      />
    </div>
  );
};

export default Read;
