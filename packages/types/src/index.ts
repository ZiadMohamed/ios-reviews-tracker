export interface App {
  id: string;
  name: string;
}

export interface Review {
  id: string;
  appId: string;
  author: string;
  title: string;
  body: string;
  score: number | null;
  updatedAt: string;
  deletedAt: string | null;
}
