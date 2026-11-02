import { prisma } from '@crystalaid/database';
import { APP_CONFIG, calculateLevelProgression } from '@crystalaid/config';
import type { ActivityType } from '@crystalaid/types';

interface ActiveSessionMemory {
  sessionId: string;
  userId: string;
  guildId: string;
  type: ActivityType;
  startedAt: number;
  lastHeartbeat: number;
  totalHeartbeats: number;
  xpEarned: number;
  coinsEarned: number;
}

const activeSessions = new Map<string, ActiveSessionMemory>();

export const xpService = {
  startSession: async (userId: string, guildId: string, type: ActivityType) => {
    let resolvedGuildId = guildId;
    const g = await prisma.guild.findFirst({
      where: { OR: [{ id: guildId }, { discordGuildId: guildId }] },
    });
    if (g) resolvedGuildId = g.id;

    // Record in database
    const dbSession = await prisma.activitySession.create({
      data: {
        userId,
        guildId: resolvedGuildId,
        type,
        status: 'ACTIVE',
        durationSeconds: 0,
        xpEarned: 0,
        coinsEarned: 0,
      },
    });

    const memorySession: ActiveSessionMemory = {
      sessionId: dbSession.id,
      userId,
      guildId: resolvedGuildId,
      type,
      startedAt: Date.now(),
      lastHeartbeat: Date.now(),
      totalHeartbeats: 0,
      xpEarned: 0,
      coinsEarned: 0,
    };

    activeSessions.set(dbSession.id, memorySession);

    return {
      sessionId: dbSession.id,
      startedAt: memorySession.startedAt,
      type,
    };
  },

  processHeartbeat: async (sessionId: string, userId: string) => {
    const session = activeSessions.get(sessionId);
    if (!session || session.userId !== userId) {
      throw new Error('INVALID_SESSION');
    }

    const now = Date.now();
    const elapsedSecondsSinceLast = (now - session.lastHeartbeat) / 1000;

    // Anti-cheat rate limit: Reject heartbeats sent under minimum interval
    if (elapsedSecondsSinceLast < APP_CONFIG.antiCheat.minHeartbeatIntervalSeconds) {
      return {
        isRateLimited: true,
        xpEarned: session.xpEarned,
        coinsEarned: session.coinsEarned,
      };
    }

    // Determine rate per minute
    const xpPerMin = APP_CONFIG.xpRates[session.type] || APP_CONFIG.xpRates.VOICE_LOUNGE;
    const coinsPerMin = APP_CONFIG.coinsRates[session.type] || APP_CONFIG.coinsRates.VOICE_LOUNGE;

    // Calculate clamped gains (prevent clock manipulation)
    const normalizedMinutes = Math.min(2.0, elapsedSecondsSinceLast / 60);
    const xpGain = Math.round(normalizedMinutes * xpPerMin);
    const coinsGain = Math.round(normalizedMinutes * coinsPerMin);

    session.lastHeartbeat = now;
    session.totalHeartbeats++;
    session.xpEarned += xpGain;
    session.coinsEarned += coinsGain;

    // Update GuildMember record
    const member = await prisma.guildMember.findFirst({
      where: {
        userId: session.userId,
        OR: [
          { guildId: session.guildId },
          { guild: { discordGuildId: session.guildId } },
        ],
      },
    });

    if (!member) {
      throw new Error('MEMBER_NOT_FOUND');
    }

    const newTotalXp = member.xp + xpGain;
    const progression = calculateLevelProgression(newTotalXp);
    const leveledUp = progression.level > member.level;

    await prisma.guildMember.update({
      where: { id: member.id },
      data: {
        xp: newTotalXp,
        level: progression.level,
      },
    });

    if (coinsGain > 0) {
      await prisma.user.update({
        where: { id: session.userId },
        data: {
          coins: { increment: coinsGain },
        },
      });
    }

    // Update db session progress
    await prisma.activitySession.update({
      where: { id: sessionId },
      data: {
        durationSeconds: Math.floor((now - session.startedAt) / 1000),
        xpEarned: session.xpEarned,
        coinsEarned: session.coinsEarned,
      },
    });

    return {
      isRateLimited: false,
      xpGained: xpGain,
      coinsGained: coinsGain,
      totalXp: newTotalXp,
      level: progression.level,
      progressPercent: progression.progressPercent,
      leveledUp,
    };
  },

  endSession: async (sessionId: string, userId: string) => {
    const session = activeSessions.get(sessionId);
    const now = Date.now();

    let durationSeconds = 0;
    let xpEarned = 0;
    let coinsEarned = 0;

    if (session && session.userId === userId) {
      durationSeconds = Math.floor((now - session.startedAt) / 1000);
      xpEarned = session.xpEarned;
      coinsEarned = session.coinsEarned;
      activeSessions.delete(sessionId);
    }

    await prisma.activitySession.update({
      where: { id: sessionId },
      data: {
        status: 'COMPLETED',
        endedAt: new Date(),
        durationSeconds,
        xpEarned,
        coinsEarned,
      },
    });

    return {
      sessionId,
      durationSeconds,
      xpEarned,
      coinsEarned,
    };
  },
};
