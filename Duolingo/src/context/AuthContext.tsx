'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser } from '@/types/user';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (identifier: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      let data: any = {};
      try {
        data = await res.json();
      } catch {
        // Response was not JSON (e.g. 500 error page from server)
      }
      if (!res.ok) {
        return { success: false, error: data.error || `Error del servidor (${res.status})` };
      }
      setUser(data.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Error de conexión con el servidor' };
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      let data: any = {};
      try {
        data = await res.json();
      } catch {
        // Response was not JSON
      }
      if (!res.ok) {
        return { success: false, error: data.error || `Error del servidor (${res.status})` };
      }
      setUser(data.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Error de conexión con el servidor' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/me', { method: 'POST' });
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        refreshUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
}
