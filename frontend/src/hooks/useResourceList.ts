import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useResourceList<T>(
  key: string,
  fetchFn: () => Promise<T[]>
) {
  return useQuery({
    queryKey: [key],
    queryFn: fetchFn,
  });
}

export function useResourceCreate<T, I>(
  key: string,
  createFn: (input: I) => Promise<T>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [key] }),
  });
}

export function useResourceUpdate<T, I>(
  key: string,
  updateFn: (args: { id: string; input: I }) => Promise<T>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [key] }),
  });
}

export function useResourceDelete(
  key: string,
  deleteFn: (id: string) => Promise<void>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [key] }),
  });
}
