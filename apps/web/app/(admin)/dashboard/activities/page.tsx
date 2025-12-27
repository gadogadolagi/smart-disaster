'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { getImageUrl } from '@/lib/api/config';
import { Activity, Calendar, Search, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface ActivityLog {
  id: string;
  reportId: string;
  reportType: string;
  activityType: string;
  description: string;
  images: string[];
  createdBy: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  createdAt: string;
}

export default function ActivityLogPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [reportTypeFilter, setReportTypeFilter] = useState<string>('all');

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    if (authLoading) return;

    if (!isAuthenticated || !user || user.role !== 'admin') {
      router.replace('/login');
      return;
    }

    loadActivities();
  }, [mounted, authLoading, isAuthenticated, user, router]);

  const loadActivities = async () => {
    setIsLoading(true);
    try {
      // Since we don't have a direct activities list endpoint, we'll need to get activities from reports
      // For now, we'll show a message that this feature needs backend support
      setActivities([]);
    } catch (error: any) {
      console.error('Error loading activities:', error);
      toast.error(error.message || 'Gagal memuat log aktivitas');
    } finally {
      setIsLoading(false);
    }
  };

  const activityTypeLabels: Record<string, string> = {
    assigned: 'Ditugaskan',
    status_changed: 'Status Berubah',
    verified: 'Terverifikasi',
    in_progress: 'Sedang Ditangani',
    resolved: 'Selesai',
    note_added: 'Catatan Ditambahkan',
    comment_added: 'Komentar Ditambahkan',
  };

  const filteredActivities = activities.filter((activity) => {
    const matchesSearch =
      activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.createdBy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.reportId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === 'all' || activity.activityType === typeFilter;
    const matchesReportType =
      reportTypeFilter === 'all' || activity.reportType === reportTypeFilter;

    return matchesSearch && matchesType && matchesReportType;
  });

  if (!mounted || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Memuat...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Log Aktivitas Aplikasi</h1>
        <p className="text-muted-foreground">Riwayat semua aktivitas dalam sistem</p>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari aktivitas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter Tipe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Tipe</SelectItem>
              <SelectItem value="assigned">Ditugaskan</SelectItem>
              <SelectItem value="status_changed">Status Berubah</SelectItem>
              <SelectItem value="verified">Terverifikasi</SelectItem>
              <SelectItem value="in_progress">Sedang Ditangani</SelectItem>
              <SelectItem value="resolved">Selesai</SelectItem>
              <SelectItem value="note_added">Catatan Ditambahkan</SelectItem>
              <SelectItem value="comment_added">Komentar Ditambahkan</SelectItem>
            </SelectContent>
          </Select>
          <Select value={reportTypeFilter} onValueChange={setReportTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter Jenis Laporan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Jenis</SelectItem>
              <SelectItem value="disaster">Bencana</SelectItem>
              <SelectItem value="road">Jalan</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <p>Memuat log aktivitas...</p>
        </div>
      ) : filteredActivities.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              {activities.length === 0
                ? 'Belum ada aktivitas yang tercatat. Fitur ini memerlukan endpoint API untuk mengambil semua aktivitas.'
                : 'Tidak ada aktivitas yang sesuai dengan filter.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredActivities.map((activity) => (
            <Card key={activity.id}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Activity className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold">{activity.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {activity.createdBy.name} ({activity.createdBy.role})
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(activity.createdAt).toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                          {activityTypeLabels[activity.activityType] || activity.activityType}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs bg-muted">
                          {activity.reportType === 'disaster' ? 'Bencana' : 'Jalan'}
                        </span>
                      </div>
                    </div>
                    {activity.images && activity.images.length > 0 && (
                      <div className="flex gap-2 mt-4">
                        {activity.images.map((img, idx) => (
                          <img
                            key={idx}
                            src={getImageUrl(img)}
                            alt={`Activity image ${idx + 1}`}
                            className="w-20 h-20 rounded-lg object-cover"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
