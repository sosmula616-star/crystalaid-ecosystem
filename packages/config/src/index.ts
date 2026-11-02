import type { AchievementItem, ShopCatalogItem, GuildCommunityEvent } from '@crystalaid/types';

export const APP_CONFIG = {
  name: 'CrystalAid',
  tagline: 'Discord-Native Gamification & Virtual Lounge Ecosystem',
  currencyName: 'Crystals',
  currencySymbol: '💎',
  streakMaxGracePeriodHours: 48,
  dailyClaimCooldownHours: 20,
  maxSessionDurationMinutes: 360, // 6 hours
  antiCheat: {
    maxHeartbeatWindowSeconds: 60,
    minHeartbeatIntervalSeconds: 15,
    maxAllowedXpPerMinute: 120,
    rateLimitRequestsPerMinute: 60,
  },
  xpRates: {
    VOICE_LOUNGE: 30, // XP per minute
    FOCUS: 45,        // XP per minute
    CHALLENGE: 60,    // XP per minute
  },
  coinsRates: {
    VOICE_LOUNGE: 5,  // Coins per minute
    FOCUS: 8,         // Coins per minute
    CHALLENGE: 12,    // Coins per minute
  }
};

/**
 * Calculates total XP required to reach a specific level.
 * Level 1: 0 XP
 * Level 2: 150 XP
 * Level 3: 400 XP
 * Level 10: 4,500 XP
 * Level 25: 22,000 XP
 * Level 50: 75,000 XP
 * Level 100: 250,000 XP
 */
export function getRequiredXpForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(75 * Math.pow(level - 1, 1.75));
}

/**
 * Calculates current level and progress from total accumulated XP.
 */
export function calculateLevelProgression(totalXp: number): {
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  xpInCurrentLevel: number;
  xpRequiredForCurrentLevel: number;
  progressPercent: number;
} {
  let level = 1;
  while (getRequiredXpForLevel(level + 1) <= totalXp) {
    level++;
    if (level >= 100) break; // Level cap
  }

  const currentLevelFloor = getRequiredXpForLevel(level);
  const nextLevelCeil = getRequiredXpForLevel(level + 1);
  const xpInCurrentLevel = Math.max(0, totalXp - currentLevelFloor);
  const xpRequiredForCurrentLevel = Math.max(1, nextLevelCeil - currentLevelFloor);
  const progressPercent = Math.min(100, Math.floor((xpInCurrentLevel / xpRequiredForCurrentLevel) * 100));

  return {
    level,
    currentLevelXp: currentLevelFloor,
    nextLevelXp: nextLevelCeil,
    xpInCurrentLevel,
    xpRequiredForCurrentLevel,
    progressPercent,
  };
}

export const DEFAULT_ACHIEVEMENTS: Omit<AchievementItem, 'progress' | 'isUnlocked' | 'unlockedAt'>[] = [
  {
    id: 'ach_newcomer',
    code: 'FIRST_SESSION',
    name: 'Crystal Initiate',
    description: 'Complete your first CrystalAid activity session.',
    category: 'ACTIVITY',
    rarity: 'COMMON',
    icon: '🔷',
    xpReward: 150,
    coinReward: 50,
    maxProgress: 1,
  },
  {
    id: 'ach_streak_3',
    code: 'STREAK_3',
    name: 'Spark of Consistency',
    description: 'Maintain a 3-day consecutive activity streak.',
    category: 'PROGRESSION',
    rarity: 'COMMON',
    icon: '🔥',
    xpReward: 300,
    coinReward: 100,
    maxProgress: 3,
  },
  {
    id: 'ach_streak_7',
    code: 'STREAK_7',
    name: 'Diamond Discipline',
    description: 'Maintain a 7-day consecutive activity streak.',
    category: 'PROGRESSION',
    rarity: 'RARE',
    icon: '💎',
    xpReward: 1000,
    coinReward: 350,
    maxProgress: 7,
  },
  {
    id: 'ach_level_10',
    code: 'LEVEL_10',
    name: 'Rising Resonator',
    description: 'Reach Level 10 in the server.',
    category: 'PROGRESSION',
    rarity: 'RARE',
    icon: '⚡',
    xpReward: 800,
    coinReward: 250,
    maxProgress: 10,
  },
  {
    id: 'ach_level_25',
    code: 'LEVEL_25',
    name: 'Crystal Vanguard',
    description: 'Reach Level 25 in the server.',
    category: 'PROGRESSION',
    rarity: 'EPIC',
    icon: '🛡️',
    xpReward: 2500,
    coinReward: 750,
    maxProgress: 25,
  },
  {
    id: 'ach_hours_10',
    code: 'HOURS_10',
    name: 'Lounge Veteran',
    description: 'Spend at least 10 active hours inside voice/focus sessions.',
    category: 'ACTIVITY',
    rarity: 'EPIC',
    icon: '⏱️',
    xpReward: 2000,
    coinReward: 500,
    maxProgress: 600, // 600 minutes
  },
  {
    id: 'ach_collector',
    code: 'COLLECTOR_3',
    name: 'Prismatic Collector',
    description: 'Own at least 3 custom cosmetic items from the Crystal Shop.',
    category: 'SOCIAL',
    rarity: 'RARE',
    icon: '🛍️',
    xpReward: 600,
    coinReward: 200,
    maxProgress: 3,
  },
  {
    id: 'ach_top_3',
    code: 'PODIUM_FINISHER',
    name: 'Apex Resonator',
    description: 'Reach Top 3 rank on the weekly server leaderboard.',
    category: 'PROGRESSION',
    rarity: 'LEGENDARY',
    icon: '👑',
    xpReward: 5000,
    coinReward: 1500,
    maxProgress: 1,
  },
  {
    id: 'ach_secret_night',
    code: 'NIGHT_OWL',
    name: 'Midnight Crystal',
    description: 'Participate in an active session between 2:00 AM and 5:00 AM.',
    category: 'SECRET',
    rarity: 'EPIC',
    icon: '🌙',
    xpReward: 1200,
    coinReward: 400,
    maxProgress: 1,
  }
];

