import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage/HomePage";
import CreateArticlePage from "./pages/CreateArticlePage/CreateArticlePage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/new" element={<CreateArticlePage />} />
    </Routes>
  );
}
