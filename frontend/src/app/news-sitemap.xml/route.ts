import { NextResponse } from "next/server";

import { getApiBaseUrl, getSiteUrl } from "@/lib/runtime";
import { ApiResponse, Article, ArticleListPayload } from "@/types";

const siteUrl = getSiteUrl();
const apiBase = getApiBaseUrl();
const NEWS_LOOKBACK_HOURS = 48;

const escapeXml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");

const getRecentArticles = async (): Promise<Article[]> => {
  try {
    const response = await fetch(`${apiBase}/articles`, {
      next: { revalidate: 900 }
    });

    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as ApiResponse<ArticleListPayload>;
    const allArticles = payload.data.articles ?? [];
    const cutoff = Date.now() - NEWS_LOOKBACK_HOURS * 60 * 60 * 1000;

    return allArticles
      .filter((article) => {
        const publishedAt = new Date(article.createdAt).getTime();
        return Number.isFinite(publishedAt) && publishedAt >= cutoff;
      })
      .slice(0, 1000);
  } catch {
    return [];
  }
};

export async function GET() {
  const recentArticles = await getRecentArticles();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${recentArticles
  .map((article) => {
    const articleUrl = `${siteUrl}/article/${article.slug}`;
    const title = escapeXml(article.title || "Untitled Article");
    const publicationDate = new Date(article.createdAt).toISOString();

    return `  <url>
    <loc>${escapeXml(articleUrl)}</loc>
    <news:news>
      <news:publication>
        <news:name>HamroBichar</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${publicationDate}</news:publication_date>
      <news:title>${title}</news:title>
    </news:news>
  </url>`;
  })
  .join("\n")}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, s-maxage=900, stale-while-revalidate=86400"
    }
  });
}
