# SellerMargin

Static SellerMargin site with a Vercel serverless contact endpoint.

## SEO routes

Internal links use clean paths such as `/calculator/ebay-us-fee-calculator`.
`vercel.json` rewrites app routes to `index.html`; `robots.txt` and
`sitemap.xml` expose crawl rules and indexable pages. When changing the live
domain, update the canonical, Open Graph and structured-data URLs in
`index.html`, plus the sitemap and robots sitemap URL.
Brand assets live in `assets/`; the 1200×630 PNG is used for both Open Graph
and Twitter large-image cards.

## Vercel Web Analytics

The site includes Vercel's HTML analytics snippet; no analytics package or
build step is needed. Enable **Web Analytics** for the project in the Vercel
dashboard and redeploy to start collecting visits. The plain HTML integration
tracks page loads but does not automatically track client-side route changes.

## Vercel Speed Insights

The site includes Vercel's HTML Speed Insights snippet; no package or build
step is needed. Deploy the site to Vercel and visit it to start collecting
performance metrics.

## Contact email setup

The contact endpoint sends an inquiry to the configured Gmail inbox and sends
an acknowledgement to the submitter. Pricing links include the selected plan.

For local development, fill in `.env.local`:

- `GMAIL_USER`: the Gmail account used to send and receive inquiries.
- `GMAIL_APP_PASSWORD`: a Google App Password (not your regular Gmail password).

Enable 2-Step Verification on the Gmail account, create an App Password in
Google Account → Security → App passwords, and enter it in `.env.local` without
sharing or committing it. Run `npx vercel dev` so the API function can read the
local settings; opening `index.html` directly as a file will not run the
backend.

For production, add the same two values in Vercel → Project Settings →
Environment Variables, then redeploy. Vercel cannot read the local `.env.local`
file. Never commit or share the app password. Google App Passwords require
2-Step Verification to be enabled on the Gmail account.
