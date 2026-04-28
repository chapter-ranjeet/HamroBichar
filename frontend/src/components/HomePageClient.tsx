"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { useLanguage } from "@/components/LanguageProvider";
import AnimatedHeadline from "@/components/AnimatedHeadline";
import NepaliCalendarWidget from "@/components/NepaliCalendarWidget";
import NewsCard from "@/components/NewsCard";
import { slugify } from "@/lib/slug";
import { Article } from "@/types";

const ALL_CATEGORY = "__all__";

interface HomePageClientProps {
  initialArticles: Article[];
  initialCategories: string[];
  initialPopularArticles: Article[];
  initialBreakingArticles: Article[];
}

const toExcerpt = (content: string): string => {
  const plain = content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

  if (plain.length <= 180) {
    return plain;
  }

  return `${plain.slice(0, 180)}...`;
};

export default function HomePageClient({
  initialArticles,
  initialCategories,
  initialPopularArticles,
  initialBreakingArticles
}: HomePageClientProps) {
  const { language, dictionary } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") ?? "");
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get("category") ?? ALL_CATEGORY);
  const [showMobileCategories, setShowMobileCategories] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);

  const categories = useMemo(() => [ALL_CATEGORY, ...initialCategories], [initialCategories]);
  const categoryLabelMap = useMemo(() => {
    const pairs = initialArticles.map((article) => [article.category, article.categoryNp] as const);
    return new Map(pairs.filter((item): item is readonly [string, string] => Boolean(item[0] && item[1])));
  }, [initialArticles]);

  const localizedTitle = (article: Article): string => (language === "np" ? article.titleNp || article.title : article.title);
  const localizedContent = (article: Article): string =>
    language === "np" ? article.contentNp || article.content : article.content;
  const localizedCategory = (article: Article): string =>
    language === "np" ? article.categoryNp || article.category : article.category;
  const localizedCategoryLabel = (category: string): string => {
    if (language !== "np") {
      return category;
    }

    return categoryLabelMap.get(category) ?? category;
  };

  const categoryScopedArticles =
    selectedCategory === ALL_CATEGORY
      ? initialArticles
      : initialArticles.filter((article) => article.category === selectedCategory);

  const featuredArticle = categoryScopedArticles[0];
  const topStories = categoryScopedArticles.slice(1, 5);
  const breakingArticles = initialBreakingArticles.length > 0 ? initialBreakingArticles : initialArticles.slice(0, 4);
  const popularArticles =
    initialPopularArticles.length > 0
      ? initialPopularArticles
      : [...initialArticles].sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0)).slice(0, 5);

  const visibleArticles = categoryScopedArticles.slice(0, visibleCount);
  const hasMoreArticles = visibleCount < categoryScopedArticles.length;

  useEffect(() => {
    setVisibleCount(6);
  }, [selectedCategory]);

  const onSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const query = searchTerm.trim();
    router.push(query ? `/search?q=${encodeURIComponent(query)}` : "/");
  };

  return (
    <section className="py-6 sm:py-10">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <p className="inline-flex rounded-full border border-rose-200 bg-rose-100 px-3 py-1 text-xs font-black uppercase tracking-widest text-rose-700">
            {dictionary.home.label}
          </p>
          <div className="max-w-4xl">
            {/* Animated headline */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            {/* using client component for animation */}
            <AnimatedHeadline text={dictionary.home.title} className="text-3xl font-black tracking-tight text-slate-900 sm:text-5xl" />
          </div>
          <p className="max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            {dictionary.home.description}
          </p>
        </div>

        <form onSubmit={onSearchSubmit} className="w-full max-w-xl">
          <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-slate-500" htmlFor="home-search">
            {dictionary.home.searchLabel}
          </label>
          <div className="flex gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
            <input
              id="home-search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder={dictionary.home.searchPlaceholder}
              className="min-w-0 flex-1 rounded-xl border-0 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-slate-400"
            />
            <button
              type="submit"
              className="shrink-0 rounded-xl bg-rose-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-rose-800"
            >
              {dictionary.home.searchButton}
            </button>
          </div>
        </form>
      </div>

      <section className="mb-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:grid lg:grid-cols-[1.4fr,0.9fr]">
        <div className="p-5 sm:p-6 lg:p-8">
          <div className="flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-slate-500">
            <span className="rounded-full bg-rose-100 px-2.5 py-1 text-rose-700">{dictionary.home.breakingNews}</span>
            <span>{dictionary.home.livePicks}</span>
          </div>

          {featuredArticle ? (
            <div className="mt-5 grid gap-6 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
              <div className="space-y-4">
                <p className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-800">
                  {localizedCategory(featuredArticle)}
                </p>
                <Link href={`/article/${featuredArticle.slug}`} className="block">
                  <h2 className="text-2xl font-black leading-tight text-slate-900 transition hover:text-rose-700 sm:text-4xl">
                    {localizedTitle(featuredArticle)}
                  </h2>
                </Link>
                <p className="max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                  {toExcerpt(localizedContent(featuredArticle))}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500">
                  <span>{dictionary.common.by} {featuredArticle.author}</span>
                  <span className="h-1 w-1 rounded-full bg-slate-300" />
                  <span>{new Date(featuredArticle.createdAt).toLocaleDateString()}</span>
                  <span className="h-1 w-1 rounded-full bg-slate-300" />
                  <span>{featuredArticle.viewCount ?? 0} {dictionary.article.viewsSuffix}</span>
                </div>
                <Link
                  href={`/article/${featuredArticle.slug}`}
                  className="inline-flex rounded-full bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-rose-700"
                >
                  {dictionary.home.readFullStory}
                </Link>
              </div>

              <div className="grid gap-3">
                {topStories.map((article) => (
                  <Link
                    key={article._id}
                    href={`/article/${article.slug}`}
                    className="group flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 transition hover:border-rose-200 hover:bg-rose-50"
                  >
                    <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-200">
                      {article.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={article.image} alt={localizedTitle(article)} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-slate-500">
                          {dictionary.home.noImage}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-rose-700">
                        {localizedCategory(article)}
                      </p>
                      <h3 className="mt-1 line-clamp-2 text-sm font-bold leading-5 text-slate-900 group-hover:text-rose-700">
                        {localizedTitle(article)}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">{article.author}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-slate-500">
              {dictionary.home.noArticles}
            </div>
          )}
        </div>

        <aside className="border-t border-slate-200 bg-slate-50 p-5 sm:p-6 lg:border-t-0 lg:border-l lg:p-8">
          <div className="space-y-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{dictionary.home.popular}</p>
              <div className="mt-3 space-y-3">
                {popularArticles.map((article, index) => (
                  <Link
                    href={`/article/${article.slug}`}
                    key={article._id}
                    className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-3 transition hover:border-rose-200 hover:bg-rose-50"
                  >
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-100 text-sm font-black text-rose-700">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-sm font-bold text-slate-900">{localizedTitle(article)}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {localizedCategory(article)} · {article.viewCount ?? 0} {dictionary.article.viewsSuffix}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{dictionary.home.categories}</p>
                <button
                  type="button"
                  onClick={() => setShowMobileCategories((prev) => !prev)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-700 lg:hidden"
                >
                  {showMobileCategories ? dictionary.home.hide : dictionary.home.show}
                </button>
              </div>
              <div className={`mt-3 flex flex-wrap gap-2 ${showMobileCategories ? "" : "hidden lg:flex"}`}>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                      selectedCategory === category
                        ? "bg-rose-700 text-white shadow-sm"
                        : "border border-slate-200 bg-white text-slate-700 hover:bg-rose-50"
                    }`}
                  >
                    {category === ALL_CATEGORY ? dictionary.common.all : localizedCategoryLabel(category)}
                  </button>
                ))}
              </div>

              <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{dictionary.home.whyThisLayout}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {dictionary.home.whyThisLayoutBody}
                </p>
              </div>
            </div>
          </div>
        </aside>
      </section>

      <section className="mb-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:p-8">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{dictionary.home.latest}</p>
            <h2 className="mt-1 text-2xl font-black text-slate-900">{dictionary.home.freshStories}</h2>
          </div>
          <Link href="/search" className="text-sm font-bold text-rose-700 hover:text-rose-800">
            {dictionary.home.searchAll}
          </Link>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                selectedCategory === category
                  ? "bg-rose-700 text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-rose-50"
              }`}
            >
              {category === ALL_CATEGORY ? dictionary.common.all : localizedCategoryLabel(category)}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visibleArticles.map((article) => (
            <NewsCard key={article._id} article={article} />
          ))}
          {visibleArticles.length === 0 && (
            <p className="text-slate-600">{dictionary.home.noCategoryArticles}</p>
          )}
        </div>

        {categoryScopedArticles.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {hasMoreArticles && (
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + 5)}
                className="rounded-full bg-rose-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-rose-800"
              >
                {dictionary.home.loadMore}
              </button>
            )}

            {visibleCount > 6 && (
              <button
                type="button"
                onClick={() => setVisibleCount(6)}
                className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                {dictionary.home.reloadLatest}
              </button>
            )}
          </div>
        )}
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-slate-900 p-5 text-white shadow-sm sm:p-6 lg:p-8">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-300">{dictionary.home.breakingBlock}</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {breakingArticles.map((article) => (
              <Link key={article._id} href={`/article/${article.slug}`} className="rounded-2xl bg-white/5 p-4 transition hover:bg-white/10">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-amber-300">{localizedCategory(article)}</p>
                <h3 className="mt-2 line-clamp-2 text-sm font-bold leading-6 text-white">{localizedTitle(article)}</h3>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:p-8">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{dictionary.home.readNext}</p>
          <div className="mt-4 space-y-3">
            {initialArticles.slice(0, 4).map((article) => (
              <Link
                key={article._id}
                href={`/article/${article.slug}`}
                className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-rose-200 hover:bg-rose-50"
              >
                <div className="min-w-0">
                  <p className="line-clamp-1 text-sm font-bold text-slate-900">{localizedTitle(article)}</p>
                  <p className="mt-1 text-xs text-slate-500">{article.author} · {localizedCategory(article)}</p>
                </div>
                <span className="text-sm font-black text-rose-700">↗</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-rose-700">
              Calendar, Events & Festivals
            </p>
            <h2 className="mt-1 text-2xl font-black text-slate-900">{dictionary.home.latest}</h2>
          </div>
        </div>

        <NepaliCalendarWidget className="w-full" showAdDate />
      </section>

    </section>
  );
}