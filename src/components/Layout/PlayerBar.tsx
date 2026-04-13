import { 
  SkipBack, SkipForward, Volume2, VolumeX, 
  Repeat, Shuffle, ListMusic, Loader2
} from 'lucide-react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import { PlayPauseButton } from '../UI/PlayPauseButton';
import { NowPlayingIndicator } from '../UI/NowPlayingIndicator';

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const PlayerBar = () => {
  const {
    currentMusic,
    isPlaying,
    volume,
    isMuted,
    currentTime,
    duration,
    isLoading,
    setIsPlaying,
    setVolume,
    setIsMuted,
    playNext,
    playPrevious,
    repeatMode,
    setRepeatMode,
    isShuffle,
    setIsShuffle
  } = usePlayerStore();

  const { seek } = useAudioPlayer();

  if (!currentMusic) return null;

  return (
    <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-50 px-2 md:px-0">
      <div className="h-16 md:h-24 bg-spotify-dark/95 md:bg-spotify-black backdrop-blur-md md:backdrop-blur-none border-t border-black/5 dark:border-white/5 px-4 flex items-center justify-between rounded-lg md:rounded-none shadow-2xl md:shadow-none transition-colors duration-300">
        {/* Mobile Progress Bar (Top of bar) */}
        <div className="md:hidden absolute top-0 left-0 right-0 h-0.5 bg-black/10 dark:bg-white/10 overflow-hidden rounded-t-lg">
          <div 
            className={`h-full bg-app-text transition-all duration-100 ${isLoading ? 'animate-pulse bg-spotify-green' : ''}`}
            style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
          />
        </div>

        {/* Current Track Info */}
        <div className="flex items-center gap-3 md:gap-4 w-full md:w-[30%] overflow-hidden">
          <div className="relative flex-shrink-0">
            <img 
              src={currentMusic.thumbnail} 
              alt={currentMusic.name}
              className={`w-10 h-10 md:w-14 md:h-14 rounded shadow-lg object-cover transition-opacity ${isLoading ? 'opacity-50' : 'opacity-100'}`}
              referrerPolicy="no-referrer"
            />
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 size={20} className="text-app-text animate-spin" />
              </div>
            )}
          </div>
          <div className="flex flex-col overflow-hidden">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="text-sm font-medium text-app-text truncate">
                {currentMusic.name}
              </span>
              <NowPlayingIndicator isPlaying={isPlaying} className="scale-50 origin-left flex-shrink-0" />
            </div>
            <span className="text-xs text-spotify-gray truncate">
              {currentMusic.title}
            </span>
          </div>
        </div>

        {/* Player Controls - Desktop */}
        <div className="hidden md:flex flex-col items-center gap-2 max-w-[40%] w-full">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsShuffle(!isShuffle)}
              className={`${isShuffle ? 'text-spotify-green' : 'text-spotify-gray'} hover:text-app-text transition-colors`}
            >
              <Shuffle size={18} />
            </button>
            <button 
              onClick={playPrevious}
              className="text-spotify-gray hover:text-app-text transition-colors"
            >
              <SkipBack size={24} fill="currentColor" />
            </button>
            <PlayPauseButton
              isPlaying={isPlaying}
              isLoading={isLoading}
              onClick={() => setIsPlaying(!isPlaying)}
              size={20}
              className="w-8 h-8 rounded-full bg-app-text text-spotify-black shadow-lg transition-colors"
            />
            <button 
              onClick={playNext}
              className="text-spotify-gray hover:text-app-text transition-colors"
            >
              <SkipForward size={24} fill="currentColor" />
            </button>
            <button 
              onClick={() => setRepeatMode(repeatMode === 'none' ? 'all' : repeatMode === 'all' ? 'one' : 'none')}
              className={`${repeatMode !== 'none' ? 'text-spotify-green' : 'text-spotify-gray'} hover:text-app-text transition-colors relative`}
            >
              <Repeat size={18} />
              {repeatMode === 'one' && <span className="absolute -top-1 -right-1 text-[8px] font-bold">1</span>}
            </button>
          </div>

          <div className="flex items-center gap-2 w-full">
            <span className="text-[10px] text-spotify-gray w-10 text-right">
              {formatTime(currentTime)}
            </span>
            <div className="flex-1 h-1 bg-spotify-light rounded-full relative group cursor-pointer transition-colors">
              <input
                type="range"
                min={0}
                max={duration || 0}
                value={currentTime}
                onChange={(e) => seek(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div 
                className={`h-full bg-app-text group-hover:bg-spotify-green rounded-full relative transition-colors ${isLoading ? 'bg-spotify-green/50' : ''}`}
                style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-app-text rounded-full opacity-0 group-hover:opacity-100 shadow-xl transition-colors" />
              </div>
            </div>
            <span className="text-[10px] text-spotify-gray w-10">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        <div className="md:hidden flex items-center gap-4">
          <PlayPauseButton
            isPlaying={isPlaying}
            isLoading={isLoading}
            onClick={() => setIsPlaying(!isPlaying)}
            size={28}
            className="text-app-text p-2 transition-colors"
          />
        </div>

        {/* Volume & Extra Controls - Desktop */}
        <div className="hidden md:flex items-center justify-end gap-3 w-[30%]">
          <button className="text-spotify-gray hover:text-app-text transition-colors">
            <ListMusic size={18} />
          </button>
          <div className="flex items-center gap-2 w-32">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className="text-spotify-gray hover:text-app-text transition-colors"
            >
              {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <div className="flex-1 h-1 bg-spotify-light rounded-full relative group cursor-pointer transition-colors">
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div 
                className="h-full bg-app-text group-hover:bg-spotify-green rounded-full relative transition-colors"
                style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-app-text rounded-full opacity-0 group-hover:opacity-100 shadow-xl transition-colors" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
