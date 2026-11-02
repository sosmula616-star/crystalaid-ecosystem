import { Router } from 'express';
import { rewardService } from '../services/rewardService';
import { authGuard, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

router.get('/status', authGuard, async (req: AuthenticatedRequest, res) => {
  try {
    const status = await rewardService.getDailyStatus(req.userId!, req.guildId!);
    return res.json({
      success: true,
      data: status,
      error: null,
      timestamp: Date.now(),
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      data: null,
      error: { code: 'REWARD_STATUS_FAILED', message: err.message },
      timestamp: Date.now(),
    });
  }
});

router.post('/claim-daily', authGuard, async (req: AuthenticatedRequest, res) => {
  try {
    const claim = await rewardService.claimDaily(req.userId!, req.guildId!);
    return res.json({
      success: true,
      data: claim,
      error: null,
      timestamp: Date.now(),
    });
  } catch (err: any) {
    const status = err.message === 'COOLDOWN_ACTIVE' ? 429 : 500;
    return res.status(status).json({
      success: false,
      data: null,
      error: { code: err.message, message: 'Daily reward cooldown is currently active. Please try again tomorrow!' },
      timestamp: Date.now(),
    });
  }
});

export default router;
