'use client';

import { useEffect } from 'react';

export function PWARegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const isDevelopment =
        window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

      // In development, you can unregister service worker by adding ?sw=disable to URL
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('sw') === 'disable') {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          registrations.forEach((registration) => {
            registration.unregister();
            console.log('Service Worker unregistered');
          });
        });
        return;
      }

      // Register service worker
      navigator.serviceWorker
        .register('/sw.js', {
          scope: '/',
        })
        .then((registration) => {
          console.log('Service Worker registered:', registration);

          // Check for updates more frequently in development
          const updateInterval = isDevelopment ? 30 * 1000 : 60 * 60 * 1000; // 30s in dev, 1h in prod

          setInterval(() => {
            registration.update();
          }, updateInterval);

          // Handle service worker updates
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (isDevelopment) {
              console.log('Service Worker updated, reloading...');
            }
            window.location.reload();
          });

          // Listen for update messages from service worker
          navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'SW_UPDATED') {
              console.log('Service Worker updated, reloading...');
              window.location.reload();
            }
          });
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []);

  return null;
}
