import React from 'react';

export interface ProgressBarProps {
  progressPercent: number;
  height?: number;
  showLabel?: boolean;
  colorVariant?: 'cyan' | 'purple' | 'gold' | 'flame';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progressPercent,
  height = 8,
  showLabel = false,
  colorVariant = 'cyan',
}) => {
  const clamped = Math.min(100, Math.max(0, progressPercent));

  const getGradient = () => {
    if (colorVariant === 'purple') return 'linear-gradient(90deg, #7C3AED 0%, #A855F7 100%)';
    if (colorVariant === 'gold') return 'linear-gradient(90deg, #D97706 0%, #FBBF24 100%)';
    if (colorVariant === 'flame') return 'linear-gradient(90deg, #EA580C 0%, #F97316 100%)';
    return 'linear-gradient(90deg, #0284C7 0%, #38BDF8 100%)';
  };

  const getGlow = () => {
    if (colorVariant === 'purple') return '0 0 10px rgba(168, 85, 247, 0.6)';
    if (colorVariant === 'gold') return '0 0 10px rgba(251, 191, 36, 0.6)';
    if (colorVariant === 'flame') return '0 0 10px rgba(249, 115, 22, 0.6)';
    return '0 0 10px rgba(56, 189, 248, 0.6)';
  };

  return (
    <div style={{ width: '100%' }}>
      {showLabel && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '12px',
            color: 'var(--text-secondary)',
            marginBottom: '4px',
            fontWeight: 600,
          }}
        >
          <span>Progress</span>
          <span>{clamped}%</span>
        </div>
      )}
      <div
        style={{
          width: '100%',
          height: `${height}px`,
          background: 'var(--surface-3)',
          borderRadius: 'var(--r-full)',
          overflow: 'hidden',
          border: '1px solid var(--border-subtle)',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: `${clamped}%`,
            height: '100%',
            background: getGradient(),
            borderRadius: 'var(--r-full)',
            boxShadow: getGlow(),
            transition: 'width 0.4s var(--ease-spring)',
            position: 'relative',
          }}
        />
      </div>
    </div>
  );
};
