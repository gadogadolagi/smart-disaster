// 'use client';
// import {
//   DashboardStats,
//   DisasterReport,
//   FirePrediction,
//   FloodRiskArea,
//   IoTSensor,
//   ReportComment,
//   RoadReport,
//   WeatherData,
// } from '@/types';

// // Mock IoT Sensors
// export const mockSensors: IoTSensor[] = [
//   {
//     id: 'sensor-1',
//     name: 'Sensor Suhu Kelurahan Menteng',
//     location: { address: 'Jl. Menteng Raya', lat: -6.1954, lng: 106.8387, district: 'Menteng' },
//     type: 'temperature',
//     value: 34,
//     unit: '°C',
//     status: 'online',
//     lastUpdated: new Date().toISOString(),
//   },
//   {
//     id: 'sensor-2',
//     name: 'Sensor Kelembaban Cikini',
//     location: { address: 'Jl. Cikini Raya', lat: -6.1872, lng: 106.8431, district: 'Cikini' },
//     type: 'humidity',
//     value: 45,
//     unit: '%',
//     status: 'warning',
//     lastUpdated: new Date().toISOString(),
//   },
//   {
//     id: 'sensor-3',
//     name: 'Sensor Asap Kemayoran',
//     location: { address: 'Jl. Kemayoran', lat: -6.165, lng: 106.8522, district: 'Kemayoran' },
//     type: 'smoke',
//     value: 120,
//     unit: 'ppm',
//     status: 'online',
//     lastUpdated: new Date().toISOString(),
//   },
//   {
//     id: 'sensor-4',
//     name: 'Sensor Level Air Kampung Melayu',
//     location: {
//       address: 'Kampung Melayu',
//       lat: -6.2262,
//       lng: 106.8669,
//       district: 'Kampung Melayu',
//     },
//     type: 'water_level',
//     value: 2.3,
//     unit: 'm',
//     status: 'online',
//     lastUpdated: new Date().toISOString(),
//   },
//   {
//     id: 'sensor-5',
//     name: 'Sensor Suhu Pluit',
//     location: { address: 'Jl. Pluit', lat: -6.1222, lng: 106.795, district: 'Pluit' },
//     type: 'temperature',
//     value: 38,
//     unit: '°C',
//     status: 'warning',
//     lastUpdated: new Date().toISOString(),
//   },
// ];

// // Mock Fire Predictions
// export const mockFirePredictions: FirePrediction[] = [
//   {
//     id: 'fire-1',
//     area: 'Kawasan Industri Pulogadung',
//     district: 'Pulogadung',
//     riskLevel: 'high',
//     probability: 0.72,
//     factors: { temperature: 36, humidity: 35, windSpeed: 15, droughtIndex: 7 },
//     sensors: [mockSensors[0], mockSensors[4]],
//     lastUpdated: new Date().toISOString(),
//   },
//   {
//     id: 'fire-2',
//     area: 'Hutan Kota Srengseng',
//     district: 'Srengseng',
//     riskLevel: 'critical',
//     probability: 0.85,
//     factors: { temperature: 38, humidity: 28, windSpeed: 20, droughtIndex: 8.5 },
//     sensors: [mockSensors[1]],
//     lastUpdated: new Date().toISOString(),
//   },
//   {
//     id: 'fire-3',
//     area: 'Perumahan Kelapa Gading',
//     district: 'Kelapa Gading',
//     riskLevel: 'medium',
//     probability: 0.45,
//     factors: { temperature: 32, humidity: 55, windSpeed: 10, droughtIndex: 4 },
//     sensors: [mockSensors[2]],
//     lastUpdated: new Date().toISOString(),
//   },
//   {
//     id: 'fire-4',
//     area: 'Pasar Tanah Abang',
//     district: 'Tanah Abang',
//     riskLevel: 'low',
//     probability: 0.22,
//     factors: { temperature: 30, humidity: 65, windSpeed: 8, droughtIndex: 3 },
//     sensors: [],
//     lastUpdated: new Date().toISOString(),
//   },
// ];

