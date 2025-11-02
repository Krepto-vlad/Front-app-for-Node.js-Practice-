import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Editable, useEditor } from "@wysimark/react";
import "./articleForm.css";

interface Props {
  articleId?: string;
}

export default function ArticleForm({ articleId }: Props) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const editor = useEditor({});

  useEffect(() => {
    if (articleId) {
      setLoading(true);
      fetch(`http://localhost:3333/articles/${articleId}`)
        .then((res) => res.json())
        .then((article) => {
          setTitle(article.title);
          setContent(article.content);
          setLoading(false);
        })
        .catch(() => {
          setError("Failed to load article.");
          setLoading(false);
        });
    }
  }, [articleId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      return;
    }
    const method = articleId ? "PUT" : "POST";
    const url = articleId
      ? `http://localhost:3333/articles/${articleId}`
      : "http://localhost:3333/articles";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });
    if (res.ok) {
      navigate("/");
    } else {
      const data = await res.json();
      setError(data.error || "Failed to save article.");
    }
  };
  const handleDelete = async () => {
    if (!articleId) return;
    if (!window.confirm("Are you sure you want to delete this article?"))
      return;
    const res = await fetch(`http://localhost:3333/articles/${articleId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      navigate("/");
    } else {
      const data = await res.json();
      setError(data.error || "Failed to delete article.");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="create-article-form-wrapper">
      <h2>{articleId ? "Edit Article" : "Create Article"}</h2>
      {error && <div className="create-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="input-title-wrapper">
          <label htmlFor="input-title">Add Title:</label>
          <input
            id="input-title"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <Editable
          editor={editor}
          value={content}
          onChange={setContent}
          placeholder="Write your article here..."
        />
        <div className="form-button-wrapper">
          <button className="form-button" type="submit">
            {articleId ? "Save" : "Create"}
          </button>
          {articleId && (
            <button
              className="form-button"
              type="button"
              onClick={handleDelete}
            >
              Delete
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
