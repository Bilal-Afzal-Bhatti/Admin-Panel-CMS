// src/api/products.js
import axiosInstance from './axiosInstance';

// ─── Query Key Factory ────────────────────────────────────────────────────────
export const productKeys = {
  all:     ()            => ['products'],
  lists:   ()            => [...productKeys.all(), 'list'],
  list:    (page, limit) => [...productKeys.lists(), { page, limit }],
  detail:  (id)          => [...productKeys.all(), 'detail', id],
  // 🌟 Added for Industry Standard 4
  leaderboard: (category) => [...productKeys.all(), 'leaderboard', category],
};

// ─── Existing API Functions ───────────────────────────────────────────────────
export const getProducts = async ({ page = 1, limit = 10 } = {}) => {
  return axiosInstance.get('/products', { params: { page, limit } });
};

export const getProductById = async (id) => {
  const res = await axiosInstance.get(`/products/${id}`);
  return res.data;
};

export const addProduct = async (productData) => {
  const res = await axiosInstance.post('/products', productData);
  return res.data;
};

export const updateProduct = async ({ id, ...productData }) => {
  const res = await axiosInstance.put(`/products/${id}`, productData);
  return res.data;
};

export const deleteProduct = async (id) => {
  await axiosInstance.delete(`/products/${id}`);
  return id;
};

// ─── New Color Variant Functions ─────────────────────────────────────────────
export const addProductColor = async ({ productId, colorData }) => {
  // colorData expects: { name, hex, stock }
  const res = await axiosInstance.post(`/products/${productId}/colors`, colorData);
  return res.data;
};

export const removeProductColor = async ({ productId, colorId }) => {
  const res = await axiosInstance.delete(`/products/${productId}/colors/${colorId}`);
  return res.data;
};

// ─── New Ratings & Analytics Functions ───────────────────────────────────────
export const addProductReview = async ({ productId, rating }) => {
  // Expects { rating: 1-5 }
  const res = await axiosInstance.post(`/products/${productId}/reviews`, { rating });
  return res.data;
};

export const getProductLeaderboard = async (category) => {
  const res = await axiosInstance.get(`/leaderboard/${category}`);
  return res.data; 
  // returns { success, data: [...] } where data is your top 10 list
};