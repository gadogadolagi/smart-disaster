'use client';

import { StatsCard } from '@/components/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { useAuth } from '@/contexts/AuthContext';
import { API_ENDPOINTS, apiCall } from '@/lib/api/config';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle,
  Clock,
  FileText,
  MapPin,
  TrendingUp,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from 'recharts';
import { toast } from 'sonner';

interface Statistics {
  totalReports: number;
  totalDisasterReports: number;
  totalRoadReports: number;
  pendingReports: number;
  verifiedReports: number;
  inProgressReports: number;
  resolvedReports: number;
  rejectedReports: number;
  disasterByType: Record<string, number>;
  reportsByDistrict: Record<string, number>;
  reportsByStatus: Record<string, number>;
  recentReports: number;
  averageResolutionTime: number;
  resolutionRate: number;
  reportsTrend: Array<{ date: string; disaster: number; road: number; total: number }>;
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
    verifiedReports: 0,
    inProgressReports: 0,
    resolvedReports: 0,
    rejectedReports: 0,
    disasterByType: {},
    reportsByDistrict: {},
    reportsByStatus: {},
    recentReports: 0,
    averageResolutionTime: 0,
    resolutionRate: 0,
    reportsTrend: [],
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
      const res = await apiCall(API_ENDPOINTS.stats.dashboard);
      const data = await res.json();

