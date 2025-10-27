import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Editable, useEditor } from "@wysimark/react";
import "./articleForm.css";

export default function ArticleForm() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const editor = useEditor({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      return;
    }
    const res = await fetch("http://localhost:3333/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });
    if (res.ok) {
      navigate("/");
    } else {
      const data = await res.json();
      setError(data.error || "Failed to create article.");
    }
  };

  return (
    <div className="create-article-form-wrapper">
      <h2>Create Article</h2>
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
          <button type="submit">Create</button>
          <button>Save</button>
        </div>
      </form>
    </div>
  );
}
