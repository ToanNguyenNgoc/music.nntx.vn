import { create } from 'zustand';

type View = 'home' | 'youtube' | 'profile';
type ViewMode = 'grid' | 'list';

interface AppState {
  currentView: View;
  viewMode: ViewMode;
  refreshTrigger: number;
  setCurrentView: (view: View) => void;
  setViewMode: (mode: ViewMode) => void;
  triggerRefresh: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentView: 'home',
  viewMode: (localStorage.getItem('viewMode') as ViewMode) || 'grid',
  refreshTrigger: 0,
  setCurrentView: (view) => set({ currentView: view }),
  setViewMode: (mode) => {
    localStorage.setItem('viewMode', mode);
    set({ viewMode: mode });
  },
  triggerRefresh: () => set((state) => ({ refreshTrigger: state.refreshTrigger + 1 })),
}));
