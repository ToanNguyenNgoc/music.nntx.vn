import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, User as UserIcon, LogOut, User, ExternalLink } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useAppStore } from '../../store/useAppStore';
import { ThemeToggle } from '../UI/ThemeToggle';

export const Header = () => {
  const { user, logout } = useAuthStore();
  const { setCurrentView } = useAppStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-8 bg-black/40 backdrop-blur-md sticky top-0 z-40">
      <div className="flex gap-2 md:gap-4">
        <button className="w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-spotify-gray hover:text-white transition-colors">
          <ChevronLeft size={24} />
        </button>
        <button className="hidden sm:flex w-8 h-8 rounded-full bg-black/60 items-center justify-center text-spotify-gray hover:text-white transition-colors">
          <ChevronRight size={24} />
        </button>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <ThemeToggle />
        
        <button className="bg-white text-black font-bold py-1.5 px-4 md:px-6 rounded-full hover:scale-105 transition-transform text-xs md:text-sm hidden sm:block">
          Explore Premium
        </button>
        
        <div className="relative" ref={menuRef}>
          <div 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`flex items-center gap-2 bg-black/60 p-1 pr-3 rounded-full hover:bg-spotify-light cursor-pointer transition-colors ${isMenuOpen ? 'bg-spotify-light' : ''}`}
          >
            <div className="w-7 h-7 rounded-full bg-spotify-light flex items-center justify-center">
              <UserIcon size={18} className="text-white" />
            </div>
            <span className="text-sm font-bold text-white hidden sm:inline">
              {user?.fullname || 'User'}
            </span>
          </div>

          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-spotify-light rounded-md shadow-2xl border border-white/10 p-1 z-50">
              <button 
                onClick={() => {
                  setCurrentView('profile');
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 text-sm text-white hover:bg-white/10 rounded transition-colors"
              >
                <span>Profile</span>
                <User size={16} />
              </button>
              <button 
                className="w-full flex items-center justify-between px-3 py-2 text-sm text-white hover:bg-white/10 rounded transition-colors"
              >
                <span>Upgrade to Premium</span>
                <ExternalLink size={16} />
              </button>
              <div className="h-[1px] bg-white/10 my-1" />
              <button 
                onClick={async () => {
                  await logout();
                }}
                className="w-full flex items-center justify-between px-3 py-2 text-sm text-white hover:bg-white/10 rounded transition-colors"
              >
                <span>Log out</span>
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
