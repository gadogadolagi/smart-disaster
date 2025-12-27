'use client';

import {
  DangerLevelBadge,
  DisasterTypeBadge,
  RiskLevelBadge,
  RoadIssueTypeBadge,
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL, API_ENDPOINTS, apiCall } from '@/lib/api/config';
import { ReportStatus } from '@/types';
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  Construction,
  FileText,
  MapPin,
  User as UserIcon,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface AssignedReport {
  id: string;
  type: 'disaster' | 'road';
  title: string;
  description: string;
  address: string;
  district: string;
  images: string[];
  status: ReportStatus;
  riskLevel?: string;
  dangerLevel?: string;
  reportedBy?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Activity {
  id: string;
  activityType: string;
  description: string;
  images: string[];
  createdBy: {
    id: string;
    name: string;
  };
  createdAt: string;
}

export default function MonitoringPage() {
  const { user, isAuthenticated, getAccessToken, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [disasterReports, setDisasterReports] = useState<AssignedReport[]>([]);
  const [roadReports, setRoadReports] = useState<AssignedReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<AssignedReport | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Activity form state
  const [activityForm, setActivityForm] = useState({
    description: '',
    activityType: 'status_changed',
    newStatus: '',
    images: [] as File[],
  });

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;

    // Wait for auth to finish loading
    if (authLoading) return;

    // Check if user is authenticated and is petugas
    if (!isAuthenticated || !user) {
      router.replace('/login');
      return;
    }

    if (user.role !== 'petugas') {
      toast.error('Akses ditolak. Hanya petugas yang dapat mengakses halaman ini.');
      router.replace('/');
      return;
    }

    loadAssignedReports();
  }, [mounted, authLoading, isAuthenticated, user, router]);

  const loadAssignedReports = async () => {
    setIsLoading(true);
    try {
      const res = await apiCall(API_ENDPOINTS.assignments.myReports);
      const data = await res.json();

      if (res.ok && data.success) {
        setDisasterReports(data.data.disasterReports || []);
        setRoadReports(data.data.roadReports || []);
      } else {
        throw new Error(data.message || 'Gagal memuat laporan');
      }
    } catch (error: any) {
      console.error('Error loading assigned reports:', error);
      toast.error(error.message || 'Gagal memuat laporan');
    } finally {
      setIsLoading(false);
    }
  };

  const loadReportActivities = async (reportId: string, reportType: 'disaster' | 'road') => {
    try {
      const res = await apiCall(
        `${API_ENDPOINTS.activities.getReport(reportId)}?reportType=${reportType}`
      );
      const data = await res.json();

      if (res.ok && data.success) {
        setActivities(data.data || []);
      }
    } catch (error) {
      console.error('Error loading activities:', error);
    }
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
        loadAssignedReports();
      } else {
        throw new Error(data.message || 'Gagal memperbarui status');
      }
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast.error(error.message || 'Gagal memperbarui status');
    }
  };

  const handleCreateActivity = async () => {
    if (!selectedReport) return;

    if (!activityForm.description.trim()) {
      toast.error('Deskripsi aktivitas wajib diisi');
      return;
    }

    if (activityForm.activityType === 'status_changed' && !activityForm.newStatus) {
      toast.error('Status baru wajib dipilih');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('reportType', selectedReport.type);
      formData.append('description', activityForm.description);
      formData.append('activityType', activityForm.activityType);

      if (activityForm.activityType === 'status_changed' && activityForm.newStatus) {
        formData.append('newStatus', activityForm.newStatus);
      }

      activityForm.images.forEach((file) => {
        formData.append('images', file);
      });

      const accessToken = getAccessToken();
      if (!accessToken) {
        toast.error('Sesi telah berakhir, silakan login kembali');
        router.push('/login');
        return;
      }

      const res = await fetch(API_ENDPOINTS.activities.create(selectedReport.id), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success('Aktivitas berhasil ditambahkan');
        setActivityDialogOpen(false);
        setActivityForm({
          description: '',
          activityType: 'status_changed',
          newStatus: '',
          images: [],
        });
        loadAssignedReports();
        if (selectedReport) {
          loadReportActivities(selectedReport.id, selectedReport.type);
        }
      } else {
        throw new Error(data.message || 'Gagal menambahkan aktivitas');
      }
    } catch (error: any) {
      console.error('Error creating activity:', error);
      toast.error(error.message || 'Gagal menambahkan aktivitas');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const filesToAdd = files.slice(0, 5 - activityForm.images.length);
      setActivityForm({
        ...activityForm,
        images: [...activityForm.images, ...filesToAdd],
      });
    }
  };

  const removeFile = (index: number) => {
    setActivityForm({
      ...activityForm,
      images: activityForm.images.filter((_, i) => i !== index),
    });
  };

  const openActivityDialog = (report: AssignedReport) => {
    setSelectedReport(report);
    setActivityDialogOpen(true);
    loadReportActivities(report.id, report.type);
  };

  const filteredDisasterReports = disasterReports.filter((r) => {
    return statusFilter === 'all' || r.status === statusFilter;
  });

  const filteredRoadReports = roadReports.filter((r) => {
    return statusFilter === 'all' || r.status === statusFilter;
  });

  if (!mounted || authLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <p>Memuat...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user || user.role !== 'petugas') {
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
        <h1 className="text-3xl font-bold mb-2">Monitoring Laporan</h1>
        <p className="text-muted-foreground">Kelola laporan yang ditugaskan kepada Anda</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{disasterReports.length + roadReports.length}</p>
              <p className="text-sm text-muted-foreground">Total Laporan</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/10">
              <Clock className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {[...disasterReports, ...roadReports].filter((r) => r.status === 'pending').length}
              </p>
              <p className="text-sm text-muted-foreground">Menunggu</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-info/10">
              <AlertTriangle className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {
                  [...disasterReports, ...roadReports].filter((r) => r.status === 'in_progress')
                    .length
                }
              </p>
              <p className="text-sm text-muted-foreground">Ditangani</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <CheckCircle className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {[...disasterReports, ...roadReports].filter((r) => r.status === 'resolved').length}
              </p>
              <p className="text-sm text-muted-foreground">Selesai</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="disaster" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="disaster" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              Laporan Bencana ({disasterReports.length})
            </TabsTrigger>
            <TabsTrigger value="road" className="gap-2">
              <Construction className="h-4 w-4" />
              Laporan Jalan ({roadReports.length})
            </TabsTrigger>
          </TabsList>

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

        {/* DISASTER REPORTS */}
        <TabsContent value="disaster" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Laporan Bencana yang Ditugaskan</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredDisasterReports.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Tidak ada laporan bencana yang ditugaskan</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredDisasterReports.map((report) => (
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
                              <DisasterTypeBadge type={report.type as any} />
                              {report.riskLevel && (
                                <RiskLevelBadge level={report.riskLevel as any} />
                              )}
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
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {new Date(report.createdAt).toLocaleDateString('id-ID')}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Dialog
                            open={activityDialogOpen && selectedReport?.id === report.id}
                            onOpenChange={(open) => {
                              setActivityDialogOpen(open);
                              if (open) {
                                openActivityDialog(report);
                              } else {
                                setSelectedReport(null);
                                setActivityForm({
                                  description: '',
                                  activityType: 'status_changed',
                                  newStatus: '',
                                  images: [],
                                });
                              }
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openActivityDialog(report)}
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                Aktivitas
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Tambah Aktivitas</DialogTitle>
                                <DialogDescription>
                                  Tambahkan catatan atau update status laporan
                                </DialogDescription>
                              </DialogHeader>

                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label>Jenis Aktivitas</Label>
                                  <Select
                                    value={activityForm.activityType}
                                    onValueChange={(v) =>
                                      setActivityForm({ ...activityForm, activityType: v })
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="status_changed">Ubah Status</SelectItem>
                                      <SelectItem value="verified">Verifikasi</SelectItem>
                                      <SelectItem value="in_progress">Mulai Penanganan</SelectItem>
                                      <SelectItem value="resolved">Selesai</SelectItem>
                                      <SelectItem value="note_added">Tambah Catatan</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                {activityForm.activityType === 'status_changed' && (
                                  <div className="space-y-2">
                                    <Label>Status Baru</Label>
                                    <Select
                                      value={activityForm.newStatus}
                                      onValueChange={(v) =>
                                        setActivityForm({ ...activityForm, newStatus: v })
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Pilih status" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="pending">Menunggu</SelectItem>
                                        <SelectItem value="verified">Terverifikasi</SelectItem>
                                        <SelectItem value="in_progress">Ditangani</SelectItem>
                                        <SelectItem value="resolved">Selesai</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                )}

                                <div className="space-y-2">
                                  <Label>Deskripsi</Label>
                                  <Textarea
                                    value={activityForm.description}
                                    onChange={(e) =>
                                      setActivityForm({
                                        ...activityForm,
                                        description: e.target.value,
                                      })
                                    }
                                    placeholder="Masukkan deskripsi aktivitas..."
                                    rows={4}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label>Gambar (Opsional, maks 5)</Label>
                                  <Input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleFileChange}
                                    disabled={activityForm.images.length >= 5}
                                  />
                                  {activityForm.images.length > 0 && (
                                    <div className="grid grid-cols-5 gap-2 mt-2">
                                      {activityForm.images.map((file, index) => (
                                        <div key={index} className="relative">
                                          <img
                                            src={URL.createObjectURL(file)}
                                            alt={`Preview ${index + 1}`}
                                            className="w-full h-20 object-cover rounded"
                                          />
                                          <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            className="absolute top-0 right-0 h-6 w-6 p-0"
                                            onClick={() => removeFile(index)}
                                          >
                                            <X className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {activities.length > 0 && (
                                  <div className="space-y-2">
                                    <Label>Riwayat Aktivitas</Label>
                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                      {activities.map((activity) => (
                                        <div
                                          key={activity.id}
                                          className="p-2 border rounded text-sm"
                                        >
                                          <p className="font-medium">{activity.description}</p>
                                          <p className="text-xs text-muted-foreground">
                                            {activity.createdBy.name} -{' '}
                                            {new Date(activity.createdAt).toLocaleString('id-ID')}
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>

                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setActivityDialogOpen(false);
                                    setActivityForm({
                                      description: '',
                                      activityType: 'status_changed',
                                      newStatus: '',
                                      images: [],
                                    });
                                  }}
                                >
                                  Batal
                                </Button>
                                <Button onClick={handleCreateActivity}>Simpan</Button>
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
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ROAD REPORTS */}
        <TabsContent value="road" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Laporan Jalan yang Ditugaskan</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredRoadReports.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Construction className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Tidak ada laporan jalan yang ditugaskan</p>
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
                              <RoadIssueTypeBadge type={report.type as any} />
                              {report.dangerLevel && (
                                <DangerLevelBadge level={report.dangerLevel as any} />
                              )}
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
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {new Date(report.createdAt).toLocaleDateString('id-ID')}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Dialog
                            open={activityDialogOpen && selectedReport?.id === report.id}
                            onOpenChange={(open) => {
                              setActivityDialogOpen(open);
                              if (open) {
                                openActivityDialog(report);
                              } else {
                                setSelectedReport(null);
                                setActivityForm({
                                  description: '',
                                  activityType: 'status_changed',
                                  newStatus: '',
                                  images: [],
                                });
                              }
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openActivityDialog(report)}
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                Aktivitas
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Tambah Aktivitas</DialogTitle>
                                <DialogDescription>
                                  Tambahkan catatan atau update status laporan
                                </DialogDescription>
                              </DialogHeader>

                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label>Jenis Aktivitas</Label>
                                  <Select
                                    value={activityForm.activityType}
                                    onValueChange={(v) =>
                                      setActivityForm({ ...activityForm, activityType: v })
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="status_changed">Ubah Status</SelectItem>
                                      <SelectItem value="verified">Verifikasi</SelectItem>
                                      <SelectItem value="in_progress">Mulai Penanganan</SelectItem>
                                      <SelectItem value="resolved">Selesai</SelectItem>
                                      <SelectItem value="note_added">Tambah Catatan</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                {activityForm.activityType === 'status_changed' && (
                                  <div className="space-y-2">
                                    <Label>Status Baru</Label>
                                    <Select
                                      value={activityForm.newStatus}
                                      onValueChange={(v) =>
                                        setActivityForm({ ...activityForm, newStatus: v })
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Pilih status" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="pending">Menunggu</SelectItem>
                                        <SelectItem value="verified">Terverifikasi</SelectItem>
                                        <SelectItem value="in_progress">Ditangani</SelectItem>
                                        <SelectItem value="resolved">Selesai</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                )}

                                <div className="space-y-2">
                                  <Label>Deskripsi</Label>
                                  <Textarea
                                    value={activityForm.description}
                                    onChange={(e) =>
                                      setActivityForm({
                                        ...activityForm,
                                        description: e.target.value,
                                      })
                                    }
                                    placeholder="Masukkan deskripsi aktivitas..."
                                    rows={4}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label>Gambar (Opsional, maks 5)</Label>
                                  <Input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleFileChange}
                                    disabled={activityForm.images.length >= 5}
                                  />
                                  {activityForm.images.length > 0 && (
                                    <div className="grid grid-cols-5 gap-2 mt-2">
                                      {activityForm.images.map((file, index) => (
                                        <div key={index} className="relative">
                                          <img
                                            src={URL.createObjectURL(file)}
                                            alt={`Preview ${index + 1}`}
                                            className="w-full h-20 object-cover rounded"
                                          />
                                          <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            className="absolute top-0 right-0 h-6 w-6 p-0"
                                            onClick={() => removeFile(index)}
                                          >
                                            <X className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {activities.length > 0 && (
                                  <div className="space-y-2">
                                    <Label>Riwayat Aktivitas</Label>
                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                      {activities.map((activity) => (
                                        <div
                                          key={activity.id}
                                          className="p-2 border rounded text-sm"
                                        >
                                          <p className="font-medium">{activity.description}</p>
                                          <p className="text-xs text-muted-foreground">
                                            {activity.createdBy.name} -{' '}
                                            {new Date(activity.createdAt).toLocaleString('id-ID')}
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>

                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setActivityDialogOpen(false);
                                    setActivityForm({
                                      description: '',
                                      activityType: 'status_changed',
                                      newStatus: '',
                                      images: [],
                                    });
                                  }}
                                >
                                  Batal
                                </Button>
                                <Button onClick={handleCreateActivity}>Simpan</Button>
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
