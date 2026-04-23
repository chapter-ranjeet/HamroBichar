import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";
import Link from "next/link";

import ArticleComments from "@/components/ArticleComments";
import ArticleViewTracker from "@/components/ArticleViewTracker";
import { fetchArticleServer, fetchArticlesServer } from "@/lib/server-content";
import { Article } from "@/types";

export const dynamic = "force-dynamic";

const toRenderableHtml = (content: string): string => {
  const hasHtmlTags = /<[^>]+>/.test(content);
  if (hasHtmlTags) {
    return content;
  }

  return content.replace(/\n/g, "<br />");
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hamrobichar.app";
const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api";
const backendOrigin = apiBase.replace(/\/api\/?$/, "");

const toTextSnippet = (content: string): string =>
  content
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const resolveImageUrl = (image?: string): string | undefined => {
  if (!image) {
    return undefined;
  }

  if (/^https?:\/\//i.test(image)) {
    return image;
  }

  if (image.startsWith("/uploads/")) {
    return `${backendOrigin}${image}`;
  }

  if (image.startsWith("/")) {
    return `${siteUrl}${image}`;
  }

  return `${siteUrl}/${image}`;
};

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

const fetchArticle = async (slug: string): Promise<Article | null> => {
  try {
    return await fetchArticleServer(slug);
  } catch {
    return null;
  }
};

const fetchRelatedData = async (category: string): Promise<{
  relatedArticles: Article[];
  popularArticles: Article[];
}> => {
  try {
    const data = await fetchArticlesServer({ category });
    return {
      relatedArticles: data.articles,
      popularArticles: data.popularArticles ?? []
    };
  } catch {
    return {
      relatedArticles: [],
      popularArticles: []
    };
  }
};

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await fetchArticle(slug);

  if (!article) {
    return {
      title: "Article Not Found",
      description: "The requested article could not be found on HamroBichar.",
      robots: {
        index: false,
        follow: false
      }
    };
  }

  const articleUrl = `${siteUrl}/article/${article.slug}`;
  const description = toTextSnippet(article.content).slice(0, 170);
  const image = resolveImageUrl(article.image);

  return {
    title: article.title,
    description,
    alternates: {
      canonical: articleUrl
    },
    openGraph: {
      type: "article",
      url: articleUrl,
      title: article.title,
      description,
      publishedTime: article.createdAt,
      modifiedTime: article.updatedAt,
      section: article.category,
      authors: [article.author],
      images: image ? [{ url: image, alt: article.title }] : undefined
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: article.title,
      description,
      images: image ? [image] : undefined
    }
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await fetchArticle(slug);

  if (!article) {
    notFound();
  }

  const articleUrl = `${siteUrl}/article/${article.slug}`;
  const imageUrl = resolveImageUrl(article.image);
  const articleDescription = toTextSnippet(article.content).slice(0, 170);
  const relatedData = await fetchRelatedData(article.category);
  const relatedArticles = relatedData.relatedArticles.filter((item) => item.slug !== article.slug).slice(0, 3);
  const popularArticles = relatedData.popularArticles
    .filter((item) => item.slug !== article.slug)
    .slice(0, 4);
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: articleDescription,
    datePublished: article.createdAt,
    dateModified: article.updatedAt,
    articleSection: article.category,
    author: {
      "@type": "Person",
      name: article.author
    },
    publisher: {
      "@type": "Organization",
      name: "HamroBichar",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/HBLogo2.png`
      }
    },
    mainEntityOfPage: articleUrl,
    image: imageUrl ? [imageUrl] : undefined
  };

  return (
    <>
      <ArticleViewTracker slug={article.slug} />
      <Script
        id={`article-schema-${article.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <article className="mx-auto my-6 grid w-full max-w-6xl gap-6 lg:grid-cols-[1fr,0.72fr] sm:my-8">
        <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-8 lg:p-10">
        <p className="mb-3 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-800">
          {article.category}
        </p>
        <h1 className="text-2xl font-black leading-tight text-slate-900 sm:text-3xl lg:text-4xl">{article.title}</h1>
        <p className="mt-3 text-sm text-slate-500">
          By {article.author} • {new Date(article.createdAt).toLocaleString()}
        </p>
        {article.image && (
          <div className="relative my-5 aspect-video w-full min-h-52 overflow-hidden rounded-xl bg-slate-100 sm:my-6 sm:min-h-72">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl ?? article.image}
              alt={article.title}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        )}
        <div
          className="prose prose-slate max-w-none text-slate-700 prose-p:leading-8"
          dangerouslySetInnerHTML={{ __html: toRenderableHtml(article.content) }}
        />
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr,0.8fr]">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Related Articles</p>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                {relatedArticles.map((related) => (
                  <Link key={related._id} href={`/article/${related.slug}`} className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-rose-200 hover:bg-rose-50">
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-rose-700">{related.category}</p>
                    <h2 className="mt-2 line-clamp-3 text-sm font-bold text-slate-900">{related.title}</h2>
                  </Link>
                ))}
                {relatedArticles.length === 0 && (
                  <p className="text-sm text-slate-500 md:col-span-3">No related articles found yet.</p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Popular Now</p>
              <div className="mt-4 space-y-3">
                {popularArticles.map((popular, index) => (
                  <Link key={popular._id} href={`/article/${popular.slug}`} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 transition hover:border-rose-200 hover:bg-rose-50">
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-100 text-sm font-black text-rose-700">
                      {index + 1}
                    </span>
                    <div>
                      <p className="line-clamp-2 text-sm font-bold text-slate-900">{popular.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{popular.viewCount ?? 0} views</p>
                    </div>
                  </Link>
                ))}
                {popularArticles.length === 0 && (
                  <p className="text-sm text-slate-500">Popular articles are updating.</p>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-6 lg:pt-0">
          <ArticleComments slug={article.slug} />
        </div>
      </article>
    </>
  );
}
