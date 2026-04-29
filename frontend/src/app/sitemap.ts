import type { MetadataRoute } from "next";

import { Article, ArticleListPayload, ApiResponse } from "@/types";
import { slugify } from "@/lib/slug";
import { getApiBaseUrl, getSiteUrl } from "@/lib/runtime";

const siteUrl = getSiteUrl();
const apiBase = getApiBaseUrl();

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
  const categories = [...new Set(articles.map((article) => article.category))];
  const articleRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${siteUrl}/article/${article.slug}`,
    lastModified: article.updatedAt,
    changeFrequency: "hourly",
    priority: 0.8
  }));

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${siteUrl}/category/${slugify(category)}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "daily",
    priority: 0.7
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
    ...categoryRoutes,
    ...articleRoutes
  ];
}
