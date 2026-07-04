'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { User, AuthContextType } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // Strict initial states: loading=true, user=null, authenticated=false
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Ensure exactly ONE network request
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    let mounted = true;

    const initializeAuth = async () => {
      try {
        const res = await api.get('/users/me');
        if (mounted && res.status === 200) {
          setUser(res.data.data as User);
          queryClient.setQueryData(['user'], res.data.data as User);
        }
      } catch (error: any) {
        if (mounted) {
          setUser(null);
          queryClient.setQueryData(['user'], null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, [queryClient]);

  const login = (userData: User) => {
    setUser(userData);
    queryClient.setQueryData(['user'], userData);
  };

  const logout = async () => {
    // Only happens on explicit user action
    try {
      await api.post('/auth/logout', {}, {
        headers: {
          'X-Debug-Logout-ID': 'Frontend-Manual-Click'
        }
      });
    } catch (error) {
      console.error('[Logout] Failed:', error);
    } finally {
      setUser(null);
      queryClient.setQueryData(['user'], null);
      queryClient.removeQueries(); // Clears everything
      router.push('/');
    }
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/users/me');
      if (res.status === 200) {
        setUser(res.data.data as User);
        queryClient.setQueryData(['user'], res.data.data as User);
      }
    } catch (error) {
      setUser(null);
      queryClient.setQueryData(['user'], null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
