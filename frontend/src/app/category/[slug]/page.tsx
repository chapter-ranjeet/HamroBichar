import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";

import NewsCard from "@/components/NewsCard";
import { getDictionary, LANGUAGE_COOKIE, normalizeLanguage } from "@/lib/i18n";
import { getSiteUrl } from "@/lib/runtime";
import { fetchArticlesServer } from "@/lib/server-content";
import { slugify, unslugify } from "@/lib/slug";

const siteUrl = getSiteUrl();

export const dynamic = "force-dynamic";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const categoryName = unslugify(slug);

  const title = `${categoryName} | HamroBichar`;
  const description = `Latest ${categoryName.toLowerCase()} news and updates from HamroBichar.`.slice(0, 155);
  const canonical = `${siteUrl}/category/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical
    },
    robots: {
      index: true,
      follow: true
    },
    openGraph: {
      title,
      description,
      url: canonical
    }
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const cookieStore = await cookies();
  const language = normalizeLanguage(cookieStore.get(LANGUAGE_COOKIE)?.value);
  const dictionary = getDictionary(language);
  const { slug } = await params;
  const data = await fetchArticlesServer();
  const categoryArticles = data.articles.filter((article) => slugify(article.category) === slug);
  const categoryName =
    language === "np"
      ? categoryArticles[0]?.categoryNp ?? categoryArticles[0]?.category ?? unslugify(slug)
      : categoryArticles[0]?.category ?? unslugify(slug);

  return (
    <section className="mx-auto my-8 w-full max-w-7xl rounded-3xl bg-white p-5 shadow-sm sm:my-10 sm:p-8 lg:p-10">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{dictionary.category.section}</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900 sm:text-5xl">{categoryName}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            {dictionary.category.description}
          </p>
        </div>
        <Link href="/" className="text-sm font-bold text-rose-700 hover:text-rose-800">
          {dictionary.category.back}
        </Link>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {categoryArticles.map((article) => (
          <NewsCard key={article._id} article={article} />
        ))}
      </div>

      {categoryArticles.length === 0 && (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-slate-600">
          {dictionary.category.noArticles}
        </div>
      )}
    </section>
  );
}
