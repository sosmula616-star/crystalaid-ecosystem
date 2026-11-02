"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const xpService_1 = require("../services/xpService");
const auth_1 = require("../middleware/auth");
const websocketServer_1 = require("../realtime/websocketServer");
const router = (0, express_1.Router)();
router.post('/session/start', auth_1.authGuard, async (req, res) => {
    try {
        const { type = 'VOICE_LOUNGE' } = req.body;
        const session = await xpService_1.xpService.startSession(req.userId, req.guildId, type);
        // Notify guild members via WebSocket
        (0, websocketServer_1.broadcastToGuild)(req.guildId, {
            type: 'NOTIFICATION',
            title: 'Active Session Joined',
            message: 'A member started a new CrystalAid focus/lounge session.',
            variant: 'info',
        });
        return res.json({
            success: true,
            data: session,
            error: null,
            timestamp: Date.now(),
        });
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            data: null,
            error: { code: 'SESSION_START_FAILED', message: err.message },
            timestamp: Date.now(),
        });
    }
});
router.post('/session/heartbeat', auth_1.authGuard, async (req, res) => {
    try {
        const { sessionId } = req.body;
        if (!sessionId) {
            return res.status(400).json({
                success: false,
                data: null,
                error: { code: 'MISSING_SESSION_ID', message: 'sessionId is required' },
                timestamp: Date.now(),
            });
        }
        const result = await xpService_1.xpService.processHeartbeat(sessionId, req.userId);
        // If user leveled up, broadcast level up
        if (result.leveledUp) {
            (0, websocketServer_1.broadcastToGuild)(req.guildId, {
                type: 'LEVEL_UP',
                newLevel: result.level,
                bonusCoins: 100,
            });
        }
        return res.json({
            success: true,
            data: result,
            error: null,
            timestamp: Date.now(),
        });
    }
    catch (err) {
        return res.status(400).json({
            success: false,
            data: null,
            error: { code: 'HEARTBEAT_FAILED', message: err.message },
            timestamp: Date.now(),
        });
    }
});
router.post('/session/end', auth_1.authGuard, async (req, res) => {
    try {
        const { sessionId } = req.body;
        const summary = await xpService_1.xpService.endSession(sessionId, req.userId);
        return res.json({
            success: true,
            data: summary,
            error: null,
            timestamp: Date.now(),
        });
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            data: null,
            error: { code: 'SESSION_END_FAILED', message: err.message },
            timestamp: Date.now(),
        });
    }
});
exports.default = router;
//# sourceMappingURL=activities.js.map