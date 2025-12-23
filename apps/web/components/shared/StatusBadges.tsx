import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { DangerLevel, DisasterType, ReportStatus, RiskLevel, RoadIssueType } from '@/types';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Clock,
  Construction,
  Droplets,
  Flame,
  HelpCircle,
  Mountain,
  TreeDeciduous,
  Zap,
} from 'lucide-react';

// Risk Level Badge
export function RiskLevelBadge({ level }: { level: RiskLevel }) {
  const config = {
    low: { label: 'Rendah', className: 'bg-success/10 text-success border-success/20' },
    medium: { label: 'Sedang', className: 'bg-warning/10 text-warning border-warning/20' },
    high: { label: 'Tinggi', className: 'bg-risk-high/10 text-risk-high border-risk-high/20' },
    critical: {
      label: 'Kritis',
      className: 'bg-danger/10 text-danger border-danger/20 animate-pulse-slow',
    },
  };

  return (
    <Badge variant="outline" className={cn('font-medium', config[level].className)}>
      {config[level].label}
    </Badge>
  );
}

// Status Badge
export function StatusBadge({ status }: { status: ReportStatus }) {
  const config = {
    pending: { label: 'Menunggu', icon: Clock, className: 'bg-muted text-muted-foreground' },
    verified: { label: 'Terverifikasi', icon: CheckCircle, className: 'bg-info/10 text-info' },
    in_progress: {
      label: 'Ditangani',
      icon: AlertTriangle,
      className: 'bg-warning/10 text-warning',
    },
    resolved: { label: 'Selesai', icon: CheckCircle, className: 'bg-success/10 text-success' },
  };

  const Icon = config[status].icon;

  return (
    <Badge variant="secondary" className={cn('gap-1', config[status].className)}>
      <Icon className="h-3 w-3" />
      {config[status].label}
    </Badge>
  );
}

// Disaster Type Badge
export function DisasterTypeBadge({ type }: { type: DisasterType }) {
  const config = {
    flood: { label: 'Banjir', icon: Droplets, className: 'bg-info/10 text-info' },
    fire: { label: 'Kebakaran', icon: Flame, className: 'bg-danger/10 text-danger' },
    fallen_tree: {
      label: 'Pohon Tumbang',
      icon: TreeDeciduous,
      className: 'bg-success/10 text-success',
    },
    landslide: { label: 'Longsor', icon: Mountain, className: 'bg-warning/10 text-warning' },
    earthquake: { label: 'Gempa', icon: Zap, className: 'bg-muted text-muted-foreground' },
    other: { label: 'Lainnya', icon: HelpCircle, className: 'bg-muted text-muted-foreground' },
  };

  const Icon = config[type].icon;

  return (
    <Badge variant="secondary" className={cn('gap-1', config[type].className)}>
      <Icon className="h-3 w-3" />
      {config[type].label}
    </Badge>
  );
}

// Road Issue Type Badge
export function RoadIssueTypeBadge({ type }: { type: RoadIssueType }) {
  const config = {
    pothole: { label: 'Jalan Berlubang', icon: AlertCircle },
    landslide: { label: 'Jalan Longsor', icon: Mountain },
    bridge_damage: { label: 'Jembatan Rusak', icon: Construction },
    crack: { label: 'Retakan', icon: AlertTriangle },
    flooding: { label: 'Tergenang', icon: Droplets },
  };

  const Icon = config[type].icon;

  return (
    <Badge variant="secondary" className="gap-1 bg-muted">
      <Icon className="h-3 w-3" />
      {config[type].label}
    </Badge>
  );
}

// Danger Level Badge
export function DangerLevelBadge({ level }: { level: DangerLevel }) {
  const config = {
    minor: { label: 'Ringan', className: 'bg-success/10 text-success' },
    moderate: { label: 'Sedang', className: 'bg-warning/10 text-warning' },
    severe: { label: 'Berat', className: 'bg-danger/10 text-danger' },
  };

  return (
    <Badge variant="secondary" className={cn(config[level].className)}>
      {config[level].label}
    </Badge>
  );
}
