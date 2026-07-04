'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { User, AuthContextType } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const hasHintCookie = mounted && typeof document !== 'undefined' && document.cookie.includes('is_logged_in=1');

  const { data: user = null, isLoading: queryLoading, refetch } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const res = await api.get('/users/me');
      return res.data.data as User;
    },
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000,   // 30 minutes
    enabled: hasHintCookie,
  });

  const isLoading = !mounted || (hasHintCookie && queryLoading);

  const login = (userData: User) => {
    queryClient.setQueryData(['user'], userData);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      queryClient.setQueryData(['user'], null);
      queryClient.removeQueries({ queryKey: ['bookings'] });
      queryClient.removeQueries({ queryKey: ['user'] });
      // Manually clear the hint cookie since sometimes the backend response might be ignored if there's a network error
      if (typeof document !== 'undefined') {
        document.cookie = 'is_logged_in=; Max-Age=0; path=/;';
      }
      router.push('/');
    }
  };

  const refreshUser = async () => {
    await refetch();
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
