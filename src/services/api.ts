import axios from 'axios';

const API_BASE_URL = 'https://api-music.nntx.vn/api';
const STATIC_AUTH_TOKEN = 'fyMdjVTXcCVkHx7jOnV-AYhUyuvwjhzcazttW-AysiU';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'accept': '*/*',
  },
});

// Interceptor for login request (needs the static Bearer token)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  
  if (config.url === '/auth/login') {
    config.headers.Authorization = `Bearer ${STATIC_AUTH_TOKEN}`;
  } else if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

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
