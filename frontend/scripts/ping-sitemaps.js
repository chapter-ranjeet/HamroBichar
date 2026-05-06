#!/usr/bin/env node
const defaultSitemaps = [
  process.env.SITEMAP_URL || 'https://hamrobichar.com/sitemap.xml',
  process.env.NEWS_SITEMAP_URL || 'https://hamrobichar.com/news-sitemap.xml'
];

const agents = [
  { name: 'Google', url: 'https://www.google.com/ping?sitemap=' },
  { name: 'Bing', url: 'https://www.bing.com/ping?sitemap=' }
];

async function ping(url) {
  try {
    const res = await fetch(url, { method: 'GET' });
    return { ok: res.ok, status: res.status };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

(async () => {
  console.log('Pinging sitemaps...');
  for (const sitemap of defaultSitemaps) {
    console.log(`\nSitemap: ${sitemap}`);
    for (const agent of agents) {
      const target = agent.url + encodeURIComponent(sitemap);
      process.stdout.write(`- ${agent.name}: `);
      // eslint-disable-next-line no-await-in-loop
      const result = await ping(target);
      if (result.ok) console.log(`OK (${result.status})`);
      else if (result.error) console.log(`ERROR: ${result.error}`);
      else console.log(`FAIL (${result.status})`);
    }
  }
  console.log('\nDone.');
})();
