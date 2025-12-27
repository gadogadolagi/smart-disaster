# UHTP Smart Disaster

Sistem cerdas untuk pelaporan dan monitoring bencana alam yang dilengkapi dengan prediksi berbasis AI untuk membantu penanganan bencana yang lebih efektif.

## 📋 Deskripsi

UHTP Smart Disaster adalah platform komprehensif yang memungkinkan masyarakat untuk melaporkan berbagai jenis bencana alam seperti banjir, kebakaran, dan kerusakan jalan. Sistem ini dilengkapi dengan fitur prediksi berbasis AI untuk membantu pemerintah dan pihak terkait dalam mengambil keputusan yang lebih cepat dan tepat dalam penanganan bencana.

### Fitur Utama

- 🚨 **Pelaporan Bencana**: Sistem pelaporan bencana yang mudah digunakan untuk berbagai jenis bencana
- 🛣️ **Pelaporan Jalan**: Pelaporan kondisi jalan dan lubang (potholes) dengan deteksi otomatis menggunakan AI
- 📊 **Monitoring Real-time**: Dashboard monitoring untuk melihat status dan perkembangan bencana
- 🔮 **Prediksi AI**:
  - Prediksi risiko banjir (Flood Risk Prediction)
  - Prediksi kebakaran (Fire Prediction)
  - Deteksi kerusakan jalan otomatis
- 👥 **Manajemen Pengguna**: Sistem autentikasi dan manajemen pengguna dengan role-based access
- 💬 **Sistem Komentar**: Fitur komentar dan diskusi pada laporan bencana
- 📝 **Assignment**: Sistem penugasan untuk menangani laporan bencana
- 📈 **Dashboard Admin**: Panel administrasi untuk mengelola seluruh sistem

## 🏗️ Arsitektur

Proyek ini menggunakan arsitektur monorepo dengan tiga aplikasi utama:

```
uhtp-smart-disaster/
├── apps/
│   ├── api/          # Backend API (NestJS)
│   ├── web/          # Frontend Web (Next.js)
│   └── service-ai/   # AI Service (Python)
└── packages/         # Shared packages & configs
```

## 🛠️ Tech Stack

### Backend API (`apps/api`)

- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: Prisma ORM
- **Authentication**: JWT-based authentication
- **File Upload**: Multer untuk handling file uploads
- **Logging**: Winston logger
- **Testing**: Jest

### Frontend Web (`apps/web`)

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **UI Library**: React
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: React Context API

### AI Service (`apps/service-ai`)

- **Language**: Python
- **ML Framework**: TensorFlow/PyTorch (untuk model deteksi)
- **API**: FastAPI/Flask (untuk service endpoint)

### Development Tools

- **Package Manager**: pnpm
- **Monorepo**: Turborepo
- **Linting**: ESLint
- **Code Formatting**: Prettier
- **TypeScript Config**: Shared TypeScript configurations

## 📦 Packages

Proyek ini menggunakan shared packages untuk konsistensi:

- `@repo/eslint-config`: Shared ESLint configurations
- `@repo/jest-config`: Shared Jest configurations
- `@repo/typescript-config`: Shared TypeScript configurations
- `@repo/ui`: Shared UI components

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 atau lebih tinggi)
- pnpm (v8 atau lebih tinggi)
- Python 3.8+ (untuk AI service)
- PostgreSQL atau database yang didukung Prisma

### Installation

1. Clone repository:

```bash
git clone <repository-url>
cd uhtp-smart-disaster
```

2. Install dependencies:

```bash
pnpm install
```

3. Setup environment variables:

```bash
# Copy .env.example files di masing-masing app
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
cp apps/service-ai/.env.example apps/service-ai/.env
```

4. Setup database:

```bash
cd apps/api
npx prisma generate
npx prisma migrate dev
```

5. Install Python dependencies (untuk AI service):

```bash
cd apps/service-ai
pip install -r requirements.txt
```

### Running the Project

#### Development Mode

Jalankan semua aplikasi secara bersamaan:

```bash
pnpm dev
```

Atau jalankan secara terpisah:

**Backend API:**

```bash
cd apps/api
pnpm dev
```

**Frontend Web:**

```bash
cd apps/web
pnpm dev
```

**AI Service:**

```bash
cd apps/service-ai
python main.py
```

#### Production Build

```bash
# Build semua aplikasi
pnpm build

# Run production
pnpm start
```

#### Production dengan PM2

Proyek ini sudah dilengkapi dengan konfigurasi PM2 untuk menjalankan semua aplikasi secara bersamaan:

```bash
# Pastikan semua aplikasi sudah di-build
pnpm build

# Pastikan virtual environment untuk service-ai sudah dibuat
cd apps/service-ai
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Jalankan semua aplikasi dengan PM2
pm2 start ecosystem.config.js

# Lihat status aplikasi
pm2 status

# Lihat logs
pm2 logs

# Stop semua aplikasi
pm2 stop all

# Restart semua aplikasi
pm2 restart all

# Hapus dari PM2
pm2 delete all
```

Aplikasi yang akan dijalankan:

- **web**: Next.js app di port 3000
- **api**: Backend API di port 3001
- **service-ai**: AI Service di port 8000

## 📁 Struktur Proyek

```
uhtp-smart-disaster/
├── apps/
│   ├── api/                    # Backend API
│   │   ├── src/
│   │   │   ├── controllers/   # Route controllers
│   │   │   ├── services/      # Business logic
│   │   │   ├── routes/        # API routes
│   │   │   ├── middleware/    # Custom middleware
│   │   │   └── utils/         # Utility functions
│   │   ├── prisma/            # Database schema & migrations
│   │   └── models/            # ML models
│   │
│   ├── web/                    # Frontend Web
│   │   ├── app/               # Next.js app directory
│   │   ├── components/        # React components
│   │   ├── contexts/          # React contexts
│   │   └── lib/               # Utility libraries
│   │
│   └── service-ai/             # AI Service
│       ├── main.py            # Main service file
│       └── train.py           # Model training script
│
└── packages/                   # Shared packages
    ├── eslint-config/         # ESLint configs
    ├── jest-config/           # Jest configs
    ├── typescript-config/      # TypeScript configs
    └── ui/                     # Shared UI components
```

## 🔌 API Endpoints

API utama tersedia di `apps/api`. Beberapa endpoint utama:

- `/api/auth` - Autentikasi pengguna
- `/api/reports` - Manajemen laporan bencana
- `/api/activities` - Tracking aktivitas
- `/api/assignments` - Sistem penugasan
- `/api/comments` - Sistem komentar
- `/api/ai-prediction` - Prediksi berbasis AI

## 🤖 AI Features

Sistem AI menyediakan:

1. **Deteksi Lubang Jalan**: Deteksi otomatis lubang di jalan menggunakan image recognition
2. **Prediksi Risiko Banjir**: Analisis data untuk memprediksi risiko banjir
3. **Prediksi Kebakaran**: Prediksi potensi kebakaran berdasarkan data historis

## 🧪 Testing

```bash
# Run tests untuk semua packages
pnpm test

# Run tests untuk specific app
cd apps/api && pnpm test
cd apps/web && pnpm test
```

## 📝 Scripts

- `pnpm dev` - Jalankan semua aplikasi dalam mode development
- `pnpm build` - Build semua aplikasi untuk production
- `pnpm lint` - Lint semua packages
- `pnpm test` - Run semua tests
- `pnpm clean` - Clean build artifacts

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

[Specify your license here]

## 👥 Authors

[Specify authors here]

## 🙏 Acknowledgments

[Any acknowledgments]
