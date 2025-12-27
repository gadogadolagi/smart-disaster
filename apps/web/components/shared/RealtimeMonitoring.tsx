'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { API_ENDPOINTS } from '@/lib/api/config';
import { Activity, Cloud, Flame, RefreshCw, Wind } from 'lucide-react';
import { useEffect, useState } from 'react';

interface FirePrediction {
  status: string;
  location: string;
  sensor_values?: {
    air_temperature: number;
    relative_humidity: number;
    rain_fall: number;
    wind_speed: number;
    soil_surface_moisture: number;
    time?: string;
  };
  prediction: string;
  confidence: number;
  total_severity: number;
  severity_percentage: Record<string, number>;
  recommendation: string;
}

interface AirQualityPrediction {
  status: string;
  location: string;
  prediction: string;
  confidence: number;
  total_severity: number;
  severity_percentage: Record<string, number>;
  recommendation: string;
}

export function RealtimeMonitoring() {
  const [fireData, setFireData] = useState<FirePrediction | null>(null);
  const [airQualityData, setAirQualityData] = useState<AirQualityPrediction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchRealtimeData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const fireUrl = API_ENDPOINTS.ai.fireRealtime('riau');
      const airQualityUrl = API_ENDPOINTS.ai.airQualityRealtime('riau');

      console.log('Fetching from:', { fireUrl, airQualityUrl });

      const [fireResponse, airQualityResponse] = await Promise.allSettled([
        fetch(fireUrl, {
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json',
          },
        }).catch((err) => {
          console.error('Fire fetch error:', err);
          throw err;
        }),
        fetch(airQualityUrl, {
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json',
          },
        }).catch((err) => {
          console.error('Air quality fetch error:', err);
          throw err;
        }),
      ]);

      const errors: string[] = [];

      // Handle fire prediction
      if (fireResponse.status === 'fulfilled') {
        const response = fireResponse.value;
        if (response.ok) {
          try {
            const fireData = await response.json();
            setFireData(fireData);
            console.log('Fire data loaded:', fireData);
          } catch (jsonErr: any) {
            console.error('Fire JSON parse error:', jsonErr);
            errors.push('Gagal memparse data kebakaran');
          }
        } else {
          const errorText = await response.text().catch(() => 'Unknown error');
          console.error('Fire API error:', response.status, errorText);
          errors.push(`Kebakaran: ${response.status} - ${errorText.substring(0, 100)}`);
        }
      } else {
        const reason = fireResponse.reason;
        console.error('Fire prediction failed:', reason);
        if (reason?.message?.includes('CORS') || reason?.message?.includes('Failed to fetch')) {
          errors.push(
            'CORS Error: Service AI tidak dapat diakses. Pastikan service berjalan dan CORS dikonfigurasi.'
          );
        } else {
          errors.push(`Kebakaran: ${reason?.message || 'Unknown error'}`);
        }
      }

      // Handle air quality prediction
      if (airQualityResponse.status === 'fulfilled') {
        const response = airQualityResponse.value;
        if (response.ok) {
          try {
            const airQualityData = await response.json();
            setAirQualityData(airQualityData);
            console.log('Air quality data loaded:', airQualityData);
          } catch (jsonErr: any) {
            console.error('Air quality JSON parse error:', jsonErr);
            errors.push('Gagal memparse data kualitas udara');
          }
        } else {
          const errorText = await response.text().catch(() => 'Unknown error');
          console.error('Air quality API error:', response.status, errorText);
          errors.push(`Kualitas Udara: ${response.status} - ${errorText.substring(0, 100)}`);
        }
      } else {
        const reason = airQualityResponse.reason;
        console.error('Air quality prediction failed:', reason);
        if (reason?.message?.includes('CORS') || reason?.message?.includes('Failed to fetch')) {
          errors.push(
            'CORS Error: Service AI tidak dapat diakses. Pastikan service berjalan dan CORS dikonfigurasi.'
          );
        } else {
          errors.push(`Kualitas Udara: ${reason?.message || 'Unknown error'}`);
        }
      }

      if (errors.length > 0) {
        setError(errors.join(' | '));
      }

      setLastUpdate(new Date());
    } catch (err: any) {
      console.error('Error fetching realtime data:', err);
      const errorMessage = err?.message || 'Gagal memuat data real-time';
      if (errorMessage.includes('CORS') || errorMessage.includes('Failed to fetch')) {
        setError(
          'CORS Error: Service AI tidak dapat diakses dari browser. Pastikan:\n1. Service AI berjalan di http://localhost:8000\n2. CORS middleware sudah dikonfigurasi di FastAPI\n3. Atau gunakan proxy melalui Next.js API route'
        );
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRealtimeData();
    // Auto refresh every 30 seconds
    const interval = setInterval(fetchRealtimeData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getFireRiskColor = (prediction: string) => {
    const pred = prediction.toLowerCase();
    if (pred.includes('very high')) return 'text-red-600 bg-red-50 border-red-200';
    if (pred.includes('high')) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (pred.includes('moderate')) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getAirQualityColor = (prediction: string) => {
    const pred = prediction.toLowerCase();
    if (pred.includes('sangat tidak sehat')) return 'text-red-600 bg-red-50 border-red-200';
    if (pred.includes('tidak sehat')) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (pred.includes('sedang')) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const formatTime = (date: Date | null) => {
    if (!date) return '-';
    return new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

  return (
    <section className="py-20 bg-background">
      <div className="container">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            <Activity className="w-4 h-4 mr-2" />
            Monitoring Real-Time
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Status Monitoring Provinsi Riau</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Data prediksi real-time dari sensor IoT untuk kebakaran dan kualitas udara
          </p>
          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
            <button
              onClick={fetchRealtimeData}
              disabled={isLoading}
              className="p-1 rounded hover:bg-muted transition-colors disabled:opacity-50"
              title="Refresh data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <span>Terakhir update: {formatTime(lastUpdate)}</span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-center">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Fire Prediction Card */}
          <Card className="border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-emergency-fire/10">
                    <Flame className="w-5 h-5 text-emergency-fire" />
                  </div>
                  Prediksi Kebakaran
                </CardTitle>
                {fireData && (
                  <Badge className={getFireRiskColor(fireData.prediction)}>
                    {fireData.prediction}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isLoading && !fireData ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : fireData ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground mb-1">Confidence</p>
                      <p className="text-2xl font-bold">{fireData.confidence}%</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground mb-1">Severity</p>
                      <p className="text-2xl font-bold">{fireData.total_severity}%</p>
                    </div>
                  </div>

                  {fireData.sensor_values && (
                    <div className="space-y-2 pt-2 border-t">
                      <p className="text-sm font-medium mb-2">Data Sensor:</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Wind className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Suhu:</span>
                          <span className="font-medium">
                            {fireData.sensor_values.air_temperature?.toFixed(1)}°C
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Cloud className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Kelembapan:</span>
                          <span className="font-medium">
                            {fireData.sensor_values.relative_humidity?.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Curah Hujan:</span>
                          <span className="font-medium">
                            {fireData.sensor_values.rain_fall?.toFixed(1)} mm/jam
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Kecepatan Angin:</span>
                          <span className="font-medium">
                            {fireData.sensor_values.wind_speed?.toFixed(1)} m/s
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t">
                    <p className="text-sm font-medium mb-1">Rekomendasi:</p>
                    <p className="text-sm text-muted-foreground">{fireData.recommendation}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">Data tidak tersedia</div>
              )}
            </CardContent>
          </Card>

          {/* Air Quality Prediction Card */}
          <Card className="border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Cloud className="w-5 h-5 text-blue-500" />
                  </div>
                  Kualitas Udara
                </CardTitle>
                {airQualityData && (
                  <Badge className={getAirQualityColor(airQualityData.prediction)}>
                    {airQualityData.prediction}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isLoading && !airQualityData ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : airQualityData ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground mb-1">Confidence</p>
                      <p className="text-2xl font-bold">{airQualityData.confidence}%</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground mb-1">Severity</p>
                      <p className="text-2xl font-bold">{airQualityData.total_severity}%</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <p className="text-sm font-medium mb-2">Distribusi Risiko:</p>
                    <div className="space-y-2">
                      {Object.entries(airQualityData.severity_percentage).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground capitalize">{key}:</span>
                          <div className="flex items-center gap-2 flex-1 mx-2">
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full transition-all"
                                style={{ width: `${value}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium w-12 text-right">{value}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <p className="text-sm font-medium mb-1">Rekomendasi:</p>
                    <p className="text-sm text-muted-foreground">{airQualityData.recommendation}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">Data tidak tersedia</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
