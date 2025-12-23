// 'use client';

// import { Button } from '@/components/ui/button';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu';
// import { useAuth } from '@/contexts/AuthContext';
// import { cn } from '@/lib/utils';
// import {
//   AlertTriangle,
//   Droplets,
//   FileText,
//   Home,
//   LayoutDashboard,
//   LogOut,
//   Menu,
//   Shield,
//   User,
//   X,
// } from 'lucide-react';
// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import { useMemo, useState } from 'react';

// const publicNavItems = [
//   { href: '/', label: 'Beranda', icon: Home },
//   { href: '/monitoring', label: 'Monitoring', icon: Droplets },
//   { href: '/public-reports', label: 'Laporan Publik', icon: FileText },
// ];

// const citizenNavItems = [
//   { href: '/report-disaster', label: 'Laporkan Bencana', icon: AlertTriangle },
//   { href: '/report-road', label: 'Lapor Jalan Rusak', icon: FileText },
// ];

// const authenticatedNavItems = [
//   { href: '/my-reports', label: 'Laporan Saya', icon: FileText },
// ];

// const governmentNavItems = [{ href: '/admin', label: 'Dashboard Admin', icon: LayoutDashboard }];

// function isPathActive(pathname: string, href: string) {
//   if (href === '/') return pathname === '/';
//   return pathname === href || pathname.startsWith(href + '/');
// }

// export function Navbar() {
//   const { user, logout, isAuthenticated, isGovernment } = useAuth();
//   const pathname = usePathname();
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

//   const navItems = useMemo(
//     () => [
//       ...publicNavItems,
//       ...citizenNavItems, // Always show report links (no login required)
//       ...(isAuthenticated && !isGovernment ? authenticatedNavItems : []),
//       ...(isGovernment ? governmentNavItems : []),
//     ],
//     [isAuthenticated, isGovernment]
//   );

//   return (
//     <nav className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
//       <div className="container flex h-16 items-center justify-between">
//         {/* Logo */}
//         <Link href="/" className="flex items-center gap-2">
//           <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
//             <Shield className="h-5 w-5 text-primary-foreground" />
//           </div>
//           <span className="hidden font-bold text-lg sm:inline-block">Portal Bencana</span>
//         </Link>

//         {/* Desktop Navigation */}
//         <div className="hidden md:flex items-center gap-1">
//           {navItems.map((item) => {
//             const Icon = item.icon;
//             const active = isPathActive(pathname, item.href);

//             return (
//               <Link key={item.href} href={item.href}>
//                 <Button
//                   variant={active ? 'secondary' : 'ghost'}
//                   size="sm"
//                   className={cn('gap-2', active && 'bg-secondary')}
//                 >
//                   <Icon className="h-4 w-4" />
//                   {item.label}
//                 </Button>
//               </Link>
//             );
//           })}
//         </div>

//         {/* User Menu / Auth Buttons */}
//         <div className="flex items-center gap-2">
//           {isAuthenticated ? (
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <Button variant="ghost" className="gap-2">
//                   <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
//                     <User className="h-4 w-4 text-primary" />
//                   </div>
//                   <span className="hidden sm:inline-block">{user?.name ?? 'User'}</span>
//                 </Button>
//               </DropdownMenuTrigger>

//               <DropdownMenuContent align="end" className="w-56">
//                 <div className="px-2 py-1.5">
//                   <p className="text-sm font-medium">{user?.name ?? '-'}</p>
//                   <p className="text-xs text-muted-foreground">{user?.email ?? '-'}</p>
//                   <p className="text-xs text-muted-foreground capitalize mt-1">
//                     {user?.role === 'government' ? '🏛️ Pemerintah' : '👤 Warga'}
//                   </p>
//                 </div>

//                 <DropdownMenuSeparator />

//                 <DropdownMenuItem
//                   onClick={() => {
//                     setIsMobileMenuOpen(false);
//                     logout();
//                   }}
//                   className="text-destructive"
//                 >
//                   <LogOut className="mr-2 h-4 w-4" />
//                   Keluar
//                 </DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>
//           ) : (
//             <div className="flex items-center gap-2">
//               <Link href="/login">
//                 <Button variant="ghost" size="sm">
//                   Masuk
//                 </Button>
//               </Link>
//               <Link href="/register">
//                 <Button size="sm">Daftar</Button>
//               </Link>
//             </div>
//           )}

//           {/* Mobile Menu Toggle */}
//           <Button
//             variant="ghost"
//             size="icon"
//             className="md:hidden"
//             onClick={() => setIsMobileMenuOpen((v) => !v)}
//             aria-label="Toggle menu"
//           >
//             {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
//           </Button>
//         </div>
//       </div>

//       {/* Mobile Navigation */}
//       {isMobileMenuOpen && (
//         <div className="md:hidden border-t bg-card animate-slide-up">
//           <div className="container py-4 space-y-1">
//             {navItems.map((item) => {
//               const Icon = item.icon;
//               const active = isPathActive(pathname, item.href);

//               return (
//                 <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
//                   <Button
//                     variant={active ? 'secondary' : 'ghost'}
//                     className="w-full justify-start gap-2"
//                   >
//                     <Icon className="h-4 w-4" />
//                     {item.label}
//                   </Button>
//                 </Link>
//               );
//             })}
//           </div>
//         </div>
//       )}
//     </nav>
//   );
// }

'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  Droplets,
  FileText,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Shield,
  User,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useState } from 'react';

const publicNavItems = [
  { href: '/', label: 'Beranda', icon: Home },
  { href: '/monitoring', label: 'Monitoring', icon: Droplets },
  { href: '/public-reports', label: 'Laporan Publik', icon: FileText },
];

const citizenNavItems = [
  { href: '/laporkan-bencana', label: 'Laporkan Bencana', icon: AlertTriangle },
  { href: '/laporkan-jalan', label: 'Laporkan Jalan', icon: FileText },
  { href: '/laporan-saya', label: 'Laporan Saya', icon: FileText },
];

const governmentNavItems = [
  { href: '/dashboard-admin', label: 'Dashboard Admin', icon: LayoutDashboard },
];

function isPathActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(href + '/');
}

export function Navbar() {
  const { user, logout, isAuthenticated, isGovernment } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = useMemo(() => {
    // 1) default: publik saja
    const items = [...publicNavItems];

    // 2) jika sudah login:
    if (isAuthenticated) {
      // pemerintah: hanya tambah dashboard admin
      if (isGovernment || user?.role === 'government') {
        items.push(...governmentNavItems);
      } else {
        // warga: tambah menu warga
        items.push(...citizenNavItems);
      }
    }

    return items;
  }, [isAuthenticated, isGovernment, user?.role]);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="hidden font-bold text-lg sm:inline-block">Portal Bencana</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isPathActive(pathname, item.href);

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={active ? 'secondary' : 'ghost'}
                  size="sm"
                  className={cn('gap-2', active && 'bg-secondary')}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </div>

        {/* User Menu / Auth Buttons */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <span className="hidden sm:inline-block">{user?.name ?? 'User'}</span>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user?.name ?? '-'}</p>
                  <p className="text-xs text-muted-foreground">{user?.email ?? '-'}</p>
                  <p className="text-xs text-muted-foreground capitalize mt-1">
                    {user?.role === 'government' ? '🏛️ Pemerintah' : '👤 Warga'}
                  </p>
                </div>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                  }}
                  className="text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Masuk
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Daftar</Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-card animate-slide-up">
          <div className="container py-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isPathActive(pathname, item.href);

              return (
                <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                  <Button
                    variant={active ? 'secondary' : 'ghost'}
                    className="w-full justify-start gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
