import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { saveRoadReport } from '@/data/mockData';
import { RoadIssueType, DangerLevel } from '@/types';
import { Construction, Upload, Brain } from 'lucide-react';

export default function ReportRoad() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ type: '' as RoadIssueType, title: '', description: '', address: '', district: '' });

  if (!isAuthenticated) { navigate('/login'); return null; }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const dangerLevels: DangerLevel[] = ['minor', 'moderate', 'severe'];
    const randomDanger = dangerLevels[Math.floor(Math.random() * dangerLevels.length)];
    
    const report = {
      id: `road-${Date.now()}`,
      type: formData.type,
      title: formData.title,
      description: formData.description,
      location: { address: formData.address, lat: -6.2, lng: 106.8, district: formData.district },
      images: [],
      status: 'pending' as const,
      dangerLevel: randomDanger,
      aiAnalysis: {
        detectedIssues: ['Kerusakan terdeteksi', 'Perlu perbaikan'],
        confidence: 0.85 + Math.random() * 0.1,
        recommendedAction: randomDanger === 'severe' ? 'Perbaikan segera dalam 24 jam' : 'Penambalan dalam 7 hari',
      },
      reportedBy: { id: user!.id, name: user!.name, phone: user!.phone },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    saveRoadReport(report);
    toast({ title: 'Laporan terkirim!', description: 'Analisis AI telah dilakukan pada laporan Anda.' });
    navigate('/my-reports');
    setIsLoading(false);
  };

  return (
    <MainLayout>
      <div className="container py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                <Construction className="h-6 w-6 text-success" />
              </div>
              <div>
                <CardTitle>Lapor Jalan Rusak</CardTitle>
                <p className="text-sm text-muted-foreground">Dengan klasifikasi AI untuk prioritas perbaikan</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6 p-4 bg-info/10 rounded-lg flex items-center gap-3">
              <Brain className="h-5 w-5 text-info" />
              <p className="text-sm">Foto akan dianalisis menggunakan Deep Learning untuk klasifikasi tingkat bahaya</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Jenis Kerusakan</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as RoadIssueType })} required>
                  <SelectTrigger><SelectValue placeholder="Pilih jenis kerusakan" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pothole">Jalan Berlubang</SelectItem>
                    <SelectItem value="landslide">Jalan Longsor</SelectItem>
                    <SelectItem value="bridge_damage">Jembatan Rusak</SelectItem>
                    <SelectItem value="crack">Retakan Jalan</SelectItem>
                    <SelectItem value="flooding">Jalan Tergenang</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Judul Laporan</Label>
                <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Deskripsi</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} required />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label>Alamat</Label><Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} required /></div>
                <div className="space-y-2"><Label>Kecamatan</Label><Input value={formData.district} onChange={(e) => setFormData({ ...formData, district: e.target.value })} required /></div>
              </div>
              <div className="space-y-2">
                <Label>Foto Kerusakan</Label>
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Upload foto untuk analisis AI (simulasi)</p>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? 'Menganalisis...' : 'Kirim & Analisis'}</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
