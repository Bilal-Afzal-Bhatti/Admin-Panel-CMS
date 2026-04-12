// src/api/settings.js
import axiosInstance from './axiosInstance';

// ─── Query Key Factory ────────────────────────────────────────────────────────
export const settingsKeys = {
  all:           () => ['settings'],
  profile:       () => [...settingsKeys.all(), 'profile'],
  store:         () => [...settingsKeys.all(), 'store'],
  notifications: () => [...settingsKeys.all(), 'notifications'],
};

// ─── Profile ──────────────────────────────────────────────────────────────────
// axiosInstance interceptor already returns response.data directly
// so the result here is already { success, data, message }

export const getProfile = async () => {
  return axiosInstance.get('/settings/profile');
};

export const updateProfile = async (data) => {
  return axiosInstance.put('/settings/profile', data);
};

export const changePassword = async (data) => {
  return axiosInstance.put('/settings/password', data);
};

// ─── Store ────────────────────────────────────────────────────────────────────
export const getStoreSettings = async () => {
  return axiosInstance.get('/settings/store');
};

export const updateStoreSettings = async (data) => {
  return axiosInstance.put('/settings/store', data);
};

// ─── Notifications ────────────────────────────────────────────────────────────
export const getNotificationSettings = async () => {
  return axiosInstance.get('/settings/notifications');
};

export const updateNotificationSettings = async (data) => {
  return axiosInstance.put('/settings/notifications', data);
};