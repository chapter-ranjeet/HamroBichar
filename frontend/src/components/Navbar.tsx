"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { getArticles } from "@/lib/api";
import { slugify } from "@/lib/slug";
import { Article } from "@/types";

export default function Navbar() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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
  const englishDate = new Date().toLocaleDateString("en-US", {
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

            <Link
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 sm:px-4 sm:py-2 sm:text-sm"
              href="/search"
              onClick={() => setMobileNavOpen(false)}
            >
              Search
            </Link>

            {categories.map((category) => (
              <Link
                key={category}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 sm:px-4 sm:py-2 sm:text-sm"
                href={`/category/${slugify(category)}`}
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

            <div className="ml-auto flex items-start gap-2 rounded-xl border border-slate-200 bg-white px-2 py-1.5">
              <a
                href="https://www.facebook.com/profile.php?id=61565276758903"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-w-20 flex-col items-center gap-1 rounded-lg px-2 py-1 text-center text-slate-700 transition hover:bg-rose-50 hover:text-rose-700"
                onClick={() => setMobileNavOpen(false)}
              >
                <Image
                  src="/HBLogo2.png"
                  alt="HamroBichar app icon"
                  width={28}
                  height={28}
                  className="h-7 w-7 rounded-full border border-slate-200 bg-white p-0.5 object-contain"
                />
                <span className="text-[11px] font-semibold">Facebook</span>
              </a>
              <a
                href="https://www.instagram.com/hamrobichar/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-w-20 flex-col items-center gap-1 rounded-lg px-2 py-1 text-center text-slate-700 transition hover:bg-rose-50 hover:text-rose-700"
                onClick={() => setMobileNavOpen(false)}
              >
                <Image
                  src="/HBLogo2.png"
                  alt="HamroBichar app icon"
                  width={28}
                  height={28}
                  className="h-7 w-7 rounded-full border border-slate-200 bg-white p-0.5 object-contain"
                />
                <span className="text-[11px] font-semibold">Instagram</span>
              </a>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
