'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';

interface AuthGuardProps {
  children: ReactNode;
  redirectTo?: string;
}

/**
 * Component to protect auth pages (login, register) from authenticated users
 * Redirects authenticated users to appropriate dashboard
 */
export function AuthGuard({ children, redirectTo }: AuthGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for auth to finish loading
    if (isLoading) return;

    // If user is authenticated, redirect them
    if (isAuthenticated && user) {
      // If redirectTo is specified, use it
      if (redirectTo) {
        router.replace(redirectTo);
        return;
      }

      // Otherwise, redirect based on user role
      if (user.role === 'admin') {
        router.replace('/dashboard');
      } else if (user.role === 'petugas') {
        router.replace('/monitoring');
      } else {
        router.replace('/');
      }
    }
  }, [isAuthenticated, user, isLoading, router, redirectTo]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Memuat...</p>
      </div>
    );
  }

  // If user is authenticated, don't render children (will redirect)
  if (isAuthenticated && user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Mengalihkan...</p>
      </div>
    );
  }

  // If user is not authenticated, render children
  return <>{children}</>;
}
