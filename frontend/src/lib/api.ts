import api from "./axios";
import {
  AdminUser,
  ApiResponse,
  Article,
  ArticleListPayload,
  LoginPayload,
  UploadImagePayload
} from "@/types";

export const getArticles = async (): Promise<ArticleListPayload> => {
  const response = await api.get<ApiResponse<ArticleListPayload>>("/articles");
  return response.data.data;
};

export const getArticleBySlug = async (slug: string): Promise<Article> => {
  const response = await api.get<ApiResponse<Article>>(`/articles/${slug}`);
  return response.data.data;
};

export const loginAdmin = async (email: string, password: string): Promise<LoginPayload> => {
  const response = await api.post<ApiResponse<LoginPayload>>("/auth/login", {
    email,
    password
  });
  return response.data.data;
};

export const createArticle = async (
  payload: Pick<Article, "title" | "content" | "category" | "image" | "author">,
  token: string
): Promise<Article> => {
  const response = await api.post<ApiResponse<Article>>("/articles", payload, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data.data;
};

export const updateArticle = async (
  id: string,
  payload: Partial<Pick<Article, "title" | "content" | "category" | "image" | "author">>,
  token: string
): Promise<Article> => {
  const response = await api.put<ApiResponse<Article>>(`/articles/${id}`, payload, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data.data;
};

export const deleteArticle = async (id: string, token: string): Promise<void> => {
  await api.delete(`/articles/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const uploadArticleImage = async (file: File, token: string): Promise<string> => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await api.post<ApiResponse<UploadImagePayload>>("/upload/image", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data"
    }
  });

  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api";
  const backendOrigin = base.replace(/\/api\/?$/, "");
  const imageUrl = response.data.data.imageUrl;

  if (/^https?:\/\//i.test(imageUrl)) {
    return imageUrl;
  }

  return `${backendOrigin}${imageUrl}`;
};

export const getAdminUsers = async (token: string): Promise<AdminUser[]> => {
  const response = await api.get<ApiResponse<AdminUser[]>>("/auth/users", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return response.data.data;
};

export const updateAdminUserRole = async (
  userId: string,
  role: "admin" | "user",
  token: string
): Promise<AdminUser> => {
  const response = await api.patch<ApiResponse<AdminUser>>(
    `/auth/users/${userId}/role`,
    { role },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  return response.data.data;
};

export const changeAdminPassword = async (
  currentPassword: string,
  newPassword: string,
  token: string
): Promise<void> => {
  await api.patch(
    "/auth/change-password",
    {
      currentPassword,
      newPassword
    },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
};
