import pandas as pd
import numpy as np
import re
import os
from joblib import dump, load
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from xgboost import XGBClassifier
from imblearn.over_sampling import SMOTE
import warnings
warnings.filterwarnings('ignore')

# ========================================
# 0. CREATE MODELS DIRECTORY
# ========================================
os.makedirs('models', exist_ok=True)

# ========================================
# 1. LOAD DATASET
# ========================================
print("=" * 50)
print("LOADING DATASETS...")
print("=" * 50)

# Check if data files exist
data_files = [
    'data_comment/prioritas_rendah.csv',
    'data_comment/prioritas_sedang.csv', 
    'data_comment/prioritas_tinggi.csv'
]

for file in data_files:
    if not os.path.exists(file):
        print(f"❌ ERROR: File {file} tidak ditemukan!")
        print(f"   Pastikan file dataset ada di folder data_comment/")
        exit(1)

df_rendah = pd.read_csv('data_comment/prioritas_rendah.csv')
df_sedang = pd.read_csv('data_comment/prioritas_sedang.csv')
df_tinggi = pd.read_csv('data_comment/prioritas_tinggi.csv')

df_rendah['prioritas'] = 0
df_sedang['prioritas'] = 1
df_tinggi['prioritas'] = 2

df = pd.concat([df_rendah, df_sedang, df_tinggi], ignore_index=True)
df = df.sample(frac=1, random_state=42).reset_index(drop=True)

print(f"✅ Total data: {len(df)}")
print(f"📊 Distribusi prioritas:\n{df['prioritas'].value_counts().sort_index()}")

# ⚠️ CEK DISTRIBUSI
print("\n⚠️  DISTRIBUSI DATA:")
for i, label in enumerate(['Rendah', 'Sedang', 'Tinggi']):
    count = len(df[df['prioritas'] == i])
    percentage = (count / len(df)) * 100
    print(f"  {label}: {count} samples ({percentage:.1f}%)")

# ========================================
# 2. TEXT PREPROCESSING
# ========================================
print("\n" + "=" * 50)
print("TEXT PREPROCESSING...")
print("=" * 50)

