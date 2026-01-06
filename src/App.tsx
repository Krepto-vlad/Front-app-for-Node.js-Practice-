import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage/HomePage";
import CreateArticlePage from "./pages/CreateArticlePage/CreateArticlePage";
import EditArticlePage from "./pages/EditArticlePage/EditArticlePage";
import ArticleVersionsPage from "./pages/ArticleVersionPage/ArticleVersionsPage";
import LoginPage from "./pages/loginPage/LoginPage";
import UserManagementPage from "./pages/UserManagementPage/UserManagementPage";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<HomePage />} />
      <Route
        path="/new"
        element={
          <ProtectedRoute>
            <CreateArticlePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/edit/:id"
        element={
          <ProtectedRoute>
            <EditArticlePage />
          </ProtectedRoute>
        }
      />
      <Route path="/article/:id/versions" element={<ArticleVersionsPage />} />
      <Route
        path="/users"
        element={
          <ProtectedRoute requireAdmin>
            <UserManagementPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
