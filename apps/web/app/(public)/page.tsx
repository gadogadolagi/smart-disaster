'use client';

import { MapPreview, RealtimeMonitoring } from '@/components/shared';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { API_ENDPOINTS, getImageUrl } from '@/lib/api/config';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  ChevronRight,
  Clock,
  Construction,
  Droplets,
  FileText,
  Flame,
  HelpCircle,
  MapPin,
  Phone,
  Shield,
  TreePine,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const features = [
  {
    icon: Flame,
    title: 'Prediksi Kebakaran',
    description: 'Monitoring real-time sensor IoT untuk deteksi dini kebakaran hutan dan lahan',
    href: '/fire-prediction',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
  {
    icon: Droplets,
    title: 'Deteksi Risiko Banjir',
    description: 'Analisis curah hujan dan ketinggian wilayah untuk peringatan dini banjir',
    href: '/flood-risk',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    icon: AlertTriangle,
    title: 'Laporkan Bencana',
    description: 'Laporkan kejadian bencana alam secara cepat dengan foto dan lokasi GPS',
    href: '/laporkan-bencana',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  {
    icon: Construction,
    title: 'Lapor Jalan Rusak',
    description: 'Laporkan kondisi jalan berlubang, longsor, atau kerusakan infrastruktur',
    href: '/laporkan-jalan',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
];

const disasterTypes = [
  { icon: Droplets, label: 'Banjir', count: 12, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  { icon: TreePine, label: 'Longsor', count: 5, color: 'text-orange-600', bgColor: 'bg-orange-50' },
  { icon: Flame, label: 'Kebakaran', count: 8, color: 'text-red-600', bgColor: 'bg-red-50' },
  {
    icon: AlertTriangle,
    label: 'Pohon Tumbang',
    count: 15,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
  },
];

interface RecentReport {
  id: string;
  reportType: 'disaster' | 'road';
  type: string;
  title: string;
  description: string;
  address: string;
  district?: string;
  images: string[];
  status: string;
  riskLevel?: string;
  dangerLevel?: string;
  createdAt: string;
  updatedAt: string;
}

interface MapReport {
  id: string;
  reportType: 'disaster' | 'road';
  type: string;
  title: string;
  lat: number;
  lng: number;
  address: string;
  district?: string;
  status: string;
  riskLevel?: string;
  dangerLevel?: string;
  createdAt: string;
}

interface Activity {
  id: string;
  reportId: string;
  reportType: string;
  activityType: string;
  description: string;
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
    role: string;
  };
}

export default function Home() {
  const { isAuthenticated, isGovernment } = useAuth();
  const [recentReports, setRecentReports] = useState<RecentReport[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const [mapReports, setMapReports] = useState<MapReport[]>([]);
  const [isLoadingMap, setIsLoadingMap] = useState(true);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);

  useEffect(() => {
    const fetchRecentReports = async () => {
      try {
        setIsLoadingReports(true);
        const response = await fetch(`${API_ENDPOINTS.reports.recent}?limit=3`, {
          cache: 'no-store',
        });

        if (response.ok) {
          const data = await response.json();
          setRecentReports(data.data || []);
        } else {
          console.error('Failed to fetch recent reports');
        }
      } catch (error) {
        console.error('Error fetching recent reports:', error);
      } finally {
        setIsLoadingReports(false);
      }
    };

    fetchRecentReports();
  }, []);

  // Fetch map reports
  useEffect(() => {
    const fetchMapReports = async () => {
      try {
        setIsLoadingMap(true);
        const response = await fetch(`${API_ENDPOINTS.reports.map}?limit=50`, {
          cache: 'no-store',
        });

        if (response.ok) {
          const data = await response.json();
          setMapReports(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching map reports:', error);
      } finally {
        setIsLoadingMap(false);
      }
    };

    fetchMapReports();
  }, []);

  // Fetch recent activities
  useEffect(() => {
    const fetchRecentActivities = async () => {
      try {
        setIsLoadingActivities(true);
        const response = await fetch(`${API_ENDPOINTS.activities.recent}?limit=5`, {
          cache: 'no-store',
        });

        if (response.ok) {
          const data = await response.json();
          setRecentActivities(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching recent activities:', error);
      } finally {
        setIsLoadingActivities(false);
      }
    };

    fetchRecentActivities();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-blue-50">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-blue-50 rounded-full blur-3xl" />

        <div className="container relative py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge
                variant="outline"
                className="px-4 py-2 text-sm font-medium border-primary/30 bg-primary/5"
              >
                <Activity className="w-4 h-4 mr-2 text-primary" />
                Sistem Monitoring Real-Time
              </Badge>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-foreground">
                Portal Pelaporan{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">
                  Kebencanaan
                </span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-lg">
                Sistem terpadu untuk monitoring bencana, pelaporan cepat, dan koordinasi penanganan
                darurat berbasis teknologi IoT dan AI.
              </p>

              <div className="flex flex-wrap gap-4">
                {isAuthenticated && !isGovernment ? (
                  <>
                    <Link href="/laporkan-bencana">
                      <Button size="lg" className="gap-2 shadow-lg">
                        <AlertTriangle className="w-5 h-5" />
                        Laporkan Bencana
                      </Button>
                    </Link>
                    <Link href="/laporan-saya">
                      <Button size="lg" variant="outline" className="gap-2">
                        <FileText className="w-5 h-5" />
                        Lihat Laporan Saya
                      </Button>
                    </Link>
                  </>
                ) : isGovernment ? (
                  <Link href="/dashboard">
                    <Button size="lg" className="gap-2 shadow-lg">
                      <Shield className="w-5 h-5" />
                      Buka Dashboard Admin
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/register">
                      <Button size="lg" className="gap-2 shadow-lg">
                        <Users className="w-5 h-5" />
                        Daftar Sekarang
                      </Button>
                    </Link>
                    <Link href="/login">
                      <Button size="lg" variant="outline" className="gap-2">
                        Masuk
                        <ArrowRight className="w-5 h-5" />
                      </Button>
                    </Link>
                  </>
                )}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
                <div className="p-4 rounded-xl bg-card border border-border shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-green-100">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  </div>
                  <p className="text-3xl font-bold text-foreground">24/7</p>
                  <p className="text-sm text-muted-foreground">Monitoring</p>
                </div>
                <div className="p-4 rounded-xl bg-card border border-border shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  </div>
                  <p className="text-3xl font-bold text-foreground">Real-time</p>
                  <p className="text-sm text-muted-foreground">Update</p>
                </div>
                <div className="p-4 rounded-xl bg-card border border-border shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-orange-100">
                      <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                  </div>
                  <p className="text-3xl font-bold text-foreground">&lt;1m</p>
                  <p className="text-sm text-muted-foreground">Response</p>
                </div>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative hidden lg:block">
              <div className="relative bg-card backdrop-blur-xl rounded-3xl p-8 border border-border shadow-2xl">
                <div className="absolute -top-4 -right-4 bg-gradient-to-r from-red-600 to-red-500 text-white px-5 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 shadow-xl">
                  <span className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
                  Live Monitoring
                </div>

                {/* Mini Dashboard Preview */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-lg text-foreground">Status Terkini</h3>
                    <Badge variant="outline" className="border-border bg-muted">
                      Real-time
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {disasterTypes.map((type, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-xl bg-muted/50 border border-border hover:bg-muted transition-all"
                      >
                        <div className={`p-2 rounded-lg ${type.bgColor} w-fit mb-2`}>
                          <type.icon className={`w-6 h-6 ${type.color}`} />
                        </div>
                        <p className="text-2xl font-bold text-foreground">{type.count}</p>
                        <p className="text-sm text-muted-foreground">{type.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-red-100">
                        <Flame className="w-5 h-5 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-foreground">Peringatan Dini</p>
                        <p className="text-xs text-muted-foreground">Sistem aktif 24/7</p>
                      </div>
                      <Zap className="w-5 h-5 text-red-600 animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              Fitur Utama
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Solusi Lengkap Penanganan Bencana
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Dari deteksi dini hingga penanganan lapangan, portal ini menyediakan berbagai fitur
              untuk membantu masyarakat dan pemerintah.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <Link key={i} href={feature.href}>
                <Card className="h-full group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border">
                  <CardContent className="p-6">
                    <div
                      className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                    >
                      <feature.icon className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">{feature.description}</p>
                    <div className="flex items-center text-primary text-sm font-medium">
                      Selengkapnya
                      <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Real-time Monitoring Section */}
      <RealtimeMonitoring />

      {/* Map Preview Section */}
      <section className="py-12 md:py-20 bg-background">
        <div className="container">
          <div className="mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-foreground">Peta Lokasi Laporan</h2>
            <p className="text-sm md:text-base text-muted-foreground">
              Lihat lokasi laporan bencana dan jalan rusak di peta interaktif
            </p>
          </div>
          {isLoadingMap ? (
            <Card className="border-border">
              <CardContent className="p-8 md:p-12 text-center">
                <p className="text-muted-foreground">Memuat peta...</p>
              </CardContent>
            </Card>
          ) : mapReports.length > 0 ? (
            <div className="w-full">
              <MapPreview reports={mapReports} height="400px" className="w-full" />
            </div>
          ) : (
            <Card className="border-border">
              <CardContent className="p-8 md:p-12 text-center">
                <MapPin className="w-12 h-12 md:w-16 md:h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm md:text-base text-muted-foreground">Belum ada laporan untuk ditampilkan di peta</p>
              </CardContent>
            </Card>
          )}
          <div className="mt-4 text-center">
            <Link href="/public-reports">
              <Button variant="outline" className="gap-2 text-sm md:text-base">
                Lihat Monitoring Lengkap <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Tips Kesiapsiagaan Section */}
      <section className="py-12 md:py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-8 md:mb-12">
            <Badge variant="outline" className="mb-4">
              Kesiapsiagaan
            </Badge>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-foreground">
              Tips Kesiapsiagaan Bencana
            </h2>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto px-4">
              Pelajari cara mempersiapkan diri dan keluarga menghadapi berbagai jenis bencana
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 px-4 md:px-0">
            <Card className="border-border">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                  <Droplets className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-foreground">Banjir</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Siapkan tas darurat</li>
                  <li>• Evakuasi ke tempat tinggi</li>
                  <li>• Hindari arus air</li>
                  <li>• Matikan listrik</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mb-4">
                  <Flame className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-foreground">Kebakaran</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Jangan panik</li>
                  <li>• Gunakan tangga darurat</li>
                  <li>• Tutup pintu dan jendela</li>
                  <li>• Hubungi 112</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center mb-4">
                  <TreePine className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-foreground">Longsor</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Hindari lereng curam</li>
                  <li>• Waspada saat hujan</li>
                  <li>• Evakuasi segera</li>
                  <li>• Jauhi area longsor</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center mb-4">
                  <AlertTriangle className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-foreground">Gempa Bumi</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Berlindung di bawah meja</li>
                  <li>• Jauhi jendela</li>
                  <li>• Tetap tenang</li>
                  <li>• Evakuasi setelah gempa</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 text-center">
            <Link href="/panduan">
              <Button variant="outline" className="gap-2">
                Lihat Panduan Lengkap <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Timeline Aktivitas Section */}
      <section className="py-12 md:py-20 bg-background">
        <div className="container">
          <div className="mb-6 md:mb-8 px-4 md:px-0">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-foreground">Timeline Aktivitas Terbaru</h2>
            <p className="text-sm md:text-base text-muted-foreground">Update penanganan laporan terkini</p>
          </div>

          {isLoadingActivities ? (
            <Card className="border-border mx-4 md:mx-0">
              <CardContent className="p-8 md:p-12 text-center">
                <p className="text-sm md:text-base text-muted-foreground">Memuat aktivitas...</p>
              </CardContent>
            </Card>
          ) : recentActivities.length > 0 ? (
            <Card className="border-border mx-4 md:mx-0">
              <CardContent className="p-4 md:p-6">
                <div className="space-y-3 md:space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div
                      key={activity.id}
                      className={`flex gap-3 md:gap-4 ${index !== recentActivities.length - 1 ? 'pb-3 md:pb-4 border-b border-border' : ''}`}
                    >
                      <div className="shrink-0">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          {activity.activityType === 'resolved' ? (
                            <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                          ) : activity.activityType === 'in_progress' ? (
                            <Activity className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                          ) : activity.activityType === 'verified' ? (
                            <Shield className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                          ) : (
                            <FileText className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs md:text-sm font-medium text-foreground">
                          {activity.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-1 md:gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {activity.createdBy.name} ({activity.createdBy.role})
                          </span>
                          <span className="text-xs text-muted-foreground hidden sm:inline">•</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(activity.createdAt).toLocaleString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border mx-4 md:mx-0">
              <CardContent className="p-8 md:p-12 text-center">
                <Activity className="w-12 h-12 md:w-16 md:h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm md:text-base text-muted-foreground">Belum ada aktivitas terbaru</p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Recent Reports Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2 text-foreground">Laporan Terbaru</h2>
              <p className="text-muted-foreground">Laporan bencana terkini dari masyarakat</p>
            </div>

            {isAuthenticated && !isGovernment ? (
              <Link href="/laporan-saya">
                <Button variant="outline" className="gap-2">
                  Lihat Semua <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <Link href="/public-reports">
                <Button variant="outline" className="gap-2">
                  Lihat Semua <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            )}
          </div>

          {isLoadingReports ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden animate-pulse border-border">
                  <div className="h-48 bg-muted" />
                  <CardContent className="p-5">
                    <div className="h-4 bg-muted rounded w-20 mb-3" />
                    <div className="h-5 bg-muted rounded w-full mb-2" />
                    <div className="h-4 bg-muted rounded w-3/4 mb-4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : recentReports.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-6">
            {recentReports.map((report) => (
                <Link
                  key={report.id}
                  href={
                    report.reportType === 'disaster'
                      ? `/public-reports/disaster/${report.id}`
                      : `/public-reports/road/${report.id}`
                  }
                >
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full border-border">
                    {report.images?.[0] ? (
                      <div className="h-48 bg-muted relative overflow-hidden group">
                        <img
                          src={getImageUrl(report.images[0])}
                      alt={report.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute top-3 right-3">
                      <Badge
                        variant={
                          report.status === 'resolved'
                            ? 'default'
                            : report.status === 'in_progress'
                              ? 'secondary'
                              : 'outline'
                        }
                            className="backdrop-blur-sm"
                      >
                        {report.status === 'resolved'
                          ? 'Selesai'
                          : report.status === 'in_progress'
                            ? 'Ditangani'
                                : report.status === 'verified'
                                  ? 'Terverifikasi'
                            : 'Menunggu'}
                      </Badge>
                    </div>
                        <div className="absolute bottom-3 left-3 right-3">
                          <Badge variant="outline" className="text-xs bg-white/90 backdrop-blur-sm">
                            {report.reportType === 'disaster'
                              ? report.type === 'flood'
                        ? 'Banjir'
                        : report.type === 'fire'
                          ? 'Kebakaran'
                          : report.type === 'landslide'
                            ? 'Longsor'
                                    : report.type === 'earthquake'
                                      ? 'Gempa'
                                      : report.type === 'fallen_tree'
                                        ? 'Pohon Tumbang'
                                        : 'Lainnya'
                              : report.type === 'pothole'
                                ? 'Lubang'
                                : report.type === 'crack'
                                  ? 'Retak'
                                  : report.type === 'landslide'
                                    ? 'Longsor'
                                    : report.type === 'flooding'
                                      ? 'Banjir'
                                      : report.type === 'bridge_damage'
                                        ? 'Jembatan Rusak'
                            : 'Lainnya'}
                    </Badge>
                  </div>
                      </div>
                    ) : (
                      <div className="h-48 bg-muted flex items-center justify-center">
                        <FileText className="w-12 h-12 text-muted-foreground/50" />
                      </div>
                    )}

                    <CardContent className="p-5">
                      <h3 className="font-semibold mb-2 line-clamp-2 min-h-12 text-foreground">
                        {report.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4 min-h-10">
                    {report.description}
                  </p>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 shrink-0" />
                        <span className="line-clamp-1">{report.address}</span>
                  </div>
                </CardContent>
              </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Belum ada laporan terbaru</p>
            </div>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 md:py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-8 md:mb-12 px-4">
            <Badge variant="outline" className="mb-4">
              FAQ
            </Badge>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-foreground">Pertanyaan Umum</h2>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
              Temukan jawaban untuk pertanyaan umum tentang sistem pelaporan bencana
            </p>
          </div>

          <div className="max-w-3xl mx-auto px-4 md:px-0">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-left">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-primary" />
                    <span>Bagaimana cara melaporkan bencana?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Anda dapat melaporkan bencana melalui halaman "Laporkan Bencana". Isi formulir
                  dengan informasi lengkap termasuk foto, lokasi (dapat dipilih di peta), dan
                  deskripsi kejadian. Sistem akan otomatis menganalisis laporan Anda menggunakan AI.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger className="text-left">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-primary" />
                    <span>Apakah saya perlu login untuk melaporkan?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Tidak, Anda dapat melaporkan secara anonim. Namun, jika Anda login, Anda dapat
                  melacak status laporan Anda dan mendapatkan update lebih cepat.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger className="text-left">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-primary" />
                    <span>Berapa lama waktu respon untuk laporan?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Sistem dirancang untuk merespons dalam waktu kurang dari 1 menit. Laporan dengan
                  tingkat urgensi tinggi akan diprioritaskan dan ditangani segera oleh petugas yang
                  ditugaskan.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger className="text-left">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-primary" />
                    <span>Bagaimana cara melacak status laporan saya?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Jika Anda sudah login, Anda dapat melihat semua laporan Anda di halaman "Laporan
                  Saya". Di sana Anda dapat melihat status, timeline aktivitas, dan update dari
                  petugas yang menangani.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger className="text-left">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-primary" />
                    <span>Apakah data lokasi saya aman?</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Ya, semua data pribadi dan lokasi Anda dilindungi. Lokasi hanya digunakan untuk
                  keperluan penanganan bencana dan tidak akan dibagikan kepada pihak ketiga tanpa
                  izin.
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="mt-8 text-center">
              <Link href="/faq">
                <Button variant="outline" className="gap-2">
                  Lihat FAQ Lengkap <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Contact */}
      <section className="py-12 md:py-16 bg-gradient-to-r from-red-600 to-red-500">
        <div className="container px-4 md:px-0">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-white">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="p-3 md:p-4 rounded-full bg-white/20">
                <Phone className="w-6 h-6 md:w-8 md:h-8" />
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-bold">Butuh Bantuan Darurat?</h3>
                <p className="text-sm md:text-base text-white/90">Hubungi nomor darurat 24 jam</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4 w-full sm:w-auto">
              <a href="tel:112" className="w-full sm:w-auto">
                <Button size="lg" variant="secondary" className="gap-2 shadow-lg w-full sm:w-auto">
                  <Phone className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="text-sm md:text-base">112 - Nomor Darurat</span>
                </Button>
              </a>
              <a href="tel:119" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 bg-white/10 border-white text-white hover:bg-white/20 w-full sm:w-auto"
                >
                  <span className="text-sm md:text-base">119 - Ambulans</span>
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
