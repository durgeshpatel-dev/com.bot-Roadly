# Roadly - Free Production Deployment Guide

This guide will walk you through deploying Roadly using completely **free** tiers of premium hosting providers. 

The architecture is split into three parts:
1. **Database:** MongoDB Atlas (M0 Free Tier)
2. **Backend (API):** Render (Free Web Service)
3. **Frontend (UI):** Vercel (Hobby Free Tier)

---

## Step 1: Push Your Code to GitHub
Before you begin, ensure your code is pushed to a repository on your GitHub account. Both Render and Vercel will pull your code directly from GitHub to build and deploy.

---

## Step 2: Database Setup (MongoDB Atlas)
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas) and sign up for a free account.
2. Click **Build a Database** and select the **M0 Free** cluster. Choose AWS as the provider and the region closest to you.
3. Once the cluster is created, go to **Database Access** (on the left menu) and click **Add New Database User**.
   - Set a Username and an Auto-Generated Password. Save this password somewhere safe!
4. Go to **Network Access** (on the left menu) and click **Add IP Address**.
   - Select **Allow Access From Anywhere** (`0.0.0.0/0`) and confirm.
5. Go back to **Database** and click **Connect**.
   - Select **Drivers** (Node.js).
   - Copy your connection string. It will look like: 
     `mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
   - Replace `<password>` with the password you saved in step 3. 

**Save this full string. You will need it in Step 3!**

---

## Step 3: Backend Deployment (Render)
1. Go to [Render](https://render.com/) and sign up using GitHub.
2. Click **New +** at the top right and select **Web Service**.
3. Select your Roadly GitHub repository.
4. Fill out the configuration exactly like this:
   - **Name:** roadly-api
   - **Language:** Node
   - **Root Directory:** `server`
   - **Build Command:** `npm install --include=dev && npm run build`
   - **Start Command:** `npm start`
5. Scroll down to **Environment Variables** and add the following:

| Key | Value |
| :--- | :--- |
| `NODE_ENV` | `production` |
| `MONGODB_URI` | *[Paste your MongoDB Connection String from Step 2]* |
| `JWT_SECRET` | *[Type any random 32+ character string]* |
| `JWT_REFRESH_SECRET` | *[Type a different 32+ character string]* |
| `COOKIE_SAME_SITE` | `none` |
| `TRUST_PROXY` | `1` |
| `CLIENT_URL` | *[Leave blank for now, we will come back to this!]* |

6. Click **Create Web Service**. 
7. Once it finishes deploying, copy the URL at the top left of the screen (e.g., `https://roadly-api-xyz.onrender.com`). **Save this URL.**

---

## Step 4: Frontend Deployment (Vercel)
1. Go to [Vercel](https://vercel.com/) and sign up using GitHub.
2. Click **Add New...** and select **Project**.
3. Import your Roadly repository.
4. Fill out the configuration exactly like this:
   - **Project Name:** roadly
   - **Framework Preset:** Vite
   - **Root Directory:** `client`
5. Open the **Environment Variables** section and add:
   - **Name:** `VITE_API_URL`
   - **Value:** *[Paste the Render URL from Step 3]* + `/api` (e.g., `https://roadly-api-xyz.onrender.com/api`)
6. Click **Deploy**.
7. Once it finishes, Vercel will give you a live URL for your frontend (e.g., `https://roadly.vercel.app`). **Copy this URL.**

---

## Step 5: Finalizing Backend CORS
For security, your backend will reject requests unless it knows the frontend URL.
1. Go back to your [Render Dashboard](https://dashboard.render.com/) and click your `roadly-api` Web Service.
2. Go to the **Environment** tab.
3. Edit the `CLIENT_URL` environment variable you left blank in Step 3.
   - **Value:** *[Paste your Vercel URL from Step 4]* (e.g., `https://roadly.vercel.app`).
   - *Ensure there is NO trailing slash (`/`) at the end of the URL!*
4. Click **Save Changes**. Render will automatically restart your backend.

---

🎉 **You are completely done!** 
Visit your Vercel URL. Roadly is now live, fully secure, and completely free!
