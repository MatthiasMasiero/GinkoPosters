# Hosting: Supabase + Vercel + Render

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Deploy GinkoPosters to production using Supabase (PostgreSQL), Vercel (Next.js frontend), and Render (FastAPI backend) — all on free tiers.

**Architecture:** Three-service split — Vercel serves the Next.js frontend and connects to the FastAPI backend on Render via `NEXT_PUBLIC_BACKEND_URL`. The backend connects to Supabase's managed PostgreSQL. S3 stays for file uploads (can migrate to Supabase Storage later).

**Tech Stack:** Supabase (Postgres), Vercel (Next.js hosting), Render (Docker-based Python hosting), AWS S3 (uploads)

---

## Prerequisites (Manual — do before running tasks)

1. **Supabase account** at [supabase.com](https://supabase.com) — create a new project, note the:
   - Database connection string (Settings > Database > Connection string > URI, use "Transaction" mode pooler for the async URL)
   - Project URL and anon key (not needed for this app, but good to have)

2. **Vercel account** at [vercel.com](https://vercel.com) — linked to your GitHub

3. **Render account** at [render.com](https://render.com) — linked to your GitHub

4. **GitHub repo** — push all current changes first

---

## Task 1: Commit Admin CMS Feature & Push to GitHub

**Files:** All uncommitted changes in the worktree

**Step 1: Merge worktree changes back to main**

The admin CMS work is in `.worktrees/admin-cms` on branch `feature/admin-cms`. Merge it into main.

```bash
cd /Users/matthiasmasiero/Desktop/Code/GinkoPosters
# Commit in worktree first
cd .worktrees/admin-cms
git add -A
git commit -m "feat: admin CMS — product & creator management with S3 uploads"

# Back to main repo, merge
cd /Users/matthiasmasiero/Desktop/Code/GinkoPosters
git merge feature/admin-cms
git push origin main
```

**Step 2: Clean up worktree**

```bash
git worktree remove .worktrees/admin-cms
git branch -d feature/admin-cms
```

---

## Task 2: Configure Backend for Production Deployment

**Files:**
- Create: `backend/render.yaml`
- Create: `render.yaml` (root — Render blueprint)
- Modify: `backend/Dockerfile`
- Modify: `backend/src/config.py`

**Step 1: Update backend Dockerfile for production**

The current Dockerfile lacks a proper production setup. Update it:

```dockerfile
FROM python:3.12-slim
WORKDIR /app

# Install system deps for psycopg2
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libpq-dev && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml .
RUN pip install --no-cache-dir .

COPY . .

EXPOSE 8000
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Step 2: Create Render blueprint at project root**

File: `render.yaml`

```yaml
services:
  - type: web
    name: ginkoposters-api
    runtime: docker
    dockerfilePath: ./backend/Dockerfile
    dockerContext: ./backend
    plan: free
    envVars:
      - key: DATABASE_URL
        sync: false
      - key: DATABASE_URL_SYNC
        sync: false
      - key: JWT_SECRET_KEY
        generateValue: true
      - key: STRIPE_SECRET_KEY
        sync: false
      - key: STRIPE_WEBHOOK_SECRET
        sync: false
      - key: AWS_ACCESS_KEY_ID
        sync: false
      - key: AWS_SECRET_ACCESS_KEY
        sync: false
      - key: AWS_DEFAULT_REGION
        value: eu-central-1
      - key: S3_BUCKET_NAME
        sync: false
      - key: ENVIRONMENT
        value: production
      - key: FRONTEND_URL
        sync: false
      - key: BACKEND_URL
        sync: false
      - key: PRIMARY_DOMAIN
        sync: false
```

**Step 3: Update config.py to handle Supabase connection strings**

Supabase connection strings use `postgresql://` prefix. The app needs `postgresql+asyncpg://` for async and `postgresql://` for sync. Add a helper:

In `backend/src/config.py`, after the Settings class, add logic to normalize the DATABASE_URL if it comes from Supabase (which provides a `postgresql://` URL). The current defaults already handle this — just make sure the env vars are set correctly on Render.

No code change needed — just set the env vars correctly:
- `DATABASE_URL`: Replace `postgresql://` with `postgresql+asyncpg://` in the Supabase connection string
- `DATABASE_URL_SYNC`: Use the Supabase connection string as-is

**Step 4: Update CORS in backend to allow Vercel domain**

In `backend/src/main.py`, the CORS is dynamic (loaded from artist domains + FRONTEND_URL). Just set `FRONTEND_URL` env var on Render to your Vercel domain (e.g., `https://ginkoposters.vercel.app`).

No code change needed — env var config only.

**Step 5: Commit**

```bash
git add backend/Dockerfile render.yaml
git commit -m "chore: add Render deployment config and production Dockerfile"
```

---

## Task 3: Set Up Supabase Database

**Step 1: Run schema on Supabase**

Use the Supabase SQL Editor (Dashboard > SQL Editor) or CLI to run:
1. The contents of `database/init.sql` (creates all tables + indexes)
2. The contents of `database/seed.sql` (creates admin user + sample data)

Note: The seed admin password hash (`$2b$12$CRWX7GJvnjngUhtweramV...`) corresponds to password `admin123`.

**Step 2: Verify connection**

Test from local machine:
```bash
cd backend
DATABASE_URL="postgresql+asyncpg://<supabase-connection-string>" \
DATABASE_URL_SYNC="postgresql://<supabase-connection-string>" \
python3 -c "
from src.config import settings
print(f'DB URL: {settings.DATABASE_URL[:50]}...')
"
```

---

## Task 4: Configure Vercel for Frontend

**Files:**
- Modify: `frontend/next.config.ts` (add image domains)

**Step 1: Update next.config.ts for production image loading**

Images come from S3. Next.js needs to know which domains are allowed:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.s3.*.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
};

export default nextConfig;
```

**Step 2: Set up Vercel project**

Use the Vercel CLI plugin:
```
/vercel:setup
```

Then configure environment variables in Vercel dashboard (or CLI):
- `NEXT_PUBLIC_BACKEND_URL` = `https://ginkoposters-api.onrender.com` (your Render URL)
- `NEXT_PUBLIC_PRIMARY_DOMAIN` = your production domain (e.g., `ginkoposters.vercel.app`)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = your real Stripe publishable key

**Step 3: Commit**

```bash
git add frontend/next.config.ts
git commit -m "chore: configure Next.js for production image domains"
```

---

## Task 5: Deploy Backend to Render

**Step 1: Create Render web service**

Go to [render.com](https://render.com) > New > Web Service:
- Connect your GitHub repo
- Root directory: `backend`
- Runtime: Docker
- Plan: Free

**Step 2: Set environment variables on Render**

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `postgresql+asyncpg://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres` |
| `DATABASE_URL_SYNC` | `postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres` |
| `JWT_SECRET_KEY` | Generate a random 64-char string |
| `STRIPE_SECRET_KEY` | Your `sk_live_...` or `sk_test_...` key |
| `STRIPE_WEBHOOK_SECRET` | Your `whsec_...` key |
| `AWS_ACCESS_KEY_ID` | Your AWS key |
| `AWS_SECRET_ACCESS_KEY` | Your AWS secret |
| `S3_BUCKET_NAME` | `ginkoposters-print-files` |
| `ENVIRONMENT` | `production` |
| `FRONTEND_URL` | `https://ginkoposters.vercel.app` |
| `BACKEND_URL` | `https://ginkoposters-api.onrender.com` |
| `PRIMARY_DOMAIN` | Your production domain |

**Step 3: Verify health endpoint**

```bash
curl https://ginkoposters-api.onrender.com/health
# Expected: {"status":"healthy"}
```

---

## Task 6: Deploy Frontend to Vercel

**Step 1: Deploy using Vercel plugin**

```
/vercel:deploy
```

Or push to main — Vercel auto-deploys if connected to GitHub.

**Step 2: Verify**

Visit `https://ginkoposters.vercel.app` — should load the landing page.
Visit `https://ginkoposters.vercel.app/admin/login` — should show login form.

---

## Task 7: Final Push & Verify

**Step 1: Push all config changes**

```bash
git push origin main
```

**Step 2: End-to-end verification checklist**

- [ ] Landing page loads on Vercel URL
- [ ] Admin login works (email: `admin@ginkoposters.com`, password: `admin123`)
- [ ] Admin dashboard shows stats
- [ ] Admin products page lists products
- [ ] Create product flow works (if S3 is configured)
- [ ] Backend health check returns `{"status":"healthy"}`

---

## Cost Summary

| Service | Free Tier Limits | Monthly Cost |
|---------|-----------------|--------------|
| Supabase | 500MB DB, 1GB storage, 50k auth MAU | $0 |
| Vercel | 100GB bandwidth, serverless functions | $0 |
| Render | 750 hrs/mo (spins down after 15min idle) | $0 |
| **Total** | | **$0/mo** |

**Tradeoffs on free tier:**
- Render free tier: ~30s cold start after 15min idle
- Supabase free tier: DB pauses after 1 week of inactivity (can be resumed)

---

## Future Optimizations

- Replace S3 with Supabase Storage (saves needing an AWS account)
- Add custom domain to Vercel
- Upgrade Render to Starter ($7/mo) to eliminate cold starts
- Set up GitHub Actions CI/CD for automated testing before deploy
