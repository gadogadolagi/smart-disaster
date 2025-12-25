// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const API_ENDPOINTS = {
  reports: {
    disaster: {
      list: `${API_BASE_URL}/api/reports/disaster`,
      create: `${API_BASE_URL}/api/reports/disaster`,
      get: (id: string) => `${API_BASE_URL}/api/reports/disaster/${id}`,
      update: (id: string) => `${API_BASE_URL}/api/reports/disaster/${id}`,
      delete: (id: string) => `${API_BASE_URL}/api/reports/disaster/${id}`,
    },
    road: {
      list: `${API_BASE_URL}/api/reports/road`,
      create: `${API_BASE_URL}/api/reports/road`,
      get: (id: string) => `${API_BASE_URL}/api/reports/road/${id}`,
      update: (id: string) => `${API_BASE_URL}/api/reports/road/${id}`,
      delete: (id: string) => `${API_BASE_URL}/api/reports/road/${id}`,
    },
  },
};

// Helper function to get full image URL
export const getImageUrl = (imagePath: string): string => {
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  return `${API_BASE_URL}${imagePath}`;
};
