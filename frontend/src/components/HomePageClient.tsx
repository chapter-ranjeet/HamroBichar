"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import NewsCard from "@/components/NewsCard";
import { getArticles } from "@/lib/api";
import { Article } from "@/types";

export default function HomePageClient() {
  const searchParams = useSearchParams();
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [showAllCategoryCards, setShowAllCategoryCards] = useState(false);
  const [showMobileCategories, setShowMobileCategories] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getArticles();
        setArticles(response.articles);
        setCategories(["All", ...response.categories]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch articles");
      } finally {
        setLoading(false);
      }
    };

    void fetchArticles();
  }, []);

  useEffect(() => {
    const categoryFromQuery = searchParams.get("category");

    setSelectedCategory(categoryFromQuery ?? "All");
  }, [searchParams]);

  const visibleArticles =
    selectedCategory === "All"
      ? articles
      : articles.filter((article) => article.category === selectedCategory);

  const latestArticles = visibleArticles.slice(0, 6);

  const categoryStats = categories
    .filter((category) => category !== "All")
    .map((category) => ({
      name: category,
      count: articles.filter((article) => article.category === category).length
    }))
    .sort((a, b) => b.count - a.count);

  const visibleCategoryStats = showAllCategoryCards ? categoryStats : categoryStats.slice(0, 4);

  return (
    <section className="py-8 sm:py-10">
      <div className="mb-8 space-y-3">
        <p className="inline-block rounded-full border border-rose-200 bg-rose-100 px-3 py-1 text-xs font-black uppercase tracking-widest text-rose-700">
          Nepal Headlines
        </p>
        <h1 className="max-w-3xl text-2xl font-black tracking-tight text-slate-900 sm:text-4xl">
          Latest News from HamroBichar
        </h1>
        <p className="max-w-2xl text-sm font-medium text-slate-600 sm:text-base">
          Stay close to politics, economy, culture, and community stories shaping modern Nepal.
        </p>
      </div>

      <section className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:hidden">
        <div className="bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 px-4 py-4 text-white">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-300">Mobile Edition</p>
          <h2 className="mt-1 text-lg font-black">Today&apos;s Top Stories</h2>
        </div>
        <div className="px-4 py-4">
          <p className="text-sm font-medium leading-relaxed text-slate-600">
            A cleaner reading flow for smaller screens. Scroll down to explore the latest verified
            headlines from across Nepal.
          </p>
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                  Selected Category
                </p>
                <p className="mt-1 text-sm font-bold text-slate-800">{selectedCategory}</p>
              </div>
              <button
                onClick={() => setShowMobileCategories((prev) => !prev)}
                className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-black uppercase tracking-wide text-rose-700"
              >
                {showMobileCategories ? "Hide" : "Choose"}
              </button>
            </div>

            {showMobileCategories && (
              <div className="mt-3 flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category);
                      setShowMobileCategories(false);
                    }}
                    className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                      selectedCategory === category
                        ? "bg-rose-700 text-white"
                        : "border border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span className="h-2 w-2 rounded-full bg-slate-400" />
          </div>
        </div>
      </section>

      {!loading && !error && categoryStats.length > 0 && (
        <section className="mb-6 hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm sm:block">
          <div className="border-b border-slate-200 bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 px-4 py-3 text-white sm:px-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-black sm:text-lg">Browse By Category</h2>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-300 sm:text-[11px]">
                  Pick a desk and filter stories instantly
                </p>
              </div>
              <p className="text-xs font-bold text-amber-300 sm:text-sm">
                {articles.length} Total {articles.length === 1 ? "Story" : "Stories"}
              </p>
            </div>
          </div>

          <div className="p-3 sm:p-4">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {visibleCategoryStats.map((category) => (
                <button
                  key={category.name}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`group rounded-lg border p-3 text-left transition ${
                    selectedCategory === category.name
                      ? "border-rose-500 bg-rose-50 shadow-[inset_0_0_0_1px_rgba(190,18,60,0.12)]"
                      : "border-slate-200 bg-slate-50 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white"
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800 sm:text-sm">{category.name}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                        selectedCategory === category.name
                          ? "bg-rose-600 text-white"
                          : "bg-slate-200 text-slate-700 group-hover:bg-slate-300"
                      }`}
                    >
                      {category.count}
                    </span>
                  </div>
                  <div className="h-1 w-full overflow-hidden rounded bg-slate-200">
                    <div
                      className={`h-full rounded ${
                        selectedCategory === category.name ? "bg-rose-500" : "bg-slate-400"
                      }`}
                      style={{ width: `${Math.max(12, Math.min(100, category.count * 16))}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    {category.count} {category.count === 1 ? "article" : "articles"}
                  </p>
                </button>
              ))}
            </div>

            {categoryStats.length > 4 && (
              <div className="mt-3 text-center">
                <button
                  type="button"
                  onClick={() => setShowAllCategoryCards((prev) => !prev)}
                  className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-slate-700 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
                >
                  {showAllCategoryCards ? "Show Less" : `View All (${categoryStats.length})`}
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      <div className="mb-8 hidden sm:block">
        <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-slate-500">
          Quick Filters
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-sm font-semibold transition ${
                selectedCategory === category
                  ? "bg-rose-700 text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-rose-50"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {loading && <p className="text-slate-600">Loading latest news...</p>}

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
          <p className="font-semibold text-rose-700">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {latestArticles.map((article) => (
            <NewsCard key={article._id} article={article} />
          ))}
          {latestArticles.length === 0 && (
            <p className="text-slate-600">No news in this category yet.</p>
          )}
        </div>
      )}
    </section>
  );
}