      if (res.ok && data.success) {
        setStats({
          totalReports: data.data.totalReports || 0,
          totalDisasterReports: data.data.totalDisasterReports || 0,
          totalRoadReports: data.data.totalRoadReports || 0,
          pendingReports: data.data.pendingReports || 0,
          verifiedReports: data.data.verifiedReports || 0,
          inProgressReports: data.data.inProgressReports || 0,
          resolvedReports: data.data.resolvedReports || 0,
          rejectedReports: data.data.rejectedReports || 0,
          disasterByType: data.data.disasterByType || {},
          reportsByDistrict: data.data.reportsByDistrict || {},
          reportsByStatus: data.data.reportsByStatus || {},
          recentReports: data.data.recentReports || 0,
          averageResolutionTime: data.data.averageResolutionTime || 0,
          resolutionRate: data.data.resolutionRate || 0,
          reportsTrend: data.data.reportsTrend || [],
        });
      } else {
        throw new Error(data.message || 'Gagal memuat data statistik');
      }
    } catch (error: any) {
      console.error('Error loading statistics:', error);
      toast.error(error.message || 'Gagal memuat statistik');
    } finally {
      setIsLoading(false);
    }
  };

  const disasterTypeLabels: Record<string, string> = {
    flood: 'Banjir',
    fire: 'Kebakaran',
    landslide: 'Longsor',
    fallen_tree: 'Pohon Tumbang',
    earthquake: 'Gempa Bumi',
    other: 'Lainnya',
  };

  const statusLabels: Record<string, string> = {
    pending: 'Menunggu',
    verified: 'Terverifikasi',
    in_progress: 'Ditangani',
    resolved: 'Selesai',
    rejected: 'Ditolak',
  };

  // Prepare chart data
  const statusChartData = useMemo(() => {
    return Object.entries(stats.reportsByStatus).map(([status, count]) => ({
      status: statusLabels[status] || status,
      value: count,
      fill: getStatusColor(status),
    }));
  }, [stats.reportsByStatus]);

  const disasterTypeChartData = useMemo(() => {
    return Object.entries(stats.disasterByType)
      .sort(([, a], [, b]) => b - a)
      .map(([type, count]) => ({
        type: disasterTypeLabels[type] || type,
        value: count,
        fill: getDisasterTypeColor(type),
      }));
  }, [stats.disasterByType]);

  const districtChartData = useMemo(() => {
    return Object.entries(stats.reportsByDistrict)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([district, count]) => ({
        district: district.length > 15 ? district.substring(0, 15) + '...' : district,
        fullDistrict: district,
        value: count,
      }));
  }, [stats.reportsByDistrict]);

  const trendChartData = useMemo(() => {
    if (!stats.reportsTrend || stats.reportsTrend.length === 0) {
      return [];
    }
    return stats.reportsTrend.map((item) => ({
      date: new Date(item.date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' }),
      fullDate: item.date,
      disaster: item.disaster || 0,
      road: item.road || 0,
      total: item.total || 0,
    }));
  }, [stats.reportsTrend]);

  const statusChartConfig: ChartConfig = {
    pending: {
      label: 'Menunggu',
      color: 'hsl(var(--chart-1))',
    },
    verified: {
      label: 'Terverifikasi',
      color: 'hsl(var(--chart-2))',
    },
    in_progress: {
      label: 'Ditangani',
      color: 'hsl(var(--chart-3))',
    },
    resolved: {
      label: 'Selesai',
      color: 'hsl(var(--chart-4))',
    },
    rejected: {
      label: 'Ditolak',
      color: 'hsl(var(--chart-5))',
    },
  };

  const disasterTypeChartConfig: ChartConfig = {
    flood: { label: 'Banjir', color: '#3b82f6' },
    fire: { label: 'Kebakaran', color: '#ef4444' },
    landslide: { label: 'Longsor', color: '#f59e0b' },
    fallen_tree: { label: 'Pohon Tumbang', color: '#10b981' },
    earthquake: { label: 'Gempa Bumi', color: '#8b5cf6' },
    other: { label: 'Lainnya', color: '#6b7280' },
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
          {/* Stats Cards */}
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
            <StatsCard title="Laporan Jalan" value={stats.totalRoadReports} icon={FileText} />
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
                <div className="text-2xl font-bold">{stats.resolutionRate}%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.resolvedReports} dari {stats.totalReports} laporan
                </p>
                {stats.averageResolutionTime > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Rata-rata: {stats.averageResolutionTime} jam
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid gap-6 mb-8">
            {/* Trend Chart - Line/Area Chart */}
            {trendChartData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Trend Laporan (30 Hari Terakhir)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      disaster: {
                        label: 'Bencana',
                        color: 'hsl(var(--chart-1))',
                      },
                      road: {
                        label: 'Jalan',
                        color: 'hsl(var(--chart-2))',
                      },
                      total: {
                        label: 'Total',
                        color: 'hsl(var(--chart-3))',
                      },
                    }}
                    className="h-[300px]"
                  >
                    <AreaChart data={trendChartData}>
                      <defs>
                        <linearGradient id="fillDisaster" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="fillRoad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={(value) => value.slice(0, 6)}
                      />
                      <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="disaster"
                        stroke="hsl(var(--chart-1))"
                        fill="url(#fillDisaster)"
                        stackId="1"
                      />
                      <Area
                        type="monotone"
                        dataKey="road"
                        stroke="hsl(var(--chart-2))"
                        fill="url(#fillRoad)"
                        stackId="1"
                      />
                      <ChartLegend content={<ChartLegendContent />} />
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-6 md:grid-cols-2">
              {/* Status Pie Chart */}
              {statusChartData.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5" />
                      Distribusi Status Laporan
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={statusChartConfig} className="h-[300px]">
                      <PieChart>
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Pie
                          data={statusChartData}
                          dataKey="value"
                          nameKey="status"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {statusChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <ChartLegend content={<ChartLegendContent />} />
                      </PieChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              )}

              {/* Disaster Type Bar Chart */}
              {disasterTypeChartData.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Laporan Bencana per Jenis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={disasterTypeChartConfig} className="h-[300px]">
                      <BarChart data={disasterTypeChartData} layout="vertical">
                        <XAxis type="number" tickLine={false} axisLine={false} />
                        <YAxis
                          dataKey="type"
                          type="category"
                          tickLine={false}
                          axisLine={false}
                          width={100}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="value" radius={4}>
                          {disasterTypeChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* District Bar Chart */}
            {districtChartData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Top 10 Laporan per Kecamatan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      value: {
                        label: 'Jumlah Laporan',
                        color: 'hsl(var(--chart-1))',
                      },
                    }}
                    className="h-[400px]"
                  >
                    <BarChart data={districtChartData}>
                      <XAxis
                        dataKey="district"
                        tickLine={false}
                        axisLine={false}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis tickLine={false} axisLine={false} />
                      <ChartTooltip
                        content={<ChartTooltipContent />}
                        labelFormatter={(value, payload) => {
                          const data = payload?.[0]?.payload;
                          return data?.fullDistrict || value;
                        }}
                      />
                      <Bar dataKey="value" radius={4} fill="hsl(var(--chart-1))" />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}

            {/* Status Comparison Line Chart */}
            {trendChartData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Perbandingan Bencana vs Jalan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      disaster: {
                        label: 'Bencana',
                        color: '#ef4444',
                      },
                      road: {
                        label: 'Jalan',
                        color: '#3b82f6',
                      },
                    }}
                    className="h-[300px]"
                  >
                    <LineChart data={trendChartData}>
                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={(value) => value.slice(0, 6)}
                      />
                      <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="disaster"
                        stroke="#ef4444"
                        strokeWidth={3}
                        dot={{ r: 5, fill: '#ef4444' }}
                        name="Bencana"
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="road"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={{ r: 5, fill: '#3b82f6' }}
                        name="Jalan"
                        activeDot={{ r: 6 }}
                      />
                      <ChartLegend content={<ChartLegendContent />} />
                    </LineChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// Helper functions
function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: '#f59e0b',
    verified: '#3b82f6',
    in_progress: '#8b5cf6',
    resolved: '#10b981',
    rejected: '#ef4444',
  };
  return colors[status] || '#6b7280';
}

function getDisasterTypeColor(type: string): string {
  const colors: Record<string, string> = {
    flood: '#3b82f6',
    fire: '#ef4444',
    landslide: '#f59e0b',
    fallen_tree: '#10b981',
    earthquake: '#8b5cf6',
    other: '#6b7280',
  };
  return colors[type] || '#6b7280';
}
