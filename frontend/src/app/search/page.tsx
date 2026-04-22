import type { Metadata } from "next";
import Link from "next/link";

import NewsCard from "@/components/NewsCard";
import { fetchArticlesServer } from "@/lib/server-content";

export const dynamic = "force-dynamic";

type SearchPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export const metadata: Metadata = {
  title: "Search Articles",
  description: "Search HamroBichar articles by keyword, category, or author.",
  robots: {
    index: false,
    follow: false
  }
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const data = query ? await fetchArticlesServer({ q: query }) : await fetchArticlesServer();

  return (
    <section className="mx-auto my-8 w-full max-w-7xl rounded-3xl bg-white p-5 shadow-sm sm:my-10 sm:p-8 lg:p-10">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Search</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900 sm:text-5xl">
            {query ? `Results for “${query}”` : "Search articles"}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            Search by title, content, author, or category to quickly find the story you need.
          </p>
        </div>
        <Link href="/" className="text-sm font-bold text-rose-700 hover:text-rose-800">
          Back to home
        </Link>
      </div>

      <form action="/search" method="get" className="mt-6 flex gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2">
        <input
          name="q"
          defaultValue={query}
          placeholder="Search articles..."
          className="min-w-0 flex-1 rounded-xl border-0 bg-transparent px-3 py-2 text-sm outline-none"
        />
        <button className="rounded-xl bg-rose-700 px-4 py-2 text-sm font-bold text-white hover:bg-rose-800">
          Search
        </button>
      </form>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {data.articles.map((article) => (
          <NewsCard key={article._id} article={article} />
        ))}
      </div>

      {data.articles.length === 0 && (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-slate-600">
          No articles matched your search.
        </div>
      )}
    </section>
  );
}
