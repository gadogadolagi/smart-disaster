'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

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
import { API_ENDPOINTS } from '@/lib/api/config';
import type { RoadIssueType } from '@/types';
import { Brain, Construction, Upload, X, MapPin, Navigation } from 'lucide-react';
import { toast } from 'sonner';

export default function LaporkanJalan() {
  const { user } = useAuth();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: '' as RoadIssueType,
    title: '',
    description: '',
    address: '',
    district: '',
    lat: '-6.2088',
    lng: '106.8226',
    reporterName: '',
    reporterPhone: '',
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'getting' | 'success' | 'error'>('idle');
  const [locationError, setLocationError] = useState<string>('');

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

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation tidak didukung oleh browser Anda');
      setLocationStatus('error');
      return;
    }

    setLocationStatus('getting');
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData({
          ...formData,
          lat: latitude.toString(),
          lng: longitude.toString(),
        });
        setLocationStatus('success');
        toast.success('Lokasi berhasil didapatkan');
      },
      (error) => {
        let errorMessage = 'Gagal mendapatkan lokasi';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Akses lokasi ditolak. Silakan izinkan akses lokasi di pengaturan browser.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Informasi lokasi tidak tersedia.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Waktu permintaan lokasi habis.';
            break;
        }
        setLocationError(errorMessage);
        setLocationStatus('error');
        toast.error(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

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
      if (user?.id) {
        formDataToSend.append('reportedById', user.id);
      } else {
        // Use form data or anonymous
        const reporterName = formData.reporterName || 'Anonim';
        const reporterPhone = formData.reporterPhone || '';
        formDataToSend.append('reporterName', reporterName);
        if (reporterPhone) {
          formDataToSend.append('reporterPhone', reporterPhone);
        }
      }

      // Add image files
      selectedFiles.forEach((file) => {
        formDataToSend.append('images', file);
      });

      const response = await fetch(API_ENDPOINTS.reports.road.create, {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Gagal mengirim laporan');
      }

      const result = await response.json();

      toast.success('Laporan terkirim!');

      router.push('/public-reports');
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error('Error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="container py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                <Construction className="h-6 w-6 text-success" />
              </div>
              <div>
                <CardTitle>Lapor Jalan Rusak</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Dengan klasifikasi AI untuk prioritas perbaikan
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6 p-4 bg-info/10 rounded-lg flex items-center gap-3">
              <Brain className="h-5 w-5 text-info" />
              <p className="text-sm">
                Foto akan dianalisis menggunakan Deep Learning untuk klasifikasi tingkat bahaya
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Jenis Kerusakan</Label>
                <Select
                  value={formData.type}
                  onValueChange={(v) => setFormData({ ...formData, type: v as RoadIssueType })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis kerusakan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pothole">Jalan Berlubang</SelectItem>
                    <SelectItem value="landslide">Jalan Longsor</SelectItem>
                    <SelectItem value="bridge_damage">Jembatan Rusak</SelectItem>
                    <SelectItem value="crack">Retakan Jalan</SelectItem>
                    <SelectItem value="flooding">Jalan Tergenang</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Judul Laporan</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Contoh: Jalan Berlubang di Jalan Raya"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Deskripsi</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Jelaskan kondisi kerusakan jalan..."
                  rows={3}
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Alamat</Label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Jl. Contoh No. 123"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Kecamatan</Label>
                  <Input
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    placeholder="Menteng"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Koordinat Lokasi</Label>
                <div className="flex gap-2">
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Latitude</Label>
                      <Input
                        value={formData.lat}
                        onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                        placeholder="-6.2088"
                        type="number"
                        step="any"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Longitude</Label>
                      <Input
                        value={formData.lng}
                        onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                        placeholder="106.8226"
                        type="number"
                        step="any"
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={getCurrentLocation}
                    disabled={locationStatus === 'getting'}
                    className="mt-6"
                  >
                    {locationStatus === 'getting' ? (
                      <>
                        <Navigation className="h-4 w-4 mr-2 animate-spin" />
                        Mendapatkan...
                      </>
                    ) : (
                      <>
                        <MapPin className="h-4 w-4 mr-2" />
                        Ambil Lokasi
                      </>
                    )}
                  </Button>
                </div>
                {locationStatus === 'success' && (
                  <p className="text-xs text-success flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Lokasi berhasil didapatkan
                  </p>
                )}
                {locationError && (
                  <p className="text-xs text-destructive">{locationError}</p>
                )}
              </div>

              {!user && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Nama Pelapor (Opsional)</Label>
                    <Input
                      value={formData.reporterName}
                      onChange={(e) => setFormData({ ...formData, reporterName: e.target.value })}
                      placeholder="Nama Anda"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Nomor Telepon (Opsional)</Label>
                    <Input
                      value={formData.reporterPhone}
                      onChange={(e) => setFormData({ ...formData, reporterPhone: e.target.value })}
                      placeholder="081234567890"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Foto Kerusakan (Opsional, maks 5 file)</Label>
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
                {isLoading ? 'Menganalisis...' : 'Kirim & Analisis'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
