'use client';

import { Card, CardContent } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import { useMemo } from 'react';

interface MapEmbedProps {
  lat: number;
  lng: number;
  address?: string;
  title?: string;
  height?: string;
  className?: string;
}

/**
 * Map Embed Component using OpenStreetMap
 * Optimized for production builds with memoized URL
 */
export function MapEmbed({
  lat,
  lng,
  address,
  title,
  height = '400px',
  className = '',
}: MapEmbedProps) {
  // Memoize OSM URL to prevent unnecessary re-renders
  const osmUrl = useMemo(
    () =>
      `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}&layer=mapnik&marker=${lat},${lng}`,
    [lat, lng]
  );

  const googleMapsUrl = useMemo(() => `https://www.google.com/maps?q=${lat},${lng}`, [lat, lng]);

  return (
    <Card className={className}>
      <CardContent className="p-0">
        <div className="relative w-full" style={{ height }}>
          <iframe
            src={osmUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="rounded-lg"
            title={title || `Map at ${lat}, ${lng}`}
          />
          <div className="absolute bottom-4 left-4 right-4 bg-card/95 backdrop-blur-sm rounded-lg p-3 border shadow-lg">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                {title && <p className="font-semibold text-sm mb-1">{title}</p>}
                {address && <p className="text-xs text-muted-foreground">{address}</p>}
                <p className="text-xs text-muted-foreground mt-1">
                  Koordinat: {lat.toFixed(6)}, {lng.toFixed(6)}
                </p>
              </div>
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline shrink-0"
              >
                Buka di Google Maps
              </a>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
