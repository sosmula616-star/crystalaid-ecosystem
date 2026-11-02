import type { ActivityType } from '@crystalaid/types';
export declare const xpService: {
    startSession: (userId: string, guildId: string, type: ActivityType) => Promise<{
        sessionId: string;
        startedAt: number;
        type: ActivityType;
    }>;
    processHeartbeat: (sessionId: string, userId: string) => Promise<{
        isRateLimited: boolean;
        xpEarned: number;
        coinsEarned: number;
        xpGained?: undefined;
        coinsGained?: undefined;
        totalXp?: undefined;
        level?: undefined;
        progressPercent?: undefined;
        leveledUp?: undefined;
    } | {
        isRateLimited: boolean;
        xpGained: number;
        coinsGained: number;
        totalXp: number;
        level: number;
        progressPercent: number;
        leveledUp: boolean;
        xpEarned?: undefined;
        coinsEarned?: undefined;
    }>;
    endSession: (sessionId: string, userId: string) => Promise<{
        sessionId: string;
        durationSeconds: number;
        xpEarned: number;
        coinsEarned: number;
    }>;
};
//# sourceMappingURL=xpService.d.ts.map