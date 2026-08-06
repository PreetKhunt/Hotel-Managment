'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { User, AuthContextType } from '@/types/auth';
import toast from 'react-hot-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  
  // Strict initial states: loading=true, user=null, authenticated=false
  const [user, _setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (isLoggingOut && pathname === '/') {
      setIsLoggingOut(false);
    }
  }, [pathname, isLoggingOut]);

  const setUser = (newUser: User | null) => {
    _setUser(newUser);
  };
  
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
    setIsLoggingOut(true);
    try {
      await api.post('/auth/logout');
      toast.success("Logged out successfully.");
    } catch (error) {
      console.error('[Logout] Failed:', error);
      toast.error("Logout request encountered an error. Cleaning up local session.");
    } finally {
      setUser(null);
      queryClient.setQueryData(['user'], null);
      queryClient.removeQueries();
      queryClient.clear(); // Complete React Query cache purge

      if (typeof window !== 'undefined') {
        // Clear any localStorage/sessionStorage auth data if present
        const authKeys = ['token', 'user', 'auth', 'session', 'hh_session', 'supabase.auth.token'];
        authKeys.forEach(key => {
          localStorage.removeItem(key);
          sessionStorage.removeItem(key);
        });
        Object.keys(localStorage).forEach(key => {
          if (/auth|supabase|session|token|user/i.test(key)) {
            localStorage.removeItem(key);
          }
        });
        Object.keys(sessionStorage).forEach(key => {
          if (/auth|supabase|session|token|user/i.test(key)) {
            sessionStorage.removeItem(key);
          }
        });
      }

      router.replace('/');
      setTimeout(() => {
        setIsLoggingOut(false);
      }, 1500);
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
    <AuthContext.Provider value={{ user, isLoading, isLoggingOut, login, logout, refreshUser }}>
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
