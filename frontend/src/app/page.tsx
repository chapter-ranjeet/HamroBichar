import { Suspense } from "react";
import type { Metadata } from "next";

import HomePageClient from "@/components/HomePageClient";
import { fetchArticlesServer } from "@/lib/server-content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Latest Nepal News, Breaking Stories, Politics, Business & Technology",
  description:
    "Read the latest Nepal news, breaking stories, politics, business, education, and technology on HamroBichar.",
  alternates: {
    canonical: "/"
  }
};

export default async function HomePage() {
  const initialData = await fetchArticlesServer();

  return (
    <Suspense fallback={<p className="py-8 text-slate-600">Loading latest news...</p>}>
      <HomePageClient
        initialArticles={initialData.articles}
        initialCategories={initialData.categories}
        initialPopularArticles={initialData.popularArticles ?? []}
        initialBreakingArticles={initialData.breakingArticles ?? []}
      />
    </Suspense>
  );
}
