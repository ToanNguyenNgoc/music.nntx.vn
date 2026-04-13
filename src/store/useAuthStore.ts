import { create } from 'zustand';
import { User } from '../types';
import { authService } from '../services/api';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  setUser: (user: User) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  accessToken: localStorage.getItem('accessToken'),
  isAuthenticated: !!localStorage.getItem('accessToken'),
  setAuth: (user, token) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('accessToken', token);
    set({ user, accessToken: token, isAuthenticated: true });
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
      set({ user: null, accessToken: null, isAuthenticated: false });
    }
  },
}));
