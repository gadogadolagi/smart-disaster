import { RiskLevelBadge, StatsCard } from '@/components/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { mockFloodRiskAreas } from '@/data/mockData';
import { Activity, CloudRain, Droplets, Mountain } from 'lucide-react';

export default function FloodRisk() {
  return (
    <>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Deteksi Risiko Banjir</h1>
          <p className="text-muted-foreground">
            Analisis area rawan banjir berdasarkan curah hujan, elevasi, dan riwayat banjir
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <StatsCard
            title="Area Dipantau"
            value={mockFloodRiskAreas.length}
            icon={Activity}
            variant="info"
          />
          <StatsCard
            title="Risiko Kritis"
            value={mockFloodRiskAreas.filter((a) => a.riskLevel === 'critical').length}
            icon={Droplets}
            variant="danger"
          />
          <StatsCard
            title="Risiko Tinggi"
            value={mockFloodRiskAreas.filter((a) => a.riskLevel === 'high').length}
            icon={CloudRain}
            variant="warning"
          />
          <StatsCard
            title="Risiko Rendah"
            value={mockFloodRiskAreas.filter((a) => a.riskLevel === 'low').length}
            icon={Mountain}
            variant="success"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {mockFloodRiskAreas.map((area) => (
            <Card
              key={area.id}
              className={
                area.riskLevel === 'critical'
                  ? 'border-danger'
                  : area.riskLevel === 'high'
                    ? 'border-warning'
                    : ''
              }
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{area.area}</CardTitle>
                  <RiskLevelBadge level={area.riskLevel} />
                </div>
                <p className="text-sm text-muted-foreground">{area.district}</p>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Probabilitas Banjir</span>
                    <span className="font-semibold">{Math.round(area.probability * 100)}%</span>
                  </div>
                  <Progress
                    value={area.probability * 100}
                    className={
                      area.riskLevel === 'critical'
                        ? '[&>div]:bg-danger'
                        : area.riskLevel === 'high'
                          ? '[&>div]:bg-warning'
                          : ''
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <CloudRain className="h-4 w-4 inline mr-1" />
                    Curah Hujan: {area.factors.rainfall} mm
                  </div>
                  <div>
                    <Mountain className="h-4 w-4 inline mr-1" />
                    Elevasi: {area.factors.elevation} m
                  </div>
                  <div>Drainase: {area.factors.drainageCapacity}%</div>
                  <div>Riwayat: {area.factors.historicalFloods}x</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
