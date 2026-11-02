import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui/Avatar';

interface HeaderProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onNavigate, onToggleMobileMenu }) => {
  const { user, guild } = useAuth();

  return (
    <header
      style={{
        height: '64px',
        padding: '0 20px',
        background: 'var(--surface-glass)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        gap: '12px',
      }}
    >
      {/* Left: Hamburger (mobile) + Logo & Guild */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button
          onClick={onToggleMobileMenu}
          aria-label="Toggle navigation menu"
          style={{
            display: 'none',
            fontSize: '20px',
            color: 'var(--text-primary)',
            padding: '6px',
            borderRadius: 'var(--r-sm)',
            cursor: 'pointer',
          }}
          className="mobile-menu-trigger"
        >
          ☰
        </button>

        <div
          onClick={() => onNavigate('home')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <img
            src="/crystalaid-logo.png"
            alt="CrystalAid Logo"
            style={{
              width: '32px',
              height: '32px',
              objectFit: 'contain',
              filter: 'drop-shadow(0 0 8px rgba(56, 189, 248, 0.6))',
            }}
          />
          <span
            style={{
              fontSize: '17px',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, #FFFFFF 0%, #38BDF8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            CrystalAid
          </span>
        </div>

        {/* Guild Badge */}
        {guild && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--surface-2)',
              padding: '4px 10px',
              borderRadius: 'var(--r-full)',
              border: '1px solid var(--border-subtle)',
              fontSize: '12px',
              fontWeight: 500,
              color: 'var(--text-secondary)',
            }}
            className="guild-badge-header"
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: 'var(--crystal-emerald)',
                boxShadow: '0 0 6px var(--crystal-emerald)',
              }}
            />
            <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {guild.name}
            </span>
          </div>
        )}
      </div>

      {/* Right: Currency, Streak, User profile trigger */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Streak Pill */}
        {user && (
          <button
            onClick={() => onNavigate('rewards')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              background: 'rgba(249, 115, 22, 0.12)',
              border: '1px solid rgba(249, 115, 22, 0.35)',
              padding: '5px 10px',
              borderRadius: 'var(--r-full)',
              color: '#FB923C',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'transform var(--duration-fast)',
            }}
            title="Active Daily Streak"
          >
            <span>🔥</span>
            <span>{user.currentStreak}d</span>
          </button>
        )}

        {/* Currency Crystals Pill */}
        {user && (
          <button
            onClick={() => onNavigate('shop')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(56, 189, 248, 0.12)',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              padding: '5px 12px',
              borderRadius: 'var(--r-full)',
              color: '#38BDF8',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'transform var(--duration-fast)',
            }}
            title="Crystals Balance - Open Shop"
          >
            <span>💎</span>
            <span>{user.coins.toLocaleString()}</span>
          </button>
        )}

        {/* User Mini Avatar Trigger */}
        {user && (
          <div
            onClick={() => onNavigate('profile')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              padding: '2px',
            }}
            title="View Your Profile"
          >
            <Avatar
              src={user.avatar}
              alt={user.username}
              size="sm"
              equippedFrame={user.equippedFrame}
              levelBadge={user.level}
            />
          </div>
        )}
      </div>
    </header>
  );
};