// // Mock Flood Risk Areas
// export const mockFloodRiskAreas: FloodRiskArea[] = [
//   {
//     id: 'flood-1',
//     area: 'Kampung Melayu',
//     district: 'Jatinegara',
//     riskLevel: 'critical',
//     probability: 0.88,
//     factors: { rainfall: 150, elevation: 2, drainageCapacity: 30, historicalFloods: 12 },
//     lastUpdated: new Date().toISOString(),
//   },
//   {
//     id: 'flood-2',
//     area: 'Kelapa Gading Boulevard',
//     district: 'Kelapa Gading',
//     riskLevel: 'high',
//     probability: 0.68,
//     factors: { rainfall: 120, elevation: 5, drainageCapacity: 50, historicalFloods: 8 },
//     lastUpdated: new Date().toISOString(),
//   },
//   {
//     id: 'flood-3',
//     area: 'Pluit Timur',
//     district: 'Penjaringan',
//     riskLevel: 'high',
//     probability: 0.75,
//     factors: { rainfall: 140, elevation: 1, drainageCapacity: 40, historicalFloods: 15 },
//     lastUpdated: new Date().toISOString(),
//   },
//   {
//     id: 'flood-4',
//     area: 'Kemang Selatan',
//     district: 'Kemang',
//     riskLevel: 'medium',
//     probability: 0.42,
//     factors: { rainfall: 80, elevation: 15, drainageCapacity: 70, historicalFloods: 4 },
//     lastUpdated: new Date().toISOString(),
//   },
//   {
//     id: 'flood-5',
//     area: 'Menteng Dalam',
//     district: 'Menteng',
//     riskLevel: 'low',
//     probability: 0.18,
//     factors: { rainfall: 60, elevation: 25, drainageCapacity: 85, historicalFloods: 1 },
//     lastUpdated: new Date().toISOString(),
//   },
// ];

// // Mock Disaster Reports
// export const mockDisasterReports: DisasterReport[] = [
//   {
//     id: 'report-1',
//     type: 'flood',
//     title: 'Banjir di Jalan Raya Kampung Melayu',
//     description: 'Banjir setinggi 80cm di sepanjang jalan raya, kendaraan tidak bisa lewat.',
//     location: {
//       address: 'Jl. Raya Kampung Melayu No. 45',
//       lat: -6.2262,
//       lng: 106.8669,
//       district: 'Kampung Melayu',
//     },
//     images: ['.././gambar1.jpg'],
//     status: 'in_progress',
//     riskLevel: 'high',
//     reportedBy: { id: 'user-1', name: 'Budi Santoso', phone: '081234567890' },
//     createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
//     updatedAt: new Date().toISOString(),
//     handledBy: 'Tim BPBD Jakarta Timur',
//   },
//   {
//     id: 'report-2',
//     type: 'fallen_tree',
//     title: 'Pohon Tumbang di Menteng',
//     description: 'Pohon besar tumbang menghalangi jalan dan menimpa 2 mobil parkir.',
//     location: {
//       address: 'Jl. Menteng Raya No. 12',
//       lat: -6.1954,
//       lng: 106.8387,
//       district: 'Menteng',
//     },
//     images: ['.././gambar2.jpg'],
//     status: 'verified',
//     riskLevel: 'medium',
//     reportedBy: { id: 'user-2', name: 'Siti Aminah', phone: '087654321098' },
//     createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
//     updatedAt: new Date().toISOString(),
//   },
//   {
//     id: 'report-3',
//     type: 'fire',
//     title: 'Kebakaran Gudang di Pulogadung',
//     description: 'Kebakaran besar di gudang pabrik, api sudah menyebar ke 2 bangunan.',
//     location: {
//       address: 'Kawasan Industri Pulogadung Blok C-12',
//       lat: -6.18,
//       lng: 106.9,
//       district: 'Pulogadung',
//     },
//     images: ['.././gambar3.jpg'],
//     status: 'in_progress',
//     riskLevel: 'critical',
//     reportedBy: { id: 'user-3', name: 'Ahmad Hidayat' },
//     createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
//     updatedAt: new Date().toISOString(),
//     handledBy: 'Damkar Jakarta Timur',
//     notes: 'Tim damkar sudah di lokasi. Evakuasi warga sekitar dalam proses.',
//   },
//   {
//     id: 'report-4',
//     type: 'landslide',
//     title: 'Longsor Kecil di Ciganjur',
//     description: 'Tanah longsor di tebing belakang perumahan, belum ada korban jiwa.',
//     location: { address: 'Jl. Ciganjur No. 88', lat: -6.31, lng: 106.82, district: 'Ciganjur' },
//     images: ['/placeholder.svg'],
//     status: 'pending',
//     riskLevel: 'medium',
//     reportedBy: { id: 'user-4', name: 'Dewi Lestari', phone: '081122334455' },
//     createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
//     updatedAt: new Date().toISOString(),
//   },
//   {
//     id: 'report-5',
//     type: 'flood',
//     title: 'Genangan Air di Underpass Kemayoran',
//     description: 'Genangan air setinggi 50cm di underpass, lalu lintas macet total.',
//     location: { address: 'Underpass Kemayoran', lat: -6.165, lng: 106.8522, district: 'Kemayoran' },
//     images: ['/placeholder.svg'],
//     status: 'resolved',
//     riskLevel: 'low',
//     reportedBy: { id: 'user-5', name: 'Rudi Hartono' },
//     createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
//     updatedAt: new Date().toISOString(),
//     handledBy: 'Dinas PU DKI Jakarta',
//     notes: 'Pompa air sudah diaktifkan. Genangan sudah surut.',
//   },
// ];

