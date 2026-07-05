import { API_URL } from "../../../api";
import type { LoginResponse, AuthUser } from "../types/auth";

export async function loginService(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    credentials: "include",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.success) {
    throw new Error(data?.message || "Error al iniciar sesión");
  }

  return data;
}

export async function logoutService(): Promise<void> {
  await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
}

export async function getProfileService(): Promise<{ user: AuthUser } | null> {
  try {
    const response = await fetch(`${API_URL}/auth/profile`, {
      credentials: "include",
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data;
  } catch {
    return null;
  }
}

export function getStoredAuth() {
  return null;
}

export function clearAuth() {
}

export function storeAuth(_token: string, _user: unknown) {
}
