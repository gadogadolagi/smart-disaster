// i18n message translations
// This can be expanded later for multi-language support

type MessageKey = keyof typeof import('./constants').MESSAGES;

const translations: Record<string, Record<MessageKey, string>> = {
  id: {
    // Auth messages
    AUTH_LOGIN_SUCCESS: 'Login berhasil',
    AUTH_LOGIN_FAILED: 'Login gagal',
    AUTH_LOGOUT_SUCCESS: 'Logout berhasil',
    AUTH_REGISTER_SUCCESS: 'Registrasi berhasil',
    AUTH_REGISTER_FAILED: 'Registrasi gagal',
    AUTH_INVALID_CREDENTIALS: 'Email atau password salah',
    AUTH_TOKEN_EXPIRED: 'Token telah kadaluarsa',
    AUTH_TOKEN_INVALID: 'Token tidak valid',
    AUTH_UNAUTHORIZED: 'Anda tidak memiliki akses',
    AUTH_FORBIDDEN: 'Akses ditolak',
    AUTH_EMAIL_EXISTS: 'Email sudah terdaftar',
    AUTH_PASSWORD_TOO_SHORT: 'Password minimal 6 karakter',
    AUTH_PASSWORD_REQUIRED: 'Password wajib diisi',
    AUTH_EMAIL_REQUIRED: 'Email wajib diisi',
    AUTH_NAME_REQUIRED: 'Nama wajib diisi',

    // Report messages
    REPORT_CREATE_SUCCESS: 'Laporan berhasil dibuat',
    REPORT_CREATE_FAILED: 'Gagal membuat laporan',
    REPORT_UPDATE_SUCCESS: 'Laporan berhasil diperbarui',
    REPORT_UPDATE_FAILED: 'Gagal memperbarui laporan',
    REPORT_DELETE_SUCCESS: 'Laporan berhasil dihapus',
    REPORT_DELETE_FAILED: 'Gagal menghapus laporan',
    REPORT_NOT_FOUND: 'Laporan tidak ditemukan',
    REPORT_FETCH_SUCCESS: 'Data laporan berhasil diambil',
    REPORT_FETCH_FAILED: 'Gagal mengambil data laporan',
    REPORT_VALIDATION_ERROR: 'Data laporan tidak valid',

    // File upload messages
    FILE_UPLOAD_SUCCESS: 'File berhasil diupload',
    FILE_UPLOAD_FAILED: 'Gagal mengupload file',
    FILE_INVALID_TYPE:
      'Jenis file tidak valid. Hanya gambar (JPEG, PNG, WebP, GIF) yang diperbolehkan',
    FILE_TOO_LARGE: 'Ukuran file terlalu besar. Maksimal 5MB per file',
    FILE_TOO_MANY: 'Terlalu banyak file. Maksimal 5 file per request',
    FILE_REQUIRED: 'File wajib diupload',

    // Validation messages
    VALIDATION_REQUIRED: 'Field ini wajib diisi',
    VALIDATION_INVALID_EMAIL: 'Format email tidak valid',
    VALIDATION_INVALID_TYPE: 'Tipe data tidak valid',
    VALIDATION_MIN_LENGTH: 'Panjang minimal tidak terpenuhi',
    VALIDATION_MAX_LENGTH: 'Panjang maksimal terlampaui',

    // General messages
    SUCCESS: 'Berhasil',
    ERROR: 'Terjadi kesalahan',
    NOT_FOUND: 'Data tidak ditemukan',
    INTERNAL_SERVER_ERROR: 'Terjadi kesalahan pada server',
    BAD_REQUEST: 'Request tidak valid',
    UNAUTHORIZED: 'Tidak memiliki akses',
    FORBIDDEN: 'Akses ditolak',
  },
  en: {
    // English translations can be added here
    AUTH_LOGIN_SUCCESS: 'Login successful',
    AUTH_LOGIN_FAILED: 'Login failed',
    AUTH_LOGOUT_SUCCESS: 'Logout successful',
    AUTH_REGISTER_SUCCESS: 'Registration successful',
    AUTH_REGISTER_FAILED: 'Registration failed',
    AUTH_INVALID_CREDENTIALS: 'Invalid email or password',
    AUTH_TOKEN_EXPIRED: 'Token expired',
    AUTH_TOKEN_INVALID: 'Invalid token',
    AUTH_UNAUTHORIZED: 'Unauthorized',
    AUTH_FORBIDDEN: 'Forbidden',
    AUTH_EMAIL_EXISTS: 'Email already exists',
    AUTH_PASSWORD_TOO_SHORT: 'Password must be at least 6 characters',
    AUTH_PASSWORD_REQUIRED: 'Password is required',
    AUTH_EMAIL_REQUIRED: 'Email is required',
    AUTH_NAME_REQUIRED: 'Name is required',
    REPORT_CREATE_SUCCESS: 'Report created successfully',
    REPORT_CREATE_FAILED: 'Failed to create report',
    REPORT_UPDATE_SUCCESS: 'Report updated successfully',
    REPORT_UPDATE_FAILED: 'Failed to update report',
    REPORT_DELETE_SUCCESS: 'Report deleted successfully',
    REPORT_DELETE_FAILED: 'Failed to delete report',
    REPORT_NOT_FOUND: 'Report not found',
    REPORT_FETCH_SUCCESS: 'Reports fetched successfully',
    REPORT_FETCH_FAILED: 'Failed to fetch reports',
    REPORT_VALIDATION_ERROR: 'Report validation error',
    FILE_UPLOAD_SUCCESS: 'File uploaded successfully',
    FILE_UPLOAD_FAILED: 'Failed to upload file',
    FILE_INVALID_TYPE: 'Invalid file type. Only images (JPEG, PNG, WebP, GIF) are allowed',
    FILE_TOO_LARGE: 'File too large. Maximum 5MB per file',
    FILE_TOO_MANY: 'Too many files. Maximum 5 files per request',
    FILE_REQUIRED: 'File is required',
    VALIDATION_REQUIRED: 'This field is required',
    VALIDATION_INVALID_EMAIL: 'Invalid email format',
    VALIDATION_INVALID_TYPE: 'Invalid data type',
    VALIDATION_MIN_LENGTH: 'Minimum length not met',
    VALIDATION_MAX_LENGTH: 'Maximum length exceeded',
    SUCCESS: 'Success',
    ERROR: 'An error occurred',
    NOT_FOUND: 'Not found',
    INTERNAL_SERVER_ERROR: 'Internal server error',
    BAD_REQUEST: 'Bad request',
    UNAUTHORIZED: 'Unauthorized',
    FORBIDDEN: 'Forbidden',
  },
};

export function translate(messageKey: MessageKey, locale: string = 'id'): string {
  return translations[locale]?.[messageKey] || messageKey;
}

export function getMessage(messageKey: MessageKey, locale?: string): string {
  const lang = locale || process.env.DEFAULT_LOCALE || 'id';
  return translate(messageKey, lang);
}
