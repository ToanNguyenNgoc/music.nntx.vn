import React from 'react';
import { Home, Search, Library, Youtube } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const BottomNav = () => {
  const { currentView, setCurrentView } = useAppStore();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-spotify-dark/95 backdrop-blur-md border-t border-black/5 dark:border-white/5 h-16 flex items-center justify-around px-2 z-[60] transition-colors duration-300">
      <button
        onClick={() => setCurrentView('home')}
        className={`flex flex-col items-center gap-1 transition-colors ${currentView === 'home' ? 'text-app-text' : 'text-spotify-gray'}`}
      >
        <Home size={24} />
        <span className="text-[10px] font-medium">Home</span>
      </button>
      
      <button
        onClick={() => setCurrentView('youtube')}
        className={`flex flex-col items-center gap-1 transition-colors ${currentView === 'youtube' ? 'text-app-text' : 'text-spotify-gray'}`}
      >
        <Youtube size={24} />
        <span className="text-[10px] font-medium">Import</span>
      </button>

      <button
        className="flex flex-col items-center gap-1 text-spotify-gray"
      >
        <Search size={24} />
        <span className="text-[10px] font-medium">Search</span>
      </button>

      <button
        className="flex flex-col items-center gap-1 text-spotify-gray"
      >
        <Library size={24} />
        <span className="text-[10px] font-medium">Library</span>
      </button>
    </nav>
  );
};
