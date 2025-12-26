'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  DangerLevelBadge,
  DisasterTypeBadge,
  RiskLevelBadge,
  RoadIssueTypeBadge,
  StatsCard,
  StatusBadge,
} from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL, API_ENDPOINTS, apiCall } from '@/lib/api/config';
import { DisasterType, ReportStatus, User } from '@/types';
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
  User as UserIcon,
  UserPlus,
  Trash2,
} from 'lucide-react';
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
  reportedById?: string;
  reportedBy?: {
    id: string;
    name: string;
    email: string;
  };
  assignedToId?: string;
  assignedTo?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function AdminDashboardPage() {
  const { user, getAccessToken } = useAuth();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [disasterReports, setDisasterReports] = useState<DisasterReport[]>([]);
  const [roadReports, setRoadReports] = useState<any[]>([]);
  const [petugasList, setPetugasList] = useState<User[]>([]);
  const [stats, setStats] = useState({
    totalReports: 0,
    pendingReports: 0,
    inProgressReports: 0,
    resolvedReports: 0,
  });

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [disasterTypeFilter, setDisasterTypeFilter] = useState<string>('all');

  // Dialog states
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<{
    id: string;
    type: 'disaster' | 'road';
  } | null>(null);
  const [selectedPetugasId, setSelectedPetugasId] = useState<string>('');

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    loadData();
  }, [mounted]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([loadDisasterReports(), loadRoadReports(), loadPetugasList()]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Gagal memuat data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadDisasterReports = async () => {
    try {
      const res = await apiCall(API_ENDPOINTS.reports.disaster.list);
      const data = await res.json();
      if (res.ok && data.success) {
        setDisasterReports(data.data || []);
        updateStats(data.data || [], roadReports);
      }
    } catch (error) {
      console.error('Error loading disaster reports:', error);
    }
  };

  const loadRoadReports = async () => {
    try {
      const res = await apiCall(API_ENDPOINTS.reports.road.list);
      const data = await res.json();
      if (res.ok && data.success) {
        setRoadReports(data.data || []);
        updateStats(disasterReports, data.data || []);
      }
    } catch (error) {
      console.error('Error loading road reports:', error);
    }
  };

  const loadPetugasList = async () => {
    try {
      const res = await apiCall(API_ENDPOINTS.assignments.petugas);
      const data = await res.json();
      if (res.ok && data.success) {
        setPetugasList(data.data || []);
      }
    } catch (error) {
      console.error('Error loading petugas list:', error);
    }
  };

  const updateStats = (disasters: any[], roads: any[]) => {
    const allReports = [...disasters, ...roads];
    setStats({
      totalReports: allReports.length,
      pendingReports: allReports.filter((r) => r.status === 'pending').length,
      inProgressReports: allReports.filter((r) => r.status === 'in_progress').length,
      resolvedReports: allReports.filter((r) => r.status === 'resolved').length,
    });
  };

  const handleStatusChange = async (
    id: string,
    type: 'disaster' | 'road',
    status: ReportStatus
  ) => {
    try {
      const endpoint =
        type === 'disaster'
          ? API_ENDPOINTS.reports.disaster.update(id)
          : API_ENDPOINTS.reports.road.update(id);

      const res = await apiCall(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success('Status diperbarui');
        if (type === 'disaster') {
          loadDisasterReports();
        } else {
          loadRoadReports();
        }
      } else {
        throw new Error(data.message || 'Gagal memperbarui status');
      }
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast.error(error.message || 'Gagal memperbarui status');
    }
  };

  const handleAssignPetugas = async () => {
    if (!selectedReport || !selectedPetugasId) {
      toast.error('Pilih petugas terlebih dahulu');
      return;
    }

    try {
      const endpoint =
        selectedReport.type === 'disaster'
          ? API_ENDPOINTS.assignments.assignDisaster(selectedReport.id)
          : API_ENDPOINTS.assignments.assignRoad(selectedReport.id);

      const res = await apiCall(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ petugasId: selectedPetugasId }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success('Petugas berhasil ditugaskan');
        setAssignDialogOpen(false);
        setSelectedReport(null);
        setSelectedPetugasId('');
        if (selectedReport.type === 'disaster') {
          loadDisasterReports();
        } else {
          loadRoadReports();
        }
      } else {
        throw new Error(data.message || 'Gagal menugaskan petugas');
      }
    } catch (error: any) {
      console.error('Error assigning petugas:', error);
      toast.error(error.message || 'Gagal menugaskan petugas');
    }
  };

  const handleDeleteReport = async (id: string, type: 'disaster' | 'road') => {
    if (!confirm('Apakah Anda yakin ingin menghapus laporan ini?')) {
      return;
    }

    try {
      const endpoint =
        type === 'disaster'
          ? API_ENDPOINTS.reports.disaster.delete(id)
          : API_ENDPOINTS.reports.road.delete(id);

      const res = await apiCall(endpoint, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success('Laporan berhasil dihapus');
        if (type === 'disaster') {
          loadDisasterReports();
        } else {
          loadRoadReports();
        }
      } else {
        throw new Error(data.message || 'Gagal menghapus laporan');
      }
    } catch (error: any) {
      console.error('Error deleting report:', error);
      toast.error(error.message || 'Gagal menghapus laporan');
    }
  };

  const filteredDisasterReports = useMemo(() => {
    return disasterReports.filter((r) => {
      const statusMatch = statusFilter === 'all' || r.status === statusFilter;
      const typeMatch = disasterTypeFilter === 'all' || r.type === disasterTypeFilter;
      return statusMatch && typeMatch;
    });
  }, [disasterReports, statusFilter, disasterTypeFilter]);

  const filteredRoadReports = useMemo(() => {
    return roadReports.filter((r) => {
      const statusMatch = statusFilter === 'all' || r.status === statusFilter;
      return statusMatch;
    });
  }, [roadReports, statusFilter]);

  const disasterCounts = useMemo(
    () => ({
      flood: disasterReports.filter((r) => r.type === 'flood').length,
      fire: disasterReports.filter((r) => r.type === 'fire').length,
      landslide: disasterReports.filter((r) => r.type === 'landslide').length,
      fallen_tree: disasterReports.filter((r) => r.type === 'fallen_tree').length,
      other: disasterReports.filter((r) => r.type === 'other').length,
    }),
    [disasterReports]
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

  if (!mounted) return null;

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <p>Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard Admin</h1>
        <p className="text-muted-foreground">Kelola semua laporan bencana dan infrastruktur</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <StatsCard title="Total Laporan" value={stats.totalReports} icon={FileText} />
        <StatsCard title="Menunggu" value={stats.pendingReports} icon={Clock} variant="warning" />
        <StatsCard
          title="Ditangani"
          value={stats.inProgressReports}
          icon={Activity}
          variant="info"
        />
        <StatsCard title="Selesai" value={stats.resolvedReports} icon={CheckCircle} variant="success" />
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

        {/* DISASTER REPORTS */}
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

            {Object.entries(disasterCounts).map(([type, count]) => (
              <Card
                key={type}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  disasterTypeFilter === type ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setDisasterTypeFilter(type)}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    {(() => {
                      const Icon = getDisasterIcon(type as DisasterType);
                      return <Icon className="h-5 w-5 text-primary" />;
                    })()}
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-sm text-muted-foreground">
                      {type === 'flood'
                        ? 'Banjir'
                        : type === 'fire'
                          ? 'Kebakaran'
                          : type === 'landslide'
                            ? 'Longsor'
                            : type === 'fallen_tree'
                              ? 'Pohon Tumbang'
                              : 'Lainnya'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Laporan Bencana
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
                              <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0">
                                <img
                                  src={`${API_BASE_URL}${report.images[0]}`}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}

                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap gap-2 mb-2">
                                <DisasterTypeBadge type={report.type} />
                                <RiskLevelBadge level={report.riskLevel as any} />
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
                                  {report.address}
                                </span>
                                {report.reportedBy && (
                                  <span className="flex items-center gap-1">
                                    <UserIcon className="h-4 w-4" />
                                    {report.reportedBy.name}
                                  </span>
                                )}
                                {report.assignedTo && (
                                  <span className="flex items-center gap-1">
                                    <UserPlus className="h-4 w-4" />
                                    {report.assignedTo.name}
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {new Date(report.createdAt).toLocaleDateString('id-ID')}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Dialog
                              open={assignDialogOpen && selectedReport?.id === report.id}
                              onOpenChange={(open) => {
                                setAssignDialogOpen(open);
                                if (open) {
                                  setSelectedReport({ id: report.id, type: 'disaster' });
                                } else {
                                  setSelectedReport(null);
                                  setSelectedPetugasId('');
                                }
                              }}
                            >
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <UserPlus className="h-4 w-4 mr-2" />
                                  Assign
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Assign Petugas</DialogTitle>
                                  <DialogDescription>
                                    Pilih petugas untuk menangani laporan ini
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                  <div className="space-y-2">
                                    <Label>Petugas</Label>
                                    <Select
                                      value={selectedPetugasId}
                                      onValueChange={setSelectedPetugasId}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Pilih petugas" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {petugasList.map((petugas) => (
                                          <SelectItem key={petugas.id} value={petugas.id}>
                                            {petugas.name} ({petugas.email})
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setAssignDialogOpen(false);
                                      setSelectedReport(null);
                                      setSelectedPetugasId('');
                                    }}
                                  >
                                    Batal
                                  </Button>
                                  <Button onClick={handleAssignPetugas}>Assign</Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>

                            <Select
                              value={report.status}
                              onValueChange={(v) =>
                                handleStatusChange(report.id, 'disaster', v as ReportStatus)
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

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteReport(report.id, 'disaster')}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ROAD REPORTS */}
        <TabsContent value="road" className="space-y-6">
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
                            <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0">
                              <img
                                src={`${API_BASE_URL}${report.images[0]}`}
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
                                {report.address}
                              </span>
                              {report.reportedBy && (
                                <span className="flex items-center gap-1">
                                  <UserIcon className="h-4 w-4" />
                                  {report.reportedBy.name}
                                </span>
                              )}
                              {report.assignedTo && (
                                <span className="flex items-center gap-1">
                                  <UserPlus className="h-4 w-4" />
                                  {report.assignedTo.name}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {new Date(report.createdAt).toLocaleDateString('id-ID')}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Dialog
                            open={assignDialogOpen && selectedReport?.id === report.id}
                            onOpenChange={(open) => {
                              setAssignDialogOpen(open);
                              if (open) {
                                setSelectedReport({ id: report.id, type: 'road' });
                              } else {
                                setSelectedReport(null);
                                setSelectedPetugasId('');
                              }
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <UserPlus className="h-4 w-4 mr-2" />
                                Assign
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Assign Petugas</DialogTitle>
                                <DialogDescription>
                                  Pilih petugas untuk menangani laporan ini
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label>Petugas</Label>
                                  <Select
                                    value={selectedPetugasId}
                                    onValueChange={setSelectedPetugasId}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Pilih petugas" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {petugasList.map((petugas) => (
                                        <SelectItem key={petugas.id} value={petugas.id}>
                                          {petugas.name} ({petugas.email})
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setAssignDialogOpen(false);
                                    setSelectedReport(null);
                                    setSelectedPetugasId('');
                                  }}
                                >
                                  Batal
                                </Button>
                                <Button onClick={handleAssignPetugas}>Assign</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          <Select
                            value={report.status}
                            onValueChange={(v) =>
                              handleStatusChange(report.id, 'road', v as ReportStatus)
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

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteReport(report.id, 'road')}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
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

