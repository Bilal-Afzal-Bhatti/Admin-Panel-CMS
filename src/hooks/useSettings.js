// src/hooks/useSettings.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  settingsKeys,
  getProfile,
  updateProfile,
  changePassword,
  getStoreSettings,
  updateStoreSettings,
  getNotificationSettings,
  updateNotificationSettings,
} from '../api/settings';

const STALE = 1000 * 60 * 5; // 5 min

// ─── Profile ──────────────────────────────────────────────────────────────────
// axios interceptor returns { success, data, message }
// select unwraps it so components receive the admin object directly
export const useProfile = () =>
  useQuery({
    queryKey:  settingsKeys.profile(),
    queryFn:   getProfile,
    staleTime: STALE,
    select:    (res) => res.data, // ✅ components get admin object directly
  });

export const useUpdateProfile = (callbacks = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (res) => {
      queryClient.setQueryData(settingsKeys.profile(), res.data); // update cache with unwrapped data
      callbacks.onSuccess?.(res.data);
    },
    onError: (error) => callbacks.onError?.(error),
  });
};

export const useChangePassword = (callbacks = {}) =>
  useMutation({
    mutationFn: changePassword,
    onSuccess:  () => callbacks.onSuccess?.(),
    onError:    (error) => callbacks.onError?.(error),
  });

// ─── Store ────────────────────────────────────────────────────────────────────
export const useStoreSettings = () =>
  useQuery({
    queryKey:  settingsKeys.store(),
    queryFn:   getStoreSettings,
    staleTime: STALE,
    select:    (res) => res.data, // ✅ components get store object directly
  });

export const useUpdateStoreSettings = (callbacks = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateStoreSettings,
    onSuccess: (res) => {
      queryClient.setQueryData(settingsKeys.store(), res.data);
      callbacks.onSuccess?.(res.data);
    },
    onError: (error) => callbacks.onError?.(error),
  });
};

// ─── Notifications ────────────────────────────────────────────────────────────
export const useNotificationSettings = () =>
  useQuery({
    queryKey:  settingsKeys.notifications(),
    queryFn:   getNotificationSettings,
    staleTime: STALE,
    select:    (res) => res.data, // ✅ components get notif object directly
  });

export const useUpdateNotificationSettings = (callbacks = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateNotificationSettings,

    onMutate: async (newSettings) => {
      await queryClient.cancelQueries({ queryKey: settingsKeys.notifications() });

      // snapshot is already unwrapped (because select runs on read)
      const previous = queryClient.getQueryData(settingsKeys.notifications());

      // optimistically set unwrapped data directly
      queryClient.setQueryData(settingsKeys.notifications(), (old) => ({
        ...old,
        data: newSettings, // keep wrapper shape so select still works on re-read
      }));

      return { previous };
    },

    onError: (_, __, context) => {
      queryClient.setQueryData(settingsKeys.notifications(), context?.previous);
      callbacks.onError?.();
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.notifications() });
      callbacks.onSuccess?.();
    },
  });
};