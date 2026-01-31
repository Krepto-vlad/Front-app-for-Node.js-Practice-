import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { marked } from "marked";
import type { Article, Comment } from "../../types";
import { useAuth } from "../../context/AuthContext";
import "./articleView.css";

interface Props {
  id: string;
  versionNumber?: number;
}

const COMMENTS_PAGE_SIZE = 10;

export default function ArticleView({ id, versionNumber }: Props) {
  const { user, isAdmin } = useAuth();
  const [article, setArticle] = useState<Article | null>(null);
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const navigate = useNavigate();
  const [isOldVersion, setIsOldVersion] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsOffset, setCommentsOffset] = useState(0);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [error, setError] = useState("");

  const loadMoreComments = useCallback(
    (offset: number = 0) => {
      console.log(`Loading comments: offset=${offset}, articleId=${id}`);
      fetch(
        `http://localhost:3333/articles/${id}/comments?offset=${offset}&limit=${COMMENTS_PAGE_SIZE}`,
      )
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch comments");
          return res.json();
        })
        .then((data) => {
          console.log("Comments received:", data);
          const commentsArray = Array.isArray(data)
            ? data
            : data.comments && Array.isArray(data.comments)
              ? data.comments
              : [];

          console.log("Processed comments array:", commentsArray);

          if (commentsArray.length < COMMENTS_PAGE_SIZE)
            setHasMoreComments(false);
          setComments((prev) => [...prev, ...commentsArray]);
          setCommentsOffset(offset + commentsArray.length);
        })
        .catch((err) => {
          console.error("Error loading comments:", err);
          setError("Failed to load comments.");
          setHasMoreComments(false);
        });
    },
    [id],
  );

  useEffect(() => {
    if (!id) return;

    const url = versionNumber
      ? `http://localhost:3333/articles/${id}/versions/${versionNumber}`
      : `http://localhost:3333/articles/${id}`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch article");
        return res.json();
      })
      .then((data) => {
        const article = {
          ...data,
          attachments: data.attachments || data.Attachments || [],
        };
        setArticle(article);

        if (
          versionNumber &&
          data.currentVersion &&
          versionNumber < data.currentVersion
        ) {
          setIsOldVersion(true);
        } else {
          setIsOldVersion(false);
        }
      })
      .catch((err) => {
        console.error("Error loading article:", err);
        setArticle(null);
      });

    setComments([]);
    setCommentsOffset(0);
    setHasMoreComments(true);
    setError("");
    loadMoreComments(0);
  }, [id, versionNumber, loadMoreComments]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!newComment.trim()) return;
    const res = await fetch(`http://localhost:3333/articles/${id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: newComment }),
    });
    if (res.ok) {
      const comment: Comment = await res.json();
      setComments((prev) => [comment, ...prev]);
      setNewComment("");
    } else {
      const data = await res.json();
      setError(data.error || "Failed to add comment.");
    }
  };

  const handleEdit = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditingText(comment.text);
  };

  const handleSaveEdit = async (commentId: string) => {
    setError("");
    if (!editingText.trim()) return;
    const res = await fetch(
      `http://localhost:3333/articles/${id}/comments/${commentId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: editingText }),
      },
    );
    if (res.ok) {
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, text: editingText } : c)),
      );
      setEditingCommentId(null);
      setEditingText("");
    } else {
      const data = await res.json();
      setError(data.error || "Failed to update comment.");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm("Delete this comment?")) return;
    const res = await fetch(
      `http://localhost:3333/articles/${id}/comments/${commentId}`,
      { method: "DELETE" },
    );
    if (res.ok) {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } else {
      const data = await res.json();
      setError(data.error || "Failed to delete comment.");
    }
  };

  const handleExportPdf = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {};

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(
        `http://localhost:3333/articles/${id}/export-pdf`,
        { headers },
      );

      if (!response.ok) {
        throw new Error("Failed to export PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `article-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export error:", error);
      setError("Failed to export PDF. Please try again.");
    }
  };

  if (!article) return <div>Loading...</div>;

  const displayTitle = article.versionData?.title || article.title;
  const displayContent = article.versionData?.content || article.content;
  const currentVersionNumber =
    article.versionData?.version || article.currentVersion;

  const canEdit =
    !isOldVersion && (isAdmin || (user && article.userId === user.id));

  return (
    <div className="view-wrapper">
      {isOldVersion && (
        <div className="old-version-banner">
          ⚠️ You are viewing an old version (v{currentVersionNumber}). This
          version is read-only.{" "}
          <button
            onClick={() => navigate(`/article/${id}/versions`)}
            className="version-link-button"
          >
            View all versions
          </button>
        </div>
      )}

      {article.attachments && article.attachments.length > 0 && (
        <div className="attachments-list-container">
          <h3>Attachments:</h3>
          <ul className="attachments-list">
            {article.attachments.map((file) => (
              <li key={file.filename}>
                {file.mimetype.startsWith("image/") ? (
                  <img
                    src={`http://localhost:3333/attachments/${file.filename}`}
                    alt={file.originalname}
                    className="attachments-img"
                    onClick={() =>
                      setPreviewImg(
                        `http://localhost:3333/attachments/${file.filename}`,
                      )
                    }
                  />
                ) : (
                  <a
                    className="pdf-link"
                    href={`http://localhost:3333/attachments/${file.filename}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img className="attachments-img" src="/pdf.png" alt="PDF" />
                    <span>{file.originalname}</span>
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {previewImg && (
        <div className="modal" onClick={() => setPreviewImg(null)}>
          <img
            className="attachments-img-large"
            src={previewImg}
            alt="Preview"
          />
        </div>
      )}

      <div className="edit-container">
        <div className="title-center">
          <h2>{displayTitle}</h2>
          {currentVersionNumber && (
            <span className="version-badge">
              Version {currentVersionNumber}
            </span>
          )}
        </div>
        <div className="article-actions">
          {canEdit && (
            <button onClick={() => navigate(`/edit/${id}`)} title="Edit">
              <img src="/editing.png" alt="edit button" />
            </button>
          )}
          <button
            onClick={() => navigate(`/article/${id}/versions`)}
            title="View Versions"
          >
            <img src="/history.png" alt="version history" />
          </button>
          <button
            onClick={handleExportPdf}
            className="export-pdf-btn"
            title="Export as PDF"
          >
            📄 Export as PDF
          </button>
        </div>
      </div>

      <div dangerouslySetInnerHTML={{ __html: marked(displayContent) }} />

      <div className="comments-section">
        <h3>Comments</h3>
        {error && <div className="comment-error">{error}</div>}
        <form onSubmit={handleAddComment} className="comments-form">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="comment-textarea"
            disabled={!!editingCommentId}
          />
          <button
            type="submit"
            disabled={!!editingCommentId || !newComment.trim()}
            className="comment-button"
            style={{ marginTop: "12px" }}
          >
            Add Comment
          </button>
        </form>
        {comments.length === 0 && !hasMoreComments ? (
          <p className="no-comments">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          <ul className="comments-list">
            {comments.map((comment) => (
              <li key={comment.id} className="comment-item">
                {editingCommentId === comment.id ? (
                  <div>
                    <textarea
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      className="comment-textarea"
                    />
                    <div
                      className="comment-actions"
                      style={{ marginTop: "12px" }}
                    >
                      <button
                        onClick={() => handleSaveEdit(comment.id)}
                        disabled={!editingText.trim()}
                        className="comment-button"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingCommentId(null)}
                        className="comment-button secondary-button"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="comment-content">{comment.text}</div>
                    <div className="comment-meta">
                      <span className="comment-date">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                      <div className="comment-actions">
                        <button
                          onClick={() => handleEdit(comment)}
                          disabled={!!editingCommentId}
                          className="comment-button"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          disabled={!!editingCommentId}
                          className="comment-button delete-button"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
        {hasMoreComments && (
          <button
            onClick={() => loadMoreComments(commentsOffset)}
            className="comment-button"
          >
            Load more
          </button>
        )}
      </div>
    </div>
  );
}