def preprocess_text(text):
    if pd.isna(text):
        return ""
    
    text = text.lower()
    text = re.sub(r'http\S+|www\S+', '', text)
    text = re.sub(r'@\w+|#\w+', '', text)
    text = re.sub(r'[^\w\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    
    return text

df['komentar_clean'] = df['komentar'].apply(preprocess_text)

# ========================================
# 3. FEATURE EXTRACTION (TF-IDF)
# ========================================
print("\n" + "=" * 50)
print("FEATURE EXTRACTION (TF-IDF)...")
print("=" * 50)

tfidf = TfidfVectorizer(
    max_features=1000,
    ngram_range=(1, 3),
    min_df=1,
    max_df=0.9,
    sublinear_tf=True
)

X = tfidf.fit_transform(df['komentar_clean'])
y = df['prioritas'].values

print(f"✅ Shape fitur: {X.shape}")

# ========================================
# 4. SPLIT TRAIN-TEST
# ========================================
X_train, X_test, y_train, y_test = train_test_split(
    X, y, 
    test_size=0.2, 
    random_state=42,
    stratify=y
)

# ========================================
# 5. HANDLING CLASS IMBALANCE - SMOTE
# ========================================
print("\n" + "=" * 50)
print("APPLYING SMOTE FOR CLASS BALANCE...")
print("=" * 50)

print(f"📊 Sebelum SMOTE: {np.bincount(y_train)}")

smote = SMOTE(random_state=42)
X_train_balanced, y_train_balanced = smote.fit_resample(X_train, y_train)

print(f"📈 Setelah SMOTE: {np.bincount(y_train_balanced)}")

# ========================================
# 6. TRAINING MODEL SVM
# ========================================
#print("\n" + "=" * 50)
#print("TRAINING SVM MODEL...")
#print("=" * 50)

#svm_model = LinearSVC(
#    C=1.0,
#    max_iter=3000,
#    class_weight='balanced',
#    random_state=42
#)

#svm_model.fit(X_train_balanced, y_train_balanced)
#y_pred_svm = svm_model.predict(X_test)

#print("\n--- SVM RESULTS ---")
#print(f"✅ Accuracy: {accuracy_score(y_test, y_pred_svm):.4f}")
#print(f"\n📋 Classification Report:\n{classification_report(y_test, y_pred_svm, target_names=['Rendah', 'Sedang', 'Tinggi'])}")
#print(f"\n📊 Confusion Matrix:\n{confusion_matrix(y_test, y_pred_svm)}")

# ========================================
# 7. TRAINING MODEL XGBOOST
# ========================================
print("\n" + "=" * 50)
print("TRAINING XGBOOST MODEL...")
print("=" * 50)

class_counts = np.bincount(y_train)
scale_pos_weight = class_counts[0] / class_counts[2] if class_counts[2] > 0 else 1

xgb_model = XGBClassifier(
    n_estimators=200,
    max_depth=6,
    learning_rate=0.05,
    scale_pos_weight=scale_pos_weight,
    random_state=42,
    eval_metric='mlogloss'
)

xgb_model.fit(X_train_balanced, y_train_balanced)
y_pred_xgb = xgb_model.predict(X_test)

print("\n--- XGBOOST RESULTS ---")
print(f"✅ Accuracy: {accuracy_score(y_test, y_pred_xgb):.4f}")
print(f"\n📋 Classification Report:\n{classification_report(y_test, y_pred_xgb, target_names=['Rendah', 'Sedang', 'Tinggi'])}")
print(f"\n📊 Confusion Matrix:\n{confusion_matrix(y_test, y_pred_xgb)}")

# ========================================
# 8. SAVE MODEL & VECTORIZER - PAKAI JOBLIB
# ========================================
print("\n" + "=" * 50)
print("SAVING MODELS...")
print("=" * 50)

# ✅ SEMUA PAKAI JOBLIB - Simpan ke folder models/
dump(tfidf, 'models/tfidf_vectorizer.joblib')
print("✅ TF-IDF Vectorizer saved (models/tfidf_vectorizer.joblib)")

#dump(svm_model, 'models/svm_model.joblib')
#print("✅ SVM Model saved (models/svm_model.joblib)")

dump(xgb_model, 'models/xgb_model.joblib')
print("✅ XGBoost Model saved (models/xgb_model.joblib)")

# ========================================
# 9. ANALISIS KATA PENTING PER KELAS
# ========================================
print("\n" + "=" * 50)
print("ANALISIS KATA PENTING PER PRIORITAS...")
print("=" * 50)

feature_names = tfidf.get_feature_names_out()

for i, priority in enumerate(['RENDAH', 'SEDANG', 'TINGGI']):
    print(f"\n🔍 Kata penting untuk prioritas {priority}:")
    
    if hasattr(xgb_model, 'coef_'):
        coef = xgb_model.coef_[i] if len(xgb_model.coef_) > 1 else xgb_model.coef_[0]
        top_indices = coef.argsort()[-10:][::-1]  # Top 10 saja
        top_words = [(feature_names[idx], coef[idx]) for idx in top_indices]
        
        for word, score in top_words:
            print(f"  • {word}: {score:.4f}")

# ========================================
# 10. TEST PREDICTION
# ========================================
print("\n" + "=" * 50)
print("TESTING PREDICTIONS...")
print("=" * 50)

def predict_priority(comment, model_type='xgboost'):
    clean_comment = preprocess_text(comment)
    comment_vector = tfidf.transform([clean_comment])
    
    #if model_type == 'svm':
        #prediction = svm_model.predict(comment_vector)[0]
        #decision = svm_model.decision_function(comment_vector)[0]
    if model_type == 'xgboost':
        prediction = xgb_model.predict(comment_vector)[0]
        proba = xgb_model.predict_proba(comment_vector)[0]
        decision = proba
    
    label_map = {0: 'Rendah', 1: 'Sedang', 2: 'Tinggi'}
    
    return {
        'priority': int(prediction),
        'label': label_map.get(prediction, 'Unknown'),
        'comment': comment,
        'model': model_type.upper(),
        'confidence': decision
    }

test_comments = [
    "Genangan kecil di beberapa titik tapi tidak mengganggu",
    "Banjir tahun ini lebih ringan dari tahun lalu",
    "Warga sudah membersihkan lingkungan dari sampah",
    "Sungai masih dalam batas aman",
    "Tidak ada evakuasi diperlukan",
    
    "Genangan air cukup terasa meskipun belum masuk rumah",
    "Air di selokan hampir penuh setelah hujan deras",
    "Air mulai meluap di pinggir jalan, warga mulai waspada",
    "Hujan lama menyebabkan aliran air melambat",
    
    "Banjir parah, aktivitas warga terhenti total",
    "Genangan tinggi dan deras, warga diminta segera evakuasi",
    "Air sungai meluap dan mengancam rumah warga lainnya",
    "Situasi darurat, beberapa titik jalan sudah tidak bisa dilewati",
    "Warga panik, rumah terendam air hingga lantai 2",
    "Banjir bandang melanda pemukiman, evakuasi warga segera",
    "Genangan air mencapai rumah warga, kondisi kritis dan darurat",
    "Genangan mulai meluas di area pemukiman"
]

print("\n--- TESTING PREDICTIONS ---")
for comment in test_comments:
    #result_svm = predict_priority(comment, 'svm')
    result_xgb = predict_priority(comment, 'xgboost')
    
    print(f"\n📝 {comment[:50]}...")
    #print(f"  SVM     → {result_svm['label']} (priority: {result_svm['priority']})")
    print(f"  XGBoost → {result_xgb['label']} (priority: {result_xgb['priority']})")

print("\n" + "=" * 50)
print("✅ TRAINING COMPLETED!")
print("=" * 50)
print("\n📁 Files saved in 'models/' folder:")
print("  - tfidf_vectorizer.joblib")
print("  - svm_model.joblib")
print("  - xgb_model.joblib")
print("\n🚀 Now you can run the API with: python api.py")
print("=" * 50)