"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
const database_1 = require("@crystalaid/database");
const config_1 = require("@crystalaid/config");
exports.userService = {
    getProfile: async (userId, guildId) => {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            include: {
                guildMembers: {
                    where: { guildId },
                },
                activities: {
                    where: { guildId, status: 'COMPLETED' },
                },
            },
        });
        if (!user) {
            throw new Error('USER_NOT_FOUND');
        }
        let member = user.guildMembers[0];
        if (!member) {
            member = await database_1.prisma.guildMember.create({
                data: {
                    userId: user.id,
                    guildId,
                    level: 1,
                    xp: 0,
                    currentStreak: 0,
                },
            });
        }
        const progression = (0, config_1.calculateLevelProgression)(member.xp);
        const now = Date.now();
        const lastClaim = member.lastDailyClaim ? new Date(member.lastDailyClaim).getTime() : 0;
        const cooldownMs = config_1.APP_CONFIG.dailyClaimCooldownHours * 3600 * 1000;
        const timeSinceLastClaim = now - lastClaim;
        const canClaimDaily = timeSinceLastClaim >= cooldownMs;
        const timeUntilNextClaimMs = canClaimDaily ? 0 : cooldownMs - timeSinceLastClaim;
        const totalTimeSeconds = user.activities.reduce((acc, curr) => acc + curr.durationSeconds, 0);
        return {
            id: user.id,
            discordId: user.discordId,
            username: user.username,
            discriminator: user.discriminator,
            avatar: user.avatar,
            banner: user.banner,
            equippedFrame: user.equippedFrame,
            equippedBadge: user.equippedBadge,
            coins: user.coins,
            level: member.level,
            xp: member.xp,
            nextLevelXp: progression.nextLevelXp,
            levelProgressPercent: progression.progressPercent,
            currentStreak: member.currentStreak,
            lastDailyClaim: member.lastDailyClaim ? member.lastDailyClaim.toISOString() : null,
            canClaimDaily,
            timeUntilNextClaimMs,
            role: member.role,
            totalActivitiesCount: user.activities.length,
            totalTimeSeconds,
        };
    },
    equipCosmetics: async (userId, equippedFrame, equippedBadge) => {
        const updateData = {};
        if (equippedFrame !== undefined)
            updateData.equippedFrame = equippedFrame;
        if (equippedBadge !== undefined)
            updateData.equippedBadge = equippedBadge;
        return await database_1.prisma.user.update({
            where: { id: userId },
            data: updateData,
        });
    },
};
//# sourceMappingURL=userService.js.map