'use client';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  Activity,
  BarChart3,
  LayoutDashboard,
  LogOut,
  Shield,
  UserCircle,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface AdminLayoutProps {
  children: ReactNode;
}

const adminNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/users', label: 'Manajemen User', icon: Users },
  // { href: '/dashboard', label: 'Manajemen Laporan', icon: FileText },
  { href: '/dashboard/stats', label: 'Statistik', icon: BarChart3 },
  { href: '/dashboard/activities', label: 'Log Aktivitas', icon: Activity },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || authLoading) return;

    if (!isAuthenticated || !user || user.role !== 'admin') {
      toast.error('Akses ditolak. Hanya admin yang dapat mengakses halaman ini.');
      router.replace('/login');
    }
  }, [mounted, authLoading, isAuthenticated, user, router]);

  if (!mounted || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Memuat...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user || user.role !== 'admin') {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="hidden font-bold text-lg sm:inline-block">Admin Portal</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive ? 'secondary' : 'ghost'}
                      size="sm"
                      className={cn('gap-2', isActive && 'bg-secondary')}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/profile">
              <Button variant="ghost" size="sm" className="gap-2">
                <UserCircle className="h-4 w-4" />
                <span className="hidden sm:inline-block">{user.name}</span>
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" size="sm">
                Kembali ke Portal
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline-block">Keluar</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
