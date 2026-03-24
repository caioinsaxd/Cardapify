'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { api, User } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  restaurantId: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await api.post('/auth/logout', {});
      }
    } catch {
      // Ignora erro de logout
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    }
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      const response = await api.post<{ token: string }>('/auth/refresh', {});
      localStorage.setItem('token', response.token);
      return response.token;
    } catch {
      logout();
      return null;
    }
  }, [logout]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      const token = localStorage.getItem('token');
      if (token) {
        await refreshToken();
      }
    }, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [refreshToken]);

  const login = useCallback(async (email: string, password: string) => {
    const response = await api.post<{ token: string; user: User }>('/auth/login', {
      email,
      password,
    });

    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    setUser(response.user);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        restaurantId: user?.restaurantId || null,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
