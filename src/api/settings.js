// src/api/settings.js
import axiosInstance from './axiosInstance';

// ─── Query Key Factory ────────────────────────────────────────────────────────
export const settingsKeys = {
  all:           ()  => ['settings'],
  profile:       ()  => [...settingsKeys.all(), 'profile'],
  store:         ()  => [...settingsKeys.all(), 'store'],
  notifications: ()  => [...settingsKeys.all(), 'notifications'],
};

// ─── Profile ──────────────────────────────────────────────────────────────────
export const getProfile = async () => {
  const res = await axiosInstance.get('/settings/profile');
  return res.data;
};

export const updateProfile = async (data) => {
  const res = await axiosInstance.put('/settings/profile', data);
  return res.data;
};

export const changePassword = async (data) => {
  const res = await axiosInstance.put('/settings/password', data);
  return res;
};

// ─── Store ────────────────────────────────────────────────────────────────────
export const getStoreSettings = async () => {
  const res = await axiosInstance.get('/settings/store');
  return res.data;
};

export const updateStoreSettings = async (data) => {
  const res = await axiosInstance.put('/settings/store', data);
  return res.data;
};

// ─── Notifications ────────────────────────────────────────────────────────────
export const getNotificationSettings = async () => {
  const res = await axiosInstance.get('/settings/notifications');
  return res.data;
};

export const updateNotificationSettings = async (data) => {
  const res = await axiosInstance.put('/settings/notifications', data);
  return res.data;
};