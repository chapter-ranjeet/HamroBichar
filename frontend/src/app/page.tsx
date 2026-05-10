import { Suspense } from "react";
import type { Metadata } from "next";

import HomePageClient from "@/components/HomePageClient";
import HomeSkeleton from "@/components/HomeSkeleton";
import { fetchArticlesServer } from "@/lib/server-content";
import { getSiteUrl } from "@/lib/runtime";
import { siteTitle, pageDescription } from "@/lib/seo";

export const dynamic = "force-dynamic";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: siteTitle(),
  description: pageDescription(
    "Read the latest Nepal news, breaking stories, politics, business, education, and technology on HamroBichar."
  ),
  alternates: {
    canonical: siteUrl,
    languages: {
      en: siteUrl,
      ne: `${siteUrl}/?lang=ne`
    }
  },
  openGraph: {
    title: siteTitle(),
    description: pageDescription(
      "Read the latest Nepal news, breaking stories, politics, business, education, and technology on HamroBichar."
    ),
    url: siteUrl,
    images: [{ url: `${siteUrl}/HBLogo2.png`, alt: "HamroBichar" }]
  }
};

export default async function HomePage() {
  const initialData = await fetchArticlesServer();

  return (
    <Suspense fallback={<HomeSkeleton />}>
      <HomePageClient
        initialArticles={initialData.articles}
        initialCategories={initialData.categories}
        initialPopularArticles={initialData.popularArticles ?? []}
        initialBreakingArticles={initialData.breakingArticles ?? []}
      />
    </Suspense>
  );
}
