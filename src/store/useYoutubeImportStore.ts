import { create } from 'zustand';
import { youtubeService, musicService } from '../services/api';
import { YoutubeSearchItem, YoutubeImportStatus } from '../types';

interface ImportState {
  status: YoutubeImportStatus;
  progress: number;
  error: string | null;
}

interface YoutubeImportStore {
  imports: Record<string, ImportState>;
  startImport: (item: YoutubeSearchItem, triggerRefresh: () => void) => Promise<void>;
  getImportState: (id: string) => ImportState;
}

const DEFAULT_STATE: ImportState = {
  status: 'idle',
  progress: 0,
  error: null,
};

export const useYoutubeImportStore = create<YoutubeImportStore>((set, get) => ({
  imports: {},

  getImportState: (id) => {
    return get().imports[id] || DEFAULT_STATE;
  },

  startImport: async (item, triggerRefresh) => {
    const { id } = item;
    const currentState = get().getImportState(id);
    
    if (currentState.status === 'converting' || currentState.status === 'importing' || currentState.status === 'imported') {
      return;
    }

    const updateState = (newState: Partial<ImportState>) => {
      set((state) => ({
        imports: {
          ...state.imports,
          [id]: { ...(state.imports[id] || DEFAULT_STATE), ...newState },
        },
      }));
    };

    updateState({ status: 'converting', progress: 0, error: null });

    try {
      const response = await youtubeService.convertToMp3(item.url);
      if (!response.success) {
        updateState({ status: 'failed', error: 'Failed to start conversion' });
        return;
      }

      const { job_id, origin_url } = response.context;

      // Polling
      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await youtubeService.getStatus(job_id);
          if (statusRes.success) {
            const { status: jobStatus, progress: jobProgress, media_url } = statusRes.context;
            updateState({ progress: jobProgress || 0 });

            if (jobStatus === 'done') {
              clearInterval(pollInterval);
              
              // Start Importing
              updateState({ status: 'importing' });
              
              try {
                let relativeUrl = media_url || origin_url;
                if (relativeUrl.includes('/media/')) {
                  relativeUrl = '/media/' + relativeUrl.split('/media/')[1];
                }

                await musicService.importMusic({
                  title: item.channel,
                  name: item.title,
                  thumbnail: item.thumbnail,
                  media_url: relativeUrl,
                  priority: 0
                });

                updateState({ status: 'imported' });
                triggerRefresh();
              } catch (err) {
                console.error('Import error:', err);
                updateState({ status: 'failed', error: 'Failed to add to library' });
              }
            } else if (jobStatus === 'failed') {
              clearInterval(pollInterval);
              updateState({ status: 'failed', error: 'Conversion failed on server' });
            }
          }
        } catch (err) {
          console.error('Polling error:', err);
          // Continue polling
        }
      }, 1000);

    } catch (err) {
      console.error('Convert error:', err);
      updateState({ status: 'failed', error: 'Service error' });
    }
  },
}));
