#!/bin/bash

# Script untuk menjalankan AI Service
# Usage: ./start.sh

cd "$(dirname "$0")"

echo "🔍 Memeriksa environment..."

# Aktifkan virtual environment
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment tidak ditemukan!"
    echo "   Jalankan: python3 -m venv venv"
    exit 1
fi

source venv/bin/activate

# Cek versi Python
PYTHON_VERSION=$(python --version 2>&1 | awk '{print $2}')
echo "✅ Python version: $PYTHON_VERSION"

# Cek apakah dependencies sudah terinstall
if ! python -c "import fastapi" 2>/dev/null; then
    echo "⚠️  Dependencies belum terinstall"
    echo "   Menginstall dependencies..."
    pip install -r requirements.txt
fi

echo "✅ Dependencies OK"

# Jalankan service
echo ""
echo "🚀 Menjalankan AI Service..."
echo "   API akan tersedia di: http://127.0.0.1:8000"
echo "   Dokumentasi: http://127.0.0.1:8000/docs"
echo ""
echo "   Untuk menghentikan service, tekan CTRL+C"
echo ""

python main.py






