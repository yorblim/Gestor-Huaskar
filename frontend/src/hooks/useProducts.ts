import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productService } from "../features/products/services/productService";
import type { CreateProductInput, UpdateProductInput } from "../features/products/types/product";

const PRODUCTS_KEY = "products";

export function useProducts(page = 1, search = "", limit = 20) {
  return useQuery({
    queryKey: [PRODUCTS_KEY, { page, search, limit }],
    queryFn: () => productService.getAll(page, limit, search),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateProductInput) => productService.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] }),
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateProductInput }) =>
      productService.update(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] }),
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] }),
  });
}
