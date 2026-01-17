const MediaPlayer = ({ title, description }) => {
  return (
    <div style={{ border: "1px solid #ddd", borderRadius: "12px", padding: "16px" }}>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
};

export default MediaPlayer;
