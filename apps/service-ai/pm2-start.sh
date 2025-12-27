#!/bin/bash

# PM2 wrapper script untuk service-ai
# Script ini mengaktifkan virtual environment dan menjalankan main.py

cd "$(dirname "$0")"

# Aktifkan virtual environment
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment tidak ditemukan!"
    echo "   Jalankan: python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt"
    exit 1
fi

source venv/bin/activate

# Jalankan aplikasi
exec python main.py

