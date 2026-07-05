export interface User {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
  createdAt: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "USER";
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  password?: string;
  role?: "ADMIN" | "USER";
}
