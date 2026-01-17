import { Route, Routes } from "react-router-dom";

import Home from "./pages/Home.jsx";
import Topic from "./pages/Topic.jsx";
import Watch from "./pages/Watch.jsx";
import Listen from "./pages/Listen.jsx";
import Read from "./pages/Read.jsx";

const App = () => {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: "24px" }}>
      <h1>DeepResearchPod</h1>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/topics/:id" element={<Topic />} />
        <Route path="/watch/:contentId" element={<Watch />} />
        <Route path="/listen/:contentId" element={<Listen />} />
        <Route path="/read/:contentId" element={<Read />} />
      </Routes>
    </div>
  );
};

export default App;
