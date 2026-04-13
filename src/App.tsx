/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAuthStore } from './store/useAuthStore';
import { useAppStore } from './store/useAppStore';
import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import { PlayerBar } from './components/Layout/PlayerBar';
import { BottomNav } from './components/Layout/BottomNav';
import { MusicList } from './components/Music/MusicList';
import { YoutubeImport } from './components/Youtube/YoutubeImport';
import { ProfileView } from './components/Auth/ProfileView';
import { LoginForm } from './components/Auth/LoginForm';
import { RegisterForm } from './components/Auth/RegisterForm';
import { useTitleSync } from './hooks/useTitleSync';

export default function App() {
  const { isAuthenticated } = useAuthStore();
  const { currentView } = useAppStore();
  const [authMode, setAuthMode] = React.useState<'login' | 'register'>('login');

  // Sync tab title with current music
  useTitleSync();

  if (!isAuthenticated) {
    return authMode === 'login' 
      ? <LoginForm onSwitchToRegister={() => setAuthMode('register')} /> 
      : <RegisterForm onSwitchToLogin={() => setAuthMode('login')} />;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return <MusicList />;
      case 'youtube':
        return <YoutubeImport />;
      case 'profile':
        return <ProfileView />;
      default:
        return <MusicList />;
    }
  };

  return (
    <div className="flex h-screen bg-black overflow-hidden select-none">
      {/* Sidebar - Hidden on mobile */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <Header />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          {renderContent()}
        </div>
        
        {/* Padding for PlayerBar and BottomNav */}
        <div className="h-32 md:h-24" />
      </main>

      {/* Player Bar */}
      <PlayerBar />

      {/* Bottom Nav - Mobile only */}
      <BottomNav />
    </div>
  );
}
