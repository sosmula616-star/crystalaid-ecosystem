"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = require("@crystalaid/database");
const auth_1 = require("../middleware/auth");
const config_1 = require("@crystalaid/config");
const router = (0, express_1.Router)();
router.get('/active', auth_1.authGuard, async (req, res) => {
    try {
        const event = await database_1.prisma.guildEvent.findFirst({
            where: {
                guild: {
                    OR: [
                        { id: req.guildId },
                        { discordGuildId: req.guildId },
                    ],
                },
            },
            orderBy: { endsAt: 'desc' },
        });
        if (!event) {
            return res.json({
                success: true,
                data: config_1.DEFAULT_COMMUNITY_EVENT,
                error: null,
                timestamp: Date.now(),
            });
        }
        let rewards = { coins: 500, xpMultiplier: 1.5, exclusiveBadge: 'Overdrive' };
        try {
            rewards = JSON.parse(event.rewardsJson);
        }
        catch (e) { }
        const now = Date.now();
        const remainingSeconds = Math.max(0, Math.floor((new Date(event.endsAt).getTime() - now) / 1000));
        const progressPercent = Math.min(100, Math.round((event.currentXp / event.targetXp) * 100));
        return res.json({
            success: true,
            data: {
                id: event.id,
                title: event.title,
                description: event.description,
                type: event.type,
                targetXp: event.targetXp,
                currentXp: event.currentXp,
                progressPercent,
                startsAt: event.startsAt.toISOString(),
                endsAt: event.endsAt.toISOString(),
                remainingSeconds,
                rewards,
            },
            error: null,
            timestamp: Date.now(),
        });
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            data: null,
            error: { code: 'EVENTS_FAILED', message: err.message },
            timestamp: Date.now(),
        });
    }
});
exports.default = router;
//# sourceMappingURL=events.js.map