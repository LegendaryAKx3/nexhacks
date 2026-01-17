import TopicCard from "../components/TopicCard.jsx";

const Home = () => {
  const topics = [
    { id: "topic_1", label: "US Politics", emoji: "🇺🇸", article_count: 42 },
    { id: "topic_2", label: "Tech & AI", emoji: "🤖", article_count: 28 },
  ];

  return (
    <section>
      <h2>Trending Topics</h2>
      {topics.map((topic) => (
        <TopicCard key={topic.id} topic={topic} />
      ))}
    </section>
  );
};

export default Home;
