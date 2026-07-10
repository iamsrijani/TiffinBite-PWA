import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('dailybite_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle auth errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('dailybite_token');
      // Redirect to login if window is available
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(
      error.response?.data || { success: false, message: 'Network error or server unreachable' }
    );
  }
);

// API Services
export const authService = {
  login: (phone) => api.post('/auth/login', { phone }),
  register: (data) => api.put('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export const menuService = {
  getMenuByDate: (date) => api.get('/menu', { params: { date } }),
  getWeeklyMenu: () => api.get('/menu/weekly'),
  createMenu: (data) => api.post('/menu', data),
  updateMenu: (id, data) => api.put(`/menu/${id}`, data),
  deleteMenu: (id) => api.delete(`/menu/${id}`),
  publishMenu: (id) => api.patch(`/menu/${id}/publish`),
};

export const subscriptionService = {
  create: (data) => api.post('/subscriptions', data),
  getMy: () => api.get('/subscriptions'),
  pause: (id, pausedDates) => api.patch(`/subscriptions/${id}/pause`, { pausedDates }),
  resume: (id, resumeDates) => api.patch(`/subscriptions/${id}/resume`, { resumeDates }),
  cancel: (id) => api.patch(`/subscriptions/${id}/cancel`),
};

export const orderService = {
  getMy: (page = 1) => api.get('/orders', { params: { page } }),
  getById: (id) => api.get(`/orders/${id}`),
  getTodays: () => api.get('/orders/today'),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  submitFeedback: (id, rating, comment) => api.post(`/orders/${id}/feedback`, { rating, comment }),
};

export const walletService = {
  get: () => api.get('/wallet'),
  addFunds: (amount) => api.post('/wallet/add-funds', { amount }),
  getTransactions: (page = 1) => api.get('/wallet/transactions', { params: { page } }),
  createOrder: (amount) => api.post('/wallet/create-order', { amount }),
  verifyPayment: (data) => api.post('/wallet/verify-payment', data),
};

export const deliveryService = {
  getMy: () => api.get('/delivery'),
  getStats: () => api.get('/delivery/stats'),
  getById: (id) => api.get(`/delivery/${id}`),
  updateStatus: (id, status) => api.patch(`/delivery/${id}/status`, { status }),
  submitProof: (id, formData) => {
    // Form data is required for file upload (image)
    return api.post(`/delivery/${id}/proof`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export const adminService = {
  getStats: () => api.get('/admin/stats'),
  getForecast: () => api.get('/admin/forecast'),
  getCustomers: (page = 1, search = '') => api.get('/admin/customers', { params: { page, search } }),
  getCustomerById: (id) => api.get(`/admin/customers/${id}`),
  issueRefund: (userId, amount, description) => api.post('/admin/refund', { userId, amount, description }),
  getFeedback: (page = 1) => api.get('/admin/feedback', { params: { page } }),
  assignDelivery: (orderId, deliveryPartnerId) => api.post('/admin/assign-delivery', { orderId, deliveryPartnerId }),
};

export const notificationService = {
  get: () => api.get('/notifications'),
  markAllRead: () => api.patch('/notifications/read-all'),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
};

export default api;
