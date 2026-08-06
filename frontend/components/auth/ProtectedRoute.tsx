"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) {
  const { user, isLoading, isLoggingOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isLoggingOut) {
      if (!user) {
        router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      } else if (adminOnly && user.role?.name !== "Admin") {
        router.replace("/");
      }
    }
  }, [user, isLoading, isLoggingOut, router, pathname, adminOnly]);

  if (isLoading || isLoggingOut || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0F1E]">
        <Loader2 className="w-10 h-10 animate-spin text-[#C9A84C]" />
      </div>
    );
  }

  if (adminOnly && user.role?.name !== "Admin") {
    return null;
  }

  return <>{children}</>;
}
