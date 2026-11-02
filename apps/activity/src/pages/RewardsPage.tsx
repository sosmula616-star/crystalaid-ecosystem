import React, { useState, useEffect } from 'react';
import { api } from '../services/apiClient';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { DailyRewardItem } from '@crystalaid/types';

export const RewardsPage: React.FC = () => {
  const { user, refreshProfile, updateUserBalance } = useAuth();
  const { success, error } = useToast();

  const [days, setDays] = useState<DailyRewardItem[]>([]);
  const [canClaim, setCanClaim] = useState<boolean>(false);
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [timeUntilNextClaimMs, setTimeUntilNextClaimMs] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isClaiming, setIsClaiming] = useState<boolean>(false);

  useEffect(() => {
    async function fetchRewardsStatus() {
      setIsLoading(true);
      try {
        const data = await api.get<{
          currentStreak: number;
          canClaim: boolean;
          timeUntilNextClaimMs: number;
          days: DailyRewardItem[];
        }>('/api/rewards/status');
        setDays(data.days);
        setCanClaim(data.canClaim);
        setCurrentStreak(data.currentStreak);
        setTimeUntilNextClaimMs(data.timeUntilNextClaimMs);
      } catch (err: any) {
        console.warn('Failed to load rewards:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchRewardsStatus();
  }, []);

  const handleClaimDaily = async () => {
    setIsClaiming(true);
    try {
      const res = await api.post<{
        streak: number;
        day: number;
        coinsAwarded: number;
        xpAwarded: number;
        leveledUp: boolean;
      }>('/api/rewards/claim-daily');

      success(
        `Claimed Day ${res.day} Reward! (+${res.coinsAwarded} Crystals 💎, +${res.xpAwarded} XP)`,
        'Daily Streak Reward'
      );

      updateUserBalance(res.coinsAwarded);
      setCanClaim(false);
      setCurrentStreak(res.streak);

      // Refresh calendar
      setDays((prev) =>
        prev.map((d) => (d.day === res.day ? { ...d, isClaimed: true, isCurrent: true, isLocked: false } : d))
      );

      refreshProfile();
    } catch (err: any) {
      error(err.message || 'Reward cooldown is active');
    } finally {
      setIsClaiming(false);
    }
  };

  const formatHoursMins = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    return `${hrs}h ${mins}m`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <Card
        surface={2}
        glow="gold"
        style={{
          border: '1px solid rgba(251, 191, 36, 0.4)',
          background: 'linear-gradient(135deg, rgba(20, 27, 41, 0.95), rgba(30, 27, 75, 0.95))',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span style={{ fontSize: '28px' }}>🔥</span>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#FFFFFF' }}>
                Daily Streak: {currentStreak} Days Consecutive
              </h1>
              <Badge variant="flame" size="md">
                ACTIVE
              </Badge>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '520px' }}>
              Check in once every 24 hours to advance your streak. Check-ins preserve for up to 48 hours without streak penalty.
            </p>
          </div>

          <div>
            <Button
              variant="primary"
              size="lg"
              disabled={!canClaim}
              isLoading={isClaiming}
              onClick={handleClaimDaily}
              style={{
                background: canClaim ? 'linear-gradient(135deg, #D97706, #FBBF24)' : undefined,
                color: canClaim ? '#07090E' : undefined,
              }}
            >
              {canClaim ? 'Claim Daily Bonus ✨' : `Cooldown (${formatHoursMins(timeUntilNextClaimMs)})`}
            </Button>
          </div>
        </div>
      </Card>

      {/* 7-Day Streak Calendar */}
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px' }}>
          7-Day Progression Track
        </h2>

        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px' }}>
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} height={140} />
            ))}
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 140px), 1fr))',
              gap: '12px',
            }}
          >
            {days.map((day) => {
              const isToday = day.isCurrent;
              return (
                <div
                  key={day.day}
                  style={{
                    background: day.isClaimed
                      ? 'rgba(16, 185, 129, 0.08)'
                      : isToday
                      ? 'linear-gradient(135deg, rgba(2, 132, 199, 0.25), rgba(56, 189, 248, 0.2))'
                      : 'var(--surface-2)',
                    border: day.isClaimed
                      ? '1px solid var(--crystal-emerald)'
                      : isToday
                      ? '2px solid var(--crystal-cyan)'
                      : '1px solid var(--border-subtle)',
                    borderRadius: 'var(--r-md)',
                    padding: '16px 12px',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: isToday ? 'var(--glow-cyan)' : 'var(--shadow-sm)',
                    opacity: day.isLocked ? 0.6 : 1,
                    position: 'relative',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      DAY {day.day}
                    </div>
                    <div style={{ fontSize: '28px', marginBottom: '8px' }}>
                      {day.day === 7 ? '👑' : day.isClaimed ? '✅' : '💎'}
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--crystal-gold)' }}>
                      +{day.coins} 💎
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--crystal-cyan)', fontWeight: 600 }}>
                      +{day.xp} XP
                    </div>
                  </div>

                  <div style={{ marginTop: '12px' }}>
                    <Badge
                      variant={day.isClaimed ? 'emerald' : isToday ? 'cyan' : 'default'}
                      size="sm"
                    >
                      {day.isClaimed ? 'CLAIMED' : isToday ? 'TODAY' : 'LOCKED'}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Level Milestone Tracks */}
      <Card
        surface={1}
        header={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>⭐</span>
            <span>Level Milestone Tracks</span>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {[
            { lvl: 5, coins: 250, title: 'Apprentice Resonator', unlocked: (user?.level || 1) >= 5 },
            { lvl: 10, coins: 500, title: 'Rising Resonator', unlocked: (user?.level || 1) >= 10 },
            { lvl: 15, coins: 800, title: 'Crystal Vanguard', unlocked: (user?.level || 1) >= 15 },
            { lvl: 25, coins: 1500, title: 'Glacial Master', unlocked: (user?.level || 1) >= 25 },
            { lvl: 50, coins: 5000, title: 'Celestial Monarch', unlocked: (user?.level || 1) >= 50 },
          ].map((m) => (
            <div
              key={m.lvl}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                background: 'var(--surface-2)',
                borderRadius: 'var(--r-md)',
                border: m.unlocked ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid var(--border-subtle)',
                opacity: m.unlocked ? 1 : 0.65,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span style={{ fontSize: '24px' }}>{m.unlocked ? '🏆' : '🔒'}</span>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF' }}>
                    Level {m.lvl}: {m.title}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Reward: +{m.coins} Crystals 💎
                  </div>
                </div>
              </div>

              <Badge variant={m.unlocked ? 'emerald' : 'default'} size="sm">
                {m.unlocked ? 'UNLOCKED' : 'IN PROGRESS'}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
