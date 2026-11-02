import React from 'react';

export interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  equippedFrame?: string | null;
  levelBadge?: number;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'User avatar',
  size = 'md',
  equippedFrame,
  levelBadge,
}) => {
  const getDimension = () => {
    if (size === 'sm') return 36;
    if (size === 'lg') return 64;
    if (size === 'xl') return 96;
    return 48; // md
  };

  const dim = getDimension();

  const getFrameStyling = () => {
    if (equippedFrame === 'FRAME_APEX') {
      return {
        boxShadow: '0 0 20px rgba(251, 191, 36, 0.8), inset 0 0 10px rgba(251, 191, 36, 0.5)',
        border: '3px solid #FBBF24',
      };
    }
    if (equippedFrame === 'FRAME_VIOLET') {
      return {
        boxShadow: '0 0 18px rgba(168, 85, 247, 0.75), inset 0 0 8px rgba(168, 85, 247, 0.4)',
        border: '3px solid #A855F7',
      };
    }
    if (equippedFrame === 'FRAME_ICE') {
      return {
        boxShadow: '0 0 16px rgba(56, 189, 248, 0.7), inset 0 0 8px rgba(56, 189, 248, 0.35)',
        border: '3px solid #38BDF8',
      };
    }
    return {
      border: '2px solid var(--border-default)',
      boxShadow: 'var(--shadow-sm)',
    };
  };

  const fallbackInitial = alt ? alt.charAt(0).toUpperCase() : 'C';

  return (
    <div
      style={{
        position: 'relative',
        width: `${dim}px`,
        height: `${dim}px`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          overflow: 'hidden',
          background: 'var(--surface-3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all var(--duration-normal) var(--ease-spring)',
          ...getFrameStyling(),
        }}
      >
        {src ? (
          <img
            src={src}
            alt={alt}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <span style={{ fontWeight: 700, fontSize: `${Math.floor(dim * 0.45)}px`, color: 'var(--crystal-cyan)' }}>
            {fallbackInitial}
          </span>
        )}
      </div>

      {levelBadge !== undefined && (
        <div
          style={{
            position: 'absolute',
            bottom: '-4px',
            right: '-4px',
            background: 'linear-gradient(135deg, #0284C7, #38BDF8)',
            color: '#FFFFFF',
            fontSize: size === 'sm' ? '10px' : '11px',
            fontWeight: 800,
            padding: '2px 6px',
            borderRadius: 'var(--r-full)',
            border: '2px solid var(--surface-1)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
            lineHeight: 1,
          }}
        >
          {levelBadge}
        </div>
      )}
    </div>
  );
};
