"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { useLanguage } from "@/components/LanguageProvider";
import { getArticles } from "@/lib/api";
import { slugify } from "@/lib/slug";
import { Article } from "@/types";

export default function Navbar() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { language, dictionary } = useLanguage();

  useEffect(() => {
    const loadArticles = async () => {
      try {
        const response = await getArticles();
        setArticles(response.articles);
      } catch {
        setArticles([]);
      }
    };

    void loadArticles();
  }, []);

  const getArticleTitle = (article: Article): string =>
    language === "np" ? article.titleNp || article.title : article.title;
  const categories = Array.from(
    new Set(articles.map((article) => article.category).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));
  const categoryLabelMap = new Map(
    articles
      .filter((article) => article.category && article.categoryNp)
      .map((article) => [article.category, article.categoryNp as string])
  );
  const getCategoryLabel = (category: string): string => {
    if (language !== "np") {
      return category;
    }

    return categoryLabelMap.get(category) ?? category;
  };

  const remainingArticles = articles.slice(6);
  const topBarDate = new Date().toLocaleDateString(language === "np" ? "ne-NP" : "en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="border-b border-slate-100 bg-slate-900 text-slate-100">
        <div className="flex w-full items-center justify-between px-4 py-1.5 text-[11px] sm:px-6 sm:text-xs lg:px-10">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-semibold tracking-wide">
            <span>
              {dictionary.topBar.today}: {topBarDate}
            </span>
          </p>
          <div className="flex items-center gap-2 sm:gap-3">
            <p className="flex items-center gap-2 font-semibold uppercase tracking-wider text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              {dictionary.topBar.liveUpdates}
            </p>
          </div>
        </div>
      </div>

      <nav className="w-full px-4 py-2 sm:px-6 sm:py-3 lg:px-10">
        <div className="flex items-center justify-between gap-3">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-xl font-black tracking-tight text-rose-700 sm:text-3xl">
              <Image
                src="/HBLogo2.png"
                alt="HamroBichar logo"
                width={56}
                height={56}
                className="h-12 w-12 rounded-full border border-slate-200 bg-white p-0.5 object-contain sm:h-14 sm:w-14"
                priority
              />
              <span>HamroBichar</span>
            </Link>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 sm:text-[11px]">
              {dictionary.footer.voices}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setMobileNavOpen((prev) => !prev)}
            className="group inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 shadow-sm transition hover:border-rose-300 hover:text-rose-700"
            aria-label={mobileNavOpen ? dictionary.nav.menuClose : dictionary.nav.menuOpen}
            aria-expanded={mobileNavOpen}
          >
            <span className="relative h-4 w-4">
              <span
                className={`absolute left-0 top-0 block h-0.5 w-4 rounded bg-current transition duration-300 ${
                  mobileNavOpen ? "translate-y-1.75 rotate-45" : ""
                }`}
              />
              <span
                className={`absolute left-0 top-1.75 block h-0.5 w-4 rounded bg-current transition duration-300 ${
                  mobileNavOpen ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`absolute left-0 top-3.5 block h-0.5 w-4 rounded bg-current transition duration-300 ${
                  mobileNavOpen ? "-translate-y-1.75 -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>

        <div className={`relative mt-2 w-full items-center gap-2 sm:mt-3 sm:w-auto sm:gap-3 ${mobileNavOpen ? "flex" : "hidden"}`}>
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
            <Link
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:border-rose-300 hover:text-rose-700 sm:px-4 sm:py-2 sm:text-sm"
              href="/"
              onClick={() => setMobileNavOpen(false)}
            >
              {dictionary.nav.home}
            </Link>

            <Link
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 sm:px-4 sm:py-2 sm:text-sm"
              href="/search"
              onClick={() => setMobileNavOpen(false)}
            >
              {dictionary.nav.search}
            </Link>

            <div className="hidden lg:contents">
              {categories.map((category) => (
                <Link
                  key={category}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 sm:px-4 sm:py-2 sm:text-sm"
                  href={`/category/${slugify(category)}`}
                  onClick={() => setMobileNavOpen(false)}
                >
                  {getCategoryLabel(category)}
                </Link>
              ))}
            </div>

            {remainingArticles.length > 0 && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen((prev) => !prev)}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:border-rose-300 hover:text-rose-700 sm:px-4 sm:py-2 sm:text-sm"
                >
                  {dictionary.nav.moreNews} ({remainingArticles.length})
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-full z-40 mt-2 w-[min(92vw,20rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl sm:w-80">
                    <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                        {dictionary.nav.olderHeadlines}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {dictionary.nav.olderHeadlinesSub}
                      </p>
                    </div>
                    <div className="max-h-80 overflow-y-auto p-2">
                      {remainingArticles.map((article) => (
                        <Link
                          key={article._id}
                          href={`/article/${article.slug}`}
                          onClick={() => setMenuOpen(false)}
                          className="block rounded-xl px-3 py-3 transition hover:bg-rose-50"
                        >
                          <p className="line-clamp-2 text-sm font-semibold text-slate-800">
                            {getArticleTitle(article)}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="ml-auto" />
          </div>
        </div>
      </nav>
    </header>
  );
}
