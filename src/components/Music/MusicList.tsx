import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { musicService } from '../../services/api';
import { Music } from '../../types';
import { MusicCard } from './MusicCard';
import { MusicListItem } from './MusicListItem';
import { ConfirmModal } from '../UI/ConfirmModal';
import { usePlayerStore } from '../../store/usePlayerStore';
import { useAppStore } from '../../store/useAppStore';
import { Search, SlidersHorizontal, Loader2, LayoutGrid, List, Save } from 'lucide-react';
import { Reorder } from 'motion/react';

export const MusicList = () => {
  const [musics, setMusics] = useState<Music[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'priority' | 'name'>('priority');
  
  // Delete state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [musicToDelete, setMusicToDelete] = useState<Music | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Reorder state
  const [isSyncing, setIsSyncing] = useState(false);
  const previousMusicsRef = useRef<Music[]>([]);

  const { setQueue, currentMusic, playNext, setIsPlaying, getNextMusic } = usePlayerStore();
  const { refreshTrigger, viewMode, setViewMode, triggerRefresh } = useAppStore();

  useEffect(() => {
    const fetchMusics = async () => {
      try {
        setLoading(true);
        const response = await musicService.getMusics(1, 100);
        if (response.success) {
          const data = response.context.data;
          setMusics(data);
          setQueue(data);
          previousMusicsRef.current = data;

          // Preload first track metadata if nothing is playing
          if (!currentMusic && data.length > 0) {
            const firstTrack = data[0];
            const audio = new Audio();
            audio.preload = 'metadata';
            audio.src = firstTrack.full_media_url;
          }
        }
      } catch (err) {
        setError('Failed to load music. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMusics();
  }, [refreshTrigger]);

  const handleDeleteClick = useCallback((music: Music) => {
    setMusicToDelete(music);
    setIsDeleteModalOpen(true);
  }, []);

  const confirmDelete = async () => {
    if (!musicToDelete) return;

    setIsDeleting(true);
    try {
      const response = await musicService.deleteMusic(musicToDelete.id);
      if (response.success) {
        if (currentMusic?.id === musicToDelete.id) {
          playNext();
          if (musics.length <= 1) {
            setIsPlaying(false);
          }
        }
        setIsDeleteModalOpen(false);
        triggerRefresh();
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete music. Please try again.');
    } finally {
      setIsDeleting(false);
      setMusicToDelete(null);
    }
  };

  // Only update local state during drag to keep it smooth
  const handleReorder = (newOrder: Music[]) => {
    setMusics(newOrder);
    setQueue(newOrder);
  };

  // Sync with API only when drag ends
  const syncReorder = useCallback(async () => {
    // Only sync if we are in priority sort mode and not searching
    if (sortBy !== 'priority' || searchTerm) return;

    // Check if order actually changed
    const orderChanged = musics.some((m, i) => m.id !== previousMusicsRef.current[i]?.id);
    if (!orderChanged) return;

    setIsSyncing(true);
    const originalOrder = [...previousMusicsRef.current];
    
    try {
      // Calculate new priorities: first item gets highest priority
      const updates = musics.map((music, index) => {
        const newPriority = (musics.length - index) * 10;
        if (music.priority !== newPriority) {
          return { id: music.id, priority: newPriority };
        }
        return null;
      }).filter(Boolean) as { id: number; priority: number }[];

      if (updates.length > 0) {
        await Promise.all(updates.map(u => musicService.updateMusic(u.id, { priority: u.priority })));
        
        // Update local state with new priorities to avoid drift
        const updatedMusics = musics.map(m => {
          const update = updates.find(u => u.id === m.id);
          return update ? { ...m, priority: update.priority } : m;
        });
        
        setMusics(updatedMusics);
        previousMusicsRef.current = updatedMusics;
      }
    } catch (err) {
      console.error('Reorder sync error:', err);
      // Rollback on error
      setMusics(originalOrder);
      setQueue(originalOrder);
      alert('Failed to save new order. Reverting changes.');
    } finally {
      setIsSyncing(false);
    }
  }, [musics, sortBy, searchTerm, setQueue]);

  const filteredAndSortedMusics = useMemo(() => {
    let result = [...musics];

    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (m) => m.name.toLowerCase().includes(term) || m.title.toLowerCase().includes(term)
      );
    }

    // Sort (only if not searching, as search results might break drag & drop logic)
    // IMPORTANT: If sortBy is 'priority', we use the array order directly as it's the source of truth for custom ordering
    if (!searchTerm) {
      if (sortBy === 'name') {
        result.sort((a, b) => a.name.localeCompare(b.name));
      } else if (sortBy === 'newest') {
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }
      // No sorting for 'priority' as the musics array order is the priority order
    }

    return result;
  }, [musics, searchTerm, sortBy]);

  const isDragEnabled = viewMode === 'list' && sortBy === 'priority' && !searchTerm;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="animate-spin text-spotify-green" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <p className="text-red-500 font-medium">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-app-text text-spotify-black px-6 py-2 rounded-full font-bold hover:scale-105 transition-transform"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-8 spotify-gradient transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center justify-between w-full md:w-auto">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-app-text">Good day</h1>
              {isSyncing && (
                <div className="flex items-center gap-2 text-spotify-green text-xs font-medium animate-pulse">
                  <Loader2 size={14} className="animate-spin" />
                  <span>Saving order...</span>
                </div>
              )}
            </div>
            <div className="md:hidden flex items-center bg-spotify-light rounded-full p-1 transition-colors">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-full transition-colors ${viewMode === 'grid' ? 'bg-black/10 dark:bg-white/10 text-app-text' : 'text-spotify-gray hover:text-app-text'}`}
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-full transition-colors ${viewMode === 'list' ? 'bg-black/10 dark:bg-white/10 text-app-text' : 'text-spotify-gray hover:text-app-text'}`}
              >
                <List size={18} />
              </button>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            {/* View Toggle - Desktop */}
            <div className="hidden md:flex items-center bg-spotify-light rounded-full p-1 transition-colors">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-full transition-colors ${viewMode === 'grid' ? 'bg-black/10 dark:bg-white/10 text-app-text' : 'text-spotify-gray hover:text-app-text'}`}
                title="Grid View"
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-full transition-colors ${viewMode === 'list' ? 'bg-black/10 dark:bg-white/10 text-app-text' : 'text-spotify-gray hover:text-app-text'}`}
                title="List View"
              >
                <List size={18} />
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative group w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-spotify-gray group-focus-within:text-app-text transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search songs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-spotify-light border-none rounded-full py-2 pl-10 pr-4 w-full sm:w-64 text-sm focus:ring-2 focus:ring-black/10 dark:focus:ring-white/20 transition-all outline-none text-app-text"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 bg-spotify-light rounded-full px-4 py-2 w-full sm:w-auto transition-colors">
              <SlidersHorizontal size={16} className="text-spotify-gray" />
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-sm font-medium outline-none cursor-pointer flex-1 text-app-text"
              >
                <option value="priority" className="bg-spotify-light">Custom Order</option>
                <option value="newest" className="bg-spotify-light">Newest</option>
                <option value="name" className="bg-spotify-light">A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {filteredAndSortedMusics.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-spotify-gray text-lg">No music found.</p>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                {filteredAndSortedMusics.map((music) => (
                  <MusicCard 
                    key={music.id} 
                    music={music} 
                    onDelete={handleDeleteClick}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-4 px-4 py-2 text-xs font-bold text-spotify-gray uppercase tracking-widest border-b border-white/5 mb-2">
                  {isDragEnabled && <div className="w-6" />}
                  <div className="w-8 text-right">#</div>
                  <div className="flex-1">Title</div>
                  <div className="hidden md:block w-40">Date Added</div>
                  <div className="hidden md:block w-12 text-right">Time</div>
                </div>
                
                {isDragEnabled ? (
                  <Reorder.Group 
                    as="div" 
                    axis="y" 
                    values={filteredAndSortedMusics} 
                    onReorder={handleReorder} 
                    className="flex flex-col gap-1"
                  >
                    {filteredAndSortedMusics.map((music, index) => (
                      <MusicListItem 
                        key={music.id} 
                        music={music} 
                        index={index} 
                        onDelete={handleDeleteClick}
                        onDragEnd={syncReorder}
                        isDraggable={true}
                      />
                    ))}
                  </Reorder.Group>
                ) : (
                  filteredAndSortedMusics.map((music, index) => (
                    <MusicListItem 
                      key={music.id} 
                      music={music} 
                      index={index} 
                      onDelete={handleDeleteClick}
                    />
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        loading={isDeleting}
        title="Confirm Delete"
        description={`Are you sure you want to delete "${musicToDelete?.name}" from your library? This action cannot be undone.`}
      />
    </div>
  );
};
