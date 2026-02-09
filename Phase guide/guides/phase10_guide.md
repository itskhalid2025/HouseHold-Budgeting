# Phase 10: Deployment & Hosting

> **Duration**: Days 24-25  
> **Prerequisites**: All previous phases completed and tested  
> **Goal**: Deploy the application to production with free hosting tiers  
> **Status**: ❌ **NOT STARTED** (0%)

---

## 📋 websitelook.md Alignment

This phase deploys all **26 pages** to production.

### Deployment Architecture:
| Component | Hosting | Pages Served |
|-----------|---------|--------------|
| User Frontend | Vercel | 18 pages (1.1-9) |
| Admin Frontend | Vercel | 8 pages (A.1-A.8) |
| Backend API | Railway | All API endpoints |
| Database | Railway/Supabase | 16 tables |

### Production URLs:
| Environment | URL Pattern |
|-------------|-------------|
| User App | `https://household-budget.vercel.app` |
| Admin Panel | `https://household-budget-admin.vercel.app` |
| Backend API | `https://household-budget-api.railway.app` |

### Pre-Deployment Checklist (from websitelook.md):
- [ ] All 18 user pages functional
- [ ] All 8 admin pages functional
- [ ] All 16 database tables migrated
- [ ] Mobile responsive verified
- [ ] Dark mode rendering correctly
- [ ] AI features working with Gemini API

---

## Phase Overview

By the end of this phase, you will have:
- Frontend deployed to Vercel (free tier)
- Backend deployed to Railway/Render (free tier)
- PostgreSQL database hosted
- Environment variables configured
- Custom domain (optional)
- Production monitoring

---

## Task Checklist

### 1. Prepare for Deployment

#### 1.1 Environment Configuration
- [ ] Create `.env.production` file
- [ ] Set production API URLs
- [ ] Secure all secrets
- [ ] Enable CORS for production domain

**Production Environment Variables:**
```env
# Backend (.env.production)
NODE_ENV=production
PORT=3001

# Database (use hosting provider's connection string)
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"

# Authentication
JWT_SECRET=very-long-random-string-for-production-min-32-chars
JWT_EXPIRES_IN=7d

# Gemini API
GEMINI_API_KEY=your-gemini-api-key

# Opik
OPIK_API_KEY=your-opik-api-key
OPIK_PROJECT_NAME=household-budget-prod

# Frontend URL (for CORS)
FRONTEND_URL=https://your-app.vercel.app
```

---

#### 1.2 Build Optimization
- [ ] Run production build for frontend
- [ ] Minify and optimize assets
- [ ] Test production build locally

**Build Commands:**
```bash
# Frontend production build
cd frontend
npm run build
npm run preview  # Test locally

# Backend production check
cd backend
npm run build    # If using TypeScript
npm start        # Test production mode
```

---

### 2. Frontend Deployment (Vercel)

#### 2.1 Deploy to Vercel
- [ ] Create Vercel account (free)
- [ ] Connect GitHub repository
- [ ] Configure build settings
- [ ] Set environment variables
- [ ] Deploy

**Vercel Configuration:**
```json
// vercel.json (in frontend folder)
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "vite"
}
```

**LLM Prompt for Vercel Setup:**
```
Create deployment configuration for Vercel frontend hosting:

1. vercel.json configuration for Vite React app
2. Environment variables needed:
   - VITE_API_URL: Backend API URL
   - VITE_APP_NAME: HouseHold Budgeting
3. Build settings for Vite
4. Redirect rules for React Router (SPA)

Include _redirects or rewrites for client-side routing.
```

**Testing (Manual):**
| Test | How to Verify | Expected Result |
|------|---------------|-----------------|
| Build succeeds | Check Vercel dashboard | ✅ Deployed |
| Routes work | Visit /dashboard | App loads correctly |
| API calls work | Login with test account | No CORS errors |

**Step-by-Step Guide:**
1. Go to https://vercel.com
2. Click "Add New Project"
3. Import your GitHub repo
4. Select `frontend` folder as root directory
5. Set Framework Preset: Vite
6. Add environment variables:
   - `VITE_API_URL` = your backend URL
7. Click Deploy

---

### 3. Backend Deployment (Railway)

#### 3.1 Deploy to Railway
- [ ] Create Railway account (free tier: 500 hours/month)
- [ ] Create new project
- [ ] Add PostgreSQL database
- [ ] Connect GitHub repository
- [ ] Configure environment variables
- [ ] Deploy

**Railway Configuration:**

**LLM Prompt for Railway Setup:**
```
Create deployment configuration for Railway backend hosting:

1. Procfile for Node.js/Express app
2. railway.json configuration
3. Health check endpoint setup
4. Database connection string format for Railway PostgreSQL
5. Environment variable list
```

**Procfile (in backend folder):**
```
web: npm start
```

**railway.json:**
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "healthcheckPath": "/api/health",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**Testing (Manual):**
| Test | How to Verify | Expected Result |
|------|---------------|-----------------|
| Health check | GET /api/health | `{"status":"ok"}` |
| DB connected | Check Railway logs | "Connected to database" |
| Auth works | POST /api/auth/login | Token returned |

