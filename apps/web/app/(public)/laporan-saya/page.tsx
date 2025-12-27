'use client';

import {
  DangerLevelBadge,
  DisasterTypeBadge,
  RiskLevelBadge,
  RoadIssueTypeBadge,
  StatusBadge,
} from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { API_ENDPOINTS, apiCall, getImageUrl } from '@/lib/api/config';
import { DisasterType, ReportStatus, RoadIssueType } from '@/types';
import { FileText, MapPin, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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
  riskLevel: string;
  urgencyPercentage?: number;
  createdAt: string;
  updatedAt: string;
}

interface RoadReport {
  id: string;
  type: RoadIssueType;
  title: string;
  description: string;
  address: string;
  district: string;
  lat: number;
  lng: number;
  images: string[];
  status: ReportStatus;
  dangerLevel: string;
  urgencyPercentage?: number;
  createdAt: string;
  updatedAt: string;
}

export default function LaporanSaya() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [disasterReports, setDisasterReports] = useState<DisasterReport[]>([]);
  const [roadReports, setRoadReports] = useState<RoadReport[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    if (authLoading) return;

    if (!isAuthenticated || !user) {
      router.replace('/login');
      return;
    }

    loadReports();
  }, [mounted, authLoading, isAuthenticated, user, router]);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (typeFilter !== 'all') params.append('type', typeFilter);

      const res = await apiCall(`${API_ENDPOINTS.reports.myReports}?${params.toString()}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setDisasterReports(data.data.disasterReports || []);
        setRoadReports(data.data.roadReports || []);
      } else {
        throw new Error(data.message || 'Gagal memuat laporan');
      }
    } catch (error: any) {
      console.error('Error loading reports:', error);
      toast.error(error.message || 'Gagal memuat laporan');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDisasterReports = disasterReports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.district.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const filteredRoadReports = roadReports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.district.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  if (!mounted || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Memuat...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Laporan Saya</h1>
        <p className="text-muted-foreground">Lihat semua laporan yang telah Anda buat</p>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari laporan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="pending">Menunggu</SelectItem>
              <SelectItem value="verified">Terverifikasi</SelectItem>
              <SelectItem value="in_progress">Ditangani</SelectItem>
              <SelectItem value="resolved">Selesai</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={loadReports} variant="outline">
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="disaster" className="space-y-6">
        <TabsList>
          <TabsTrigger value="disaster">
            Laporan Bencana ({filteredDisasterReports.length})
          </TabsTrigger>
          <TabsTrigger value="road">Laporan Jalan ({filteredRoadReports.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="disaster" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <p>Memuat laporan...</p>
            </div>
          ) : filteredDisasterReports.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Belum ada laporan bencana</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredDisasterReports.map((report) => (
                <Card key={report.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      {report.images.length > 0 && (
                        <div className="w-full md:w-48 h-48 rounded-lg overflow-hidden shrink-0">
                          <img
                            src={getImageUrl(report.images[0] || '')}
                            alt={report.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-2">{report.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {report.description}
                            </p>
                          </div>
                          <StatusBadge status={report.status} />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <DisasterTypeBadge type={report.type} />
                          <RiskLevelBadge level={report.riskLevel as any} />
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>
                            {report.address}, {report.district}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Dibuat: {new Date(report.createdAt).toLocaleString('id-ID')}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="road" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <p>Memuat laporan...</p>
            </div>
          ) : filteredRoadReports.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Belum ada laporan jalan</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredRoadReports.map((report) => (
                <Card key={report.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      {report.images.length > 0 && (
                        <div className="w-full md:w-48 h-48 rounded-lg overflow-hidden shrink-0">
                          <img
                            src={getImageUrl(report.images[0] || '')}
                            alt={report.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-2">{report.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {report.description}
                            </p>
                          </div>
                          <StatusBadge status={report.status} />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <RoadIssueTypeBadge type={report.type} />
                          <DangerLevelBadge level={report.dangerLevel as any} />
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>
                            {report.address}, {report.district}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Dibuat: {new Date(report.createdAt).toLocaleString('id-ID')}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
