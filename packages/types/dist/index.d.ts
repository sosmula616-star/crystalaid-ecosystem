export type Role = 'USER' | 'MODERATOR' | 'ADMIN' | 'OWNER';
export type ActivityType = 'VOICE_LOUNGE' | 'FOCUS' | 'CHALLENGE';
export type ActivityStatus = 'ACTIVE' | 'COMPLETED' | 'ABORTED';
export type AchievementCategory = 'PROGRESSION' | 'SOCIAL' | 'ACTIVITY' | 'SECRET';
export type Rarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
export type ShopCategory = 'FRAMES' | 'BADGES' | 'THEMES' | 'EFFECTS';
export interface UserProfile {
    id: string;
    discordId: string;
    username: string;
    discriminator: string;
    avatar: string | null;
    banner: string | null;
    equippedFrame: string | null;
    equippedBadge: string | null;
    coins: number;
    level: number;
    xp: number;
    nextLevelXp: number;
    levelProgressPercent: number;
    currentStreak: number;
    lastDailyClaim: string | null;
    canClaimDaily: boolean;
    timeUntilNextClaimMs: number;
    role: Role;
    totalActivitiesCount: number;
    totalTimeSeconds: number;
}
export interface GuildContext {
    id: string;
    discordGuildId: string;
    name: string;
    icon: string | null;
    memberCount: number;
    xpRateMultiplier: number;
}
export interface ActivityParticipant {
    id: string;
    username: string;
    avatar: string | null;
    level: number;
    joinedAt: string;
    isMuted?: boolean;
}
export interface LiveActivityState {
    sessionId: string;
    type: ActivityType;
    title: string;
    elapsedSeconds: number;
    currentXpGained: number;
    currentCoinsGained: number;
    xpRatePerMinute: number;
    participants: ActivityParticipant[];
    isActive: boolean;
}
export interface LeaderboardEntry {
    rank: number;
    userId: string;
    discordId: string;
    username: string;
    avatar: string | null;
    equippedFrame: string | null;
    equippedBadge: string | null;
    level: number;
    xp: number;
    streak: number;
    achievementsUnlocked: number;
    isCurrentUser: boolean;
}
export interface DailyRewardItem {
    day: number;
    title: string;
    coins: number;
    xp: number;
    badge?: string;
    isClaimed: boolean;
    isCurrent: boolean;
    isLocked: boolean;
}
export interface AchievementItem {
    id: string;
    code: string;
    name: string;
    description: string;
    category: AchievementCategory;
    rarity: Rarity;
    icon: string;
    xpReward: number;
    coinReward: number;
    progress: number;
    maxProgress: number;
    isUnlocked: boolean;
    unlockedAt: string | null;
}
export interface ShopCatalogItem {
    id: string;
    code: string;
    name: string;
    description: string;
    category: ShopCategory;
    rarity: Rarity;
    price: number;
    previewUrl: string;
    isOwned: boolean;
    isEquipped: boolean;
    metadata?: {
        color?: string;
        borderGlow?: string;
        animationClass?: string;
    };
}
export interface GuildCommunityEvent {
    id: string;
    title: string;
    description: string;
    type: string;
    targetXp: number;
    currentXp: number;
    progressPercent: number;
    startsAt: string;
    endsAt: string;
    remainingSeconds: number;
    rewards: {
        coins: number;
        xpMultiplier: number;
        exclusiveBadge?: string;
    };
}
export interface ApiResponse<T = any> {
    success: boolean;
    data: T | null;
    error: {
        code: string;
        message: string;
        retryAfter?: number;
    } | null;
    timestamp: number;
}
export interface AuthSessionResponse {
    token: string;
    user: UserProfile;
    guild: GuildContext;
}
export type WsClientMessage = {
    type: 'SUBSCRIBE';
    guildId: string;
    token: string;
} | {
    type: 'HEARTBEAT';
    sessionId: string;
} | {
    type: 'LEAVE_SESSION';
    sessionId: string;
};
export type WsServerMessage = {
    type: 'CONNECTED';
    connectionId: string;
} | {
    type: 'XP_UPDATE';
    xp: number;
    level: number;
    progressPercent: number;
} | {
    type: 'LEVEL_UP';
    newLevel: number;
    bonusCoins: number;
} | {
    type: 'PARTICIPANTS_UPDATE';
    participants: ActivityParticipant[];
} | {
    type: 'EVENT_UPDATE';
    event: GuildCommunityEvent;
} | {
    type: 'NOTIFICATION';
    title: string;
    message: string;
    variant: 'info' | 'success' | 'warning';
};
//# sourceMappingURL=index.d.ts.map