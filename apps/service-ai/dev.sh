#!/bin/bash

# Development script untuk menjalankan AI Service di turbo repo
# Script ini dioptimalkan untuk development dengan auto-reload

set -e  # Exit on error

cd "$(dirname "$0")"

# Cek Python version
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 tidak ditemukan! Silakan install Python 3.8+"
    exit 1
fi

PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
echo "🐍 Python version: $PYTHON_VERSION"

# Cek virtual environment
if [ ! -d "venv" ]; then
    echo "📦 Virtual environment tidak ditemukan, membuat baru..."
    python3 -m venv venv
    echo "✅ Virtual environment dibuat"
fi

# Aktifkan virtual environment
source venv/bin/activate

# Upgrade pip
pip install --quiet --upgrade pip > /dev/null 2>&1 || true

# Cek dan install dependencies
if ! python -c "import fastapi, uvicorn" 2>/dev/null; then
    echo "📥 Menginstall dependencies..."
    pip install -r requirements.txt --quiet
    echo "✅ Dependencies terinstall"
fi

# Jalankan service dengan uvicorn untuk auto-reload
echo ""
echo "🚀 Menjalankan AI Service (Development Mode)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   🌐 API:     http://127.0.0.1:8000"
echo "   📚 Docs:    http://127.0.0.1:8000/docs"
echo "   🔄 Auto-reload: Enabled"
echo "   ⏹️  Stop:    Press CTRL+C"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Gunakan uvicorn dengan reload untuk development
exec uvicorn main:app --reload --host 0.0.0.0 --port 8000

