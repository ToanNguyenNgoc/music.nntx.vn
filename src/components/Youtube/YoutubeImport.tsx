import React, { useState, useEffect, useRef } from 'react';
import { youtubeService } from '../../services/api';
import { YoutubeSearchItem } from '../../types';
import { YoutubeItem } from './YoutubeItem';
import { Search, Youtube, Loader2, Music, AlertCircle } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { motion, AnimatePresence } from 'motion/react';

const YoutubeSkeleton = () => (
  <div className="bg-spotify-dark p-4 rounded-lg flex gap-4 animate-pulse">
    <div className="w-40 h-24 bg-spotify-light rounded flex-shrink-0" />
    <div className="flex-1 space-y-3 py-1">
      <div className="h-4 bg-spotify-light rounded w-3/4" />
      <div className="space-y-2">
        <div className="h-3 bg-spotify-light rounded w-1/2" />
        <div className="h-3 bg-spotify-light rounded w-1/4" />
      </div>
      <div className="flex justify-between items-center pt-2">
        <div className="h-3 bg-spotify-light rounded w-20" />
        <div className="h-8 bg-spotify-light rounded-full w-24" />
      </div>
    </div>
  </div>
);

export const YoutubeImport = () => {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<YoutubeSearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDebouncing, setIsDebouncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const { setCurrentView } = useAppStore();
  
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSearchRef = useRef<string>('');

  useEffect(() => {
    // Clear results if keyword is empty
    if (!keyword.trim()) {
      setResults([]);
      setHasSearched(false);
      setIsDebouncing(false);
      setLoading(false);
      setError(null);
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      return;
    }

    setIsDebouncing(true);
    setError(null);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      performSearch(keyword);
    }, 600);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [keyword]);

  const performSearch = async (searchTerm: string) => {
    if (searchTerm === lastSearchRef.current) return;
    
    setLoading(true);
    setIsDebouncing(false);
    setHasSearched(true);
    lastSearchRef.current = searchTerm;

    try {
      const response = await youtubeService.search(searchTerm);
      // Only update if the searchTerm matches the current keyword
      if (searchTerm === lastSearchRef.current) {
        setResults(response.context.data || []);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to fetch results from YouTube. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-8 spotify-gradient">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-600/20">
              <Youtube size={24} className="text-white md:hidden" />
              <Youtube size={28} className="text-white hidden md:block" />
            </div>
            <div>
              <h1 className="text-xl md:text-3xl font-bold tracking-tight">Import from YouTube</h1>
              <p className="text-spotify-gray text-xs md:text-sm">Convert and add videos to your library</p>
            </div>
          </div>
          <button 
            onClick={() => setCurrentView('home')}
            className="text-spotify-gray hover:text-white transition-colors flex items-center gap-2 text-xs md:text-sm font-medium"
          >
            <Music size={18} /> <span className="hidden sm:inline">Back to Library</span>
          </button>
        </div>

        <div className="mb-6 md:mb-10">
          <div className="relative group">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isDebouncing || loading ? 'text-spotify-green' : 'text-spotify-gray group-focus-within:text-white'}`} size={20} />
            <input
              type="text"
              placeholder="Search or paste YouTube URL..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full bg-spotify-light border border-white/5 rounded-full py-3 md:py-4 pl-12 pr-12 text-sm md:text-lg focus:ring-2 focus:ring-white/10 outline-none transition-all shadow-xl"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {(isDebouncing || loading) && (
                <Loader2 className="animate-spin text-spotify-green" size={24} />
              )}
            </div>
          </div>
          <AnimatePresence>
            {(isDebouncing || loading) && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-spotify-green text-xs font-medium mt-2 ml-4 flex items-center gap-2"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-spotify-green opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-spotify-green"></span>
                </span>
                Searching YouTube...
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg flex items-center gap-3">
              <AlertCircle size={20} />
              <p className="text-sm font-medium">{error}</p>
              <button 
                onClick={() => performSearch(keyword)}
                className="ml-auto text-xs font-bold uppercase tracking-wider hover:underline"
              >
                Retry
              </button>
            </div>
          )}

          {loading && results.length === 0 && (
            <div className="grid gap-4">
              {[...Array(5)].map((_, i) => (
                <YoutubeSkeleton key={i} />
              ))}
            </div>
          )}

          {!loading && !isDebouncing && results.length === 0 && hasSearched && (
            <div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10">
              <p className="text-spotify-gray text-lg">No results found for "{keyword}"</p>
              <p className="text-spotify-gray text-sm mt-1">Try different keywords or check the URL.</p>
            </div>
          )}

          {!hasSearched && !isDebouncing && !loading && (
            <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
              <Youtube size={80} className="mb-4" />
              <p className="text-xl font-medium max-w-xs">Enter a keyword or video URL to start importing music</p>
            </div>
          )}

          <div className="grid gap-4">
            {results.map((item) => (
              <YoutubeItem key={item.id} item={item} />
            ))}
            
            {/* Show skeletons at bottom if loading more or refreshing */}
            {loading && results.length > 0 && (
              <div className="opacity-50">
                <YoutubeSkeleton />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
