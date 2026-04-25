// src/api/admin.js
import axiosInstance from './axiosInstance';

// ─── Products ─────────────────────────────────────────────────────────────────
export const getProducts = async ({ page = 1, limit = 10, category, search } = {}) => {
  const res = await axiosInstance.get('/products', {
    params: { page, limit, category, search }
  });
  return res.data;
};

// ─── Orders ───────────────────────────────────────────────────────────────────
export const getOrders = async ({ page = 1, limit = 10, search = '', status = '' } = {}) => {
  const res = await axiosInstance.get('/orders', {
    params: { page, limit, search, status }
  });
  return res.data;
};

export const updateOrderStatus = async ({ orderId, status }) => {
  const res = await axiosInstance.patch(`/orders/${orderId}/status`, { status });
  return res.data;
};

// ─── Cancellations ────────────────────────────────────────────────────────────
export const getCancellations = async () => {
  const res = await axiosInstance.get('/orders/cancellations');
  return res.data.data;
};

export const processCancellation = async ({ cancellationId, action, adminComment }) => {
  const res = await axiosInstance.patch(`/orders/cancellations/${cancellationId}`, {
    action,
    adminComment,
  });
  return res.data;
};

// ─── Customers ────────────────────────────────────────────────────────────────
export const getCustomers = async () => {
  const res = await axiosInstance.get('/customers');
  return res.data;
};

export const getCustomerById = async (id) => {
  const res = await axiosInstance.get(`/customers/${id}`);
  return res.data;
};

export const deleteCustomer = async (id) => {
  const res = await axiosInstance.delete(`/customers/${id}`);
  return res.data;
};

// ─── Settings ─────────────────────────────────────────────────────────────────
export const getProfile = async () => {
  const res = await axiosInstance.get('/settings/profile');
  return res.data;
};

export const updateProfile = async (data) => {
  const res = await axiosInstance.put('/settings/profile', data);
  return res.data;
};

export const getStoreSettings = async () => {
  const res = await axiosInstance.get('/settings/store');
  return res.data;
};

export const updateStoreSettings = async (data) => {
  const res = await axiosInstance.put('/settings/store', data);
  return res.data;
};