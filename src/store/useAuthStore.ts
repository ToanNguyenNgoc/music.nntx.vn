import { create } from 'zustand';
import { User } from '../types';
import { authService } from '../services/api';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  expiredAt: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string, expiredAt?: string) => void;
  setToken: (token: string, expiredAt: string) => void;
  setUser: (user: User) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  accessToken: localStorage.getItem('accessToken'),
  expiredAt: localStorage.getItem('expiredAt'),
  isAuthenticated: !!localStorage.getItem('accessToken'),
  setAuth: (user, token, expiredAt) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('accessToken', token);
    if (expiredAt) localStorage.setItem('expiredAt', expiredAt);
    set({ user, accessToken: token, expiredAt, isAuthenticated: true });
  },
  setToken: (token, expiredAt) => {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('expiredAt', expiredAt);
    set({ accessToken: token, expiredAt, isAuthenticated: true });
  },
  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },
  logout: async () => {
    try {
      // Attempt API logout but don't block on failure
      await authService.logout().catch(err => console.warn('API Logout failed:', err));
    } finally {
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('expiredAt');
      set({ user: null, accessToken: null, expiredAt: null, isAuthenticated: false });
    }
  },
}));
