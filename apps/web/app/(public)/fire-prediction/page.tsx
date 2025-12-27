import { RiskLevelBadge, StatsCard } from '@/components/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { mockFirePredictions, mockSensors } from '@/data/mockData';
import { Activity, Droplets, Flame, Thermometer, Wifi, WifiOff, Wind } from 'lucide-react';

export default function FirePrediction() {
  return (
    <>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Prediksi Kebakaran</h1>
          <p className="text-muted-foreground">
            Monitoring real-time dengan model hybrid machine learning terintegrasi IoT
          </p>
        </div>

        {/* Sensor Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <StatsCard title="Total Sensor" value={mockSensors.length} icon={Wifi} variant="info" />
          <StatsCard
            title="Sensor Online"
            value={mockSensors.filter((s) => s.status === 'online').length}
            icon={Activity}
            variant="success"
          />
          <StatsCard
            title="Sensor Warning"
            value={mockSensors.filter((s) => s.status === 'warning').length}
            icon={Flame}
            variant="warning"
          />
          <StatsCard
            title="Area Berisiko Tinggi"
            value={
              mockFirePredictions.filter(
                (f) => f.riskLevel === 'critical' || f.riskLevel === 'high'
              ).length
            }
            icon={Flame}
            variant="danger"
          />
        </div>

        {/* IoT Sensors Grid */}
        <h2 className="text-xl font-semibold mb-4">Status Sensor IoT</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {mockSensors.map((sensor) => (
            <Card key={sensor.id} className={sensor.status === 'warning' ? 'border-warning' : ''}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {sensor.status === 'online' ? (
                      <Wifi className="h-4 w-4 text-success" />
                    ) : sensor.status === 'warning' ? (
                      <Wifi className="h-4 w-4 text-warning" />
                    ) : (
                      <WifiOff className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-sm font-medium capitalize">{sensor.status}</span>
                  </div>
                  {sensor.type === 'temperature' && <Thermometer className="h-5 w-5 text-danger" />}
                  {sensor.type === 'humidity' && <Droplets className="h-5 w-5 text-info" />}
                  {sensor.type === 'smoke' && <Wind className="h-5 w-5 text-muted-foreground" />}
                  {sensor.type === 'water_level' && <Droplets className="h-5 w-5 text-info" />}
                </div>
                <h3 className="font-semibold text-sm mb-1">{sensor.name}</h3>
                <p className="text-2xl font-bold">
                  {sensor.value} {sensor.unit}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{sensor.location.district}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Fire Risk Predictions */}
        <h2 className="text-xl font-semibold mb-4">Prediksi Risiko Kebakaran</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {mockFirePredictions.map((pred) => (
            <Card
              key={pred.id}
              className={
                pred.riskLevel === 'critical'
                  ? 'border-danger'
                  : pred.riskLevel === 'high'
                    ? 'border-warning'
                    : ''
              }
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{pred.area}</CardTitle>
                  <RiskLevelBadge level={pred.riskLevel} />
                </div>
                <p className="text-sm text-muted-foreground">{pred.district}</p>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Probabilitas Kebakaran</span>
                    <span className="font-semibold">{Math.round(pred.probability * 100)}%</span>
                  </div>
                  <Progress
                    value={pred.probability * 100}
                    className={
                      pred.riskLevel === 'critical'
                        ? '[&>div]:bg-danger'
                        : pred.riskLevel === 'high'
                          ? '[&>div]:bg-warning'
                          : ''
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4" />
                    {pred.factors.temperature}°C
                  </div>
                  <div className="flex items-center gap-2">
                    <Droplets className="h-4 w-4" />
                    {pred.factors.humidity}%
                  </div>
                  <div className="flex items-center gap-2">
                    <Wind className="h-4 w-4" />
                    {pred.factors.windSpeed} km/h
                  </div>
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4" />
                    Indeks: {pred.factors.droughtIndex}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
