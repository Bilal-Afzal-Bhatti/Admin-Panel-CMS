// src/api/products.js

import axiosInstance from './axiosInstance';

// ─── Query Key Factory ────────────────────────────────────────────────────────
export const productKeys = {
  all:    ()            => ['products'],
  lists:  ()            => [...productKeys.all(), 'list'],
  list:   (page, limit) => [...productKeys.lists(), { page, limit }],
  detail: (id)          => [...productKeys.all(), 'detail', id],
};

// ─── API Functions ────────────────────────────────────────────────────────────
export const getProducts = async ({ page = 1, limit = 10 } = {}) => {
  return axiosInstance.get('/products', { params: { page, limit } });
  // returns { success, data, total, page, pages }
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