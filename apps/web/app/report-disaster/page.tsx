// 'use client';
// import { MainLayout } from '@/components/layout';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import { Textarea } from '@/components/ui/textarea';
// import { useAuth } from '@/contexts/AuthContext';
// import { saveDisasterReport } from '@/data/mockData';
// import { DisasterType, RiskLevel } from '@/types';
// import { AlertTriangle, Upload } from 'lucide-react';
// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { toast } from 'sonner';


// export default function ReportDisaster() {
//   const { user, isAuthenticated } = useAuth();
//   const navigate = useNavigate();
//   const [isLoading, setIsLoading] = useState(false);
//   const [formData, setFormData] = useState({
//     type: '' as DisasterType,
//     title: '',
//     description: '',
//     address: '',
//     district: '',
//   });

//   if (!isAuthenticated) {
//     navigate('/login');
//     return null;
//   }

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);

//     const report = {
//       id: `report-${Date.now()}`,
//       type: formData.type,
//       title: formData.title,
//       description: formData.description,
//       location: { address: formData.address, lat: -6.2, lng: 106.8, district: formData.district },
//       images: [],
//       status: 'pending' as const,
//       riskLevel: 'medium' as RiskLevel,
//       reportedBy: { id: user!.id, name: user!.name, phone: user!.phone },
//       createdAt: new Date().toISOString(),
//       updatedAt: new Date().toISOString(),
//     };

//     saveDisasterReport(report);
//     toast.success('Laporan Terkirim.');
//     navigate('/my-reports');
//     setIsLoading(false);
//   };

//   return (
//     <MainLayout>
//       <div className="container py-8 max-w-2xl">
//         <Card>
//           <CardHeader>
//             <div className="flex items-center gap-3">
//               <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
//                 <AlertTriangle className="h-6 w-6 text-warning" />
//               </div>
//               <div>
//                 <CardTitle>Laporkan Bencana</CardTitle>
//                 <p className="text-sm text-muted-foreground">
//                   Isi form untuk melaporkan kejadian bencana
//                 </p>
//               </div>
//             </div>
//           </CardHeader>
//           <CardContent>
//             <form onSubmit={handleSubmit} className="space-y-4">
//               <div className="space-y-2">
//                 <Label>Jenis Bencana</Label>
//                 <Select
//                   value={formData.type}
//                   onValueChange={(v) => setFormData({ ...formData, type: v as DisasterType })}
//                   required
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Pilih jenis bencana" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="flood">Banjir</SelectItem>
//                     <SelectItem value="fire">Kebakaran</SelectItem>
//                     <SelectItem value="fallen_tree">Pohon Tumbang</SelectItem>
//                     <SelectItem value="landslide">Longsor</SelectItem>
//                     <SelectItem value="earthquake">Gempa Bumi</SelectItem>
//                     <SelectItem value="other">Lainnya</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//               <div className="space-y-2">
//                 <Label>Judul Laporan</Label>
//                 <Input
//                   value={formData.title}
//                   onChange={(e) => setFormData({ ...formData, title: e.target.value })}
//                   placeholder="Contoh: Banjir di Jalan Raya Menteng"
//                   required
//                 />
//               </div>
//               <div className="space-y-2">
//                 <Label>Deskripsi</Label>
//                 <Textarea
//                   value={formData.description}
//                   onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                   placeholder="Jelaskan kondisi di lokasi..."
//                   rows={4}
//                   required
//                 />
//               </div>
//               <div className="grid gap-4 md:grid-cols-2">
//                 <div className="space-y-2">
//                   <Label>Alamat Lokasi</Label>
//                   <Input
//                     value={formData.address}
//                     onChange={(e) => setFormData({ ...formData, address: e.target.value })}
//                     placeholder="Jl. Contoh No. 123"
//                     required
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Kecamatan/Kelurahan</Label>
//                   <Input
//                     value={formData.district}
//                     onChange={(e) => setFormData({ ...formData, district: e.target.value })}
//                     placeholder="Menteng"
//                     required
//                   />
//                 </div>
//               </div>
//               <div className="space-y-2">
//                 <Label>Foto Lokasi (Opsional)</Label>
//                 <div className="border-2 border-dashed rounded-lg p-8 text-center">
//                   <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
//                   <p className="text-sm text-muted-foreground">Fitur upload foto (simulasi)</p>
//                 </div>
//               </div>
//               <Button type="submit" className="w-full" disabled={isLoading}>
//                 {isLoading ? 'Mengirim...' : 'Kirim Laporan'}
//               </Button>
//             </form>
//           </CardContent>
//         </Card>
//       </div>
//     </MainLayout>
//   );
// }

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { saveDisasterReport } from '@/data/mockData';
import { DisasterType, RiskLevel } from '@/types';
import { AlertTriangle, Upload } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function ReportDisaster() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: '' as DisasterType,
    title: '',
    description: '',
    address: '',
    district: '',
  });

  // ✅ Redirect kalau belum login (Next.js style)
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  // Hindari render form kalau belum login (biar nggak flicker)
  if (!isAuthenticated) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const report = {
        id: `report-${Date.now()}`,
        type: formData.type,
        title: formData.title,
        description: formData.description,
        location: {
          address: formData.address,
          lat: -6.2,
          lng: 106.8,
          district: formData.district,
        },
        images: [],
        status: 'pending' as const,
        riskLevel: 'medium' as RiskLevel,
        reportedBy: { id: user!.id, name: user!.name, phone: user!.phone },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      saveDisasterReport(report);
      toast.success('Laporan Terkirim.');

      // ✅ sesuaikan route kamu
      router.push('/laporan-saya'); // kalau masih pakai lama, ganti ke '/my-reports'
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-warning" />
            </div>
            <div>
              <CardTitle>Laporkan Bencana</CardTitle>
              <p className="text-sm text-muted-foreground">
                Isi form untuk melaporkan kejadian bencana
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Jenis Bencana</Label>
              <Select
                value={formData.type}
                onValueChange={(v) => setFormData({ ...formData, type: v as DisasterType })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis bencana" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flood">Banjir</SelectItem>
                  <SelectItem value="fire">Kebakaran</SelectItem>
                  <SelectItem value="fallen_tree">Pohon Tumbang</SelectItem>
                  <SelectItem value="landslide">Longsor</SelectItem>
                  <SelectItem value="earthquake">Gempa Bumi</SelectItem>
                  <SelectItem value="other">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Judul Laporan</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Contoh: Banjir di Jalan Raya Menteng"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Deskripsi</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Jelaskan kondisi di lokasi..."
                rows={4}
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Alamat Lokasi</Label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Jl. Contoh No. 123"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Kecamatan/Kelurahan</Label>
                <Input
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  placeholder="Menteng"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Foto Lokasi (Opsional)</Label>
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Fitur upload foto (simulasi)</p>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Mengirim...' : 'Kirim Laporan'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
