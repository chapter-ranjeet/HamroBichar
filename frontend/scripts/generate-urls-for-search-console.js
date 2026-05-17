/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

const API_BASE = process.env.API_BASE || 'http://localhost:3000/api';
const SITE_URL = process.env.SITE_URL || 'http://localhost:3000';

async function fetchArticles() {
  try {
    const res = await fetch(`${API_BASE}/articles`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const payload = await res.json();
    return (payload.data && payload.data.articles) || [];
  } catch (err) {
    console.error('Failed to fetch articles:', err.message || err);
    return [];
  }
}

async function main() {
  const articles = await fetchArticles();
  const lines = [];
  lines.push(`${SITE_URL}/`);
  for (const a of articles) {
    if (a && a.slug) lines.push(`${SITE_URL}/article/${a.slug}`);
  }

  const outPath = path.join(__dirname, '..', 'urls-for-search-console.txt');
  fs.writeFileSync(outPath, lines.join('\n'));
  console.log('Wrote', lines.length, 'URLs to', outPath);
}

main();
