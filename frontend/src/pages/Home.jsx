import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../config.js";
import TopicCard from "../components/TopicCard.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import "./Home.css";

const Home = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await axios.get(`${API_URL}/topics`);
        setTopics(response.data.topics);
      } catch (err) {
        console.error("Failed to fetch topics:", err);
        setTopics([
          { id: "politics", label: "US Politics", emoji: "🇺🇸", article_count: 42, last_refreshed_at: new Date().toISOString() },
          { id: "tech", label: "Tech & AI", emoji: "🤖", article_count: 28, last_refreshed_at: new Date().toISOString() },
          { id: "climate", label: "Climate Change", emoji: "🌍", article_count: 35, last_refreshed_at: new Date().toISOString() },
          { id: "economy", label: "Global Economy", emoji: "📈", article_count: 19, last_refreshed_at: new Date().toISOString() },
          { id: "space", label: "Space Exploration", emoji: "🚀", article_count: 15, last_refreshed_at: new Date().toISOString() },
          { id: "health", label: "Health & Science", emoji: "🧬", article_count: 24, last_refreshed_at: new Date().toISOString() },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, []);

  if (loading) {
    return <LoadingSpinner size="large" text="Loading..." />;
  }

  return (
    <div className="home">
      <section className="hero">
        <div className="hero__content">
          <span className="hero__label">Deep Research</span>
          <h1 className="hero__title">
            News that <em>matters</em>, delivered your way
          </h1>
          <p className="hero__description">
            We synthesize breaking stories into video panels, podcasts, and long-form articles—each backed by verified sources.
          </p>
        </div>

        <div className="hero__visual">
          <div className="hero__graphic">
            <span className="hero__graphic-text">Watch.<br />Listen.<br />Read.</span>
          </div>
        </div>
      </section>

      <section className="topics-section">
        <div className="section-header">
          <h2>Today's Topics</h2>
          <span className="section-meta">{topics.length} stories curated</span>
        </div>

        <div className="topics-grid">
          {topics.map((topic) => (
            <TopicCard key={topic.id} topic={topic} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
