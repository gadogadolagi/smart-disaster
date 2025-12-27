'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { Activity, CheckCircle, Clock } from 'lucide-react';

interface TimelineEvent {
  id: string;
  status: 'pending' | 'verified' | 'in_progress' | 'resolved';
  timestamp: string;
  description?: string;
}

interface ReportTimelineProps {
  events: TimelineEvent[];
  reportTitle?: string;
}

const statusConfig = {
  pending: {
    label: 'Menunggu',
    icon: Clock,
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  verified: {
    label: 'Terverifikasi',
    icon: CheckCircle,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  in_progress: {
    label: 'Ditangani',
    icon: Activity,
    color: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  resolved: {
    label: 'Selesai',
    icon: CheckCircle,
    color: 'bg-green-100 text-green-800 border-green-200',
  },
};

export function ReportTimeline({ events, reportTitle }: ReportTimelineProps) {
  if (events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Timeline Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Belum ada aktivitas</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Timeline Progress
        </CardTitle>
        {reportTitle && <p className="text-sm text-muted-foreground mt-1">{reportTitle}</p>}
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

          <div className="space-y-6">
            {events.map((event, index) => {
              const config = statusConfig[event.status];
              const Icon = config.icon;
              const isLast = index === events.length - 1;

              return (
                <div key={event.id} className="relative flex gap-4">
                  {/* Icon */}
                  <div
                    className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 ${config.color}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-6">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className={config.color}>
                        {config.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(event.timestamp), {
                          addSuffix: true,
                          locale: id,
                        })}
                      </span>
                    </div>
                    {event.description && (
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(event.timestamp).toLocaleString('id-ID', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

