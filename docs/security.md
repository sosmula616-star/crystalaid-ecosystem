# Security & Anti-Cheat Architecture

## 1. Zero Client Trust Principle
> **"Never trust client-reported values. The client only reports intent and heartbeat presence. The backend computes and authorizes all state mutations."**

The frontend application never submits requests like `POST /xp { amount: 500 }`. Instead, the frontend initiates a verified session (`POST /activities/session/start`), receives a temporary cryptographically signed session token, and sends periodic keepalive heartbeats (`POST /activities/session/heartbeat`). The server calculates elapsed time, validates presence, applies guild multipliers, and awards XP.

---

## 2. Anti-Cheat Engine

### A. Heartbeat & Rate Validation
- **Session Duration Clamping**: Sessions cannot yield XP faster than the server-defined maximum rate (e.g., maximum 60 XP per minute during standard lounge activity).
- **Time Window Verification**: Heartbeats sent faster than the configured window (e.g., every 30 seconds) trigger a `RATE_LIMIT_WARNING` and are ignored. Repeated violations flag the user session.
- **Clock Drift Mitigation**: All timestamps are anchored to the server's authoritative clock (`Date.now()`). Client timestamps are discarded.

### B. Daily Reward & Cooldown Guards
- Daily reward claims execute inside a database atomic transaction.
- Server validates that at least 20 hours have elapsed since `lastDailyClaim` before permitting the next claim.
- Streak preservation logic allows up to 48 hours before streak resets to 1, preventing timezone penalty.

### C. Purchase & Transaction Integrity
- Coin deductions and inventory grants occur atomically (`prisma.$transaction`).
- Server verifies:
  1. Item exists and is currently in stock / available.
  2. User does not already own the item (duplicate prevention).
  3. User's current balance >= item price.
- Logs an immutable record in the `Transaction` table for auditing.

---

## 3. Secret Management & Token Security
- Discord Client Secret (`DISCORD_CLIENT_SECRET`) and Bot Token (`DISCORD_BOT_TOKEN`) are strictly confined to the backend environment (`.env`).
- Frontend builds only receive the public `DISCORD_CLIENT_ID` via `VITE_DISCORD_CLIENT_ID`.
- Sessions are secured via signed JWT tokens with short lifespans (24 hours) and explicit guild scoping.

---

## 4. Input Sanitization & Abuse Prevention
- Strict schema validation using Zod on all incoming REST request payloads.
- XSS prevention: React's built-in JSX escaping prevents script injection. No `dangerouslySetInnerHTML` is used.
- CORS configured to only permit requests from the verified Discord proxy domains (`*.discordsays.com`) and localhost in development.
