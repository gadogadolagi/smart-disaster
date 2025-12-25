'use client';
import {
  DangerLevelBadge,
  DisasterTypeBadge,
  RiskLevelBadge,
  RoadIssueTypeBadge,
  StatusBadge,
} from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { getComments, mockDisasterReports, mockRoadReports, saveComment } from '@/data/mockData';
import { API_ENDPOINTS, getImageUrl } from '@/lib/api/config';
import { DisasterReport, ReportComment, RoadReport } from '@/types';
import {
  AlertTriangle,
  Brain,
  Clock,
  Construction,
  Eye,
  MapPin,
  MessageCircle,
  Search,
  Send,
  Shield,
  TrendingUp,
  User,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

function CommentSection({
  reportId,
  reportType,
}: {
  reportId: string;
  reportType: 'disaster' | 'road';
}) {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState<ReportComment[]>(() =>
    getComments(reportId, reportType)
  );
  const [newComment, setNewComment] = useState('');

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    if (!isAuthenticated || !user) {
      toast.error('Login diperlukan.');
      return;
    }

    const comment: ReportComment = {
      id: `comment-${Date.now()}`,
      reportId,
      reportType,
      content: newComment,
      author: {
        id: user.id,
        name: user.name,
        role: user.role,
      },
      createdAt: new Date().toISOString(),
    };

    saveComment(comment);
    setComments([comment, ...comments]);
    setNewComment('');
    toast.success('Komentar ditambahkan.');
  };

  return (
    <div className="space-y-4 mt-4 pt-4 border-t">
      <h4 className="font-semibold flex items-center gap-2">
        <MessageCircle className="h-4 w-4" />
        Komentar & Progres ({comments.length})
      </h4>

      {/* Add Comment */}
      <div className="flex gap-2">
        <Textarea
          placeholder={
            isAuthenticated
              ? 'Tulis komentar atau update progres...'
              : 'Login untuk memberikan komentar...'
          }
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="min-h-[60]"
          disabled={!isAuthenticated}
        />
        <Button
          size="icon"
          onClick={handleSubmitComment}
          disabled={!isAuthenticated || !newComment.trim()}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {/* Comments List */}
      <div className="space-y-3 max-h-[300] overflow-y-auto">
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Belum ada komentar. Jadilah yang pertama!
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  {comment.author.role === 'government' ? (
                    <Shield className="h-4 w-4 text-primary" />
                  ) : (
                    <User className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium flex items-center gap-2">
                    {comment.author.name}
                    {comment.author.role === 'government' && (
                      <Badge variant="secondary" className="text-xs">
                        Pemerintah
                      </Badge>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(comment.createdAt).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
              <p className="text-sm">{comment.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function DisasterReportCard({ report }: { report: DisasterReport }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Card className="cursor-pointer hover:shadow-md transition-all hover:border-primary/50">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <CardTitle className="text-base line-clamp-1">{report.title}</CardTitle>
                <CardDescription className="flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3" />
                  {report.location.district}
                </CardDescription>
              </div>
              <StatusBadge status={report.status} />
            </div>
          </CardHeader>
          <CardContent>
            {report.images && report.images.length > 0 && (
              <div className="mb-3 rounded-lg overflow-hidden">
                <img
                  src={getImageUrl(report.images[0] || '')}
                  alt={report.title}
                  className="w-full h-32 object-cover"
                />
              </div>
            )}
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{report.description}</p>
            {report.urgencyPercentage !== undefined && report.urgencyPercentage > 0 && (
              <div className="mb-3 p-2 rounded-lg bg-accent/50 border">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Tingkat Urgensi
                  </span>
                  <span className="text-xs font-bold">{report.urgencyPercentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
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
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DisasterTypeBadge type={report.type} />
                <RiskLevelBadge level={report.riskLevel} />
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {new Date(report.createdAt).toLocaleDateString('id-ID')}
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            {report.title}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={report.status} />
            <DisasterTypeBadge type={report.type} />
            <RiskLevelBadge level={report.riskLevel} />
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
              <div className="grid grid-cols-2 gap-2">
                {report.images.map((image, idx) => (
                  <div key={idx} className="rounded-lg overflow-hidden border">
                    <img
                      src={getImageUrl(image)}
                      alt={`${report.title} - Foto ${idx + 1}`}
                      className="w-full h-32 object-cover hover:scale-105 transition-transform cursor-pointer"
                      onClick={() => window.open(getImageUrl(image), '_blank')}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-4 text-sm">
            <div>
              <p className="font-medium text-muted-foreground">Lokasi</p>
              <p className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {report.location.address}, {report.location.district}
              </p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Deskripsi</p>
              <p>{report.description}</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Dilaporkan oleh</p>
              <p>{report.reportedBy.name}</p>
            </div>
            {report.handledBy && (
              <div>
                <p className="font-medium text-muted-foreground">Ditangani oleh</p>
                <p className="flex items-center gap-1">
                  <Shield className="h-4 w-4 text-primary" />
                  {report.handledBy}
                </p>
              </div>
            )}
            {report.notes && (
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <p className="font-medium text-muted-foreground mb-1">Catatan Penanganan</p>
                <p>{report.notes}</p>
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

          <CommentSection reportId={report.id} reportType="disaster" />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function RoadReportCard({ report }: { report: RoadReport }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Card className="cursor-pointer hover:shadow-md transition-all hover:border-primary/50">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <CardTitle className="text-base line-clamp-1">{report.title}</CardTitle>
                <CardDescription className="flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3" />
                  {report.location.district}
                </CardDescription>
              </div>
              <StatusBadge status={report.status} />
            </div>
          </CardHeader>
          <CardContent>
            {report.images && report.images.length > 0 && (
              <div className="mb-3 rounded-lg overflow-hidden">
                <img
                  src={getImageUrl(report.images[0] || '')}
                  alt={report.title}
                  className="w-full h-32 object-cover"
                />
              </div>
            )}
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{report.description}</p>
            {report.urgencyPercentage !== undefined && report.urgencyPercentage > 0 && (
              <div className="mb-3 p-2 rounded-lg bg-accent/50 border">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Tingkat Urgensi
                  </span>
                  <span className="text-xs font-bold">{report.urgencyPercentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
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
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RoadIssueTypeBadge type={report.type} />
                <DangerLevelBadge level={report.dangerLevel} />
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {new Date(report.createdAt).toLocaleDateString('id-ID')}
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Construction className="h-5 w-5 text-emergency-warning" />
            {report.title}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={report.status} />
            <RoadIssueTypeBadge type={report.type} />
            <DangerLevelBadge level={report.dangerLevel} />
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
              <div className="grid grid-cols-2 gap-2">
                {report.images.map((image, idx) => (
                  <div key={idx} className="rounded-lg overflow-hidden border">
                    <img
                      src={getImageUrl(image)}
                      alt={`${report.title} - Foto ${idx + 1}`}
                      className="w-full h-32 object-cover hover:scale-105 transition-transform cursor-pointer"
                      onClick={() => window.open(getImageUrl(image), '_blank')}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-4 text-sm">
            <div>
              <p className="font-medium text-muted-foreground">Lokasi</p>
              <p className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {report.location.address}, {report.location.district}
              </p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Deskripsi</p>
              <p>{report.description}</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Dilaporkan oleh</p>
              <p>{report.reportedBy.name}</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Dibuat: {new Date(report.createdAt).toLocaleString('id-ID')}
              </span>
              <span>Update: {new Date(report.updatedAt).toLocaleString('id-ID')}</span>
            </div>
          </div>

          <CommentSection reportId={report.id} reportType="road" />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function PublicReports() {
  const [disasterReports, setDisasterReports] = useState<DisasterReport[]>([]);
  const [roadReports, setRoadReports] = useState<RoadReport[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch reports from API
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setIsLoading(true);

        // 🔎 debug URL
        console.log('DISASTER URL:', API_ENDPOINTS?.reports?.disaster?.list);
        console.log('ROAD URL:', API_ENDPOINTS?.reports?.road?.list);

        // ✅ fetch paralel
        const [disasterResponse, roadResponse] = await Promise.all([
          fetch(API_ENDPOINTS.reports.disaster.list, { cache: 'no-store' }),
          fetch(API_ENDPOINTS.reports.road.list, { cache: 'no-store' }),
        ]);

        if (!disasterResponse.ok || !roadResponse.ok) {
          throw new Error(
            `API error: disaster=${disasterResponse.status} road=${roadResponse.status}`
          );
        }

        const [disasterResult, roadResult] = await Promise.all([
          disasterResponse.json(),
          roadResponse.json(),
        ]);

        const disasterData: DisasterReport[] = (disasterResult?.data ?? []).map((report: any) => ({
          id: report.id,
          type: report.type,
          title: report.title,
          description: report.description,
          location: {
            address: report.address,
            lat: report.lat,
            lng: report.lng,
            district: report.district,
          },
          images: report.images || [],
          status: report.status,
          riskLevel: report.riskLevel,
          urgencyPercentage: report.urgencyPercentage ?? undefined,
          aiAnalysis:
            report.urgencyPercentage && report.urgencyPercentage > 0
              ? {
                  detectedIssues: [`Tingkat urgensi: ${report.urgencyPercentage.toFixed(1)}%`],
                  confidence: 0.85, // Default confidence
                  recommendedAction:
                    report.urgencyPercentage >= 80
                      ? 'Segera lakukan penanganan darurat'
                      : report.urgencyPercentage >= 60
                        ? 'Perlu penanganan segera'
                        : report.urgencyPercentage >= 40
                          ? 'Perlu perhatian dan monitoring'
                          : 'Monitor kondisi',
                }
              : undefined,
          reportedBy: report.reportedBy
            ? {
                id: report.reportedBy.id,
                name: report.reportedBy.name,
                phone: report.reportedBy.phone,
              }
            : {
                id: 'anonymous',
                name: report.reporterName || 'Anonim',
                phone: report.reporterPhone,
              },
          createdAt: report.createdAt,
          updatedAt: report.updatedAt,
          handledBy: report.handledBy,
          notes: report.notes,
        }));

        const roadData: RoadReport[] = (roadResult?.data ?? []).map((report: any) => ({
          id: report.id,
          type: report.type,
          title: report.title,
          description: report.description,
          location: {
            address: report.address,
            lat: report.lat,
            lng: report.lng,
            district: report.district,
          },
          images: report.images || [],
          status: report.status,
          dangerLevel: report.dangerLevel,
          urgencyPercentage: report.urgencyPercentage ?? undefined,
          aiAnalysis:
            report.aiDetectedIssues && report.aiDetectedIssues.length > 0
              ? {
                  detectedIssues: report.aiDetectedIssues,
                  confidence: report.aiConfidence || 0.85,
                  recommendedAction: report.aiRecommendedAction || 'Perlu analisis lebih lanjut',
                }
              : undefined,
          reportedBy: report.reportedBy
            ? {
                id: report.reportedBy.id,
                name: report.reportedBy.name,
                phone: report.reportedBy.phone,
              }
            : {
                id: 'anonymous',
                name: report.reporterName || 'Anonim',
                phone: report.reporterPhone,
              },
          createdAt: report.createdAt,
          updatedAt: report.updatedAt,
        }));

        setDisasterReports(disasterData);
        setRoadReports(roadData);
      } catch (error) {
        console.error('Error fetching reports:', error);

        // ✅ fallback ke mock supaya UI tetap tampil
        setDisasterReports(mockDisasterReports);
        setRoadReports(mockRoadReports);

        toast.error('API tidak bisa diakses');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [toast]);

  const filterReports = <T extends DisasterReport | RoadReport>(reports: T[]): T[] => {
    return reports.filter((report) => {
      const matchesSearch =
        report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.location.district.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || report.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  };

  const filteredDisasterReports = filterReports(disasterReports);
  const filteredRoadReports = filterReports(roadReports);

  return (
    <div>
      <div className="container py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Laporan <span className="text-primary">Publik</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Lihat semua laporan bencana dan infrastruktur dari warga. Pantau status penanganan dan
            berikan komentar untuk ikut memantau progres.
          </p>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari laporan berdasarkan judul, deskripsi, atau lokasi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex gap-2 flex-wrap">
                {['all', 'pending', 'verified', 'in_progress', 'resolved'].map((status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter(status)}
                  >
                    {status === 'all'
                      ? 'Semua'
                      : status === 'pending'
                        ? 'Menunggu'
                        : status === 'verified'
                          ? 'Terverifikasi'
                          : status === 'in_progress'
                            ? 'Proses'
                            : 'Selesai'}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reports Tabs */}
        <Tabs defaultValue="disaster" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="disaster" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              Laporan Bencana ({filteredDisasterReports.length})
            </TabsTrigger>
            <TabsTrigger value="road" className="gap-2">
              <Construction className="h-4 w-4" />
              Laporan Jalan ({filteredRoadReports.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="disaster">
            {isLoading ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">Memuat laporan...</p>
                </CardContent>
              </Card>
            ) : filteredDisasterReports.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Eye className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="font-semibold mb-2">Tidak Ada Laporan</h3>
                  <p className="text-muted-foreground">
                    {searchQuery || statusFilter !== 'all'
                      ? 'Tidak ditemukan laporan yang sesuai dengan filter.'
                      : 'Belum ada laporan bencana yang masuk.'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {filteredDisasterReports.map((report) => (
                  <DisasterReportCard key={report.id} report={report} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="road">
            {isLoading ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">Memuat laporan...</p>
                </CardContent>
              </Card>
            ) : filteredRoadReports.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Eye className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="font-semibold mb-2">Tidak Ada Laporan</h3>
                  <p className="text-muted-foreground">
                    {searchQuery || statusFilter !== 'all'
                      ? 'Tidak ditemukan laporan yang sesuai dengan filter.'
                      : 'Belum ada laporan jalan rusak yang masuk.'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredRoadReports.map((report) => (
                  <RoadReportCard key={report.id} report={report} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
