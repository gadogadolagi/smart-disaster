# 🤖 AI Service - Smart Disaster Management

Multi-Modal AI Service untuk prediksi dan monitoring bencana:
- 🔥 **Kebakaran** - Prediksi risiko kebakaran berdasarkan data sensor IoT
- 🌊 **Banjir** - Analisis risiko banjir dari teks laporan masyarakat
- 🛣️ **Kerusakan Jalan** - Klasifikasi kondisi jalan dari gambar
- 🌫️ **Kualitas Udara** - Monitoring kualitas udara real-time

---

## 📋 Persyaratan Sistem

| Komponen | Minimum | Rekomendasi |
|----------|---------|-------------|
| OS | Ubuntu 20.04 / macOS 12+ | Ubuntu 22.04 LTS |
| Python | 3.10 | 3.11 |
| RAM | 4 GB | 8 GB |
| Storage | 5 GB | 10 GB |
| CPU | 2 Core | 4 Core |

---

## 🚀 Panduan Instalasi Server

### 1. Clone Repository

```bash
git clone <repository-url>
cd apps/service-ai
```

### 2. Install Python 3.11

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install software-properties-common -y
sudo add-apt-repository ppa:deadsnakes/ppa -y
sudo apt update
sudo apt install python3.11 python3.11-venv python3.11-dev -y
```

#### macOS (dengan Homebrew)
```bash
brew install python@3.11
```

#### Verifikasi Instalasi
```bash
python3.11 --version
# Output: Python 3.11.x
```

### 3. Buat Virtual Environment

```bash
python3.11 -m venv venv
```

### 4. Aktifkan Virtual Environment

#### Linux/macOS
```bash
source venv/bin/activate
```

#### Windows
```powershell
venv\Scripts\activate
```

### 5. Upgrade pip

```bash
pip install --upgrade pip setuptools wheel
```

### 6. Install Dependencies

```bash
pip install -r requirements.txt
```

### 7. Verifikasi Model Files

Pastikan semua file model ada di folder `models/`:

```bash
ls -la models/
```

File model yang diperlukan:
```
models/
├── best_model.h5                    # Model kerusakan jalan (TensorFlow)
├── preprocessor_fire_model.joblib   # Preprocessor kebakaran
├── stacking_fire_model.joblib       # Model prediksi kebakaran
├── xgb_model.joblib                 # Model prediksi banjir
├── tfidf_vectorizer.joblib          # TF-IDF vectorizer banjir
├── preprocessor_air_quality.joblib  # Preprocessor kualitas udara
└── stacking_air_quality_model.joblib # Model kualitas udara
```

---

## ▶️ Menjalankan Service

### Metode 1: Script Helper (Recommended)

```bash
chmod +x start.sh
./start.sh
```

### Metode 2: Manual

```bash
source venv/bin/activate
python main.py
```

### Metode 3: Uvicorn dengan Auto-reload (Development)

```bash
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Metode 4: Background Process (Production)

```bash
source venv/bin/activate
mkdir -p logs
nohup python main.py > logs/service.log 2>&1 &

# Cek status
tail -f logs/service.log
```

---

## 🔧 Konfigurasi Production (systemd)

### 1. Buat Service File

```bash
sudo nano /etc/systemd/system/ai-service.service
```

```ini
[Unit]
Description=AI Service - Smart Disaster Management
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/path/to/apps/service-ai
Environment="PATH=/path/to/apps/service-ai/venv/bin"
ExecStart=/path/to/apps/service-ai/venv/bin/python main.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

> **Note:** Ganti `/path/to/apps/service-ai` dengan path absolut ke folder service-ai

### 2. Enable dan Start Service

```bash
sudo systemctl daemon-reload
sudo systemctl enable ai-service
sudo systemctl start ai-service
```

### 3. Cek Status

```bash
sudo systemctl status ai-service
```

### 4. Lihat Logs

```bash
sudo journalctl -u ai-service -f
```

### 5. Perintah Manajemen Service

```bash
# Stop service
sudo systemctl stop ai-service

# Restart service
sudo systemctl restart ai-service

