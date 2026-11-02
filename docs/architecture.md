# System Architecture & Technical Specification

## 1. High-Level Architecture

The product is architected as a modular monorepo cleanly decoupling Frontend (Discord Activity), Backend API & WebSocket Server, Discord Bot, and Shared Packages.

```
                           +---------------------------+
                           |       Discord Client      |
                           |   (Desktop, Mobile, Web)  |
                           +-------------+-------------+
                                         |
                       +-----------------+-----------------+
                       |                                   |
                       v                                   v
             +-------------------+               +-------------------+
             |    Discord Bot    |               |  Discord Activity |
             | (Slash Commands,  |               |  (React 19, Vite, |
             | Embeds, Buttons)  |               |  Design System)   |
             +---------+---------+               +---------+---------+
                       |                                   |
                       | HTTPS / Events                    | HTTPS / WSS
                       v                                   v
             +-------------------------------------------------------+
             |                     Backend API                       |
             |       (Node.js / Express / Fastify / WebSocket)       |
             |  - Discord OAuth2 Token Exchange & Verification       |
             |  - Business Logic & Anti-Cheat XP Engines             |
             |  - Real-time Gateway (Sessions, Online Hub)           |
             |  - Role-based Access Control (RBAC)                   |
             +---------------------------+---------------------------+
                                         |
                                         v
             +-------------------------------------------------------+
             |                   Database Layer                      |
             |         (Prisma ORM / SQLite / PostgreSQL)            |
             |  - Guilds, Users, GuildMembers, Activities            |
             |  - Levels, Achievements, Rewards, Economy, Events     |
             +-------------------------------------------------------+
```

---

## 2. Monorepo Structure

```text
/
├── apps/
│   ├── activity/                # Discord Activity Frontend (React 19 + TypeScript + Vite)
│   │   ├── src/
│   │   │   ├── components/      # Design System Components (Button, Card, Modal, etc.)
│   │   │   ├── pages/           # 9 Core Pages (Home, Activity, Profile, Leaderboard, etc.)
│   │   │   ├── hooks/           # useDiscordAuth, useActivitySession, useEconomy, etc.
│   │   │   ├── context/         # AuthContext, ThemeContext, SoundContext
│   │   │   ├── styles/          # Design Tokens, Animations, Fluid Layouts
│   │   │   ├── App.tsx          # App Shell & Navigation Routing
│   │   │   └── main.tsx         # Root Mount & Error Boundary
│   │   └── vite.config.ts
│   │
│   ├── api/                     # Backend API & Real-time Server (Node.js + TS)
│   │   ├── src/
│   │   │   ├── routes/          # Auth, Users, Activities, Rewards, Shop, Leaderboards
│   │   │   ├── controllers/     # Route Handlers
│   │   │   ├── services/        # Business Logic (XPService, RewardService, etc.)
│   │   │   ├── middleware/      # AuthGuard, RateLimiter, AntiCheat, ErrorHandler
│   │   │   ├── realtime/        # WebSocket Gateway & Session Sync
│   │   │   └── server.ts        # Server Entrypoint
│   │   └── tsconfig.json
│   │
│   └── bot/                     # Discord Bot Application (Discord.js v14)
│       ├── src/
│       │   ├── commands/        # /activity, /profile, /leaderboard, /rewards, etc.
│       │   ├── events/          # ready, interactionCreate, voiceStateUpdate
│       │   ├── embeds/          # Premium Styled Embed Creators
│       │   └── index.ts         # Bot Client Launcher
│       └── tsconfig.json
│
├── packages/
│   ├── types/                   # Shared TypeScript Interfaces & DTOs
│   ├── database/                # Prisma Schema, Migrations, Client Instance & Seeders
│   └── config/                  # Shared Constants, Level Formula, XP Curves
│
├── docs/                        # Complete Engineering & Design Documentation
├── package.json                 # Monorepo Workspaces Configuration
└── .env.example                 # Environment Variable Template
```

---

## 3. Communication Protocols
1. **Activity <-> Discord Client**: Discord Embedded App SDK (`@discord/embedded-app-sdk`). Provides channel ID, guild ID, instance ID, frame sizing, and OAuth2 authorization code.
2. **Activity <-> Backend API**: Secure REST endpoints using Bearer JWT authentication. All requests are typed and validated.
3. **Activity <-> Backend Real-time**: WebSocket connection for live session ticker, participant counts, level-up broadcasts, and global server challenge progress.
4. **Discord Bot <-> Backend API**: Shared database access & internal service invocation for instantaneous slash command answers.
