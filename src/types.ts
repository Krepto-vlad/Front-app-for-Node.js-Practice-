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

export interface Article {
  id: string;
  title: string;
  content: string;
  workspaceId: string;
  attachments?: {
    filename: string;
    originalname: string;
    mimetype: string;
    size: number;
  }[];
}
