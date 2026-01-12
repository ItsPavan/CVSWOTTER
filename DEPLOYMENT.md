# Deployment Guide to toppile.evolviscend.com

This guide explains how to deploy the **TopPile** application to your custom domain.

## Prerequisites

1.  **Domain Control**: Access to DNS settings for `toppile.evolviscend.com`.
2.  **Hosting Provider**: A VPS (like DigitalOcean, AWS EC2, Linode) or a PaaS (like Railway, Render, Vercel).
3.  **Supabase**: Your existing Supabase project.

---

## Option 1: Docker (Single Server / VPS) -> Recommended for Full Control

This method runs both Frontend and Backend on a single server, configured via `docker-compose`.

1.  **Provision a Server** (Linux/Ubuntu).
2.  **Install Docker & Git** on the server.
3.  **Clone the Repo**:
    ```bash
    git clone https://github.com/ItsPavan/CVSWOTTER.git
    cd CVSWOTTER
    git checkout publish_clean
    ```
4.  **Configure Environment**:
    Create a `.env` file on the server with your *real* secrets:
    ```bash
    SUPABASE_URL=your_supabase_url
    SUPABASE_KEY=your_supabase_key
    GROQ_API_KEY=your_groq_api_key
    ```
5.  **Build and Run**:
    ```bash
    docker-compose up -d --build
    ```
6.  **DNS Setup**:
    - Point `toppile.evolviscend.com` (A Record) to your server's public IP.
    - (Optional) Use a reverse proxy like Nginx or Caddy on the server to handle HTTPS (Let's Encrypt).

---

## Option 2: Vercel (Frontend) + Railway/Render (Backend)

This separates the concerns. Vercel is excellent for React apps.

### Backend (Railway/Render)
1.  Connect your GitHub repo.
2.  Point the service to the `backend/` directory.
3.  Set Environment Variables (`SUPABASE_URL`, etc.).
4.  Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
5.  **Get the Backend URL** (e.g., `https://cvswotter-backend.up.railway.app`).

### Backend Domain Update
- **CRITICAL**: If you use a hosted backend URL different from `toppile.evolviscend.com`, verify you updated `backend/app/main.py` CORS settings to allow your frontend domain. (Currently configured to allow `https://toppile.evolviscend.com`).

### Frontend (Vercel)
1.  Connect GitHub repo.
2.  Point to `frontend/` directory.
3.  **Environment Variables**:
    - `VITE_API_URL`: `https://your-deployed-backend-url.com/api` (OR `https://toppile.evolviscend.com/api` if using Option 1 style setup).
4.  **Domains**:
    - Add `toppile.evolviscend.com` in Vercel project settings.
    - Update your DNS CNAME record as instructed by Vercel.

---

## Troubleshooting
- **CORS Errors**: Ensure `https://toppile.evolviscend.com` is in `backend/app/main.py` origins list (I have already added it).
- **API Connection**: Inspect Network tab. Ensure requests are going to `https://.../api/...`.
