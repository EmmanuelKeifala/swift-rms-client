'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store';
import { canAccessRoute } from '@/lib/permissions';

interface RouteGuardProps {
  children: React.ReactNode;
}

export function RouteGuard({ children }: RouteGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!canAccessRoute(user?.userType, pathname)) {
      // Redirect national users to national dashboard
      if (user?.userType === 'NATIONAL_USER') {
        router.push('/national-dashboard');
      } else {
        // Redirect other users to dashboard if they don't have access
        router.push('/');
      }
    }
  }, [isAuthenticated, isLoading, pathname, router, user?.userType]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh' 
      }}>
        <div className="spinner" />
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Don't render if no access
  if (!canAccessRoute(user?.userType, pathname)) {
    return null;
  }

  return <>{children}</>;
}
