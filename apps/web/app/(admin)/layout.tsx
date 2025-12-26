'use client';

import { AdminLayout } from '@/components/layout/AdminLayout';
import { ReactNode } from 'react';

export default function AdminLayoutWrapper({ children }: { children: ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
