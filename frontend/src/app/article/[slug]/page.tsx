"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { getArticleBySlug } from "@/lib/api";
import { Article } from "@/types";

const toRenderableHtml = (content: string): string => {
  const hasHtmlTags = /<[^>]+>/.test(content);
  if (hasHtmlTags) {
    return content;
  }

  return content.replace(/\n/g, "<br />");
};

export default function ArticlePage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await getArticleBySlug(slug);
        setArticle(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load article");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      void fetchArticle();
    }
  }, [slug]);

  if (loading) {
    return <p className="py-16 text-center text-slate-600">Loading article...</p>;
  }

  if (error) {
    return (
      <div className="space-y-4 py-16 text-center">
        <p className="text-rose-700">{error}</p>
        <Link href="/" className="font-semibold text-slate-700 underline">
          Go back to homepage
        </Link>
      </div>
    );
  }

  if (!article) {
    return <p className="py-16 text-center text-slate-600">Article not found.</p>;
  }

  return (
    <article className="mx-auto my-6 w-full max-w-4xl rounded-2xl bg-white p-4 shadow-sm sm:my-8 sm:p-8 lg:p-10">
      <p className="mb-3 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-800">
        {article.category}
      </p>
      <h1 className="text-2xl font-black leading-tight text-slate-900 sm:text-3xl lg:text-4xl">{article.title}</h1>
      <p className="mt-3 text-sm text-slate-500">
        By {article.author} • {new Date(article.createdAt).toLocaleString()}
      </p>
      {article.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={article.image}
          alt={article.title}
          className="my-5 h-52 w-full rounded-xl object-cover sm:my-6 sm:h-72"
        />
      )}
      <div
        className="prose prose-slate max-w-none text-slate-700"
        dangerouslySetInnerHTML={{ __html: toRenderableHtml(article.content) }}
      />
    </article>
  );
}
