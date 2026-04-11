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

const STALE = 1000 * 60 * 5; // 5 min — settings don't change often

// ─── Profile ──────────────────────────────────────────────────────────────────
export const useProfile = () =>
  useQuery({
    queryKey: settingsKeys.profile(),
    queryFn:  getProfile,
    staleTime: STALE,
  });

export const useUpdateProfile = (callbacks = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(settingsKeys.profile(), data); // instant cache update
      callbacks.onSuccess?.(data);
    },
    onError: (error) => callbacks.onError?.(error),
  });
};

export const useChangePassword = (callbacks = {}) =>
  useMutation({
    mutationFn: changePassword,
    onSuccess: () => callbacks.onSuccess?.(),
    onError:   (error) => callbacks.onError?.(error),
  });

// ─── Store ────────────────────────────────────────────────────────────────────
export const useStoreSettings = () =>
  useQuery({
    queryKey: settingsKeys.store(),
    queryFn:  getStoreSettings,
    staleTime: STALE,
  });

export const useUpdateStoreSettings = (callbacks = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateStoreSettings,
    onSuccess: (data) => {
      queryClient.setQueryData(settingsKeys.store(), data);
      callbacks.onSuccess?.(data);
    },
    onError: (error) => callbacks.onError?.(error),
  });
};

// ─── Notifications ────────────────────────────────────────────────────────────
export const useNotificationSettings = () =>
  useQuery({
    queryKey: settingsKeys.notifications(),
    queryFn:  getNotificationSettings,
    staleTime: STALE,
  });

export const useUpdateNotificationSettings = (callbacks = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateNotificationSettings,
    onMutate: async (newSettings) => {
      // Optimistic update — toggle feels instant
      await queryClient.cancelQueries({ queryKey: settingsKeys.notifications() });
      const previous = queryClient.getQueryData(settingsKeys.notifications());
      queryClient.setQueryData(settingsKeys.notifications(), newSettings);
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