import "./ArticleView.css";

const ArticleView = ({ title, content, sources = [] }) => {
  return (
    <article className="article-view">
      <div className="article-content">
        <p className="article-lead">{content}</p>

        {/* Sample article sections for demo */}
        <section className="article-section">
          <h2>Key Developments</h2>
          <p>
            Recent developments have highlighted the importance of staying informed about rapidly
            evolving situations. Multiple credible sources have confirmed significant changes that
            could impact various stakeholders.
          </p>
          <p>
            Experts suggest that this represents a paradigm shift in how we approach these challenges.
            The implications are far-reaching and warrant careful consideration from all parties involved.
          </p>
        </section>

        <section className="article-section">
          <h2>Expert Analysis</h2>
          <p>
            Leading analysts have weighed in on the situation, offering diverse perspectives that
            help paint a more complete picture. While opinions vary on the long-term outlook,
            there is consensus on several key points.
          </p>
          <blockquote className="article-quote">
            "This represents one of the most significant developments we've seen in recent years.
            The ramifications will be felt across multiple sectors."
            <cite>— Industry Expert</cite>
          </blockquote>
        </section>

        <section className="article-section">
          <h2>What's Next</h2>
          <p>
            Looking ahead, several scenarios remain possible. Stakeholders are closely monitoring
            the situation as new information continues to emerge. The coming weeks will be crucial
            in determining the ultimate outcome.
          </p>
        </section>
      </div>

      {sources.length > 0 && (
        <aside className="article-sources">
          <h3>Sources</h3>
          <ul>
            {sources.map((source, index) => (
              <li key={index}>
                <a href={source.url} target="_blank" rel="noopener noreferrer">
                  {source.title}
                </a>
                {source.source_name && <span className="source-name"> — {source.source_name}</span>}
              </li>
            ))}
          </ul>
        </aside>
      )}
    </article>
  );
};

export default ArticleView;
