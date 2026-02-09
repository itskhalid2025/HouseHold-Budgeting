# 🚀 Ultimate Deployment Guide: Aiven + Render + Netlify

This guide uses the **Free Tier Trio** for 2026:
- **Database**: **Aiven** (Free PostgreSQL, 1GB Storage)
- **Backend**: **Render** (Free Node.js Web Service)
- **Frontend**: **Netlify** (Free Static Hosting)

---

## 🛑 Critical Pre-Flight Checks

1.  **Credit Card**: You *might* need one for Render identity verification (no charge). Aiven and Netlify do NOT need one.
2.  **Patience**: Render's free tier "sleeps" after 15 mins. The first request will take **30-60 seconds** to wake up. This is normal!

---

## 🛠️ Step 1: Set up Database (Aiven)

1.  **Sign Up**: Go to [Aiven.io](https://aiven.io/) (No card needed).
2.  **Create Service**:
    - Click **"Create service"**.
    - Select **PostgreSQL**.
    - Choose **Cloud**: DigitalOcean or AWS (doesn't matter much).
    - Choose **Plan**: Look for **"Free"** or "Hobbyist" (1 CPU, 1GB RAM).
    - Give it a name (e.g., `household-db`).
    - Click **Create**.
3.  **🔴 IMPORTANT: Configure Network Access**:
    - Go to your service **Overview** page.
    - Click on **"Network"** or "Allowed IP Adresses".
    - Click **"Allow traffic from everywhere"** (or add `0.0.0.0/0`).
    - *Why? Render's IP address changes constantly, so we must allow all connections.*
4.  **Get Connection URL**:
    - Copy the **Service URI**.
    - It looks like: `postgres://avnadmin:password@host:port/defaultdb?sslmode=require`
    - *Tip: If it starts with `postgres://`, keep it in mind. Prisma handles it, but some libraries prefer `postgresql://`.*

---

## ⚙️ Step 2: Set up Backend (Render)

1.  **Push Code**: Ensure your latest backend code is on GitHub.
2.  **Sign Up/Login**: Go to [Render.com](https://render.com/).
3.  **New Web Service**:
    - Click **"New +"** -> **"Web Service"**.
    - Connect your GitHub repository.
    - Select the **`backend`** folder as the Root Directory (if your repo has both frontend and backend).
4.  **Configuration**:
    - **Name**: `household-api`
    - **Runtime**: **Node**
    - **Build Command**: `npm install && npx prisma generate && npx prisma migrate deploy`
    - **Start Command**: `npm start`
    - **Instance Type**: **Free**
5.  **Environment Variables** (Scroll down):
    - Add these keys and values:
    | Key | Value |
    |-----|-------|
    | `DATABASE_URL` | Paste your **Aiven Service URI** here |
    | `JWT_SECRET` | `some-super-secret-long-string` |
    | `GEMINI_API_KEY` | Your Google Gemini API Key |
    | `OPIK_API_KEY` | Your Opik API Key |
    | `NODE_ENV` | `production` |
    | `FRONTEND_URL` | Your Netlify URL (e.g., `https://household-budget.netlify.app`) |
6.  **Deploy**:
    - Click **"Create Web Service"**.
    - Wait for it to build. Once live, copy your **Backend URL** (e.g., `https://household-api.onrender.com`).

---

## 🎨 Step 3: Set up Frontend (Netlify)

1.  **Push Code**: Ensure your frontend code is on GitHub.
2.  **Login**: Go to [Netlify.com](https://www.netlify.com/).
3.  **New Site**:
    - Click **"Add new site"** -> **"Import from Git"**.
    - Select **GitHub** and choose your repo.
4.  **Configuration**:
    - **Base directory**: `frontend`
    - **Build command**: `npm run build`
    - **Publish directory**: `dist`
5.  **Environment Variables**:
    - Click **"Add environment variable"**.
    - Key: `VITE_API_URL`
    - Value: `https://household-api.onrender.com/api` (Notice the **/api** at the end)
    - *Make sure to remove any trailing slash `/` after the word api.*
6.  **Deploy**:
    - Click **"Deploy"**.

---

## 🔗 Step 4: Database Migration

Since your Aiven database is empty, we need to create the tables.

**Local Method (Easiest)**:
1.  Open your local VS Code terminal (`backend` folder).
2.  Update your local `.env` temporarily:
    ```bash
    # Comment out your local DB
    # DATABASE_URL="postgresql://localhost..."
    
    # Paste your Aiven URL
    DATABASE_URL="postgres://avnadmin:password@host:port/defaultdb?sslmode=require"
    ```
3.  Run the migration command:
    ```bash
    npx prisma migrate deploy
    ```
4.  (Optional) Seed data if you have a seed script (be careful not to overwrite users if live).
5.  **Revert your local .env** back to localhost so you can keep developing locally!

---

## ✅ Flow Check

1.  User visits **Netlify URL**.
2.  Frontend makes fetch request to **Render URL**.
    - *Wait... (Spinning)*. Render wakes up (30-45s).
3.  Backend connects to **Aiven DB**.
4.  Data loads! Setup Complete. 🎉
