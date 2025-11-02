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
