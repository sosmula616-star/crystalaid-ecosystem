import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  style,
  className = '',
  ...props
}) => {
  const getPadding = () => {
    if (size === 'sm') return '6px 12px';
    if (size === 'lg') return '14px 24px';
    return '10px 18px';
  };

  const getFontSize = () => {
    if (size === 'sm') return '13px';
    if (size === 'lg') return '16px';
    return '14px';
  };

  const getBackground = () => {
    if (variant === 'primary') {
      return 'linear-gradient(135deg, #0284C7 0%, #38BDF8 100%)';
    }
    if (variant === 'danger') {
      return 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)';
    }
    if (variant === 'secondary') {
      return 'var(--surface-2)';
    }
    return 'transparent'; // ghost
  };

  const getBorder = () => {
    if (variant === 'secondary') return '1px solid var(--border-default)';
    if (variant === 'ghost') return '1px solid transparent';
    return '1px solid rgba(255, 255, 255, 0.2)';
  };

  const getColor = () => {
    if (variant === 'primary' || variant === 'danger') return '#FFFFFF';
    if (variant === 'ghost') return 'var(--text-secondary)';
    return 'var(--text-primary)';
  };

  const getBoxShadow = () => {
    if (variant === 'primary') return 'var(--glow-cyan)';
    if (variant === 'danger') return '0 0 16px rgba(239, 68, 68, 0.35)';
    return 'var(--shadow-sm)';
  };

  return (
    <button
      disabled={disabled || isLoading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: getPadding(),
        fontSize: getFontSize(),
        fontWeight: 600,
        borderRadius: 'var(--r-md)',
        background: getBackground(),
        border: getBorder(),
        color: getColor(),
        boxShadow: getBoxShadow(),
        cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all var(--duration-fast) var(--ease-spring)',
        transform: 'scale(1)',
        userSelect: 'none',
        whiteSpace: 'nowrap',
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!disabled && !isLoading) {
          e.currentTarget.style.transform = 'translateY(-1px) scale(1.02)';
          if (variant === 'secondary') {
            e.currentTarget.style.borderColor = 'var(--crystal-cyan)';
            e.currentTarget.style.background = 'var(--surface-3)';
          } else if (variant === 'ghost') {
            e.currentTarget.style.background = 'var(--surface-hover)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !isLoading) {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          if (variant === 'secondary') {
            e.currentTarget.style.borderColor = 'var(--border-default)';
            e.currentTarget.style.background = 'var(--surface-2)';
          } else if (variant === 'ghost') {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }
        }
      }}
      onMouseDown={(e) => {
        if (!disabled && !isLoading) {
          e.currentTarget.style.transform = 'translateY(1px) scale(0.98)';
        }
      }}
      onMouseUp={(e) => {
        if (!disabled && !isLoading) {
          e.currentTarget.style.transform = 'translateY(-1px) scale(1.02)';
        }
      }}
      {...props}
    >
      {isLoading ? (
        <span
          style={{
            display: 'inline-block',
            width: '16px',
            height: '16px',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderTopColor: '#FFFFFF',
            borderRadius: '50%',
            animation: 'shimmer 0.6s linear infinite',
          }}
        />
      ) : (
        leftIcon
      )}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
};
