import React from 'react';

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  badge?: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'activity', label: 'Activity Hub', icon: '🎮', badge: 'LIVE' },
  { id: 'profile', label: 'Profile', icon: '👤' },
  { id: 'leaderboard', label: 'Leaderboard', icon: '🏆' },
  { id: 'rewards', label: 'Daily Rewards', icon: '🎁' },
  { id: 'achievements', label: 'Achievements', icon: '⭐' },
  { id: 'shop', label: 'Crystal Shop', icon: '🛍️' },
  { id: 'events', label: 'Guild Events', icon: '⚡' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

interface SidebarProps {
  activeTab: string;
  onNavigate: (tabId: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onNavigate,
  isCollapsed,
  onToggleCollapse,
}) => {
  return (
    <aside
      style={{
        width: isCollapsed ? '72px' : '240px',
        background: 'var(--surface-1)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '16px 10px',
        transition: 'width var(--duration-normal) var(--ease-spring)',
        flexShrink: 0,
      }}
      className="desktop-sidebar"
    >
      {/* Navigation List */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {NAV_ITEMS.map((item) => {
          const isActive = item.id === activeTab;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: 'var(--r-md)',
                background: isActive
                  ? 'linear-gradient(135deg, rgba(2, 132, 199, 0.25) 0%, rgba(56, 189, 248, 0.2) 100%)'
                  : 'transparent',
                border: isActive
                  ? '1px solid rgba(56, 189, 248, 0.4)'
                  : '1px solid transparent',
                color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all var(--duration-fast)',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                position: 'relative',
              }}
              title={isCollapsed ? item.label : undefined}
            >
              <span style={{ fontSize: '18px', filter: isActive ? 'drop-shadow(0 0 6px var(--crystal-cyan))' : 'none' }}>
                {item.icon}
              </span>

              {!isCollapsed && (
                <span style={{ flex: 1, textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                  {item.label}
                </span>
              )}

              {!isCollapsed && item.badge && (
                <span
                  style={{
                    background: 'var(--crystal-cyan)',
                    color: '#07090E',
                    fontSize: '10px',
                    fontWeight: 800,
                    padding: '2px 6px',
                    borderRadius: 'var(--r-full)',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Collapse Toggle Button */}
      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
        <button
          onClick={onToggleCollapse}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            gap: '10px',
            padding: '8px 12px',
            borderRadius: 'var(--r-md)',
            color: 'var(--text-muted)',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
          }}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          <span>{isCollapsed ? '▶' : '◀'}</span>
          {!isCollapsed && <span>Collapse Sidebar</span>}
        </button>
      </div>
    </aside>
  );
};
