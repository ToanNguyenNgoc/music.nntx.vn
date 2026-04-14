import { useEffect } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';

export const useKeyboardShortcuts = () => {
  const { 
    isPlaying, 
    setIsPlaying, 
    playNext, 
    playPrevious,
    volume,
    setVolume,
    isMuted,
    setIsMuted,
    currentMusic
  } = usePlayerStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          if (currentMusic) setIsPlaying(!isPlaying);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(Math.min(1, volume + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(Math.max(0, volume - 0.1));
          break;
        case 'KeyM':
          e.preventDefault();
          setIsMuted(!isMuted);
          break;
        case 'KeyN':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            playNext();
          }
          break;
        case 'KeyP':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            playPrevious();
          }
          break;
        case 'ArrowRight':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            playNext();
          }
          break;
        case 'ArrowLeft':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            playPrevious();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, setIsPlaying, playNext, playPrevious, volume, setVolume, isMuted, setIsMuted, currentMusic]);
};
