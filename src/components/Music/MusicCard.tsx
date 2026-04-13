import React from 'react';
import { Trash2 } from 'lucide-react';
import { Music } from '../../types';
import { usePlayerStore } from '../../store/usePlayerStore';
import { motion } from 'motion/react';
import { PlayPauseButton } from '../UI/PlayPauseButton';
import { NowPlayingIndicator } from '../UI/NowPlayingIndicator';

interface MusicCardProps {
  music: Music;
  onDelete?: (music: Music) => void;
}

export const MusicCard: React.FC<MusicCardProps> = ({ music, onDelete }) => {
  const { currentMusic, isPlaying, isLoading, setCurrentMusic, setIsPlaying } = usePlayerStore();
  
  const isCurrent = currentMusic?.id === music.id;
  const isActive = isCurrent && isPlaying;

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrent) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentMusic(music);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) onDelete(music);
  };

  const handleCardClick = () => {
    if (isCurrent) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentMusic(music);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      onClick={handleCardClick}
      className="bg-spotify-dark p-4 rounded-lg hover:bg-spotify-light border border-black/5 dark:border-white/5 transition-all duration-300 group cursor-pointer relative"
    >
      <div className="relative aspect-square mb-4 shadow-2xl">
        <img
          src={music.thumbnail}
          alt={music.name}
          className="w-full h-full object-cover rounded-md"
          referrerPolicy="no-referrer"
        />
        
        {/* Play Button Overlay */}
        <div className={`absolute bottom-2 right-2 md:translate-y-2 opacity-100 md:opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-xl flex gap-2`}>
          <button
            onClick={handleDelete}
            className="w-8 h-8 md:w-10 md:h-10 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"
            title="Delete from library"
          >
            <Trash2 className="w-4 h-4 md:w-[18px] md:h-[18px]" />
          </button>
          <PlayPauseButton
            isPlaying={isActive}
            isLoading={isCurrent && isLoading}
            onClick={handlePlay}
            size={24}
            className="w-10 h-10 md:w-12 md:h-12 bg-spotify-green rounded-full text-black shadow-lg"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className={`font-bold text-sm truncate flex-1 ${isCurrent ? 'text-spotify-green' : 'text-app-text'}`}>
            {music.name}
          </h3>
          {isCurrent && <NowPlayingIndicator isPlaying={isActive} className="scale-75 origin-right" />}
        </div>
        <p className="text-spotify-gray text-xs truncate">
          {music.title}
        </p>
      </div>
    </motion.div>
  );
};
