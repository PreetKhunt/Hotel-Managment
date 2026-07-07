'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { Loader2 } from 'lucide-react';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      console.log("[AdminGuard] Checking authorization. User object:", user);
      
      if (!user) {
        console.log("[AdminGuard] Redirecting to / because user is null");
        router.replace('/');
      } else if (!Array.isArray(user.role?.permissions) || !user.role.permissions.includes('SUPER_ADMIN')) {
        console.log("[AdminGuard] Redirecting to /dashboard because permissions do not include SUPER_ADMIN. user.role:", user.role);
        router.replace('/dashboard');
      } else {
        console.log("[AdminGuard] User authorized!");
        setIsAuthorized(true);
      }
    }
  }, [user, isLoading, router]);

  if (isLoading || !isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return <>{children}</>;
}
