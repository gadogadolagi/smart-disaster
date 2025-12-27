# UHTP Smart Disaster API

API server untuk sistem pelaporan bencana dan infrastruktur jalan menggunakan Express.js dan Prisma.

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- pnpm (atau npm/yarn)

### Setup

1. Install dependencies:
```bash
pnpm install
```

2. Setup environment variables:
```bash
cp .env.example .env
```

Edit `.env` dan isi variabel yang diperlukan:

**Required Variables:**
```
DATABASE_URL="postgresql://user:password@localhost:5432/uhtp_smart_disaster?schema=public"
JWT_SECRET="your-secret-key-minimum-32-characters-long"
NODE_ENV="development"
PORT="3001"
```

**CORS Configuration (Important for Production):**
```
# Opsi 1: Set specific domains (RECOMMENDED untuk production)
# Pisahkan multiple origins dengan koma
ALLOWED_ORIGINS="http://localhost:3000,https://yourdomain.com,https://www.yourdomain.com"

# Opsi 2: Allow all origins menggunakan wildcard
ALLOWED_ORIGINS="*"

# Opsi 3: Biarkan kosong (akan allow all dengan warning)
# TIDAK disarankan untuk production!
```

**AI Service Configuration:**
```
AI_SERVICE_URL="http://localhost:8000"
```

3. Setup database dengan Prisma:
```bash
# Generate Prisma Client
pnpm prisma:generate

# Run migrations
pnpm prisma:migrate
```

4. (Optional) Buka Prisma Studio untuk melihat data:
```bash
pnpm prisma:studio
```

5. Run development server:
```bash
pnpm dev
```

Server akan berjalan di [http://localhost:3001](http://localhost:3001)

## API Endpoints

### Health Check
- `GET /health` - Check API status

### Disaster Reports (Pelaporan Bencana)

#### Create Report (POST /api/reports/disaster)
Membuat laporan bencana baru **tanpa perlu login**. Mendukung upload gambar.

**Request:** `multipart/form-data`

**Fields:**
- `type` (required) - Jenis bencana: `flood`, `fire`, `fallen_tree`, `landslide`, `earthquake`, `other`
- `title` (required) - Judul laporan
- `description` (required) - Deskripsi kejadian
- `address` (required) - Alamat lengkap
- `lat` (required) - Latitude (koordinat)
- `lng` (required) - Longitude (koordinat)
- `district` (required) - Kecamatan
- `images` (optional) - File gambar (max 5 files, max 5MB per file)
- `reporterName` (optional) - Nama pelapor (jika tidak login)
- `reporterPhone` (optional) - Nomor telepon pelapor (jika tidak login)
- `reportedById` (optional) - ID user jika sudah login
- `riskLevel` (optional) - Level risiko: `low`, `medium`, `high`, `critical` (default: `medium`)

**Contoh Request (cURL):**
```bash
curl -X POST http://localhost:3001/api/reports/disaster \
  -F "type=flood" \
  -F "title=Banjir di Jalan Raya" \
  -F "description=Banjir setinggi 50cm" \
  -F "address=Jl. Raya No. 123" \
  -F "lat=-6.2088" \
  -F "lng=106.8226" \
  -F "district=Menteng" \
  -F "reporterName=Budi Santoso" \
  -F "reporterPhone=081234567890" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg"
```

**Response:**
```json
{
  "data": {
    "id": "clx...",
    "type": "flood",
    "title": "Banjir di Jalan Raya",
    "description": "Banjir setinggi 50cm",
    "address": "Jl. Raya No. 123",
    "lat": -6.2088,
    "lng": 106.8226,
    "district": "Menteng",
    "images": ["/uploads/image1-1234567890.jpg", "/uploads/image2-1234567890.jpg"],
    "status": "pending",
    "riskLevel": "medium",
    "reporterName": "Budi Santoso",
    "reporterPhone": "081234567890",
    "reportedById": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Laporan berhasil dikirim"
}
```

#### Get All Reports (GET /api/reports/disaster)
Mendapatkan semua laporan bencana dengan filter opsional.

**Query Parameters:**
- `status` (optional) - Filter by status: `pending`, `verified`, `in_progress`, `resolved`
- `riskLevel` (optional) - Filter by risk level: `low`, `medium`, `high`, `critical`
- `district` (optional) - Filter by kecamatan (case-insensitive search)

**Contoh:**
```bash
GET /api/reports/disaster?status=pending&district=Menteng
```

#### Get Single Report (GET /api/reports/disaster/:id)
Mendapatkan detail laporan bencana berdasarkan ID.

#### Update Report (PUT /api/reports/disaster/:id)
Update status atau informasi laporan.

**Body (JSON):**
```json
{
  "status": "verified",
  "riskLevel": "high",
  "handledBy": "Tim BPBD",
  "notes": "Sudah ditangani"
}
```

#### Delete Report (DELETE /api/reports/disaster/:id)
Menghapus laporan bencana.

### Road Reports (Pelaporan Jalan)
- `GET /api/reports/road` - Get all road reports (query: status, dangerLevel, district)
- `GET /api/reports/road/:id` - Get single road report
- `POST /api/reports/road` - Create new road report
- `PUT /api/reports/road/:id` - Update road report
- `DELETE /api/reports/road/:id` - Delete road report

## File Upload

Gambar yang diupload akan disimpan di folder `uploads/` dan dapat diakses melalui:
```
http://localhost:3001/uploads/filename.jpg
```

**Spesifikasi Upload:**
- Format yang didukung: JPEG, JPG, PNG, WebP, GIF
- Maksimal ukuran file: 5MB per file
- Maksimal jumlah file: 5 file per request
- File akan disimpan dengan nama unik: `originalname-timestamp-random.ext`

## Database Schema

Database menggunakan Prisma dengan model:
- `User` - Pengguna sistem
- `DisasterReport` - Laporan bencana (mendukung anonymous reports)
- `RoadReport` - Laporan infrastruktur jalan (mendukung anonymous reports)
- `Comment` - Komentar pada laporan

**Fitur Anonymous Reports:**
- User dapat melapor tanpa login
- Informasi pelapor (nama, telepon) disimpan langsung di report
- Jika user login, `reportedById` akan diisi dan `reporterName`/`reporterPhone` akan null

Lihat `prisma/schema.prisma` untuk detail schema lengkap.

## Scripts

- `pnpm dev` - Run development server dengan hot reload
- `pnpm build` - Build untuk production
- `pnpm start` - Run production server
- `pnpm prisma:generate` - Generate Prisma Client
- `pnpm prisma:migrate` - Run database migrations
- `pnpm prisma:studio` - Open Prisma Studio

## Tech Stack

- **Express.js** - Web framework
- **Prisma** - ORM untuk database
- **PostgreSQL** - Database
- **TypeScript** - Type safety
- **Zod** - Schema validation
