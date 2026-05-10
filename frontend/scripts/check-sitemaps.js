const SITE_URL = process.env.SITE_URL || 'http://localhost:3000';
const sitemaps = ['/sitemap.xml', '/news-sitemap.xml', '/sitemap-index.xml', '/sitemap-index.xml'];
const fetch = global.fetch || require('node-fetch');

async function countUrls(sitemapPath) {
  try {
    const res = await fetch(`${SITE_URL}${sitemapPath}`);
    if (!res.ok) return { ok: false, status: res.status };
    const text = await res.text();
    const matches = text.match(/<url>/g);
    return { ok: true, count: matches ? matches.length : 0 };
  } catch (err) {
    return { ok: false, error: err.message || err };
  }
}

async function main() {
  for (const sm of ['/sitemap.xml', '/news-sitemap.xml', '/sitemap-index.xml']) {
    const result = await countUrls(sm);
    if (result.ok) {
      console.log(`${sm}: ${result.count} entries`);
    } else {
      console.log(`${sm}: error`, result.status || result.error);
    }
  }
}

main();
