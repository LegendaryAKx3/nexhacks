import { useParams } from "react-router-dom";
import MediaPlayer from "../components/MediaPlayer.jsx";

const Watch = () => {
  const { contentId } = useParams();

  return (
    <section>
      <MediaPlayer
        title="Video Panel"
        description={`Video content ID: ${contentId}`}
      />
    </section>
  );
};

export default Watch;
