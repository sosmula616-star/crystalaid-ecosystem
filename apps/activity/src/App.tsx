import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { AppLayout } from './components/layout/AppLayout';

import { HomePage } from './pages/HomePage';
import { ActivityPage } from './pages/ActivityPage';
import { ProfilePage } from './pages/ProfilePage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { RewardsPage } from './pages/RewardsPage';
import { AchievementsPage } from './pages/AchievementsPage';
import { ShopPage } from './pages/ShopPage';
import { EventsPage } from './pages/EventsPage';
import { SettingsPage } from './pages/SettingsPage';

function ActivityMain() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const { error } = useAuth();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage onNavigate={(t) => setActiveTab(t)} />;
      case 'activity':
        return <ActivityPage />;
      case 'profile':
        return <ProfilePage onNavigate={(t) => setActiveTab(t)} />;
      case 'leaderboard':
        return <LeaderboardPage />;
      case 'rewards':
        return <RewardsPage />;
      case 'achievements':
        return <AchievementsPage />;
      case 'shop':
        return <ShopPage />;
      case 'events':
        return <EventsPage onNavigate={(t) => setActiveTab(t)} />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <HomePage onNavigate={(t) => setActiveTab(t)} />;
    }
  };

  return (
    <AppLayout activeTab={activeTab} onNavigate={(tabId) => setActiveTab(tabId)}>
      <ErrorBoundary>{renderActiveView()}</ErrorBoundary>
    </AppLayout>
  );
}

export function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <ActivityMain />
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
