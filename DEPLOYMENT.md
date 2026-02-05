# Deployment Guide: Free Hosting

This guide helps you deploy the Workspace Platform to free hosting services: **Render** (for Backend & Database) and **Vercel** (for Frontend).

## Prerequisites
1.  **GitHub Account**: You need to push this code to a GitHub repository.
2.  **Render Account**: Sign up at [render.com](https://render.com).
3.  **Vercel Account**: Sign up at [vercel.com](https://vercel.com).

---

## Part 1: Push Code to GitHub

1.  Initialize git if you haven't:
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    ```
2.  Create a new repository on GitHub.
3.  Link and push:
    ```bash
    git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
    git push -u origin master
    ```

---

## Part 2: Backend & Database (Render)

### 1. Create Database
1.  Go to Render Dashboard > **New** > **PostgreSQL**.
2.  Name: `workspace-db`.
3.  Region: Choose usually the closest to you (e.g., Singapore, Frankfurt, Oregon).
4.  Plan: **Free**.
5.  Click **Create Database**.
6.  **Copy the "Internal Database URL"** (for later use if deploying backend on Render) AND the **"External Database URL"** (to connect from your local machine if needed).

### 2. Deploy Backend
1.  Go to Render Dashboard > **New** > **Web Service**.
2.  Connect your GitHub repository.
3.  **Configure Settings**:
    *   **Name**: `workspace-backend`
    *   **Root Directory**: `backend`
    *   **Environment**: `Python 3`
    *   **Build Command**: `pip install -r requirements.txt`
    *   **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port 10000`
    *   **Plan**: **Free**.
4.  **Environment Variables** (Advanced):
    Add the following:
    *   `DATABASE_URL`: Paste the **Internal Database URL** from the database step.
    *   `SECRET_KEY`: Generate a random string (e.g., `supersecretkey123`).
    *   `PYTHON_VERSION`: `3.10.12` (Recommended to avoid 3.14 issues).
5.  Click **Create Web Service**.
6.  Wait for deployment. Once live, validat it by visiting `https://YOUR-APP-NAME.onrender.com/health`.
7.  **Copy your Backend URL** (e.g., `https://workspace-backend.onrender.com`).

---

## Part 3: Frontend (Vercel)

1.  Go to Vercel Dashboard > **Add New...** > **Project**.
2.  Import your GitHub repository.
3.  **Configure Project**:
    *   **Framework Preset**: Next.js (Should auto-detect).
    *   **Root Directory**: Edit and select `frontend`.
4.  **Environment Variables**:
    *   `NEXT_PUBLIC_API_URL`: Paste your **Render Backend URL** (e.g., `https://workspace-backend.onrender.com`).
        *   *Note: Do NOT add a trailing slash `/`.*
5.  Click **Deploy**.

---

## Part 4: Final Configuration

1.  **CORS Update (Backend)**:
    Once your frontend is deployed, you'll get a URL (e.g., `https://workspace-frontend.vercel.app`).
    *   Go back to Render > Backend Service > Environment Variables.
    *   Add `FRONTEND_URL` = `https://workspace-frontend.vercel.app` (if you added CORS logic for strictness, otherwise the current `*` allow_origins in `main.py` works for all).
    *   *Note: Your current backend allows all origins (`["*"]`), so it will work immediately.*

2.  **Test**:
    *   Open your Vercel URL.
    *   Try to Register/Login.
    *   Enjoy!
