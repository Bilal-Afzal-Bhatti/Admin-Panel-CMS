// src/api/products.js
import axiosInstance from './axiosInstance';

export const productKeys = {
  all:         ()            => ['products'],
  lists:       ()            => [...productKeys.all(), 'list'],
  list:        (page, limit) => [...productKeys.lists(), { page, limit }],
  detail:      (id)          => [...productKeys.all(), 'detail', id],
  leaderboard: (category)    => [...productKeys.all(), 'leaderboard', category],
};

// ─── Products ─────────────────────────────────────────────────────────────────
export const getProducts = async ({ page = 1, limit = 10 } = {}) => {
  const res = await axiosInstance.get('/products', { params: { page, limit } });
  return res.data; // { success, data, total, page, pages }
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

// ─── Variants ─────────────────────────────────────────────────────────────────
export const addProductVariant = async ({ productId, variantData }) => {
  const res = await axiosInstance.post(`/products/${productId}/variants`, variantData);
  return res.data;
};

export const updateProductVariantStock = async ({ productId, variantId, stock }) => {
  const res = await axiosInstance.patch(`/products/${productId}/variants/${variantId}`, { stock });
  return res.data;
};

export const removeProductVariant = async ({ productId, variantId }) => {
  const res = await axiosInstance.delete(`/products/${productId}/variants/${variantId}`);
  return res.data;
};

// ─── Ratings & Analytics ──────────────────────────────────────────────────────
export const addProductReview = async ({ productId, rating }) => {
  const res = await axiosInstance.post(`/products/${productId}/review`, { rating });
  return res.data;
};

export const getProductLeaderboard = async (category) => {
  const res = await axiosInstance.get(`/products/leaderboard/${category}`);
  return res.data;
};