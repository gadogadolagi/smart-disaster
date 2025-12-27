'use client';

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
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
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
  Edit,
  FileText,
  Flame,
  MapPin,
  Trash2,
  TreePine,
  User as UserIcon,
  UserPlus,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
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

export default function DashboardAdmin() {
  const { user, isGovernment, getAccessToken, isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [disasterReports, setDisasterReports] = useState<DisasterReport[]>([]);
  const [roadReports, setRoadReports] = useState<any[]>([]);
  const [petugasList, setPetugasList] = useState<User[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState({
    totalReports: 0,
    pendingReports: 0,
    inProgressReports: 0,
    resolvedReports: 0,
  });

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [disasterTypeFilter, setDisasterTypeFilter] = useState<string>('all');
  const [roadTypeFilter, setRoadTypeFilter] = useState<string>('all');

  // Pagination states
  const [disasterPage, setDisasterPage] = useState(1);
  const [roadPage, setRoadPage] = useState(1);
  const [disasterPagination, setDisasterPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [roadPagination, setRoadPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

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

    // Wait for auth to finish loading
    if (authLoading) return;

    // Check if user is authenticated and is admin
    if (!isAuthenticated || !user) {
      router.replace('/login');
      return;
    }

    if (user.role !== 'admin') {
      toast.error('Akses ditolak. Hanya admin yang dapat mengakses halaman ini.');
      router.replace('/');
      return;
    }

    loadData();
  }, [mounted, authLoading, isAuthenticated, user, router]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadDashboardStats(),
        loadDisasterReports(),
        loadRoadReports(),
        loadPetugasList(),
        loadUsers(),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Gagal memuat data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadDashboardStats = async () => {
    try {
      const res = await apiCall(API_ENDPOINTS.stats.dashboard);
      const data = await res.json();
      if (res.ok && data.success) {
        setStats({
          totalReports: data.data.totalReports || 0,
          pendingReports: data.data.pendingReports || 0,
          inProgressReports: data.data.inProgressReports || 0,
          resolvedReports: data.data.resolvedReports || 0,
        });
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    }
  };

  const loadDisasterReports = async (page: number = disasterPage) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      if (disasterTypeFilter !== 'all') {
        params.append('type', disasterTypeFilter);
      }

      const res = await apiCall(`${API_ENDPOINTS.reports.disaster.list}?${params.toString()}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setDisasterReports(data.data || []);
        if (data.pagination) {
          setDisasterPagination(data.pagination);
        }
      }
    } catch (error) {
      console.error('Error loading disaster reports:', error);
    }
  };

  const loadRoadReports = async (page: number = roadPage) => {
    try {
      const res = await apiCall(`${API_ENDPOINTS.reports.road.list}?page=${page}&limit=10`);
      const data = await res.json();
      if (res.ok && data.success) {
        setRoadReports(data.data || []);
        if (data.pagination) {
          setRoadPagination(data.pagination);
        }
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

  const loadUsers = async () => {
    try {
      const res = await apiCall(API_ENDPOINTS.users.list);
      const data = await res.json();
      if (res.ok && data.success) {
        setUsers(data.data || []);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  // Stats sekarang di-load dari API endpoint stats/dashboard

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
        // Reload stats and reports
        loadDashboardStats();
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
        // Reload stats and reports
        loadDashboardStats();
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
        // Reload stats and reports
        loadDashboardStats();
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

  // Filter sekarang dilakukan di API, tidak perlu filteredDisasterReports

  const filteredRoadReports = useMemo(() => {
    return roadReports.filter((r) => {
      const statusMatch = statusFilter === 'all' || r.status === statusFilter;
      const typeMatch = roadTypeFilter === 'all' || r.type === roadTypeFilter;
      return statusMatch && typeMatch;
    });
  }, [roadReports, statusFilter, roadTypeFilter]);

  // Hapus disasterCounts karena tidak perlu lagi

  const roadCounts = useMemo(
    () => ({
      pothole: roadReports.filter((r) => r.type === 'pothole').length,
      crack: roadReports.filter((r) => r.type === 'crack').length,
      landslide: roadReports.filter((r) => r.type === 'landslide').length,
      bridge_damage: roadReports.filter((r) => r.type === 'bridge_damage').length,
      flooding: roadReports.filter((r) => r.type === 'flooding').length,
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

  // Reload reports when filters change
  useEffect(() => {
    if (mounted && !authLoading && isAuthenticated && user?.role === 'admin') {
      setDisasterPage(1);
      loadDisasterReports(1);
      // Stats tetap di-load karena menggunakan total dari semua data, bukan hanya filtered
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, disasterTypeFilter]);

  if (!mounted || authLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <p>Memuat...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user || user.role !== 'admin') {
    return null;
  }

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
        <StatsCard
          title="Selesai"
          value={stats.resolvedReports}
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

        {/* DISASTER REPORTS */}
        <TabsContent value="disaster" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Laporan Bencana
              </CardTitle>
              <div className="flex gap-2">
                <Select value={disasterTypeFilter} onValueChange={setDisasterTypeFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter Jenis Bencana" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Jenis</SelectItem>
                    <SelectItem value="flood">Banjir</SelectItem>
                    <SelectItem value="fire">Kebakaran</SelectItem>
                    <SelectItem value="landslide">Longsor</SelectItem>
                    <SelectItem value="fallen_tree">Pohon Tumbang</SelectItem>
                    <SelectItem value="earthquake">Gempa Bumi</SelectItem>
                    <SelectItem value="other">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
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
              </div>
            </CardHeader>
            <CardContent>
              {disasterReports.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Tidak ada laporan untuk filter ini</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {disasterReports.map((report) => {
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
                                  <span className="flex items-center gap-1 text-primary">
                                    <UserPlus className="h-4 w-4" />
                                    Petugas: {report.assignedTo.name} ({report.assignedTo.email})
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
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                router.push(`/dashboard/reports/disaster/${report.id}/edit`)
                              }
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
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

              {/* Pagination */}
              {disasterPagination.totalPages > 1 && (
                <div className="mt-6">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (disasterPagination.hasPrev) {
                              const newPage = disasterPage - 1;
                              setDisasterPage(newPage);
                              loadDisasterReports(newPage);
                            }
                          }}
                          className={
                            !disasterPagination.hasPrev ? 'pointer-events-none opacity-50' : ''
                          }
                        />
                      </PaginationItem>
                      {Array.from({ length: disasterPagination.totalPages }, (_, i) => i + 1)
                        .filter((page) => {
                          const current = disasterPagination.page;
                          return (
                            page === 1 ||
                            page === disasterPagination.totalPages ||
                            (page >= current - 1 && page <= current + 1)
                          );
                        })
                        .map((page, index, array) => (
                          <React.Fragment key={page}>
                            {index > 0 && array[index - 1] !== page - 1 && (
                              <PaginationItem>
                                <PaginationEllipsis />
                              </PaginationItem>
                            )}
                            <PaginationItem>
                              <PaginationLink
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setDisasterPage(page);
                                  loadDisasterReports(page);
                                }}
                                isActive={disasterPagination.page === page}
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          </React.Fragment>
                        ))}
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (disasterPagination.hasNext) {
                              const newPage = disasterPage + 1;
                              setDisasterPage(newPage);
                              loadDisasterReports(newPage);
                            }
                          }}
                          className={
                            !disasterPagination.hasNext ? 'pointer-events-none opacity-50' : ''
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
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
                                <span className="flex items-center gap-1 text-primary">
                                  <UserPlus className="h-4 w-4" />
                                  Petugas: {report.assignedTo.name} ({report.assignedTo.email})
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
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/dashboard/reports/road/${report.id}/edit`)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
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

              {/* Pagination */}
              {roadPagination.totalPages > 1 && (
                <div className="mt-6">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (roadPagination.hasPrev) {
                              const newPage = roadPage - 1;
                              setRoadPage(newPage);
                              loadRoadReports(newPage);
                            }
                          }}
                          className={
                            !roadPagination.hasPrev ? 'pointer-events-none opacity-50' : ''
                          }
                        />
                      </PaginationItem>
                      {Array.from({ length: roadPagination.totalPages }, (_, i) => i + 1)
                        .filter((page) => {
                          const current = roadPagination.page;
                          return (
                            page === 1 ||
                            page === roadPagination.totalPages ||
                            (page >= current - 1 && page <= current + 1)
                          );
                        })
                        .map((page, index, array) => (
                          <React.Fragment key={page}>
                            {index > 0 && array[index - 1] !== page - 1 && (
                              <PaginationItem>
                                <PaginationEllipsis />
                              </PaginationItem>
                            )}
                            <PaginationItem>
                              <PaginationLink
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setRoadPage(page);
                                  loadRoadReports(page);
                                }}
                                isActive={roadPagination.page === page}
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          </React.Fragment>
                        ))}
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (roadPagination.hasNext) {
                              const newPage = roadPage + 1;
                              setRoadPage(newPage);
                              loadRoadReports(newPage);
                            }
                          }}
                          className={
                            !roadPagination.hasNext ? 'pointer-events-none opacity-50' : ''
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