**Step-by-Step Guide:**
1. Go to https://railway.app
2. "Start a New Project"
3. "Deploy from GitHub repo"
4. Select repository, choose `backend` folder
5. Add PostgreSQL database (click "New" → "Database" → "PostgreSQL")
6. Copy DATABASE_URL from PostgreSQL service
7. Add environment variables
8. Wait for deployment

---

### 4. Alternative: Render Deployment

#### 4.1 Deploy to Render (Alternative)
- [ ] Create Render account
- [ ] Create Web Service for backend
- [ ] Create PostgreSQL database
- [ ] Connect services
- [ ] Deploy

**render.yaml (Blueprint):**
```yaml
services:
  - type: web
    name: household-budget-api
    env: node
    region: oregon
    plan: free
    buildCommand: npm install
    startCommand: npm start
    healthCheckPath: /api/health
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: household-budget-db
          property: connectionString
      - key: JWT_SECRET
        generateValue: true
      - key: GEMINI_API_KEY
        sync: false
      - key: OPIK_API_KEY
        sync: false

databases:
  - name: household-budget-db
    plan: free
    region: oregon
```

**Note about Render Free Tier:**
- Spins down after 15 minutes of inactivity
- First request takes ~30 seconds to wake up
- Good for demos, not 24/7 usage

---

### 5. Database Hosting

#### 5.1 PostgreSQL Options

| Provider | Free Tier | Notes |
|----------|-----------|-------|
| **Railway** | Included with project | Best for hackathon |
| **Render** | 90 days free | Then paid |
| **Supabase** | 500MB | PostgreSQL + extras |
| **Neon** | 500MB | Serverless Postgres |
| **ElephantSQL** | 20MB | Tiny but free forever |

**Database Migration for Production:**
```bash
# Set production DATABASE_URL
export DATABASE_URL="your-production-url"

# Run migrations
npx prisma migrate deploy

# Verify tables created
npx prisma studio
```

---

### 6. Domain & SSL (Optional)

#### 6.1 Custom Domain Setup
- [ ] Purchase domain (optional)
- [ ] Configure DNS
- [ ] Enable SSL (automatic on Vercel/Railway)

**Free Subdomains:**
- Vercel: `your-app.vercel.app`
- Railway: `your-app.up.railway.app`
- Render: `your-app.onrender.com`

---

### 7. Monitoring & Logging

#### 7.1 Production Monitoring
- [ ] Enable Opik for production traces
- [ ] Set up error alerts
- [ ] Monitor response times

**Error Monitoring (Free Options):**
- **Opik**: LLM-specific tracing (already set up)
- **Railway Logs**: Built-in log viewer
- **Sentry**: Free tier for error tracking

---

## Testing Checklist

### Production Verification

```bash
# Test 1: Check frontend is live
curl https://your-app.vercel.app

# Test 2: Check backend health
curl https://your-api.up.railway.app/api/health

# Test 3: Test full flow
# - Register new user
# - Create household
# - Add transaction
# - View dashboard
```

### Deployment Verification

| Test | Expected Result | Status |
|------|-----------------|--------|
| Frontend loads | App displays | - [ ] Pass |
| Backend responds | Health check OK | - [ ] Pass |
| Database connected | Auth works | - [ ] Pass |
| Gemini API works | Categorization works | - [ ] Pass |
| Opik traces | Traces in dashboard | - [ ] Pass |
| CORS configured | No CORS errors | - [ ] Pass |

---

## Hosting Cost Summary

| Service | Free Tier Limits | Cost if Exceeded |
|---------|------------------|------------------|
| **Vercel** | 100GB bandwidth, unlimited deploys | $20/month |
| **Railway** | $5 free credit, 500 hours | Pay as you go |
| **Render** | 750 hours, spins down | $7/month |
| **Supabase** | 500MB, 50K rows | $25/month |
| **Gemini API** | 1,500 RPD | N/A (no paid tier yet) |
| **Opik** | Generous free tier | Contact for pricing |

**For Hackathon Demo**: All free tiers are sufficient! 🎉

---

## Completion Criteria

Phase 10 is complete when:

- [ ] Frontend deployed and accessible
- [ ] Backend deployed and responding
- [ ] Database connected and migrated
- [ ] All API endpoints working
- [ ] Gemini AI functioning
- [ ] Opik traces appearing
- [ ] No CORS errors
- [ ] Demo-ready URL shared

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| CORS errors | Add production frontend URL to CORS config |
| DB connection failed | Check DATABASE_URL includes `?sslmode=require` |
| Build fails | Check Node version (18+), review logs |
| Slow first request | Render free tier wakes up in ~30s |
| API key errors | Verify env vars are set in hosting dashboard |

---

## 🎉 Deployment Complete!

Your HouseHold Budgeting app is now live! Share these URLs:

- **Frontend**: `https://householdbudgeting.vercel.app`
- **Backend API**: `https://householdbudgeting-api.up.railway.app`
- **Opik Dashboard**: `https://www.comet.com/your-username/household-budget`

**For the Hackathon Demo:**
1. Have URLs ready to share
2. Test right before demo
3. Open Opik dashboard in separate tab
4. Have backup video recording just in case