export const DEFAULT_SHOP_ITEMS: Omit<ShopCatalogItem, 'isOwned' | 'isEquipped'>[] = [
  {
    id: 'frame_ice_crystal',
    code: 'FRAME_ICE',
    name: 'Glacial Prism Frame',
    description: 'A sharp, refractive crystalline border with cyan neon highlights.',
    category: 'FRAMES',
    rarity: 'RARE',
    price: 650,
    previewUrl: '/assets/frames/glacial.png',
    metadata: {
      color: '#38BDF8',
      borderGlow: '0 0 16px rgba(56, 189, 248, 0.65)',
      animationClass: 'glow-pulse-cyan'
    }
  },
  {
    id: 'frame_cyber_violet',
    code: 'FRAME_VIOLET',
    name: 'Electric Amethyst Frame',
    description: 'Pulsing purple geometric crystal halo with holographic sheen.',
    category: 'FRAMES',
    rarity: 'EPIC',
    price: 1400,
    previewUrl: '/assets/frames/amethyst.png',
    metadata: {
      color: '#A855F7',
      borderGlow: '0 0 20px rgba(168, 85, 247, 0.7)',
      animationClass: 'glow-pulse-purple'
    }
  },
  {
    id: 'frame_apex_gold',
    code: 'FRAME_APEX',
    name: 'Solar Topaz Apex Frame',
    description: 'Radiant golden diamond facets reserved for top-tier community leaders.',
    category: 'FRAMES',
    rarity: 'LEGENDARY',
    price: 3200,
    previewUrl: '/assets/frames/solar.png',
    metadata: {
      color: '#FBBF24',
      borderGlow: '0 0 24px rgba(251, 191, 36, 0.8)',
      animationClass: 'glow-pulse-gold'
    }
  },
  {
    id: 'badge_resonator',
    code: 'BADGE_RESONATOR',
    name: 'Crystal Resonance Badge',
    description: 'Displays a sparkling diamond insignia next to your server username.',
    category: 'BADGES',
    rarity: 'COMMON',
    price: 250,
    previewUrl: '/assets/badges/resonator.png',
    metadata: {
      color: '#06B6D4'
    }
  },
  {
    id: 'badge_supernova',
    code: 'BADGE_SUPERNOVA',
    name: 'Supernova Badge',
    description: 'Blazing cosmic badge signifying high engagement and activity.',
    category: 'BADGES',
    rarity: 'RARE',
    price: 750,
    previewUrl: '/assets/badges/supernova.png',
    metadata: {
      color: '#EC4899'
    }
  },
  {
    id: 'theme_obsidian_cyan',
    code: 'THEME_OBSIDIAN',
    name: 'Glacial Obsidian Theme',
    description: 'Transforms the Activity color scheme into deep black obsidian and glacial cyan.',
    category: 'THEMES',
    rarity: 'EPIC',
    price: 1800,
    previewUrl: '/assets/themes/obsidian.png',
    metadata: {
      color: '#0EA5E9'
    }
  },
  {
    id: 'effect_crystal_shards',
    code: 'EFFECT_SHARDS',
    name: 'Floating Crystal Shards',
    description: 'Subtle floating geometric crystal particles surround your profile card.',
    category: 'EFFECTS',
    rarity: 'LEGENDARY',
    price: 2800,
    previewUrl: '/assets/effects/shards.png',
    metadata: {
      color: '#38BDF8'
    }
  }
];

export const DEFAULT_COMMUNITY_EVENT: GuildCommunityEvent = {
  id: 'evt_weekend_overdrive',
  title: 'Crystal Resonance Overdrive',
  description: 'Guild-wide milestone! Accumulate 50,000 XP collectively across all activity sessions this week to unlock +50% XP for everyone!',
  type: 'COMMUNITY_GOAL',
  targetXp: 50000,
  currentXp: 31450,
  progressPercent: 63,
  startsAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
  endsAt: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
  remainingSeconds: 3 * 24 * 3600,
  rewards: {
    coins: 500,
    xpMultiplier: 1.5,
    exclusiveBadge: 'Overdrive Survivor'
  }
};
