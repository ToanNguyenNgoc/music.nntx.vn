import React from 'react';
import { YoutubeSearchItem } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import { useYoutubeImportStore } from '../../store/useYoutubeImportStore';
import { Download, Loader2, CheckCircle2, AlertCircle, ExternalLink, Play } from 'lucide-react';
import { motion } from 'motion/react';

interface YoutubeItemProps {
  item: YoutubeSearchItem;
  onPreview: () => void;
}

export const YoutubeItem: React.FC<YoutubeItemProps> = ({ item, onPreview }) => {
  const { triggerRefresh } = useAppStore();
  const { startImport, getImportState } = useYoutubeImportStore();
  const { status, progress, error } = getImportState(item.id);

  const handleStartConvert = (e: React.MouseEvent) => {
    e.stopPropagation();
    startImport(item, triggerRefresh);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-spotify-dark p-3 md:p-4 rounded-lg flex flex-col sm:flex-row gap-3 md:gap-4 group hover:bg-spotify-light border border-black/5 dark:border-white/5 transition-colors"
    >
      <div 
        className="relative w-full sm:w-40 h-48 sm:h-24 flex-shrink-0 cursor-pointer overflow-hidden rounded group/thumb"
        onClick={onPreview}
      >
        <img
          src={item.thumbnail}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover/thumb:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-10 h-10 bg-spotify-green rounded-full flex items-center justify-center shadow-lg transform scale-90 group-hover/thumb:scale-100 transition-transform">
            <Play size={20} fill="black" className="text-black ml-1" />
          </div>
        </div>
        <span className="absolute bottom-1 right-1 bg-black/80 text-[10px] px-1 rounded font-bold text-white z-10">
          {item.duration}
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          <h3 
            className="font-bold text-sm text-app-text truncate hover:text-spotify-green cursor-pointer transition-colors"
            onClick={onPreview}
          >
            {item.title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-spotify-gray truncate hover:underline cursor-pointer">{item.channel}</span>
            <span className="text-xs text-spotify-gray">•</span>
            <span className="text-xs text-spotify-gray">{item.views} views</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 sm:mt-2">
          <div className="flex items-center gap-4">
            <button 
              onClick={onPreview}
              className="text-spotify-gray hover:text-app-text transition-colors flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider"
            >
              <Play size={14} fill="currentColor" /> Preview
            </button>
            <a 
              href={item.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-spotify-gray hover:text-app-text transition-colors flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider"
            >
              <ExternalLink size={14} /> YouTube
            </a>
          </div>

          <div className="flex items-center gap-3">
            {status === 'idle' && (
              <button
                onClick={handleStartConvert}
                className="bg-app-text text-spotify-black text-xs font-bold py-1.5 px-4 rounded-full hover:scale-105 transition-transform flex items-center gap-2"
              >
                <Download size={14} /> Import
              </button>
            )}

            {status === 'converting' && (
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-spotify-green font-bold">Converting...</span>
                  <span className="text-[10px] text-spotify-gray">{progress}%</span>
                </div>
                <Loader2 className="animate-spin text-spotify-green" size={18} />
              </div>
            )}

            {status === 'importing' && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-app-text font-bold">Adding to library...</span>
                <Loader2 className="animate-spin text-app-text" size={14} />
              </div>
            )}

            {status === 'imported' && (
              <div className="flex items-center gap-1 text-spotify-green">
                <CheckCircle2 size={16} />
                <span className="text-xs font-bold">Imported</span>
              </div>
            )}

            {status === 'failed' && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-red-500 font-medium">{error}</span>
                <button
                  onClick={handleStartConvert}
                  className="text-white hover:text-spotify-green transition-colors"
                  title="Retry"
                >
                  <AlertCircle size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
