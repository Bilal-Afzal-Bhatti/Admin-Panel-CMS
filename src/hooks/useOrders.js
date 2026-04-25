// src/hooks/useOrders.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getOrders,
  updateOrderStatus,
  getCancellations,
  processCancellation,
} from '../api/admin';

// ─── useOrderList ─────────────────────────────────────────────────────────────
export const useOrderList = ({ page = 1, search = '', status = '' } = {}) => {
  return useQuery({
    queryKey:  ['orders', page, search, status],
    queryFn:   () => getOrders({ page, limit: 10, search, status }),
    keepPreviousData: true,
    staleTime: 1000 * 60 * 2,
  });
};

// ─── useUpdateOrderStatus ─────────────────────────────────────────────────────
export const useUpdateOrderStatus = (callbacks = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateOrderStatus, // { orderId, status }
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      callbacks.onSuccess?.(data);
    },
    onError: (error) => callbacks.onError?.(error),
  });
};

// ─── useCancellations ─────────────────────────────────────────────────────────
export const useCancellations = () => {
  return useQuery({
    queryKey: ['cancellations'],
    queryFn:  getCancellations,
    staleTime: 1000 * 60 * 2,
  });
};

// ─── useProcessCancellation ───────────────────────────────────────────────────
export const useProcessCancellation = (callbacks = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cancellationId, action, adminComment }) =>
      processCancellation({ cancellationId, action, adminComment }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cancellations'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      callbacks.onSuccess?.(data);
    },
    onError: (error) => callbacks.onError?.(error),
  });
};