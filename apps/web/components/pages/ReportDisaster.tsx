// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { MainLayout } from '@/components/layout';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Textarea } from '@/components/ui/textarea';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { useAuth } from '@/contexts/AuthContext';
// import { useToast } from '@/hooks/use-toast';
// import { saveDisasterReport } from '@/data/mockData';
// import { DisasterType, RiskLevel } from '@/types';
// import { AlertTriangle, MapPin, Upload } from 'lucide-react';

// export default function ReportDisaster() {
//   const { user, isAuthenticated } = useAuth();
//   const navigate = useNavigate();
//   const { toast } = useToast();
//   const [isLoading, setIsLoading] = useState(false);
//   const [formData, setFormData] = useState({ type: '' as DisasterType, title: '', description: '', address: '', district: '' });

//   if (!isAuthenticated) {
//     navigate('/login');
//     return null;
//   }

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);

//     const report = {
//       id: `report-${Date.now()}`,
//       type: formData.type,
//       title: formData.title,
//       description: formData.description,
//       location: { address: formData.address, lat: -6.2, lng: 106.8, district: formData.district },
//       images: [],
//       status: 'pending' as const,
//       riskLevel: 'medium' as RiskLevel,
//       reportedBy: { id: user!.id, name: user!.name, phone: user!.phone },
//       createdAt: new Date().toISOString(),
//       updatedAt: new Date().toISOString(),
//     };

//     saveDisasterReport(report);
//     toast({ title: 'Laporan terkirim!', description: 'Tim kami akan segera memverifikasi laporan Anda.' });
//     navigate('/my-reports');
//     setIsLoading(false);
//   };

//   return (
//     <MainLayout>
//       <div className="container py-8 max-w-2xl">
//         <Card>
//           <CardHeader>
//             <div className="flex items-center gap-3">
//               <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
//                 <AlertTriangle className="h-6 w-6 text-warning" />
//               </div>
//               <div>
//                 <CardTitle>Laporkan Bencana</CardTitle>
//                 <p className="text-sm text-muted-foreground">Isi form untuk melaporkan kejadian bencana</p>
//               </div>
//             </div>
//           </CardHeader>
//           <CardContent>
//             <form onSubmit={handleSubmit} className="space-y-4">
//               <div className="space-y-2">
//                 <Label>Jenis Bencana</Label>
//                 <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as DisasterType })} required>
//                   <SelectTrigger><SelectValue placeholder="Pilih jenis bencana" /></SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="flood">Banjir</SelectItem>
//                     <SelectItem value="fire">Kebakaran</SelectItem>
//                     <SelectItem value="fallen_tree">Pohon Tumbang</SelectItem>
//                     <SelectItem value="landslide">Longsor</SelectItem>
//                     <SelectItem value="earthquake">Gempa Bumi</SelectItem>
//                     <SelectItem value="other">Lainnya</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//               <div className="space-y-2">
//                 <Label>Judul Laporan</Label>
//                 <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Contoh: Banjir di Jalan Raya Menteng" required />
//               </div>
//               <div className="space-y-2">
//                 <Label>Deskripsi</Label>
//                 <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Jelaskan kondisi di lokasi..." rows={4} required />
//               </div>
//               <div className="grid gap-4 md:grid-cols-2">
//                 <div className="space-y-2">
//                   <Label>Alamat Lokasi</Label>
//                   <Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Jl. Contoh No. 123" required />
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Kecamatan/Kelurahan</Label>
//                   <Input value={formData.district} onChange={(e) => setFormData({ ...formData, district: e.target.value })} placeholder="Menteng" required />
//                 </div>
//               </div>
//               <div className="space-y-2">
//                 <Label>Foto Lokasi (Opsional)</Label>
//                 <div className="border-2 border-dashed rounded-lg p-8 text-center">
//                   <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
//                   <p className="text-sm text-muted-foreground">Fitur upload foto (simulasi)</p>
//                 </div>
//               </div>
//               <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? 'Mengirim...' : 'Kirim Laporan'}</Button>
//             </form>
//           </CardContent>
//         </Card>
//       </div>
//     </MainLayout>
//   );
// }

