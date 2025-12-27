import io
import re
import joblib
import numpy as np
import pandas as pd
import tensorflow as tf
import requests
from fastapi import FastAPI, UploadFile, File, HTTPException
from PIL import Image
from pydantic import BaseModel
from typing import Dict

app = FastAPI(
    title="AI Service API", 
    description="Multi-Modal AI Service",
    version="1.0"
)

LOCATION_SHEET_DB = {
    "riau": "https://docs.google.com/spreadsheets/d/1ZscUJ6SLPIF33t8ikVHUmR68b-y3Q9_r_p9d2rDRMCM/export?format=csv&gid=0",
}

LOCATION_SHEET_DB_AIR_QUALITY = {
    # "riau": "https://docs.google.com/spreadsheets/d/1Zoum_BO7G75SDL1J2XhorIVnIiVPBmaSLRMzcktIol0/export?format=csv&gid=1745426099",
    "riau": "https://docs.google.com/spreadsheets/d/1Zoum_BO7G75SDL1J2XhorIVnIiVPBmaSLRMzcktIol0/export?format=csv&gid=1765426099"
}

# REKOMENDASI KUALITAS UDARA
air_quality_recommendations = {
    'Baik' : 'kualitas udara baik. aman untuk aktivitas di luar ruangan.',
    'Sangat Tidak Sehat' : 'kualitas udara sangat tidak sehat. hindari aktivitas di luar ruangan dan gunakan masker.',
    'Sedang' : 'kualitas udara sedang. sebaiknya batasi aktivitas di luar ruangan jika sensitif.',
    'Tidak Sehat' : 'kualitas udara tidak sehat. disarankan untuk mengurangi aktivitas di luar ruangan.',
}

# REKOMENDASI KEBAKARAN 
fire_recommendations = {
    'High': 'tingkat resiko kebakaran tinggi. intensitas api pada kategori tinggi. api sulit dikendalikan.',
    'Very High': 'tingkat resiko kebakaran sangat tinggi. intensitas api pada kategori sangat tinggi. api sangat sulit dikendalikan.',
    'Moderate': 'tingkat resiko kebakaran sedang. intensitas api pada kategori sedang. api relatif masih cukup mudah dikendalikan.',
    'Low': 'tingkat resiko kebakaran rendah. intensitas api pada kategori rendah. api mudah dikendalikan, cenderung akan padam dengan sendirinya.'
}

# Mapping kelas kualitas udara ke index untuk severity calculation
air_quality_class_order = ['Baik', 'Sedang', 'Tidak Sehat', 'Sangat Tidak Sehat']
air_quality_severity_weights = {'Baik': 0, 'Sedang': 33, 'Tidak Sehat': 66, 'Sangat Tidak Sehat': 100}

# Mapping kelas kebakaran ke index untuk severity calculation
# Urutan: Low=0, Moderate=1, High=2, Very High=3
fire_class_order = ['Low', 'Moderate', 'High', 'Very High']
fire_severity_weights = {'Low': 0, 'Moderate': 33, 'High': 66, 'Very High': 100}

# KONFIGURASI MAPPING DAN REKOMENDASI JALAN RUSAK
road_classes = {0: 'baik', 1: 'rusak berat', 2: 'rusak ringan', 3: 'sedang'}
road_recommendations = {
    'baik': 'jalan dalam kondisi prima. lakukan pemeliharaan rutin untuk menjaga kualitas.',
    'rusak berat': 'bahaya! kerusakan parah ditemukan. segera lapor ke dinas terkait untuk perbaikan total.',
    'rusak ringan': 'terdapat kerusakan kecil. perlu perbaikan minor agar kerusakan tidak meluas.',
    'sedang': 'kerusakan cukup terlihat. disarankan untuk segera dijadwalkan perbaikan struktur.'
}

# Bobot severity untuk perhitungan total kerusakan jalan
# baik=0%, rusak ringan=33%, sedang=66%, rusak berat=100%
road_severity_weights = {
    'baik': 0,
    'rusak ringan': 33,
    'sedang': 66,
    'rusak berat': 100
}

