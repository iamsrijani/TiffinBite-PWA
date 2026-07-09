import { create } from 'zustand';

export const useUiStore = create((set) => ({
  sidebarOpen: false,
  toasts: [],
  activeModal: null,
  theme: localStorage.getItem('dailybite_theme') || 'dark',

  toggleSidebar: (isOpen) => {
    set((state) => ({ sidebarOpen: isOpen !== undefined ? isOpen : !state.sidebarOpen }));
  },

  addToast: (message, type = 'info', duration = 4000) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { id, message, type, duration }],
    }));

    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
    }
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  openModal: (name, props = {}) => {
    set({ activeModal: { name, props } });
  },

  closeModal: () => {
    set({ activeModal: null });
  },

  toggleTheme: () => {
    set((state) => {
      const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('dailybite_theme', nextTheme);
      document.documentElement.setAttribute('data-theme', nextTheme);
      return { theme: nextTheme };
    });
  },
}));
