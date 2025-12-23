'use client';

import { MainLayout } from '@/components/layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import {
  getDisasterReports,
  mockDashboardStats,
  mockFirePredictions,
  mockFloodRiskAreas,
} from '@/data/mockData';
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
  MapPin,
  Phone,
  Shield,
  TreePine,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    icon: Flame,
    title: 'Prediksi Kebakaran',
    description: 'Monitoring real-time sensor IoT untuk deteksi dini kebakaran hutan dan lahan',
    href: '/fire-prediction',
    color: 'text-emergency-fire',
    bgColor: 'bg-emergency-fire/10',
  },
  {
    icon: Droplets,
    title: 'Deteksi Risiko Banjir',
    description: 'Analisis curah hujan dan ketinggian wilayah untuk peringatan dini banjir',
    href: '/flood-risk',
    color: 'text-emergency-flood',
    bgColor: 'bg-emergency-flood/10',
  },
  {
    icon: AlertTriangle,
    title: 'Laporkan Bencana',
    description: 'Laporkan kejadian bencana alam secara cepat dengan foto dan lokasi GPS',
    href: '/report-disaster',
    color: 'text-emergency-warning',
    bgColor: 'bg-emergency-warning/10',
  },
  {
    icon: Construction,
    title: 'Lapor Jalan Rusak',
    description: 'Laporkan kondisi jalan berlubang, longsor, atau kerusakan infrastruktur',
    href: '/report-road',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
];

const disasterTypes = [
  { icon: Droplets, label: 'Banjir', count: 12, color: 'text-emergency-flood' },
  { icon: TreePine, label: 'Longsor', count: 5, color: 'text-emergency-warning' },
  { icon: Flame, label: 'Kebakaran', count: 8, color: 'text-emergency-fire' },
  { icon: AlertTriangle, label: 'Pohon Tumbang', count: 15, color: 'text-orange-500' },
];