// // Mock Road Reports
// export const mockRoadReports: RoadReport[] = [
//   {
//     id: 'road-1',
//     type: 'pothole',
//     title: 'Jalan Berlubang Besar di Sudirman',
//     description: 'Lubang berdiameter 1 meter, kedalaman 30cm. Sangat berbahaya.',
//     location: {
//       address: 'Jl. Jend. Sudirman Km 5',
//       lat: -6.2088,
//       lng: 106.8226,
//       district: 'Sudirman',
//     },
//     images: ['/placeholder.svg'],
//     status: 'verified',
//     dangerLevel: 'severe',
//     aiAnalysis: {
//       detectedIssues: ['Lubang besar', 'Aspal retak', 'Drainase rusak'],
//       confidence: 0.92,
//       recommendedAction: 'Perbaikan segera dalam 24 jam',
//     },
//     reportedBy: { id: 'user-1', name: 'Budi Santoso' },
//     createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
//     updatedAt: new Date().toISOString(),
//   },
//   {
//     id: 'road-2',
//     type: 'landslide',
//     title: 'Jalan Longsor di Puncak',
//     description: 'Setengah badan jalan longsor, hanya 1 jalur yang bisa dilalui.',
//     location: { address: 'Jl. Raya Puncak Km 78', lat: -6.68, lng: 106.99, district: 'Puncak' },
//     images: ['/placeholder.svg'],
//     status: 'in_progress',
//     dangerLevel: 'severe',
//     aiAnalysis: {
//       detectedIssues: ['Longsor tebing', 'Retakan tanah', 'Pohon tumbang'],
//       confidence: 0.88,
//       recommendedAction: 'Tutup jalur, perbaikan mayor diperlukan',
//     },
//     reportedBy: { id: 'user-6', name: 'Agus Pratama' },
//     createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
//     updatedAt: new Date().toISOString(),
//   },
//   {
//     id: 'road-3',
//     type: 'crack',
//     title: 'Retakan Jalan di TB Simatupang',
//     description: 'Retakan memanjang sepanjang 50 meter di jalur cepat.',
//     location: {
//       address: 'Jl. TB Simatupang No. 200',
//       lat: -6.29,
//       lng: 106.81,
//       district: 'TB Simatupang',
//     },
//     images: ['/placeholder.svg'],
//     status: 'pending',
//     dangerLevel: 'moderate',
//     aiAnalysis: {
//       detectedIssues: ['Retakan longitudinal', 'Penurunan permukaan'],
//       confidence: 0.85,
//       recommendedAction: 'Penambalan dalam 7 hari',
//     },
//     reportedBy: { id: 'user-7', name: 'Linda Wijaya' },
//     createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
//     updatedAt: new Date().toISOString(),
//   },
// ];

// // Dashboard Statistics
// export const mockDashboardStats: DashboardStats = {
//   totalReports: 156,
//   pendingReports: 23,
//   inProgressReports: 42,
//   resolvedReports: 91,
//   highRiskAreas: 8,
//   activeSensors: 24,
// };

// // Helper to get stored reports from localStorage or use mock data
// export function getDisasterReports(): DisasterReport[] {
//   const stored = localStorage.getItem('disaster_reports');
//   if (stored) {
//     return JSON.parse(stored);
//   }
//   return mockDisasterReports;
// }

// export function saveDisasterReport(report: DisasterReport): void {
//   const reports = getDisasterReports();
//   reports.unshift(report);
//   localStorage.setItem('disaster_reports', JSON.stringify(reports));
// }

// export function updateDisasterReport(id: string, updates: Partial<DisasterReport>): void {
//   const reports = getDisasterReports();
//   const index = reports.findIndex((r) => r.id === id);
//   if (index !== -1) {
//     reports[index] = { ...reports[index], ...updates, updatedAt: new Date().toISOString() };
//     localStorage.setItem('disaster_reports', JSON.stringify(reports));
//   }
// }

