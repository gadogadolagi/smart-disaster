import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'UHTP Smart Disaster',
    short_name: 'Smart Disaster',
    description: 'Sistem cerdas untuk pelaporan dan monitoring bencana alam',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#3b82f6',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/uhtpsmartdisaster.jpeg',
        sizes: '192x192',
        type: 'image/jpeg',
        purpose: 'any',
      },
      {
        src: '/uhtpsmartdisaster.jpeg',
        sizes: '512x512',
        type: 'image/jpeg',
        purpose: 'any',
      },
    ],
    categories: ['utilities', 'productivity'],
    screenshots: [],
  };
}
