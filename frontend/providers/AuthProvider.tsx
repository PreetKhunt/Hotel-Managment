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
  const [user, _setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const setUser = (newUser: User | null) => {
    console.log(`\n========== [Auth Audit] setUser Triggered ==========`);
    console.log(`[Auth Audit] Previous User:`, user);
    console.log(`[Auth Audit] New User:`, newUser);
    console.trace(`[Auth Audit] setUser Stack Trace`);
    console.log(`====================================================\n`);
    _setUser(newUser);
  };
  
  // Ensure exactly ONE network request
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    let mounted = true;

    console.log(`[Auth Audit] FRONTEND BUILD IDENTIFIER: 2026-07-05-v4-AUTH-TRACE-EXTENDED`);
    console.log(`[Auth Audit] AuthProvider mounted. document.cookie length:`, document.cookie.length);
    console.log(`[Auth Audit] Is hh_session visible in document.cookie?`, document.cookie.includes('hh_session'));

    const initializeAuth = async () => {
      console.log(`[Auth Audit] Starting /users/me request...`);
      try {
        const res = await api.get('/users/me');
        console.log(`[Auth Audit] /users/me response status:`, res.status);
        console.log(`[Auth Audit] /users/me response headers:`, res.headers);
        if (mounted && res.status === 200) {
          console.log("[Auth Audit] Fetched user from /users/me:", res.data);
          console.log("[Auth Audit] Setting user state to:", res.data.data);
          setUser(res.data.data as User);
          
          console.log("[Auth Audit] Calling queryClient.setQueryData for /users/me (success)");
          queryClient.setQueryData(['user'], res.data.data as User);
        }
      } catch (error: any) {
        console.error("[Auth Audit] /users/me failed:", error.response?.status, error.message);
        console.log(`[Auth Audit] /users/me error response headers:`, error.response?.headers);
        if (mounted) {
          console.log("[Auth Audit] Setting user state to: null (due to error)");
          setUser(null);
          console.log("[Auth Audit] Calling queryClient.setQueryData for /users/me (error)");
          queryClient.setQueryData(['user'], null);
        }
      } finally {
        if (mounted) {
          console.log("[Auth Audit] Setting isLoading state to: false");
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
    console.log("[Auth Audit] login() called. Setting user state to:", userData);
    setUser(userData);
    console.log("[Auth Audit] Calling queryClient.setQueryData for login");
    queryClient.setQueryData(['user'], userData);
  };

  const logout = async () => {
    console.log(`\n========== [Auth Audit] logout() invoked ==========`);
    console.trace(`[Auth Audit] logout() Stack Trace`);
    console.log(`====================================================\n`);
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('[Logout] Failed:', error);
    } finally {
      console.log("[Auth Audit] logout() final block. Setting user state to: null");
      setUser(null);
      console.log("[Auth Audit] Calling queryClient.setQueryData for logout");
      queryClient.setQueryData(['user'], null);
      queryClient.removeQueries(); // Clears everything
      router.push('/');
    }
  };

  const refreshUser = async () => {
    console.log(`[Auth Audit] refreshUser() called.`);
    try {
      const res = await api.get('/users/me');
      if (res.status === 200) {
        console.log("[Auth Audit] refreshUser: Setting user state to:", res.data.data);
        setUser(res.data.data as User);
        console.log("[Auth Audit] Calling queryClient.setQueryData for refreshUser (success)");
        queryClient.setQueryData(['user'], res.data.data as User);
      }
    } catch (error) {
      console.log("[Auth Audit] refreshUser failed. Setting user state to: null");
      setUser(null);
      console.log("[Auth Audit] Calling queryClient.setQueryData for refreshUser (error)");
      queryClient.setQueryData(['user'], null);
    }
  };

  console.log(`[Auth Audit] AuthProvider render: loading=${isLoading}, isAuthenticated=${!!user}, user=`, user);

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
