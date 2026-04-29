import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Script from "next/script";
import Link from "next/link";

import ArticleComments from "@/components/ArticleComments";
import ArticleViewTracker from "@/components/ArticleViewTracker";
import { getDictionary, LANGUAGE_COOKIE, normalizeLanguage } from "@/lib/i18n";
import { fetchArticleServer, fetchArticlesServer } from "@/lib/server-content";
import { resolveOriginalUrl, cloudinaryFetch } from "@/lib/image";
import { getApiBaseUrl, getSiteUrl } from "@/lib/runtime";
import { Article } from "@/types";

export const dynamic = "force-dynamic";

const toRenderableHtml = (content: string): string => {
  if (!content?.trim()) {
    return "<p>Content is being updated. Please check back shortly.</p>";
  }

  const hasHtmlTags = /<[^>]+>/.test(content);
  if (hasHtmlTags) {
    return content;
  }

  return content.replace(/\n/g, "<br />");
};

const siteUrl = getSiteUrl();
const apiBase = getApiBaseUrl();
const backendOrigin = apiBase.replace(/\/api\/?$/, "");

const toTextSnippet = (content: string): string =>
  content
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const estimateReadingTime = (content: string): number => {
  const words = toTextSnippet(content).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
};

const formatReadableDate = (value: string): string => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Recently";
  }

  return parsed.toLocaleString();
};

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