# KONFIGURASI MAPPING DAN REKOMENDASI BANJIR
flood_risk_mapping = {0: 'rendah', 1: 'sedang', 2: 'tinggi'}
flood_recommendations = {
    'rendah': 'kondisi aman. tetap pantau saluran air dan bersihkan sampah di drainase.',
    'sedang': 'waspada. debit air meningkat. pindahkan barang berharga ke tempat yang lebih tinggi.',
    'tinggi': 'siaga! potensi banjir besar. segera mengungsi ke titik aman dan ikuti instruksi petugas.'
}


# --- FUNGSI CLEANING TEKS ---
def clean_text(text: str):
    text = str(text).lower()
    text = re.sub(r'http\S+|www\S+', '', text)
    text = re.sub(r'@\w+|#\w+', '', text)
    text = re.sub(r'[^\w\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

# --- GLOBAL MODEL STORAGE ---
models = {}

@app.on_event("startup")
async def load_models():
    loaded_models = []
    failed_models = []
    
    # Model Kebakaran (Fire)
    try:
        models["fire_preprocessor"] = joblib.load("models/preprocessor_fire_model.joblib")
        loaded_models.append("fire_preprocessor")
        print("✅ Fire Preprocessor berhasil dimuat")
    except Exception as e:
        failed_models.append(f"fire_preprocessor: {str(e)}")
        print(f"❌ Gagal memuat Fire Preprocessor: {e}")
    
    try:
        models["fire_model"] = joblib.load("models/stacking_fire_model.joblib")
        loaded_models.append("fire_model")
        print("✅ Fire Model berhasil dimuat")
    except Exception as e:
        failed_models.append(f"fire_model: {str(e)}")
        print(f"❌ Gagal memuat Fire Model: {e}")
    
    # Model Jalan (Road)
    try:
        models["road_model"] = tf.keras.models.load_model("models/best_model.h5", compile=False)
        loaded_models.append("road_model")
        print("✅ Road Model berhasil dimuat")
    except Exception as e:
        failed_models.append(f"road_model: {str(e)}")
        print(f"❌ Gagal memuat Road Model: {e}")
    
    # Model Banjir (Flood)
    try:
        models["flood_model"] = joblib.load("models/xgb_model.joblib")
        loaded_models.append("flood_model")
        print("✅ Flood Model berhasil dimuat")
    except Exception as e:
        failed_models.append(f"flood_model: {str(e)}")
        print(f"❌ Gagal memuat Flood Model: {e}")
    
    try:
        models["flood_vectorizer"] = joblib.load("models/tfidf_vectorizer.joblib")
        loaded_models.append("flood_vectorizer")
        print("✅ Flood Vectorizer berhasil dimuat")
    except Exception as e:
        failed_models.append(f"flood_vectorizer: {str(e)}")
        print(f"❌ Gagal memuat Flood Vectorizer: {e}")
    
    # Model Kualitas Udara (Air Quality)
    try:
        models["preprocessor_air_quality"] = joblib.load("models/preprocessor_air_quality.joblib")
        loaded_models.append("preprocessor_air_quality")
        print("✅ Air Quality Preprocessor berhasil dimuat")
    except Exception as e:
        failed_models.append(f"preprocessor_air_quality: {str(e)}")
        print(f"❌ Gagal memuat Air Quality Preprocessor: {e}")
    try:
        models["stacking_air_quality_model"] = joblib.load("models/stacking_air_quality_model.joblib")
        loaded_models.append("stacking_air_quality_model")
        print("✅ Air Quality Model berhasil dimuat")
    except Exception as e:
        failed_models.append(f"stacking_air_quality_model: {str(e)}")
        print(f"❌ Gagal memuat Air Quality Model: {e}")

    print(f"\n📊 Status Loading: {len(loaded_models)}/{len(loaded_models) + len(failed_models)} model berhasil dimuat")
    if loaded_models:
        print(f"✅ Model aktif: {', '.join(loaded_models)}")
    if failed_models:
        print(f"⚠️ Model gagal: {len(failed_models)}")
        for failed in failed_models:
            print(f"   - {failed}")

# --- SKEMA INPUT ---
class FireInput(BaseModel):
    air_temperature: float
    relative_humidity: float
    rain_fall: float
    wind_speed: float
    soil_surface_moisture: float
class FloodInput(BaseModel):
    comment: str

@app.get("/")
def home():
    return {
        "status": "online", 
        "active_models": list(models.keys())
    }

# -- ROUTE PREDIKSI REAL-TIME KUALITAS UDARA ---
@app.get("/predict/air_quality/realtime/{location}", tags=["Real-time Air Quality Monitoring"])
async def predict_air_quality_realtime(location: str):
    # Check if models are loaded
    if "stacking_air_quality_model" not in models or "preprocessor_air_quality" not in models:
        raise HTTPException(
            status_code=503, 
            detail="Model kualitas udara belum dimuat. Service tidak tersedia untuk prediksi real-time."
        )
    
    loc_key = location.lower()
    if loc_key not in LOCATION_SHEET_DB_AIR_QUALITY:
        raise HTTPException(status_code=404, detail=f"Lokasi '{location}' belum terdaftar.")

    try:
        # Fetch data dari Spreadsheet menggunakan requests untuk handle redirect
        sheet_url = LOCATION_SHEET_DB_AIR_QUALITY[loc_key]
        
        # Gunakan requests untuk mengambil data CSV dengan handling redirect
        response = requests.get(sheet_url, timeout=30)
        response.raise_for_status()
        
        # Membaca data CSV dari response content
        df_sheet = pd.read_csv(io.StringIO(response.text), on_bad_lines='warn', engine='python')

        if df_sheet.empty:
            raise HTTPException(status_code=400, detail="Data sensor di spreadsheet kosong.")

        # Pembersihan Nama Kolom (Mencegah Mapping Error karena spasi/karakter aneh)
        df_sheet.columns = [str(col).strip() for col in df_sheet.columns]

        # Verifikasi Keberadaan Kolom dengan logging yang lebih detail
        required_cols = ['suhu_c', 'kelembapan_pct', 'tekanan_hpa', 'pm25_ug_m3', 'pm10_ug_m3', 'co_ppm']
        available_cols = list(df_sheet.columns)
        
        missing = [col for col in required_cols if col not in available_cols]
        
        if missing:
            print(f"⚠️ Kolom {missing} tidak ditemukan di baris pertama.")
            print(f"🔍 Kolom tersedia saat ini: {available_cols}")
            raise ValueError(f"Kolom tidak ditemukan: {missing}. Periksa header di Spreadsheet Anda.")

        # Ambil baris terakhir yang memiliki data (bukan baris kosong)
        df_sheet = df_sheet.dropna(subset=required_cols)
        if df_sheet.empty:
             raise HTTPException(status_code=400, detail="Tidak ada baris data sensor yang valid (semua baris kosong).")
             
        latest = df_sheet.iloc[-1]

        # Format data untuk Model
        input_df = pd.DataFrame([{
            'suhu_c': float(latest['suhu_c']),
            'kelembapan_pct': float(latest['kelembapan_pct']),
            'tekanan_hpa': float(latest['tekanan_hpa']),
            'pm25_ug_m3': float(latest['pm25_ug_m3']),
            'pm10_ug_m3': float(latest['pm10_ug_m3']),
            'co_ppm': float(latest['co_ppm']),  # Default ke 0 jika kolom tidak ada
        }])

        # Prediksi
        processed = models["preprocessor_air_quality"].transform(input_df)
        if len(processed.shape) == 1:
            processed = processed.reshape(1, -1)
        prediction = str(models["stacking_air_quality_model"].predict(processed)[0])
        # Hitung probabilitas untuk setiap kelas
        probs = models["stacking_air_quality_model"].predict_proba(processed)[0]
        classes = models["stacking_air_quality_model"].classes_  
        # Confidence score dengan 2 desimal
        confidence = round(float(np.max(probs) * 100), 2)
        # Persentase keparahan untuk setiap tingkat risiko dengan 2 desimal
        severity_percentage = {}
        for i, cls in enumerate(classes):
            severity_percentage[str(cls).lower()] = round(float(probs[i] * 100), 2)
        # Total severity score (weighted average) dengan 2 desimal
        total_severity = 0  
        for i, cls in enumerate(classes):
            weight = air_quality_severity_weights.get(str(cls), 0)
            total_severity += probs[i] * weight
        total_severity = round(float(total_severity), 2)
        recommendation = air_quality_recommendations.get(prediction, "N/A")
        # Menyiapkan Respon Sensor Values termasuk Waktu
        # sensor_results = input_df.to_dict(orient='records')[0]  
        return {
            "status": "success",
            "location": location,
            # "sensor_values": sensor_results,
            "prediction": prediction,
            "confidence": confidence,
            "total_severity": total_severity,
            "severity_percentage": severity_percentage,
            "recommendation": recommendation
        }
    except Exception as e:
        print(f"❌ Error Mapping: {str(e)}")
        # Memberikan detail apakah ini masalah Izin atau masalah Struktur Kolom
        error_msg = str(e)
        if "HTML" in error_msg or "DOCTYPE" in error_msg:
            error_msg = "Akses Spreadsheet Ditolak. Pastikan izin akses diatur ke 'Siapa saja yang memiliki link' (Anyone with the link)."
        
        raise HTTPException(status_code=500, detail=f"Error Real-time (Mapping Error): {error_msg}")


# --- ROUTE REAL-TIME IoT (KEBAKARAN) ---
@app.get("/predict/realtime/{location}", tags=["Real-time IoT Monitoring"])
async def predict_realtime(location: str):
    # Check if models are loaded
    if "fire_model" not in models or "fire_preprocessor" not in models:
        raise HTTPException(
            status_code=503, 
            detail="Model kebakaran belum dimuat. Service tidak tersedia untuk prediksi real-time."
        )
    
    loc_key = location.lower()
    if loc_key not in LOCATION_SHEET_DB:
        raise HTTPException(status_code=404, detail=f"Lokasi '{location}' belum terdaftar.")

    try:
        # Fetch data dari Spreadsheet menggunakan requests untuk handle redirect
        sheet_url = LOCATION_SHEET_DB[loc_key]
        
        # Gunakan requests untuk mengambil data CSV dengan handling redirect
        response = requests.get(sheet_url, timeout=30)
        response.raise_for_status()
        
        # Membaca data CSV dari response content
        df_sheet = pd.read_csv(io.StringIO(response.text), on_bad_lines='warn', engine='python')

        if df_sheet.empty:
            raise HTTPException(status_code=400, detail="Data sensor di spreadsheet kosong.")

        # Pembersihan Nama Kolom (Mencegah Mapping Error karena spasi/karakter aneh)
        df_sheet.columns = [str(col).strip() for col in df_sheet.columns]

        # Verifikasi Keberadaan Kolom dengan logging yang lebih detail
        required_cols = ['Suhu Udara', 'Kelembapan Udara', 'Curah Hujan/Jam', 'Kecepatan Angin (ms)', 'Kelembapan Tanah']
        available_cols = list(df_sheet.columns)
        
        missing = [col for col in required_cols if col not in available_cols]
        
        if missing:
            # Kita coba cari baris yang mengandung header yang benar jika baris pertama salah
            print(f"⚠️ Kolom {missing} tidak ditemukan di baris pertama.")
            print(f"🔍 Kolom tersedia saat ini: {available_cols}")
            
            # Jika spreadsheet terbaca sebagai HTML (biasanya karena izin akses), error akan dipicu di sini
            if "<!DOCTYPE html>" in str(df_sheet.iloc[0,0]) or "<html>" in str(df_sheet.iloc[0,0]):
                raise ValueError("Spreadsheet terbaca sebagai halaman HTML. Pastikan Izin akses adalah 'Anyone with the link can view'.")
            
            raise ValueError(f"Kolom tidak ditemukan: {missing}. Periksa header di Spreadsheet Anda.")

        # Ambil baris terakhir yang memiliki data (bukan baris kosong)
        df_sheet = df_sheet.dropna(subset=required_cols)
        if df_sheet.empty:
             raise HTTPException(status_code=400, detail="Tidak ada baris data sensor yang valid (semua baris kosong).")
             
        latest = df_sheet.iloc[-1]

        # Format data untuk Model
        input_df = pd.DataFrame([{
            'air_temperature': float(latest['Suhu Udara']),
            'relative_humidity': float(latest['Kelembapan Udara']),
            'rain_fall': float(latest['Curah Hujan/Jam']),
            'wind_speed': float(latest['Kecepatan Angin (ms)']),
            'soil_surface_moisture': float(latest['Kelembapan Tanah']),
            'time': latest.get('Waktu', 'N/A')
        }])

        # Prediksi
        processed = models["fire_preprocessor"].transform(input_df)
        if len(processed.shape) == 1:
            processed = processed.reshape(1, -1)

        prediction = str(models["fire_model"].predict(processed)[0])
        
        # Hitung probabilitas untuk setiap kelas
        probs = models["fire_model"].predict_proba(processed)[0]
        classes = models["fire_model"].classes_
        
        # Confidence score dengan 2 desimal
        confidence = round(float(np.max(probs) * 100), 2)
        
        # Persentase keparahan untuk setiap tingkat risiko dengan 2 desimal
        severity_percentage = {}
        for i, cls in enumerate(classes):
            severity_percentage[str(cls).lower()] = round(float(probs[i] * 100), 2)
        
        # Total severity score (weighted average) dengan 2 desimal
        total_severity = 0
        for i, cls in enumerate(classes):
            weight = fire_severity_weights.get(str(cls), 0)
            total_severity += probs[i] * weight
        total_severity = round(float(total_severity), 2)
        
        recommendation = fire_recommendations.get(prediction, "N/A")
        
        # Menyiapkan Respon Sensor Values termasuk Waktu
        sensor_results = input_df.to_dict(orient='records')[0]
        
        return {
            "status": "success",
            "location": location,
            "sensor_values": sensor_results,
            "prediction": prediction,
            "confidence": confidence,
            "total_severity": total_severity,
            "severity_percentage": severity_percentage,
            "recommendation": recommendation
        }
    except Exception as e:
        print(f"❌ Error Mapping: {str(e)}")
        # Memberikan detail apakah ini masalah Izin atau masalah Struktur Kolom
        error_msg = str(e)
        if "HTML" in error_msg or "DOCTYPE" in error_msg:
            error_msg = "Akses Spreadsheet Ditolak. Pastikan izin akses diatur ke 'Siapa saja yang memiliki link' (Anyone with the link)."
        
        raise HTTPException(status_code=500, detail=f"Error Real-time (Mapping Error): {error_msg}")


# Prediksi KEBAKARAN 
@app.post("/predict/fire", tags=["Fire"])
async def predict_fire(data: FireInput):
    # Check if models are loaded
    if "fire_model" not in models or "fire_preprocessor" not in models:
        raise HTTPException(
            status_code=503, 
            detail="Model kebakaran belum dimuat. Kemungkinan ada masalah kompatibilitas numpy. Silakan retrain model atau upgrade dependencies."
        )
    
    try:
        # Nama kolom harus persis dengan yang diharapkan oleh preprocessor/model training
        input_df = pd.DataFrame([{
            'air_temperature': data.air_temperature,
            'relative_humidity': data.relative_humidity,
            'rain_fall': data.rain_fall,
            'wind_speed': data.wind_speed,
            'soil_surface_moisture': data.soil_surface_moisture
        }])
        
        processed_data = models["fire_preprocessor"].transform(input_df)
        # FIX: Memastikan data dalam bentuk 2D array (1 sample, n features)
        if len(processed_data.shape) == 1:
            processed_data = processed_data.reshape(1, -1)
        prediction = str(models["fire_model"].predict(processed_data)[0])
        
        # Hitung probabilitas untuk setiap kelas
        probs = models["fire_model"].predict_proba(processed_data)[0]
        classes = models["fire_model"].classes_
        
        # Confidence score dengan 2 desimal
        confidence = round(float(np.max(probs) * 100), 2)
        
        # Persentase keparahan untuk setiap tingkat risiko dengan 2 desimal
        severity_percentage = {}
        for i, cls in enumerate(classes):
            severity_percentage[str(cls).lower()] = round(float(probs[i] * 100), 2)
        
        # Total severity score (weighted average) dengan 2 desimal
        # Low=0%, Moderate=33%, High=66%, Very High=100%
        total_severity = 0
        for i, cls in enumerate(classes):
            weight = fire_severity_weights.get(str(cls), 0)
            total_severity += probs[i] * weight
        total_severity = round(float(total_severity), 2)
        
        # Rekomendasi berdasarkan prediksi
        recommendation = fire_recommendations.get(prediction, "Tingkat keparahan tidak terdefinisi.")
        
        return {
            "status": "success", 
            "prediction": str(prediction),
            "confidence": confidence,
            "total_severity": total_severity,
            "severity_percentage": severity_percentage,
            "recommendation": recommendation
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Prediksi KERUSAKAN JALAN (GAMBAR)
@app.post("/predict/road", tags=["Road"])
async def predict_road(file: UploadFile = File(...)):
    # Check if model is loaded
    if "road_model" not in models:
        raise HTTPException(
            status_code=503, 
            detail="Model jalan belum dimuat. Kemungkinan ada masalah kompatibilitas Keras/TensorFlow. Silakan retrain model atau upgrade ke TensorFlow 2.15+."
        )
    
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert('RGB').resize((224, 224))
        img_array = np.array(image).astype('float32')
        
        # Preprocessing rentang [-1, 1]
        img_array = (img_array / 127.5) - 1.0
        img_array = np.expand_dims(img_array, axis=0)
        
        predictions = models["road_model"].predict(img_array)[0]
        class_idx = np.argmax(predictions)
        
        # Confidence score dengan 2 desimal
        confidence = round(float(np.max(predictions) * 100), 2)
        
        # Persentase keparahan untuk setiap tingkat kerusakan dengan 2 desimal
        severity_percentage = {
            'baik': round(float(predictions[0] * 100), 2),
            'rusak_berat': round(float(predictions[1] * 100), 2),
            'rusak_ringan': round(float(predictions[2] * 100), 2),
            'sedang': round(float(predictions[3] * 100), 2)
        }
        
        # Total damage score (weighted average) dengan 2 desimal
        # baik=0%, rusak_ringan=33%, sedang=66%, rusak_berat=100%
        total_damage = (
            predictions[0] * 0 +           # baik
            predictions[1] * 100 +         # rusak berat
            predictions[2] * 33 +          # rusak ringan
            predictions[3] * 66            # sedang
        )
        total_damage = round(float(total_damage), 2)
        
        # Rekomendasi berdasarkan kelas
        class_name = road_classes.get(class_idx, "Unknown")
        recommendation = road_recommendations.get(class_name, "Rekomendasi tidak tersedia.")
        
        return {
            "status": "success",
            "prediction_class": class_name,
            "confidence": confidence,
            "total_damage": total_damage,
            "severity_percentage": severity_percentage,
            "recommendation": recommendation
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Prediksi RISIKO BANJIR (TEKS)
@app.post("/predict/flood", tags=["Flood"])
async def predict_flood(data: FloodInput):
    # Check if models are loaded
    if "flood_model" not in models or "flood_vectorizer" not in models:
        raise HTTPException(
            status_code=503, 
            detail="Model banjir belum dimuat. Service tidak tersedia."
        )
    
    try:
        # Bersihkan teks
        cleaned = clean_text(data.comment)
        
        # Transformasi ke TF-IDF
        vectorized_text = models["flood_vectorizer"].transform([cleaned])
        
        # Predict (Perbaikan akses variabel model)
        prediction = models["flood_model"].predict(vectorized_text)[0]
            
        # Mapping hasil prediksi
        risk_label = flood_risk_mapping.get(int(prediction), str(prediction))
        
        # Hitung probabilitas untuk setiap kelas
        probs = models["flood_model"].predict_proba(vectorized_text)[0]
        
        # Confidence Score dengan 2 desimal
        confidence = round(float(np.max(probs) * 100), 2)
        
        # Persentase keparahan untuk setiap tingkat risiko dengan 2 desimal
        severity_percentage = {
            "rendah": round(float(probs[0] * 100), 2) if len(probs) > 0 else 0,
            "sedang": round(float(probs[1] * 100), 2) if len(probs) > 1 else 0,
            "tinggi": round(float(probs[2] * 100), 2) if len(probs) > 2 else 0
        }
        
        # Total severity score (weighted average) dengan 2 desimal
        # rendah = 0%, sedang = 50%, tinggi = 100%
        prob_rendah = probs[0] if len(probs) > 0 else 0
        prob_sedang = probs[1] if len(probs) > 1 else 0
        prob_tinggi = probs[2] if len(probs) > 2 else 0
        total_severity = round(float((prob_rendah * 0) + (prob_sedang * 50) + (prob_tinggi * 100)), 2)
        
        # Rekomendasi berdasarkan prediksi
        recommendation = flood_recommendations.get(risk_label, "Rekomendasi tidak tersedia.")
        
        return {
            "status": "success",
            "original_comment": data.comment,
            "cleaned_comment": cleaned,
            "risk_level": risk_label,
            "confidence": confidence,
            "total_severity": total_severity,
            "severity_percentage": severity_percentage,
            "recommendation": recommendation
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)