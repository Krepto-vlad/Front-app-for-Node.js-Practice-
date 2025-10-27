import Layout from "../../components/Layout/Layout";
import ArticleList from "../../components/ArticleList/ArticleList";
import ArticleView from "../../components/ArticleView/ArticleView";
import "./homePage.css";
import { useEffect, useState } from "react";
import type { Article } from "../../types";

export default function HomePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:3333/articles")
      .then((res) => res.json())
      .then(setArticles)
      .catch(() => setArticles([]));
  }, []);

  return (
    <Layout>
      <div className="home-page-wrapper">
        <div className="home-sidebar">
          <p className="sidebar-title">PAGE TREE</p>
          <ArticleList
            articles={articles}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>
        <div className="article-content">
          {selectedId ? (
            <ArticleView id={selectedId} />
          ) : (
            <div>Select an article</div>
          )}
        </div>
      </div>
    </Layout>
  );
}
