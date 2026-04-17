// src/hooks/useProducts.js
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import {
  productKeys,
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  addProductVariant,
  updateProductVariantStock,
  removeProductVariant,
  addProductReview,
  getProductLeaderboard,
} from '../api/products';

const LIMIT = 10;

// ─── useProductList ───────────────────────────────────────────────────────────
// src/hooks/useProducts.js — only the 3 broken hooks shown, rest unchanged

// ─── useProductList ───────────────────────────────────────────────────────────
export const useProductList = (page = 1) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey:        productKeys.list(page, LIMIT),
    queryFn:         () => getProducts({ page, limit: LIMIT }),
    staleTime:       1000 * 60 * 2,
    placeholderData: (prev) => prev,
    select: (res) => ({
      // res = { success, data: [...], total, page, pages }
      products:   res.data,   // ✅ backend key is `data`
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

      // ✅ raw cache shape is { success, data: [...], total, page, pages }
      queryClient.setQueriesData({ queryKey: productKeys.lists() }, (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((p) =>
            p._id === updatedProduct.id ? { ...p, ...updatedProduct } : p
          ),
        };
      });

      queryClient.setQueryData(productKeys.detail(updatedProduct.id), (old) =>
        old ? { ...old, data: { ...old.data, ...updatedProduct } } : old
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

      // ✅ raw cache shape uses `data` not `products` — select runs AFTER
      queryClient.setQueriesData({ queryKey: productKeys.lists() }, (old) => {
        if (!old?.data) return old;
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

// ─── useProduct ───────────────────────────────────────────────────────────────
export const useProduct = (id) =>
  useQuery({
    queryKey:  productKeys.detail(id),
    queryFn:   () => getProductById(id),
    enabled:   !!id,
    staleTime: 1000 * 60 * 5,
  });

// ─── useProductLeaderboard ────────────────────────────────────────────────────
export const useProductLeaderboard = (category) =>
  useQuery({
    queryKey:  productKeys.leaderboard(category),
    queryFn:   () => getProductLeaderboard(category),
    enabled:   !!category,
    staleTime: 1000 * 60 * 5,
    select:    (res) => res.data,
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

// ─── useAddProductVariant ─────────────────────────────────────────────────────
export const useAddProductVariant = (callbacks = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addProductVariant,
    onSuccess: (updatedProduct) => {
      // Directly update cache so modals reflect new variant instantly
      queryClient.setQueryData(productKeys.detail(updatedProduct.data._id), updatedProduct.data);

      queryClient.setQueriesData({ queryKey: productKeys.lists() }, (old) => {
        if (!old) return old;
        return {
          ...old,
          products: old.products.map((p) =>
            p._id === updatedProduct.data._id ? updatedProduct.data : p
          ),
        };
      });

      callbacks.onSuccess?.(updatedProduct.data);
    },
    onError: (error) => callbacks.onError?.(error),
  });
};

// ─── useUpdateProductVariantStock ─────────────────────────────────────────────
export const useUpdateProductVariantStock = (callbacks = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProductVariantStock, // { productId, variantId, stock }

    onMutate: async ({ productId, variantId, stock }) => {
      await queryClient.cancelQueries({ queryKey: productKeys.detail(productId) });
      const previousDetail = queryClient.getQueryData(productKeys.detail(productId));

      // Optimistically update the single variant's stock + recalculate total
      queryClient.setQueryData(productKeys.detail(productId), (old) => {
        if (!old) return old;
        const updatedVariants = old.data.variants.map((v) =>
          v._id === variantId ? { ...v, stock } : v
        );
        const newTotalStock = updatedVariants.reduce((sum, v) => sum + (v.stock || 0), 0);
        return { ...old, data: { ...old.data, variants: updatedVariants, stock: newTotalStock } };
      });

      return { previousDetail };
    },

    onError: (error, { productId }, context) => {
      queryClient.setQueryData(productKeys.detail(productId), context?.previousDetail);
      callbacks.onError?.(error);
    },

    onSettled: (_, __, { productId }) => {
      // Always re-sync from DB — stock is calculated server-side
      queryClient.invalidateQueries({ queryKey: productKeys.detail(productId) });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      callbacks.onSuccess?.();
    },
  });
};

// ─── useRemoveProductVariant ──────────────────────────────────────────────────
export const useRemoveProductVariant = (callbacks = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeProductVariant,
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
      queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.productId) });
      // Leaderboard rankings may shift after a new review
      queryClient.invalidateQueries({ queryKey: ['products', 'leaderboard'] });
      callbacks.onSuccess?.();
    },
    onError: (error) => callbacks.onError?.(error),
  });
};

// ─── useDeleteProduct ─────────────────────────────────────────────────────────