# Disable autostart
sudo systemctl disable ai-service
```

---

## 🌐 Konfigurasi Nginx (Reverse Proxy)

### 1. Install Nginx

```bash
sudo apt install nginx -y
```

### 2. Buat Konfigurasi

```bash
sudo nano /etc/nginx/sites-available/ai-service
```

```nginx
server {
    listen 80;
    server_name api.example.com;  # Ganti dengan domain Anda

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
        client_max_body_size 50M;  # Untuk upload gambar
    }
}
```

### 3. Enable Site

```bash
sudo ln -s /etc/nginx/sites-available/ai-service /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. Setup SSL dengan Certbot (Opsional)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d api.example.com
```

---

## 📡 API Endpoints

### Health Check
```bash
curl http://localhost:8000/
```

### Prediksi Kebakaran
```bash
curl -X POST "http://localhost:8000/predict/fire" \
  -H "Content-Type: application/json" \
  -d '{
    "air_temperature": 35.0,
    "relative_humidity": 30.0,
    "rain_fall": 0.0,
    "wind_speed": 5.0,
    "soil_surface_moisture": 15.0
  }'
```

### Monitoring Kebakaran Real-time (IoT)
```bash
curl "http://localhost:8000/predict/realtime/riau"
```

### Prediksi Risiko Banjir
```bash
curl -X POST "http://localhost:8000/predict/flood" \
  -H "Content-Type: application/json" \
  -d '{"comment": "Banjir besar melanda daerah ini"}'
```

### Klasifikasi Kerusakan Jalan
```bash
curl -X POST "http://localhost:8000/predict/road" \
  -F "file=@/path/to/image.jpg"
```

### Monitoring Kualitas Udara Real-time
```bash
curl "http://localhost:8000/predict/air_quality/realtime/riau"
```

---

## 📊 Response Format

Semua endpoint mengembalikan response dengan format:

```json
{
    "status": "success",
    "prediction": "Low",
    "confidence": 94.37,
    "total_severity": 3.14,
    "severity_percentage": {
        "low": 94.37,
        "moderate": 3.71,
        "high": 0.01,
        "very high": 1.91
    },
    "recommendation": "tingkat resiko kebakaran rendah..."
}
```

---

## 🔍 Dokumentasi API Interaktif

Setelah service berjalan, akses:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## 🛠️ Troubleshooting

### Error: Port 8000 already in use
```bash
# Cari dan kill process
lsof -ti:8000 | xargs kill -9
```

### Error: Module not found
```bash
# Pastikan virtual environment aktif
source venv/bin/activate
pip install -r requirements.txt
```

### Error: TensorFlow import gagal
```bash
# Pastikan menggunakan Python dari venv
which python
# Harus: /path/to/venv/bin/python
```

### Error: Model tidak bisa dimuat
```bash
# Cek file model
ls -la models/

# Perbaiki permission
chmod 644 models/*.joblib models/*.h5
```

### Error: Spreadsheet tidak bisa diakses
- Pastikan Google Spreadsheet diatur: **"Anyone with the link can view"**
- Cek koneksi internet server

### Error: Permission denied saat start
```bash
chmod +x start.sh
```

---

## 📁 Struktur Project

```
service-ai/
├── main.py              # Main application
├── train.py             # Script training model
├── requirements.txt     # Python dependencies
├── start.sh             # Startup script
├── README.md            # Dokumentasi ini
├── models/              # Model files
│   ├── best_model.h5
│   ├── preprocessor_fire_model.joblib
│   ├── stacking_fire_model.joblib
│   ├── xgb_model.joblib
│   ├── tfidf_vectorizer.joblib
│   ├── preprocessor_air_quality.joblib
│   └── stacking_air_quality_model.joblib
├── data_comment/        # Dataset untuk training
├── logs/                # Log files (auto-generated)
└── venv/                # Virtual environment (tidak di-commit)
```

---

## 🚨 Perintah Penting

| Perintah | Deskripsi |
|----------|-----------|
| `./start.sh` | Jalankan service |
| `curl http://localhost:8000/` | Health check |
| `lsof -ti:8000 \| xargs kill -9` | Stop service (force) |
| `systemctl restart ai-service` | Restart (systemd) |
| `tail -f logs/service.log` | Lihat log real-time |
| `journalctl -u ai-service -f` | Lihat log systemd |

---

## 💾 Melatih Ulang Model

### Model Banjir (XGBoost + TF-IDF)
```bash
python train.py
```

> Dataset harus tersedia di `data_comment/`

### Model Lainnya
Model fire (stacking) dan road (Keras) memerlukan pipeline training terpisah. File model yang sudah di-train disimpan di `models/`.

---

## 📞 Support

Jika mengalami masalah:
1. ✅ Python 3.11 terinstall dengan benar
2. ✅ Virtual environment aktif
3. ✅ Semua dependencies terinstall
4. ✅ Semua file model ada di `models/`
5. ✅ Permission file dan folder sudah benar

---

**Last Updated**: December 2025  
**Version**: 1.0.0
