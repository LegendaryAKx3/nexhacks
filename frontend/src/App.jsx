import { Link, Route, Routes } from "react-router-dom";

import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import Topic from "./pages/Topic.jsx";
import Watch from "./pages/Watch.jsx";
import Listen from "./pages/Listen.jsx";
import Read from "./pages/Read.jsx";
import Agents from "./pages/Agents.jsx";
import Agents2 from "./pages/Agents2.jsx";

const App = () => {
  return (
    <Layout>
      <nav style={{ marginBottom: "16px" }}>
        <Link to="/" style={{ marginRight: "12px" }}>
          Home
        </Link>
        <Link to="/agents">Agents</Link>
        <Link to="/agents2">Agents2</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/agents" element={<Agents />} />
        <Route path="/agents2" element={<Agents2 />} />
        <Route path="/topics/:id" element={<Topic />} />
        <Route path="/watch/:contentId" element={<Watch />} />
        <Route path="/listen/:contentId" element={<Listen />} />
        <Route path="/read/:contentId" element={<Read />} />
      </Routes>
    </Layout>
  );
};

export default App;
