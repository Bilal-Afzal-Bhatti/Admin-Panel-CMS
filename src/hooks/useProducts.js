// src/hooks/useProducts.js

import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import {
  productKeys,
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
} from '../api/products';

const LIMIT = 10;

// ─── useProductList ───────────────────────────────────────────────────────────
export const useProductList = (page = 1) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey:        productKeys.list(page, LIMIT),
    queryFn:         () => getProducts({ page, limit: LIMIT }),
    staleTime:       1000 * 60 * 2,
    placeholderData: (prev) => prev,
    select: (res) => ({
      // axios interceptor returns response.data directly
      // so res = { success, data, total, page, pages }
      products:   res.data,
      total:      res.total,
      totalPages: res.pages,
      page:       res.page,
    }),
  });

  const prefetchNext = () => {
    if (page < (query.data?.totalPages ?? 1)) {
      queryClient.prefetchQuery({
        queryKey: productKeys.list(page + 1, LIMIT),
        queryFn:  () => getProducts({ page: page + 1, limit: LIMIT }),
        staleTime: 1000 * 60 * 2,
      });
    }
  };

  return { ...query, prefetchNext };
};

// ─── useProduct ───────────────────────────────────────────────────────────────
export const useProduct = (id) =>
  useQuery({
    queryKey: productKeys.detail(id),
    queryFn:  () => getProductById(id),
    enabled:  !!id,
    staleTime: 1000 * 60 * 5,
  });

// ─── useCreateProduct ─────────────────────────────────────────────────────────
export const useCreateProduct = (callbacks = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addProduct,
    onSuccess: (newProduct) => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.setQueryData(productKeys.detail(newProduct._id), newProduct);
      callbacks.onSuccess?.(newProduct);
    },
    onError: (error) => callbacks.onError?.(error),
  });
};

// ─── useUpdateProduct ─────────────────────────────────────────────────────────
export const useUpdateProduct = (callbacks = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProduct,

    onMutate: async (updatedProduct) => {
      await queryClient.cancelQueries({ queryKey: productKeys.lists() });
      await queryClient.cancelQueries({ queryKey: productKeys.detail(updatedProduct.id) });

      const previousLists  = queryClient.getQueriesData({ queryKey: productKeys.lists() });
      const previousDetail = queryClient.getQueryData(productKeys.detail(updatedProduct.id));

      // Optimistic update all list pages
      queryClient.setQueriesData({ queryKey: productKeys.lists() }, (old) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((p) =>
            p._id === updatedProduct.id ? { ...p, ...updatedProduct } : p
          ),
        };
      });

      queryClient.setQueryData(productKeys.detail(updatedProduct.id), (old) =>
        old ? { ...old, ...updatedProduct } : old
      );

      return { previousLists, previousDetail };
    },

    onError: (error, updatedProduct, context) => {
      context?.previousLists?.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      queryClient.setQueryData(
        productKeys.detail(updatedProduct.id),
        context?.previousDetail
      );
      callbacks.onError?.(error);
    },

    onSettled: (_, __, updatedProduct) => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.detail(updatedProduct.id) });
      callbacks.onSuccess?.();
    },
  });
};

// ─── useDeleteProduct ─────────────────────────────────────────────────────────
export const useDeleteProduct = (callbacks = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProduct,

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: productKeys.lists() });
      const previousLists = queryClient.getQueriesData({ queryKey: productKeys.lists() });

      queryClient.setQueriesData({ queryKey: productKeys.lists() }, (old) => {
        if (!old) return old;
        return { ...old, data: old.data.filter((p) => p._id !== id) };
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
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      callbacks.onSuccess?.();
    },
  });
};