'use client';

import { DangerLevelBadge, MapEmbed, RoadIssueTypeBadge, StatusBadge } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { API_ENDPOINTS, apiCall, getImageUrl } from '@/lib/api/config';
import { ArrowLeft, Brain, Clock, Construction, MapPin, Shield, TrendingUp, User } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface RoadReport {
  id: string;
  type: string;
  title: string;
  description: string;
  address: string;
  district: string;
  lat: number;
  lng: number;
  images: string[];
  status: string;
  dangerLevel: string;
  urgencyPercentage?: number;
  reportedBy?: {
    id: string;
    name: string;
    phone?: string;
  };
  handledBy?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  aiAnalysis?: {
    detectedIssues: string[];
    confidence: number;
    recommendedAction?: string;
  };
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
}

function CommentSection({
  reportId,
  reportType,
}: {
  reportId: string;
  reportType: 'disaster' | 'road';
}) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadComments();
  }, [reportId, reportType]);

  const loadComments = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(
        `${API_ENDPOINTS.comments.getReport(reportId)}?reportType=${reportType}`
      );
      const data = await res.json();

      if (res.ok && data.success) {
        setComments(data.data || []);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) {
      toast.error('Komentar tidak boleh kosong');
      return;
    }

    if (!isAuthenticated || !user) {
      toast.error('Silakan login untuk memberikan komentar');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await apiCall(API_ENDPOINTS.comments.create, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportId,
          reportType,
          content: newComment.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success('Komentar berhasil ditambahkan');
        setNewComment('');
        loadComments();
      } else {
        throw new Error(data.message || 'Gagal menambahkan komentar');
      }
    } catch (error: any) {
      console.error('Error submitting comment:', error);
      toast.error(error.message || 'Gagal menambahkan komentar');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Komentar ({comments.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground text-center py-4">Memuat komentar...</p>
        ) : comments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Belum ada komentar. Jadilah yang pertama!
          </p>
        ) : (
          <div className="space-y-4 mb-4">
            {comments.map((comment) => (
              <div key={comment.id} className="p-3 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    {comment.author.role === 'admin' ? (
                      <Shield className="h-4 w-4 text-primary" />
                    ) : (
                      <User className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium">{comment.author.name}</p>
                      {comment.author.role === 'admin' && (
                        <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">
                          Pemerintah
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-foreground whitespace-pre-wrap">{comment.content}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(comment.createdAt).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {isAuthenticated ? (
          <div className="mt-4 pt-4 border-t">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Tulis komentar Anda..."
              rows={3}
              className="mb-2"
            />
            <Button
              onClick={handleSubmitComment}
              size="sm"
              disabled={!newComment.trim() || isSubmitting}
            >
              {isSubmitting ? 'Mengirim...' : 'Kirim Komentar'}
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Silakan login untuk memberikan komentar
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function RoadReportDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [report, setReport] = useState<RoadReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadReport = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.reports.road.get(params.id));
        const data = await res.json();

        if (res.ok && data.success) {
          setReport(data.data);
        } else {
          throw new Error(data.message || 'Gagal memuat laporan');
        }
      } catch (error: any) {
        console.error('Error loading report:', error);
        toast.error(error.message || 'Gagal memuat laporan');
        router.push('/public-reports');
      } finally {
        setIsLoading(false);
      }
    };

    loadReport();
  }, [params.id, router]);

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <p>Memuat laporan...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return null;
  }

  return (
    <div className="container py-8 max-w-4xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Kembali
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Construction className="h-6 w-6" />
                {report.title}
              </CardTitle>
            </div>
            <StatusBadge status={report.status as any} />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <RoadIssueTypeBadge type={report.type as any} />
            <DangerLevelBadge level={report.dangerLevel as any} />
          </div>

          {/* Urgency Percentage */}
          {report.urgencyPercentage !== undefined && report.urgencyPercentage > 0 && (
            <div className="p-4 rounded-lg bg-accent/50 border">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <p className="font-semibold">Tingkat Urgensi Prediksi AI</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Persentase Urgensi</span>
                  <span className="text-lg font-bold">{report.urgencyPercentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      report.urgencyPercentage >= 80
                        ? 'bg-destructive'
                        : report.urgencyPercentage >= 60
                          ? 'bg-orange-500'
                          : report.urgencyPercentage >= 40
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(100, report.urgencyPercentage)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {report.urgencyPercentage >= 80
                    ? 'Sangat Urgent - Perlu penanganan segera'
                    : report.urgencyPercentage >= 60
                      ? 'Urgent - Perlu perhatian segera'
                      : report.urgencyPercentage >= 40
                        ? 'Sedang - Perlu monitoring'
                        : 'Rendah - Kondisi normal'}
                </p>
              </div>
            </div>
          )}

          {/* AI Analysis */}
          {report.aiAnalysis && (
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="h-5 w-5 text-primary" />
                <p className="font-semibold">Analisis Machine Learning</p>
              </div>
              <div className="space-y-2 text-sm">
                {report.aiAnalysis.detectedIssues &&
                  report.aiAnalysis.detectedIssues.length > 0 && (
                    <div>
                      <p className="font-medium text-muted-foreground mb-1">Masalah Terdeteksi:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {report.aiAnalysis.detectedIssues.map((issue, idx) => (
                          <li key={idx}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                <div>
                  <p className="font-medium text-muted-foreground">Tingkat Kepercayaan:</p>
                  <p>{Math.round((report.aiAnalysis.confidence || 0) * 100)}%</p>
                </div>
                {report.aiAnalysis.recommendedAction && (
                  <div>
                    <p className="font-medium text-muted-foreground">Rekomendasi:</p>
                    <p>{report.aiAnalysis.recommendedAction}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Images Gallery */}
          {report.images && report.images.length > 0 && (
            <div>
              <p className="font-medium text-muted-foreground mb-2">Foto Bukti</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {report.images.map((image, idx) => (
                  <div key={idx} className="rounded-lg overflow-hidden border">
                    <img
                      src={getImageUrl(image)}
                      alt={`${report.title} - Foto ${idx + 1}`}
                      className="w-full h-48 object-cover hover:scale-105 transition-transform cursor-pointer"
                      onClick={() => window.open(getImageUrl(image), '_blank')}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Map Embed */}
          <div>
            <p className="font-medium text-muted-foreground mb-3">Lokasi di Peta</p>
            <MapEmbed
              lat={report.lat}
              lng={report.lng}
              address={`${report.address}, ${report.district}`}
              title={report.title}
              height="400px"
            />
          </div>

          <div className="grid gap-4 text-sm">
            <div>
              <p className="font-medium text-muted-foreground mb-1">Lokasi</p>
              <p className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {report.address}, {report.district}
              </p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground mb-1">Deskripsi</p>
              <p className="whitespace-pre-wrap">{report.description}</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground mb-1">Dilaporkan oleh</p>
              <p>{report.reportedBy?.name || 'Anonim'}</p>
            </div>
            {report.handledBy && (
              <div>
                <p className="font-medium text-muted-foreground mb-1">Ditangani oleh</p>
                <p className="flex items-center gap-1">
                  <Shield className="h-4 w-4 text-primary" />
                  {report.handledBy}
                </p>
              </div>
            )}
            {report.notes && (
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <p className="font-medium text-muted-foreground mb-1">Catatan Penanganan</p>
                <p className="whitespace-pre-wrap">{report.notes}</p>
              </div>
            )}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Dibuat: {new Date(report.createdAt).toLocaleString('id-ID')}
              </span>
              <span>Update: {new Date(report.updatedAt).toLocaleString('id-ID')}</span>
            </div>
          </div>

          <CommentSection reportId={report.id} reportType="road" />
        </CardContent>
      </Card>
    </div>
  );
}
