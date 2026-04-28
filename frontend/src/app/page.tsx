import { Suspense } from "react";
import type { Metadata } from "next";

import HomePageClient from "@/components/HomePageClient";
import HomeSkeleton from "@/components/HomeSkeleton";
import { fetchArticlesServer } from "@/lib/server-content";

export const dynamic = "force-dynamic";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hamrobichar.app";

export const metadata: Metadata = {
  title: "Latest Nepal News, Breaking Stories, Politics, Business & Technology | HamroBichar",
  description:
    "Read the latest Nepal news, breaking stories, politics, business, education, and technology on HamroBichar.".slice(0, 155),
  alternates: {
    canonical: siteUrl
  },
  openGraph: {
    title: "Latest Nepal News, Breaking Stories, Politics, Business & Technology | HamroBichar",
    description: "Read the latest Nepal news, breaking stories, politics, business, education, and technology on HamroBichar.".slice(0, 155),
    url: siteUrl
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
