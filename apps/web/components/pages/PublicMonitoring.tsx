import { MainLayout } from '@/components/layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  mockDashboardStats,
  mockFirePredictions,
  mockFloodRiskAreas,
  mockSensors,
  mockWeatherData,
} from '@/data/mockData';
import {
  Activity,
  AlertTriangle,
  Cloud,
  CloudLightning,
  CloudRain,
  Construction,
  Droplets,
  Eye,
  FileText,
  Flame,
  Gauge,
  MapPin,
  Sun,
  Thermometer,
  Wind,
} from 'lucide-react';
import Link from 'next/link';

const weatherIcons = {
  sunny: Sun,
  cloudy: Cloud,
  rainy: CloudRain,
  stormy: CloudLightning,
};

const weatherLabels = {
  sunny: 'Cerah',
  cloudy: 'Berawan',
  rainy: 'Hujan',
  stormy: 'Badai',
};

export default function PublicMonitoring() {
  const WeatherIcon = weatherIcons[mockWeatherData.condition];

  return (
    <MainLayout>
      <div className="container py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Monitoring <span className="text-primary">Publik</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Pantau kondisi cuaca, sensor IoT, dan area berisiko secara real-time. Informasi ini
            diperbarui secara berkala untuk keselamatan warga.
          </p>
        </div>

        {/* Current Weather Card */}
        <Card className="bg-linear-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <WeatherIcon className="h-6 w-6" />
              Cuaca Saat Ini - Jakarta
            </CardTitle>
            <CardDescription>Data diperbarui: {new Date().toLocaleString('id-ID')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-4 rounded-lg bg-background/50">
                <Thermometer className="h-8 w-8 mx-auto mb-2 text-emergency-fire" />
                <p className="text-3xl font-bold">{mockWeatherData.temperature}°C</p>
                <p className="text-sm text-muted-foreground">Suhu</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-background/50">
                <Droplets className="h-8 w-8 mx-auto mb-2 text-emergency-flood" />
                <p className="text-3xl font-bold">{mockWeatherData.humidity}%</p>
                <p className="text-sm text-muted-foreground">Kelembaban</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-background/50">
                <Wind className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-3xl font-bold">{mockWeatherData.windSpeed} km/h</p>
                <p className="text-sm text-muted-foreground">Kecepatan Angin</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-background/50">
                <CloudRain className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-3xl font-bold">{mockWeatherData.rainfall} mm</p>
                <p className="text-sm text-muted-foreground">Curah Hujan</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weather Forecast */}
        <Card>
          <CardHeader>
            <CardTitle>Prakiraan Cuaca 5 Hari</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {mockWeatherData.forecast.map((day, index) => {
                const DayIcon = weatherIcons[day.condition];
                const date = new Date(day.date);
                return (
                  <div
                    key={index}
                    className="text-center p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <p className="text-sm font-medium mb-2">
                      {date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' })}
                    </p>
                    <DayIcon className="h-10 w-10 mx-auto mb-2 text-primary" />
                    <p className="text-sm text-muted-foreground">{weatherLabels[day.condition]}</p>
                    <p className="font-semibold mt-1">
                      {day.tempMin}° - {day.tempMax}°
                    </p>
                    <Badge variant="outline" className="mt-2">
                      <Droplets className="h-3 w-3 mr-1" />
                      {day.rainProbability}%
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Statistics Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Laporan</p>
                  <p className="text-3xl font-bold">{mockDashboardStats.totalReports}</p>
                </div>
                <FileText className="h-10 w-10 text-primary/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Sedang Ditangani</p>
                  <p className="text-3xl font-bold text-emergency-warning">
                    {mockDashboardStats.inProgressReports}
                  </p>
                </div>
                <Activity className="h-10 w-10 text-emergency-warning/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Selesai</p>
                  <p className="text-3xl font-bold text-emergency-safe">
                    {mockDashboardStats.resolvedReports}
                  </p>
                </div>
                <Eye className="h-10 w-10 text-emergency-safe/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Sensor Aktif</p>
                  <p className="text-3xl font-bold">{mockDashboardStats.activeSensors}</p>
                </div>
                <Gauge className="h-10 w-10 text-primary/20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Different Monitoring */}
        <Tabs defaultValue="sensors" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sensors" className="gap-2">
              <Gauge className="h-4 w-4" />
              <span className="hidden sm:inline">Sensor IoT</span>
              <span className="sm:hidden">Sensor</span>
            </TabsTrigger>
            <TabsTrigger value="fire" className="gap-2">
              <Flame className="h-4 w-4" />
              <span className="hidden sm:inline">Risiko Kebakaran</span>
              <span className="sm:hidden">Kebakaran</span>
            </TabsTrigger>
            <TabsTrigger value="flood" className="gap-2">
              <Droplets className="h-4 w-4" />
              <span className="hidden sm:inline">Risiko Banjir</span>
              <span className="sm:hidden">Banjir</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sensors" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {mockSensors.map((sensor) => (
                <Card key={sensor.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{sensor.name}</CardTitle>
                      <Badge
                        variant={
                          sensor.status === 'online'
                            ? 'default'
                            : sensor.status === 'warning'
                              ? 'destructive'
                              : 'secondary'
                        }
                      >
                        {sensor.status === 'online'
                          ? 'Aktif'
                          : sensor.status === 'warning'
                            ? 'Peringatan'
                            : 'Offline'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <p className="text-3xl font-bold">
                          {sensor.value}
                          {sensor.unit}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {sensor.location.district}
                        </p>
                      </div>
                      {sensor.type === 'temperature' && (
                        <Thermometer className="h-10 w-10 text-emergency-fire/50" />
                      )}
                      {sensor.type === 'humidity' && (
                        <Droplets className="h-10 w-10 text-emergency-flood/50" />
                      )}
                      {sensor.type === 'smoke' && (
                        <Cloud className="h-10 w-10 text-muted-foreground/50" />
                      )}
                      {sensor.type === 'water_level' && (
                        <Gauge className="h-10 w-10 text-primary/50" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="fire" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {mockFirePredictions.map((prediction) => (
                <Card key={prediction.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{prediction.area}</CardTitle>
                      <Badge
                        variant={
                          prediction.riskLevel === 'critical'
                            ? 'destructive'
                            : prediction.riskLevel === 'high'
                              ? 'destructive'
                              : 'secondary'
                        }
                        className={
                          prediction.riskLevel === 'high'
                            ? 'bg-emergency-warning text-emergency-warning-foreground'
                            : ''
                        }
                      >
                        {prediction.riskLevel === 'critical'
                          ? 'Kritis'
                          : prediction.riskLevel === 'high'
                            ? 'Tinggi'
                            : prediction.riskLevel === 'medium'
                              ? 'Sedang'
                              : 'Rendah'}
                      </Badge>
                    </div>
                    <CardDescription>{prediction.district}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold">
                          {Math.round(prediction.probability * 100)}%
                        </p>
                        <p className="text-sm text-muted-foreground">Probabilitas Kebakaran</p>
                      </div>
                      <Flame
                        className={`h-10 w-10 ${
                          prediction.riskLevel === 'critical'
                            ? 'text-destructive'
                            : prediction.riskLevel === 'high'
                              ? 'text-emergency-warning'
                              : 'text-muted-foreground/50'
                        }`}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="flood" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {mockFloodRiskAreas.map((area) => (
                <Card key={area.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{area.area}</CardTitle>
                      <Badge
                        variant={
                          area.riskLevel === 'critical'
                            ? 'destructive'
                            : area.riskLevel === 'high'
                              ? 'destructive'
                              : 'secondary'
                        }
                        className={
                          area.riskLevel === 'high'
                            ? 'bg-emergency-warning text-emergency-warning-foreground'
                            : ''
                        }
                      >
                        {area.riskLevel === 'critical'
                          ? 'Kritis'
                          : area.riskLevel === 'high'
                            ? 'Tinggi'
                            : area.riskLevel === 'medium'
                              ? 'Sedang'
                              : 'Rendah'}
                      </Badge>
                    </div>
                    <CardDescription>{area.district}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold">{Math.round(area.probability * 100)}%</p>
                        <p className="text-sm text-muted-foreground">Probabilitas Banjir</p>
                      </div>
                      <Droplets
                        className={`h-10 w-10 ${
                          area.riskLevel === 'critical'
                            ? 'text-destructive'
                            : area.riskLevel === 'high'
                              ? 'text-emergency-warning'
                              : 'text-muted-foreground/50'
                        }`}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Links to Report */}
        <Card className="bg-linear-to-r from-primary/5 to-accent/5">
          <CardHeader>
            <CardTitle>Menu Pelaporan</CardTitle>
            <CardDescription>
              Laporkan kondisi darurat atau infrastruktur yang rusak di sekitar Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/report-disaster">
                <Button variant="outline" className="w-full h-auto py-6 flex-col gap-2">
                  <AlertTriangle className="h-8 w-8 text-destructive" />
                  <span className="font-semibold">Laporkan Bencana</span>
                  <span className="text-xs text-muted-foreground">Banjir, Kebakaran, Longsor</span>
                </Button>
              </Link>
              <Link href="/report-road">
                <Button variant="outline" className="w-full h-auto py-6 flex-col gap-2">
                  <Construction className="h-8 w-8 text-emergency-warning" />
                  <span className="font-semibold">Lapor Jalan Rusak</span>
                  <span className="text-xs text-muted-foreground">Berlubang, Retak, Longsor</span>
                </Button>
              </Link>
              <Link href="/public-reports">
                <Button variant="outline" className="w-full h-auto py-6 flex-col gap-2">
                  <Eye className="h-8 w-8 text-primary" />
                  <span className="font-semibold">Lihat Semua Laporan</span>
                  <span className="text-xs text-muted-foreground">Pantau Status Laporan</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
