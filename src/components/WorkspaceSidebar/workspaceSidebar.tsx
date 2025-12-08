import type { Workspace, Article } from "../../types";
import "./workspaceSidebar.css";

interface Props {
  workspaces: Workspace[];
  articles: Article[];
  selectedWorkspaceId: string | null;
  onSelectWorkspace: (id: string) => void;
  selectedArticleId: string | null;
  onSelectArticle: (id: string) => void;
}

export default function WorkspaceSidebar({
  workspaces,
  articles,
  selectedWorkspaceId,
  onSelectWorkspace,
  selectedArticleId,
  onSelectArticle,
}: Props) {
  const handleWorkspaceClick = (workspaceId: string) => {
    if (selectedWorkspaceId === workspaceId) {
      onSelectWorkspace("");
    } else {
      onSelectWorkspace(workspaceId);
    }
  };

  return (
    <div className="workspace-sidebar">
      <ul className="workspace-list">
        {workspaces.map((ws) => {
          const isOpen = ws.id === selectedWorkspaceId;
          return (
            <li key={ws.id}>
              <div
                className={"workspace-title" + (isOpen ? " selected" : "")}
                onClick={() => handleWorkspaceClick(ws.id)}
              >
                <span className="workspace-icon">{isOpen ? "⯆" : "⯈"}</span>
                {ws.name}
              </div>
              {isOpen && (
                <ul className="article-list">
                  {articles
                    .filter((a) => a.workspaceId === ws.id)
                    .map((a) => (
                      <li
                        key={a.id}
                        className={
                          "article-title" +
                          (a.id === selectedArticleId ? " selected" : "")
                        }
                        onClick={() => onSelectArticle(a.id)}
                      >
                        {a.title}
                      </li>
                    ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
