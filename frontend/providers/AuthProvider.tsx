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

  const { data: user = null, isLoading: queryLoading, refetch } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        console.log('[Auth Debug] document.cookie:', typeof document !== 'undefined' ? document.cookie : 'SSR');
        console.log('[Auth Debug] Attempting GET /api/v1/users/me');
        const res = await api.get('/users/me');
        console.log('[Auth Debug] GET /api/v1/users/me response data:', res.data);
        return res.data.data as User;
      } catch (error: any) {
        console.error('[Auth Debug] GET /api/v1/users/me FAILED with error:', error.response?.status, error.message);
        return null;
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000,   // 30 minutes
    // We only enable the query once hydration is done.
    // React Query inherently deduplicates requests for the same queryKey.
    enabled: mounted,
  });

  // Also ensure we don't flash 'unauthenticated' during hydration
  const isLoading = !mounted || queryLoading;

  const login = (userData: User) => {
    queryClient.setQueryData(['user'], userData);
  };

  const logout = async () => {
    const logoutId = crypto.randomUUID();
    console.trace(`[FORENSIC] LOGOUT INVOKED (ID: ${logoutId})`);
    
    if (typeof window !== 'undefined') {
      console.log(`[FORENSIC] Pathname: ${window.location.pathname}`);
      console.log(`[FORENSIC] Performance.now(): ${performance.now()}`);
      
      // Attempt to get navigation type
      try {
        const navEntries = performance.getEntriesByType("navigation");
        if (navEntries.length > 0) {
          console.log(`[FORENSIC] Navigation Type: ${(navEntries[0] as PerformanceNavigationTiming).type}`);
        }
      } catch (e) {}
    }
    
    console.log(`[FORENSIC] Current User:`, user);
    
    try {
      await api.post('/auth/logout', {}, {
        headers: {
          'X-Debug-Logout-ID': logoutId
        }
      });
    } catch (error) {
      console.error('[FORENSIC] Logout request error:', error);
    } finally {
      queryClient.setQueryData(['user'], null);
      queryClient.removeQueries({ queryKey: ['bookings'] });
      queryClient.removeQueries({ queryKey: ['user'] });
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
