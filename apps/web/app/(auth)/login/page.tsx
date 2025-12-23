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
import { Building2, Eye, EyeOff, Loader2, Shield, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState, type FormEvent } from 'react';
import { toast } from 'sonner';

type RoleTab = 'citizen' | 'government';

export default function Login() {
  const [activeTab, setActiveTab] = useState<RoleTab>('citizen');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const demo = useMemo(() => {
    return activeTab === 'citizen'
      ? { email: 'warga@demo.com', password: 'warga123' }
      : { email: 'pemerintah@demo.com', password: 'admin123' };
  }, [activeTab]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    try {
      const success = await login(email, password, activeTab);

      if (!success) {
        toast.error('Gagal masuk', { description: 'Email atau password salah.' });
        return;
      }

      toast.success('Berhasil masuk', { description: 'Selamat datang kembali.' });

      // redirect berdasarkan role (route yang benar-benar ada)
      const nextPath = activeTab === 'government' ? '/dashboard-admin' : '/laporkan-bencana';
      router.push(nextPath);
      router.refresh(); // optional
    } catch {
      toast.error('Terjadi kesalahan saat login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-10">
        <Card className="w-full max-w-md overflow-hidden">
          <CardHeader className="text-center space-y-3">
            <div className="mx-auto w-fit">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border">
                <Shield className="h-7 w-7 text-primary" />
              </div>
            </div>
            <div className="space-y-1">
              <CardTitle className="text-2xl">Masuk ke Portal</CardTitle>
              <CardDescription>Pilih jenis akun dan masuk</CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as RoleTab)}>
              <TabsList className="grid w-full grid-cols-2 mb-5 rounded-xl p-1">
                <TabsTrigger value="citizen" className="gap-2 rounded-lg">
                  <User className="h-4 w-4" />
                  Warga
                </TabsTrigger>
                <TabsTrigger value="government" className="gap-2 rounded-lg">
                  <Building2 className="h-4 w-4" />
                  Pemerintah
                </TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={demo.email}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPwd ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={demo.password}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={showPwd ? 'Sembunyikan password' : 'Tampilkan password'}
                    >
                      {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full gap-2" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    'Masuk'
                  )}
                </Button>
              </form>
            </Tabs>

            {/* Demo block */}
            <div className="rounded-xl border bg-muted/40 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Demo Akun</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEmail(demo.email);
                    setPassword(demo.password);
                    toast.message('Demo diisi', { description: 'Silakan klik Masuk.' });
                  }}
                >
                  Isi Otomatis
                </Button>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Warga: warga@demo.com / warga123</p>
                <p>Pemerintah: pemerintah@demo.com / admin123</p>
              </div>
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
    </div>
  );
}
