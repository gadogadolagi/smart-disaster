// apps/web/data/mockData.ts
import type {
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
   CONSTANTS
===================================================== */
const NOW_ISO = () => new Date().toISOString();

/* =====================================================
   SAFE LOCAL STORAGE HELPERS (SSR SAFE)
===================================================== */
const isBrowser = () => typeof window !== 'undefined';

const readLS = <T>(key: string): T | null => {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
};

const writeLS = (key: string, value: unknown): void => {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore (private mode/quota/block)
  }
};

/* =====================================================
   MOCK DATA (STATIC, SSR SAFE)
===================================================== */

// Mock IoT Sensors
export const mockSensors: IoTSensor[] = [
  {
    id: 'sensor-1',
    name: 'Sensor Suhu Kelurahan Menteng',
    location: { address: 'Jl. Menteng Raya', lat: -6.1954, lng: 106.8387, district: 'Menteng' },
    type: 'temperature',
    value: 34,
    unit: '°C',
    status: 'online',
    lastUpdated: NOW_ISO(),
  },
  {
    id: 'sensor-2',
    name: 'Sensor Kelembaban Cikini',
    location: { address: 'Jl. Cikini Raya', lat: -6.1872, lng: 106.8431, district: 'Cikini' },
    type: 'humidity',
    value: 45,
    unit: '%',
    status: 'warning',
    lastUpdated: NOW_ISO(),
  },
  {
    id: 'sensor-3',
    name: 'Sensor Asap Kemayoran',
    location: { address: 'Jl. Kemayoran', lat: -6.165, lng: 106.8522, district: 'Kemayoran' },
    type: 'smoke',
    value: 120,
    unit: 'ppm',
    status: 'online',
    lastUpdated: NOW_ISO(),
  },
  {
    id: 'sensor-4',
    name: 'Sensor Level Air Kampung Melayu',
    location: {
      address: 'Kampung Melayu',
      lat: -6.2262,
      lng: 106.8669,
      district: 'Kampung Melayu',
    },
    type: 'water_level',
    value: 2.3,
    unit: 'm',
    status: 'online',
    lastUpdated: NOW_ISO(),
  },
  {
    id: 'sensor-5',
    name: 'Sensor Suhu Pluit',
    location: { address: 'Jl. Pluit', lat: -6.1222, lng: 106.795, district: 'Pluit' },
    type: 'temperature',
    value: 38,
    unit: '°C',
    status: 'warning',
    lastUpdated: NOW_ISO(),
  },
];

// Mock Fire Predictions
export const mockFirePredictions: FirePrediction[] = [
  {
    id: 'fire-1',
    area: 'Kawasan Industri Pulogadung',
    district: 'Pulogadung',
    riskLevel: 'high',
    probability: 0.72,
    factors: { temperature: 36, humidity: 35, windSpeed: 15, droughtIndex: 7 },
    sensors: mockSensors.filter((s) => s.id === 'sensor-1' || s.id === 'sensor-5'),
    lastUpdated: NOW_ISO(),
  },
  {
    id: 'fire-2',
    area: 'Hutan Kota Srengseng',
    district: 'Srengseng',
    riskLevel: 'critical',
    probability: 0.85,
    factors: { temperature: 38, humidity: 28, windSpeed: 20, droughtIndex: 8.5 },
    sensors: mockSensors.filter((s) => s.id === 'sensor-2'),
    lastUpdated: NOW_ISO(),
  },
  {
    id: 'fire-3',
    area: 'Perumahan Kelapa Gading',
    district: 'Kelapa Gading',
    riskLevel: 'medium',
    probability: 0.45,
    factors: { temperature: 32, humidity: 55, windSpeed: 10, droughtIndex: 4 },
    sensors: mockSensors.filter((s) => s.id === 'sensor-3'),
    lastUpdated: NOW_ISO(),
  },
  {
    id: 'fire-4',
    area: 'Pasar Tanah Abang',
    district: 'Tanah Abang',
    riskLevel: 'low',
    probability: 0.22,
    factors: { temperature: 30, humidity: 65, windSpeed: 8, droughtIndex: 3 },
    sensors: [],
    lastUpdated: NOW_ISO(),
  },
];

