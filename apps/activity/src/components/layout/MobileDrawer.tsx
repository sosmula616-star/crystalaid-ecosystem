import React from 'react';
import { NAV_ITEMS } from './Sidebar';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onNavigate: (tabId: string) => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  onNavigate,
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(7, 9, 14, 0.8)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: 'var(--surface-1)',
          borderTop: '1px solid var(--border-cyan)',
          borderTopLeftRadius: 'var(--r-xl)',
          borderTopRightRadius: 'var(--r-xl)',
          padding: '24px 20px calc(24px + env(safe-area-inset-bottom, 0px))',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 -10px 30px rgba(0, 0, 0, 0.8)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
            All CrystalAid Sections
          </h3>
          <button
            onClick={onClose}
            style={{ fontSize: '18px', color: 'var(--text-secondary)', padding: '4px', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {NAV_ITEMS.map((item) => {
            const isActive = item.id === activeTab;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onClose();
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '16px 8px',
                  borderRadius: 'var(--r-md)',
                  background: isActive ? 'rgba(56, 189, 248, 0.15)' : 'var(--surface-2)',
                  border: isActive ? '1px solid var(--crystal-cyan)' : '1px solid var(--border-subtle)',
                  color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  gap: '8px',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '13px',
                }}
              >
                <span style={{ fontSize: '24px' }}>{item.icon}</span>
                <span style={{ textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
