export interface Article {
  id: string;
  title: string;
  content: string;
    attachments?: {
    filename: string;
    originalname: string;
    mimetype: string;
    size: number;
  }[]
}
