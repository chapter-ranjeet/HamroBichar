/**
 * Internal linking utilities to improve SEO by connecting related content
 */

export function extractKeywordsFromContent(content: string): string[] {
  if (!content) return [];
  // Extract common keywords from content (simplified NLP)
  const words = content
    .toLowerCase()
    .replace(/<[^>]+>/g, ' ')
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 4);

  // Count frequency and return top keywords
  const freq = new Map<string, number>();
  words.forEach((word) => freq.set(word, (freq.get(word) ?? 0) + 1));

  return Array.from(freq.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([word]) => word);
}

export function findRelatedArticlesByKeywords(
  currentArticleId: string,
  allArticles: Array<{ _id: string; title: string; content: string; slug: string }>,
  limit = 3
): Array<{ _id: string; title: string; slug: string; score: number }> {
  if (!allArticles.length) return [];

  const currentArticle = allArticles.find((a) => a._id === currentArticleId);
  if (!currentArticle) return [];

  const keywords = extractKeywordsFromContent(currentArticle.content);
  const keywordSet = new Set(keywords);

  const scored = allArticles
    .filter((a) => a._id !== currentArticleId)
    .map((article) => {
      const articleKeywords = extractKeywordsFromContent(article.content);
      const matches = articleKeywords.filter((kw) => keywordSet.has(kw)).length;
      return {
        _id: article._id,
        title: article.title,
        slug: article.slug,
        score: matches
      };
    })
    .filter((a) => a.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored;
}

export function generateInternalLinksMarkup(
  relatedArticles: Array<{ title: string; slug: string }>
): string {
  if (!relatedArticles.length) return '';

  const links = relatedArticles
    .map((a) => `<a href="/article/${a.slug}" rel="internal">${a.title}</a>`)
    .join(' | ');

  return `<p style="margin-top: 1rem; padding: 0.5rem; background: #f0f0f0; border-radius: 0.25rem; font-size: 0.875rem;">Related: ${links}</p>`;
}
