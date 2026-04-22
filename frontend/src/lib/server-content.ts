import { ApiResponse, Article, ArticleListPayload } from "@/types";

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api";

const buildArticlesUrl = (params?: { category?: string; q?: string }): string => {
  const url = new URL(`${apiBase}/articles`);

  if (params?.category) {
    url.searchParams.set("category", params.category);
  }

  if (params?.q) {
    url.searchParams.set("q", params.q);
  }

  return url.toString();
};

export const fetchArticlesServer = async (
  params?: { category?: string; q?: string }
): Promise<ArticleListPayload> => {
  const response = await fetch(buildArticlesUrl(params), {
    next: { revalidate: 300 }
  });

  if (!response.ok) {
    throw new Error("Failed to fetch articles");
  }

  const payload = (await response.json()) as ApiResponse<ArticleListPayload>;
  return payload.data;
};

export const fetchArticleServer = async (slug: string): Promise<Article> => {
  const response = await fetch(`${apiBase}/articles/${slug}`, {
    next: { revalidate: 300 }
  });

  if (!response.ok) {
    throw new Error("Failed to fetch article");
  }

  const payload = (await response.json()) as ApiResponse<Article>;
  return payload.data;
};
