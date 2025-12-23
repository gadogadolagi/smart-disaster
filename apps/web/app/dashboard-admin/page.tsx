'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import {
  DangerLevelBadge,
  DisasterTypeBadge,
  RiskLevelBadge,
  RoadIssueTypeBadge,
  StatsCard,
  StatusBadge,
} from '@/components/shared';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { useAuth } from '@/contexts/AuthContext';
import {
  getDisasterReports,
  getRoadReports,
  mockDashboardStats,
  updateDisasterReport,
  updateRoadReport, // ✅ buat helper ini di mockData.ts (lihat catatan di bawah)
} from '@/data/mockData';

import { useToast } from '@/hooks/use-toast';
import { DisasterType, ReportStatus, RoadReport } from '@/types';

import {
  Activity,
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  Construction,
  Droplets,
  FileText,
  Flame,
  MapPin,
  TreePine,
  User,
} from 'lucide-react';

export default function DashboardAdmin() {
  const { isGovernment } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [mounted, setMounted] = useState(false);

  const [disasterReports, setDisasterReports] = useState<any[]>([]);
  const [roadReports, setRoadReports] = useState<RoadReport[]>([]);

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [disasterTypeFilter, setDisasterTypeFilter] = useState<string>('all');
  const [roadTypeFilter, setRoadTypeFilter] = useState<string>('all');

  useEffect(() => setMounted(true), []);

  // ✅ redirect aman (jangan di render)
  useEffect(() => {
    if (!mounted) return;
    if (!isGovernment) router.replace('/login');
  }, [mounted, isGovernment, router]);

  // ✅ load data setelah mount (aman localStorage)
  useEffect(() => {
    if (!mounted) return;
    setDisasterReports(getDisasterReports());
    setRoadReports(getRoadReports());
  }, [mounted]);

  const filteredDisasterReports = useMemo(() => {
    return (disasterReports ?? []).filter((r) => {
      const statusMatch = statusFilter === 'all' || r.status === statusFilter;
      const typeMatch = disasterTypeFilter === 'all' || r.type === disasterTypeFilter;
      return statusMatch && typeMatch;
    });
  }, [disasterReports, statusFilter, disasterTypeFilter]);

  const filteredRoadReports = useMemo(() => {
    return (roadReports ?? []).filter((r) => {
      const statusMatch = statusFilter === 'all' || r.status === statusFilter;
      const typeMatch = roadTypeFilter === 'all' || r.type === roadTypeFilter;
      return statusMatch && typeMatch;
    });
  }, [roadReports, statusFilter, roadTypeFilter]);

  const handleDisasterStatusChange = (id: string, status: ReportStatus) => {
    updateDisasterReport(id, { status });
    setDisasterReports(getDisasterReports());
    toast({
      title: 'Status diperbarui',
      description: `Laporan bencana telah diubah ke ${status}`,
    });
  };

  const handleRoadStatusChange = (id: string, status: ReportStatus) => {
    updateRoadReport(id, { status }); // ✅ helper
    setRoadReports(getRoadReports());
    toast({
      title: 'Status diperbarui',
      description: `Laporan jalan telah diubah ke ${status}`,
    });
  };

  const disasterCounts = useMemo(
    () => ({
      flood: (disasterReports ?? []).filter((r) => r.type === 'flood').length,
      fire: (disasterReports ?? []).filter((r) => r.type === 'fire').length,
      landslide: (disasterReports ?? []).filter((r) => r.type === 'landslide').length,
      fallen_tree: (disasterReports ?? []).filter((r) => r.type === 'fallen_tree').length,
      other: (disasterReports ?? []).filter((r) => r.type === 'other').length,
    }),
    [disasterReports]
  );

  const roadCounts = useMemo(
    () => ({
      pothole: (roadReports ?? []).filter((r) => r.type === 'pothole').length,
      crack: (roadReports ?? []).filter((r) => r.type === 'crack').length,
      landslide: (roadReports ?? []).filter((r) => r.type === 'landslide').length,
      bridge_damage: (roadReports ?? []).filter((r) => r.type === 'bridge_damage').length,
      flooding: (roadReports ?? []).filter((r) => r.type === 'flooding').length,
    }),
    [roadReports]
  );

  const getDisasterIcon = (type: DisasterType) => {
    switch (type) {
      case 'flood':
        return Droplets;
      case 'fire':
        return Flame;
      case 'landslide':
      case 'fallen_tree':
        return TreePine;
      default:
        return AlertTriangle;
    }
  };

  // ✅ saat SSR/awal mount jangan render apapun
  if (!mounted) return null;
  // ✅ kalau bukan gov, biarkan useEffect redirect yang kerja
  if (!isGovernment) return null;

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard Admin</h1>
        <p className="text-muted-foreground">Kelola semua laporan bencana dan infrastruktur</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <StatsCard title="Total Laporan" value={mockDashboardStats.totalReports} icon={FileText} />
        <StatsCard
          title="Menunggu"
          value={mockDashboardStats.pendingReports}
          icon={Clock}
          variant="warning"
        />
        <StatsCard
          title="Ditangani"
          value={mockDashboardStats.inProgressReports}
          icon={Activity}
          variant="info"
        />
        <StatsCard
          title="Selesai"
          value={mockDashboardStats.resolvedReports}
          icon={CheckCircle}
          variant="success"
        />
      </div>

      <Tabs defaultValue="disaster" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-flex">
          <TabsTrigger value="disaster" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Laporan Bencana
          </TabsTrigger>
          <TabsTrigger value="road" className="gap-2">
            <Construction className="h-4 w-4" />
            Laporan Jalan
          </TabsTrigger>
        </TabsList>

        {/* ===== DISASTER ===== */}
        <TabsContent value="disaster" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-5">
            <Card
              className={`cursor-pointer transition-all hover:shadow-md ${
                disasterTypeFilter === 'all' ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setDisasterTypeFilter('all')}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <AlertTriangle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{disasterReports.length}</p>
                  <p className="text-sm text-muted-foreground">Semua</p>
                </div>
              </CardContent>
            </Card>

            <Card
              className={`cursor-pointer transition-all hover:shadow-md ${
                disasterTypeFilter === 'flood' ? 'ring-2 ring-emergency-flood' : ''
              }`}
              onClick={() => setDisasterTypeFilter('flood')}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emergency-flood/10">
                  <Droplets className="h-5 w-5 text-emergency-flood" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{disasterCounts.flood}</p>
                  <p className="text-sm text-muted-foreground">Banjir</p>
                </div>
              </CardContent>
            </Card>

            <Card
              className={`cursor-pointer transition-all hover:shadow-md ${
                disasterTypeFilter === 'fire' ? 'ring-2 ring-emergency-fire' : ''
              }`}
              onClick={() => setDisasterTypeFilter('fire')}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emergency-fire/10">
                  <Flame className="h-5 w-5 text-emergency-fire" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{disasterCounts.fire}</p>
                  <p className="text-sm text-muted-foreground">Kebakaran</p>
                </div>
              </CardContent>
            </Card>

            <Card
              className={`cursor-pointer transition-all hover:shadow-md ${
                disasterTypeFilter === 'landslide' ? 'ring-2 ring-emergency-warning' : ''
              }`}
              onClick={() => setDisasterTypeFilter('landslide')}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emergency-warning/10">
                  <TreePine className="h-5 w-5 text-emergency-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{disasterCounts.landslide}</p>
                  <p className="text-sm text-muted-foreground">Longsor</p>
                </div>
              </CardContent>
            </Card>

            <Card
              className={`cursor-pointer transition-all hover:shadow-md ${
                disasterTypeFilter === 'fallen_tree' ? 'ring-2 ring-orange-500' : ''
              }`}
              onClick={() => setDisasterTypeFilter('fallen_tree')}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <TreePine className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{disasterCounts.fallen_tree}</p>
                  <p className="text-sm text-muted-foreground">Pohon Tumbang</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Laporan Bencana
                {disasterTypeFilter !== 'all' && (
                  <Badge variant="secondary" className="ml-2">
                    {disasterTypeFilter === 'flood'
                      ? 'Banjir'
                      : disasterTypeFilter === 'fire'
                        ? 'Kebakaran'
                        : disasterTypeFilter === 'landslide'
                          ? 'Longsor'
                          : disasterTypeFilter === 'fallen_tree'
                            ? 'Pohon Tumbang'
                            : 'Lainnya'}
                  </Badge>
                )}
              </CardTitle>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
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
            </CardHeader>

            <CardContent>
              {filteredDisasterReports.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Tidak ada laporan untuk filter ini</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredDisasterReports.map((report) => {
                    const Icon = getDisasterIcon(report.type);
                    return (
                      <div
                        key={report.id}
                        className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="flex gap-4 flex-1">
                            {report.images?.[0] && (
                              <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                <img
                                  src={report.images[0]}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}

                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap gap-2 mb-2">
                                <DisasterTypeBadge type={report.type} />
                                <RiskLevelBadge level={report.riskLevel} />
                                <StatusBadge status={report.status} />
                              </div>

                              <h3 className="font-semibold flex items-center gap-2">
                                <Icon className="h-4 w-4 text-muted-foreground" />
                                {report.title}
                              </h3>

                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {report.description}
                              </p>

                              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {report.location?.address}
                                </span>
                                <span className="flex items-center gap-1">
                                  <User className="h-4 w-4" />
                                  {report.reportedBy?.name}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {new Date(report.createdAt).toLocaleDateString('id-ID')}
                                </span>
                              </div>
                            </div>
                          </div>

                          <Select
                            value={report.status}
                            onValueChange={(v) =>
                              handleDisasterStatusChange(report.id, v as ReportStatus)
                            }
                          >
                            <SelectTrigger className="w-36">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Menunggu</SelectItem>
                              <SelectItem value="verified">Terverifikasi</SelectItem>
                              <SelectItem value="in_progress">Ditangani</SelectItem>
                              <SelectItem value="resolved">Selesai</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== ROAD ===== */}
        <TabsContent value="road" className="space-y-6">
          {/* kategori road tetap sama seperti punyamu — aman */}
          {/* ... (bagian kategori road boleh kamu pakai 그대로) ... */}

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Construction className="h-5 w-5" />
                Laporan Jalan Rusak
              </CardTitle>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
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
            </CardHeader>

            <CardContent>
              {filteredRoadReports.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Construction className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Tidak ada laporan untuk filter ini</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRoadReports.map((report) => (
                    <div
                      key={report.id}
                      className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="flex gap-4 flex-1">
                          {report.images?.[0] && (
                            <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                              <img
                                src={report.images[0]}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap gap-2 mb-2">
                              <RoadIssueTypeBadge type={report.type} />
                              <DangerLevelBadge level={report.dangerLevel} />
                              <StatusBadge status={report.status} />
                            </div>

                            <h3 className="font-semibold">{report.title}</h3>

                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {report.description}
                            </p>

                            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {report.location?.address}
                              </span>
                              <span className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                {report.reportedBy?.name}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {new Date(report.createdAt).toLocaleDateString('id-ID')}
                              </span>
                            </div>
                          </div>
                        </div>

                        <Select
                          value={report.status}
                          onValueChange={(v) =>
                            handleRoadStatusChange(report.id, v as ReportStatus)
                          }
                        >
                          <SelectTrigger className="w-36">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Menunggu</SelectItem>
                            <SelectItem value="verified">Terverifikasi</SelectItem>
                            <SelectItem value="in_progress">Ditangani</SelectItem>
                            <SelectItem value="resolved">Selesai</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
