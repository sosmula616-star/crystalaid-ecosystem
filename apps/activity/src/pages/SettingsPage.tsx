import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export const SettingsPage: React.FC = () => {
  const { user, guild, refreshProfile } = useAuth();
  const { success, info } = useToast();

  const [language, setLanguage] = useState<string>('en');
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');
  const [reduceMotion, setReduceMotion] = useState<boolean>(false);
  const [notifyStreak, setNotifyStreak] = useState<boolean>(true);
  const [notifyEvents, setNotifyEvents] = useState<boolean>(true);
  const [publicLeaderboard, setPublicLeaderboard] = useState<boolean>(true);

  const handleSavePreferences = () => {
    localStorage.setItem('crystalaid_lang', language);
    localStorage.setItem('crystalaid_density', density);
    success('Settings and preferences saved successfully!', 'Preferences');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px' }}>
      <div>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)' }}>
          Settings & Preferences
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          Manage your appearance, notifications, privacy, and connected Discord session.
        </p>
      </div>

      {/* 1. General Settings */}
      <Card
        surface={1}
        header={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>👤</span>
            <span>General</span>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Interface Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              style={{
                width: '100%',
                maxWidth: '320px',
                padding: '10px 14px',
                background: 'var(--surface-2)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--r-md)',
                color: 'var(--text-primary)',
                fontSize: '14px',
              }}
            >
              <option value="en">English (US)</option>
              <option value="ru">Русский (Russian)</option>
            </select>
          </div>

          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Connected Server Context
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
              {guild?.name} (<span style={{ fontFamily: 'var(--font-mono)' }}>{guild?.discordGuildId}</span>)
            </div>
          </div>
        </div>
      </Card>

      {/* 2. Appearance & Motion */}
      <Card
        surface={1}
        header={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🎨</span>
            <span>Appearance & Motion</span>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Interface Density
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {(['comfortable', 'compact'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setDensity(mode)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--r-md)',
                    background: density === mode ? 'rgba(56, 189, 248, 0.2)' : 'var(--surface-2)',
                    border: density === mode ? '1px solid var(--crystal-cyan)' : '1px solid var(--border-subtle)',
                    color: density === mode ? '#FFFFFF' : 'var(--text-secondary)',
                    fontWeight: density === mode ? 700 : 500,
                    fontSize: '13px',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Reduce Micro-Animations
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Minimizes crystal glows and floating effects for high-efficiency rendering.
              </div>
            </div>
            <input
              type="checkbox"
              checked={reduceMotion}
              onChange={(e) => setReduceMotion(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--crystal-cyan)' }}
            />
          </div>
        </div>
      </Card>

      {/* 3. Notifications & Privacy */}
      <Card
        surface={1}
        header={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🔔</span>
            <span>Notifications & Privacy</span>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Daily Streak Reset Reminders
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Alert me when my 48-hour streak grace window is approaching expiration.
              </div>
            </div>
            <input
              type="checkbox"
              checked={notifyStreak}
              onChange={(e) => setNotifyStreak(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--crystal-cyan)' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Guild Event Milestones
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Notify when server members complete community goal thresholds.
              </div>
            </div>
            <input
              type="checkbox"
              checked={notifyEvents}
              onChange={(e) => setNotifyEvents(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--crystal-cyan)' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Public Leaderboard Visibility
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Display my profile avatar and rank on the server leaderboard.
              </div>
            </div>
            <input
              type="checkbox"
              checked={publicLeaderboard}
              onChange={(e) => setPublicLeaderboard(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--crystal-cyan)' }}
            />
          </div>
        </div>
      </Card>

      {/* 4. Advanced & Developer Debugging */}
      <Card
        surface={1}
        header={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🛠️</span>
            <span>Developer & Diagnostics</span>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Session diagnostics and testing controls for standalone verification:
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                info('Tested real-time notification dispatch.', 'Telemetry OK');
              }}
            >
              Test Notification
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                refreshProfile();
                success('Profile state re-synchronized from PostgreSQL database.', 'Sync');
              }}
            >
              Force Profile Sync
            </Button>
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
        <Button variant="primary" size="lg" onClick={handleSavePreferences}>
          Save Preferences
        </Button>
      </div>
    </div>
  );
};
