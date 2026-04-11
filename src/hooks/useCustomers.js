// src/hooks/useCustomers.js

import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import {
  customerKeys,
  getCustomers,
  getCustomerById,
  deleteCustomer,
} from '../api/customers';

const LIMIT = 10;

// ─── useCustomerList ──────────────────────────────────────────────────────────
export const useCustomerList = ({ page = 1, authMethod = '', search = '' } = {}) => {
  const queryClient = useQueryClient();
  const filters = { page, limit: LIMIT, authMethod, search };

  const query = useQuery({
    queryKey:        customerKeys.list(filters),
    queryFn:         () => getCustomers(filters),
    staleTime:       1000 * 60 * 2,
    placeholderData: (prev) => prev,
    select: (res) => ({
      // axios interceptor returns response.data directly
      // so res = { success, summary, data, page, pages }
      customers:  res.data,
      summary:    res.summary,
      total:      res.summary.total,
      totalPages: res.pages,
      page:       res.page,
    }),
  });

  const prefetchNext = () => {
    if (page < (query.data?.totalPages ?? 1)) {
      queryClient.prefetchQuery({
        queryKey: customerKeys.list({ ...filters, page: page + 1 }),
        queryFn:  () => getCustomers({ ...filters, page: page + 1 }),
        staleTime: 1000 * 60 * 2,
      });
    }
  };

  return { ...query, prefetchNext };
};

// ─── useCustomer ──────────────────────────────────────────────────────────────
export const useCustomer = (id) =>
  useQuery({
    queryKey: customerKeys.detail(id),
    queryFn:  () => getCustomerById(id),
    enabled:  !!id,
    staleTime: 1000 * 60 * 5,
  });

// ─── useDeleteCustomer ────────────────────────────────────────────────────────
export const useDeleteCustomer = (callbacks = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCustomer,

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: customerKeys.lists() });
      const previousLists = queryClient.getQueriesData({ queryKey: customerKeys.lists() });

      queryClient.setQueriesData({ queryKey: customerKeys.lists() }, (old) => {
        if (!old) return old;
        return {
          ...old,
          data:    old.data.filter((c) => c._id !== id),
          summary: { ...old.summary, total: old.summary.total - 1 },
        };
      });

      return { previousLists };
    },

    onError: (error, _, context) => {
      context?.previousLists?.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      callbacks.onError?.(error);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      callbacks.onSuccess?.();
    },
  });
};