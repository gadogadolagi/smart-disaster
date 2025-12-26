// User & Auth Types
export type UserRole = 'citizen' | 'government' | 'admin' | 'officer';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
}

// Disaster Report Types
export type DisasterType = 'flood' | 'fire' | 'fallen_tree' | 'landslide' | 'earthquake' | 'other';
export type ReportStatus = 'pending' | 'verified' | 'in_progress' | 'resolved';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface DisasterReport {
  id: string;
  type: DisasterType;
  title: string;
  description: string;
  location: {
    address: string;
    lat: number;
    lng: number;
    district: string;
  };
  images: string[];
  status: ReportStatus;
  riskLevel: RiskLevel;
  urgencyPercentage?: number; // Persentase tingkat bahaya/urgensi (0-100)
  aiAnalysis?: {
    detectedIssues: string[];
    confidence: number;
    recommendedAction: string;
  };
  reportedBy: {
    id: string;
    name: string;
    phone?: string;
  };
  createdAt: string;
  updatedAt: string;
  handledBy?: string;
  notes?: string;
}

// Road Infrastructure Types
export type RoadIssueType = 'pothole' | 'landslide' | 'bridge_damage' | 'crack' | 'flooding';
export type DangerLevel = 'minor' | 'moderate' | 'severe';

export interface RoadReport {
  id: string;
  type: RoadIssueType;
  title: string;
  description: string;
  location: {
    address: string;
    lat: number;
    lng: number;
    district: string;
  };
  images: string[];
  status: ReportStatus;
  dangerLevel: DangerLevel;
  urgencyPercentage?: number; // Persentase tingkat bahaya/urgensi (0-100)
  aiAnalysis?: {
    detectedIssues: string[];
    confidence: number;
    recommendedAction: string;
  };
  reportedBy: {
    id: string;
    name: string;
    phone?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// IoT Sensor Types (Mock)
export interface IoTSensor {
  id: string;
  name: string;
  location: {
    address: string;
    lat: number;
    lng: number;
    district: string;
  };
  type: 'temperature' | 'humidity' | 'smoke' | 'water_level';
  value: number;
  unit: string;
  status: 'online' | 'offline' | 'warning';
  lastUpdated: string;
}

// Fire Prediction Types (Mock)
export interface FirePrediction {
  id: string;
  area: string;
  district: string;
  riskLevel: RiskLevel;
  probability: number;
  factors: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    droughtIndex: number;
  };
  sensors: IoTSensor[];
  lastUpdated: string;
}

// Flood Risk Types (Mock)
export interface FloodRiskArea {
  id: string;
  area: string;
  district: string;
  riskLevel: RiskLevel;
  probability: number;
  factors: {
    rainfall: number;
    elevation: number;
    drainageCapacity: number;
    historicalFloods: number;
  };
  lastUpdated: string;
}

// Statistics Types
export interface DashboardStats {
  totalReports: number;
  pendingReports: number;
  inProgressReports: number;
  resolvedReports: number;
  highRiskAreas: number;
  activeSensors: number;
}

// Comment Types
export interface ReportComment {
  id: string;
  reportId: string;
  reportType: 'disaster' | 'road';
  content: string;
  author: {
    id: string;
    name: string;
    role: UserRole;
  };
  createdAt: string;
}

// Weather Data Types (Mock)
export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  rainfall: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy';
  forecast: WeatherForecast[];
}

export interface WeatherForecast {
  date: string;
  tempMin: number;
  tempMax: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy';
  rainProbability: number;
}
