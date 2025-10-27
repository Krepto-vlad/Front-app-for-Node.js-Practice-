import { useEffect, useState } from "react";
import { marked } from "marked";
import type { Article } from "../../types";
import "./articleView.css";

interface Props {
  id: string;
}

export default function ArticleView({ id }: Props) {
  const [article, setArticle] = useState<Article | null>(null);

  useEffect(() => {
    fetch(`http://localhost:3333/articles/${id}`)
      .then((res) => res.json())
      .then(setArticle)
      .catch(() => setArticle(null));
  }, [id]);

  if (!article) return <div>Loading...</div>;

  return (
    <div className="view-wrapper">
      <h2>{article.title}</h2>
      <div dangerouslySetInnerHTML={{ __html: marked(article.content) }} />
    </div>
  );
}
