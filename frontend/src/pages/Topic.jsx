import { useParams } from "react-router-dom";

const Topic = () => {
  const { id } = useParams();

  return (
    <section>
      <h2>Topic Detail</h2>
      <p>Topic ID: {id}</p>
    </section>
  );
};

export default Topic;
