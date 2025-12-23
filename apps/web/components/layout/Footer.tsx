import { Mail, MapPin, Phone, Shield } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">Portal Bencana</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Sistem pelaporan dan monitoring bencana terintegrasi untuk keselamatan masyarakat.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold">Menu</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-foreground transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/fire-prediction" className="hover:text-foreground transition-colors">
                  Prediksi Kebakaran
                </Link>
              </li>
              <li>
                <Link href="/flood-risk" className="hover:text-foreground transition-colors">
                  Risiko Banjir
                </Link>
              </li>
              <li>
                <Link href="/report-disaster" className="hover:text-foreground transition-colors">
                  Laporkan Bencana
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold">Kontak Darurat</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>112 (Darurat)</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>113 (Pemadam Kebakaran)</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>119 (Ambulans)</span>
              </li>
            </ul>
          </div>

          {/* Address */}
          <div className="space-y-4">
            <h4 className="font-semibold">BPBD Kota</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5" />
                <span>
                  Jl. Protokol No. 1<br />
                  Jakarta 10110
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>bpbd@kota.go.id</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Portal Pelaporan Kebencanaan. Hak Cipta Dilindungi.</p>
        </div>
      </div>
    </footer>
  );
}
