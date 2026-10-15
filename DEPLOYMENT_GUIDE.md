# RAS Brother Tour & Travels - Production Deployment Guide 🚀

## 1. Architecture Overview
This application is designed as a production-ready, full-stack Node.js + Express + React (Vite) + MongoDB marketplace.
- **Frontend**: React 19 SPA built with Tailwind CSS, Lucide icons, and Canvas Confetti.
- **Backend**: Express REST API, JWT auth, Multer file upload storage, PDF invoicing, rate-limiting, and Helmet security headers.
- **Unified Static Serving**: In production, Express automatically serves the built frontend files (`client/dist`) and acts as a single unified service on one port.

---

## 2. One-Command Production Build & Run

From the project root:
```bash
# 1. Install dependencies for both backend and frontend
npm run install:all

# 2. Build the production React bundle
npm run build

# 3. Start the production backend server (serves API + Frontend together)
npm start
```
The application will be live at `http://localhost:5000` (or `PORT` from environment).

---

## 3. Environment Variables

### Backend (`server/.env`):
| Variable | Description | Example |
| :--- | :--- | :--- |
| `PORT` | Web server port | `5000` |
| `NODE_ENV` | Environment mode | `production` |
| `MONGODB_URI` | MongoDB Connection URI | `mongodb+srv://<user>:<pwd>@cluster.mongodb.net/rasbrother` |
| `JWT_SECRET` | Secret key for JWT auth tokens | `your_super_strong_random_secret_32_chars` |
| `JWT_EXPIRE` | Token expiry duration | `30d` |
| `UPI_ID` | Platform payment UPI address | `rasbrother@upi` |
| `UPI_PAYEE_NAME` | Display name for UPI payment | `RAS Brother Tour & Travels` |
| `CLIENT_URL` | Frontend domain for CORS | `https://yourdomain.com` |

---

## 4. Easy Deployment Options

### Option A: Render.com (Recommended Free/Low Cost)
1. Push code to GitHub.
2. In Render dashboard, click **New Web Service**.
3. Connect your GitHub repository.
4. Settings:
   - **Environment**: Node
   - **Build Command**: `npm run install:all && npm run build`
   - **Start Command**: `npm start`
5. Add Environment Variables (`MONGODB_URI`, `JWT_SECRET`, `NODE_ENV=production`).
6. Click **Deploy**. Render will build the React frontend and launch Express serving both frontend and API seamlessly.

### Option B: Railway.app
1. Create new project from GitHub repo.
2. Add a MongoDB database service.
3. In service settings, set:
   - **Build Command**: `npm run install:all && npm run build`
   - **Start Command**: `npm start`
4. Set environment variables (`MONGODB_URI` linked to Railway Mongo).

### Option C: Ubuntu VPS (DigitalOcean / AWS EC2 / Hostinger) with PM2 & Nginx
1. SSH into VPS and clone repository:
   ```bash
   git clone <repo_url> /var/www/ras-brother
   cd /var/www/ras-brother
   ```
2. Install Node.js (v18+) and PM2:
   ```bash
   npm install -g pm2
   npm run install:all
   npm run build
   ```
3. Start backend with PM2:
   ```bash
   pm2 start server/src/server.js --name "ras-brother"
   pm2 save
   pm2 startup
   ```
4. Configure Nginx reverse proxy to port `5000` and install SSL with Certbot:
   ```bash
   sudo certbot --nginx -d yourdomain.com
   ```

---

## 5. Admin & Default Credentials
- **Admin Console**: `admin@rasbrothertravels.com` / `admin123` (or `admin@rasbrother.com` / `123456`)
- **Fleet Owner**: `123@gmail.com` / `123456`
- **Customer**: `1234@gmail.com` / `123456`
