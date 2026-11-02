import { Router } from 'express';
import { prisma } from '@crystalaid/database';
import { authGuard, AuthenticatedRequest } from '../middleware/auth';
import { AchievementItem, AchievementCategory, Rarity } from '@crystalaid/types';

const router = Router();

router.get('/', authGuard, async (req: AuthenticatedRequest, res) => {
  try {
    const [achievements, userAchievements] = await Promise.all([
      prisma.achievement.findMany(),
      prisma.userAchievement.findMany({ where: { userId: req.userId! } }),
    ]);

    const userAchMap = new Map(userAchievements.map((ua) => [ua.achievementId, ua]));

    const items: AchievementItem[] = achievements.map((ach) => {
      const userState = userAchMap.get(ach.id);
      return {
        id: ach.id,
        code: ach.code,
        name: ach.name,
        description: ach.description,
        category: ach.category as AchievementCategory,
        rarity: ach.rarity as Rarity,
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
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      data: null,
      error: { code: 'ACHIEVEMENTS_FAILED', message: err.message },
      timestamp: Date.now(),
    });
  }
});

export default router;
