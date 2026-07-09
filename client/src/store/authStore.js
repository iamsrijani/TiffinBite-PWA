import { create } from 'zustand';
import { authService } from '../services/api.js';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('dailybite_token') || null,
  isAuthenticated: !!localStorage.getItem('dailybite_token'),
  isLoading: false,

  login: (token, user) => {
    localStorage.setItem('dailybite_token', token);
    set({ token, user, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    localStorage.removeItem('dailybite_token');
    set({ token: null, user: null, isAuthenticated: false, isLoading: false });
  },

  setUser: (user) => {
    set({ user });
  },

  checkAuth: async () => {
    const token = get().token;
    if (!token) {
      set({ isAuthenticated: false, isLoading: false, user: null });
      return null;
    }

    set({ isLoading: true });
    try {
      const response = await authService.getMe();
      if (response.success && response.data) {
        set({ user: response.data, isAuthenticated: true, isLoading: false });
        return response.data;
      } else {
        get().logout();
        return null;
      }
    } catch (error) {
      console.error('Session restoration failed:', error);
      get().logout();
      return null;
    }
  },
}));