// Mock Flood Risk Areas
export const mockFloodRiskAreas: FloodRiskArea[] = [
  {
    id: 'flood-1',
    area: 'Kampung Melayu',
    district: 'Jatinegara',
    riskLevel: 'critical',
    probability: 0.88,
    factors: { rainfall: 150, elevation: 2, drainageCapacity: 30, historicalFloods: 12 },
    lastUpdated: NOW_ISO(),
  },
  {
    id: 'flood-2',
    area: 'Kelapa Gading Boulevard',
    district: 'Kelapa Gading',
    riskLevel: 'high',
    probability: 0.68,
    factors: { rainfall: 120, elevation: 5, drainageCapacity: 50, historicalFloods: 8 },
    lastUpdated: NOW_ISO(),
  },
  {
    id: 'flood-3',
    area: 'Pluit Timur',
    district: 'Penjaringan',
    riskLevel: 'high',
    probability: 0.75,
    factors: { rainfall: 140, elevation: 1, drainageCapacity: 40, historicalFloods: 15 },
    lastUpdated: NOW_ISO(),
  },
  {
    id: 'flood-4',
    area: 'Kemang Selatan',
    district: 'Kemang',
    riskLevel: 'medium',
    probability: 0.42,
    factors: { rainfall: 80, elevation: 15, drainageCapacity: 70, historicalFloods: 4 },
    lastUpdated: NOW_ISO(),
  },
  {
    id: 'flood-5',
    area: 'Menteng Dalam',
    district: 'Menteng',
    riskLevel: 'low',
    probability: 0.18,
    factors: { rainfall: 60, elevation: 25, drainageCapacity: 85, historicalFloods: 1 },
    lastUpdated: NOW_ISO(),
  },
];

// Mock Disaster Reports
export const mockDisasterReports: DisasterReport[] = [
  {
    id: 'report-1',
    type: 'flood',
    title: 'Banjir di Jalan Raya Kampung Melayu',
    description: 'Banjir setinggi 80cm di sepanjang jalan raya, kendaraan tidak bisa lewat.',
    location: {
      address: 'Jl. Raya Kampung Melayu No. 45',
      lat: -6.2262,
      lng: 106.8669,
      district: 'Kampung Melayu',
    },
    images: ['/placeholder.svg'],
    status: 'in_progress',
    riskLevel: 'high',
    reportedBy: { id: 'user-1', name: 'Budi Santoso', phone: '081234567890' },
    createdAt: NOW_ISO(),
    updatedAt: NOW_ISO(),
    handledBy: 'Tim BPBD Jakarta Timur',
  },
  {
    id: 'report-2',
    type: 'fallen_tree',
    title: 'Pohon Tumbang di Menteng',
    description: 'Pohon besar tumbang menghalangi jalan dan menimpa 2 mobil parkir.',
    location: {
      address: 'Jl. Menteng Raya No. 12',
      lat: -6.1954,
      lng: 106.8387,
      district: 'Menteng',
    },
    images: ['/placeholder.svg'],
    status: 'verified',
    riskLevel: 'medium',
    reportedBy: { id: 'user-2', name: 'Siti Aminah', phone: '087654321098' },
    createdAt: NOW_ISO(),
    updatedAt: NOW_ISO(),
  },
  {
    id: 'report-3',
    type: 'fire',
    title: 'Kebakaran Gudang di Pulogadung',
    description: 'Kebakaran besar di gudang pabrik, api sudah menyebar ke 2 bangunan.',
    location: {
      address: 'Kawasan Industri Pulogadung Blok C-12',
      lat: -6.18,
      lng: 106.9,
      district: 'Pulogadung',
    },
    images: ['/placeholder.svg'],
    status: 'in_progress',
    riskLevel: 'critical',
    reportedBy: { id: 'user-3', name: 'Ahmad Hidayat' },
    createdAt: NOW_ISO(),
    updatedAt: NOW_ISO(),
    handledBy: 'Damkar Jakarta Timur',
    notes: 'Tim damkar sudah di lokasi. Evakuasi warga sekitar dalam proses.',
  },
];

// Mock Road Reports
export const mockRoadReports: RoadReport[] = [
  {
    id: 'road-1',
    type: 'pothole',
    title: 'Jalan Berlubang Besar di Sudirman',
    description: 'Lubang berdiameter 1 meter, kedalaman 30cm. Sangat berbahaya.',
    location: {
      address: 'Jl. Jend. Sudirman Km 5',
      lat: -6.2088,
      lng: 106.8226,
      district: 'Sudirman',
    },
    images: ['/placeholder.svg'],
    status: 'verified',
    dangerLevel: 'severe',
    aiAnalysis: {
      detectedIssues: ['Lubang besar', 'Aspal retak', 'Drainase rusak'],
      confidence: 0.92,
      recommendedAction: 'Perbaikan segera dalam 24 jam',
    },
    reportedBy: { id: 'user-1', name: 'Budi Santoso' },
    createdAt: NOW_ISO(),
    updatedAt: NOW_ISO(),
  },
  {
    id: 'road-2',
    type: 'landslide',
    title: 'Jalan Longsor di Puncak',
    description: 'Setengah badan jalan longsor, hanya 1 jalur yang bisa dilalui.',
    location: { address: 'Jl. Raya Puncak Km 78', lat: -6.68, lng: 106.99, district: 'Puncak' },
    images: ['/placeholder.svg'],
    status: 'in_progress',
    dangerLevel: 'severe',
    aiAnalysis: {
      detectedIssues: ['Longsor tebing', 'Retakan tanah', 'Pohon tumbang'],
      confidence: 0.88,
      recommendedAction: 'Tutup jalur, perbaikan mayor diperlukan',
    },
    reportedBy: { id: 'user-6', name: 'Agus Pratama' },
    createdAt: NOW_ISO(),
    updatedAt: NOW_ISO(),
  },
];

