import React from 'react';

export interface TabOption<T extends string = string> {
  id: T;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}

export interface TabsProps<T extends string = string> {
  tabs: TabOption<T>[];
  activeTab: T;
  onChange: (tabId: T) => void;
  size?: 'sm' | 'md';
}

export function Tabs<T extends string = string>({
  tabs,
  activeTab,
  onChange,
  size = 'md',
}: TabsProps<T>) {
  const pad = size === 'sm' ? '6px 12px' : '8px 16px';
  const fz = size === 'sm' ? '12px' : '14px';

  return (
    <div
      role="tablist"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: 'var(--surface-2)',
        padding: '4px',
        borderRadius: 'var(--r-md)',
        border: '1px solid var(--border-subtle)',
        gap: '4px',
        overflowX: 'auto',
        maxWidth: '100%',
      }}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: pad,
              fontSize: fz,
              fontWeight: isActive ? 700 : 500,
              color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
              background: isActive
                ? 'linear-gradient(135deg, #0284C7 0%, #38BDF8 100%)'
                : 'transparent',
              borderRadius: 'var(--r-sm)',
              boxShadow: isActive ? 'var(--glow-cyan)' : 'none',
              transition: 'all var(--duration-fast) var(--ease-spring)',
              whiteSpace: 'nowrap',
            }}
          >
            {tab.icon && <span>{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                style={{
                  background: isActive ? 'rgba(255, 255, 255, 0.25)' : 'var(--surface-3)',
                  padding: '1px 6px',
                  borderRadius: 'var(--r-full)',
                  fontSize: '11px',
                  fontWeight: 700,
                }}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
