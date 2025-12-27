/** @type {import('next').NextConfig} */
const nextConfig = {
  // PWA Configuration
  // Note: Service worker is registered manually via /public/sw.js
  // Next.js will automatically serve files from /public directory

  // Optimize images and static assets
  images: {
    formats: ['image/avif', 'image/webp'],
  },

  // Webpack configuration for Leaflet
  /* webpack: (config, { isServer }) => {
    if (!isServer) {
      // Fix for Leaflet marker icons in client-side builds
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  }, */

  // Headers for PWA
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
      {
        source: '/manifest.webmanifest',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
