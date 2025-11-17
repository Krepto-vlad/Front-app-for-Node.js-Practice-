import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Editable, useEditor } from "@wysimark/react";
import "./articleForm.css";
import type { Article } from "../../types";

interface Props {
  articleId?: string;
}

export default function ArticleForm({ articleId }: Props) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState<Article["attachments"]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editor = useEditor({});

  useEffect(() => {
    if (articleId) {
      setLoading(true);
      fetch(`http://localhost:3333/articles/${articleId}`)
        .then((res) => res.json())
        .then((article: Article) => {
          setTitle(article.title);
          setContent(article.content);
          setAttachments(article.attachments || []);
          setLoading(false);
        })
        .catch(() => {
          setError("Failed to load article.");
          setLoading(false);
        });
    }
  }, [articleId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDeleteAttachment = async (filename: string) => {
    if (!articleId) return;
    if (!window.confirm("Delete this file?")) return;
    const res = await fetch(
      `http://localhost:3333/articles/${articleId}/attachments/${encodeURIComponent(
        filename
      )}`,
      { method: "DELETE" }
    );
    if (res.ok) {
      setAttachments((prev) =>
        (prev || []).filter((file) => file.filename !== filename)
      );
    } else {
      const data = await res.json();
      setError(data.error || "Failed to delete file.");
    }
  };

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

    let newArticleId = articleId;
    if (!articleId && res.ok) {
      const data = await res.json();
      newArticleId = data.id;
    }

    if (res.ok && selectedFile && newArticleId) {
      const formData = new FormData();
      formData.append("file", selectedFile);
      const fileRes = await fetch(
        `http://localhost:3333/articles/${newArticleId}/attachments`,
        {
          method: "POST",
          body: formData,
        }
      );
      if (fileRes.ok) {
        const articleRes = await fetch(
          `http://localhost:3333/articles/${newArticleId}`
        );
        const article: Article = await articleRes.json();
        setAttachments(article.attachments || []);
      } else {
        const data = await fileRes.json();
        setError(data.error || "Failed to upload file.");
        return;
      }
    }

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

        <div className="attachments-upload">
          <label htmlFor="file-upload">Attach file (JPG, PNG, PDF): </label>
          <input
            id="file-upload"
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          {selectedFile && <div>Selected file: {selectedFile.name}</div>}
        </div>

        {attachments && attachments.length > 0 && (
          <div className="attachments-list">
            <h3>Attachments:</h3>
            <ul>
              {attachments.map((file) => (
                <li
                  key={file.filename}
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <a
                    href={`http://localhost:3333/attachments/${file.filename}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {file.originalname}
                  </a>
                  <button
                    className="delete-button"
                    type="button"
                    onClick={() => handleDeleteAttachment(file.filename)}
                  >
                    ✖
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

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
