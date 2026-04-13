import React from 'react';
import { Play, Pause, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PlayPauseButtonProps {
  isPlaying: boolean;
  isLoading?: boolean;
  onClick: (e: React.MouseEvent) => void;
  size?: number;
  className?: string;
  iconClassName?: string;
  disabled?: boolean;
}

export const PlayPauseButton: React.FC<PlayPauseButtonProps> = ({
  isPlaying,
  isLoading = false,
  onClick,
  size = 24,
  className = "",
  iconClassName = "",
  disabled = false
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`relative flex items-center justify-center transition-colors focus:outline-none ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.5, rotate: 180 }}
            transition={{ duration: 0.2 }}
          >
            <Loader2 size={size} className={`animate-spin ${iconClassName}`} />
          </motion.div>
        ) : isPlaying ? (
          <motion.div
            key="pause"
            initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
            transition={{ duration: 0.2 }}
          >
            <Pause size={size} fill="currentColor" className={iconClassName} />
          </motion.div>
        ) : (
          <motion.div
            key="play"
            initial={{ opacity: 0, scale: 0.5, rotate: 90 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.5, rotate: -90 }}
            transition={{ duration: 0.2 }}
          >
            <Play size={size} fill="currentColor" className={`ml-0.5 ${iconClassName}`} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};
