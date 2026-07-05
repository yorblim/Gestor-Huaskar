import { API_URL } from "../../../api";
import type { User, CreateUserInput, UpdateUserInput } from "../types/user";

export const userService = {
  async getAll(page = 1, limit = 50, search = "") {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.set("search", search);
    const res = await fetch(`${API_URL}/auth/users?${params}`, { credentials: "include" });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || "Error al obtener usuarios");
    return data;
  },

  async create(input: CreateUserInput): Promise<User> {
    const res = await fetch(`${API_URL}/auth/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      credentials: "include",
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || "Error al crear usuario");
    return data.data;
  },

  async update(id: number, input: UpdateUserInput): Promise<User> {
    const res = await fetch(`${API_URL}/auth/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      credentials: "include",
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || "Error al actualizar usuario");
    return data.data;
  },

  async delete(id: number): Promise<void> {
    const res = await fetch(`${API_URL}/auth/users/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || "Error al eliminar usuario");
  },
};
