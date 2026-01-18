import { Link, Route, Routes } from "react-router-dom";

import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import Topic from "./pages/Topic.jsx";
import Watch from "./pages/Watch.jsx";
import Listen from "./pages/Listen.jsx";
import Read from "./pages/Read.jsx";
import Research from "./pages/Research.jsx";

const App = () => {
  return (
    <Layout>
      <nav style={{ marginBottom: "16px" }} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/research" element={<Research />} />
        <Route path="/topics/:id" element={<Topic />} />
        <Route path="/watch/:contentId" element={<Watch />} />
        <Route path="/listen/:contentId" element={<Listen />} />
        <Route path="/read/:contentId" element={<Read />} />
      </Routes>
    </Layout>
  );
};

export default App;
