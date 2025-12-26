'use client';

import { StatsCard } from '@/components/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { API_ENDPOINTS, apiCall } from '@/lib/api/config';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle,
  Clock,
  FileText,
  Flame,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Statistics {
  totalReports: number;
  totalDisasterReports: number;
  totalRoadReports: number;
  pendingReports: number;
  inProgressReports: number;
  resolvedReports: number;
  disasterByType: Record<string, number>;
  reportsByDistrict: Record<string, number>;
  reportsByStatus: Record<string, number>;
  recentReports: number;
  averageResolutionTime: number;
}

export default function StatisticsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<Statistics>({
    totalReports: 0,
    totalDisasterReports: 0,
    totalRoadReports: 0,
    pendingReports: 0,
    inProgressReports: 0,
    resolvedReports: 0,
    disasterByType: {},
    reportsByDistrict: {},
    reportsByStatus: {},
    recentReports: 0,
    averageResolutionTime: 0,
  });

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    if (authLoading) return;

    if (!isAuthenticated || !user || user.role !== 'admin') {
      router.replace('/login');
      return;
    }

    loadStatistics();
  }, [mounted, authLoading, isAuthenticated, user, router]);

  const loadStatistics = async () => {
    setIsLoading(true);
    try {
      // Load disaster reports
      const disasterRes = await apiCall(API_ENDPOINTS.reports.disaster.list);
      const disasterData = await disasterRes.json();

      // Load road reports
      const roadRes = await apiCall(API_ENDPOINTS.reports.road.list);
      const roadData = await roadRes.json();

      if (disasterRes.ok && roadRes.ok) {
        const disasterReports = disasterData.data || [];
        const roadReports = roadData.data || [];
        const allReports = [...disasterReports, ...roadReports];

        // Calculate statistics
        const disasterByType: Record<string, number> = {};
        const reportsByDistrict: Record<string, number> = {};
        const reportsByStatus: Record<string, number> = {};

        disasterReports.forEach((report: any) => {
          disasterByType[report.type] = (disasterByType[report.type] || 0) + 1;
          reportsByDistrict[report.district] = (reportsByDistrict[report.district] || 0) + 1;
          reportsByStatus[report.status] = (reportsByStatus[report.status] || 0) + 1;
        });

        roadReports.forEach((report: any) => {
          reportsByDistrict[report.district] = (reportsByDistrict[report.district] || 0) + 1;
          reportsByStatus[report.status] = (reportsByStatus[report.status] || 0) + 1;
        });

        const pending = allReports.filter((r: any) => r.status === 'pending').length;
        const inProgress = allReports.filter((r: any) => r.status === 'in_progress').length;
        const resolved = allReports.filter((r: any) => r.status === 'resolved').length;

        // Calculate recent reports (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recent = allReports.filter(
          (r: any) => new Date(r.createdAt) >= sevenDaysAgo
        ).length;

        setStats({
          totalReports: allReports.length,
          totalDisasterReports: disasterReports.length,
          totalRoadReports: roadReports.length,
          pendingReports: pending,
          inProgressReports: inProgress,
          resolvedReports: resolved,
          disasterByType,
          reportsByDistrict,
          reportsByStatus,
          recentReports: recent,
          averageResolutionTime: 0, // Would need to calculate from resolved reports
        });
      } else {
        throw new Error('Gagal memuat data statistik');
      }
    } catch (error: any) {
      console.error('Error loading statistics:', error);
      toast.error(error.message || 'Gagal memuat statistik');
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Memuat...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user || user.role !== 'admin') {
    return null;
  }

  const disasterTypeLabels: Record<string, string> = {
    flood: 'Banjir',
    fire: 'Kebakaran',
    landslide: 'Longsor',
    fallen_tree: 'Pohon Tumbang',
    earthquake: 'Gempa Bumi',
    other: 'Lainnya',
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Statistik Pelaporan</h1>
        <p className="text-muted-foreground">Analisis data laporan bencana dan infrastruktur</p>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <p>Memuat statistik...</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <StatsCard title="Total Laporan" value={stats.totalReports} icon={FileText} />
            <StatsCard
              title="Menunggu"
              value={stats.pendingReports}
              icon={Clock}
              variant="warning"
            />
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

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <StatsCard
              title="Laporan Bencana"
              value={stats.totalDisasterReports}
              icon={AlertTriangle}
            />
            <StatsCard
              title="Laporan Jalan"
              value={stats.totalRoadReports}
              icon={FileText}
            />
            <StatsCard
              title="Laporan 7 Hari Terakhir"
              value={stats.recentReports}
              icon={TrendingUp}
            />
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Tingkat Penyelesaian
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalReports > 0
                    ? Math.round((stats.resolvedReports / stats.totalReports) * 100)
                    : 0}
                  %
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.resolvedReports} dari {stats.totalReports} laporan
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Laporan Bencana per Jenis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(stats.disasterByType)
                    .sort(([, a], [, b]) => b - a)
                    .map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Flame className="h-4 w-4 text-muted-foreground" />
                          <span>{disasterTypeLabels[type] || type}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{
                                width: `${
                                  stats.totalDisasterReports > 0
                                    ? (count / stats.totalDisasterReports) * 100
                                    : 0
                                }%`,
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium w-12 text-right">{count}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Laporan per Kecamatan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(stats.reportsByDistrict)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 10)
                    .map(([district, count]) => (
                      <div key={district} className="flex items-center justify-between">
                        <span>{district}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{
                                width: `${
                                  stats.totalReports > 0
                                    ? (count / stats.totalReports) * 100
                                    : 0
                                }%`,
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium w-12 text-right">{count}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

