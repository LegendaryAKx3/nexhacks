const ArticleView = ({ title, content }) => {
  return (
    <article style={{ border: "1px solid #ddd", borderRadius: "12px", padding: "16px" }}>
      <h2>{title}</h2>
      <p>{content}</p>
    </article>
  );
};

export default ArticleView;
