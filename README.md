# CrystalAid — Discord Bot + Discord Activity + Real-time Gamification Ecosystem

<p align="center">
  <img src="assets/crystalaid-logo.png" alt="CrystalAid Logo" width="180" />
</p>

> **CrystalAid** is an all-in-one, Discord-native digital product ecosystem combining a **Discord Bot**, **Discord Activity (Mini App)**, **Real-Time WebSocket Backend**, **PostgreSQL Database**, and a **Crystalline Cyberpunk UI/UX Design System**.

---

## 🚀 Key Features

- **Discord Embedded App SDK Native**: Runs directly inside Discord voice channels and text chats on Desktop, Web, and Mobile.
- **Synchronized Discord Bot**: Rich slash commands (`/activity`, `/profile`, `/leaderboard`, `/rewards`, `/daily`, `/stats`, `/settings`, `/help`) with action embeds.
- **Full Progression & Gamification**: Leveling engine, daily streak rewards, rare achievements, time-limited server events.
- **In-App Economy & Cosmetics Shop**: Earn Lounge Coins, purchase profile frames, badges, and titles with real-time avatar preview.
- **Anti-Cheat Engine**: Server-authoritative XP calculation, rate limiting, and zero client trust.
- **Fluid Responsive Architecture**: Designed from 320px mobile screens up to 3440px ultrawide displays with zero horizontal overflow.
- **Standalone Simulation Mode**: Instant testing in any web browser without needing a Discord voice channel setup.

---

## 📂 Repository Structure

```
├── apps/
│   ├── activity/        # React 19 + TypeScript + Vite + Vanilla CSS Design System
│   ├── api/             # Node.js + Express / Fastify + WebSocket Server
│   └── bot/             # Discord.js v14 Bot
├── packages/
│   ├── database/        # Prisma Schema, Migrations & Seeders
│   ├── types/           # Shared TypeScript interfaces & DTOs
│   └── config/          # XP curves, Level thresholds & Constants
└── docs/                # Architecture, UX, UI, API, Responsive & Security Specifications
```

---

## 📚 Documentation Index
- 📐 [Product Architecture](docs/product.md)
- 🎨 [UX Design & Interaction Model](docs/ux.md)
- ✨ [UI Design System & Tokens](docs/ui.md)
- 🏗️ [System Architecture](docs/architecture.md)
- 🤖 [Discord Integration](docs/discord.md)
- 🔌 [Backend API & WebSocket Contracts](docs/api.md)
- 🗄️ [Database Models](docs/database.md)
- 📱 [Responsive & Viewport Strategy](docs/responsive.md)
- 🛡️ [Security & Anti-Cheat Engine](docs/security.md)
- 🚢 [Deployment & Operations](docs/deployment.md)
- 🧪 [Testing & QA Strategy](docs/testing.md)
- 📋 [Implementation Plan](docs/implementation-plan.md)

---

## 🛠️ Quick Start

```bash
# Install all dependencies across monorepo
npm install

# Setup database & seeds
npm run db:setup

# Run dev environment (Activity + API + Bot concurrently)
npm run dev
```
