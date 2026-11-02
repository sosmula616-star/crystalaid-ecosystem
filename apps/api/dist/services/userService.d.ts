import type { UserProfile } from '@crystalaid/types';
export declare const userService: {
    getProfile: (userId: string, guildId: string) => Promise<UserProfile>;
    equipCosmetics: (userId: string, equippedFrame?: string | null, equippedBadge?: string | null) => Promise<{
        id: string;
        discordId: string;
        username: string;
        discriminator: string;
        avatar: string | null;
        banner: string | null;
        equippedFrame: string | null;
        equippedBadge: string | null;
        coins: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
};
//# sourceMappingURL=userService.d.ts.map