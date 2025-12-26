'use client';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { ReactNode } from 'react';

/**
 * Layout for auth pages (login, register)
 * Automatically redirects authenticated users
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
