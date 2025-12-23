import { useState } from 'react';
import { MainLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { StatsCard, StatusBadge, DisasterTypeBadge, RiskLevelBadge, RoadIssueTypeBadge, DangerLevelBadge } from '@/components/shared';
import { getDisasterReports, getRoadReports, updateDisasterReport, mockDashboardStats } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  MapPin, 
  Activity,
  Flame,
  Droplets,
  TreePine,
  Construction,
  User,
  Calendar,
} from 'lucide-react';
import { ReportStatus, DisasterType, RoadIssueType, RoadReport } from '@/types';

export default function AdminDashboard() {
  const { isGovernment } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [disasterReports, setDisasterReports] = useState(getDisasterReports());
  const [roadReports, setRoadReports] = useState(getRoadReports());
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [disasterTypeFilter, setDisasterTypeFilter] = useState<string>('all');
  const [roadTypeFilter, setRoadTypeFilter] = useState<string>('all');

  if (!isGovernment) { navigate('/login'); return null; }

  // Filter disaster reports
  const filteredDisasterReports = disasterReports.filter(r => {
    const statusMatch = statusFilter === 'all' || r.status === statusFilter;
    const typeMatch = disasterTypeFilter === 'all' || r.type === disasterTypeFilter;
    return statusMatch && typeMatch;
  });

  // Filter road reports
  const filteredRoadReports = roadReports.filter(r => {
    const statusMatch = statusFilter === 'all' || r.status === statusFilter;
    const typeMatch = roadTypeFilter === 'all' || r.type === roadTypeFilter;
    return statusMatch && typeMatch;
  });

  const handleDisasterStatusChange = (id: string, status: ReportStatus) => {
    updateDisasterReport(id, { status });
    setDisasterReports(getDisasterReports());
    toast({ title: 'Status diperbarui', description: `Laporan bencana telah diubah ke ${status}` });
  };

  const handleRoadStatusChange = (id: string, status: ReportStatus) => {
    const reports = getRoadReports();
    const index = reports.findIndex((r: RoadReport) => r.id === id);
    if (index !== -1) {
      reports[index] = { ...reports[index], status, updatedAt: new Date().toISOString() };
      localStorage.setItem('road_reports', JSON.stringify(reports));
      setRoadReports([...reports]);
    }
    toast({ title: 'Status diperbarui', description: `Laporan jalan telah diubah ke ${status}` });
  };

  // Count by disaster type
  const disasterCounts = {
    flood: disasterReports.filter(r => r.type === 'flood').length,
    fire: disasterReports.filter(r => r.type === 'fire').length,
    landslide: disasterReports.filter(r => r.type === 'landslide').length,
    fallen_tree: disasterReports.filter(r => r.type === 'fallen_tree').length,
    other: disasterReports.filter(r => r.type === 'other').length,
  };

  // Count by road damage type
  const roadCounts = {
    pothole: roadReports.filter(r => r.type === 'pothole').length,
    crack: roadReports.filter(r => r.type === 'crack').length,
    landslide: roadReports.filter(r => r.type === 'landslide').length,
    bridge_damage: roadReports.filter(r => r.type === 'bridge_damage').length,
    flooding: roadReports.filter(r => r.type === 'flooding').length,
  };

  const getDisasterIcon = (type: DisasterType) => {
    switch (type) {
      case 'flood': return Droplets;
      case 'fire': return Flame;
      case 'landslide': return TreePine;
      case 'fallen_tree': return TreePine;
      default: return AlertTriangle;
    }
  };

  return (
    <MainLayout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard Admin</h1>
          <p className="text-muted-foreground">Kelola semua laporan bencana dan infrastruktur</p>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <StatsCard title="Total Laporan" value={mockDashboardStats.totalReports} icon={FileText} />
          <StatsCard title="Menunggu" value={mockDashboardStats.pendingReports} icon={Clock} variant="warning" />
          <StatsCard title="Ditangani" value={mockDashboardStats.inProgressReports} icon={Activity} variant="info" />
          <StatsCard title="Selesai" value={mockDashboardStats.resolvedReports} icon={CheckCircle} variant="success" />
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="disaster" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-flex">
            <TabsTrigger value="disaster" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              Laporan Bencana
            </TabsTrigger>
            <TabsTrigger value="road" className="gap-2">
              <Construction className="h-4 w-4" />
              Laporan Jalan
            </TabsTrigger>
          </TabsList>

          {/* Disaster Reports Tab */}
          <TabsContent value="disaster" className="space-y-6">
            {/* Disaster Type Categories */}
            <div className="grid gap-4 md:grid-cols-5">
              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${disasterTypeFilter === 'all' ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setDisasterTypeFilter('all')}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <AlertTriangle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{disasterReports.length}</p>
                    <p className="text-sm text-muted-foreground">Semua</p>
                  </div>
                </CardContent>
              </Card>
              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${disasterTypeFilter === 'flood' ? 'ring-2 ring-emergency-flood' : ''}`}
                onClick={() => setDisasterTypeFilter('flood')}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emergency-flood/10">
                    <Droplets className="h-5 w-5 text-emergency-flood" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{disasterCounts.flood}</p>
                    <p className="text-sm text-muted-foreground">Banjir</p>
                  </div>
                </CardContent>
              </Card>
              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${disasterTypeFilter === 'fire' ? 'ring-2 ring-emergency-fire' : ''}`}
                onClick={() => setDisasterTypeFilter('fire')}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emergency-fire/10">
                    <Flame className="h-5 w-5 text-emergency-fire" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{disasterCounts.fire}</p>
                    <p className="text-sm text-muted-foreground">Kebakaran</p>
                  </div>
                </CardContent>
              </Card>
              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${disasterTypeFilter === 'landslide' ? 'ring-2 ring-emergency-warning' : ''}`}
                onClick={() => setDisasterTypeFilter('landslide')}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emergency-warning/10">
                    <TreePine className="h-5 w-5 text-emergency-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{disasterCounts.landslide}</p>
                    <p className="text-sm text-muted-foreground">Longsor</p>
                  </div>
                </CardContent>
              </Card>
              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${disasterTypeFilter === 'fallen_tree' ? 'ring-2 ring-orange-500' : ''}`}
                onClick={() => setDisasterTypeFilter('fallen_tree')}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-500/10">
                    <TreePine className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{disasterCounts.fallen_tree}</p>
                    <p className="text-sm text-muted-foreground">Pohon Tumbang</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Disaster Reports List */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Laporan Bencana
                  {disasterTypeFilter !== 'all' && (
                    <Badge variant="secondary" className="ml-2">
                      {disasterTypeFilter === 'flood' ? 'Banjir' : 
                       disasterTypeFilter === 'fire' ? 'Kebakaran' : 
                       disasterTypeFilter === 'landslide' ? 'Longsor' : 
                       disasterTypeFilter === 'fallen_tree' ? 'Pohon Tumbang' : 'Lainnya'}
                    </Badge>
                  )}
                </CardTitle>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40"><SelectValue placeholder="Filter Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="pending">Menunggu</SelectItem>
                    <SelectItem value="verified">Terverifikasi</SelectItem>
                    <SelectItem value="in_progress">Ditangani</SelectItem>
                    <SelectItem value="resolved">Selesai</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                {filteredDisasterReports.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Tidak ada laporan untuk filter ini</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredDisasterReports.map((report) => {
                      const Icon = getDisasterIcon(report.type);
                      return (
                        <div key={report.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="flex gap-4 flex-1">
                              {report.images?.[0] && (
                                <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                  <img src={report.images[0]} alt="" className="w-full h-full object-cover" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap gap-2 mb-2">
                                  <DisasterTypeBadge type={report.type} />
                                  <RiskLevelBadge level={report.riskLevel} />
                                  <StatusBadge status={report.status} />
                                </div>
                                <h3 className="font-semibold">{report.title}</h3>
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{report.description}</p>
                                <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    {report.location.address}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <User className="h-4 w-4" />
                                    {report.reportedBy.name}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    {new Date(report.createdAt).toLocaleDateString('id-ID')}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <Select value={report.status} onValueChange={(v) => handleDisasterStatusChange(report.id, v as ReportStatus)}>
                              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Menunggu</SelectItem>
                                <SelectItem value="verified">Terverifikasi</SelectItem>
                                <SelectItem value="in_progress">Ditangani</SelectItem>
                                <SelectItem value="resolved">Selesai</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Road Reports Tab */}
          <TabsContent value="road" className="space-y-6">
            {/* Road Damage Categories */}
            <div className="grid gap-4 md:grid-cols-5">
              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${roadTypeFilter === 'all' ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setRoadTypeFilter('all')}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Construction className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{roadReports.length}</p>
                    <p className="text-sm text-muted-foreground">Semua</p>
                  </div>
                </CardContent>
              </Card>
              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${roadTypeFilter === 'pothole' ? 'ring-2 ring-emergency-warning' : ''}`}
                onClick={() => setRoadTypeFilter('pothole')}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emergency-warning/10">
                    <Construction className="h-5 w-5 text-emergency-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{roadCounts.pothole}</p>
                    <p className="text-sm text-muted-foreground">Berlubang</p>
                  </div>
                </CardContent>
              </Card>
              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${roadTypeFilter === 'crack' ? 'ring-2 ring-orange-500' : ''}`}
                onClick={() => setRoadTypeFilter('crack')}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-500/10">
                    <Construction className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{roadCounts.crack}</p>
                    <p className="text-sm text-muted-foreground">Retak</p>
                  </div>
                </CardContent>
              </Card>
              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${roadTypeFilter === 'landslide' ? 'ring-2 ring-emergency-fire' : ''}`}
                onClick={() => setRoadTypeFilter('landslide')}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emergency-fire/10">
                    <TreePine className="h-5 w-5 text-emergency-fire" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{roadCounts.landslide}</p>
                    <p className="text-sm text-muted-foreground">Longsor</p>
                  </div>
                </CardContent>
              </Card>
              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${roadTypeFilter === 'bridge_damage' ? 'ring-2 ring-destructive' : ''}`}
                onClick={() => setRoadTypeFilter('bridge_damage')}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-destructive/10">
                    <Construction className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{roadCounts.bridge_damage}</p>
                    <p className="text-sm text-muted-foreground">Jembatan</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Road Reports List */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Construction className="h-5 w-5" />
                  Laporan Jalan Rusak
                  {roadTypeFilter !== 'all' && (
                    <Badge variant="secondary" className="ml-2">
                      {roadTypeFilter === 'pothole' ? 'Berlubang' : 
                       roadTypeFilter === 'crack' ? 'Retak' : 
                       roadTypeFilter === 'landslide' ? 'Longsor' : 
                       roadTypeFilter === 'bridge_damage' ? 'Kerusakan Jembatan' : 
                       roadTypeFilter === 'flooding' ? 'Tergenang' : 'Lainnya'}
                    </Badge>
                  )}
                </CardTitle>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40"><SelectValue placeholder="Filter Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="pending">Menunggu</SelectItem>
                    <SelectItem value="verified">Terverifikasi</SelectItem>
                    <SelectItem value="in_progress">Ditangani</SelectItem>
                    <SelectItem value="resolved">Selesai</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                {filteredRoadReports.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Construction className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Tidak ada laporan untuk filter ini</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredRoadReports.map((report) => (
                      <div key={report.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="flex gap-4 flex-1">
                            {report.images?.[0] && (
                              <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                <img src={report.images[0]} alt="" className="w-full h-full object-cover" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap gap-2 mb-2">
                                <RoadIssueTypeBadge type={report.type} />
                                <DangerLevelBadge level={report.dangerLevel} />
                                <StatusBadge status={report.status} />
                              </div>
                              <h3 className="font-semibold">{report.title}</h3>
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{report.description}</p>
                              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {report.location.address}
                                </span>
                                <span className="flex items-center gap-1">
                                  <User className="h-4 w-4" />
                                  {report.reportedBy.name}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {new Date(report.createdAt).toLocaleDateString('id-ID')}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Select value={report.status} onValueChange={(v) => handleRoadStatusChange(report.id, v as ReportStatus)}>
                            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Menunggu</SelectItem>
                              <SelectItem value="verified">Terverifikasi</SelectItem>
                              <SelectItem value="in_progress">Ditangani</SelectItem>
                              <SelectItem value="resolved">Selesai</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
