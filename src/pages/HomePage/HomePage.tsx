import Layout from "../../components/Layout/Layout";
import WorkspaceSidebar from "../../components/WorkspaceSidebar/workspaceSidebar";
import ArticleView from "../../components/ArticleView/ArticleView";
import { useEffect, useState } from "react";
import type { Workspace, Article } from "../../types";
import "./homePage.css";

export default function HomePage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(
    null
  );
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(
    null
  );

  useEffect(() => {
    fetch("http://localhost:3333/workspaces")
      .then((res) => res.json())
      .then(setWorkspaces);
  }, []);

  useEffect(() => {
    fetch("http://localhost:3333/articles")
      .then((res) => res.json())
      .then(setArticles)
      .catch(() => setArticles([]));
  }, []);

  const handleSelectWorkspace = (id: string) => {
    setSelectedWorkspaceId(id || null);
    setSelectedArticleId(null);
  };

  return (
    <Layout>
      <div className="home-page-wrapper">
        <div className="home-sidebar">
          <WorkspaceSidebar
            workspaces={workspaces}
            articles={articles}
            selectedWorkspaceId={selectedWorkspaceId}
            onSelectWorkspace={handleSelectWorkspace}
            selectedArticleId={selectedArticleId}
            onSelectArticle={setSelectedArticleId}
          />
        </div>
        <div className="article-content">
          {selectedArticleId ? (
            <ArticleView id={selectedArticleId} />
          ) : (
            <div>Select an article</div>
          )}
        </div>
      </div>
    </Layout>
  );
}
