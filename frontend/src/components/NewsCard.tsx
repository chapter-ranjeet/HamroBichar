import Link from "next/link";

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
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <Link
        href={`/article/${article.slug}`}
        className="relative block w-full min-h-44 overflow-hidden bg-slate-100 aspect-video"
      >
        {article.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.image}
            alt={article.title}
            className="absolute inset-0 h-full w-full object-cover transition duration-300 hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-rose-100 to-amber-100 text-sm font-semibold text-slate-600">
            No image available
          </div>
        )}
      </Link>
      <div className="space-y-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wide">
          <span className="rounded-full bg-rose-50 px-2 py-1 text-rose-700">{article.category}</span>
          <span className="text-slate-500">{new Date(article.createdAt).toLocaleDateString()}</span>
        </div>
        <h2 className="line-clamp-2 text-lg font-extrabold text-slate-900">{article.title}</h2>
        <p className="line-clamp-3 text-sm text-slate-600">{getExcerpt(article.content)}</p>
        <p className="text-xs font-medium text-slate-500">By {article.author}</p>
        <Link
          href={`/article/${article.slug}`}
          className="inline-block text-sm font-bold text-rose-700 hover:text-rose-800"
        >
          Read full article
        </Link>
      </div>
    </article>
  );
}
