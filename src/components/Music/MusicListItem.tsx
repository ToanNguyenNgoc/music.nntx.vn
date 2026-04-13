import React, { memo } from 'react';
import { Clock, Trash2, GripVertical } from 'lucide-react';
import { Music } from '../../types';
import { usePlayerStore } from '../../store/usePlayerStore';
import { motion, Reorder, useDragControls } from 'motion/react';
import { PlayPauseButton } from '../UI/PlayPauseButton';
import { NowPlayingIndicator } from '../UI/NowPlayingIndicator';

interface MusicListItemProps {
  music: Music;
  index: number;
  onDelete?: (music: Music) => void;
  onDragEnd?: () => void;
  isDraggable?: boolean;
}

export const MusicListItem = memo(({ music, index, onDelete, onDragEnd, isDraggable }: MusicListItemProps) => {
  const { currentMusic, isPlaying, isLoading, setCurrentMusic, setIsPlaying } = usePlayerStore();
  const dragControls = useDragControls();
  
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleItemClick = () => {
    if (isCurrent) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentMusic(music);
    }
  };

  const content = (
    <div
      onClick={handleItemClick}
      className={`group flex items-center gap-4 px-4 py-2 rounded-md hover:bg-white/10 transition-all cursor-pointer ${isCurrent ? 'bg-white/5' : ''} select-none active:scale-[0.99]`}
    >
      {isDraggable && (
        <div 
          className="cursor-grab active:cursor-grabbing text-spotify-gray hover:text-white p-1 touch-none"
          onPointerDown={(e) => dragControls.start(e)}
        >
          <GripVertical size={16} />
        </div>
      )}

      <div className="w-8 flex justify-end text-spotify-gray font-medium group-hover:hidden">
        {isCurrent ? (
          <NowPlayingIndicator isPlaying={isActive} />
        ) : (
          index + 1
        )}
      </div>
      
      <div className="hidden group-hover:flex w-8 items-center justify-center">
        <PlayPauseButton
          isPlaying={isActive}
          isLoading={isCurrent && isLoading}
          onClick={handlePlay}
          size={16}
          className="text-white"
        />
      </div>

      <div className="flex items-center gap-3 flex-1 min-w-0">
        <img
          src={music.thumbnail}
          alt={music.name}
          className="w-10 h-10 object-cover rounded shadow"
          referrerPolicy="no-referrer"
        />
        <div className="flex flex-col min-w-0">
          <span className={`text-sm font-medium truncate ${isCurrent ? 'text-spotify-green' : 'text-white'}`}>
            {music.name}
          </span>
          <span className="text-xs text-spotify-gray truncate group-hover:text-white transition-colors">
            {music.title}
          </span>
        </div>
      </div>

      <div className="hidden lg:block w-40 text-xs text-spotify-gray">
        {formatDate(music.created_at)}
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <button
          onClick={handleDelete}
          className="md:opacity-0 group-hover:opacity-100 p-2 text-spotify-gray hover:text-red-500 transition-all"
          title="Delete"
        >
          <Trash2 size={16} />
        </button>

        <span className="text-xs text-spotify-gray w-12 text-right hidden md:inline">
          <Clock size={14} className="inline mr-1 opacity-50" />
          --:--
        </span>
      </div>
    </div>
  );

  if (isDraggable) {
    return (
      <Reorder.Item
        value={music}
        dragListener={false}
        dragControls={dragControls}
        onDragEnd={onDragEnd}
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileDrag={{ 
          scale: 1.03, 
          backgroundColor: "rgba(40, 40, 40, 0.9)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
          zIndex: 100,
          cursor: "grabbing"
        }}
        dragElastic={0.1}
        dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
        transition={{ 
          type: "spring",
          stiffness: 500,
          damping: 30,
          opacity: { duration: 0.2 }
        }}
        className="list-none relative z-0"
      >
        {content}
      </Reorder.Item>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
    >
      {content}
    </motion.div>
  );
});

MusicListItem.displayName = 'MusicListItem';
