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

    // Config untuk prediksi jalan rusak - semua jenis menggunakan pothole service
    this.configs.set('road:pothole', {
      enabled: true,
      type: 'image',
      handler: this.predictRoadUrgency.bind(this),
    });
    this.configs.set('road:landslide', {
      enabled: true,
      type: 'image',
      handler: this.predictRoadUrgency.bind(this),
    });
    this.configs.set('road:bridge_damage', {
      enabled: true,
      type: 'image',
      handler: this.predictRoadUrgency.bind(this),
    });
    this.configs.set('road:crack', {
      enabled: true,
      type: 'image',
      handler: this.predictRoadUrgency.bind(this),
    });
    this.configs.set('road:flooding', {
      enabled: true,
      type: 'image',
      handler: this.predictRoadUrgency.bind(this),
    });

    // Default untuk jenis bencana lain (tidak menggunakan AI untuk sekarang)
    this.configs.set('disaster:default', {
      enabled: true,
      type: 'text',
      handler: this.predictDisasterUrgency.bind(this),
    });

    // Default untuk jenis jalan rusak lain (semua menggunakan pothole service)
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
   * Prediksi urgensi untuk banjir menggunakan API eksternal
   */
  private async predictFloodUrgency(data: {
    description: string;
    title?: string;
    images?: string[];
  }): Promise<AIPredictionResult> {
    try {
      const apiUrl = 'https://1026181e1615.ngrok-free.app/api/predict/flood';
      const comment = `${data.title || ''} ${data.description}`.trim();

      logger.info('Calling external flood prediction API', {
        apiUrl,
        commentLength: comment.length,
      });

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comment: comment,
          models: 'smv',
        }),
      });

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }

      const apiResult = (await response.json()) as {
        success: boolean;
        prediction?: {
          label?: string;
          confidence?: number;
          priority?: number;
          color?: string;
          icon?: string;
          model?: string;
        };
        probabilities?: {
          high?: number;
          medium?: number;
          low?: number;
        };
        type?: string;
        timestamp?: string;
      };

      logger.info('Flood prediction API response', {
        success: apiResult.success,
        label: apiResult.prediction?.label,
        confidence: apiResult.prediction?.confidence,
      });

      if (!apiResult.success || !apiResult.prediction) {
        throw new Error('Invalid API response');
      }

      // Map priority dari API ke urgency percentage (0-100)
      // priority: 0 = Rendah, 1 = Sedang, 2 = Tinggi
      let urgencyScore = 0;
      const label = apiResult.prediction.label?.toLowerCase() || '';
      const confidence = apiResult.prediction.confidence || 0;

      if (label.includes('rendah') || apiResult.prediction.priority === 0) {
        urgencyScore = 20 + (confidence / 100) * 20; // 20-40
      } else if (label.includes('sedang') || apiResult.prediction.priority === 1) {
        urgencyScore = 40 + (confidence / 100) * 30; // 40-70
      } else if (label.includes('tinggi') || apiResult.prediction.priority === 2) {
        urgencyScore = 70 + (confidence / 100) * 30; // 70-100
      } else {
        // Fallback berdasarkan probabilities
        const probs = apiResult.probabilities || {};
        if (probs.high && probs.high > (probs.medium || 0) && probs.high > (probs.low || 0)) {
          urgencyScore = 70 + (probs.high / 100) * 30;
        } else if (probs.medium && probs.medium > (probs.low || 0)) {
          urgencyScore = 40 + (probs.medium / 100) * 30;
        } else if (probs.low) {
          urgencyScore = 20 + (probs.low / 100) * 20;
        }
      }

      // Clamp antara 0-100
      urgencyScore = Math.max(0, Math.min(100, urgencyScore));

      const detectedIssues: string[] = [];
      if (apiResult.prediction.label) {
        detectedIssues.push(`Tingkat urgensi: ${apiResult.prediction.label}`);
      }
      if (apiResult.prediction.priority === 2) {
        detectedIssues.push('Kondisi kritis - perlu penanganan segera');
      }

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
        confidence: confidence / 100, // Convert dari 0-100 ke 0-1
        detectedIssues,
        recommendedAction,
        metadata: {
          apiResponse: apiResult,
          label: apiResult.prediction.label,
          priority: apiResult.prediction.priority,
          probabilities: apiResult.probabilities,
        },
      };
    } catch (error) {
      logger.error('Failed to predict flood urgency from API', {
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
   * Prediksi urgensi untuk jalan rusak menggunakan pothole service (sama seperti API pothole)
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

      // Gunakan pothole service untuk semua jenis jalan rusak jika ada gambar
      if (data.images && data.images.length > 0) {
        try {
          // Ambil gambar pertama untuk prediksi
          const firstImagePath = data.images[0];
          if (!firstImagePath) {
            throw new Error('No image path provided');
          }
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
                type: data.type,
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
   * Prediksi urgensi untuk bencana umum (selain banjir - tidak menggunakan AI untuk sekarang)
   */
  private async predictDisasterUrgency(data: {
    description: string;
    title?: string;
    type?: string;
    images?: string[];
  }): Promise<AIPredictionResult> {
    // Untuk bencana selain banjir, tidak menggunakan AI prediction
    // Return null/0 karena API machine learning belum siap
    logger.info('Disaster type is not flood, skipping AI prediction', {
      type: data.type,
    });

    return {
      urgencyPercentage: 0,
      confidence: 0,
      detectedIssues: [],
      recommendedAction: 'Menunggu analisa lebih lanjut',
      metadata: {
        reason: 'AI prediction not available for this disaster type',
        type: data.type,
      },
    };
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
