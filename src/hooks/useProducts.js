// src/hooks/useProducts.js

import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import {
  productKeys,
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  addProductColor,
  removeProductColor,
  addProductReview,
  getProductLeaderboard,
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
export const useProductLeaderboard = (category) =>
  useQuery({
    queryKey: productKeys.leaderboard(category),
    queryFn: () => getProductLeaderboard(category),
    enabled: !!category,
    staleTime: 1000 * 60 * 5, // Analytics data stays fresh for 5 mins
    select: (res) => res.data, // Extract the leaderboard array
  });

// ─── useAddProductColor ───────────────────────────────────────────────────────
// ─── useUpdateProduct (Optimized for Variants) ───────────────────────────────
export const useUpdateProduct = (callbacks = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProduct,

    onMutate: async (updatedProduct) => {
      await queryClient.cancelQueries({ queryKey: productKeys.lists() });
      await queryClient.cancelQueries({ queryKey: productKeys.detail(updatedProduct.id) });

      const previousLists = queryClient.getQueriesData({ queryKey: productKeys.lists() });
      const previousDetail = queryClient.getQueryData(productKeys.detail(updatedProduct.id));

      // Optimistic update for all list pages
      queryClient.setQueriesData({ queryKey: productKeys.lists() }, (old) => {
        if (!old) return old;
        return {
          ...old,
          // 🚩 Improvement: Use deep merge or ensure colors are preserved
          products: old.products.map((p) =>
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
      queryClient.setQueryData(productKeys.detail(updatedProduct.id), context?.previousDetail);
      callbacks.onError?.(error);
    },

    onSettled: (_, __, updatedProduct) => {
      // 🚩 Refresh everything to ensure Stock/Color totals match DB exactly
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.detail(updatedProduct.id) });
      callbacks.onSuccess?.();
    },
  });
};

// ─── useAddProductColor (Instant UI Update) ──────────────────────────────────
export const useAddProductColor = (callbacks = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addProductColor,
    onSuccess: (updatedProduct) => {
      // 🚩 Directly update the cache instead of just invalidating
      // This makes the "Quick-View" modal update INSTANTLY
      queryClient.setQueryData(productKeys.detail(updatedProduct._id), updatedProduct);
      
      // Update the product in the list too
      queryClient.setQueriesData({ queryKey: productKeys.lists() }, (old) => {
        if (!old) return old;
        return {
          ...old,
          products: old.products.map((p) => 
            p._id === updatedProduct._id ? updatedProduct : p
          ),
        };
      });
      
      callbacks.onSuccess?.(updatedProduct);
    },
    onError: (error) => callbacks.onError?.(error),
  });
};

// ─── useRemoveProductColor ────────────────────────────────────────────────────
export const useRemoveProductColor = (callbacks = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeProductColor,
    onSuccess: (updatedProduct, variables) => {
      queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.productId) });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      callbacks.onSuccess?.(updatedProduct);
    },
    onError: (error) => callbacks.onError?.(error),
  });
};

// ─── useAddReview ─────────────────────────────────────────────────────────────
export const useAddReview = (callbacks = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addProductReview,
    onSuccess: (_, variables) => {
      // Refresh the product details to show new average rating
      queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.productId) });
      // Crucial: Invalidate leaderboard since rankings might change!
      queryClient.invalidateQueries({ queryKey: ['products', 'leaderboard'] });
      callbacks.onSuccess?.();
    },
    onError: (error) => callbacks.onError?.(error),
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