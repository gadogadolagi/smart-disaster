'use client';

import { Alert } from '@/components/ui/alert';
import { Wifi, WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showOffline, setShowOffline] = useState(false);

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine);
    setShowOffline(!navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      // Hide offline indicator after a short delay when coming back online
      setTimeout(() => {
        setShowOffline(false);
      }, 2000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showOffline) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      <Alert
        className={`border-2 ${
          isOnline
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-yellow-50 border-yellow-200 text-yellow-800'
        }`}
      >
        <div className="flex items-center gap-2">
          {isOnline ? (
            <>
              <Wifi className="h-4 w-4" />
              <span className="text-sm font-medium">Koneksi kembali tersedia</span>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4" />
              <div className="flex-1">
                <span className="text-sm font-medium">Mode Offline</span>
                <p className="text-xs mt-0.5">
                  Beberapa fitur mungkin tidak tersedia. Data akan disinkronkan saat koneksi
                  kembali.
                </p>
              </div>
            </>
          )}
        </div>
      </Alert>
    </div>
  );
}


