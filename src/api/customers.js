// src/api/customers.js

import axiosInstance from './axiosInstance';

// ─── Query Key Factory ────────────────────────────────────────────────────────
export const customerKeys = {
  all:    ()          => ['customers'],
  lists:  ()          => [...customerKeys.all(), 'list'],
  list:   (filters)   => [...customerKeys.lists(), filters],
  detail: (id)        => [...customerKeys.all(), 'detail', id],
};

// ─── API Functions ────────────────────────────────────────────────────────────
export const getCustomers = async ({ page = 1, limit = 10, authMethod = '', search = '' } = {}) => {
  const params = { page, limit };
  if (authMethod) params.authMethod = authMethod;
  if (search)     params.search     = search;

  return axiosInstance.get('/customers', { params });
  // returns { success, summary, data, page, pages }
};

export const getCustomerById = async (id) => {
  const res = await axiosInstance.get(`/customers/${id}`);
  return res.data;
};

export const deleteCustomer = async (id) => {
  await axiosInstance.delete(`/customers/${id}`);
  return id;
};