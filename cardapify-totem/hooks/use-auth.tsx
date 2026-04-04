'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
      const token = await AsyncStorage.getItem('token');
      if (token) {
        await api.post('/auth/logout', {});
      }
    } catch {
    } finally {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const storedUser = await AsyncStorage.getItem('user');
        
        if (token && storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await api.login(email, password);
    
    await AsyncStorage.setItem('token', response.token);
    await AsyncStorage.setItem('user', JSON.stringify(response.user));
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
