const TopicCard = ({ topic }) => {
  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: "12px",
        padding: "16px",
        marginBottom: "12px",
      }}
    >
      <h3 style={{ margin: 0 }}>
        {topic.emoji} {topic.label}
      </h3>
      <p style={{ margin: "6px 0 0" }}>{topic.article_count} articles</p>
    </div>
  );
};

export default TopicCard;
