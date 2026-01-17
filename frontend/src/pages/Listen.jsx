import { useParams } from "react-router-dom";
import MediaPlayer from "../components/MediaPlayer.jsx";

const Listen = () => {
  const { contentId } = useParams();

  return (
    <section>
      <MediaPlayer
        title="Podcast"
        description={`Audio content ID: ${contentId}`}
      />
    </section>
  );
};

export default Listen;
