import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage/HomePage";
import CreateArticlePage from "./pages/CreateArticlePage/CreateArticlePage";
import EditArticlePage from "./pages/EditArticlePage/EditArticlePage";
import ArticleVersionsPage from "./pages/ArticleVersionPage/ArticleVersionsPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/new" element={<CreateArticlePage />} />
      <Route path="/edit/:id" element={<EditArticlePage />} />
      <Route path="/article/:id/versions" element={<ArticleVersionsPage />} />
    </Routes>
  );
}
