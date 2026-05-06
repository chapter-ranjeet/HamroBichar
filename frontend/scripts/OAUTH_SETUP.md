# Google Search Console OAuth Setup Guide

## Step-by-Step OAuth Credentials Creation

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top (next to "Google Cloud")
3. Click **NEW PROJECT**
4. Enter project name: `HamroBichar-GSC`
5. Click **CREATE**
6. Wait for creation (2–3 minutes)
7. In the project dropdown, select the new project

### 2. Enable Google Search Console API

1. In the left sidebar, go to **APIs & Services** → **Enabled APIs & services**
2. Click **+ ENABLE APIS AND SERVICES** at the top
3. Search for: `google search console api`
4. Click on **Google Search Console API**
5. Click **ENABLE**

### 3. Create OAuth 2.0 Client Credentials

1. Go to **APIs & Services** → **Credentials** (left sidebar)
2. Click **+ CREATE CREDENTIALS** at the top
3. Choose **OAuth client ID**
4. If prompted to create a consent screen:
   - Click **CONFIGURE CONSENT SCREEN**
   - Select **External** user type
   - Click **CREATE**
   - Fill in:
     - **App name**: `HamroBichar`
     - **User support email**: your email
     - **Developer contact info**: your email
   - Click **SAVE AND CONTINUE**
   - Skip scopes (click **SAVE AND CONTINUE**)
   - Review and click **BACK TO DASHBOARD**
5. Go back to **Credentials** (left sidebar)
6. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
7. For **Application type**, select: **Desktop application**
8. Name it: `HamroBichar CLI`
9. Click **CREATE**
10. A dialog appears with your credentials. Click **DOWNLOAD JSON** (button on right side)
11. Save the downloaded file as `frontend/scripts/gsc-client-secret.json`

### 4. Verify the File Was Saved

Run this from the `frontend` directory:

```powershell
ls scripts/gsc-client-secret.json
```

If the file exists, you're ready to submit sitemaps.

### 5. Submit Sitemaps to Google Search Console

From the `frontend` directory, run:

```powershell
npm run gsc:submit-sitemaps
```

**On first run:**
- The script prints an authorization URL
- Open the URL in your browser
- Click **Allow** to grant access
- Copy the authorization code from the browser
- Paste it into the terminal when prompted
- The script saves a token to `frontend/scripts/gsc-token.json`

**On subsequent runs:**
- The script uses the saved token automatically

### 6. Verify Submission in Search Console

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Select your property (https://hamrobichar.com)
3. Go to **Sitemaps** (left sidebar)
4. You should see both sitemaps listed:
   - `sitemap.xml`
   - `news-sitemap.xml`

If they appear with a green checkmark or "Success" status, the submission was successful.

---

## Troubleshooting

**"Missing OAuth client secret file"**
- Ensure `gsc-client-secret.json` is saved in `frontend/scripts/`
- Run: `ls frontend/scripts/gsc-client-secret.json` to verify

**"Invalid Credentials" during authorization**
- Delete `frontend/scripts/gsc-token.json`
- Re-run `npm run gsc:submit-sitemaps` and re-authorize

**"Error: Unauthorized"**
- Check that the Search Console API is enabled in Google Cloud Console
- Verify the OAuth consent screen is configured

**Sitemaps don't appear in Search Console after submission**
- Wait 5–10 minutes for Google to process
- Check Search Console → Coverage to see if URLs are being crawled
- Ensure the property is verified in Search Console (use Domain property if possible)

---

## Security Notes

- **Never commit** `gsc-client-secret.json` or `gsc-token.json` to version control
- These files are already in `.gitignore`
- Keep the credentials file private and secure

---

## Automating Submissions (Optional)

To automatically submit sitemaps after deployments, add this to your CI/CD pipeline:

```yaml
# Example GitHub Actions workflow
- name: Submit sitemaps to GSC
  run: |
    cd frontend
    npm install
    npm run gsc:submit-sitemaps
  env:
    SITE_URL: https://hamrobichar.com
    SITEMAP_URL: https://hamrobichar.com/sitemap.xml
    NEWS_SITEMAP_URL: https://hamrobichar.com/news-sitemap.xml
```
