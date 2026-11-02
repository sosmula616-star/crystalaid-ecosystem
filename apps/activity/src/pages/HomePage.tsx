import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { StatCard } from '../components/ui/StatCard';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';

interface HomePageProps {
  onNavigate: (tabId: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { user, guild, isLoading } = useAuth();

  if (isLoading || !user) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <Skeleton height={180} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          <Skeleton height={90} />
          <Skeleton height={90} />
          <Skeleton height={90} />
        </div>
        <Skeleton height={240} />
      </div>
    );
  }

  const hoursLogged = (user.totalTimeSeconds / 3600).toFixed(1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Hero Welcome Banner */}
      <Card
        surface={2}
        glow="cyan"
        style={{
          background: 'linear-gradient(135deg, rgba(13, 17, 26, 0.95) 0%, rgba(20, 27, 41, 0.95) 100%)',
          border: '1px solid var(--border-cyan)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', minWidth: '280px' }}>
            <Avatar
              src={user.avatar}
              alt={user.username}
              size="xl"
              equippedFrame={user.equippedFrame}
              levelBadge={user.level}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <h1 style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, color: '#FFFFFF' }}>
                  Welcome, {user.username}
                </h1>
                <Badge variant="cyan" size="sm">
                  LVL {user.level}
                </Badge>
              </div>

              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                {guild?.name || 'CrystalAid Sanctuary'} • Role: <strong style={{ color: 'var(--crystal-cyan)' }}>{user.role}</strong>
              </p>

              {/* Level XP Progress Bar */}
              <div style={{ width: 'clamp(220px, 40vw, 360px)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  <span>Progression to Level {user.level + 1}</span>
                  <span style={{ fontWeight: 700, color: 'var(--crystal-cyan)' }}>
                    {user.xp.toLocaleString()} / {user.nextLevelXp.toLocaleString()} XP
                  </span>
                </div>
                <ProgressBar progressPercent={user.levelProgressPercent} height={10} colorVariant="cyan" />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '200px' }}>
            <Button
              variant="primary"
              size="lg"
              leftIcon={<span>🎮</span>}
              onClick={() => onNavigate('activity')}
            >
              Start Lounge Session
            </Button>
            <Button
              variant="secondary"
              size="md"
              leftIcon={<span>🎁</span>}
              onClick={() => onNavigate('rewards')}
            >
              {user.canClaimDaily ? 'Claim Daily Bonus 🔥' : 'Check Daily Streak'}
            </Button>
          </div>
        </div>
      </Card>

      {/* 4 Key Stat Cards */}
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
          subtitle="Spend in the Crystal Shop"
          glow="cyan"
        />
        <StatCard
          icon="🔥"
          label="Current Streak"
          value={`${user.currentStreak} Days`}
          subtitle={user.canClaimDaily ? 'Ready to claim today!' : 'Claimed for today'}
          glow="gold"
        />
        <StatCard
          icon="⚡"
          label="Total Guild XP"
          value={`${user.xp.toLocaleString()}`}
          subtitle={`Level ${user.level} Resonator`}
          glow="purple"
        />
        <StatCard
          icon="⏱️"
          label="Active Time"
          value={`${hoursLogged} hrs`}
          subtitle={`${user.totalActivitiesCount} completed sessions`}
        />
      </div>

      {/* Quick Access Grid: Live Event Spotlight + Daily Streak Preview */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))',
          gap: '20px',
        }}
      >
        {/* Live Guild Event Card */}
        <Card
          surface={1}
          header={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>⚡</span>
              <span>Active Community Event</span>
            </div>
          }
          actions={
            <Button variant="ghost" size="sm" onClick={() => onNavigate('events')}>
              View Details →
            </Button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Crystal Resonance Overdrive
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Guild challenge! Pool session XP with fellow members to hit 50,000 XP and unlock a server-wide +50% XP boost.
            </p>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                <span>Guild Progress</span>
                <span style={{ fontWeight: 700, color: 'var(--crystal-cyan)' }}>63% (31,450 / 50,000 XP)</span>
              </div>
              <ProgressBar progressPercent={63} height={8} colorVariant="cyan" />
            </div>
          </div>
        </Card>

        {/* Daily Streak Check-in Preview */}
        <Card
          surface={1}
          header={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🎁</span>
              <span>Daily Rewards Program</span>
            </div>
          }
          actions={
            <Button variant="ghost" size="sm" onClick={() => onNavigate('rewards')}>
              Open Calendar →
            </Button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Status</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: user.canClaimDaily ? 'var(--crystal-emerald)' : '#FB923C' }}>
                  {user.canClaimDaily ? '✨ Claim Available Now!' : `🔥 ${user.currentStreak} Day Streak Locked In`}
                </div>
              </div>
              <Button
                variant={user.canClaimDaily ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => onNavigate('rewards')}
              >
                {user.canClaimDaily ? 'Claim Bonus' : 'View Calendar'}
              </Button>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              Maintain consecutive daily check-ins to unlock rare cosmetics, title badges, and the Day 7 Celestial Jackpot.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
