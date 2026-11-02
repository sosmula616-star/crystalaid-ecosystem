import { Router } from 'express';
import { userService } from '../services/userService';
import { authGuard, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

router.get('/:userId/profile', authGuard, async (req: AuthenticatedRequest, res) => {
  try {
    const targetUserId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
    const profile = await userService.getProfile(targetUserId, req.guildId!);
    return res.json({
      success: true,
      data: profile,
      error: null,
      timestamp: Date.now(),
    });
  } catch (err: any) {
    return res.status(404).json({
      success: false,
      data: null,
      error: { code: 'USER_NOT_FOUND', message: err.message },
      timestamp: Date.now(),
    });
  }
});

router.patch('/me/cosmetics', authGuard, async (req: AuthenticatedRequest, res) => {
  try {
    const { equippedFrame, equippedBadge } = req.body;
    const updated = await userService.equipCosmetics(req.userId!, equippedFrame, equippedBadge);
    return res.json({
      success: true,
      data: {
        equippedFrame: updated.equippedFrame,
        equippedBadge: updated.equippedBadge,
      },
      error: null,
      timestamp: Date.now(),
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      data: null,
      error: { code: 'UPDATE_FAILED', message: err.message },
      timestamp: Date.now(),
    });
  }
});

export default router;
