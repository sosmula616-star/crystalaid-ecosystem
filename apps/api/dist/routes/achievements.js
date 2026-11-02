"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = require("@crystalaid/database");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.authGuard, async (req, res) => {
    try {
        const [achievements, userAchievements] = await Promise.all([
            database_1.prisma.achievement.findMany(),
            database_1.prisma.userAchievement.findMany({ where: { userId: req.userId } }),
        ]);
        const userAchMap = new Map(userAchievements.map((ua) => [ua.achievementId, ua]));
        const items = achievements.map((ach) => {
            const userState = userAchMap.get(ach.id);
            return {
                id: ach.id,
                code: ach.code,
                name: ach.name,
                description: ach.description,
                category: ach.category,
                rarity: ach.rarity,
                icon: ach.icon,
                xpReward: ach.xpReward,
                coinReward: ach.coinReward,
                progress: userState ? userState.progress : 0,
                maxProgress: ach.maxProgress,
                isUnlocked: userState ? userState.isUnlocked : false,
                unlockedAt: userState && userState.unlockedAt ? userState.unlockedAt.toISOString() : null,
            };
        });
        const unlockedCount = items.filter((i) => i.isUnlocked).length;
        return res.json({
            success: true,
            data: {
                total: items.length,
                unlockedCount,
                progressPercent: Math.round((unlockedCount / items.length) * 100),
                achievements: items,
            },
            error: null,
            timestamp: Date.now(),
        });
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            data: null,
            error: { code: 'ACHIEVEMENTS_FAILED', message: err.message },
            timestamp: Date.now(),
        });
    }
});
exports.default = router;
//# sourceMappingURL=achievements.js.map