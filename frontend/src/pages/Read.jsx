import { useParams } from "react-router-dom";
import ArticleView from "../components/ArticleView.jsx";

const Read = () => {
  const { contentId } = useParams();

  return (
    <section>
      <ArticleView title="Article" content={`Article ID: ${contentId}`} />
    </section>
  );
};

export default Read;
