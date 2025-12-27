'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/types';
import { Building2, HardHat, Shield, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';

export default function Login() {
  const router = useRouter();
  const { login, user } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<UserRole>('user');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(email, password, activeTab);

      if (success) {
        toast.success('Berhasil masuk');

        // Wait a bit for user state to update, then redirect based on actual role
        setTimeout(() => {
          // Get updated user from context
          const currentUser = user;
          if (currentUser?.role === 'admin') {
            router.push('/dashboard');
          } else if (currentUser?.role === 'petugas') {
            router.push('/monitoring');
          } else {
            router.push('/');
          }
        }, 200);
      } else {
        toast.error('Email atau password salah');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getPlaceholders = (): { email: string; password: string } => {
    switch (activeTab) {
      case 'user':
        return { email: 'warga@demo.com', password: 'warga123' };
      case 'admin':
        return { email: 'pemerintah@demo.com', password: 'admin123' };
      case 'petugas':
        return { email: 'petugas@demo.com', password: 'petugas123' };
      default:
        return { email: 'warga@demo.com', password: 'warga123' };
    }
  };

  const placeholders = getPlaceholders();

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Masuk ke Portal</CardTitle>
          <CardDescription>Pilih jenis akun dan masuk</CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as UserRole)}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="user" className="gap-2">
                <User className="h-4 w-4" />
                Warga
              </TabsTrigger>
              <TabsTrigger value="petugas" className="gap-2">
                <HardHat className="h-4 w-4" />
                Petugas
              </TabsTrigger>
              <TabsTrigger value="admin" className="gap-2">
                <Building2 className="h-4 w-4" />
                Admin
              </TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={placeholders.email}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={placeholders.password}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Memproses...' : 'Masuk'}
              </Button>
            </form>
          </Tabs>

          <div className="mt-4 p-3 bg-muted rounded-lg text-sm">
            <p className="font-medium mb-1">Demo Akun:</p>
            <p className="text-muted-foreground">Warga: user1@example.com / password123</p>
            <p className="text-muted-foreground">Petugas: petugas1@example.com / password123</p>
            <p className="text-muted-foreground">Admin: admin@example.com / password123</p>
          </div>
        </CardContent>

        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Belum punya akun?{' '}
            <Link href="/register" className="text-primary hover:underline">
              Daftar
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
