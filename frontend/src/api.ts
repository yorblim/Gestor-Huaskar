export const API_URL = import.meta.env.VITE_API_URL || "/api";

export async function apiFetch<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const headers: Record<string, string> = {
    ...(options?.headers as Record<string, string>),
  };

  if (!(options?.body instanceof FormData)) {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
  }

  const response = await fetch(url, { ...options, headers, credentials: "include" });

  if (response.status === 401) {
    window.location.href = "/login";
    throw new Error("Sesión expirada");
  }

  return response.json();
}
