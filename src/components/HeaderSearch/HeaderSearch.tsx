import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import type { Article } from "../../types";
import "./headerSearch.css";

export default function HeaderSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Article[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    const timeoutId = setTimeout(() => {
      fetch(
        `http://localhost:3333/articles/search?q=${encodeURIComponent(query)}`,
      )
        .then((res) => res.json())
        .then((data) => {
          setResults(data);
          setIsOpen(true);
          setIsLoading(false);
        })
        .catch(() => {
          setResults([]);
          setIsLoading(false);
        });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleArticleClick = useCallback(
    (articleId: string) => {
      setIsOpen(false);
      setQuery("");
      setResults([]);
      navigate(`/?articleId=${articleId}`);
    },
    [navigate],
  );

  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;

    const parts = text.split(new RegExp(`(${highlight})`, "gi"));
    return (
      <span>
        {parts.map((part, index) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <mark key={index}>{part}</mark>
          ) : (
            part
          ),
        )}
      </span>
    );
  };

  return (
    <div className="header-search" ref={searchRef}>
      <div className="header-search-input-wrapper">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query && setIsOpen(true)}
          placeholder="Search articles..."
          className="header-search-input"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
              setIsOpen(false);
            }}
            className="header-search-clear"
          >
            ✕
          </button>
        )}
      </div>

      {isOpen && (
        <div className="header-search-dropdown">
          {isLoading ? (
            <div className="header-search-loading">Searching...</div>
          ) : results.length === 0 ? (
            <div className="header-search-no-results">
              No articles found for "{query}"
            </div>
          ) : (
            <ul className="header-search-results">
              {results.map((article) => (
                <li
                  key={article.id}
                  onClick={() => handleArticleClick(article.id)}
                  className="header-search-result-item"
                >
                  <div className="header-search-result-title">
                    {highlightText(article.title, query)}
                  </div>
                  <div className="header-search-result-preview">
                    {highlightText(
                      article.content.substring(0, 100) + "...",
                      query,
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
