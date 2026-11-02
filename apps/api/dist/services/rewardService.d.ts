import type { DailyRewardItem } from '@crystalaid/types';
export declare const rewardService: {
    getDailyStatus: (userId: string, guildId: string) => Promise<{
        currentStreak: number;
        canClaim: boolean;
        timeUntilNextClaimMs: number;
        days: DailyRewardItem[];
    }>;
    claimDaily: (userId: string, guildId: string) => Promise<{
        streak: number;
        day: number;
        coinsAwarded: number;
        xpAwarded: number;
        totalXp: number;
        level: number;
        leveledUp: boolean;
    }>;
};
//# sourceMappingURL=rewardService.d.ts.map