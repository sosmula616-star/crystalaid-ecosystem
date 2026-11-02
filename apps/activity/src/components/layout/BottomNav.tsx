import React from 'react';

interface BottomNavProps {
  activeTab: string;
  onNavigate: (tabId: string) => void;
  onOpenMore: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onNavigate, onOpenMore }) => {
  const primaryMobileTabs = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'activity', label: 'Lounge', icon: '🎮' },
    { id: 'rewards', label: 'Rewards', icon: '🎁' },
    { id: 'leaderboard', label: 'Ranks', icon: '🏆' },
  ];

  return (
    <nav
      style={{
        display: 'none',
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 'calc(60px + env(safe-area-inset-bottom, 0px))',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        background: 'var(--surface-glass)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--border-subtle)',
        zIndex: 90,
        alignItems: 'center',
        justifyContent: 'space-around',
      }}
      className="mobile-bottom-nav"
    >
      {primaryMobileTabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onNavigate(tab.id)}
            style={{
              flex: 1,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              color: isActive ? 'var(--crystal-cyan)' : 'var(--text-secondary)',
              fontSize: '11px',
              fontWeight: isActive ? 700 : 500,
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            <span style={{ fontSize: '18px', filter: isActive ? 'drop-shadow(0 0 6px var(--crystal-cyan))' : 'none' }}>
              {tab.icon}
            </span>
            <span>{tab.label}</span>
          </button>
        );
      })}

      {/* More / Menu Drawer Trigger */}
      <button
        onClick={onOpenMore}
        style={{
          flex: 1,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '3px',
          color: ['profile', 'achievements', 'shop', 'events', 'settings'].includes(activeTab)
            ? 'var(--crystal-cyan)'
            : 'var(--text-secondary)',
          fontSize: '11px',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        <span style={{ fontSize: '18px' }}>☰</span>
        <span>More</span>
      </button>
    </nav>
  );
};
