export interface Workspace {
  id: string;
  name: string;
}

export interface Comment {
  id: string;
  articleId: string;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface ArticleVersion {
  id: string;
  articleId: string;
  version: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Article {
  id: string;
  title: string;
  content: string;
  workspaceId: string;
  userId?: string;
  attachments?: {
    filename: string;
    originalname: string;
    mimetype: string;
    size: number;
  }[];
  currentVersion?: number;
  latestVersionData?: {
    version: number;
    title: string;
    content: string;
    createdAt: string;
  };
  versionData?: {
    version: number;
    title: string;
    content: string;
    createdAt: string;
  };
}
