export interface Article {
  _id: string;
  title: string;
  slug: string;
  content: string;
  category: string;
  image?: string;
  author: string;
  createdBy?: string;
  viewCount: number;
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
  popularArticles?: Article[];
  breakingArticles?: Article[];
}

export interface LoginPayload {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: "superadmin" | "admin" | "subadmin" | "user";
  };
}

export interface AdminUser {
  _id: string;
  username: string;
  email: string;
  role: "superadmin" | "admin" | "subadmin" | "user";
  createdAt: string;
}

export interface UploadImagePayload {
  imageUrl: string;
}

export interface ArticleViewPayload {
  viewCount: number;
}

export interface Comment {
  _id: string;
  articleSlug: string;
  name: string;
  message: string;
  createdAt: string;
  updatedAt: string;
}
