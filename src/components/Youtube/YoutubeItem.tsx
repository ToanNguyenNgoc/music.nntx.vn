import React, { useState, useEffect, useRef } from 'react';
import { YoutubeSearchItem, YoutubeImportStatus } from '../../types';
import { youtubeService, musicService } from '../../services/api';
import { useAppStore } from '../../store/useAppStore';
import { Download, Loader2, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';

interface YoutubeItemProps {
  item: YoutubeSearchItem;
}

export const YoutubeItem: React.FC<YoutubeItemProps> = ({ item }) => {
  const [status, setStatus] = useState<YoutubeImportStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const { triggerRefresh } = useAppStore();

  const cleanup = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  useEffect(() => {
    return cleanup;
  }, []);

  const startPolling = (jobId: string, originUrl: string) => {
    cleanup();
    pollingRef.current = setInterval(async () => {
      try {
        const response = await youtubeService.getStatus(jobId);
        if (response.success) {
          const { status: jobStatus, progress: jobProgress, media_url } = response.context;
          setProgress(jobProgress || 0);

          if (jobStatus === 'done') {
            cleanup();
            handleImport(originUrl || media_url);
          } else if (jobStatus === 'failed') {
            cleanup();
            setStatus('failed');
            setError('Conversion failed on server');
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
        // Don't stop polling on single error, wait for next tick
      }
    }, 1000);
  };

  const handleImport = async (mediaUrl: string) => {
    setStatus('importing');
    try {
      // Ensure media_url is relative if it's an absolute path from the same server
      let relativeUrl = mediaUrl;
      if (mediaUrl.includes('/media/')) {
        relativeUrl = '/media/' + mediaUrl.split('/media/')[1];
      }

      await musicService.importMusic({
        title: item.channel,
        name: item.title,
        thumbnail: item.thumbnail,
        media_url: relativeUrl,
        priority: 0
      });

      setStatus('imported');
      triggerRefresh();
    } catch (err) {
      console.error('Import error:', err);
      setStatus('failed');
      setError('Failed to add to library');
    }
  };

  const handleStartConvert = async () => {
    setStatus('converting');
    setError(null);
    setProgress(0);
    try {
      const response = await youtubeService.convertToMp3(item.url);
      if (response.success) {
        startPolling(response.context.job_id, response.context.origin_url);
      } else {
        setStatus('failed');
        setError('Failed to start conversion');
      }
    } catch (err) {
      console.error('Convert error:', err);
      setStatus('failed');
      setError('Service error');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-spotify-dark p-3 md:p-4 rounded-lg flex flex-col sm:flex-row gap-3 md:gap-4 group hover:bg-spotify-light transition-colors"
    >
      <div className="relative w-full sm:w-40 h-48 sm:h-24 flex-shrink-0">
        <img
          src={item.thumbnail}
          alt={item.title}
          className="w-full h-full object-cover rounded"
          referrerPolicy="no-referrer"
        />
        <span className="absolute bottom-1 right-1 bg-black/80 text-[10px] px-1 rounded font-bold">
          {item.duration}
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          <h3 className="font-bold text-sm text-white truncate group-hover:text-spotify-green transition-colors">
            {item.title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-spotify-gray truncate">{item.channel}</span>
            <span className="text-xs text-spotify-gray">•</span>
            <span className="text-xs text-spotify-gray">{item.views} views</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 sm:mt-2">
          <a 
            href={item.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-spotify-gray hover:text-white transition-colors flex items-center gap-1 text-[10px]"
          >
            Watch <ExternalLink size={10} className="hidden sm:inline" />
          </a>

          <div className="flex items-center gap-3">
            {status === 'idle' && (
              <button
                onClick={handleStartConvert}
                className="bg-white text-black text-xs font-bold py-1.5 px-4 rounded-full hover:scale-105 transition-transform flex items-center gap-2"
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
                <span className="text-[10px] text-white font-bold">Adding to library...</span>
                <Loader2 className="animate-spin text-white" size={14} />
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
