#!/usr/bin/env node
/**
 * submit-sitemaps-to-gsc.js
 *
 * Usage:
 * 1. Create OAuth credentials in Google Cloud Console (OAuth Client ID, Desktop or Web).
 * 2. Download the JSON and save as `frontend/scripts/gsc-client-secret.json`.
 * 3. Run:
 *    cd frontend
 *    npm install
 *    npm run gsc:submit-sitemaps
 *
 * On first run the script will print an authorization URL. Open it, authorize, and paste
 * the code back into the terminal. The script saves the token to `frontend/scripts/gsc-token.json`.
 *
 * This script submits sitemaps to Search Console for each site URL configured in the script.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const {google} = require('googleapis');

const CREDENTIALS_PATH = path.resolve(__dirname, 'gsc-client-secret.json');
const TOKEN_PATH = path.resolve(__dirname, 'gsc-token.json');

// Edit these to match your deployed site and sitemap URLs.
const SITE_URL = process.env.SITE_URL || 'https://hamrobichar.com';
const SITEMAPS = [
  process.env.SITEMAP_URL || `${SITE_URL}/sitemap.xml`,
  process.env.NEWS_SITEMAP_URL || `${SITE_URL}/news-sitemap.xml`
];

async function loadCredentials() {
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    throw new Error(`Missing OAuth client secret file. Create OAuth credentials and save JSON to ${CREDENTIALS_PATH}`);
  }

  const content = fs.readFileSync(CREDENTIALS_PATH, 'utf8');
  return JSON.parse(content);
}

function askQuestion(query) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(query, (ans) => { rl.close(); resolve(ans); }));
}

async function authorize() {
  const credentials = await loadCredentials();
  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  // Check for previously stored token
  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
    oAuth2Client.setCredentials(token);
    return oAuth2Client;
  }

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/webmasters']
  });

  console.log('Authorize this app by visiting this url:', authUrl);
  const code = await askQuestion('Enter the code from that page here: ');
  const { tokens } = await oAuth2Client.getToken(code.trim());
  oAuth2Client.setCredentials(tokens);
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
  console.log('Token stored to', TOKEN_PATH);
  return oAuth2Client;
}

async function submitSitemap(oAuth2Client, siteUrl, sitemapUrl) {
  const webmasters = google.webmasters({ version: 'v3', auth: oAuth2Client });
  try {
    await webmasters.sitemaps.submit({
      siteUrl: siteUrl,
      feedpath: sitemapUrl
    });
    console.log(`Submitted sitemap: ${sitemapUrl}`);
  } catch (err) {
    console.error(`Failed to submit sitemap ${sitemapUrl}:`, err.message || err);
  }
}

(async () => {
  try {
    const auth = await authorize();
    for (const sitemap of SITEMAPS) {
      await submitSitemap(auth, SITE_URL, sitemap);
    }
    console.log('Done submitting sitemaps. Check Google Search Console > Sitemaps for results.');
  } catch (err) {
    console.error('Error:', err.message || err);
    process.exitCode = 1;
  }
})();