const SocialIcon = ({
  children,
  className = ""
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <span className={`inline-flex h-9 w-9 items-center justify-center rounded-full ${className}`} aria-hidden="true">
    {children}
  </span>
);

const FacebookIcon = () => (
  <SocialIcon className="bg-blue-100 text-blue-700">
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" role="img" focusable="false">
      <path d="M13.5 8.5V7c0-.8.5-1.5 1.5-1.5H17V2h-2c-2.8 0-4.5 1.7-4.5 4.5v2H8v3h2.5V22h3V11.5H16l.5-3z" />
    </svg>
  </SocialIcon>
);

const WhatsAppIcon = () => (
  <SocialIcon className="bg-emerald-100 text-emerald-700">
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" role="img" focusable="false">
      <path d="M12 2a9.96 9.96 0 0 0-8.6 15.04L2 22l5.12-1.35A10 10 0 1 0 12 2Zm0 18.2c-1.7 0-3.38-.45-4.84-1.3l-.35-.2-3.04.8.81-2.96-.23-.38A8.2 8.2 0 1 1 12 20.2Zm4.72-6.2c-.25-.12-1.48-.73-1.71-.82-.23-.08-.4-.12-.58.12-.17.25-.66.82-.81.99-.15.17-.3.19-.55.06-.25-.12-1.04-.39-1.98-1.24-.73-.65-1.22-1.46-1.36-1.71-.14-.25-.01-.39.11-.52.11-.12.25-.31.37-.47.12-.16.16-.27.25-.45.08-.17.04-.33-.02-.45-.06-.12-.58-1.39-.8-1.91-.21-.5-.43-.43-.58-.44h-.5c-.17 0-.45.06-.68.31-.23.25-.88.86-.88 2.1s.9 2.43 1.03 2.6c.12.17 1.77 2.71 4.29 3.8.6.26 1.07.42 1.43.54.6.19 1.15.16 1.58.1.48-.07 1.48-.61 1.69-1.2.21-.58.21-1.07.15-1.2-.06-.12-.23-.19-.48-.31Z" />
    </svg>
  </SocialIcon>
);

const InstagramIcon = () => (
  <SocialIcon className="bg-pink-100 text-pink-700">
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" role="img" focusable="false">
      <path d="M7 2.5h10A4.5 4.5 0 0 1 21.5 7v10A4.5 4.5 0 0 1 17 21.5H7A4.5 4.5 0 0 1 2.5 17V7A4.5 4.5 0 0 1 7 2.5Zm0 1.5A3 3 0 0 0 4 7v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 2.5A5.5 5.5 0 1 1 6.5 12 5.51 5.51 0 0 1 12 6.5Zm0 1.5A4 4 0 1 0 16 12a4 4 0 0 0-4-4Zm5.25-2a1.25 1.25 0 1 1-1.25 1.25A1.25 1.25 0 0 1 17.25 6Z" />
    </svg>
  </SocialIcon>
);

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
  const description = toTextSnippet(article.content).slice(0, 155);
  const image = resolveImageUrl(article.image);
  const formattedTitle = `${article.title} | HamroBichar`;
  const titleTerms = article.title
    .split(/\s+/)
    .map((term) => term.replace(/[^\w-]/g, "").trim())
    .filter((term) => term.length >= 4)
    .slice(0, 8);
  const keywords = Array.from(
    new Set([
      "HamroBichar",
      "Nepal news",
      article.category,
      `${article.category} news Nepal`,
      `${article.title} Nepal`,
      article.author,
      ...titleTerms
    ])
  );

  return {
    title: formattedTitle,
    description,
    keywords,
    alternates: {
      canonical: articleUrl
    },
    openGraph: {
      type: "article",
      url: articleUrl,
      title: formattedTitle,
      description,
      publishedTime: article.createdAt,
      modifiedTime: article.updatedAt,
      section: article.category,
      authors: [article.author],
      images: image ? [{ url: image, alt: article.title }] : undefined
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: formattedTitle,
      description,
      images: image ? [image] : undefined
    }
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const cookieStore = await cookies();
  const language = normalizeLanguage(cookieStore.get(LANGUAGE_COOKIE)?.value);
  const dictionary = getDictionary(language);
  const { slug } = await params;
  const article = await fetchArticle(slug);

  if (!article) {
    notFound();
  }

  const articleUrl = `${siteUrl}/article/${article.slug}`;
  const articleTitle = language === "np" ? article.titleNp || article.title : article.title;
  const articleContent = language === "np" ? article.contentNp || article.content : article.content;
  const articleCategory = language === "np" ? article.categoryNp || article.category : article.category;
  const imageUrl = resolveImageUrl(article.image);
  const articleDescription = toTextSnippet(articleContent).slice(0, 170);
  const plainTextContent = toTextSnippet(articleContent);
  const wordCount = plainTextContent.split(/\s+/).filter(Boolean).length;
  const readingTime = estimateReadingTime(articleContent);
  const relatedData = await fetchRelatedData(article.category);
  const relatedArticles = relatedData.relatedArticles.filter((item) => item.slug !== article.slug).slice(0, 3);
  const popularArticles = relatedData.popularArticles
    .filter((item) => item.slug !== article.slug)
    .slice(0, 4);
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`;
  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(`${articleTitle} ${articleUrl}`)}`;
  const instagramUrl = "https://www.instagram.com/hamrobichar/";
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "@id": articleUrl,
    url: articleUrl,
    headline: articleTitle,
    description: articleDescription,
    datePublished: article.createdAt,
    dateModified: article.updatedAt,
    articleSection: articleCategory,
    inLanguage: language === "np" ? "ne-NP" : "en",
    isAccessibleForFree: true,
    wordCount,
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
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl
    },
    image: imageUrl ? [imageUrl] : undefined,
    thumbnailUrl: imageUrl,
    articleBody: plainTextContent.slice(0, 5000),
    keywords: [articleCategory, "Nepal news", "HamroBichar", article.author].filter(Boolean)
  };

  return (
    <>
      <ArticleViewTracker slug={article.slug} />
      <Script
        id={`article-schema-${article.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <article className="mx-auto my-4 grid w-full max-w-6xl gap-4 sm:my-6 sm:gap-6 lg:grid-cols-[1fr,0.72fr]">
        <div className="overflow-hidden rounded-2xl bg-white p-4 shadow-sm sm:p-6 lg:p-8">
        <p className="mb-3 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-800">
          {articleCategory}
        </p>
        <h1 className="wrap-break-word text-2xl font-black leading-tight text-slate-900 sm:text-3xl lg:text-4xl">{articleTitle}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <p>
            {dictionary.common.by} {article.author || "HamroBichar Team"} • {formatReadableDate(article.createdAt)}
          </p>
          <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:inline-flex" aria-hidden="true" />
          <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            {dictionary.article.readingTime}: {readingTime} min
          </span>
        </div>
        {article.image && (
          <div className="relative my-5 aspect-video w-full min-h-52 overflow-hidden rounded-xl bg-slate-100 sm:my-6 sm:min-h-72">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cloudinaryFetch(resolveOriginalUrl(article.image), { w: 1600 }) ?? imageUrl ?? article.image}
              alt={articleTitle}
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        )}
        <div
          className="prose prose-slate max-w-none wrap-break-word text-slate-700 prose-img:rounded-xl prose-img:shadow-sm prose-p:leading-7 prose-a:break-all sm:prose-p:leading-8"
          dangerouslySetInnerHTML={{ __html: toRenderableHtml(articleContent) }}
        />
        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{dictionary.article.shareArticle}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href={facebookShareUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              <FacebookIcon />
              {dictionary.article.shareOnFacebook}
            </a>
            <a
              href={whatsappShareUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
            >
              <WhatsAppIcon />
              {dictionary.article.shareOnWhatsApp}
            </a>
            <a
              href={instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-pink-200 hover:bg-pink-50 hover:text-pink-700"
            >
              <InstagramIcon />
              {dictionary.article.shareOnInstagram}
            </a>
          </div>
        </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr,0.8fr]">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{dictionary.article.relatedArticles}</p>
              <div className="mt-4 grid gap-3 sm:gap-4 md:grid-cols-3">
                {relatedArticles.map((related) => (
                  <Link key={related._id} href={`/article/${related.slug}`} className="rounded-2xl border border-slate-200 bg-white p-3 transition hover:border-rose-200 hover:bg-rose-50 sm:p-4">
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-rose-700">{language === "np" ? related.categoryNp || related.category : related.category}</p>
                    <h2 className="mt-2 line-clamp-3 wrap-break-word text-sm font-bold text-slate-900">{language === "np" ? related.titleNp || related.title : related.title}</h2>
                  </Link>
                ))}
                {relatedArticles.length === 0 && (
                  <p className="text-sm text-slate-500 md:col-span-3">{dictionary.article.noRelated}</p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{dictionary.article.popularNow}</p>
              <div className="mt-4 space-y-3">
                {popularArticles.map((popular, index) => (
                  <Link key={popular._id} href={`/article/${popular.slug}`} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 transition hover:border-rose-200 hover:bg-rose-50">
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-100 text-sm font-black text-rose-700">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="line-clamp-2 wrap-break-word text-sm font-bold text-slate-900">{language === "np" ? popular.titleNp || popular.title : popular.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{popular.viewCount ?? 0} {dictionary.article.viewsSuffix}</p>
                    </div>
                  </Link>
                ))}
                {popularArticles.length === 0 && (
                  <p className="text-sm text-slate-500">{dictionary.article.popularUpdating}</p>
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
