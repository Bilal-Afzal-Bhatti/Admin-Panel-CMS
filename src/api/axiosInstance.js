// src/api/axiosInstance.js

import axios from 'axios';

// ─── Base Instance ────────────────────────────────────────────────────────────
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/admin',
  timeout: 10000, // 10s — request auto-cancelled if server doesn't respond
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
// Attaches token to EVERY request automatically — never repeat this again
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
// Handles errors globally — no manual if (!res.ok) in every file
axiosInstance.interceptors.response.use(
  (response) => response.data, // unwrap axios envelope — return data directly
  (error) => {
    const message =
      error.response?.data?.message || // server error message
      error.message ||                 // axios/network error
      'Something went wrong';

    // ── Global 401 handler — token expired or invalid ──
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = '/login'; // redirect to login
    }

    // ── Global 403 handler — not an admin ──
    if (error.response?.status === 403) {
      window.location.href = '/login';
    }

    return Promise.reject(new Error(message));
  }
);

export default axiosInstance;