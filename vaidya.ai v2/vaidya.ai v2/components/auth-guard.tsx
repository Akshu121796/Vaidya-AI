"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useHealthStore } from "@/store/useHealthStore";

// Pages that don't require authentication
const PUBLIC_PATHS = ["/login", "/", "/health-card"];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, restoreSession } = useHealthStore();
  const [checking, setChecking] = useState(true);
  const pathname = usePathname();
  const router   = useRouter();

  const isPublic = PUBLIC_PATHS.some((p) =>
    pathname === p || pathname.startsWith("/login") || pathname.startsWith("/health-card")
  );

  useEffect(() => {
    const initSession = async () => {
      await restoreSession();
      setChecking(false);
    };
    initSession();
  }, [restoreSession]);

  useEffect(() => {
    if (!checking && !isPublic && !isAuthenticated) {
      router.replace("/login");
    }
  }, [checking, isAuthenticated, isPublic, pathname, router]);

  // While checking or unauthenticated on a protected route, render nothing (redirect in progress)
  if (checking || (!isPublic && !isAuthenticated)) return null;

  return <>{children}</>;
}
