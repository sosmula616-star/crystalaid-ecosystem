"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userService_1 = require("../services/userService");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/:userId/profile', auth_1.authGuard, async (req, res) => {
    try {
        const targetUserId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
        const profile = await userService_1.userService.getProfile(targetUserId, req.guildId);
        return res.json({
            success: true,
            data: profile,
            error: null,
            timestamp: Date.now(),
        });
    }
    catch (err) {
        return res.status(404).json({
            success: false,
            data: null,
            error: { code: 'USER_NOT_FOUND', message: err.message },
            timestamp: Date.now(),
        });
    }
});
router.patch('/me/cosmetics', auth_1.authGuard, async (req, res) => {
    try {
        const { equippedFrame, equippedBadge } = req.body;
        const updated = await userService_1.userService.equipCosmetics(req.userId, equippedFrame, equippedBadge);
        return res.json({
            success: true,
            data: {
                equippedFrame: updated.equippedFrame,
                equippedBadge: updated.equippedBadge,
            },
            error: null,
            timestamp: Date.now(),
        });
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            data: null,
            error: { code: 'UPDATE_FAILED', message: err.message },
            timestamp: Date.now(),
        });
    }
});
exports.default = router;
//# sourceMappingURL=users.js.map