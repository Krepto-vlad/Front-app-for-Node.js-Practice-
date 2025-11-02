import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage/HomePage";
import CreateArticlePage from "./pages/CreateArticlePage/CreateArticlePage";
import EditArticlePage from "./pages/EditArticlePage/EditArticlePage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/new" element={<CreateArticlePage />} />
      <Route path="/edit/:id" element={<EditArticlePage />} />
    </Routes>
  );
}
