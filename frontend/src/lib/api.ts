import api from "./axios";
import {
  AdminUser,
  ApiResponse,
  Article,
  ArticleListPayload,
  ArticleViewPayload,
  Comment,
  LoginPayload,
  UploadImagePayload
} from "@/types";

export const getArticles = async (params?: { category?: string; q?: string }): Promise<ArticleListPayload> => {
  const searchParams = new URLSearchParams();

  if (params?.category) {
    searchParams.set("category", params.category);
  }

  if (params?.q) {
    searchParams.set("q", params.q);
  }

  const query = searchParams.toString();
  const response = await api.get<ApiResponse<ArticleListPayload>>(query ? `/articles?${query}` : "/articles");
  return response.data.data;
};

export const getArticleBySlug = async (slug: string): Promise<Article> => {
  const response = await api.get<ApiResponse<Article>>(`/articles/${slug}`);
  return response.data.data;
};

export const trackArticleView = async (slug: string): Promise<ArticleViewPayload> => {
  const response = await api.post<ApiResponse<ArticleViewPayload>>(`/articles/${slug}/view`);
  return response.data.data;
};

export const getArticleComments = async (slug: string): Promise<Comment[]> => {
  const response = await api.get<ApiResponse<Comment[]>>(`/articles/${slug}/comments`);
  return response.data.data;
};

export const createArticleComment = async (
  slug: string,
  payload: { name: string; message: string }
): Promise<Comment> => {
  const response = await api.post<ApiResponse<Comment>>(`/articles/${slug}/comments`, payload);
  return response.data.data;
};

export const loginAdmin = async (payload: {
  email?: string;
  userCode?: string;
  password: string;
}): Promise<LoginPayload> => {
  const response = await api.post<ApiResponse<LoginPayload>>("/auth/login", payload);
  return response.data.data;
};

export const createArticle = async (
  payload: Pick<Article, "title" | "content" | "category" | "image" | "author"> &
    Partial<Pick<Article, "titleNp" | "contentNp" | "categoryNp">>,
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
  payload: Partial<
    Pick<Article, "title" | "content" | "category" | "image" | "author" | "titleNp" | "contentNp" | "categoryNp">
  >,
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
  role: "superadmin" | "admin" | "subadmin" | "user",
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

export const createSubAdmin = async (
  payload: {
    username: string;
    email: string;
    password: string;
    profileType: "internship" | "job";
    address: string;
    designation: string;
    documentType: "citizenship" | "passport" | "driving_license";
    documentFrontImage: string;
    documentBackImage: string;
  },
  token: string
): Promise<AdminUser> => {
  const response = await api.post<ApiResponse<AdminUser>>("/auth/subadmin", payload, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return response.data.data;
};

export const resetSubAdminPassword = async (
  userId: string,
  newPassword: string,
  token: string
): Promise<void> => {
  await api.patch(
    `/auth/subadmin/${userId}/password`,
    { newPassword },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
};

export const deleteSubAdmin = async (userId: string, token: string): Promise<void> => {
  await api.delete(`/auth/subadmin/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
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
