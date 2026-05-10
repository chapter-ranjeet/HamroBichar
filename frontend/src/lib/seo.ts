export function siteTitle(defaultTitle?: string) {
  const base = 'HamroBichar';
  return defaultTitle ? `${defaultTitle} | ${base}` : base;
}

export function pageDescription(summary: string, fallback = 'Latest Nepal news, politics, business, and technology updates from HamroBichar.') {
  if (!summary) return fallback;
  const trimmed = summary.trim();
  return trimmed.length > 160 ? `${trimmed.slice(0, 157)}...` : trimmed;
}

export function categoryDescription(categoryName: string) {
  if (!categoryName) return 'Latest news and updates from HamroBichar.';
  return `Latest ${categoryName} news, analysis, and updates from HamroBichar.`;
}
