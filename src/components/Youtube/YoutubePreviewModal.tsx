import React, { useState } from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';
import { motion, AnimatePresence } from 'motion/react';
import { X, Youtube, Download, ExternalLink, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { YoutubeSearchItem } from '../../types';
import { useYoutubeImportStore } from '../../store/useYoutubeImportStore';
import { useAppStore } from '../../store/useAppStore';

interface YoutubePreviewModalProps {
  item: YoutubeSearchItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const YoutubePreviewModal: React.FC<YoutubePreviewModalProps> = ({
  item,
  isOpen,
  onClose
}) => {
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { triggerRefresh } = useAppStore();
  const { startImport, getImportState } = useYoutubeImportStore();
  const importState = item ? getImportState(item.id) : null;

  if (!item) return null;

  const onPlayerReady: YouTubeProps['onReady'] = (event) => {
    setIsPlayerReady(true);
    setError(null);
    // Autoplay with mute to comply with browser policies
    event.target.mute();
    event.target.playVideo();
  };

  const onPlayerError: YouTubeProps['onError'] = () => {
    setIsPlayerReady(false);
    setError('Failed to load YouTube player. This video might be restricted or unavailable.');
  };

  const handleImport = () => {
    if (item) {
      startImport(item, triggerRefresh);
    }
  };

  const opts: YouTubeProps['opts'] = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 1,
      mute: 1,
      playsinline: 1,
      modestbranding: 1,
      rel: 0,
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-5xl bg-spotify-dark rounded-2xl overflow-hidden shadow-2xl border border-black/10 dark:border-white/10 flex flex-col max-h-full transition-colors duration-300"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-black/5 dark:border-white/5">
              <div className="flex items-center gap-3">
                <Youtube className="text-red-600" size={24} />
                <h2 className="font-bold text-app-text truncate max-w-[200px] sm:max-w-md">
                  Preview: {item.title}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors text-spotify-gray hover:text-app-text"
              >
                <X size={24} />
              </button>
            </div>

            {/* Player Area */}
            <div className="relative aspect-video bg-black w-full overflow-hidden">
              {!isPlayerReady && !error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-spotify-gray">
                  <Loader2 className="animate-spin text-spotify-green" size={48} />
                  <p className="text-sm font-medium">Loading YouTube Player...</p>
                </div>
              )}

              {error ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center">
                  <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500">
                    <AlertCircle size={32} />
                  </div>
                  <div className="max-w-xs">
                    <p className="text-white font-bold mb-1">Playback Error</p>
                    <p className="text-spotify-gray text-sm">{error}</p>
                  </div>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 bg-white text-black px-6 py-2 rounded-full font-bold text-sm hover:scale-105 transition-transform flex items-center gap-2"
                  >
                    <ExternalLink size={16} /> Watch on YouTube
                  </a>
                </div>
              ) : (
                <YouTube
                  videoId={item.id}
                  opts={opts}
                  onReady={onPlayerReady}
                  onError={onPlayerError}
                  className="w-full h-full"
                  containerClassName="w-full h-full"
                />
              )}
            </div>

            {/* Info & Actions */}
            <div className="p-6 md:p-8 overflow-y-auto">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl md:text-2xl font-black text-app-text mb-2 leading-tight">
                    {item.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-spotify-gray text-sm">
                    <span className="font-bold text-spotify-green hover:underline cursor-pointer">
                      {item.channel}
                    </span>
                    <span className="flex items-center gap-1">
                      {item.views} views
                    </span>
                    <span className="flex items-center gap-1">
                      {item.duration}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch gap-3 flex-shrink-0">
                  {importState?.status === 'idle' && (
                    <button
                      onClick={handleImport}
                      className="bg-spotify-green text-black font-bold py-3 px-8 rounded-full hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-lg shadow-spotify-green/20"
                    >
                      <Download size={20} /> Import to Library
                    </button>
                  )}

                  {importState?.status === 'converting' && (
                    <div className="bg-spotify-green/10 text-spotify-green font-bold py-3 px-8 rounded-full flex items-center justify-center gap-3 border border-spotify-green/20">
                      <div className="flex flex-col items-center">
                        <span className="text-xs">Converting...</span>
                        <span className="text-[10px] opacity-70">{importState.progress}%</span>
                      </div>
                      <Loader2 className="animate-spin" size={20} />
                    </div>
                  )}

                  {importState?.status === 'importing' && (
                    <div className="bg-app-text/10 text-app-text font-bold py-3 px-8 rounded-full flex items-center justify-center gap-3 border border-app-text/20">
                      <span className="text-xs">Adding to library...</span>
                      <Loader2 className="animate-spin" size={20} />
                    </div>
                  )}

                  {importState?.status === 'imported' && (
                    <div className="bg-spotify-green text-black font-bold py-3 px-8 rounded-full flex items-center justify-center gap-2 opacity-80 cursor-default">
                      <CheckCircle2 size={20} /> Imported
                    </div>
                  )}

                  {importState?.status === 'failed' && (
                    <button
                      onClick={handleImport}
                      className="bg-red-500 text-white font-bold py-3 px-8 rounded-full hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"
                    >
                      <AlertCircle size={20} /> Retry Import
                    </button>
                  )}

                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-black/5 dark:bg-white/10 text-app-text font-bold py-3 px-8 rounded-full hover:bg-black/10 dark:hover:bg-white/20 transition-all flex items-center justify-center gap-2 border border-black/10 dark:border-white/10"
                  >
                    <ExternalLink size={20} /> Open YouTube
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
