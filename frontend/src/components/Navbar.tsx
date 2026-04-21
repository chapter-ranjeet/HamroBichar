"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { getArticles } from "@/lib/api";
import { Article } from "@/types";

export default function Navbar() {
  const nepalTimeZone = "Asia/Kathmandu";
  const [now, setNow] = useState(() => new Date());
  const [articles, setArticles] = useState<Article[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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

  const categories = Array.from(
    new Set(articles.map((article) => article.category).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));

  const remainingArticles = articles.slice(6);
  const englishDate = now.toLocaleDateString("en-US", {
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
            <span>EN: {englishDate}</span>
            <span className="text-slate-400">|</span>
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            
          </p>
          <p className="flex items-center gap-2 font-semibold uppercase tracking-wider text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Live Updates
          </p>
        </div>
      </div>

      <nav className="w-full px-4 py-2 sm:px-6 sm:py-3 lg:px-10">
        <div className="flex items-center justify-between gap-3">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-xl font-black tracking-tight text-rose-700 sm:text-3xl">
              <Image
                src="/hamrobicharlogo.jpeg"
                alt="HamroBichar logo"
                width={40}
                height={40}
                className="h-9 w-9 rounded-full border border-slate-200 object-cover sm:h-10 sm:w-10"
                priority
              />
              <span>HamroBichar</span>
            </Link>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 sm:text-[11px]">
              Voices and News from Nepal
            </p>
          </div>

          <button
            type="button"
            onClick={() => setMobileNavOpen((prev) => !prev)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700"
            aria-label="Toggle navigation"
            aria-expanded={mobileNavOpen}
          >
            <span className="flex flex-col gap-1.5">
              <span className="h-0.5 w-5 rounded bg-slate-700" />
              <span className="h-0.5 w-5 rounded bg-slate-700" />
              <span className="h-0.5 w-5 rounded bg-slate-700" />
            </span>
          </button>
        </div>

        <div
          className={`relative mt-2 w-full items-center gap-2 sm:mt-3 sm:w-auto sm:gap-3 ${
            mobileNavOpen ? "flex" : "hidden"
          }`}
        >
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
            <Link
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:border-rose-300 hover:text-rose-700 sm:px-4 sm:py-2 sm:text-sm"
              href="/"
              onClick={() => setMobileNavOpen(false)}
            >
              Home
            </Link>

            {categories.map((category) => (
              <Link
                key={category}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 sm:px-4 sm:py-2 sm:text-sm"
                href={`/?category=${encodeURIComponent(category)}`}
                onClick={() => setMobileNavOpen(false)}
              >
                {category}
              </Link>
            ))}

            {remainingArticles.length > 0 && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen((prev) => !prev)}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:border-rose-300 hover:text-rose-700 sm:px-4 sm:py-2 sm:text-sm"
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
        </div>
      </nav>
    </header>
  );
}
