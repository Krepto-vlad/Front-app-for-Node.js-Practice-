import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import ArticleView from "../../components/ArticleView/ArticleView";
import type { ArticleVersion } from "../../types";
import "./articleVersionsPage.css";

export default function ArticleVersionsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [versions, setVersions] = useState<ArticleVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    fetch(`http://localhost:3333/articles/${id}/versions`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch versions");
        return res.json();
      })
      .then((data: ArticleVersion[]) => {
        const sortedVersions = data.sort((a, b) => b.version - a.version);
        setVersions(sortedVersions);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading versions:", err);
        setError("Failed to load article versions.");
        setLoading(false);
      });
  }, [id]);

  if (loading) return <Layout><div>Loading versions...</div></Layout>;
  if (error) return <Layout><div className="error">{error}</div></Layout>;

  return (
    <Layout>
      <div className="versions-page-wrapper">
        <div className="versions-sidebar">
          <div className="versions-header">
            <h2>Version History</h2>
            <button onClick={() => navigate("/")} className="back-button">
              ← Back to Home
            </button>
          </div>
          <ul className="versions-list">
            {versions.map((version) => (
              <li
                key={version.id}
                className={
                  "version-item" +
                  (selectedVersion === version.version ? " selected" : "")
                }
                onClick={() => setSelectedVersion(version.version)}
              >
                <div className="version-number">Version {version.version}</div>
                <div className="version-title">{version.title}</div>
                <div className="version-date">
                  {new Date(version.createdAt).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="version-content">
          {selectedVersion !== null ? (
            <ArticleView id={id!} versionNumber={selectedVersion} />
          ) : (
            <div className="select-version-message">
              <h3>Select a version to view</h3>
              <p>Choose a version from the list on the left to see its contents.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
