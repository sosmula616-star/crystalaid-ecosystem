import { Router } from 'express';
import { prisma } from '@crystalaid/database';
import { authGuard, AuthenticatedRequest } from '../middleware/auth';
import { DEFAULT_COMMUNITY_EVENT } from '@crystalaid/config';

const router = Router();

router.get('/active', authGuard, async (req: AuthenticatedRequest, res) => {
  try {
    const event = await prisma.guildEvent.findFirst({
      where: {
        guild: {
          OR: [
            { id: req.guildId! },
            { discordGuildId: req.guildId! },
          ],
        },
      },
      orderBy: { endsAt: 'desc' },
    });

    if (!event) {
      return res.json({
        success: true,
        data: DEFAULT_COMMUNITY_EVENT,
        error: null,
        timestamp: Date.now(),
      });
    }

    let rewards = { coins: 500, xpMultiplier: 1.5, exclusiveBadge: 'Overdrive' };
    try {
      rewards = JSON.parse(event.rewardsJson);
    } catch (e) {}

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
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      data: null,
      error: { code: 'EVENTS_FAILED', message: err.message },
      timestamp: Date.now(),
    });
  }
});

export default router;
