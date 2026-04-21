"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getArticles } from "@/lib/api";
import { Article } from "@/types";

export default function Navbar() {
  const nepalTimeZone = "Asia/Kathmandu";
  const [now, setNow] = useState(() => new Date());
  const [articles, setArticles] = useState<Article[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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

  const englishDate = now.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: nepalTimeZone
  });

  const nepaliDate = "२०८३ बैशाख ७ गते, सोमबार";

  const remainingArticles = articles.slice(6);

  const nepaliTime = now.toLocaleTimeString("ne-NP", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: nepalTimeZone
  });

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="border-b border-slate-100 bg-slate-900 text-slate-100">
        <div className="flex w-full items-center justify-between px-4 py-2 text-xs sm:px-6 lg:px-10">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-semibold tracking-wide">
            <span>EN: {englishDate}</span>
            <span className="text-slate-400">|</span>
            <span>नेपाली मिति: {nepaliDate}</span>
            <span>समय: {nepaliTime} NPT</span>
          </p>
          <p className="flex items-center gap-2 font-semibold uppercase tracking-wider text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Live Updates
          </p>
        </div>
      </div>

      <nav className="flex w-full flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
        <div>
          <Link href="/" className="text-2xl font-black tracking-tight text-rose-700 sm:text-3xl">
            HamroBichar
          </Link>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 sm:text-[11px]">
            Voices and News from Nepal
          </p>
        </div>

        <div className="relative flex w-full items-center gap-2 sm:w-auto sm:gap-3">
          <Link
            className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-rose-300 hover:text-rose-700"
            href="/"
          >
            Home
          </Link>

          {remainingArticles.length > 0 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-rose-300 hover:text-rose-700"
              >
                More News ({remainingArticles.length})
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full z-40 mt-2 w-[min(92vw,20rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl sm:w-80">
                  <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                      Older Headlines
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      Articles beyond the latest six
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
                          {article.title}
                        </p>
                        <p className="mt-1 text-xs font-medium text-slate-500">{article.category}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
