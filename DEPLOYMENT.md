# LookUp DMS — Deployment Guide

## Prerequisites

- Node.js 18+
- PostgreSQL (Neon DB recommended)
- Google Cloud account
- Vercel account
- Resend account (email)

---

## 1. Google Drive Service Account Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable the **Google Drive API**
4. Go to **IAM & Admin → Service Accounts**
5. Click **Create Service Account**
   - Name: `lookupdms-drive`
   - Role: `Editor`
6. Click on the service account → **Keys tab** → **Add Key → Create new key (JSON)**
7. Download the JSON file
8. Extract `client_email` → `GOOGLE_SERVICE_ACCOUNT_EMAIL`
9. Extract `private_key` → `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
10. Create a folder in Google Drive, share it with the service account email
11. Copy folder ID from URL → `GOOGLE_DRIVE_ROOT_FOLDER_ID`

---

## 2. Google OAuth Configuration

1. In Google Cloud Console → **APIs & Services → Credentials**
2. Click **Create Credentials → OAuth 2.0 Client IDs**
3. Application type: **Web application**
4. Authorized redirect URIs: `https://your-domain.vercel.app/api/auth/callback/google`
5. Copy `Client ID` → `GOOGLE_CLIENT_ID`
6. Copy `Client Secret` → `GOOGLE_CLIENT_SECRET`

---

## 3. Neon PostgreSQL Setup

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the **Connection string** → `DATABASE_URL`
4. Run migrations:
   ```bash
   npm run db:migrate
   ```

---

## 4. Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_URL` | Full URL of your app (e.g. `https://app.lookupdms.com`) |
| `NEXTAUTH_SECRET` | Random 32-char secret (`openssl rand -base64 32`) |
| `GOOGLE_CLIENT_ID` | OAuth 2.0 client ID |
| `GOOGLE_CLIENT_SECRET` | OAuth 2.0 client secret |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Drive service account email |
| `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` | Drive service account private key |
| `GOOGLE_DRIVE_ROOT_FOLDER_ID` | Root Drive folder ID |
| `OPENAI_API_KEY` | OpenAI API key for AI features |
| `RESEND_API_KEY` | Resend API key for email |

---

## 5. Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

Or connect your GitHub repo in the Vercel dashboard.

**Add environment variables** in Vercel Dashboard → Project → Settings → Environment Variables.

---

## 6. Post-Deployment Checklist

- [ ] Database migrations ran successfully
- [ ] Google OAuth redirect URI matches Vercel domain
- [ ] Drive service account has folder access
- [ ] NEXTAUTH_URL matches production URL
- [ ] Seed database: `npm run db:seed`
- [ ] Test login with Google OAuth
- [ ] Test file upload to Drive
- [ ] Verify AI summary works
- [ ] Test e-signature workflow

---

## 7. Monitoring Setup

- **Vercel Analytics**: Enabled by default on Vercel Pro
- **Error tracking**: Add Sentry: `npm install @sentry/nextjs`
- **Uptime**: Use UptimeRobot or Vercel's built-in monitoring
- **Database**: Monitor via Neon dashboard
