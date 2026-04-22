import type { MetadataRoute } from "next";

import { Article, ArticleListPayload, ApiResponse } from "@/types";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hamrobichar.app";
const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api";

const getArticles = async (): Promise<Article[]> => {
  try {
    const response = await fetch(`${apiBase}/articles`, {
      next: { revalidate: 1800 }
    });

    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as ApiResponse<ArticleListPayload>;
    return payload.data.articles ?? [];
  } catch {
    return [];
  }
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getArticles();
  const articleRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${siteUrl}/article/${article.slug}`,
    lastModified: article.updatedAt,
    changeFrequency: "hourly",
    priority: 0.8
  }));

  return [
    {
      url: `${siteUrl}/`,
      lastModified: new Date().toISOString(),
      changeFrequency: "hourly",
      priority: 1
    },
    {
      url: `${siteUrl}/about`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: 0.6
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: 0.6
    },
    {
      url: `${siteUrl}/privacy-policy`,
      lastModified: new Date().toISOString(),
      changeFrequency: "yearly",
      priority: 0.5
    },
    ...articleRoutes
  ];
}
