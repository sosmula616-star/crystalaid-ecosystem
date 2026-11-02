import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  surface?: 1 | 2 | 3;
  interactive?: boolean;
  glow?: 'cyan' | 'purple' | 'gold' | 'none';
  header?: React.ReactNode;
  actions?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  surface = 1,
  interactive = false,
  glow = 'none',
  header,
  actions,
  style,
  ...props
}) => {
  const getBg = () => {
    if (surface === 2) return 'var(--surface-2)';
    if (surface === 3) return 'var(--surface-3)';
    return 'var(--surface-1)';
  };

  const getGlowShadow = () => {
    if (glow === 'cyan') return '0 0 20px rgba(56, 189, 248, 0.25)';
    if (glow === 'purple') return '0 0 20px rgba(168, 85, 247, 0.25)';
    if (glow === 'gold') return '0 0 20px rgba(251, 191, 36, 0.25)';
    return 'var(--shadow-sm)';
  };

  return (
    <div
      style={{
        background: getBg(),
        borderRadius: 'var(--r-lg)',
        border: '1px solid var(--border-subtle)',
        boxShadow: getGlowShadow(),
        backdropFilter: 'blur(12px)',
        transition: 'all var(--duration-normal) var(--ease-spring)',
        overflow: 'hidden',
        cursor: interactive ? 'pointer' : 'default',
        ...style,
      }}
      onMouseEnter={(e) => {
        if (interactive) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.borderColor = 'var(--border-cyan)';
          e.currentTarget.style.boxShadow = 'var(--glow-cyan)';
        }
      }}
      onMouseLeave={(e) => {
        if (interactive) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.borderColor = 'var(--border-subtle)';
          e.currentTarget.style.boxShadow = getGlowShadow();
        }
      }}
      {...props}
    >
      {(header || actions) && (
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          {header && <div style={{ fontWeight: 600, fontSize: '16px', color: 'var(--text-primary)' }}>{header}</div>}
          {actions && <div>{actions}</div>}
        </div>
      )}
      <div style={{ padding: '20px' }}>{children}</div>
    </div>
  );
};
