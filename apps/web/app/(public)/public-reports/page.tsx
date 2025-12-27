'use client';
import {
  DangerLevelBadge,
  DisasterTypeBadge,
  MapEmbed,
  RiskLevelBadge,
  RoadIssueTypeBadge,
  StatusBadge,
} from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { getComments, mockDisasterReports, mockRoadReports, saveComment } from '@/data/mockData';
import { API_ENDPOINTS, getImageUrl } from '@/lib/api/config';
import { DisasterReport, ReportComment, RoadReport } from '@/types';
import {
  AlertTriangle,
  Clock,
  Construction,
  Eye,
  Filter,
  MapPin,
  MessageCircle,
  Search,
  Send,
  Shield,
  TrendingUp,
  User,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
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
                  {comment.author.role === 'admin' ? (
                    <Shield className="h-4 w-4 text-primary" />
                  ) : (
                    <User className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium flex items-center gap-2">
                    {comment.author.name}
                    {comment.author.role === 'admin' && (
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
  const router = useRouter();

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-all hover:border-primary/50 h-full flex flex-col"
      onClick={() => router.push(`/public-reports/disaster/${report.id}`)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base line-clamp-2">{report.title}</CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{report.location.district}</span>
            </CardDescription>
          </div>
          <StatusBadge status={report.status} />
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {report.images && report.images.length > 0 && (
          <div className="mb-3 rounded-lg overflow-hidden">
            <img
              src={getImageUrl(report.images[0] || '')}
              alt={report.title}
              className="w-full h-32 object-cover"
            />
          </div>
        )}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-1">
          {report.description}
        </p>
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
        <div className="flex items-center justify-between flex-wrap gap-2 mt-auto">
          <div className="flex items-center gap-2 flex-wrap">
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
  );
}

function RoadReportCard({ report }: { report: RoadReport }) {
  const router = useRouter();

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-all hover:border-primary/50 h-full flex flex-col"
      onClick={() => router.push(`/public-reports/road/${report.id}`)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base line-clamp-2">{report.title}</CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{report.location.district}</span>
            </CardDescription>
          </div>
          <StatusBadge status={report.status} />
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {report.images && report.images.length > 0 && (
          <div className="mb-3 rounded-lg overflow-hidden">
            <img
              src={getImageUrl(report.images[0] || '')}
              alt={report.title}
              className="w-full h-32 object-cover"
            />
          </div>
        )}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-1">
          {report.description}
        </p>
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
        <div className="flex items-center justify-between flex-wrap gap-2 mt-auto">
          <div className="flex items-center gap-2 flex-wrap">
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
  );
}

const ITEMS_PER_PAGE = 12;

export default function PublicReports() {
  const [disasterReports, setDisasterReports] = useState<DisasterReport[]>([]);
  const [roadReports, setRoadReports] = useState<RoadReport[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [disasterTypeFilter, setDisasterTypeFilter] = useState<string>('all');
  const [districtFilter, setDistrictFilter] = useState<string>('all');
  const [riskLevelFilter, setRiskLevelFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Pagination states
  const [disasterPage, setDisasterPage] = useState(1);
  const [roadPage, setRoadPage] = useState(1);

  // Fetch reports from API
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setIsLoading(true);

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
                  confidence: 0.85,
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
        setDisasterReports(mockDisasterReports);
        setRoadReports(mockRoadReports);
        toast.error('API tidak bisa diakses');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, []);

  const filterReports = <T extends DisasterReport | RoadReport>(reports: T[]): T[] => {
    return reports.filter((report) => {
      const matchesSearch =
        report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.location.district.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || report.status === statusFilter;

      const matchesType =
        disasterTypeFilter === 'all' || (report as DisasterReport).type === disasterTypeFilter;

      const matchesDistrict =
        districtFilter === 'all' || report.location.district === districtFilter;

      const matchesRiskLevel =
        riskLevelFilter === 'all' || (report as DisasterReport).riskLevel === riskLevelFilter;

      return matchesSearch && matchesStatus && matchesType && matchesDistrict && matchesRiskLevel;
    });
  };

  const uniqueDistricts = useMemo(
    () =>
      Array.from(
        new Set([
          ...disasterReports.map((r) => r.location.district),
          ...roadReports.map((r) => r.location.district),
        ])
      ).sort(),
    [disasterReports, roadReports]
  );

  const filteredDisasterReports = useMemo(
    () => filterReports(disasterReports),
    [
      disasterReports,
      searchQuery,
      statusFilter,
      disasterTypeFilter,
      districtFilter,
      riskLevelFilter,
    ]
  );

  const filteredRoadReports = useMemo(
    () => filterReports(roadReports),
    [roadReports, searchQuery, statusFilter, disasterTypeFilter, districtFilter, riskLevelFilter]
  );

  // Pagination calculations
  const disasterPagination = useMemo(() => {
    const total = filteredDisasterReports.length;
    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
    const startIndex = (disasterPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedReports = filteredDisasterReports.slice(startIndex, endIndex);

    return {
      total,
      totalPages,
      hasNext: disasterPage < totalPages,
      hasPrev: disasterPage > 1,
      paginatedReports,
    };
  }, [filteredDisasterReports, disasterPage]);

  const roadPagination = useMemo(() => {
    const total = filteredRoadReports.length;
    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
    const startIndex = (roadPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedReports = filteredRoadReports.slice(startIndex, endIndex);

    return {
      total,
      totalPages,
      hasNext: roadPage < totalPages,
      hasPrev: roadPage > 1,
      paginatedReports,
    };
  }, [filteredRoadReports, roadPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setDisasterPage(1);
    setRoadPage(1);
  }, [searchQuery, statusFilter, disasterTypeFilter, districtFilter, riskLevelFilter]);

  const hasActiveFilters =
    statusFilter !== 'all' ||
    disasterTypeFilter !== 'all' ||
    districtFilter !== 'all' ||
    riskLevelFilter !== 'all' ||
    searchQuery !== '';

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setDisasterTypeFilter('all');
    setDistrictFilter('all');
    setRiskLevelFilter('all');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-4 md:py-8 space-y-6 md:space-y-8">
        {/* Header */}
        <div className="text-center space-y-2 md:space-y-4">
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight">
            Laporan <span className="text-primary">Publik</span>
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto px-4">
            Lihat semua laporan bencana dan infrastruktur dari warga. Pantau status penanganan dan
            berikan komentar untuk ikut memantau progres.
          </p>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="pt-4 md:pt-6 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari laporan berdasarkan judul, deskripsi, atau lokasi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter Toggle Button (Mobile) */}
            <div className="flex items-center justify-between md:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="w-full"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-2">
                    {
                      [
                        statusFilter !== 'all',
                        disasterTypeFilter !== 'all',
                        districtFilter !== 'all',
                        riskLevelFilter !== 'all',
                        searchQuery !== '',
                      ].filter(Boolean).length
                    }
                  </Badge>
                )}
              </Button>
            </div>

            {/* Filters */}
            <div className={`space-y-4 ${showFilters ? 'block' : 'hidden md:block'}`}>
              {/* Status Filter */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Status</label>
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="h-auto p-1 text-xs"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Reset
                    </Button>
                  )}
                </div>
                <div className="flex gap-2 flex-wrap">
                  {['all', 'pending', 'verified', 'in_progress', 'resolved'].map((status) => (
                    <Button
                      key={status}
                      variant={statusFilter === status ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStatusFilter(status)}
                      className="text-xs"
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

              {/* Other Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Jenis Bencana</label>
                  <Select value={disasterTypeFilter} onValueChange={setDisasterTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Semua Jenis" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Jenis</SelectItem>
                      <SelectItem value="flood">Banjir</SelectItem>
                      <SelectItem value="fire">Kebakaran</SelectItem>
                      <SelectItem value="landslide">Longsor</SelectItem>
                      <SelectItem value="fallen_tree">Pohon Tumbang</SelectItem>
                      <SelectItem value="earthquake">Gempa Bumi</SelectItem>
                      <SelectItem value="other">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Kecamatan</label>
                  <Select value={districtFilter} onValueChange={setDistrictFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Semua Kecamatan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Kecamatan</SelectItem>
                      {uniqueDistricts.map((district) => (
                        <SelectItem key={district} value={district}>
                          {district}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Tingkat Risiko</label>
                  <Select value={riskLevelFilter} onValueChange={setRiskLevelFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Semua Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Level</SelectItem>
                      <SelectItem value="low">Rendah</SelectItem>
                      <SelectItem value="medium">Sedang</SelectItem>
                      <SelectItem value="high">Tinggi</SelectItem>
                      <SelectItem value="critical">Kritis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Hasil Filter</label>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-muted">
                    <span className="text-sm">
                      {disasterPagination.total + roadPagination.total} laporan
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Map Overview */}
        {(disasterPagination.paginatedReports.length > 0 ||
          roadPagination.paginatedReports.length > 0) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <MapPin className="h-4 w-4 md:h-5 md:w-5" />
                Peta Lokasi Laporan
              </CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Peta lokasi laporan terbaru
              </CardDescription>
            </CardHeader>
            <CardContent>
              {disasterPagination.paginatedReports.length > 0 &&
              disasterPagination.paginatedReports[0] ? (
                <MapEmbed
                  lat={disasterPagination.paginatedReports[0].location.lat}
                  lng={disasterPagination.paginatedReports[0].location.lng}
                  address={disasterPagination.paginatedReports[0].location.address}
                  title={disasterPagination.paginatedReports[0].title}
                  height="300px"
                  className="rounded-lg"
                />
              ) : roadPagination.paginatedReports.length > 0 &&
                roadPagination.paginatedReports[0] ? (
                <MapEmbed
                  lat={roadPagination.paginatedReports[0].location.lat}
                  lng={roadPagination.paginatedReports[0].location.lng}
                  address={roadPagination.paginatedReports[0].location.address}
                  title={roadPagination.paginatedReports[0].title}
                  height="300px"
                  className="rounded-lg"
                />
              ) : null}
            </CardContent>
          </Card>
        )}

        {/* Reports Tabs */}
        <Tabs defaultValue="disaster" className="space-y-4 md:space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="disaster" className="gap-1 md:gap-2 text-sm md:text-base">
              <AlertTriangle className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Laporan Bencana</span>
              <span className="sm:hidden">Bencana</span>
              <Badge variant="secondary" className="ml-1 md:ml-2">
                {disasterPagination.total}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="road" className="gap-1 md:gap-2 text-sm md:text-base">
              <Construction className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Laporan Jalan</span>
              <span className="sm:hidden">Jalan</span>
              <Badge variant="secondary" className="ml-1 md:ml-2">
                {roadPagination.total}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="disaster" className="space-y-4">
            {isLoading ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">Memuat laporan...</p>
                </CardContent>
              </Card>
            ) : disasterPagination.paginatedReports.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Eye className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="font-semibold mb-2">Tidak Ada Laporan</h3>
                  <p className="text-muted-foreground text-sm">
                    {hasActiveFilters
                      ? 'Tidak ditemukan laporan yang sesuai dengan filter.'
                      : 'Belum ada laporan bencana yang masuk.'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {disasterPagination.paginatedReports.map((report) => (
                    <DisasterReportCard key={report.id} report={report} />
                  ))}
                </div>

                {/* Pagination */}
                {disasterPagination.totalPages > 1 && (
                  <div className="mt-6">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (disasterPagination.hasPrev) {
                                setDisasterPage(disasterPage - 1);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }
                            }}
                            className={
                              !disasterPagination.hasPrev ? 'pointer-events-none opacity-50' : ''
                            }
                          />
                        </PaginationItem>
                        {Array.from({ length: disasterPagination.totalPages }, (_, i) => i + 1)
                          .filter((page) => {
                            const current = disasterPage;
                            return (
                              page === 1 ||
                              page === disasterPagination.totalPages ||
                              (page >= current - 1 && page <= current + 1)
                            );
                          })
                          .map((page, index, array) => (
                            <React.Fragment key={page}>
                              {index > 0 && array[index - 1] !== page - 1 && <PaginationEllipsis />}
                              <PaginationItem>
                                <PaginationLink
                                  href="#"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setDisasterPage(page);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                  }}
                                  isActive={disasterPage === page}
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            </React.Fragment>
                          ))}
                        <PaginationItem>
                          <PaginationNext
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (disasterPagination.hasNext) {
                                setDisasterPage(disasterPage + 1);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }
                            }}
                            className={
                              !disasterPagination.hasNext ? 'pointer-events-none opacity-50' : ''
                            }
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="road" className="space-y-4">
            {isLoading ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">Memuat laporan...</p>
                </CardContent>
              </Card>
            ) : roadPagination.paginatedReports.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Eye className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="font-semibold mb-2">Tidak Ada Laporan</h3>
                  <p className="text-muted-foreground text-sm">
                    {hasActiveFilters
                      ? 'Tidak ditemukan laporan yang sesuai dengan filter.'
                      : 'Belum ada laporan jalan rusak yang masuk.'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {roadPagination.paginatedReports.map((report) => (
                    <RoadReportCard key={report.id} report={report} />
                  ))}
                </div>

                {/* Pagination */}
                {roadPagination.totalPages > 1 && (
                  <div className="mt-6">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (roadPagination.hasPrev) {
                                setRoadPage(roadPage - 1);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }
                            }}
                            className={
                              !roadPagination.hasPrev ? 'pointer-events-none opacity-50' : ''
                            }
                          />
                        </PaginationItem>
                        {Array.from({ length: roadPagination.totalPages }, (_, i) => i + 1)
                          .filter((page) => {
                            const current = roadPage;
                            return (
                              page === 1 ||
                              page === roadPagination.totalPages ||
                              (page >= current - 1 && page <= current + 1)
                            );
                          })
                          .map((page, index, array) => (
                            <React.Fragment key={page}>
                              {index > 0 && array[index - 1] !== page - 1 && <PaginationEllipsis />}
                              <PaginationItem>
                                <PaginationLink
                                  href="#"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setRoadPage(page);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                  }}
                                  isActive={roadPage === page}
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            </React.Fragment>
                          ))}
                        <PaginationItem>
                          <PaginationNext
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (roadPagination.hasNext) {
                                setRoadPage(roadPage + 1);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }
                            }}
                            className={
                              !roadPagination.hasNext ? 'pointer-events-none opacity-50' : ''
                            }
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
