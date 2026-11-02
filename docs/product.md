# Product Architecture & Vision

## 1. Product Vision
**Lounge 11** is an all-in-one Discord-native gaming, social progression, and engagement ecosystem. It transforms any Discord community into a gamified virtual lounge where members earn XP, level up, unlock cosmetics, complete live activities and challenges, compete on leaderboards, and redeem rewards through a synchronized **Discord Bot** and **Discord Activity (Embedded App)**.

### Target Personas & User Roles
1. **Community Member (Standard User)**: Participates in voice/chat activities, tracks personal streak and XP, equips profile frames/badges, claims daily/weekly rewards, shops for cosmetics.
2. **Competitive Gamer (Power User)**: Climbs daily/weekly/monthly/all-time leaderboards, hunts rare and legendary achievements, optimizes XP farming sessions, attends scheduled guild events.
3. **Moderator (Staff)**: Monitors user activity logs, verifies suspicious XP spikes, manages active voice lounge sessions.
4. **Guild Admin / Server Owner**: Configures guild XP rates, manages custom rewards & shop catalog, schedules server-wide events, sets up Discord bot channels.
5. **System Super-Admin**: Global oversight, anti-cheat calibration, platform health, cross-guild analytics.

---

## 2. Core Features & System Modules

### A. App Shell & Discord Presence
- **Dynamic Header**: Guild badge, server switch/selector, breadcrumb trail, live connection status (WebSocket indicator), quick currency counter, notification bell, user mini-profile pill.
- **Adaptive Navigation**: Desktop collapsible primary sidebar, tablet compact icon-rail, mobile swipeable drawer + sticky bottom navigation bar.
- **Contextual Secondary Panel**: Activity participant list, live event timer, filter drawer.

### B. The 9 Core Activity Sections
1. **Home (Dashboard)**: Welcome hero with user avatar and dynamic greeting, level progress bar with exact XP to next rank, streak flame counter, quick launch active session, recent milestone feed, server snapshot statistics.
2. **Activity (Live Session Hub)**: Interactive voice/chat activity tracker, active focus/lounge session timer, online room participants with Discord avatars, XP generation rate display, active mini-game / challenge prompt, session summary modal.
3. **Profile**: Premium banner with customizable frame, avatar badge showcase, tier rank insignia, level & XP progression breakdown, detailed statistics (hours logged, activities completed, win streaks), equipped cosmetics preview, activity history timeline.
4. **Leaderboard**: Podium display for Top 3 (Gold, Silver, Bronze glow accents), granular filtering (Daily, Weekly, Monthly, All-Time), search and "Jump to My Rank" feature, responsive table/card hybrid format.
5. **Rewards**: Daily check-in streak calendar (7-day cycling rewards), weekly quest rewards, level milestone track (unlockable every 5 levels), claim animation states with sound/particle cues, locked/claimable/claimed visual badges.
6. **Achievements**: Categorized badge system (Activity, Social, Progression, Secret), rarity tiers (Common, Rare, Epic, Legendary), progress bars per achievement, claimable XP and coin bonuses.
7. **Shop & Economy**: Virtual currency ("Lounge Coins"), item catalog (Profile Frames, Badges, Chat Titles, Custom Themes, Profile Effects), item preview modal with real-time avatar simulator, purchase confirmation flow with duplicate prevention.
8. **Events**: Time-limited community challenges (e.g., Weekend XP Boost, Guild Boss Event, Trivia Marathon), countdown timers (days, hours, minutes, seconds), guild collective progress bar, personal contribution tiers.
9. **Settings**: Multi-category preferences (General, Appearance/Themes, Density, Notifications, Privacy, Connected Accounts, Advanced Developer/Debug Tools).

---

## 3. User Flows

### Flow 1: Launch Activity & Authenticate
```
Discord Channel / Voice
  -> Click Bot Button or Activity Shelf
  -> Launch Discord Embedded App
  -> SDK handshake (Discord Client ID)
  -> Exchange OAuth2 code with Backend API
  -> Issue secure HTTP-only Session JWT / Token
  -> Fetch User Guild Profile & Sync State
  -> Render App Shell (Home View)
```

### Flow 2: Live Activity Session & XP Accrual
```
User navigates to Activity Hub
  -> Starts or Joins Active Lounge Session
  -> WebSocket / Heartbeat established with Backend
  -> Backend validates duration, focus state, rate limits
  -> Periodic XP / Coin ticks awarded with server-side validation
  -> Level-Up threshold detected
  -> Real-time toast celebration & audio-visual cue in UI
```

### Flow 3: Reward Claim & Inventory Update
```
User views Rewards page
  -> Clicks "Claim Daily Reward"
  -> Backend verifies streak timestamp (24h cooldown with 48h streak preservation)
  -> Atomic DB transaction: User Streak + 1, Coins + X, Inventory item added
  -> Frontend receives updated user balance & toggles claimed state instantly
```

---

## 4. Multi-Guild Isolation & Permissions
- All user progress, leaderboards, and XP are partitioned by `guild_id`.
- Global profile displays cross-server achievements while preserving per-guild ranking integrity.
- Role-based Access Control (RBAC): `USER`, `MODERATOR`, `ADMIN`, `OWNER`. Backend verifies Discord permissions bitwise before allowing administrative operations.

---

## 5. Future Scalability Roadmap
- **Phase 2 Expansion**: Cross-server Guild Tournaments, Discord Voice Mini-Games (Trivia, Wordle, Soundboard Quiz), Custom sound effects pack in Shop.
- **Phase 3 Expansion**: Web3 / Digital Collectibles optional bridge, Custom Guild Shop item creation for server owners with Stripe / Discord Monetization integration.
