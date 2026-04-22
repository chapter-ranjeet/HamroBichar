import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";

import { getArticleBySlug } from "@/lib/api";
import { Article } from "@/types";

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
    return await getArticleBySlug(slug);
  } catch {
    return null;
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
        url: `${siteUrl}/favicon.ico`
      }
    },
    mainEntityOfPage: articleUrl,
    image: imageUrl ? [imageUrl] : undefined
  };

  return (
    <>
      <Script
        id={`article-schema-${article.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <article className="mx-auto my-6 w-full max-w-4xl rounded-2xl bg-white p-4 shadow-sm sm:my-8 sm:p-8 lg:p-10">
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
              src={article.image}
              alt={article.title}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        )}
        <div
          className="prose prose-slate max-w-none text-slate-700"
          dangerouslySetInnerHTML={{ __html: toRenderableHtml(article.content) }}
        />
      </article>
    </>
  );
}
