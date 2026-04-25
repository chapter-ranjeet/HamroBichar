"use client";

import Link from "next/link";

import { useLanguage } from "@/components/LanguageProvider";
import { Article } from "@/types";

interface NewsCardProps {
  article: Article;
}

const getExcerpt = (content: string): string => {
  const plain = content.replace(/<[^>]*>/g, "").trim();
  if (plain.length <= 140) {
    return plain;
  }

  return `${plain.slice(0, 140)}...`;
};

export default function NewsCard({ article }: NewsCardProps) {
  const { dictionary } = useLanguage();

  return (
    <article className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      <Link
        href={`/article/${article.slug}`}
        className="relative block aspect-video w-full min-h-44 overflow-hidden bg-slate-100"
      >
        {article.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.image}
            alt={article.title}
            className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-rose-100 to-amber-100 text-sm font-semibold text-slate-600">
            {dictionary.home.noImage}
          </div>
        )}
      </Link>
      <div className="space-y-3 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          <span className="rounded-full bg-rose-50 px-2.5 py-1 text-rose-700">{article.category}</span>
          <span>{new Date(article.createdAt).toLocaleDateString()}</span>
        </div>
        <h2 className="line-clamp-3 text-lg font-extrabold leading-7 text-slate-900">{article.title}</h2>
        <p className="line-clamp-3 text-sm leading-6 text-slate-600">{getExcerpt(article.content)}</p>
        <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
          <p className="font-medium">{dictionary.common.by} {article.author}</p>
          <p>{article.viewCount ?? 0} {dictionary.article.viewsSuffix}</p>
        </div>
        <Link href={`/article/${article.slug}`} className="inline-flex text-sm font-bold text-rose-700 hover:text-rose-800">
          {dictionary.home.readFullArticle}
        </Link>
      </div>
    </article>
  );
}
