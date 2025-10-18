# Deployment Guide

## 🚀 Vercel Deployment Status

**Production URL:** https://web-j30km2fem-yongparks-projects.vercel.app

**Last Deployed:** 2025-10-18
**Status:** ✅ Build Successful
**Build Time:** 25s

---

## 📋 Environment Variables Setup (Required)

The application is deployed but needs environment variables to connect to Supabase.

### Step 1: Access Vercel Dashboard

1. Go to https://vercel.com/yongparks-projects/web
2. Click on "Settings" tab
3. Click on "Environment Variables" in the left sidebar

### Step 2: Add Required Variables

Add the following environment variables for **Production** environment:

#### Required Variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT-ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
SUPABASE_SERVICE_ROLE_KEY=[YOUR-SERVICE-ROLE-KEY]

# Optional: Naver Maps (for Phase 3 "Find My Councillor" feature)
NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=[YOUR-NAVER-MAP-CLIENT-ID]
```

#### Where to Find These Values:

**Supabase Dashboard:**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to "Project Settings" → "API"
4. Copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep this secret!)

**Local `.env.local` file:**
```bash
cat /c/Users/user/they_work_for_yongincitizen/web/.env.local
```

### Step 3: Redeploy

After adding environment variables:

```bash
cd /c/Users/user/they_work_for_yongincitizen/web
vercel --prod
```

Or click "Redeploy" button in Vercel Dashboard.

---

## 🔍 Verify Deployment

### 1. Check Homepage
Visit: https://web-j30km2fem-yongparks-projects.vercel.app

Should show:
- Welcome message
- Link to councillors, meetings, bills

### 2. Check Data Pages

**Councillors:**
- https://web-j30km2fem-yongparks-projects.vercel.app/councillors
- Should display 31 councillors

**Meetings:**
- https://web-j30km2fem-yongparks-projects.vercel.app/meetings
- Should display 30 meetings

**Bills:**
- https://web-j30km2fem-yongparks-projects.vercel.app/bills
- Should display 30 bills

### 3. Check Vercel Logs

```bash
vercel logs [deployment-url] --follow
```

Or in Vercel Dashboard:
- Deployments → Click on latest → "Logs" tab

---

## 🐛 Troubleshooting

### Issue: "No data displayed"

**Cause:** Environment variables not set

**Fix:**
1. Check Vercel Dashboard → Settings → Environment Variables
2. Ensure all required variables are added
3. Redeploy

### Issue: "Supabase connection error"

**Check:**
1. Supabase project is active (not paused)
2. API keys are correct
3. Row Level Security (RLS) policies allow public read access

```sql
-- In Supabase SQL Editor
SELECT * FROM councillors LIMIT 5;
SELECT * FROM meetings LIMIT 5;
SELECT * FROM bills LIMIT 5;
```

### Issue: "Build failed"

**Check build logs:**
```bash
vercel logs [deployment-url]
```

Common issues:
- TypeScript errors → Run `npm run build` locally first
- Missing dependencies → Check `package.json`

---

## 📊 Current Data Status

As of 2025-10-18:

| Table | Count | Status |
|-------|-------|--------|
| councillors | 31 | ✅ Complete |
| meetings | 30 | ✅ Metadata only (full text TODO) |
| bills | 30 | ✅ Complete |
| speeches | 0 | 📋 Phase 2 |
| votes | 0 | 📋 Phase 2 |

---

## 🔄 Automated Scraping (TODO - Phase 1.5)

### Option 1: Vercel Cron Functions

Create `web/app/api/cron/scrape/route.ts`:

```typescript
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')

  // Verify cron secret
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  // Trigger scraping
  // TODO: Implement scraping logic

  return NextResponse.json({ success: true })
}
```

Add to `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/scrape",
    "schedule": "0 2 * * *"
  }]
}
```

### Option 2: GitHub Actions (Recommended)

See `SCRAPING_AUTOMATION.md` (to be created)

---

## 📝 Next Steps

### Phase 1.5 (Automation):
- [ ] Configure Vercel environment variables
- [ ] Set up automated scraping (GitHub Actions)
- [ ] Monitor daily scraping logs

### Phase 2 (Accountability Engine):
- [ ] Extract meeting transcript full text
- [ ] Integrate Claude API for speech summarization
- [ ] Build admin dashboard for vote verification

---

## 🔗 Useful Links

- **Vercel Dashboard:** https://vercel.com/yongparks-projects/web
- **Supabase Dashboard:** https://supabase.com/dashboard
- **GitHub Repository:** https://github.com/yonghwan1106/they_work_for_yongincitizen
- **PRD v2.0:** `/docs/prd v2.0.md`

---

**Last Updated:** 2025-10-18
**Deployment Status:** ✅ Production Ready (pending env vars)
