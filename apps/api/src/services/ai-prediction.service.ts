import * as fs from 'fs';
import * as path from 'path';
import { logger } from '../utils/logger';
import { potholeService } from './pothole.service';

/**
 * Interface untuk hasil prediksi AI
 */
export interface AIPredictionResult {
  urgencyPercentage: number; // 0-100
  confidence?: number;
  detectedIssues?: string[];
  recommendedAction?: string;
  metadata?: Record<string, any>;
}

/**
 * Interface untuk config prediksi per jenis report
 */
export interface AIPredictionConfig {
  enabled: boolean;
  type: 'text' | 'image' | 'hybrid';
  handler: (data: any) => Promise<AIPredictionResult>;
}

/**
 * Mapping kategori pothole ke urgency percentage
 */
const POTHOLE_URGENCY_MAP: Record<string, number> = {
  Baik: 10,
  Sedang: 40,
  'Rusak Ringan': 60,
  'Rusak Berat': 90,
};

/**
 * Service untuk prediksi AI berbagai jenis bencana
 */
class AIPredictionService {
  private configs: Map<string, AIPredictionConfig> = new Map();

  constructor() {
    this.initializeConfigs();
  }

  /**
   * Initialize config untuk berbagai jenis prediksi
   */
  private initializeConfigs() {
    // Config untuk prediksi banjir (text analysis)
    this.configs.set('disaster:flood', {
      enabled: true,
      type: 'text',
      handler: this.predictFloodUrgency.bind(this),
    });

    // Config untuk prediksi jalan rusak (image analysis)
    this.configs.set('road:pothole', {
      enabled: true,
      type: 'image',
      handler: this.predictRoadUrgency.bind(this),
    });

    // Default untuk jenis bencana lain (text analysis)
    this.configs.set('disaster:default', {
      enabled: true,
      type: 'text',
      handler: this.predictDisasterUrgency.bind(this),
    });

    // Default untuk jenis jalan rusak lain (image analysis jika ada gambar)
    this.configs.set('road:default', {
      enabled: true,
      type: 'image',
      handler: this.predictRoadUrgency.bind(this),
    });
  }

  /**
   * Get config untuk jenis report tertentu
   */
  private getConfig(reportType: 'disaster' | 'road', type: string): AIPredictionConfig | null {
    const key = `${reportType}:${type}`;
    const specificConfig = this.configs.get(key);

    if (specificConfig) {
      return specificConfig;
    }

    // Fallback ke default
    const defaultKey = `${reportType}:default`;
    return this.configs.get(defaultKey) || null;
  }

  /**
   * Prediksi urgensi untuk banjir berdasarkan text description
   */
  private async predictFloodUrgency(data: {
    description: string;
    title?: string;
    images?: string[];
  }): Promise<AIPredictionResult> {
    try {
      const text = `${data.title || ''} ${data.description}`.toLowerCase();

      // Keywords untuk tingkat urgensi tinggi
      const highUrgencyKeywords = [
        'tinggi',
        'dalam',
        'menenggelamkan',
        'mengancam',
        'kritis',
        'sangat parah',
        'evakuasi',
        'darurat',
        'mendesak',
        'bahaya',
        'tenggelam',
        'terendam',
        'banjir bandang',
        'luapan',
        'jebol',
      ];

      // Keywords untuk tingkat urgensi sedang
      const mediumUrgencyKeywords = [
        'sedang',
        'cukup',
        'lumayan',
        'perlu perhatian',
        'waspada',
        'genangan',
        'menggenang',
        'tergenang',
        'basah',
      ];

      // Keywords untuk tingkat urgensi rendah
      const lowUrgencyKeywords = [
        'ringan',
        'kecil',
        'sedikit',
        'tidak parah',
        'normal',
        'biasa',
        'tidak mengganggu',
      ];

      let urgencyScore = 30; // Default medium

      // Hitung score berdasarkan keywords
      const highCount = highUrgencyKeywords.filter((keyword) => text.includes(keyword)).length;
      const mediumCount = mediumUrgencyKeywords.filter((keyword) => text.includes(keyword)).length;
      const lowCount = lowUrgencyKeywords.filter((keyword) => text.includes(keyword)).length;

      if (highCount > 0) {
        urgencyScore = Math.min(95, 60 + highCount * 10);
      } else if (mediumCount > 0) {
        urgencyScore = 40 + mediumCount * 5;
      } else if (lowCount > 0) {
        urgencyScore = Math.max(10, 30 - lowCount * 5);
      }

      // Adjust berdasarkan panjang description (semakin detail biasanya semakin urgent)
      if (data.description.length > 200) {
        urgencyScore = Math.min(100, urgencyScore + 10);
      }

      // Clamp antara 0-100
      urgencyScore = Math.max(0, Math.min(100, urgencyScore));

      const detectedIssues: string[] = [];
      if (highCount > 0) detectedIssues.push('Kondisi kritis terdeteksi');
      if (text.includes('evakuasi')) detectedIssues.push('Perlu evakuasi');
      if (text.includes('jebol')) detectedIssues.push('Infrastruktur jebol');

      let recommendedAction = 'Monitor kondisi';
      if (urgencyScore >= 80) {
        recommendedAction = 'Segera lakukan evakuasi dan penanganan darurat';
      } else if (urgencyScore >= 60) {
        recommendedAction = 'Perlu penanganan segera';
      } else if (urgencyScore >= 40) {
        recommendedAction = 'Perlu perhatian dan monitoring';
      }

      return {
        urgencyPercentage: urgencyScore,
        confidence: 0.75,
        detectedIssues,
        recommendedAction,
        metadata: {
          highKeywords: highCount,
          mediumKeywords: mediumCount,
          lowKeywords: lowCount,
        },
      };
    } catch (error) {
      logger.error('Failed to predict flood urgency', {
        error: error instanceof Error ? error.message : String(error),
      });
      // Return default jika error
      return {
        urgencyPercentage: 50,
        confidence: 0,
      };
    }
  }

