# Discord Integration & Activity Specification

## 1. Discord Embedded App SDK Flow

When a user clicks **"Launch Activity"** in a Discord Voice or Text channel:
1. Discord initializes an iframe embedding our Activity URL (`https://your-domain.com` or local tunnel).
2. The Frontend instantiates `DiscordSDK(DISCORD_CLIENT_ID)`.
3. Calls `await discordSdk.ready()`.
4. Executes `discordSdk.commands.authorize({ client_id, response_type: 'code', ... })`.
5. Passes the one-time `code` to the backend `/api/auth/discord/token` endpoint.
6. The backend exchanges the code with Discord API (`https://discord.com/api/oauth2/token`) using the secret `DISCORD_CLIENT_SECRET`.
7. Backend signs a local JWT session token and returns the authenticated user profile, roles, and guild context.
8. Activity initiates real-time WebSocket connection using the session token.

### Standalone / Local Dev Simulation Mode
To allow rapid development, visual QA, and headless testing without requiring a live Discord Voice Channel session every second:
- The Activity features a seamless **Discord SDK Mock Provider**.
- When `VITE_MOCK_DISCORD=true` or running outside an iframe, it automatically provides authentic mock Discord credentials, guild context, avatar assets, and simulated participant updates.
- Switching to live Discord requires only setting valid environment credentials.

---

## 2. Discord Bot Slash Commands

Built using `discord.js` v14 with full REST registration:

| Command | Arguments | Description | Response Type |
|---|---|---|---|
| `/activity` | *(optional)* `session_type` | Opens the Lounge 11 Activity in the current channel | Embed with "Launch Activity" button |
| `/profile` | *(optional)* `user` | Displays user level, streak, XP progress, and badges | Rich visual Embed with thumbnail & stats |
| `/leaderboard` | *(optional)* `filter` (daily/weekly/all-time) | Displays top 10 guild members by XP | Formatted Embed with podium indicators |
| `/rewards` | none | Shows daily claim availability and streak status | Embed with interactive "Claim Daily" button |
| `/daily` | none | Instantly claims the daily check-in bonus | Success embed with updated streak & reward |
| `/stats` | none | Guild-wide community statistics (total XP, active hours) | Metric cards formatted in Discord Embed |
| `/settings` | *(admin only)* `key, value` | Configures XP rates, notification channel, and roles | Ephemeral admin confirmation |
| `/help` | none | Interactive guide to Lounge 11 commands and activity | Help menu embed with category selects |

---

## 3. Discord Embed Styling & Visual Cohesion
Embeds are designed to match the Activity's dark cyberpunk visual language:
- **Primary Color**: `#5865F2` (Discord Blurple) or `#6366F1` (Indigo).
- **Streak Color**: `#F97316` (Flame Orange).
- **Milestone / Trophy**: `#FBBF24` (Gold).
- **Standardized Footer**: `Lounge 11 Ecosystem • Powered by Discord Embedded App SDK`.
- **Action Rows**: Discord buttons styled with primary/secondary styles linking directly to activity launch URLs or triggering instant claims.
