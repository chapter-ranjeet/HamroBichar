import type { Metadata } from "next";
import Link from "next/link";

import { getDictionary } from "@/lib/i18n";
import { getSiteUrl } from "@/lib/runtime";
import { fetchArticlesServer } from "@/lib/server-content";
import { slugify, unslugify } from "@/lib/slug";
import { siteTitle, pageDescription } from "@/lib/seo";

export const dynamic = "force-dynamic";
const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: siteTitle('News Categories'),
  description: pageDescription('Browse HamroBichar news by category including politics, business, education, technology, and more.'),
  robots: {
    index: true,
    follow: true
  },
  openGraph: {
    title: siteTitle('News Categories'),
    description: pageDescription('Browse HamroBichar news by category including politics, business, education, technology, and more.'),
    url: `${siteUrl}/category`,
    siteName: "HamroBichar",
    locale: "en_US",
    type: "website",
    images: [{ url: `${siteUrl}/HBLogo2.png`, alt: 'HamroBichar' }]
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle("News Categories"),
    description: pageDescription("Browse HamroBichar news by category including politics, business, education, technology, and more."),
    images: [`${siteUrl}/HBLogo2.png`]
  },
  alternates: {
    canonical: `${siteUrl}/category`,
    languages: {
      en: `${siteUrl}/category`,
      ne: `${siteUrl}/category?lang=ne`
    }
  }
};

export default async function CategoriesIndex() {
  const dictionary = getDictionary("en");
  const data = await fetchArticlesServer();
  const categories = Array.from(new Set(data.categories || [])).filter(Boolean);

  return (
    <section className="mx-auto my-8 w-full max-w-7xl rounded-3xl bg-white p-6 shadow-sm sm:my-10 sm:p-8 lg:p-10">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{dictionary.category.section}</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">Categories</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">Browse content by topic.</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map((cat) => (
          <Link
            key={cat}
            href={`/category/${slugify(cat)}`}
            className="rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-800 hover:bg-rose-50 hover:border-rose-200"
          >
            {unslugify(slugify(cat))}
          </Link>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-slate-600">
          No categories available.
        </div>
      )}
    </section>
  );
}
