import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/apiClient';
import { Card } from '../components/ui/Card';
import { StatCard } from '../components/ui/StatCard';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Skeleton } from '../components/ui/Skeleton';
import { AchievementItem } from '@crystalaid/types';

interface ProfilePageProps {
  onNavigate: (tabId: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  const { user, guild, isLoading } = useAuth();
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [loadingAch, setLoadingAch] = useState(true);

  useEffect(() => {
    async function fetchAchievements() {
      try {
        const res = await api.get<{ achievements: AchievementItem[] }>('/api/achievements');
        setAchievements(res.achievements);
      } catch (err) {
        console.warn('Failed to load profile achievements:', err);
      } finally {
        setLoadingAch(false);
      }
    }
    fetchAchievements();
  }, []);

  if (isLoading || !user) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <Skeleton height={220} />
        <Skeleton height={120} />
      </div>
    );
  }

  const hoursLogged = (user.totalTimeSeconds / 3600).toFixed(1);
  const unlockedAch = achievements.filter((a) => a.isUnlocked);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Profile Header Card */}
      <Card
        surface={2}
        glow="cyan"
        style={{
          padding: 0,
          border: '1px solid var(--border-cyan)',
          position: 'relative',
        }}
      >
        {/* Banner Graphic */}
        <div
          style={{
            height: '140px',
            background: 'linear-gradient(135deg, #0284C7 0%, #1E1B4B 60%, #07090E 100%)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(circle at 70% 30%, rgba(56, 189, 248, 0.4) 0%, transparent 60%)',
            }}
          />
        </div>

        {/* Profile Info Overlay */}
        <div
          style={{
            padding: '0 24px 24px',
            marginTop: '-48px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: '20px',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px' }}>
            <Avatar
              src={user.avatar}
              alt={user.username}
              size="xl"
              equippedFrame={user.equippedFrame}
              levelBadge={user.level}
            />
            <div style={{ marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#FFFFFF' }}>
                  {user.username}
                </h1>
                <Badge variant="cyan" size="sm">
                  {user.role}
                </Badge>
                {user.equippedBadge && (
                  <Badge variant="purple" size="sm">
                    {user.equippedBadge.replace('BADGE_', '')}
                  </Badge>
                )}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Discord ID: <span style={{ fontFamily: 'var(--font-mono)' }}>{user.discordId}</span> • Guild: {guild?.name}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Button variant="secondary" size="md" onClick={() => onNavigate('shop')}>
              Customize Frame 🎨
            </Button>
            <Button variant="primary" size="md" onClick={() => onNavigate('activity')}>
              Join Session 🎮
            </Button>
          </div>
        </div>

        {/* Level Progression Bar on Profile */}
        <div style={{ padding: '0 24px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
            <span>
              Level <strong>{user.level}</strong> Resonator
            </span>
            <span style={{ fontWeight: 700, color: 'var(--crystal-cyan)' }}>
              {user.xp.toLocaleString()} / {user.nextLevelXp.toLocaleString()} XP ({user.levelProgressPercent}%)
            </span>
          </div>
          <ProgressBar progressPercent={user.levelProgressPercent} height={10} colorVariant="cyan" />
        </div>
      </Card>

      {/* 4 Stats Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
          gap: '16px',
        }}
      >
        <StatCard
          icon="💎"
          label="Crystals Balance"
          value={`${user.coins.toLocaleString()} 💎`}
          subtitle="Earned from sessions & streaks"
          glow="gold"
        />
        <StatCard
          icon="🔥"
          label="Consecutive Streak"
          value={`${user.currentStreak} Days`}
          subtitle="Unbroken activity streak"
          glow="cyan"
        />
        <StatCard
          icon="⭐"
          label="Achievements"
          value={`${unlockedAch.length} / ${achievements.length || 9}`}
          subtitle="Badges unlocked"
          glow="purple"
        />
        <StatCard
          icon="⏱️"
          label="Total Active Time"
          value={`${hoursLogged} hrs`}
          subtitle={`${user.totalActivitiesCount} recorded sessions`}
        />
      </div>

      {/* Cosmetics & Achievements Showcase */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))',
          gap: '20px',
        }}
      >
        {/* Equipped Cosmetics Card */}
        <Card
          surface={1}
          header={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🎨</span>
              <span>Equipped Cosmetics</span>
            </div>
          }
          actions={
            <Button variant="ghost" size="sm" onClick={() => onNavigate('shop')}>
              Open Shop →
            </Button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: 'var(--surface-2)',
                borderRadius: 'var(--r-md)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '20px' }}>🖼️</span>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Avatar Frame
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {user.equippedFrame ? user.equippedFrame.replace('FRAME_', '') : 'Default Neutral'}
                  </div>
                </div>
              </div>
              <Badge variant={user.equippedFrame ? 'cyan' : 'default'} size="sm">
                {user.equippedFrame ? 'EQUIPPED' : 'STANDARD'}
              </Badge>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: 'var(--surface-2)',
                borderRadius: 'var(--r-md)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '20px' }}>🏷️</span>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Title Badge
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {user.equippedBadge ? user.equippedBadge.replace('BADGE_', '') : 'None'}
                  </div>
                </div>
              </div>
              <Badge variant={user.equippedBadge ? 'purple' : 'default'} size="sm">
                {user.equippedBadge ? 'EQUIPPED' : 'NONE'}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Unlocked Achievements Preview Card */}
        <Card
          surface={1}
          header={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>⭐</span>
              <span>Achievements Showcase</span>
            </div>
          }
          actions={
            <Button variant="ghost" size="sm" onClick={() => onNavigate('achievements')}>
              View All ({achievements.length}) →
            </Button>
          }
        >
          {loadingAch ? (
            <Skeleton height={100} />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
              {achievements.slice(0, 4).map((ach) => (
                <div
                  key={ach.id}
                  style={{
                    background: 'var(--surface-2)',
                    padding: '12px',
                    borderRadius: 'var(--r-md)',
                    border: '1px solid var(--border-subtle)',
                    textAlign: 'center',
                    opacity: ach.isUnlocked ? 1 : 0.45,
                  }}
                >
                  <div style={{ fontSize: '24px', marginBottom: '6px' }}>{ach.icon}</div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {ach.name}
                  </div>
                  <Badge rarity={ach.rarity} size="sm" style={{ marginTop: '6px' }}>
                    {ach.rarity}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
