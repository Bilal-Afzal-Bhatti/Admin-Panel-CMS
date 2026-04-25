// src/api/dashboard.js
import axiosInstance from './axiosInstance';

export const getDashboardStats = async () => {
  const res = await axiosInstance.get('/dashboard/stats');
  return res.data;
};

export const getDashboardChart = async (period = 'monthly') => {
  const res = await axiosInstance.get('/dashboard/chart', { params: { period } });
  return res.data;
};

export const getDashboardRecentOrders = async () => {
  const res = await axiosInstance.get('/dashboard/recent-orders');
  return res.data;
};