// export function getRoadReports(): RoadReport[] {
//   const stored = localStorage.getItem('road_reports');
//   if (stored) {
//     return JSON.parse(stored);
//   }
//   return mockRoadReports;
// }

// export function saveRoadReport(report: RoadReport): void {
//   const reports = getRoadReports();
//   reports.unshift(report);
//   localStorage.setItem('road_reports', JSON.stringify(reports));
// }

// export function updateRoadReport(id: string, updates: Partial<RoadReport>): void {
//   const reports = getRoadReports();
//   const index = reports.findIndex((r) => r.id === id);
//   if (index !== -1) {
//     reports[index] = { ...reports[index], ...updates, updatedAt: new Date().toISOString() };
//     localStorage.setItem('road_reports', JSON.stringify(reports));
//   }
// }

// // Mock Weather Data
// export const mockWeatherData: WeatherData = {
//   temperature: 32,
//   humidity: 75,
//   windSpeed: 12,
//   rainfall: 45,
//   condition: 'cloudy',
//   forecast: [
//     {
//       date: new Date().toISOString(),
//       tempMin: 26,
//       tempMax: 33,
//       condition: 'cloudy',
//       rainProbability: 40,
//     },
//     {
//       date: new Date(Date.now() + 86400000).toISOString(),
//       tempMin: 25,
//       tempMax: 31,
//       condition: 'rainy',
//       rainProbability: 80,
//     },
//     {
//       date: new Date(Date.now() + 172800000).toISOString(),
//       tempMin: 24,
//       tempMax: 30,
//       condition: 'stormy',
//       rainProbability: 90,
//     },
//     {
//       date: new Date(Date.now() + 259200000).toISOString(),
//       tempMin: 26,
//       tempMax: 32,
//       condition: 'cloudy',
//       rainProbability: 50,
//     },
//     {
//       date: new Date(Date.now() + 345600000).toISOString(),
//       tempMin: 27,
//       tempMax: 34,
//       condition: 'sunny',
//       rainProbability: 10,
//     },
//   ],
// };

// // Comments System
// export function getComments(reportId: string, reportType: 'disaster' | 'road'): ReportComment[] {
//   const stored = localStorage.getItem('report_comments');
//   if (stored) {
//     const allComments: ReportComment[] = JSON.parse(stored);
//     return allComments.filter((c) => c.reportId === reportId && c.reportType === reportType);
//   }
//   return [];
// }

// export function saveComment(comment: ReportComment): void {
//   const stored = localStorage.getItem('report_comments');
//   const comments: ReportComment[] = stored ? JSON.parse(stored) : [];
//   comments.unshift(comment);
//   localStorage.setItem('report_comments', JSON.stringify(comments));
// }

// export function getAllComments(): ReportComment[] {
//   const stored = localStorage.getItem('report_comments');
//   return stored ? JSON.parse(stored) : [];
// }

// function readLS(key: string): string | null {
//   if (typeof window === 'undefined') return null;
//   try {
//     return window.localStorage.getItem(key);
//   } catch {
//     return null;
//   }
// }

// function writeLS(key: string, value: string): void {
//   if (typeof window === 'undefined') return;
//   try {
//     window.localStorage.setItem(key, value);
//   } catch {
//     // ignore (private mode / quota / blocked)
//   }
// }

import {
  DashboardStats,
  DisasterReport,
  FirePrediction,
  FloodRiskArea,
  IoTSensor,
  ReportComment,
  RoadReport,
  WeatherData,
} from '@/types';

/* =====================================================
   SAFE LOCAL STORAGE HELPERS
===================================================== */
const isBrowser = () => typeof window !== 'undefined';

