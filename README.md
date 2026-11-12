# SellerMargin

Static SellerMargin site with a Vercel serverless contact endpoint.

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
