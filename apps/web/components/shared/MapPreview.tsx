'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';

// Dynamically import Leaflet components
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), {
  ssr: false,
});
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), {
  ssr: false,
});
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), {
  ssr: false,
});
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), {
  ssr: false,
});

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

interface MapPreviewProps {
  reports: MapReport[];
  onFilterChange?: (type: string) => void;
  height?: string;
  className?: string;
}

function MapPreviewComponent({ reports, onFilterChange, height = '400px', className = '' }: MapPreviewProps) {
  const [mounted, setMounted] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('leaflet').then((L) => {
        delete (L.default.Icon.Default.prototype as any)._getIconUrl;
        L.default.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });
      });
      setMounted(true);
    }
  }, []);

  const filteredReports = useMemo(() => {
    if (filterType === 'all') return reports;
    if (filterType === 'disaster') return reports.filter((r) => r.reportType === 'disaster');
    if (filterType === 'road') return reports.filter((r) => r.reportType === 'road');
    return reports.filter((r) => r.reportType === 'disaster' && r.type === filterType);
  }, [reports, filterType]);

  const center: [number, number] = useMemo(() => {
    if (filteredReports.length === 0) return [-6.2088, 106.8226]; // Default Jakarta
    const avgLat = filteredReports.reduce((sum, r) => sum + r.lat, 0) / filteredReports.length;
    const avgLng = filteredReports.reduce((sum, r) => sum + r.lng, 0) / filteredReports.length;
    return [avgLat, avgLng];
  }, [filteredReports]);

  const handleFilterChange = (value: string) => {
    setFilterType(value);
    onFilterChange?.(value);
  };

  if (!mounted) {
    return (
      <Card className={className}>
        <CardContent className="p-0">
          <div className="flex items-center justify-center" style={{ height }}>
            <p className="text-muted-foreground">Memuat peta...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <MapPin className="h-4 w-4 md:h-5 md:w-5" />
            Peta Lokasi Laporan
          </CardTitle>
          <Select value={filterType} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter Jenis" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Laporan</SelectItem>
              <SelectItem value="disaster">Bencana</SelectItem>
              <SelectItem value="road">Jalan Rusak</SelectItem>
              <SelectItem value="flood">Banjir</SelectItem>
              <SelectItem value="fire">Kebakaran</SelectItem>
              <SelectItem value="landslide">Longsor</SelectItem>
              <SelectItem value="fallen_tree">Pohon Tumbang</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative w-full" style={{ height }}>
          <MapContainer
            center={center}
            zoom={filteredReports.length > 0 ? 12 : 10}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filteredReports.map((report) => (
              <Marker key={report.id} position={[report.lat, report.lng]}>
                <Popup>
                  <div className="p-2">
                    <h4 className="font-semibold text-sm mb-1">{report.title}</h4>
                    <p className="text-xs text-muted-foreground mb-1">{report.address}</p>
                    <p className="text-xs text-muted-foreground">
                      {report.reportType === 'disaster' ? 'Bencana' : 'Jalan Rusak'} •{' '}
                      {new Date(report.createdAt).toLocaleDateString('id-ID')}
                    </p>
                    <a
                      href={
                        report.reportType === 'disaster'
                          ? `/public-reports/disaster/${report.id}`
                          : `/public-reports/road/${report.id}`
                      }
                      className="text-xs text-primary hover:underline mt-1 inline-block"
                    >
                      Lihat Detail →
                    </a>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
          <div className="absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-auto bg-card/95 backdrop-blur-sm rounded-lg p-2 border shadow-lg z-50">
            <p className="text-xs text-muted-foreground">
              {filteredReports.length} laporan ditampilkan
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export const MapPreview = dynamic(() => Promise.resolve(MapPreviewComponent), {
  ssr: false,
});

