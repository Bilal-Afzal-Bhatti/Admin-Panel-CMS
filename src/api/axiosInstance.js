// src/api/axiosInstance.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://shoppingstore-backend.vercel.app' || 'http://localhost:5000/api/admin',
 
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});
console.log("Axios Instance Base URL:", axiosInstance.defaults.baseURL);
// ─── Request Interceptor ──────────────────────────────────────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
// ✅ Do NOT unwrap here — return the full axios response
// Unwrapping here breaks every consumer that expects res.data
axiosInstance.interceptors.response.use(
  (response) => response, // ← was response.data — that was the bug
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong';

    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = '/login';
    }

    if (error.response?.status === 403) {
      window.location.href = '/login';
    }

    return Promise.reject(new Error(message));
  }
);

export default axiosInstance;