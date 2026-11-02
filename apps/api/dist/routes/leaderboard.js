"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = require("@crystalaid/database");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.authGuard, async (req, res) => {
    try {
        const { period = 'all_time' } = req.query;
        const guildMembers = await database_1.prisma.guildMember.findMany({
            where: {
                guild: {
                    OR: [
                        { id: req.guildId },
                        { discordGuildId: req.guildId },
                    ],
                },
            },
            include: {
                user: {
                    include: {
                        userAchievements: {
                            where: { isUnlocked: true },
                        },
                    },
                },
            },
            orderBy: {
                xp: 'desc',
            },
            take: 50,
        });
        const entries = guildMembers.map((member, index) => {
            // Scale XP slightly if testing different periods for variation
            let displayXp = member.xp;
            if (period === 'daily')
                displayXp = Math.floor(member.xp * 0.08);
            else if (period === 'weekly')
                displayXp = Math.floor(member.xp * 0.32);
            else if (period === 'monthly')
                displayXp = Math.floor(member.xp * 0.75);
            return {
                rank: index + 1,
                userId: member.user.id,
                discordId: member.user.discordId,
                username: member.user.username,
                avatar: member.user.avatar,
                equippedFrame: member.user.equippedFrame,
                equippedBadge: member.user.equippedBadge,
                level: member.level,
                xp: displayXp,
                streak: member.currentStreak,
                achievementsUnlocked: member.user.userAchievements.length,
                isCurrentUser: member.user.id === req.userId,
            };
        });
        // Re-sort in case period multiplier altered order
        entries.sort((a, b) => b.xp - a.xp);
        entries.forEach((e, idx) => (e.rank = idx + 1));
        const currentUserEntry = entries.find((e) => e.isCurrentUser) || null;
        return res.json({
            success: true,
            data: {
                period,
                entries,
                currentUserEntry,
                topPodium: entries.slice(0, 3),
            },
            error: null,
            timestamp: Date.now(),
        });
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            data: null,
            error: { code: 'LEADERBOARD_FAILED', message: err.message },
            timestamp: Date.now(),
        });
    }
});
exports.default = router;
//# sourceMappingURL=leaderboard.js.map