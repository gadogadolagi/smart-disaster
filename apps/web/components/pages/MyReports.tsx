import { MainLayout } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge, DisasterTypeBadge, RoadIssueTypeBadge, DangerLevelBadge } from '@/components/shared';
import { getDisasterReports, getRoadReports } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, FileText } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function MyReports() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) { navigate('/login'); return null; }

  const disasterReports = getDisasterReports().filter(r => r.reportedBy.id === user?.id);
  const roadReports = getRoadReports().filter(r => r.reportedBy.id === user?.id);

  return (
    <MainLayout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Laporan Saya</h1>
        
        <Tabs defaultValue="disaster">
          <TabsList className="mb-6">
            <TabsTrigger value="disaster">Bencana ({disasterReports.length})</TabsTrigger>
            <TabsTrigger value="road">Jalan Rusak ({roadReports.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="disaster">
            {disasterReports.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground"><FileText className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>Belum ada laporan bencana</p></CardContent></Card>
            ) : (
              <div className="grid gap-4">
                {disasterReports.map((report) => (
                  <Card key={report.id}>
                    <CardContent className="pt-6">
                      <div className="flex flex-wrap gap-2 mb-3">
                        <DisasterTypeBadge type={report.type} />
                        <StatusBadge status={report.status} />
                      </div>
                      <h3 className="font-semibold text-lg">{report.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{report.location.district}</span>
                        <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{new Date(report.createdAt).toLocaleDateString('id-ID')}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="road">
            {roadReports.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground"><FileText className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>Belum ada laporan jalan rusak</p></CardContent></Card>
            ) : (
              <div className="grid gap-4">
                {roadReports.map((report) => (
                  <Card key={report.id}>
                    <CardContent className="pt-6">
                      <div className="flex flex-wrap gap-2 mb-3">
                        <RoadIssueTypeBadge type={report.type} />
                        <DangerLevelBadge level={report.dangerLevel} />
                        <StatusBadge status={report.status} />
                      </div>
                      <h3 className="font-semibold text-lg">{report.title}</h3>
                      {report.aiAnalysis && (
                        <div className="mt-2 p-2 bg-info/10 rounded text-sm">
                          <span className="font-medium">AI: </span>{report.aiAnalysis.recommendedAction} (Confidence: {Math.round(report.aiAnalysis.confidence * 100)}%)
                        </div>
                      )}
                      <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{report.location.district}</span>
                        <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{new Date(report.createdAt).toLocaleDateString('id-ID')}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
