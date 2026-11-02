import React, { useState, useEffect } from 'react';
import { api } from '../services/apiClient';
import { Card } from '../components/ui/Card';
import { Tabs } from '../components/ui/Tabs';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { AchievementItem, AchievementCategory } from '@crystalaid/types';

export const AchievementsPage: React.FC = () => {
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAchievements() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await api.get<{ achievements: AchievementItem[] }>('/api/achievements');
        setAchievements(data.achievements);
      } catch (err: any) {
        setError(err.message || 'Failed to load achievements');
      } finally {
        setIsLoading(false);
      }
    }
    fetchAchievements();
  }, []);

  const categoryTabs = [
    { id: 'ALL', label: 'All Badges' },
    { id: 'PROGRESSION', label: 'Progression' },
    { id: 'ACTIVITY', label: 'Activity' },
    { id: 'SOCIAL', label: 'Social' },
    { id: 'SECRET', label: 'Secret' },
  ];

  const filtered = achievements.filter((a) => {
    if (activeCategory === 'ALL') return true;
    return a.category === activeCategory;
  });

  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;
  const progressPercent = achievements.length > 0 ? Math.round((unlockedCount / achievements.length) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Overview Card */}
      <Card
        surface={2}
        glow="purple"
        style={{
          border: '1px solid rgba(168, 85, 247, 0.4)',
          background: 'linear-gradient(135deg, rgba(20, 27, 41, 0.95), rgba(46, 16, 101, 0.95))',
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
              <span style={{ fontSize: '28px' }}>⭐</span>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#FFFFFF' }}>
                Server Achievements
              </h1>
              <Badge variant="purple" size="md">
                {unlockedCount} / {achievements.length} UNLOCKED
              </Badge>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '520px' }}>
              Complete milestones across Discord voice lounges, streaks, and community events to earn rare titles and bonus crystals.
            </p>
          </div>

          <div style={{ width: 'clamp(200px, 30vw, 280px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              <span>Total Mastery</span>
              <span style={{ fontWeight: 700, color: 'var(--crystal-purple)' }}>{progressPercent}%</span>
            </div>
            <ProgressBar progressPercent={progressPercent} height={10} colorVariant="purple" />
          </div>
        </div>
      </Card>

      {/* Category Filter Tabs */}
      <div style={{ overflowX: 'auto', paddingBottom: '4px' }}>
        <Tabs
          tabs={categoryTabs}
          activeTab={activeCategory}
          onChange={(cat) => setActiveCategory(cat)}
        />
      </div>

      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} height={160} />
          ))}
        </div>
      ) : error ? (
        <EmptyState
          icon="⚠️"
          title="Could not load Achievements"
          description={error}
          actionLabel="Retry"
          onAction={() => setActiveCategory('ALL')}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="⭐"
          title="No Achievements in this category"
          description="Check back later or view all categories."
          actionLabel="View All"
          onAction={() => setActiveCategory('ALL')}
        />
      ) : (
        /* Achievements Grid */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
            gap: '16px',
          }}
        >
          {filtered.map((ach) => (
            <Card
              key={ach.id}
              surface={ach.isUnlocked ? 2 : 1}
              style={{
                border: ach.isUnlocked ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid var(--border-subtle)',
                boxShadow: ach.isUnlocked ? 'var(--glow-cyan)' : 'var(--shadow-sm)',
                opacity: ach.isUnlocked ? 1 : 0.65,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div
                    style={{
                      fontSize: '32px',
                      background: 'var(--surface-3)',
                      width: '54px',
                      height: '54px',
                      borderRadius: 'var(--r-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid var(--border-default)',
                    }}
                  >
                    {ach.icon}
                  </div>
                  <Badge rarity={ach.rarity} size="sm">
                    {ach.rarity}
                  </Badge>
                </div>

                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  {ach.name}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
                  {ach.description}
                </p>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  <span>Progress</span>
                  <span>{ach.progress} / {ach.maxProgress}</span>
                </div>
                <ProgressBar
                  progressPercent={Math.min(100, Math.round((ach.progress / ach.maxProgress) * 100))}
                  height={6}
                  colorVariant={ach.rarity === 'LEGENDARY' ? 'gold' : ach.rarity === 'EPIC' ? 'purple' : 'cyan'}
                />

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '12px',
                    paddingTop: '10px',
                    borderTop: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--crystal-gold)' }}>
                      +{ach.coinReward} 💎
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--crystal-cyan)' }}>
                      +{ach.xpReward} XP
                    </span>
                  </div>

                  <span style={{ fontSize: '12px', fontWeight: 700, color: ach.isUnlocked ? 'var(--crystal-emerald)' : 'var(--text-muted)' }}>
                    {ach.isUnlocked ? 'UNLOCKED ✅' : 'LOCKED 🔒'}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
