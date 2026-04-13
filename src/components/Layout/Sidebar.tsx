import React from 'react';
import { Home, Search, Library, PlusSquare, Heart, LogOut, Youtube } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useAppStore } from '../../store/useAppStore';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const SidebarItem = ({ icon: Icon, label, active, onClick }: SidebarItemProps) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-4 px-4 py-2 w-full text-spotify-gray hover:text-app-text transition-colors duration-200 font-medium text-left",
      active && "text-app-text"
    )}
  >
    <Icon size={24} />
    <span className="hidden lg:inline">{label}</span>
  </button>
);

export const Sidebar = () => {
  const { logout } = useAuthStore();
  const { currentView, setCurrentView } = useAppStore();

  return (
    <aside className="w-20 lg:w-64 bg-spotify-black border-r border-black/5 dark:border-white/5 flex flex-col h-full py-6 transition-colors duration-300">
      <div className="px-6 mb-8">
        <div className="flex items-center gap-2 text-app-text cursor-pointer" onClick={() => setCurrentView('home')}>
          <div className="w-10 h-10 bg-app-text rounded-full flex items-center justify-center transition-colors">
            <div className="w-6 h-6 bg-spotify-black rounded-full transition-colors" />
          </div>
          <span className="text-2xl font-bold hidden lg:inline tracking-tighter">Spotify</span>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        <SidebarItem 
          icon={Home} 
          label="Home" 
          active={currentView === 'home'} 
          onClick={() => setCurrentView('home')}
        />
        <SidebarItem 
          icon={Youtube} 
          label="Import YouTube" 
          active={currentView === 'youtube'} 
          onClick={() => setCurrentView('youtube')}
        />
        <SidebarItem icon={Search} label="Search" />
        <SidebarItem icon={Library} label="Your Library" />

        <div className="mt-8 pt-8 border-t border-black/10 dark:border-white/10 space-y-2">
          <SidebarItem icon={PlusSquare} label="Create Playlist" />
          <SidebarItem icon={Heart} label="Liked Songs" />
        </div>
      </nav>

      <div className="mt-auto px-2">
        <SidebarItem 
          icon={LogOut} 
          label="Logout" 
          onClick={logout}
        />
      </div>
    </aside>
  );
};