'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';

import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { API_ENDPOINTS } from '@/lib/api/config';
import type { DisasterType } from '@/types';
import { AlertTriangle, Upload, X } from 'lucide-react';

export default function ReportDisaster() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: '' as DisasterType,
    title: '',
    description: '',
    address: '',
    district: '',
    lat: '-6.2088',
    lng: '106.8226',
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // ✅ redirect pakai useEffect (side-effect)
  useEffect(() => {
    if (!isAuthenticated) router.replace('/login');
  }, [isAuthenticated, router]);

  // (opsional) biar nggak sempat render form saat redirect
  if (!isAuthenticated) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      // Limit to 5 files
      const filesToAdd = files.slice(0, 5 - selectedFiles.length);
      setSelectedFiles([...selectedFiles, ...filesToAdd]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);

    try {
      // Create FormData for multipart/form-data
      const formDataToSend = new FormData();
      formDataToSend.append('type', formData.type);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('district', formData.district);
      formDataToSend.append('lat', formData.lat);
      formDataToSend.append('lng', formData.lng);

      // Add user info (optional, bisa juga anonymous)
      if (user.id) {
        // formDataToSend.append('reportedById', user.id);
      } else {
        formDataToSend.append('reporterName', user.name);
        if (user.phone) {
          formDataToSend.append('reporterPhone', user.phone);
        }
      }

      // Add image files
      selectedFiles.forEach((file) => {
        formDataToSend.append('images', file);
      });

      const response = await fetch(API_ENDPOINTS.reports.disaster.create, {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Gagal mengirim laporan');
      }

      const result = await response.json();

      toast({
        title: 'Laporan terkirim!',
        description: 'Tim kami akan segera memverifikasi laporan Anda.',
      });

      router.push('/public-reports');
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Gagal mengirim laporan. Silakan coba lagi.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="container py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-warning" />
              </div>
              <div>
                <CardTitle>Laporkan Bencana</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Isi form untuk melaporkan kejadian bencana
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Jenis Bencana</Label>
                <Select
                  value={formData.type}
                  onValueChange={(v) => setFormData({ ...formData, type: v as DisasterType })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis bencana" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flood">Banjir</SelectItem>
                    <SelectItem value="fire">Kebakaran</SelectItem>
                    <SelectItem value="fallen_tree">Pohon Tumbang</SelectItem>
                    <SelectItem value="landslide">Longsor</SelectItem>
                    <SelectItem value="earthquake">Gempa Bumi</SelectItem>
                    <SelectItem value="other">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Judul Laporan</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Contoh: Banjir di Jalan Raya Menteng"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Deskripsi</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Jelaskan kondisi di lokasi..."
                  rows={4}
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Alamat Lokasi</Label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Jl. Contoh No. 123"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Kecamatan/Kelurahan</Label>
                  <Input
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    placeholder="Menteng"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Foto Lokasi (Opsional, maks 5 file)</Label>
                <div className="border-2 border-dashed rounded-lg p-6">
                  <input
                    type="file"
                    id="file-upload"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={selectedFiles.length >= 5}
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex flex-col items-center justify-center cursor-pointer"
                  >
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground text-center">
                      Klik untuk upload foto atau drag & drop
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Maksimal 5MB per file, format: JPEG, PNG, WebP, GIF
                    </p>
                  </label>

                  {/* Preview selected files */}
                  {selectedFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {selectedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-muted rounded-lg"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Upload className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm truncate">{file.name}</span>
                            <span className="text-xs text-muted-foreground flex-shrink-0">
                              ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 flex-shrink-0"
                            onClick={() => removeFile(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Mengirim...' : 'Kirim Laporan'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
