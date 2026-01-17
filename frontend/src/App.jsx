import { Route, Routes } from "react-router-dom";

import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import Topic from "./pages/Topic.jsx";
import Watch from "./pages/Watch.jsx";
import Listen from "./pages/Listen.jsx";
import Read from "./pages/Read.jsx";

const App = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/topics/:id" element={<Topic />} />
        <Route path="/watch/:contentId" element={<Watch />} />
        <Route path="/listen/:contentId" element={<Listen />} />
        <Route path="/read/:contentId" element={<Read />} />
      </Routes>
    </Layout>
  );
};

export default App;
