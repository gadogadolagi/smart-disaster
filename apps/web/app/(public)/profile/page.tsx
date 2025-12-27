'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Calendar, Mail, Phone, User, Edit, Lock } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, isAuthenticated, updateProfile } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState(user);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // User data sudah di-load oleh AuthContext, cukup set loading false
    setIsLoading(false);
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setProfileData(user);
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!formData.name.trim()) {
      toast.error('Nama tidak boleh kosong');
      return;
    }

    setIsLoading(true);
    try {
      const success = await updateProfile({
        name: formData.name,
        phone: formData.phone || undefined,
      });

      if (success) {
        toast.success('Profil berhasil diperbarui');
        setIsEditing(false);
      } else {
        toast.error('Gagal memperbarui profil');
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Gagal memperbarui profil');
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'petugas':
        return 'Petugas';
      case 'user':
        return 'Warga';
      default:
        return role;
    }
  };

  const getRoleVariant = (role: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'petugas':
        return 'default';
      case 'user':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (isLoading && !user) {
    return (
      <div className="container py-8 max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <p>Memuat profil...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Profil Saya</h1>
        <p className="text-muted-foreground mt-2">
          Kelola informasi profil dan pengaturan akun Anda
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Informasi Profil</CardTitle>
                <CardDescription>Informasi akun Anda yang terlihat oleh publik</CardDescription>
              </div>
              {!isEditing && (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {isEditing ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Lengkap</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Masukkan nama lengkap"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Nomor Telepon</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="081234567890"
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleUpdateProfile} disabled={isLoading}>
                    Simpan Perubahan
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        name: user.name || '',
                        phone: user.phone || '',
                      });
                    }}
                    disabled={isLoading}
                  >
                    Batal
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="text-lg">
                      {user.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-2xl font-semibold">{user.name}</h3>
                    <Badge variant={getRoleVariant(user.role)} className="mt-1">
                      {getRoleLabel(user.role)}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{user.email}</p>
                    </div>
                  </div>

                  {user.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Nomor Telepon</p>
                        <p className="font-medium">{user.phone}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Bergabung Sejak</p>
                      <p className="font-medium">
                        {new Date(user.createdAt).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle>Pengaturan</CardTitle>
            <CardDescription>Kelola akun Anda</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/profile/change-password" className="block">
              <Button variant="outline" className="w-full justify-start" asChild>
                <span>
                  <Lock className="h-4 w-4 mr-2" />
                  Ganti Password
                </span>
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
