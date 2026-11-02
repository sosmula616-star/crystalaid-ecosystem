import { Router } from 'express';
import { xpService } from '../services/xpService';
import { authGuard, AuthenticatedRequest } from '../middleware/auth';
import { ActivityType } from '@crystalaid/types';
import { broadcastToGuild } from '../realtime/websocketServer';

const router = Router();

router.post('/session/start', authGuard, async (req: AuthenticatedRequest, res) => {
  try {
    const { type = 'VOICE_LOUNGE' } = req.body;
    const session = await xpService.startSession(req.userId!, req.guildId!, type as ActivityType);

    // Notify guild members via WebSocket
    broadcastToGuild(req.guildId!, {
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
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      data: null,
      error: { code: 'SESSION_START_FAILED', message: err.message },
      timestamp: Date.now(),
    });
  }
});

router.post('/session/heartbeat', authGuard, async (req: AuthenticatedRequest, res) => {
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

    const result = await xpService.processHeartbeat(sessionId, req.userId!);

    // If user leveled up, broadcast level up
    if (result.leveledUp) {
      broadcastToGuild(req.guildId!, {
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
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      data: null,
      error: { code: 'HEARTBEAT_FAILED', message: err.message },
      timestamp: Date.now(),
    });
  }
});

router.post('/session/end', authGuard, async (req: AuthenticatedRequest, res) => {
  try {
    const { sessionId } = req.body;
    const summary = await xpService.endSession(sessionId, req.userId!);
    return res.json({
      success: true,
      data: summary,
      error: null,
      timestamp: Date.now(),
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      data: null,
      error: { code: 'SESSION_END_FAILED', message: err.message },
      timestamp: Date.now(),
    });
  }
});

export default router;
