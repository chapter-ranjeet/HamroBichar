export interface Article {
  _id: string;
  title: string;
  slug: string;
  content: string;
  category: string;
  image?: string;
  author: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ArticleListPayload {
  articles: Article[];
  categories: string[];
}

export interface LoginPayload {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: "admin" | "user";
  };
}

export interface AdminUser {
  _id: string;
  username: string;
  email: string;
  role: "admin" | "user";
  createdAt: string;
}

export interface UploadImagePayload {
  imageUrl: string;
}
