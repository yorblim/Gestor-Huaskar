import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { AuthUser } from "../types/auth";
import { logoutService, getProfileService } from "../services/authService";

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (_token: string, user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfileService().then((data) => {
      if (data?.user) {
        setUser(data.user);
      }
      setLoading(false);
    });
  }, []);

  const login = (_token: string, newUser: AuthUser) => {
    setUser(newUser);
  };

  const logout = async () => {
    await logoutService();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="text-white text-lg animate-pulse">Cargando...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
