import { MainLayout } from '@/components/layout';
import { ReactNode } from 'react';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return <MainLayout>{children}</MainLayout>;
}


