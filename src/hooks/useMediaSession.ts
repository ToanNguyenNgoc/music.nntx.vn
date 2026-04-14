import { useEffect } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';
import { mainAudio } from '../lib/audio';

export const useMediaSession = () => {
  const { 
    currentMusic, 
    isPlaying, 
    setIsPlaying, 
    playNext, 
    playPrevious 
  } = usePlayerStore();

  useEffect(() => {
    if (!('mediaSession' in navigator) || !currentMusic) return;

    // Update Metadata
    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentMusic.name,
      artist: currentMusic.title,
      album: 'My Music Library',
      artwork: [
        { src: currentMusic.thumbnail, sizes: '96x96', type: 'image/png' },
        { src: currentMusic.thumbnail, sizes: '128x128', type: 'image/png' },
        { src: currentMusic.thumbnail, sizes: '192x192', type: 'image/png' },
        { src: currentMusic.thumbnail, sizes: '256x256', type: 'image/png' },
        { src: currentMusic.thumbnail, sizes: '384x384', type: 'image/png' },
        { src: currentMusic.thumbnail, sizes: '512x512', type: 'image/png' },
      ],
    });

    // Action Handlers
    navigator.mediaSession.setActionHandler('play', () => {
      setIsPlaying(true);
    });

    navigator.mediaSession.setActionHandler('pause', () => {
      setIsPlaying(false);
    });

    navigator.mediaSession.setActionHandler('previoustrack', () => {
      playPrevious();
    });

    navigator.mediaSession.setActionHandler('nexttrack', () => {
      playNext();
    });

    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime !== undefined && mainAudio) {
        mainAudio.currentTime = details.seekTime;
      }
    });

    return () => {
      // Cleanup handlers
      navigator.mediaSession.setActionHandler('play', null);
      navigator.mediaSession.setActionHandler('pause', null);
      navigator.mediaSession.setActionHandler('previoustrack', null);
      navigator.mediaSession.setActionHandler('nexttrack', null);
      navigator.mediaSession.setActionHandler('seekbackward', null);
      navigator.mediaSession.setActionHandler('seekforward', null);
    };
  }, [currentMusic, setIsPlaying, playNext, playPrevious]);

  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    
    // Update Playback State
    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
  }, [isPlaying]);

  const { currentTime, duration } = usePlayerStore();

  useEffect(() => {
    if (!('mediaSession' in navigator) || !('setPositionState' in navigator.mediaSession)) return;

    try {
      navigator.mediaSession.setPositionState({
        duration: duration || 0,
        playbackRate: mainAudio.playbackRate || 1,
        position: currentTime || 0,
      });
    } catch (error) {
      // Some browsers might throw if values are inconsistent
      console.warn('MediaSession setPositionState error:', error);
    }
  }, [currentTime, duration, isPlaying]);
};
