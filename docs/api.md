# Backend API & WebSocket Specification

## 1. Authentication & Security Headers
All protected API endpoints require:
```http
Authorization: Bearer <SESSION_JWT>
X-Guild-Id: <DISCORD_GUILD_ID>
```
Standard JSON responses follow a unified envelope:
```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "timestamp": 1740000000000
}
```
Errors return appropriate HTTP status codes (400, 401, 403, 404, 429, 500) with a typed error structure:
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many XP ticks submitted. Cooldown expires in 45 seconds.",
    "retryAfter": 45
  },
  "timestamp": 1740000000000
}
```

---

## 2. REST Endpoints

### Authentication
- `POST /api/auth/discord/token`
  - Body: `{ "code": "DISCORD_OAUTH_CODE", "guildId": "..." }`
  - Returns: `{ "token": "...", "user": { ... }, "guild": { ... }, "permissions": [...] }`
- `GET /api/auth/me`
  - Returns current verified session, user metadata, and active permissions.

### User & Profile
- `GET /api/users/:userId/profile?guildId=...`
  - Returns user level, XP, rank, equipped frame/badge, recent history.
- `PATCH /api/users/me/cosmetics`
  - Body: `{ "equippedFrameId": "frame_neon", "equippedBadgeId": "badge_veteran" }`
  - Equips unlocked cosmetics from user inventory.

### Activities & XP Engine
- `POST /api/activities/session/start`
  - Body: `{ "type": "VOICE_LOUNGE" | "CHALLENGE" | "FOCUS" }`
  - Creates an active session token with server timestamp.
- `POST /api/activities/session/heartbeat`
  - Body: `{ "sessionId": "...", "proof": "..." }`
  - Validates duration elapsed, checks against max tick limits, awards anti-cheat validated XP.
- `POST /api/activities/session/end`
  - Closes session and returns final XP, coins, and level-up milestones earned.

### Leaderboards
- `GET /api/leaderboard?guildId=...&period=daily|weekly|monthly|all_time&limit=50&page=1`
  - Returns paginated rankings, top 3 podium entries, and requesting user's relative position.

### Rewards & Streaks
- `GET /api/rewards/status?guildId=...`
  - Returns daily streak day (1-7), claim availability, countdown to next claim window.
- `POST /api/rewards/claim-daily`
  - Validates 24-hour window, increments streak, credits coins and XP, marks claimed.
- `POST /api/rewards/claim-milestone/:milestoneId`
  - Validates user level eligibility and awards one-time milestone prizes.

### Shop & Inventory
- `GET /api/shop/items?category=frames|badges|themes|effects`
  - Lists available items with pricing, rarity, and ownership status.
- `POST /api/shop/purchase/:itemId`
  - Atomically validates coin balance, deducts price, adds item to inventory.
- `GET /api/shop/inventory`
  - Lists all unlocked cosmetics owned by user.

### Events
- `GET /api/events/active?guildId=...`
  - Lists active community challenges, end timestamps, and guild-wide progress.

---

## 3. Real-Time WebSocket Events
- `client -> server`: `SUBSCRIBE_GUILD { guildId }`, `SESSION_PING { sessionId }`
- `server -> client`: `USER_XP_UPDATED`, `LEVEL_UP { newLevel, reward }`, `ONLINE_PARTICIPANTS { count, users }`, `GUILD_EVENT_PROGRESS { currentXp, targetXp }`
