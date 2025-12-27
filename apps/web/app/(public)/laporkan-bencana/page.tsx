'use client';

import { useRouter } from 'next/navigation';
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
import { API_ENDPOINTS } from '@/lib/api/config';
import type { DisasterType } from '@/types';
import { AlertTriangle, MapPin, Navigation, Upload, X } from 'lucide-react';
import { useGeolocated } from 'react-geolocated';
import { toast } from 'sonner';

export default function LaporkanBencana() {
  const { user } = useAuth();
  const router = useRouter();

  const { coords, isGeolocationAvailable, isGeolocationEnabled, positionError } = useGeolocated({
    positionOptions: {
      enableHighAccuracy: true,
    },
    userDecisionTimeout: 5000,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: '' as DisasterType,
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
  const [locationUsed, setLocationUsed] = useState(false);

  // Auto-fill location when coords become available
  useEffect(() => {
    if (coords && !locationUsed) {
      setFormData((prev) => ({
        ...prev,
        lat: coords.latitude.toString(),
        lng: coords.longitude.toString(),
      }));
      setLocationUsed(true);
    }
  }, [coords, locationUsed]);

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

  const handleUseLocation = () => {
    if (coords) {
      setFormData((prev) => ({
        ...prev,
        lat: coords.latitude.toString(),
        lng: coords.longitude.toString(),
      }));
      setLocationUsed(true);
      toast.success('Lokasi berhasil digunakan');
    }
  };

  // const handleSubmit = async (e: FormEvent) => {
  //   e.preventDefault();

  //   // Validate required fields
  //   if (!formData.type) {
  //     toast.error('Validasi Error type data');
  //     return;
  //   }

  //   if (!formData.title || !formData.description || !formData.address || !formData.district) {
  //     toast.error('form harap dilengkapi');
  //     return;
  //   }

  //   setIsLoading(true);

  //   try {
  //     // Create FormData for multipart/form-data
  //     const formDataToSend = new FormData();
  //     formDataToSend.append('type', formData.type);
  //     formDataToSend.append('title', formData.title);
  //     formDataToSend.append('description', formData.description);
  //     formDataToSend.append('address', formData.address);
  //     formDataToSend.append('district', formData.district);
  //     formDataToSend.append('lat', formData.lat);
  //     formDataToSend.append('lng', formData.lng);

  //     // Add user info (optional, bisa juga anonymous)
  //     if (user?.id) {
  //       formDataToSend.append('reportedById', user.id);
  //     } else {
  //       // Use form data or anonymous
  //       const reporterName = formData.reporterName || 'Anonim';
  //       const reporterPhone = formData.reporterPhone || '';
  //       formDataToSend.append('reporterName', reporterName);
  //       if (reporterPhone) {
  //         formDataToSend.append('reporterPhone', reporterPhone);
  //       }
  //     }

  //     // Add image files
  //     selectedFiles.forEach((file) => {
  //       formDataToSend.append('images', file);
  //     });

  //     const response = await fetch(API_ENDPOINTS.reports.disaster.create, {
  //       method: 'POST',
  //       body: formDataToSend,
  //     });

  //     if (!response.ok) {
  //       const errorData = await response.json().catch(() => ({}));
  //       throw new Error(errorData.message || 'Gagal mengirim laporan');
  //     }

  //     const result = await response.json();

  //     toast.error('Validasi Error');

  //     router.push('/public-reports');
  //   } catch (error) {
  //     console.error('Error submitting report:', error);
  //     toast.error('Validasi Error');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.type) return toast.error('Jenis bencana wajib dipilih');
    if (!formData.title || !formData.description || !formData.address || !formData.district) {
      return toast.error('Form harap dilengkapi');
    }

    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('type', formData.type);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('district', formData.district);
      formDataToSend.append('lat', formData.lat);
      formDataToSend.append('lng', formData.lng);

      if (user?.id) {
        formDataToSend.append('reportedById', user.id);
      } else {
        formDataToSend.append('reporterName', formData.reporterName || 'Anonim');
        if (formData.reporterPhone) formDataToSend.append('reporterPhone', formData.reporterPhone);
      }

      selectedFiles.forEach((file) => formDataToSend.append('images', file));

      const response = await fetch(API_ENDPOINTS.reports.disaster.create, {
        method: 'POST',
        body: formDataToSend,
        // credentials: 'include', // aktifkan kalau backend pakai cookie/session
      });

      // ambil response body sekali (biar nggak double-read)
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const msg = data?.message || `Gagal mengirim laporan (HTTP ${response.status})`;
        throw new Error(msg);
      }

      toast.success('Laporan terkirim!');
      router.push('/public-reports');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Gagal mengirim laporan';
      console.error('Error submitting report:', error);
      toast.error(msg);
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
                    onClick={handleUseLocation}
                    disabled={!isGeolocationAvailable || !isGeolocationEnabled || !coords}
                    className="mt-6"
                  >
                    {coords ? (
                      <>
                        <MapPin className="h-4 w-4 mr-2" />
                        {locationUsed ? 'Perbarui Lokasi' : 'Gunakan Lokasi'}
                      </>
                    ) : (
                      <>
                        <Navigation className="h-4 w-4 mr-2 animate-spin" />
                        Mendapatkan...
                      </>
                    )}
                  </Button>
                </div>
                {coords && locationUsed && (
                  <p className="text-xs text-success flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Lokasi digunakan: {coords.latitude.toFixed(6)}, {coords.longitude.toFixed(6)}
                  </p>
                )}
                {coords && !locationUsed && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Lokasi tersedia, klik tombol untuk menggunakan
                  </p>
                )}
                {!isGeolocationAvailable && (
                  <p className="text-xs text-destructive">
                    Geolocation tidak didukung oleh browser Anda
                  </p>
                )}
                {isGeolocationAvailable && !isGeolocationEnabled && (
                  <p className="text-xs text-destructive">
                    Akses lokasi ditolak. Silakan izinkan akses lokasi di pengaturan browser.
                  </p>
                )}
                {positionError && (
                  <p className="text-xs text-destructive">
                    {positionError.message || 'Gagal mendapatkan lokasi'}
                  </p>
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
    </>
  );
}