// Mock Weather Data
export const mockWeatherData: WeatherData = {
  temperature: 32,
  humidity: 75,
  windSpeed: 12,
  rainfall: 45,
  condition: 'cloudy',
  forecast: [
    { date: NOW_ISO(), tempMin: 26, tempMax: 33, condition: 'cloudy', rainProbability: 40 },
    {
      date: new Date(Date.now() + 86400000).toISOString(),
      tempMin: 25,
      tempMax: 31,
      condition: 'rainy',
      rainProbability: 80,
    },
    {
      date: new Date(Date.now() + 172800000).toISOString(),
      tempMin: 24,
      tempMax: 30,
      condition: 'stormy',
      rainProbability: 90,
    },
    {
      date: new Date(Date.now() + 259200000).toISOString(),
      tempMin: 26,
      tempMax: 32,
      condition: 'cloudy',
      rainProbability: 50,
    },
    {
      date: new Date(Date.now() + 345600000).toISOString(),
      tempMin: 27,
      tempMax: 34,
      condition: 'sunny',
      rainProbability: 10,
    },
  ],
};

// Dashboard Statistics
export const mockDashboardStats: DashboardStats = {
  totalReports: 156,
  pendingReports: 23,
  inProgressReports: 42,
  resolvedReports: 91,
  highRiskAreas: 8,
  activeSensors: 24,
};

/* =====================================================
   CLIENT-SAFE DATA ACCESS (LS fallback to mock)
===================================================== */

export const getDisasterReports = (): DisasterReport[] => {
  const stored = readLS<DisasterReport[]>('disaster_reports');
  return Array.isArray(stored) ? stored : mockDisasterReports;
};

export const saveDisasterReport = (report: DisasterReport): void => {
  const reports = getDisasterReports();
  writeLS('disaster_reports', [report, ...reports]);
};

export const getRoadReports = (): RoadReport[] => {
  const stored = readLS<RoadReport[]>('road_reports');
  return Array.isArray(stored) ? stored : mockRoadReports;
};

export const saveRoadReport = (report: RoadReport): void => {
  const reports = getRoadReports();
  writeLS('road_reports', [report, ...reports]);
};

/**
 * Update types:
 * - tidak boleh update id / createdAt / type (type biasanya jangan diubah)
 */
export type DisasterReportUpdate = Omit<Partial<DisasterReport>, 'id' | 'createdAt' | 'type'>;
export type RoadReportUpdate = Omit<Partial<RoadReport>, 'id' | 'createdAt' | 'type'>;

export const updateDisasterReport = (id: string, updates: DisasterReportUpdate): void => {
  const reports = getDisasterReports();
  const index = reports.findIndex((r) => r.id === id);
  if (index === -1) return;

  const current = reports[index];
  if (!current) return;

  // hindari accidental override dari updates
  const {
    id: _id,
    createdAt: _createdAt,
    type: _type,
    ...safe
  } = updates as Partial<DisasterReport>;

  const next: DisasterReport[] = [...reports];
  next[index] = {
    ...current,
    ...safe,
    id: current.id,
    type: current.type,
    createdAt: current.createdAt,
    updatedAt: NOW_ISO(),
  };

  writeLS('disaster_reports', next);
};

export const updateRoadReport = (id: string, updates: RoadReportUpdate): void => {
  const reports = getRoadReports();
  const index = reports.findIndex((r) => r.id === id);
  if (index === -1) return;

  const current = reports[index];
  if (!current) return;

  const { id: _id, createdAt: _createdAt, type: _type, ...safe } = updates as Partial<RoadReport>;

  const next: RoadReport[] = [...reports];
  next[index] = {
    ...current,
    ...safe,
    id: current.id,
    type: current.type,
    createdAt: current.createdAt,
    updatedAt: NOW_ISO(),
  };

  writeLS('road_reports', next);
};

/* =====================================================
   COMMENTS
===================================================== */

export const getComments = (reportId: string, reportType: 'disaster' | 'road'): ReportComment[] => {
  const all = readLS<ReportComment[]>('report_comments') ?? [];
  return all.filter((c) => c.reportId === reportId && c.reportType === reportType);
};

export const getAllComments = (): ReportComment[] =>
  readLS<ReportComment[]>('report_comments') ?? [];

export const saveComment = (comment: ReportComment): void => {
  const all = readLS<ReportComment[]>('report_comments') ?? [];
  writeLS('report_comments', [comment, ...all]);
};
