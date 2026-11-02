import React, { useState, useEffect } from 'react';
import { api } from '../services/apiClient';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Skeleton } from '../components/ui/Skeleton';
import { GuildCommunityEvent } from '@crystalaid/types';

interface EventsPageProps {
  onNavigate: (tabId: string) => void;
}

export const EventsPage: React.FC<EventsPageProps> = ({ onNavigate }) => {
  const [event, setEvent] = useState<GuildCommunityEvent | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [remainingSecs, setRemainingSecs] = useState<number>(3 * 24 * 3600);

  useEffect(() => {
    async function fetchEvent() {
      setIsLoading(true);
      try {
        const data = await api.get<GuildCommunityEvent>('/api/events/active');
        setEvent(data);
        setRemainingSecs(data.remainingSeconds);
      } catch (err: any) {
        console.warn('Failed to load events:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchEvent();
  }, []);

  // 1-second countdown interval
  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingSecs((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (totalSecs: number) => {
    const days = Math.floor(totalSecs / (3600 * 24));
    const hours = Math.floor((totalSecs % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;
    return { days, hours, minutes, seconds };
  };

  const cd = formatCountdown(remainingSecs);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)' }}>
          Guild Community Challenges
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          Collaborate with your server members to unlock collective rewards, badges, and multipliers.
        </p>
      </div>

      {isLoading || !event ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Skeleton height={260} />
          <Skeleton height={180} />
        </div>
      ) : (
        <>
          {/* Active Event Hero Card */}
          <Card
            surface={2}
            glow="cyan"
            style={{
              border: '1px solid var(--border-cyan)',
              background: 'linear-gradient(135deg, rgba(20, 27, 41, 0.95), rgba(2, 132, 199, 0.25))',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '28px' }}>⚡</span>
                    <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#FFFFFF' }}>
                      {event.title}
                    </h2>
                    <Badge variant="cyan" size="md">
                      ACTIVE EVENT
                    </Badge>
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '600px', lineHeight: 1.5 }}>
                    {event.description}
                  </p>
                </div>

                {/* Live Countdown Display */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[
                    { val: cd.days, label: 'DAYS' },
                    { val: cd.hours, label: 'HRS' },
                    { val: cd.minutes, label: 'MIN' },
                    { val: cd.seconds, label: 'SEC' },
                  ].map((unit, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: 'var(--surface-3)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--r-md)',
                        padding: '8px 12px',
                        textAlign: 'center',
                        minWidth: '54px',
                      }}
                    >
                      <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--crystal-cyan)', fontFamily: 'var(--font-mono)' }}>
                        {unit.val.toString().padStart(2, '0')}
                      </div>
                      <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)' }}>
                        {unit.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Guild Collective Progress Bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  <span>Guild Collective Milestone</span>
                  <span style={{ fontWeight: 800, color: 'var(--crystal-cyan)', fontFamily: 'var(--font-mono)' }}>
                    {event.currentXp.toLocaleString()} / {event.targetXp.toLocaleString()} XP ({event.progressPercent}%)
                  </span>
                </div>
                <ProgressBar progressPercent={event.progressPercent} height={12} colorVariant="cyan" />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="primary" size="md" onClick={() => onNavigate('activity')}>
                  Contribute in Lounge Session 🎮
                </Button>
              </div>
            </div>
          </Card>

          {/* Reward Tiers */}
          <Card
            surface={1}
            header={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🎁</span>
                <span>Event Reward Milestones</span>
              </div>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { threshold: '10,000 XP', reward: '+200 Crystals 💎', status: 'COMPLETED ✅', unlocked: true },
                { threshold: '25,000 XP', reward: '+350 Crystals 💎', status: 'COMPLETED ✅', unlocked: true },
                { threshold: '50,000 XP (Final Goal)', reward: '+50% Server XP Boost for 7 Days + "Overdrive Survivor" Badge', status: 'IN PROGRESS ⏳', unlocked: false },
              ].map((tier, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    background: 'var(--surface-2)',
                    borderRadius: 'var(--r-md)',
                    border: tier.unlocked ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-subtle)',
                    opacity: tier.unlocked ? 1 : 0.75,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <span style={{ fontSize: '22px' }}>{tier.unlocked ? '✅' : '🔒'}</span>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF' }}>
                        Milestone: {tier.threshold}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--crystal-cyan)' }}>
                        {tier.reward}
                      </div>
                    </div>
                  </div>

                  <Badge variant={tier.unlocked ? 'emerald' : 'cyan'} size="sm">
                    {tier.status}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
};
