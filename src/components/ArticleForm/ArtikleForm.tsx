import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Editable, useEditor } from "@wysimark/react";
import "./articleForm.css";
import type { Workspace, Article } from "../../types";

interface Props {
  articleId?: string;
}

export default function ArticleForm({ articleId }: Props) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState<Article["attachments"]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editor = useEditor({});
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [workspaceId, setWorkspaceId] = useState<string>("");
  const [newWorkspaceName, setNewWorkspaceName] = useState<string>("");

  useEffect(() => {
    if (articleId) {
      setLoading(true);
      fetch(`http://localhost:3333/articles/${articleId}`)
        .then((res) => res.json())
        .then((data: Record<string, unknown>) => {
          setTitle(data.title as string);
          setContent(data.content as string);
          setWorkspaceId(data.workspaceId as string);
          setAttachments(
            (data.attachments ||
              data.Attachments ||
              []) as Article["attachments"]
          );
          setLoading(false);
        })
        .catch(() => {
          setError("Failed to load article.");
          setLoading(false);
        });
    }
  }, [articleId]);

  useEffect(() => {
    fetch("http://localhost:3333/workspaces")
      .then((res) => res.json())
      .then(setWorkspaces);
  }, []);

  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) return;
    const res = await fetch("http://localhost:3333/workspaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newWorkspaceName }),
    });
    if (res.ok) {
      const ws = await res.json();
      setWorkspaces((prev) => [...prev, ws]);
      setWorkspaceId(ws.id);
      setNewWorkspaceName("");
    } else {
      const data = await res.json();
      setError(data.error || "Failed to create workspace.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
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

    if (!workspaceId) {
      setError("Workspace is required.");

      return;
    }

    if (articleId && selectedFiles.length > 0) {
      const formData = new FormData();
      selectedFiles.forEach((file) => formData.append("files", file));
      const fileRes = await fetch(
        `http://localhost:3333/articles/${articleId}/attachments`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!fileRes.ok) {
        const data = await fileRes.json();
        setError(data.error || "Failed to upload files.");
        return;
      }

      const articleRes = await fetch(
        `http://localhost:3333/articles/${articleId}`
      );
      const data = (await articleRes.json()) as Record<string, unknown>;
      setAttachments(
        (data.attachments || data.Attachments || []) as Article["attachments"]
      );
      setSelectedFiles([]);
    }

    const method = articleId ? "PUT" : "POST";
    const url = articleId
      ? `http://localhost:3333/articles/${articleId}`
      : "http://localhost:3333/articles";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, workspaceId }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to save article.");
      return;
    }

    let newArticleId = articleId;
    if (!articleId) {
      const data = await res.json();
      newArticleId = data.id;

      if (selectedFiles.length > 0) {
        const formData = new FormData();
        selectedFiles.forEach((file) => formData.append("files", file));
        const fileRes = await fetch(
          `http://localhost:3333/articles/${newArticleId}/attachments`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!fileRes.ok) {
          const data = await fileRes.json();
          setError(
            data.error || "Article created, but failed to upload files."
          );
          return;
        }
        setSelectedFiles([]);
      }
    }

    navigate("/");
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
        <div className="input-workspace-wrapper">
          <label htmlFor="workspace-select">Workspace:</label>
          <select
            id="workspace-select"
            value={workspaceId}
            onChange={(e) => setWorkspaceId(e.target.value)}
          >
            <option value="">Select workspace...</option>
            {workspaces.map((ws) => (
              <option key={ws.id} value={ws.id}>
                {ws.name}
              </option>
            ))}
          </select>
          <div className="workspace-create-section">
            <span className="workspace-create-label">
              Or create a new workspace:
            </span>
            <div className="workspace-create-row">
              <input
                type="text"
                placeholder="Enter workspace name"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                className="workspace-input"
              />
              <button
                type="button"
                onClick={handleCreateWorkspace}
                disabled={!newWorkspaceName.trim()}
                className="workspace-create-button"
              >
                <span>+</span> Create
              </button>
            </div>
          </div>
        </div>

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
          <label htmlFor="file-upload">Attach files (JPG, PNG, PDF): </label>
          <input
            id="file-upload"
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            multiple
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          {selectedFiles.length > 0 && (
            <div style={{ marginTop: "10px" }}>
              <strong>Selected files ({selectedFiles.length}):</strong>
              <ul style={{ listStyle: "none", padding: 0, marginTop: "5px" }}>
                {selectedFiles.map((file, index) => (
                  <li
                    key={index}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "5px",
                    }}
                  >
                    <span>
                      {file.name} ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSelectedFile(index)}
                      style={{
                        background: "#ef4765",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        padding: "4px 8px",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                    >
                      ✖
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
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
