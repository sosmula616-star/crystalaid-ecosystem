# Deployment & Operations Guide

## 1. Local Development Setup

### Prerequisites
- Node.js >= 20 (Node v26 verified)
- npm >= 10
- Git

### Quick Start
```bash
# 1. Clone repository & install dependencies
git clone <repo-url>
cd "launge 11"
npm install

# 2. Configure environment
cp .env.example .env

# 3. Generate Prisma client & seed database
npm run db:setup

# 4. Start concurrent development servers (Activity + API + Bot)
npm run dev
```

---

## 2. Discord Developer Portal Configuration

To run inside an actual Discord voice or text channel:
1. Navigate to [Discord Developer Portal](https://discord.com/developers/applications).
2. Create an Application named **Lounge 11**.
3. Under **Bot**, enable `MESSAGE CONTENT INTENT` and `GUILD MEMBERS INTENT`. Copy the Bot Token into `DISCORD_BOT_TOKEN`.
4. Under **OAuth2**, set Redirects to your tunnel / domain (e.g., `https://your-tunnel.loca.lt/auth/callback`).
5. Under **Activities / Embedded App**, set URL Mapping:
   - Prefix: `/` -> Target URL: your tunnel or production domain (e.g., `https://your-tunnel.loca.lt`).
6. Copy `CLIENT ID` and `CLIENT SECRET` into `.env`.

---

## 3. Production Deployment Topology

### Docker Containerization
Both the API backend and Vite static build can run inside a lightweight Alpine container or separate serverless edge containers:
- **Activity (Frontend)**: Built with `npm run build` and served via NGINX or static CDN (Vercel, Cloudflare Pages).
- **Backend API & WebSocket**: Node.js container on Fly.io, Railway, or AWS ECS with sticky sessions for WebSocket connections.
- **Discord Bot**: Standalone worker process running on Railway or VPS.
- **Database**: SQLite for single-instance or PostgreSQL / Supabase for clustered multi-region deployments.

---

## 4. Health Checks & Monitoring
- API Health Endpoint: `GET /health` returns `{ "status": "ok", "uptime": 12450, "database": "connected" }`.
- WebSocket Heartbeat: Automatic ping-pong every 30 seconds with client auto-reconnect.
