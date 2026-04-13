import React, { memo } from 'react';
import { motion } from 'motion/react';

interface NowPlayingIndicatorProps {
  isPlaying: boolean;
  color?: string;
  className?: string;
}

/**
 * A high-quality sound wave animation for the currently playing track.
 * Uses Framer Motion for smooth, staggered bar animations.
 */
export const NowPlayingIndicator = memo(({ 
  isPlaying, 
  color = '#1DB954', 
  className = "" 
}: NowPlayingIndicatorProps) => {
  // Define base heights for the paused state to create a nice static wave
  const baseHeights = ["40%", "80%", "50%", "70%"];

  return (
    <div className={`flex items-end gap-[2px] h-4 w-4 ${className}`} aria-hidden="true">
      {baseHeights.map((baseHeight, i) => (
        <motion.div
          key={i}
          animate={isPlaying ? {
            height: ["20%", "100%", "30%", "80%", "20%"],
          } : {
            height: baseHeight,
          }}
          transition={isPlaying ? {
            duration: 1 + i * 0.15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.05,
          } : {
            duration: 0.6,
            ease: [0.4, 0, 0.2, 1] // Standard easing
          }}
          className="w-[3px] rounded-full"
          style={{ 
            backgroundColor: color,
            boxShadow: isPlaying ? `0 0 8px ${color}40` : 'none'
          }}
        />
      ))}
    </div>
  );
});

NowPlayingIndicator.displayName = 'NowPlayingIndicator';
