import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { marked } from "marked";
import type { Article } from "../../types";
import "./articleView.css";

interface Props {
  id: string;
}

export default function ArticleView({ id }: Props) {
  const [article, setArticle] = useState<Article | null>(null);
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:3333/articles/${id}`)
      .then((res) => res.json())
      .then(setArticle)
      .catch(() => setArticle(null));
  }, [id]);

  if (!article) return <div>Loading...</div>;

  return (
    <div className="view-wrapper">
      {article.attachments && article.attachments.length > 0 && (
        <div className="attachments-list">
          <h3>Attachments:</h3>
          <ul>
            {article.attachments.map((file) => (
              <li key={file.filename}>
                {file.mimetype.startsWith("image/") ? (
                  <img
                    src={`http://localhost:3333/attachments/${file.filename}`}
                    alt={file.originalname}
                    className="attachments-img"
                    onClick={() =>
                      setPreviewImg(
                        `http://localhost:3333/attachments/${file.filename}`
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
          <h2>{article.title}</h2>
        </div>
        <button onClick={() => navigate(`/edit/${id}`)} title="Edit">
          <img src="/editing.png" alt="edit button" />
        </button>
      </div>
      <div dangerouslySetInnerHTML={{ __html: marked(article.content) }} />
    </div>
  );
}
