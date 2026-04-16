import { create } from 'zustand';
import { Music } from '../types';

interface PlayerState {
  currentMusic: Music | null;
  isPlaying: boolean;
  queue: Music[];
  volume: number;
  isMuted: boolean;
  currentTime: number;
  duration: number;
  isLoading: boolean;
  repeatMode: 'none' | 'one' | 'all';
  isShuffle: boolean;
  
  setCurrentMusic: (music: Music) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  setQueue: (queue: Music[]) => void;
  setVolume: (volume: number) => void;
  setIsMuted: (isMuted: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setRepeatMode: (mode: 'none' | 'one' | 'all') => void;
  setIsShuffle: (isShuffle: boolean) => void;
  restorePlaybackState: (state: Partial<PlayerState>) => void;
  
  playNext: () => void;
  playPrevious: () => void;
  getNextMusic: () => Music | null;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentMusic: null,
  isPlaying: false,
  queue: [],
  volume: Number(localStorage.getItem('player-volume')) || 0.7,
  isMuted: false,
  currentTime: 0,
  duration: 0,
  isLoading: false,
  repeatMode: 'none',
  isShuffle: false,

  setCurrentMusic: (music) => {
    const { currentMusic, isPlaying } = get();
    if (currentMusic?.id === music.id) {
      set({ isPlaying: !isPlaying });
    } else {
      set({ currentMusic: music, isPlaying: true, isLoading: true, currentTime: 0 });
    }
  },
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setQueue: (queue) => set({ queue }),
  setVolume: (volume) => {
    localStorage.setItem('player-volume', volume.toString());
    set({ volume });
  },
  setIsMuted: (isMuted) => set({ isMuted }),
  setCurrentTime: (currentTime) => set({ currentTime }),
  setDuration: (duration) => set({ duration }),
  setRepeatMode: (repeatMode) => set({ repeatMode }),
  setIsShuffle: (isShuffle) => set({ isShuffle }),
  restorePlaybackState: (state) => set((prev) => ({ ...prev, ...state })),

  playNext: () => {
    const { queue, currentMusic, isShuffle, repeatMode } = get();
    if (queue.length === 0) return;
    
    if (repeatMode === 'one' && currentMusic) {
      // For repeat one, we restart the current track by cloning the object to trigger effects
      set({ currentMusic: { ...currentMusic }, currentTime: 0, isPlaying: true });
      return;
    }

    let nextIndex = 0;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else {
      const currentIndex = queue.findIndex((m) => m.id === currentMusic?.id);
      nextIndex = (currentIndex + 1) % queue.length;
      
      if (nextIndex === 0 && repeatMode === 'none') {
        set({ isPlaying: false });
        return;
      }
    }
    
    const nextMusic = queue[nextIndex];
    if (nextMusic.id === currentMusic?.id) {
      set({ currentMusic: { ...nextMusic }, currentTime: 0, isPlaying: true });
    } else {
      set({ currentMusic: nextMusic, isPlaying: true, currentTime: 0, isLoading: true });
    }
  },

  playPrevious: () => {
    const { queue, currentMusic } = get();
    if (queue.length === 0) return;
    
    const currentIndex = queue.findIndex((m) => m.id === currentMusic?.id);
    const prevIndex = (currentIndex - 1 + queue.length) % queue.length;
    const prevMusic = queue[prevIndex];

    if (prevMusic.id === currentMusic?.id) {
      set({ currentMusic: { ...prevMusic }, currentTime: 0, isPlaying: true });
    } else {
      set({ currentMusic: prevMusic, isPlaying: true, currentTime: 0, isLoading: true });
    }
  },

  getNextMusic: () => {
    const { queue, currentMusic, isShuffle } = get();
    if (queue.length <= 1) return null;
    
    if (isShuffle) {
      // For shuffle, we don't know the exact next one easily without a history, 
      // but we can pick a random one that isn't the current one for preloading
      const otherMusics = queue.filter(m => m.id !== currentMusic?.id);
      return otherMusics[Math.floor(Math.random() * otherMusics.length)];
    }

    const currentIndex = queue.findIndex((m) => m.id === currentMusic?.id);
    const nextIndex = (currentIndex + 1) % queue.length;
    return queue[nextIndex];
  }
}));
