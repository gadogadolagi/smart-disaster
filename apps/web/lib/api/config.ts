// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
export const AI_SERVICE_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8000';

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
    myReports: `${API_BASE_URL}/api/reports/my-reports`,
    recent: `${API_BASE_URL}/api/reports/recent`,
    map: `${API_BASE_URL}/api/reports/map`,
  },
  assignments: {
    petugas: `${API_BASE_URL}/api/assignments/petugas`,
    assignDisaster: (id: string) => `${API_BASE_URL}/api/assignments/disaster/${id}`,
    assignRoad: (id: string) => `${API_BASE_URL}/api/assignments/road/${id}`,
    myReports: `${API_BASE_URL}/api/assignments/my-reports`,
  },
  users: {
    list: `${API_BASE_URL}/api/users`,
    get: (id: string) => `${API_BASE_URL}/api/users/${id}`,
    update: (id: string) => `${API_BASE_URL}/api/users/${id}`,
    delete: (id: string) => `${API_BASE_URL}/api/users/${id}`,
  },
  activities: {
    getReport: (id: string) => `${API_BASE_URL}/api/activities/report/${id}`,
    create: (id: string) => `${API_BASE_URL}/api/activities/report/${id}`,
    list: `${API_BASE_URL}/api/activities`,
    getByUser: (userId: string) => `${API_BASE_URL}/api/activities/user/${userId}`,
    recent: `${API_BASE_URL}/api/activities/recent`,
  },
  stats: {
    dashboard: `${API_BASE_URL}/api/stats/dashboard`,
    public: `${API_BASE_URL}/api/stats/public`,
    disaster: `${API_BASE_URL}/api/stats/disaster`,
  },
  ai: {
    // Use Next.js API route as proxy to avoid CORS issues
    fireRealtime: (location: string) => `/api/ai/realtime?location=${location}&type=fire`,
    airQualityRealtime: (location: string) =>
      `/api/ai/realtime?location=${location}&type=air_quality`,
    // Direct endpoints (will have CORS issues if not configured in FastAPI)
    fireRealtimeDirect: (location: string) => `${AI_SERVICE_URL}/predict/realtime/${location}`,
    airQualityRealtimeDirect: (location: string) =>
      `${AI_SERVICE_URL}/predict/air_quality/realtime/${location}`,
  },
};

// Helper function to get full image URL
export const getImageUrl = (imagePath: string): string => {
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  return `${API_BASE_URL}${imagePath}`;
};

// Helper function to get access token from localStorage
const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
};

// Helper function to refresh access token
const refreshAccessToken = async (): Promise<string | null> => {
  if (typeof window === 'undefined') return null;

  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await res.json();

    if (!res.ok || !data?.data) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      return null;
    }

    localStorage.setItem('access_token', data.data.accessToken);
    localStorage.setItem('refresh_token', data.data.refreshToken);
    return data.data.accessToken;
  } catch (e) {
    console.error('refreshAccessToken error:', e);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    return null;
  }
};

// Helper function to make authenticated API calls with automatic token refresh
export const apiCall = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const accessToken = getAccessToken();

  // Add authorization header if token exists
  const headers = new Headers(options.headers);
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  // Make the request
  let response = await fetch(url, {
    ...options,
    headers,
  });

  // If unauthorized, try to refresh token and retry once
  if (response.status === 401 && accessToken) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers.set('Authorization', `Bearer ${newToken}`);
      response = await fetch(url, {
        ...options,
        headers,
      });
    }
  }

  return response;
};
