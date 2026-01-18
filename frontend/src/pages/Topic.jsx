import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../config.js";
import FormatSelector from "../components/FormatSelector.jsx";
import SourceList from "../components/SourceList.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import "./Topic.css";

const Topic = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const [selectedFormat, setSelectedFormat] = useState("listen");
  const [selectedDuration, setSelectedDuration] = useState(10);

  useEffect(() => {
    const fetchTopic = async () => {
      try {
        const response = await axios.get(`${API_URL}/topics/${id}`);
        setTopic(response.data);
      } catch (err) {
        console.error("Failed to fetch topic:", err);
        // Map slug to proper label
        const topicLabels = {
          politics: "US Politics",
          sports: "Sports",
          tech: "Tech & AI",
          climate: "Climate Change",
          economy: "Global Economy",
          health: "Health & Science"
        };
        setTopic({
          id: id,
          label: topicLabels[id] || id.charAt(0).toUpperCase() + id.slice(1),
          emoji: "📰",
          article_count: 15,
          last_refreshed_at: new Date().toISOString(),
          research_summary: "This is a comprehensive overview of the latest developments in this topic area. Multiple sources have been analyzed to provide a balanced perspective on the key issues at hand.",
          sources: [
            { title: "Breaking: Major Development in Topic Area", source_name: "Reuters", url: "https://example.com", published_at: new Date().toISOString() },
            { title: "Analysis: What This Means for the Future", source_name: "The Guardian", url: "https://example.com", published_at: new Date().toISOString() },
            { title: "Expert Opinion: Key Takeaways", source_name: "BBC News", url: "https://example.com", published_at: new Date().toISOString() },
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTopic();
  }, [id]);

  const handleGenerate = async () => {
    setGenerating(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300));

      const contentId = `${id}_${selectedFormat}_${selectedDuration}`;
      if (selectedFormat === "watch") {
        navigate(`/watch/${contentId}`);
      } else if (selectedFormat === "listen") {
        navigate(`/listen/${contentId}`);
      } else {
        navigate(`/read/${contentId}`);
      }
    } catch (err) {
      console.error("Failed to generate content:", err);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="large" text="Loading..." />;
  }

  if (!topic) {
    return (
      <div className="topic-error">
        <h2>Topic not found</h2>
        <Link to="/" className="btn btn--outline">Back to topics</Link>
      </div>
    );
  }

  return (
    <div className="topic-page">
      <Link to="/" className="back-link">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to topics
      </Link>

      <header className="topic-header">
        <img 
          src={topic.id === 'sports' ? `/icons/${topic.id}.svg` : `/icons/${topic.id}.png`}
          alt={topic.label}
          className="topic-header__icon"
        />
        <div className="topic-header__content">
          <span className="topic-header__label">Deep Dive</span>
          <h1>{topic.label}</h1>
          <p className="topic-meta">{topic.article_count} sources analyzed</p>
        </div>
      </header>

      {topic.research_summary && (
        <section className="topic-summary">
          <h3>Research Summary</h3>
          <p>{topic.research_summary}</p>
        </section>
      )}

      <section className="topic-format">
        <h3>Choose Your Format</h3>
        <FormatSelector
          selectedFormat={selectedFormat}
          onFormatChange={setSelectedFormat}
          selectedDuration={selectedDuration}
          onDurationChange={setSelectedDuration}
          onGenerate={handleGenerate}
          loading={generating}
        />
      </section>

      <section className="topic-sources">
        <SourceList sources={topic.sources} />
      </section>
    </div>
  );
};

export default Topic;
