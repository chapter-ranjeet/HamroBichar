import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/runtime";

const siteUrl = getSiteUrl();

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/master", "/master/dashboard"]
      }
    ],
    host: siteUrl,
    sitemap: [`${siteUrl}/sitemap.xml`, `${siteUrl}/news-sitemap.xml`]
  };
}
