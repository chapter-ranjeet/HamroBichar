import { NextResponse } from "next/server";
import { getSiteUrl } from "@/lib/runtime";

const siteUrl = getSiteUrl();

export async function GET() {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${siteUrl}/sitemap.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${siteUrl}/news-sitemap.xml</loc>
  </sitemap>
</sitemapindex>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, s-maxage=900, stale-while-revalidate=86400"
    }
  });
}