const readLS = <T>(key: string): T | null => {
  if (!isBrowser()) return null;
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

const writeLS = (key: string, value: unknown) => {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
};

/* =====================================================
   MOCK DATA (STATIC – AMAN DI SERVER)
===================================================== */

// IoT Sensors
export const mockSensors: IoTSensor[] = [
  {
    id: 'sensor-1',
    name: 'Sensor Suhu Kelurahan Menteng',
    location: { address: 'Jl. Menteng Raya', lat: -6.1954, lng: 106.8387, district: 'Menteng' },
    type: 'temperature',
    value: 34,
    unit: '°C',
    status: 'online',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'sensor-2',
    name: 'Sensor Kelembaban Cikini',
    location: { address: 'Jl. Cikini Raya', lat: -6.1872, lng: 106.8431, district: 'Cikini' },
    type: 'humidity',
    value: 45,
    unit: '%',
    status: 'warning',
    lastUpdated: new Date().toISOString(),
  },
];

// Fire Predictions
export const mockFirePredictions: FirePrediction[] = [
  {
    id: 'fire-1',
    area: 'Kawasan Industri Pulogadung',
    district: 'Pulogadung',
    riskLevel: 'high',
    probability: 0.72,
    factors: { temperature: 36, humidity: 35, windSpeed: 15, droughtIndex: 7 },
    sensors: [mockSensors[0]],
    lastUpdated: new Date().toISOString(),
  },
];

// Flood Risk Areas
export const mockFloodRiskAreas: FloodRiskArea[] = [
  {
    id: 'flood-1',
    area: 'Kampung Melayu',
    district: 'Jatinegara',
    riskLevel: 'critical',
    probability: 0.88,
    factors: { rainfall: 150, elevation: 2, drainageCapacity: 30, historicalFloods: 12 },
    lastUpdated: new Date().toISOString(),
  },
];

// Disaster Reports
export const mockDisasterReports: DisasterReport[] = [
  {
    id: 'report-1',
    type: 'flood',
    title: 'Banjir di Kampung Melayu',
    description: 'Banjir setinggi 80cm.',
    location: {
      address: 'Jl. Raya Kampung Melayu',
      lat: -6.2262,
      lng: 106.8669,
      district: 'Kampung Melayu',
    },
    images: [],
    status: 'in_progress',
    riskLevel: 'high',
    reportedBy: { id: 'u1', name: 'Budi Santoso' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Road Reports
export const mockRoadReports: RoadReport[] = [
  {
    id: 'road-1',
    type: 'pothole',
    title: 'Jalan Berlubang Sudirman',
    description: 'Lubang besar di tengah jalan.',
    location: {
      address: 'Jl. Sudirman',
      lat: -6.2088,
      lng: 106.8226,
      district: 'Sudirman',
    },
    images: [],
    status: 'verified',
    dangerLevel: 'severe',
    reportedBy: { id: 'u1', name: 'Budi Santoso' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Weather
export const mockWeatherData: WeatherData = {
  temperature: 32,
  humidity: 75,
  windSpeed: 12,
  rainfall: 45,
  condition: 'cloudy',
  forecast: [],
};

// Dashboard
export const mockDashboardStats: DashboardStats = {
  totalReports: 156,
  pendingReports: 23,
  inProgressReports: 42,
  resolvedReports: 91,
  highRiskAreas: 8,
  activeSensors: 24,
};

/* =====================================================
   CLIENT-SAFE DATA ACCESS
===================================================== */

export const getDisasterReports = (): DisasterReport[] =>
  readLS<DisasterReport[]>('disaster_reports') ?? mockDisasterReports;

export const saveDisasterReport = (report: DisasterReport) => {
  const reports = getDisasterReports();
  writeLS('disaster_reports', [report, ...reports]);
};

export function updateDisasterReport(id: string, updates: Partial<DisasterReport>): void {
  const reports = getDisasterReports();
  const index = reports.findIndex((r) => r.id === id);
  if (index !== -1) {
    reports[index] = { ...reports[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem('disaster_reports', JSON.stringify(reports));
  }
}

export function updateRoadReport(id: string, updates: Partial<RoadReport>): void {
  const reports = getRoadReports();
  const index = reports.findIndex((r) => r.id === id);
  if (index !== -1) {
    reports[index] = { ...reports[index], ...updates, updatedAt: new Date().toISOString() };
    if (typeof window !== 'undefined') {
      localStorage.setItem('road_reports', JSON.stringify(reports));
    }
  }
}

export const getRoadReports = (): RoadReport[] =>
  readLS<RoadReport[]>('road_reports') ?? mockRoadReports;

export const saveRoadReport = (report: RoadReport) => {
  const reports = getRoadReports();
  writeLS('road_reports', [report, ...reports]);
};

export const getComments = (reportId: string, reportType: 'disaster' | 'road'): ReportComment[] => {
  const comments = readLS<ReportComment[]>('report_comments') ?? [];
  return comments.filter((c) => c.reportId === reportId && c.reportType === reportType);
};

export const saveComment = (comment: ReportComment) => {
  const comments = readLS<ReportComment[]>('report_comments') ?? [];
  writeLS('report_comments', [comment, ...comments]);
};


