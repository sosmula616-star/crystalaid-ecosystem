"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.xpService = void 0;
const database_1 = require("@crystalaid/database");
const config_1 = require("@crystalaid/config");
const activeSessions = new Map();
exports.xpService = {
    startSession: async (userId, guildId, type) => {
        let resolvedGuildId = guildId;
        const g = await database_1.prisma.guild.findFirst({
            where: { OR: [{ id: guildId }, { discordGuildId: guildId }] },
        });
        if (g)
            resolvedGuildId = g.id;
        // Record in database
        const dbSession = await database_1.prisma.activitySession.create({
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
        const memorySession = {
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
    processHeartbeat: async (sessionId, userId) => {
        const session = activeSessions.get(sessionId);
        if (!session || session.userId !== userId) {
            throw new Error('INVALID_SESSION');
        }
        const now = Date.now();
        const elapsedSecondsSinceLast = (now - session.lastHeartbeat) / 1000;
        // Anti-cheat rate limit: Reject heartbeats sent under minimum interval
        if (elapsedSecondsSinceLast < config_1.APP_CONFIG.antiCheat.minHeartbeatIntervalSeconds) {
            return {
                isRateLimited: true,
                xpEarned: session.xpEarned,
                coinsEarned: session.coinsEarned,
            };
        }
        // Determine rate per minute
        const xpPerMin = config_1.APP_CONFIG.xpRates[session.type] || config_1.APP_CONFIG.xpRates.VOICE_LOUNGE;
        const coinsPerMin = config_1.APP_CONFIG.coinsRates[session.type] || config_1.APP_CONFIG.coinsRates.VOICE_LOUNGE;
        // Calculate clamped gains (prevent clock manipulation)
        const normalizedMinutes = Math.min(2.0, elapsedSecondsSinceLast / 60);
        const xpGain = Math.round(normalizedMinutes * xpPerMin);
        const coinsGain = Math.round(normalizedMinutes * coinsPerMin);
        session.lastHeartbeat = now;
        session.totalHeartbeats++;
        session.xpEarned += xpGain;
        session.coinsEarned += coinsGain;
        // Update GuildMember record
        const member = await database_1.prisma.guildMember.findFirst({
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
        const progression = (0, config_1.calculateLevelProgression)(newTotalXp);
        const leveledUp = progression.level > member.level;
        await database_1.prisma.guildMember.update({
            where: { id: member.id },
            data: {
                xp: newTotalXp,
                level: progression.level,
            },
        });
        if (coinsGain > 0) {
            await database_1.prisma.user.update({
                where: { id: session.userId },
                data: {
                    coins: { increment: coinsGain },
                },
            });
        }
        // Update db session progress
        await database_1.prisma.activitySession.update({
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
    endSession: async (sessionId, userId) => {
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
        await database_1.prisma.activitySession.update({
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
//# sourceMappingURL=xpService.js.map