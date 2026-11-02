# Database Architecture & Data Models

## 1. Data Schema Design (Prisma)

The database models user engagement, guild partitions, economy, progression, achievements, and events with relational integrity.

```prisma
datasource db {
  provider = "sqlite" // Seamless zero-config local dev & test; easily swappable to postgresql
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id               String            @id @default(cuid())
  discordId        String            @unique
  username         String
  discriminator    String            @default("0")
  avatar           String?
  banner           String?
  equippedFrame    String?
  equippedBadge    String?
  coins            Int               @default(100)
  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt

  guildMembers     GuildMember[]
  activities       ActivitySession[]
  userAchievements UserAchievement[]
  inventory        InventoryItem[]
  transactions     Transaction[]
}

model Guild {
  id               String            @id @default(cuid())
  discordGuildId   String            @unique
  name             String
  icon             String?
  xpRateMultiplier Float             @default(1.0)
  settings         String            @default("{}") // JSON config
  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt

  members          GuildMember[]
  activities       ActivitySession[]
  events           GuildEvent[]
}

model GuildMember {
  id               String            @id @default(cuid())
  userId           String
  guildId          String
  role             String            @default("USER") // USER, MODERATOR, ADMIN, OWNER
  level            Int               @default(1)
  xp               Int               @default(0)
  currentStreak    Int               @default(0)
  lastDailyClaim   DateTime?
  joinedAt         DateTime          @default(now())
  updatedAt        DateTime          @updatedAt

  user             User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  guild            Guild             @relation(fields: [guildId], references: [id], onDelete: Cascade)

  @@unique([userId, guildId])
  @@index([guildId, xp(sort: Desc)])
  @@index([guildId, level(sort: Desc)])
}

model ActivitySession {
  id               String            @id @default(cuid())
  userId           String
  guildId          String
  type             String            // VOICE_LOUNGE, FOCUS, CHALLENGE
  status           String            // ACTIVE, COMPLETED, ABORTED
  startedAt        DateTime          @default(now())
  endedAt          DateTime?
  durationSeconds  Int               @default(0)
  xpEarned         Int               @default(0)
  coinsEarned      Int               @default(0)

  user             User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  guild            Guild             @relation(fields: [guildId], references: [id], onDelete: Cascade)

  @@index([userId, guildId])
  @@index([startedAt])
}

model Achievement {
  id               String            @id @default(cuid())
  code             String            @unique // e.g., FIRST_SESSION, STREAK_7, LEVEL_25
  name             String
  description      String
  category         String            // PROGRESSION, SOCIAL, ACTIVITY, SECRET
  rarity           String            // COMMON, RARE, EPIC, LEGENDARY
  icon             String
  xpReward         Int               @default(100)
  coinReward       Int               @default(50)
  maxProgress      Int               @default(1)

  userAchievements UserAchievement[]
}

model UserAchievement {
  id               String            @id @default(cuid())
  userId           String
  achievementId    String
  progress         Int               @default(0)
  isUnlocked       Boolean           @default(false)
  unlockedAt       DateTime?

  user             User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  achievement      Achievement       @relation(fields: [achievementId], references: [id], onDelete: Cascade)

  @@unique([userId, achievementId])
  @@index([userId])
}

model ShopItem {
  id               String            @id @default(cuid())
  code             String            @unique
  name             String
  description      String
  category         String            // FRAMES, BADGES, THEMES, EFFECTS
  rarity           String            // COMMON, RARE, EPIC, LEGENDARY
  price            Int
  previewUrl       String
  metadata         String            @default("{}") // Visual styling tokens
  isAvailable      Boolean           @default(true)

  inventoryItems   InventoryItem[]
}

model InventoryItem {
  id               String            @id @default(cuid())
  userId           String
  itemId           String
  acquiredAt       DateTime          @default(now())

  user             User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  item             ShopItem          @relation(fields: [itemId], references: [id], onDelete: Cascade)

  @@unique([userId, itemId])
  @@index([userId])
}

model Transaction {
  id               String            @id @default(cuid())
  userId           String
  type             String            // REWARD_CLAIM, SHOP_PURCHASE, EVENT_BONUS, ADMIN_GRANT
  amount           Int               // positive for credit, negative for debit
  description      String
  createdAt        DateTime          @default(now())

  user             User              @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, createdAt])
}

model GuildEvent {
  id               String            @id @default(cuid())
  guildId          String
  title            String
  description      String
  type             String            // XP_RACE, CHALLENGE, COMMUNITY_GOAL
  targetXp         Int               @default(50000)
  currentXp        Int               @default(0)
  startsAt         DateTime
  endsAt           DateTime
  rewardsJson      String            @default("[]")

  guild            Guild             @relation(fields: [guildId], references: [id], onDelete: Cascade)

  @@index([guildId, startsAt, endsAt])
}
```

---

## 2. Multi-Tenant Guild Isolation & Indexing
- Every member ranking query filters strictly by `guildId`.
- Compound index `@@index([guildId, xp(sort: Desc)])` guarantees instant sub-millisecond leaderboard retrieval even with tens of thousands of members.
- Foreign key constraints with cascading deletes ensure clean data cleanup if a user or guild is removed.
