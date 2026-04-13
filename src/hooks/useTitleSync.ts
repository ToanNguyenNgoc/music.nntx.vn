import { useEffect } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';

const APP_NAME = 'Spotify Clone';

export const useTitleSync = () => {
  const { currentMusic, isPlaying } = usePlayerStore();

  useEffect(() => {
    if (!currentMusic) {
      document.title = APP_NAME;
      return;
    }

    const trackInfo = `${currentMusic.name} - ${currentMusic.title}`;
    
    if (isPlaying) {
      document.title = `${trackInfo} | ${APP_NAME}`;
    } else {
      document.title = `Tạm dừng - ${trackInfo} | ${APP_NAME}`;
    }

    // Cleanup when component unmounts or track changes
    return () => {
      document.title = APP_NAME;
    };
  }, [currentMusic, isPlaying]);
};
