import { create } from 'zustand';

export const useUiStore = create((set) => ({
  sidebarOpen: false,
  toasts: [],
  activeModal: null,
  theme: localStorage.getItem('dailybite_theme') || 'dark',
  cart: JSON.parse(localStorage.getItem('dailybite_cart')) || [],

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

  addToCart: (item) => {
    set((state) => {
      const exists = state.cart.some((cartItem) => cartItem._id === item._id);
      if (exists) {
        return { cart: state.cart };
      }
      const updatedCart = [...state.cart, { ...item, quantity: 1 }];
      localStorage.setItem('dailybite_cart', JSON.stringify(updatedCart));
      return { cart: updatedCart };
    });
  },

  removeFromCart: (itemId) => {
    set((state) => {
      const updatedCart = state.cart.filter((cartItem) => cartItem._id !== itemId);
      localStorage.setItem('dailybite_cart', JSON.stringify(updatedCart));
      return { cart: updatedCart };
    });
  },

  clearCart: () => {
    localStorage.removeItem('dailybite_cart');
    set({ cart: [] });
  },
}));
