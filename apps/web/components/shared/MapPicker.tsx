'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Navigation } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';

// Dynamically import all Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <p className="text-muted-foreground">Memuat peta...</p>
    </div>
  ),
});

const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), {
  ssr: false,
});

const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), {
  ssr: false,
});

// LocationMarker component - must be inside MapContainer
// Create a wrapper that dynamically imports and uses the hook
const LocationMarker = dynamic(
  () =>
    import('react-leaflet').then((mod) => {
      const { useMapEvents, Marker: MarkerComp } = mod;

      return function LocationMarkerComponent({
        lat,
        lng,
        onLocationChange,
      }: {
        lat: number;
        lng: number;
        onLocationChange: (lat: number, lng: number) => void;
      }) {
        const [position, setPosition] = useState<[number, number]>([lat, lng]);
        const map = useMapEvents({
          click(e: { latlng: { lat: number; lng: number } }) {
            const { lat, lng } = e.latlng;
            setPosition([lat, lng]);
            onLocationChange(lat, lng);
          },
        });

        useEffect(() => {
          if (lat && lng && map) {
            setPosition([lat, lng]);
            map.setView([lat, lng], map.getZoom());
          }
        }, [lat, lng, map]);

        if (position[0] === 0 && position[1] === 0) {
          return null;
        }

        return <MarkerComp position={position} />;
      };
    }),
  {
    ssr: false,
  }
);

interface MapPickerProps {
  lat: number;
  lng: number;
  onLocationChange: (lat: number, lng: number) => void;
  height?: string;
  className?: string;
}

export function MapPicker({
  lat,
  lng,
  onLocationChange,
  height = '400px',
  className = '',
}: MapPickerProps) {
  const [currentPosition, setCurrentPosition] = useState<[number, number]>([
    lat || -6.2088,
    lng || 106.8226,
  ]);
  const [isLocating, setIsLocating] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Setup Leaflet icon only on client side
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let mounted = true;

    // Setup default icon
    import('leaflet')
      .then((L) => {
        if (!mounted) return;

        // Fix for default marker icon in Next.js
        delete (L.default.Icon.Default.prototype as any)._getIconUrl;
        L.default.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });

        setMounted(true);
      })
      .catch((err) => {
        console.error('Failed to load Leaflet:', err);
        setError('Gagal memuat peta. Silakan refresh halaman.');
        setMounted(true); // Still set mounted to show error message
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (lat && lng) {
      setCurrentPosition([lat, lng]);
    }
  }, [lat, lng]);

  const handleUseCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation tidak didukung oleh browser Anda');
      return;
    }

    setIsLocating(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentPosition([latitude, longitude]);
        onLocationChange(latitude, longitude);
        setIsLocating(false);
      },
      (err) => {
        console.error('Error getting location:', err);
        setError('Gagal mendapatkan lokasi. Pastikan izin lokasi sudah diberikan.');
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, [onLocationChange]);

  if (!mounted) {
    return (
      <Card className={className}>
        <CardContent className="p-0">
          <div className="relative w-full flex items-center justify-center" style={{ height }}>
            <p className="text-muted-foreground">Memuat peta...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && mounted) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="text-center text-destructive">
            <p className="font-medium">{error}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="mt-2"
            >
              Refresh Halaman
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-0">
        <div className="relative w-full" style={{ height }}>
          {error && (
            <div className="absolute top-4 left-4 right-4 z-50 bg-destructive/90 text-destructive-foreground p-2 rounded text-xs">
              {error}
            </div>
          )}
          <MapContainer
            center={currentPosition}
            zoom={13}
            style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
            className="z-0"
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker
              lat={currentPosition[0]}
              lng={currentPosition[1]}
              onLocationChange={onLocationChange}
            />
          </MapContainer>
          <div className="absolute top-4 right-4 z-50">
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={handleUseCurrentLocation}
              disabled={isLocating}
              className="shadow-lg"
            >
              {isLocating ? (
                <>
                  <Navigation className="h-4 w-4 mr-2 animate-spin" />
                  Mendapatkan...
                </>
              ) : (
                <>
                  <Navigation className="h-4 w-4 mr-2" />
                  Gunakan Lokasi Saya
                </>
              )}
            </Button>
          </div>
          <div className="absolute bottom-4 left-4 right-4 bg-card/95 backdrop-blur-sm rounded-lg p-3 border shadow-lg z-50">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium mb-1">Klik pada peta untuk memilih lokasi</p>
                <p className="text-xs text-muted-foreground">
                  Koordinat: {currentPosition[0].toFixed(6)}, {currentPosition[1].toFixed(6)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
