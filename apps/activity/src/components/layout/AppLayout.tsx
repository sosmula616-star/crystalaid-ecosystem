import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { MobileDrawer } from './MobileDrawer';

interface AppLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onNavigate: (tabId: string) => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, activeTab, onNavigate }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100dvh',
        width: '100vw',
        overflow: 'hidden',
        background: 'var(--bg-root)',
      }}
    >
      <Header
        activeTab={activeTab}
        onNavigate={onNavigate}
        onToggleMobileMenu={() => setIsMobileDrawerOpen(true)}
      />

      <div
        style={{
          display: 'flex',
          flex: 1,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <Sidebar
          activeTab={activeTab}
          onNavigate={onNavigate}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        />

        <main
          className="main-content-scroll"
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: 'clamp(16px, 3vw, 32px)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '1280px',
              margin: '0 auto',
              flex: 1,
            }}
          >
            {children}
          </div>
        </main>
      </div>

      <BottomNav
        activeTab={activeTab}
        onNavigate={onNavigate}
        onOpenMore={() => setIsMobileDrawerOpen(true)}
      />

      <MobileDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        activeTab={activeTab}
        onNavigate={onNavigate}
      />

      {/* Responsive Media Query Styles */}
      <style>{`
        @media (max-width: 767px) {
          .desktop-sidebar {
            display: none !important;
          }
          .mobile-bottom-nav {
            display: flex !important;
          }
          .mobile-menu-trigger {
            display: block !important;
          }
          .main-content-scroll {
            padding: 16px !important;
            padding-bottom: calc(76px + env(safe-area-inset-bottom, 0px)) !important;
          }
          .guild-badge-header {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
