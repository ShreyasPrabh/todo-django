# 🚀 Deploying TaskFlow to Render (Free Tier)

This guide walks you through deploying both the **Django REST Backend** and the **React Frontend** to [Render.com](https://render.com/) with **Neon PostgreSQL** database.

---

## ⚡ Method 1: One-Click Blueprint Deploy (Recommended)

Because we added [`render.yaml`](file:///d:/todo_django/render.yaml), Render can automatically create and link both the backend and frontend in 1 click!

### Step 1: Commit and Push to GitHub
In your project directory terminal, push all your latest changes to GitHub:

```bash
git add .
git commit -m "Configure Render deployment"
git push origin main
```

### Step 2: Open Render Dashboard
1. Go to **[dashboard.render.com](https://dashboard.render.com/)** and sign in (using your GitHub account).
2. In the top right, click **New +** → **Blueprint**.
3. Select your repository: **`ShreyasPrabh/todo-django`**.
4. Render will scan `render.yaml` and display two services:
   - **`taskflow-backend`** (Web Service)
   - **`taskflow-frontend`** (Static Site)

### Step 3: Enter Environment Variables
When prompted for parameters:
- **`DATABASE_URL`**: Paste your Neon PostgreSQL connection string:
  ```
  postgresql://neondb_owner:npg_6TRh8lJceLxN@ep-jolly-cake-azb398bu-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
  ```
- Click **Apply**.

Render will automatically:
1. Run `build.sh` (installs Python dependencies, runs migrations against Neon, and collects static files).
2. Start the Gunicorn backend server.
3. Build the React frontend with Vite and link its `VITE_API_URL` to your backend service.
4. Provide you with a live URL (e.g. `https://taskflow-frontend.onrender.com`)!

---

## 🛠️ Method 2: Manual Service Creation (Alternative)

If you prefer to configure each service manually without Blueprints:

### Step 1: Create the Django Backend Web Service
1. On [dashboard.render.com](https://dashboard.render.com/), click **New +** → **Web Service**.
2. Connect your GitHub repository.
3. Configure the following fields:
   - **Name**: `taskflow-backend`
   - **Region**: `Singapore` (or closest to your users)
   - **Root Directory**: `todo_backend`
   - **Runtime**: `Python`
   - **Build Command**: `./build.sh`
   - **Start Command**: `gunicorn config.wsgi:application`
   - **Instance Type**: `Free`
4. In the **Environment Variables** section, add:
   - `DATABASE_URL`: *(your Neon DB connection string)*
   - `DJANGO_SECRET_KEY`: *(click Generate or enter a random string)*
   - `DEBUG`: `False`
   - `PYTHON_VERSION`: `3.13.2`
5. Click **Create Web Service**. Copy the backend URL (e.g., `https://taskflow-backend.onrender.com`).

---

### Step 2: Create the React Frontend Static Site
1. On [dashboard.render.com](https://dashboard.render.com/), click **New +** → **Static Site**.
2. Connect your GitHub repository.
3. Configure the following fields:
   - **Name**: `taskflow-frontend`
   - **Root Directory**: `todo-frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. In **Redirects / Rewrites**, add:
   - **Type**: `Rewrite`
   - **Source**: `/*`
   - **Destination**: `/index.html`
5. In **Environment Variables**, add:
   - `VITE_API_URL`: `https://taskflow-backend.onrender.com/api` *(replace with your actual backend URL from Step 1)*
6. Click **Create Static Site**.

---

## ✅ Post-Deployment Verification

1. Open your frontend URL: `https://taskflow-frontend.onrender.com`.
2. Test **Sign Up** / **Log In** with your credentials.
3. Create a task and a project to verify they persist to your **Neon PostgreSQL** database.

---

## 💡 Pro-Tips for Render Free Tier

- **Spin-down on inactivity**: Render free tier web services spin down after 15 minutes of inactivity. The first request after sleep may take ~30-50 seconds to wake up. This is normal on the free tier.
- **Auto Deployments**: Every time you run `git push origin main`, Render will automatically rebuild and deploy the latest changes!