export default function Home() {
  const { isAuthenticated, isGovernment } = useAuth();
  const recentReports = getDisasterReports().slice(0, 3);
  const criticalAreas = mockFirePredictions.filter(
    (p) => p.riskLevel === 'critical' || p.riskLevel === 'high'
  );
  const highRiskFloods = mockFloodRiskAreas.filter(
    (f) => f.riskLevel === 'high' || f.riskLevel === 'critical'
  );

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-linear-to-br from-primary/5 via-background to-emergency-flood/5">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-emergency-flood/10 rounded-full blur-3xl" />

        <div className="container relative py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <Badge
                variant="outline"
                className="px-4 py-2 text-sm font-medium border-primary/30 bg-primary/5"
              >
                <Activity className="w-4 h-4 mr-2 text-primary" />
                Sistem Monitoring Real-Time
              </Badge>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Portal Pelaporan{' '}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-emergency-flood">
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
                    <Link href="/report-disaster">
                      <Button size="lg" className="gap-2 shadow-lg shadow-primary/25">
                        <AlertTriangle className="w-5 h-5" />
                        Laporkan Bencana
                      </Button>
                    </Link>
                    <Link href="/my-reports">
                      <Button size="lg" variant="outline" className="gap-2">
                        <FileText className="w-5 h-5" />
                        Lihat Laporan Saya
                      </Button>
                    </Link>
                  </>
                ) : isGovernment ? (
                  <Link href="/admin">
                    <Button size="lg" className="gap-2 shadow-lg shadow-primary/25">
                      <Shield className="w-5 h-5" />
                      Buka Dashboard Admin
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/register">
                      <Button size="lg" className="gap-2 shadow-lg shadow-primary/25">
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
              <div className="flex flex-wrap gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-emergency-success/10">
                    <CheckCircle className="w-5 h-5 text-emergency-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{mockDashboardStats.resolvedReports}</p>
                    <p className="text-sm text-muted-foreground">Ditangani</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{mockDashboardStats.totalReports}</p>
                    <p className="text-sm text-muted-foreground">Total Laporan</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-emergency-warning/10">
                    <Clock className="w-5 h-5 text-emergency-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">&lt;24 jam</p>
                    <p className="text-sm text-muted-foreground">Respon Cepat</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative hidden lg:block">
              <div className="relative bg-linear-to-br from-card to-card/50 rounded-3xl p-8 border shadow-2xl">
                <div className="absolute -top-4 -right-4 bg-emergency-fire text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  Live Monitoring
                </div>

                {/* Mini Dashboard Preview */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-lg">Status Terkini</h3>
                    <Badge variant="outline">Real-time</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {disasterTypes.map((type, i) => (
                      <div key={i} className="p-4 rounded-xl bg-background/50 border">
                        <type.icon className={`w-6 h-6 ${type.color} mb-2`} />
                        <p className="text-2xl font-bold">{type.count}</p>
                        <p className="text-sm text-muted-foreground">{type.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 rounded-xl bg-emergency-fire/10 border border-emergency-fire/20">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emergency-fire/20">
                        <Flame className="w-5 h-5 text-emergency-fire" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">Peringatan Dini</p>
                        <p className="text-xs text-muted-foreground">
                          {criticalAreas.length} area risiko tinggi
                        </p>
                      </div>
                      <Zap className="w-5 h-5 text-emergency-fire animate-pulse" />
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
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
                <Card className="h-full group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-transparent hover:border-primary/20">
                  <CardContent className="p-6">
                    <div
                      className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                    >
                      <feature.icon className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
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

      {/* Alert Areas Section */}
      <section className="py-20">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Fire Risk Areas */}
            <Card className="overflow-hidden border-emergency-fire/20">
              <div className="bg-linear-to-r from-emergency-fire/10 to-emergency-fire/5 p-6 border-b border-emergency-fire/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-emergency-fire/20">
                      <Flame className="w-6 h-6 text-emergency-fire" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Area Rawan Kebakaran</h3>
                      <p className="text-sm text-muted-foreground">
                        {criticalAreas.length} area dalam pengawasan
                      </p>
                    </div>
                  </div>
                  <Link href="/fire-prediction">
                    <Button variant="outline" size="sm" className="gap-1">
                      Lihat Semua <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {criticalAreas.slice(0, 3).map((area, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div
                        className={`w-3 h-3 rounded-full ${area.riskLevel === 'critical' ? 'bg-emergency-fire animate-pulse' : 'bg-emergency-warning'}`}
                      />
                      <div className="flex-1">
                        <p className="font-medium">{area.area}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {area.district}
                        </p>
                      </div>
                      <Badge variant={area.riskLevel === 'critical' ? 'destructive' : 'secondary'}>
                        {area.riskLevel === 'critical' ? 'Kritis' : 'Tinggi'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Flood Risk Areas */}
            <Card className="overflow-hidden border-emergency-flood/20">
              <div className="bg-linear-to-r from-emergency-flood/10 to-emergency-flood/5 p-6 border-b border-emergency-flood/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-emergency-flood/20">
                      <Droplets className="w-6 h-6 text-emergency-flood" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Area Rawan Banjir</h3>
                      <p className="text-sm text-muted-foreground">
                        {highRiskFloods.length} area berisiko tinggi
                      </p>
                    </div>
                  </div>
                  <Link href="/flood-risk">
                    <Button variant="outline" size="sm" className="gap-1">
                      Lihat Semua <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {highRiskFloods.slice(0, 3).map((area, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div
                        className={`w-3 h-3 rounded-full ${area.riskLevel === 'critical' ? 'bg-emergency-flood animate-pulse' : 'bg-emergency-warning'}`}
                      />
                      <div className="flex-1">
                        <p className="font-medium">{area.area}</p>
                        <p className="text-sm text-muted-foreground">
                          Curah hujan: {area.factors.rainfall}mm • Ketinggian:{' '}
                          {area.factors.elevation}m
                        </p>
                      </div>
                      <Badge variant={area.riskLevel === 'critical' ? 'destructive' : 'secondary'}>
                        {area.riskLevel === 'critical' ? 'Kritis' : 'Tinggi'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Recent Reports Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Laporan Terbaru</h2>
              <p className="text-muted-foreground">Laporan bencana terkini dari masyarakat</p>
            </div>
            {isAuthenticated && (
              <Link href="/my-reports">
                <Button variant="outline" className="gap-2">
                  Lihat Semua <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {recentReports.map((report) => (
              <Card key={report.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {report.images?.[0] && (
                  <div className="h-48 bg-muted relative overflow-hidden">
                    <img
                      src={report.images[0]}
                      alt={report.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3">
                      <Badge
                        variant={
                          report.status === 'resolved'
                            ? 'default'
                            : report.status === 'in_progress'
                              ? 'secondary'
                              : 'outline'
                        }
                      >
                        {report.status === 'resolved'
                          ? 'Selesai'
                          : report.status === 'in_progress'
                            ? 'Ditangani'
                            : 'Menunggu'}
                      </Badge>
                    </div>
                  </div>
                )}
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="text-xs">
                      {report.type === 'flood'
                        ? 'Banjir'
                        : report.type === 'fire'
                          ? 'Kebakaran'
                          : report.type === 'landslide'
                            ? 'Longsor'
                            : 'Lainnya'}
                    </Badge>
                  </div>
                  <h3 className="font-semibold mb-2 line-clamp-1">{report.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {report.description}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span className="line-clamp-1">{report.location.address}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Contact */}
      <section className="py-16 bg-linear-to-r from-emergency-fire to-emergency-fire/80">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-white">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-full bg-white/20">
                <Phone className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Butuh Bantuan Darurat?</h3>
                <p className="text-white/80">Hubungi nomor darurat 24 jam</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <a href="tel:112">
                <Button size="lg" variant="secondary" className="gap-2 shadow-lg">
                  <Phone className="w-5 h-5" />
                  112 - Nomor Darurat
                </Button>
              </a>
              <a href="tel:119">
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 bg-transparent border-white text-white hover:bg-white/20"
                >
                  119 - Ambulans
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
