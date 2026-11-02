import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/apiClient';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { Modal } from '../components/ui/Modal';
import { ActivityType, ActivityParticipant } from '@crystalaid/types';

export const ActivityPage: React.FC = () => {
  const { user, refreshProfile, updateUserBalance } = useAuth();
  const { success, error, info } = useToast();

  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sessionType, setSessionType] = useState<ActivityType>('VOICE_LOUNGE');
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [sessionXp, setSessionXp] = useState<number>(0);
  const [sessionCoins, setSessionCoins] = useState<number>(0);
  const [isStarting, setIsStarting] = useState<boolean>(false);
  const [isEnding, setIsEnding] = useState<boolean>(false);

  // Summary Modal state
  const [summaryData, setSummaryData] = useState<{
    duration: number;
    xp: number;
    coins: number;
  } | null>(null);

  // Participants
  const [participants, setParticipants] = useState<ActivityParticipant[]>([
    {
      id: 'p1',
      username: 'Astraea',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      level: 42,
      joinedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    },
    {
      id: 'p2',
      username: 'Kaelen_Void',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      level: 38,
      joinedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    },
  ]);

  const heartbeatIntervalRef = useRef<any>(null);
  const timerIntervalRef = useRef<any>(null);

  // Start Session
  const handleStartSession = async (type: ActivityType) => {
    setIsStarting(true);
    try {
      const res = await api.post<{ sessionId: string; type: ActivityType }>('/api/activities/session/start', {
        type,
      });
      setActiveSessionId(res.sessionId);
      setSessionType(type);
      setElapsedSeconds(0);
      setSessionXp(0);
      setSessionCoins(0);

      // Add user to participants list
      if (user) {
        setParticipants((prev) => [
          ...prev,
          {
            id: user.id,
            username: `${user.username} (You)`,
            avatar: user.avatar,
            level: user.level,
            joinedAt: new Date().toISOString(),
          },
        ]);
      }

      success(`Joined ${type.replace('_', ' ')} session! XP generation active.`, 'Session Active');
    } catch (err: any) {
      error(err.message || 'Failed to start session');
    } finally {
      setIsStarting(false);
    }
  };

  // Heartbeat & Timer Effects
  useEffect(() => {
    if (!activeSessionId) return;

    // 1-second local timer
    timerIntervalRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    // 20-second heartbeat to server for verified XP gains
    heartbeatIntervalRef.current = setInterval(async () => {
      try {
        const result = await api.post<{
          xpGained: number;
          coinsGained: number;
          totalXp: number;
          level: number;
          leveledUp: boolean;
        }>('/api/activities/session/heartbeat', {
          sessionId: activeSessionId,
        });

        if (result.xpGained > 0) {
          setSessionXp((prev) => prev + result.xpGained);
          setSessionCoins((prev) => prev + result.coinsGained);
          updateUserBalance(result.coinsGained);
        }

        if (result.leveledUp) {
          refreshProfile();
        }
      } catch (err: any) {
        console.warn('Heartbeat error:', err);
      }
    }, 20000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
    };
  }, [activeSessionId, refreshProfile, updateUserBalance]);

  // End Session
  const handleEndSession = async () => {
    if (!activeSessionId) return;
    setIsEnding(true);
    try {
      const summary = await api.post<{
        durationSeconds: number;
        xpEarned: number;
        coinsEarned: number;
      }>('/api/activities/session/end', {
        sessionId: activeSessionId,
      });

      // Clear intervals
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);

      setSummaryData({
        duration: summary.durationSeconds || elapsedSeconds,
        xp: summary.xpEarned || sessionXp,
        coins: summary.coinsEarned || sessionCoins,
      });

      setActiveSessionId(null);
      refreshProfile();
    } catch (err: any) {
      error(err.message || 'Failed to end session');
    } finally {
      setIsEnding(false);
    }
  };

  const formatTimer = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs > 0 ? `${hrs.toString().padStart(2, '0')}:` : ''}${mins
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner / Mode Controller */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)' }}>
            Live Activity Lounge
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Stay active in the session to continuously earn Crystals and Discord guild XP.
          </p>
        </div>
        {activeSessionId && (
          <Badge variant="emerald" size="md">
            ● SESSION IN PROGRESS
          </Badge>
        )}
      </div>

      {/* Active Session Display */}
      {activeSessionId ? (
        <Card
          surface={2}
          glow="cyan"
          style={{
            border: '1px solid var(--border-cyan)',
            background: 'linear-gradient(135deg, rgba(13, 17, 26, 0.95), rgba(20, 27, 41, 0.95))',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '16px',
                borderBottom: '1px solid var(--border-subtle)',
                paddingBottom: '20px',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '24px' }}>
                    {sessionType === 'VOICE_LOUNGE' ? '🎧' : sessionType === 'FOCUS' ? '🎯' : '⚡'}
                  </span>
                  <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#FFFFFF' }}>
                    {sessionType === 'VOICE_LOUNGE'
                      ? 'Voice & Casual Lounge'
                      : sessionType === 'FOCUS'
                      ? 'Deep Focus Chamber'
                      : 'High-Stakes Challenge'}
                  </h2>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Server-side anti-cheat active • Heartbeats synced every 20s
                </div>
              </div>

              <Button variant="danger" size="md" isLoading={isEnding} onClick={handleEndSession}>
                Complete & Claim XP
              </Button>
            </div>

            {/* Metrics Ticker */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '16px',
              }}
            >
              <div
                style={{
                  background: 'var(--surface-3)',
                  padding: '16px',
                  borderRadius: 'var(--r-md)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Session Duration
                </div>
                <div style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--crystal-cyan)' }}>
                  {formatTimer(elapsedSeconds)}
                </div>
              </div>

              <div
                style={{
                  background: 'var(--surface-3)',
                  padding: '16px',
                  borderRadius: 'var(--r-md)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  XP Accrued
                </div>
                <div style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#A855F7' }}>
                  +{sessionXp} XP
                </div>
              </div>

              <div
                style={{
                  background: 'var(--surface-3)',
                  padding: '16px',
                  borderRadius: 'var(--r-md)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Crystals Earned
                </div>
                <div style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--crystal-gold)' }}>
                  +{sessionCoins} 💎
                </div>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        /* Inactive Mode Selectors */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
            gap: '20px',
          }}
        >
          {/* Card 1: Voice Lounge */}
          <Card
            surface={2}
            interactive
            style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
          >
            <div>
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>🎧</div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                Voice & Chat Lounge
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
                Join voice channels or chat casually. Great for ambient background participation.
              </p>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                <Badge variant="cyan" size="sm">30 XP / min</Badge>
                <Badge variant="gold" size="sm">+5 💎 / min</Badge>
              </div>
            </div>
            <Button
              variant="primary"
              size="md"
              isLoading={isStarting}
              onClick={() => handleStartSession('VOICE_LOUNGE')}
            >
              Start Voice Session
            </Button>
          </Card>

          {/* Card 2: Deep Focus */}
          <Card
            surface={2}
            interactive
            style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
          >
            <div>
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>🎯</div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                Deep Focus Chamber
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
                Dedicated study, coding, or gaming session. Boosted XP generation for uninterrupted sessions.
              </p>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                <Badge variant="purple" size="sm">45 XP / min</Badge>
                <Badge variant="gold" size="sm">+8 💎 / min</Badge>
              </div>
            </div>
            <Button
              variant="secondary"
              size="md"
              isLoading={isStarting}
              onClick={() => handleStartSession('FOCUS')}
            >
              Start Focus Session
            </Button>
          </Card>

          {/* Card 3: Challenge */}
          <Card
            surface={2}
            interactive
            style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
          >
            <div>
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>⚡</div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                High-Stakes Challenge
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
                Timed challenge mode with maximum XP yield. Contributes extra score towards active guild events.
              </p>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                <Badge variant="gold" size="sm">60 XP / min</Badge>
                <Badge variant="gold" size="sm">+12 💎 / min</Badge>
              </div>
            </div>
            <Button
              variant="secondary"
              size="md"
              isLoading={isStarting}
              onClick={() => handleStartSession('CHALLENGE')}
            >
              Start Challenge
            </Button>
          </Card>
        </div>
      )}

      {/* Room Participants Section */}
      <Card
        surface={1}
        header={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>👥</span>
            <span>Room Participants ({participants.length})</span>
          </div>
        }
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
          {participants.map((p) => (
            <div
              key={p.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: 'var(--surface-2)',
                padding: '10px 14px',
                borderRadius: 'var(--r-md)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <Avatar src={p.avatar} alt={p.username} size="sm" levelBadge={p.level} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {p.username}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Level {p.level} • Active
                </div>
              </div>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--crystal-emerald)', boxShadow: '0 0 6px var(--crystal-emerald)' }} />
            </div>
          ))}
        </div>
      </Card>

      {/* Session Completion Summary Modal */}
      <Modal
        isOpen={!!summaryData}
        onClose={() => setSummaryData(null)}
        title="🎉 Session Completed!"
        footer={
          <Button variant="primary" onClick={() => setSummaryData(null)}>
            Collect & Continue
          </Button>
        }
      >
        {summaryData && (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ fontSize: '48px' }}>💎</div>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                Outstanding Work, {user?.username}!
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                Your session time has been verified by the server anti-cheat engine.
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                background: 'var(--surface-2)',
                padding: '16px',
                borderRadius: 'var(--r-md)',
              }}
            >
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Duration</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                  {formatTimer(summaryData.duration)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>XP Awarded</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--crystal-cyan)', fontFamily: 'var(--font-mono)' }}>
                  +{summaryData.xp}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Crystals</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--crystal-gold)', fontFamily: 'var(--font-mono)' }}>
                  +{summaryData.coins} 💎
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
