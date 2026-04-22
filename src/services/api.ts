import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import { RefreshTokenResponse } from '../types';

const API_BASE_URL = 'https://api-music.nntx.vn/api';
const STATIC_AUTH_TOKEN = 'fyMdjVTXcCVkHx7jOnV-AYhUyuvwjhzcazttW-AysiU';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'accept': '*/*',
  },
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Interceptor for requests
api.interceptors.request.use(async (config) => {
  const { accessToken, expiredAt, setToken, logout } = useAuthStore.getState();
  
  // Proactive refresh: if token is about to expire (within 5 minutes)
  if (accessToken && expiredAt && config.url !== '/auth/refresh' && config.url !== '/auth/login') {
    const expirationTime = new Date(expiredAt).getTime();
    const now = new Date().getTime();
    const fiveMinutes = 5 * 60 * 1000;

    if (expirationTime - now < fiveMinutes) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const response = await axios.post<RefreshTokenResponse>(`${API_BASE_URL}/auth/refresh`, {
            accessToken: accessToken,
          }, {
            headers: {
              'Authorization': `Bearer ${STATIC_AUTH_TOKEN}`,
              'Content-Type': 'application/json',
            }
          });

          if (response.data.success) {
            const { access_token, expired_at } = response.data.context.data;
            setToken(access_token, expired_at);
            config.headers.Authorization = `Bearer ${access_token}`;
            processQueue(null, access_token);
          }
        } catch (error) {
          processQueue(error, null);
          logout();
        } finally {
          isRefreshing = false;
        }
      } else {
        // Wait for current refresh to finish
        return new Promise((resolve) => {
          failedQueue.push({
            resolve: (token: string) => {
              config.headers.Authorization = `Bearer ${token}`;
              resolve(config);
            },
            reject: (err: any) => {
              resolve(Promise.reject(err));
            }
          });
        });
      }
    }
  }

  const token = useAuthStore.getState().accessToken;
  if (config.url === '/auth/login') {
    config.headers.Authorization = `Bearer ${STATIC_AUTH_TOKEN}`;
  } else if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// Interceptor for responses (Handle 401)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const { accessToken, logout, setToken } = useAuthStore.getState();

    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/login') {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch((err) => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post<RefreshTokenResponse>(`${API_BASE_URL}/auth/refresh`, {
          accessToken: accessToken,
        }, {
          headers: {
            'Authorization': `Bearer ${STATIC_AUTH_TOKEN}`,
            'Content-Type': 'application/json',
          }
        });

        if (response.data.success) {
          const { access_token, expired_at } = response.data.context.data;
          setToken(access_token, expired_at);
          api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          processQueue(null, access_token);
          return api(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const musicService = {
  getMusics: async (page = 1, limit = 15, sort = '-created_at') => {
    const response = await api.get(`/musics`, {
      params: { page, limit, sort },
    });
    return response.data;
  },
  importMusic: async (data: any) => {
    const response = await api.post('/musics', data, {
      headers: {
        Authorization: `Bearer ${STATIC_AUTH_TOKEN}`,
      },
    });
    return response.data;
  },
  deleteMusic: async (id: number) => {
    const response = await api.delete(`/musics/${id}`, {
      headers: {
        Authorization: `Bearer ${STATIC_AUTH_TOKEN}`,
      },
    });
    return response.data;
  },
  updateMusic: async (id: number, data: { priority?: number }) => {
    const response = await api.put(`/musics/${id}`, data, {
      headers: {
        Authorization: `Bearer ${STATIC_AUTH_TOKEN}`,
      },
    });
    return response.data;
  },
};

export const youtubeService = {
  search: async (keyword: string, page = 1, limit = 15) => {
    const response = await api.get('/youtube', {
      params: { search: keyword, page, limit, sort: '-created_at' },
      headers: {
        Authorization: `Bearer ${STATIC_AUTH_TOKEN}`,
      },
    });
    return response.data;
  },
  convertToMp3: async (url: string) => {
    const response = await api.post('/youtube/mp3', { url });
    return response.data;
  },
  getStatus: async (jobId: string) => {
    const response = await api.get(`/youtube/mp3/status/${jobId}`);
    return response.data;
  },
};

export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  register: async (data: any) => {
    const response = await api.post('/auth/register', data, {
      headers: {
        Authorization: `Bearer ${STATIC_AUTH_TOKEN}`,
      },
    });
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};
