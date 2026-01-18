import { Link } from "react-router-dom";
import "./TopicCard.css";

const TopicCard = ({ topic, featured = false }) => {
  const formatTime = (isoString) => {
    if (!isoString) return "Just now";
    const date = new Date(isoString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000 / 60);

    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  // Use topic.id directly for icon since we now use slug-based IDs
  const iconSrc = topic.id === 'sports' ? `/icons/${topic.id}.svg` : `/icons/${topic.id}.png`;

  return (
    <Link
      to={`/topics/${topic.id}`}
      className={`topic-card ${featured ? 'topic-card--featured' : ''}`}
    >

      <img
        src={iconSrc}
        alt=""
        className="topic-card__bg-icon"
        aria-hidden="true"
      />

      <div className="topic-card__header">
        <span className="topic-card__category">Breaking</span>
        <span className="topic-card__count">{topic.article_count} sources</span>
      </div>

      <h3 className="topic-card__title">{topic.label}</h3>

      <div className="topic-card__footer">
        <span className="topic-card__arrow">
          Read
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </Link>
  );
};

export default TopicCard;
