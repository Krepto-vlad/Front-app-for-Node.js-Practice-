import type { Article } from "../../types";
import "./articleList.css";

interface Props {
  articles: Article[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function ArticleList({ articles, selectedId, onSelect }: Props) {
  return (
    <ul>
      {articles.map((a) => (
        <li
          key={a.id}
          style={{
            background: a.id === selectedId ? "#e0e0e0" : "transparent",
          }}
          onClick={() => onSelect(a.id)}
        >
          {a.title}
        </li>
      ))}
    </ul>
  );
}
