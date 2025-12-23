import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Shield, User, Building2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'citizen' | 'government'>('citizen');
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const success = await login(email, password, activeTab);

    if (success) {
      toast({ title: 'Berhasil masuk!', description: 'Selamat datang kembali.' });
      navigate(activeTab === 'government' ? '/admin' : '/');
    } else {
      toast({ title: 'Gagal masuk', description: 'Email atau password salah.', variant: 'destructive' });
    }
    setIsLoading(false);
  };

  return (
    <MainLayout hideFooter>
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
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'citizen' | 'government')}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="citizen" className="gap-2"><User className="h-4 w-4" />Warga</TabsTrigger>
                <TabsTrigger value="government" className="gap-2"><Building2 className="h-4 w-4" />Pemerintah</TabsTrigger>
              </TabsList>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={activeTab === 'citizen' ? 'warga@demo.com' : 'pemerintah@demo.com'} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={activeTab === 'citizen' ? 'warga123' : 'admin123'} required />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Memproses...' : 'Masuk'}
                </Button>
              </form>
            </Tabs>
            <div className="mt-4 p-3 bg-muted rounded-lg text-sm">
              <p className="font-medium mb-1">Demo Akun:</p>
              <p className="text-muted-foreground">Warga: warga@demo.com / warga123</p>
              <p className="text-muted-foreground">Pemerintah: pemerintah@demo.com / admin123</p>
            </div>
          </CardContent>
          <CardFooter className="justify-center">
            <p className="text-sm text-muted-foreground">
              Belum punya akun? <Link to="/register" className="text-primary hover:underline">Daftar</Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
}
