'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';

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
import { API_BASE_URL, API_ENDPOINTS, apiCall } from '@/lib/api/config';
import type { DisasterType, ReportStatus, RiskLevel } from '@/types';
import { AlertTriangle, ArrowLeft, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

interface DisasterReport {
  id: string;
  type: DisasterType;
  title: string;
  description: string;
  address: string;
  district: string;
  lat: number;
  lng: number;
  images: string[];
  status: ReportStatus;
  riskLevel: RiskLevel;
}

export default function EditDisasterReportPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [report, setReport] = useState<DisasterReport | null>(null);
  const [formData, setFormData] = useState({
    type: '' as DisasterType,
    title: '',
    description: '',
    address: '',
    district: '',
    lat: '',
    lng: '',
    riskLevel: 'medium' as RiskLevel,
    status: 'pending' as ReportStatus,
  });
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== 'admin')) {
      router.replace('/login');
      return;
    }

    if (id) {
      loadReport();
    }
  }, [id, authLoading, isAuthenticated, user, router]);

  const loadReport = async () => {
    try {
      const res = await apiCall(API_ENDPOINTS.reports.disaster.get(id));
      const data = await res.json();

      if (res.ok && data.success) {
        const reportData = data.data;
        setReport(reportData);
        setFormData({
          type: reportData.type,
          title: reportData.title,
          description: reportData.description,
          address: reportData.address,
          district: reportData.district,
          lat: reportData.lat.toString(),
          lng: reportData.lng.toString(),
          riskLevel: reportData.riskLevel || 'medium',
          status: reportData.status,
        });
        setExistingImages(reportData.images || []);
      } else {
        toast.error('Gagal memuat laporan');
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error loading report:', error);
      toast.error('Gagal memuat laporan');
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const filesToAdd = files.slice(0, 5 - existingImages.length - newFiles.length);
      setNewFiles([...newFiles, ...filesToAdd]);
    }
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  const removeNewFile = (index: number) => {
    setNewFiles(newFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (
      !formData.type ||
      !formData.title ||
      !formData.description ||
      !formData.address ||
      !formData.district
    ) {
      return toast.error('Form harap dilengkapi');
    }

    setIsSaving(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('type', formData.type);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('district', formData.district);
      formDataToSend.append('lat', formData.lat);
      formDataToSend.append('lng', formData.lng);
      formDataToSend.append('riskLevel', formData.riskLevel);
      formDataToSend.append('status', formData.status);

      // Add existing images (as JSON array)
      formDataToSend.append('existingImages', JSON.stringify(existingImages));

      // Add new files
      newFiles.forEach((file) => {
        formDataToSend.append('images', file);
      });

      const res = await apiCall(API_ENDPOINTS.reports.disaster.update(id), {
        method: 'PUT',
        body: formDataToSend,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success('Laporan berhasil diperbarui');
        router.push('/dashboard');
      } else {
        throw new Error(data.message || 'Gagal memperbarui laporan');
      }
    } catch (error: any) {
      console.error('Error updating report:', error);
      toast.error(error.message || 'Gagal memperbarui laporan');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || authLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <p>Memuat...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return null;
  }

  return (
    <div className="container py-8 max-w-4xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Kembali
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-warning" />
            </div>
            <div>
              <CardTitle>Edit Laporan Bencana</CardTitle>
              <p className="text-sm text-muted-foreground">Perbarui informasi laporan bencana</p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Jenis Bencana *</Label>
              <Select
                value={formData.type}
                onValueChange={(v) => setFormData({ ...formData, type: v as DisasterType })}
                required
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
              <Label>Judul Laporan *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Contoh: Banjir di Jalan Raya Menteng"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Deskripsi *</Label>
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
                <Label>Alamat Lokasi *</Label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Jl. Contoh No. 123"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Kecamatan/Kelurahan *</Label>
                <Input
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  placeholder="Menteng"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Latitude *</Label>
                <Input
                  value={formData.lat}
                  onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                  placeholder="-6.2088"
                  type="number"
                  step="any"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Longitude *</Label>
                <Input
                  value={formData.lng}
                  onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                  placeholder="106.8226"
                  type="number"
                  step="any"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Tingkat Risiko</Label>
                <Select
                  value={formData.riskLevel}
                  onValueChange={(v) => setFormData({ ...formData, riskLevel: v as RiskLevel })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Rendah</SelectItem>
                    <SelectItem value="medium">Sedang</SelectItem>
                    <SelectItem value="high">Tinggi</SelectItem>
                    <SelectItem value="critical">Kritis</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v) => setFormData({ ...formData, status: v as ReportStatus })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Menunggu</SelectItem>
                    <SelectItem value="verified">Terverifikasi</SelectItem>
                    <SelectItem value="in_progress">Ditangani</SelectItem>
                    <SelectItem value="resolved">Selesai</SelectItem>
                    <SelectItem value="rejected">Ditolak</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Foto Lokasi (Maks 5 file)</Label>

              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  {existingImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={`${API_BASE_URL}${image}`}
                        alt={`Existing ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6"
                        onClick={() => removeExistingImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* New Files Preview */}
              {newFiles.length > 0 && (
                <div className="space-y-2 mb-4">
                  {newFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-muted rounded-lg"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Upload className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="text-sm truncate">{file.name}</span>
                        <span className="text-xs text-muted-foreground shrink-0">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        onClick={() => removeNewFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-2 border-dashed rounded-lg p-6">
                <input
                  type="file"
                  id="file-upload"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={existingImages.length + newFiles.length >= 5}
                />
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground text-center">
                    Klik untuk upload foto baru atau drag & drop
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Maksimal 5MB per file, format: JPEG, PNG, WebP, GIF
                  </p>
                </label>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1"
              >
                Batal
              </Button>
              <Button type="submit" className="flex-1" disabled={isSaving}>
                {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
