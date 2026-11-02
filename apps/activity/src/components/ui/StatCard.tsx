import React from 'react';
import { Card } from './Card';

export interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtitle?: string;
  glow?: 'cyan' | 'purple' | 'gold' | 'none';
  trend?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  subtitle,
  glow = 'none',
  trend,
}) => {
  return (
    <Card surface={2} glow={glow} style={{ padding: '0px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--r-md)',
            background: 'var(--surface-3)',
            border: '1px solid var(--border-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
            flexShrink: 0,
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '4px',
            }}
          >
            {label}
          </div>
          <div
            style={{
              fontSize: '22px',
              fontWeight: 800,
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-sans)',
              display: 'flex',
              alignItems: 'baseline',
              gap: '8px',
            }}
          >
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {value}
            </span>
            {trend && (
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--crystal-emerald)' }}>
                {trend}
              </span>
            )}
          </div>
          {subtitle && (
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              {subtitle}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
