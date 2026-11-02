import { prisma } from '@crystalaid/database';
import { APP_CONFIG, calculateLevelProgression } from '@crystalaid/config';
import type { DailyRewardItem } from '@crystalaid/types';

export const rewardService = {
  getDailyStatus: async (userId: string, guildId: string) => {
    const member = await prisma.guildMember.findFirst({
      where: {
        userId,
        OR: [
          { guildId },
          { guild: { discordGuildId: guildId } },
        ],
      },
    });

    if (!member) throw new Error('MEMBER_NOT_FOUND');

    const now = Date.now();
    const lastClaim = member.lastDailyClaim ? new Date(member.lastDailyClaim).getTime() : 0;
    const cooldownMs = APP_CONFIG.dailyClaimCooldownHours * 3600 * 1000;
    const graceMs = APP_CONFIG.streakMaxGracePeriodHours * 3600 * 1000;
    const diff = now - lastClaim;

    const canClaim = diff >= cooldownMs;
    const isStreakBroken = lastClaim > 0 && diff > graceMs;
    const currentStreak = isStreakBroken ? 0 : member.currentStreak;
    const nextStreakDay = (currentStreak % 7) + 1;

    // Generate 7-day track
    const days: DailyRewardItem[] = [];
    const baseRewards = [
      { day: 1, title: 'Day 1: Shard Initiate', coins: 50, xp: 100 },
      { day: 2, title: 'Day 2: Resonator Surge', coins: 80, xp: 150 },
      { day: 3, title: 'Day 3: Prism Spark', coins: 120, xp: 250 },
      { day: 4, title: 'Day 4: Crystal Bounty', coins: 180, xp: 350 },
      { day: 5, title: 'Day 5: Diamond Flame', coins: 250, xp: 500 },
      { day: 6, title: 'Day 6: Apex Overcharge', coins: 350, xp: 750 },
      { day: 7, title: 'Day 7: Celestial Jackpot', coins: 600, xp: 1500, badge: 'Streak Master' },
    ];

    for (const r of baseRewards) {
      const isClaimed = r.day < nextStreakDay && !canClaim;
      const isCurrent = r.day === nextStreakDay;
      const isLocked = r.day > nextStreakDay || (isCurrent && !canClaim);

      days.push({
        ...r,
        isClaimed,
        isCurrent,
        isLocked,
      });
    }

    return {
      currentStreak,
      canClaim,
      timeUntilNextClaimMs: canClaim ? 0 : cooldownMs - diff,
      days,
    };
  },

  claimDaily: async (userId: string, guildId: string) => {
    return await prisma.$transaction(async (tx) => {
      const member = await tx.guildMember.findFirst({
        where: {
          userId,
          OR: [
            { guildId },
            { guild: { discordGuildId: guildId } },
          ],
        },
      });

      if (!member) throw new Error('MEMBER_NOT_FOUND');

      const now = Date.now();
      const lastClaim = member.lastDailyClaim ? new Date(member.lastDailyClaim).getTime() : 0;
      const cooldownMs = APP_CONFIG.dailyClaimCooldownHours * 3600 * 1000;
      const graceMs = APP_CONFIG.streakMaxGracePeriodHours * 3600 * 1000;
      const diff = now - lastClaim;

      if (lastClaim > 0 && diff < cooldownMs) {
        throw new Error('COOLDOWN_ACTIVE');
      }

      const isStreakBroken = lastClaim > 0 && diff > graceMs;
      const newStreak = isStreakBroken ? 1 : member.currentStreak + 1;
      const streakCycleDay = ((newStreak - 1) % 7) + 1;

      // Reward table
      const coinsPerDay = [50, 80, 120, 180, 250, 350, 600];
      const xpPerDay = [100, 150, 250, 350, 500, 750, 1500];

      const rewardCoins = coinsPerDay[streakCycleDay - 1];
      const rewardXp = xpPerDay[streakCycleDay - 1];

      // Update Member
      const newTotalXp = member.xp + rewardXp;
      const progression = calculateLevelProgression(newTotalXp);

      await tx.guildMember.update({
        where: { id: member.id },
        data: {
          currentStreak: newStreak,
          lastDailyClaim: new Date(),
          xp: newTotalXp,
          level: progression.level,
        },
      });

      // Update User coins
      await tx.user.update({
        where: { id: userId },
        data: {
          coins: { increment: rewardCoins },
        },
      });

      // Log transaction
      await tx.transaction.create({
        data: {
          userId,
          type: 'REWARD_CLAIM',
          amount: rewardCoins,
          description: `Daily Streak Day ${streakCycleDay} (+${rewardCoins} Crystals, +${rewardXp} XP)`,
        },
      });

      return {
        streak: newStreak,
        day: streakCycleDay,
        coinsAwarded: rewardCoins,
        xpAwarded: rewardXp,
        totalXp: newTotalXp,
        level: progression.level,
        leveledUp: progression.level > member.level,
      };
    });
  },
};
