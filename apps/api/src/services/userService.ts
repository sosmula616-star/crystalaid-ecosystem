import { prisma } from '@crystalaid/database';
import { calculateLevelProgression, APP_CONFIG } from '@crystalaid/config';
import { UserProfile, Role } from '@crystalaid/types';

export const userService = {
  getProfile: async (userId: string, guildId: string): Promise<UserProfile> => {
    const user = await prisma.user.findUnique({
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
      member = await prisma.guildMember.create({
        data: {
          userId: user.id,
          guildId,
          level: 1,
          xp: 0,
          currentStreak: 0,
        },
      });
    }

    const progression = calculateLevelProgression(member.xp);
    const now = Date.now();
    const lastClaim = member.lastDailyClaim ? new Date(member.lastDailyClaim).getTime() : 0;
    const cooldownMs = APP_CONFIG.dailyClaimCooldownHours * 3600 * 1000;
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
      role: member.role as Role,
      totalActivitiesCount: user.activities.length,
      totalTimeSeconds,
    };
  },

  equipCosmetics: async (userId: string, equippedFrame?: string | null, equippedBadge?: string | null) => {
    const updateData: any = {};
    if (equippedFrame !== undefined) updateData.equippedFrame = equippedFrame;
    if (equippedBadge !== undefined) updateData.equippedBadge = equippedBadge;

    return await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
  },
};
