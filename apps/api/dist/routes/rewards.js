"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const rewardService_1 = require("../services/rewardService");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/status', auth_1.authGuard, async (req, res) => {
    try {
        const status = await rewardService_1.rewardService.getDailyStatus(req.userId, req.guildId);
        return res.json({
            success: true,
            data: status,
            error: null,
            timestamp: Date.now(),
        });
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            data: null,
            error: { code: 'REWARD_STATUS_FAILED', message: err.message },
            timestamp: Date.now(),
        });
    }
});
router.post('/claim-daily', auth_1.authGuard, async (req, res) => {
    try {
        const claim = await rewardService_1.rewardService.claimDaily(req.userId, req.guildId);
        return res.json({
            success: true,
            data: claim,
            error: null,
            timestamp: Date.now(),
        });
    }
    catch (err) {
        const status = err.message === 'COOLDOWN_ACTIVE' ? 429 : 500;
        return res.status(status).json({
            success: false,
            data: null,
            error: { code: err.message, message: 'Daily reward cooldown is currently active. Please try again tomorrow!' },
            timestamp: Date.now(),
        });
    }
});
exports.default = router;
//# sourceMappingURL=rewards.js.map