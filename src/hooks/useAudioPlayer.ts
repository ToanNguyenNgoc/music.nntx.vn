import { useEffect, useRef } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';
import { useMediaSession } from './useMediaSession';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';
import { mainAudio, preloadAudio } from '../lib/audio';

export const useAudioPlayer = () => {
  const {
    currentMusic,
    isPlaying,
    volume,
    isMuted,
    setIsPlaying,
    setIsLoading,
    setCurrentTime,
    setDuration,
    playNext,
    getNextMusic,
  } = usePlayerStore();

  // Initialize system integrations
  useMediaSession();
  useKeyboardShortcuts();

  const isInitialMount = useRef(true);

  useEffect(() => {
    const audio = mainAudio;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };
    const handleCanPlay = () => {
      setIsLoading(false);
      if (isPlaying) {
        audio.play().catch(err => console.warn('Play failed:', err));
      }
    };
    const handleWaiting = () => setIsLoading(true);
    const handleEnded = () => playNext();
    const handleError = (e: any) => {
      console.error('Audio error:', e);
      setIsPlaying(false);
      setIsLoading(false);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, []);

  // Handle source change and preloading
  useEffect(() => {
    if (currentMusic) {
      const audio = mainAudio;
      
      // Resolve the URL to compare with audio.src (which is always absolute)
      const resolvedUrl = new URL(currentMusic.full_media_url, window.location.origin).href;
      
      if (audio.src !== resolvedUrl) {
        setIsLoading(true);
        audio.src = currentMusic.full_media_url;
        audio.load();
      } else {
        // Same source but reference changed (e.g. restart/repeat one)
        audio.currentTime = 0;
      }

      // If isPlaying is true, ensure it's playing
      if (isPlaying) {
        audio.play().catch((err) => {
          console.warn('Playback failed:', err);
        });
      }

      // Preload next track
      const nextMusic = getNextMusic();
      if (nextMusic) {
        const nextResolvedUrl = new URL(nextMusic.full_media_url, window.location.origin).href;
        if (preloadAudio.src !== nextResolvedUrl) {
          preloadAudio.src = nextMusic.full_media_url;
          preloadAudio.load();
        }
      }
    }
  }, [currentMusic]);

  // Handle play/pause
  useEffect(() => {
    if (currentMusic) {
      if (isPlaying) {
        mainAudio.play().catch(() => setIsPlaying(false));
      } else {
        mainAudio.pause();
      }
    }
  }, [isPlaying]);

  // Handle volume/mute
  useEffect(() => {
    mainAudio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  const seek = (time: number) => {
    mainAudio.currentTime = time;
    setCurrentTime(time);
  };

  return { seek };
};
