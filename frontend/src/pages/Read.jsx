import { useParams, Link } from "react-router-dom";
import ArticleView from "../components/ArticleView.jsx";
import "./ContentPage.css";

const Read = () => {
  const { contentId } = useParams();

  // Mock data for demo
  const articleData = {
    title: "In-Depth Analysis",
    content: "This comprehensive article synthesizes insights from multiple sources to provide a balanced, well-researched overview of the topic at hand.",
    sources: [
      { title: "Primary Source Report", source_name: "Reuters", url: "https://example.com" },
      { title: "Expert Commentary", source_name: "The Guardian", url: "https://example.com" },
      { title: "Data Analysis", source_name: "BBC News", url: "https://example.com" },
    ]
  };

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
        content={articleData.content}
        sources={articleData.sources}
      />
    </div>
  );
};

export default Read;
