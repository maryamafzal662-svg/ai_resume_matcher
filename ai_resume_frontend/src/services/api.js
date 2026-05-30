// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/', // Added trailing slash
});

// Attach token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const authRoutes = ['/custom-login/', '/register/', '/password-reset/', '/password-reset-confirm/'];

    if (token && !authRoutes.some((route) => config.url.endsWith(route))) {
      config.headers.Authorization = `Token ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
