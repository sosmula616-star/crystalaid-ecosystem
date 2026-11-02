import React, { useState, useEffect } from 'react';
import { api } from '../services/apiClient';
import { Card } from '../components/ui/Card';
import { Tabs } from '../components/ui/Tabs';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { LeaderboardEntry } from '@crystalaid/types';

export const LeaderboardPage: React.FC = () => {
  const [period, setPeriod] = useState<string>('all_time');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [topPodium, setTopPodium] = useState<LeaderboardEntry[]>([]);
  const [currentUserEntry, setCurrentUserEntry] = useState<LeaderboardEntry | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLeaderboard() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await api.get<{
          entries: LeaderboardEntry[];
          topPodium: LeaderboardEntry[];
          currentUserEntry: LeaderboardEntry | null;
        }>(`/api/leaderboard?period=${period}`);
        setEntries(data.entries);
        setTopPodium(data.topPodium);
        setCurrentUserEntry(data.currentUserEntry);
      } catch (err: any) {
        setError(err.message || 'Failed to load leaderboard standings');
      } finally {
        setIsLoading(false);
      }
    }
    fetchLeaderboard();
  }, [period]);

  const periodTabs = [
    { id: 'daily', label: 'Daily' },
    { id: 'weekly', label: 'Weekly' },
    { id: 'monthly', label: 'Monthly' },
    { id: 'all_time', label: 'All Time' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)' }}>
            Guild Leaderboard
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Ranking top active members across the server by accumulated XP.
          </p>
        </div>

        <Tabs tabs={periodTabs} activeTab={period} onChange={(p) => setPeriod(p)} />
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <Skeleton height={180} />
            <Skeleton height={180} />
            <Skeleton height={180} />
          </div>
          <Skeleton height={300} />
        </div>
      ) : error ? (
        <EmptyState
          icon="⚠️"
          title="Could not load Leaderboard"
          description={error}
          actionLabel="Retry Loading"
          onAction={() => setPeriod((p) => p)}
        />
      ) : (
        <>
          {/* Top 3 Podium */}
          {topPodium.length > 0 && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
                gap: '16px',
                alignItems: 'end',
              }}
            >
              {/* #2 Silver */}
              {topPodium[1] && (
                <Card
                  surface={2}
                  style={{
                    border: '1px solid rgba(148, 163, 184, 0.4)',
                    boxShadow: '0 0 20px rgba(148, 163, 184, 0.2)',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>🥈</div>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                    <Avatar
                      src={topPodium[1].avatar}
                      alt={topPodium[1].username}
                      size="lg"
                      equippedFrame={topPodium[1].equippedFrame}
                      levelBadge={topPodium[1].level}
                    />
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>
                    {topPodium[1].username}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    Rank #2 • Level {topPodium[1].level}
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--crystal-cyan)', fontFamily: 'var(--font-mono)' }}>
                    {topPodium[1].xp.toLocaleString()} XP
                  </div>
                </Card>
              )}

              {/* #1 Gold Apex */}
              {topPodium[0] && (
                <Card
                  surface={2}
                  glow="gold"
                  style={{
                    border: '1px solid #FBBF24',
                    boxShadow: '0 0 30px rgba(251, 191, 36, 0.35)',
                    textAlign: 'center',
                    transform: 'translateY(-6px)',
                  }}
                >
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>👑 🥇</div>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                    <Avatar
                      src={topPodium[0].avatar}
                      alt={topPodium[0].username}
                      size="xl"
                      equippedFrame={topPodium[0].equippedFrame}
                      levelBadge={topPodium[0].level}
                    />
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#FBBF24', marginBottom: '4px' }}>
                    {topPodium[0].username}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    Apex Champion • Level {topPodium[0].level}
                  </div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: '#FBBF24', fontFamily: 'var(--font-mono)' }}>
                    {topPodium[0].xp.toLocaleString()} XP
                  </div>
                </Card>
              )}

              {/* #3 Bronze */}
              {topPodium[2] && (
                <Card
                  surface={2}
                  style={{
                    border: '1px solid rgba(249, 115, 22, 0.4)',
                    boxShadow: '0 0 20px rgba(249, 115, 22, 0.2)',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>🥉</div>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                    <Avatar
                      src={topPodium[2].avatar}
                      alt={topPodium[2].username}
                      size="lg"
                      equippedFrame={topPodium[2].equippedFrame}
                      levelBadge={topPodium[2].level}
                    />
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>
                    {topPodium[2].username}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    Rank #3 • Level {topPodium[2].level}
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--crystal-cyan)', fontFamily: 'var(--font-mono)' }}>
                    {topPodium[2].xp.toLocaleString()} XP
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Sticky My Rank Pill */}
          {currentUserEntry && (
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.2), rgba(56, 189, 248, 0.15))',
                border: '1px solid var(--border-cyan)',
                borderRadius: 'var(--r-md)',
                padding: '12px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Badge variant="cyan" size="md">
                  YOUR RANK #{currentUserEntry.rank}
                </Badge>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>
                  {currentUserEntry.username} (Level {currentUserEntry.level})
                </div>
              </div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--crystal-cyan)', fontFamily: 'var(--font-mono)' }}>
                {currentUserEntry.xp.toLocaleString()} XP
              </div>
            </div>
          )}

          {/* Responsive Leaderboard: Table on Desktop, Cards on Mobile */}
          <Card surface={1} style={{ padding: 0 }}>
            {/* Desktop Table View */}
            <div className="desktop-leaderboard-table" style={{ width: '100%', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--surface-2)' }}>
                    <th style={{ padding: '14px 20px', fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Rank</th>
                    <th style={{ padding: '14px 20px', fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Member</th>
                    <th style={{ padding: '14px 20px', fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Level</th>
                    <th style={{ padding: '14px 20px', fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Streak</th>
                    <th style={{ padding: '14px 20px', fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', textAlign: 'right' }}>Total XP</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr
                      key={entry.userId}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        background: entry.isCurrentUser ? 'rgba(56, 189, 248, 0.08)' : 'transparent',
                        transition: 'background var(--duration-fast)',
                      }}
                    >
                      <td style={{ padding: '14px 20px', fontWeight: 700, color: entry.rank <= 3 ? '#FBBF24' : 'var(--text-secondary)' }}>
                        #{entry.rank}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <Avatar
                            src={entry.avatar}
                            alt={entry.username}
                            size="sm"
                            equippedFrame={entry.equippedFrame}
                          />
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: entry.isCurrentUser ? 'var(--crystal-cyan)' : 'var(--text-primary)' }}>
                              {entry.username} {entry.isCurrentUser && '(You)'}
                            </div>
                            {entry.equippedBadge && (
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                {entry.equippedBadge.replace('BADGE_', '')}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <Badge variant="cyan" size="sm">
                          LVL {entry.level}
                        </Badge>
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: '13px', color: '#FB923C', fontWeight: 600 }}>
                        🔥 {entry.streak}d
                      </td>
                      <td style={{ padding: '14px 20px', textAlign: 'right', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--crystal-cyan)' }}>
                        {entry.xp.toLocaleString()} XP
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="mobile-leaderboard-cards" style={{ display: 'none', padding: '12px', flexDirection: 'column', gap: '10px' }}>
              {entries.map((entry) => (
                <div
                  key={entry.userId}
                  style={{
                    background: entry.isCurrentUser ? 'rgba(56, 189, 248, 0.12)' : 'var(--surface-2)',
                    border: entry.isCurrentUser ? '1px solid var(--crystal-cyan)' : '1px solid var(--border-subtle)',
                    borderRadius: 'var(--r-md)',
                    padding: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ fontWeight: 800, fontSize: '14px', width: '28px', color: entry.rank <= 3 ? '#FBBF24' : 'var(--text-secondary)' }}>
                      #{entry.rank}
                    </div>
                    <Avatar src={entry.avatar} alt={entry.username} size="sm" equippedFrame={entry.equippedFrame} />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {entry.username}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Level {entry.level} • 🔥 {entry.streak}d
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--crystal-cyan)', fontFamily: 'var(--font-mono)' }}>
                    {entry.xp.toLocaleString()} XP
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {/* Responsive Style */}
      <style>{`
        @media (max-width: 767px) {
          .desktop-leaderboard-table {
            display: none !important;
          }
          .mobile-leaderboard-cards {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
};
