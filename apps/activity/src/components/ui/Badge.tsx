import React from 'react';
import { Rarity } from '@crystalaid/types';

export interface BadgeProps {
  children: React.ReactNode;
  rarity?: Rarity;
  variant?: 'cyan' | 'purple' | 'gold' | 'emerald' | 'flame' | 'default';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  style?: React.CSSProperties;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  rarity,
  variant,
  size = 'md',
  icon,
  style,
}) => {
  const getStyle = () => {
    const active = rarity || variant;

    if (active === 'LEGENDARY' || active === 'gold') {
      return {
        background: 'rgba(251, 191, 36, 0.12)',
        color: '#FBBF24',
        border: '1px solid rgba(251, 191, 36, 0.4)',
        boxShadow: '0 0 10px rgba(251, 191, 36, 0.2)',
      };
    }
    if (active === 'EPIC' || active === 'purple') {
      return {
        background: 'rgba(168, 85, 247, 0.12)',
        color: '#C084FC',
        border: '1px solid rgba(168, 85, 247, 0.4)',
        boxShadow: '0 0 10px rgba(168, 85, 247, 0.2)',
      };
    }
    if (active === 'RARE' || active === 'cyan') {
      return {
        background: 'rgba(56, 189, 248, 0.12)',
        color: '#38BDF8',
        border: '1px solid rgba(56, 189, 248, 0.4)',
        boxShadow: '0 0 10px rgba(56, 189, 248, 0.2)',
      };
    }
    if (active === 'flame') {
      return {
        background: 'rgba(249, 115, 22, 0.14)',
        color: '#FB923C',
        border: '1px solid rgba(249, 115, 22, 0.4)',
        boxShadow: '0 0 10px rgba(249, 115, 22, 0.2)',
      };
    }
    if (active === 'emerald') {
      return {
        background: 'rgba(16, 185, 129, 0.12)',
        color: '#34D399',
        border: '1px solid rgba(16, 185, 129, 0.4)',
      };
    }
    return {
      background: 'var(--surface-3)',
      color: 'var(--text-secondary)',
      border: '1px solid var(--border-default)',
    };
  };

  const pad = size === 'sm' ? '2px 8px' : '4px 10px';
  const fz = size === 'sm' ? '11px' : '12px';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: pad,
        fontSize: fz,
        fontWeight: 700,
        borderRadius: 'var(--r-full)',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        lineHeight: 1.2,
        ...getStyle(),
        ...style,
      }}
    >
      {icon && <span>{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
