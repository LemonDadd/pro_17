import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import Gradient from "@/pages/Gradient";
import Shadow from "@/pages/Shadow";
import Export from "@/pages/Export";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/gradient" element={<Gradient />} />
          <Route path="/shadow" element={<Shadow />} />
          <Route path="/export" element={<Export />} />
        </Route>
      </Routes>
    </Router>
  );
}
