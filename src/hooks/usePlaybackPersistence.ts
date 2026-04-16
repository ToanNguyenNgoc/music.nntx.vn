import { useEffect, useRef } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';
import { mainAudio } from '../lib/audio';

const PERSISTENCE_KEY = 'player-playback-state';

export const usePlaybackPersistence = () => {
  const {
    currentMusic,
    volume,
    isMuted,
    queue,
    repeatMode,
    isShuffle,
    restorePlaybackState,
  } = usePlayerStore();

  const isRestored = useRef(false);

  // Restore state on mount
  useEffect(() => {
    const savedState = localStorage.getItem(PERSISTENCE_KEY);
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        if (state.currentMusic) {
          // Check if the track is too close to the end (e.g., less than 5s left)
          // We don't have duration in the saved state reliably sometimes, 
          // but if we do, we can check.
          let restoredTime = state.currentTime || 0;
          
          // Fallback: if it's very close to the end, reset to 0
          // (We'll assume duration is available if saved)
          if (state.duration && restoredTime > state.duration - 5) {
            restoredTime = 0;
          }

          restorePlaybackState({
            currentMusic: state.currentMusic,
            volume: state.volume ?? 0.7,
            isMuted: state.isMuted ?? false,
            repeatMode: state.repeatMode ?? 'none',
            isShuffle: state.isShuffle ?? false,
            queue: state.queue ?? [],
            currentTime: restoredTime,
            isPlaying: false, // Don't autoplay to respect browser policies
          });
        }
      } catch (e) {
        console.error('Failed to restore playback state', e);
      }
    }
    isRestored.current = true;
  }, [restorePlaybackState]);

  // Save state periodically and on events
  useEffect(() => {
    if (!isRestored.current) return;

    const saveState = () => {
      if (!currentMusic) return;

      const state = {
        currentMusic,
        currentTime: mainAudio.currentTime,
        duration: mainAudio.duration,
        volume,
        isMuted,
        queue,
        repeatMode,
        isShuffle,
        updatedAt: Date.now(),
      };
      localStorage.setItem(PERSISTENCE_KEY, JSON.stringify(state));
    };

    // Throttle saving to every 5 seconds
    const interval = setInterval(saveState, 5000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        saveState();
      }
    };

    window.addEventListener('beforeunload', saveState);
    window.addEventListener('pagehide', saveState);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', saveState);
      window.removeEventListener('pagehide', saveState);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [currentMusic, volume, isMuted, queue, repeatMode, isShuffle]);
};
