import type { AchievementItem, ShopCatalogItem, GuildCommunityEvent } from '@crystalaid/types';
export declare const APP_CONFIG: {
    name: string;
    tagline: string;
    currencyName: string;
    currencySymbol: string;
    streakMaxGracePeriodHours: number;
    dailyClaimCooldownHours: number;
    maxSessionDurationMinutes: number;
    antiCheat: {
        maxHeartbeatWindowSeconds: number;
        minHeartbeatIntervalSeconds: number;
        maxAllowedXpPerMinute: number;
        rateLimitRequestsPerMinute: number;
    };
    xpRates: {
        VOICE_LOUNGE: number;
        FOCUS: number;
        CHALLENGE: number;
    };
    coinsRates: {
        VOICE_LOUNGE: number;
        FOCUS: number;
        CHALLENGE: number;
    };
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
export declare function getRequiredXpForLevel(level: number): number;
/**
 * Calculates current level and progress from total accumulated XP.
 */
export declare function calculateLevelProgression(totalXp: number): {
    level: number;
    currentLevelXp: number;
    nextLevelXp: number;
    xpInCurrentLevel: number;
    xpRequiredForCurrentLevel: number;
    progressPercent: number;
};
export declare const DEFAULT_ACHIEVEMENTS: Omit<AchievementItem, 'progress' | 'isUnlocked' | 'unlockedAt'>[];
export declare const DEFAULT_SHOP_ITEMS: Omit<ShopCatalogItem, 'isOwned' | 'isEquipped'>[];
export declare const DEFAULT_COMMUNITY_EVENT: GuildCommunityEvent;
//# sourceMappingURL=index.d.ts.map