  /**
   * Prediksi urgensi untuk jalan rusak berdasarkan image analysis
   */
  private async predictRoadUrgency(data: {
    description?: string;
    images?: string[];
    type?: string;
  }): Promise<AIPredictionResult> {
    try {
      let urgencyScore = 50; // Default
      let detectedIssues: string[] = [];
      let confidence = 0.5;

      // Jika ada gambar dan type adalah pothole, gunakan pothole service
      if (data.images && data.images.length > 0 && data.type === 'pothole') {
        try {
          // Ambil gambar pertama untuk prediksi
          const firstImagePath = data.images[0];
          // Convert relative path ke absolute path
          const absoluteImagePath = path.join(
            process.cwd(),
            firstImagePath.startsWith('/') ? firstImagePath.slice(1) : firstImagePath
          );

          if (fs.existsSync(absoluteImagePath)) {
            const prediction = await potholeService.predictPothole(absoluteImagePath);

            // Map kategori ke urgency percentage
            urgencyScore = POTHOLE_URGENCY_MAP[prediction.category] || 50;
            confidence = prediction.confidence;

            detectedIssues.push(`Kondisi jalan: ${prediction.category}`);

            // Tambahkan info dari prediksi
            if (prediction.allPredictions && prediction.allPredictions.length > 0) {
              const top3 = prediction.allPredictions.slice(0, 3);
              detectedIssues.push(
                `Prediksi: ${top3.map((p) => `${p.category} (${(p.confidence * 100).toFixed(1)}%)`).join(', ')}`
              );
            }

            let recommendedAction = 'Monitor kondisi jalan';
            if (urgencyScore >= 80) {
              recommendedAction = 'Perlu perbaikan segera - kondisi jalan sangat berbahaya';
            } else if (urgencyScore >= 60) {
              recommendedAction = 'Perlu perbaikan dalam waktu dekat';
            } else if (urgencyScore >= 40) {
              recommendedAction = 'Perlu perawatan rutin';
            } else {
              recommendedAction = 'Kondisi jalan masih baik';
            }

            return {
              urgencyPercentage: urgencyScore,
              confidence,
              detectedIssues,
              recommendedAction,
              metadata: {
                category: prediction.category,
                allPredictions: prediction.allPredictions,
              },
            };
          }
        } catch (error) {
          logger.error('Failed to use pothole service for prediction', {
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      // Fallback: analisa berdasarkan text description jika ada
      if (data.description) {
        const text = data.description.toLowerCase();
        const highKeywords = ['parah', 'besar', 'dalam', 'berbahaya', 'kritis'];
        const mediumKeywords = ['sedang', 'cukup', 'lumayan'];
        const lowKeywords = ['kecil', 'ringan', 'sedikit'];

        const highCount = highKeywords.filter((k) => text.includes(k)).length;
        const mediumCount = mediumKeywords.filter((k) => text.includes(k)).length;
        const lowCount = lowKeywords.filter((k) => text.includes(k)).length;

        if (highCount > 0) {
          urgencyScore = Math.min(90, 70 + highCount * 5);
        } else if (mediumCount > 0) {
          urgencyScore = 50 + mediumCount * 5;
        } else if (lowCount > 0) {
          urgencyScore = Math.max(20, 50 - lowCount * 5);
        }
      }

      return {
        urgencyPercentage: Math.max(0, Math.min(100, urgencyScore)),
        confidence,
        detectedIssues,
        recommendedAction: urgencyScore >= 70 ? 'Perlu penanganan segera' : 'Monitor kondisi',
      };
    } catch (error) {
      logger.error('Failed to predict road urgency', {
        error: error instanceof Error ? error.message : String(error),
      });
      return {
        urgencyPercentage: 50,
        confidence: 0,
      };
    }
  }

  /**
   * Prediksi urgensi untuk bencana umum (text analysis)
   */
  private async predictDisasterUrgency(data: {
    description: string;
    title?: string;
    type?: string;
    images?: string[];
  }): Promise<AIPredictionResult> {
    try {
      const text = `${data.title || ''} ${data.description}`.toLowerCase();

      // Similar logic dengan flood tapi lebih general
      const highUrgencyKeywords = [
        'kritis',
        'darurat',
        'mendesak',
        'bahaya',
        'mengancam',
        'parah',
        'sangat',
        'evakuasi',
        'korban',
      ];

      const mediumUrgencyKeywords = ['sedang', 'cukup', 'perlu perhatian', 'waspada'];

      const lowUrgencyKeywords = ['ringan', 'kecil', 'tidak parah', 'normal'];

      let urgencyScore = 40;

      const highCount = highUrgencyKeywords.filter((k) => text.includes(k)).length;
      const mediumCount = mediumUrgencyKeywords.filter((k) => text.includes(k)).length;
      const lowCount = lowUrgencyKeywords.filter((k) => text.includes(k)).length;

      if (highCount > 0) {
        urgencyScore = Math.min(95, 60 + highCount * 8);
      } else if (mediumCount > 0) {
        urgencyScore = 40 + mediumCount * 5;
      } else if (lowCount > 0) {
        urgencyScore = Math.max(15, 40 - lowCount * 5);
      }

      const detectedIssues: string[] = [];
      if (highCount > 0) detectedIssues.push('Kondisi darurat terdeteksi');
      if (text.includes('korban')) detectedIssues.push('Ada korban');

      return {
        urgencyPercentage: Math.max(0, Math.min(100, urgencyScore)),
        confidence: 0.7,
        detectedIssues,
        recommendedAction:
          urgencyScore >= 80
            ? 'Segera lakukan penanganan darurat'
            : urgencyScore >= 60
              ? 'Perlu penanganan segera'
              : 'Monitor kondisi',
      };
    } catch (error) {
      logger.error('Failed to predict disaster urgency', {
        error: error instanceof Error ? error.message : String(error),
      });
      return {
        urgencyPercentage: 50,
        confidence: 0,
      };
    }
  }

  /**
   * Predict urgency untuk report
   */
  async predictUrgency(
    reportType: 'disaster' | 'road',
    type: string,
    data: {
      description: string;
      title?: string;
      images?: string[];
      type?: string;
    }
  ): Promise<AIPredictionResult> {
    try {
      const config = this.getConfig(reportType, type);

      if (!config || !config.enabled) {
        logger.warn(`AI prediction not configured for ${reportType}:${type}`);
        return {
          urgencyPercentage: 50,
          confidence: 0,
        };
      }

      logger.info(`Running AI prediction for ${reportType}:${type}`, {
        type: config.type,
      });

      const result = await config.handler(data);

      logger.info(`AI prediction completed`, {
        reportType,
        type,
        urgencyPercentage: result.urgencyPercentage,
        confidence: result.confidence,
      });

      return result;
    } catch (error) {
      logger.error('Failed to predict urgency', {
        error: error instanceof Error ? error.message : String(error),
        reportType,
        type,
      });
      // Return default jika error
      return {
        urgencyPercentage: 50,
        confidence: 0,
      };
    }
  }
}

export const aiPredictionService = new AIPredictionService();
