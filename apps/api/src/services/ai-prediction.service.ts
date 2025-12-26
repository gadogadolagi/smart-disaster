import * as fs from 'fs';
import * as path from 'path';
import { envConfig } from '../utils/env';
import { logger } from '../utils/logger';

/**
 * Interface untuk hasil prediksi AI
 */
export interface AIPredictionResult {
  urgencyPercentage: number | null; // 0-100 atau null jika service mati
  confidence?: number | null;
  detectedIssues?: string[];
  recommendedAction?: string | null; // Recommendation dari ML service
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
 * Service untuk prediksi AI berbagai jenis bencana
 */
class AIPredictionService {
  private configs: Map<string, AIPredictionConfig> = new Map();
  private aiServiceUrl: string;

  constructor() {
    this.aiServiceUrl = envConfig.aiServiceUrl;
    this.initializeConfigs();
  }

  /**
   * Initialize config untuk berbagai jenis prediksi
   * Hanya banjir (dari deskripsi) dan jalan (dari gambar) yang menggunakan AI
   */
  private initializeConfigs() {
    // Config untuk prediksi banjir (text analysis dari deskripsi)
    this.configs.set('disaster:flood', {
      enabled: true,
      type: 'text',
      handler: this.predictFloodUrgency.bind(this),
    });

    // Config untuk prediksi jalan rusak (image analysis dari gambar)
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

    // Default untuk jenis jalan rusak lain (semua menggunakan image)
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

    // Fallback ke default untuk road
    if (reportType === 'road') {
      const defaultKey = `${reportType}:default`;
      return this.configs.get(defaultKey) || null;
    }

    // Untuk disaster selain banjir, tidak ada prediksi
    return null;
  }

  /**
   * Check if AI service is available
   */
  private async checkAIServiceHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.aiServiceUrl}/`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });
      return response.ok;
    } catch (error) {
      logger.warn('AI service is not available', {
        error: error instanceof Error ? error.message : String(error),
        url: this.aiServiceUrl,
      });
      return false;
    }
  }

  /**
   * Prediksi urgensi untuk banjir menggunakan service-ai (dari deskripsi)
   */
  private async predictFloodUrgency(data: {
    description: string;
    title?: string;
    images?: string[];
  }): Promise<AIPredictionResult> {
    // Check if service is available
    const isAvailable = await this.checkAIServiceHealth();
    if (!isAvailable) {
      logger.warn('AI service not available, skipping flood prediction');
      return {
        urgencyPercentage: null,
        confidence: null,
        recommendedAction: null,
      };
    }

    try {
      const apiUrl = `${this.aiServiceUrl}/predict/flood`;
      const comment = `${data.title || ''} ${data.description}`.trim();

      if (!comment) {
        logger.warn('Empty comment for flood prediction');
        return {
          urgencyPercentage: null,
          confidence: null,
          recommendedAction: null,
        };
      }

      logger.info('Calling AI service for flood prediction', {
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
        }),
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });

      if (!response.ok) {
        throw new Error(`AI service returned status ${response.status}`);
      }

      const apiResult = (await response.json()) as {
        status?: string;
        risk_level?: string;
        confidence?: number;
        total_severity?: number;
        severity_percentage?: {
          rendah?: number;
          sedang?: number;
          tinggi?: number;
        };
        recommendation?: string;
        original_comment?: string;
        cleaned_comment?: string;
      };

      logger.info('Flood prediction API response', {
        status: apiResult.status,
        risk_level: apiResult.risk_level,
        confidence: apiResult.confidence,
        total_severity: apiResult.total_severity,
      });

      if (apiResult.status !== 'success') {
        throw new Error('AI service returned unsuccessful status');
      }

      // Map total_severity (0-100) ke urgency percentage
      // total_severity sudah dalam range 0-100 dari service
      const urgencyPercentage = apiResult.total_severity ?? null;

      // Map risk_level ke detectedIssues
      const detectedIssues: string[] = [];
      if (apiResult.risk_level) {
        detectedIssues.push(`Tingkat risiko: ${apiResult.risk_level}`);
      }
      if (apiResult.severity_percentage) {
        const { rendah, sedang, tinggi } = apiResult.severity_percentage;
        if (tinggi && tinggi > 50) {
          detectedIssues.push('Kondisi kritis - perlu penanganan segera');
        }
      }

      return {
        urgencyPercentage,
        confidence: apiResult.confidence ? apiResult.confidence / 100 : null, // Convert dari 0-100 ke 0-1
        detectedIssues: detectedIssues.length > 0 ? detectedIssues : undefined,
        recommendedAction: apiResult.recommendation || null,
        metadata: {
          risk_level: apiResult.risk_level,
          total_severity: apiResult.total_severity,
          severity_percentage: apiResult.severity_percentage,
          original_comment: apiResult.original_comment,
          cleaned_comment: apiResult.cleaned_comment,
        },
      };
    } catch (error) {
      logger.error('Failed to predict flood urgency from AI service', {
        error: error instanceof Error ? error.message : String(error),
        url: this.aiServiceUrl,
      });
      // Return null jika error - tidak akan mengganggu proses pembuatan laporan
      return {
        urgencyPercentage: null,
        confidence: null,
        recommendedAction: null,
      };
    }
  }

  /**
   * Prediksi urgensi untuk jalan rusak menggunakan service-ai (dari gambar)
   */
  private async predictRoadUrgency(data: {
    description?: string;
    images?: string[];
    type?: string;
  }): Promise<AIPredictionResult> {
    // Check if service is available
    const isAvailable = await this.checkAIServiceHealth();
    if (!isAvailable) {
      logger.warn('AI service not available, skipping road prediction');
      return {
        urgencyPercentage: null,
        confidence: null,
        recommendedAction: null,
      };
    }

    // Hanya prediksi jika ada gambar
    if (!data.images || data.images.length === 0) {
      logger.warn('No images provided for road prediction');
      return {
        urgencyPercentage: null,
        confidence: null,
        recommendedAction: null,
      };
    }

    try {
      const apiUrl = `${this.aiServiceUrl}/predict/road`;
      const firstImagePath = data.images[0];

      if (!firstImagePath) {
        throw new Error('No image path provided');
      }

      // Convert relative path ke absolute path
      const absoluteImagePath = path.join(
        process.cwd(),
        firstImagePath.startsWith('/') ? firstImagePath.slice(1) : firstImagePath
      );

      if (!fs.existsSync(absoluteImagePath)) {
        throw new Error(`Image file not found: ${absoluteImagePath}`);
      }

      logger.info('Calling AI service for road prediction', {
        apiUrl,
        imagePath: firstImagePath,
      });

      // Read image file
      const imageBuffer = fs.readFileSync(absoluteImagePath);
      const fileName = path.basename(absoluteImagePath);

      // Create FormData menggunakan native FormData (Node.js 18+)
      const formData = new FormData();
      const imageBlob = new Blob([imageBuffer]);
      formData.append('file', imageBlob, fileName);

      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });

      if (!response.ok) {
        throw new Error(`AI service returned status ${response.status}`);
      }

      const apiResult = (await response.json()) as {
        status?: string;
        prediction_class?: string;
        confidence?: number;
        total_damage?: number;
        severity_percentage?: {
          baik?: number;
          rusak_berat?: number;
          rusak_ringan?: number;
          sedang?: number;
        };
        recommendation?: string;
      };

      logger.info('Road prediction API response', {
        status: apiResult.status,
        prediction_class: apiResult.prediction_class,
        confidence: apiResult.confidence,
        total_damage: apiResult.total_damage,
      });

      if (apiResult.status !== 'success') {
        throw new Error('AI service returned unsuccessful status');
      }

      // Map total_damage (0-100) ke urgency percentage
      // total_damage sudah dalam range 0-100 dari service
      const urgencyPercentage = apiResult.total_damage ?? null;

      // Map prediction_class ke detectedIssues
      const detectedIssues: string[] = [];
      if (apiResult.prediction_class) {
        detectedIssues.push(`Kondisi jalan: ${apiResult.prediction_class}`);
      }
      if (apiResult.severity_percentage) {
        const { baik, rusak_ringan, sedang, rusak_berat } = apiResult.severity_percentage;
        if (rusak_berat && rusak_berat > 50) {
          detectedIssues.push('Kerusakan parah ditemukan');
        } else if (sedang && sedang > 50) {
          detectedIssues.push('Kerusakan cukup terlihat');
        }
      }

      return {
        urgencyPercentage,
        confidence: apiResult.confidence ? apiResult.confidence / 100 : null, // Convert dari 0-100 ke 0-1
        detectedIssues: detectedIssues.length > 0 ? detectedIssues : undefined,
        recommendedAction: apiResult.recommendation || null,
        metadata: {
          prediction_class: apiResult.prediction_class,
          total_damage: apiResult.total_damage,
          severity_percentage: apiResult.severity_percentage,
        },
      };
    } catch (error) {
      logger.error('Failed to predict road urgency from AI service', {
        error: error instanceof Error ? error.message : String(error),
        url: this.aiServiceUrl,
      });
      // Return null jika error - tidak akan mengganggu proses pembuatan laporan
      return {
        urgencyPercentage: null,
        confidence: null,
        recommendedAction: null,
      };
    }
  }

  /**
   * Predict urgency untuk report
   * Hanya untuk banjir (disaster:flood) dan jalan (road:*)
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

      // Jika tidak ada config, berarti tidak perlu prediksi
      if (!config || !config.enabled) {
        logger.info(`AI prediction not configured for ${reportType}:${type}, skipping`);
        return {
          urgencyPercentage: null,
          confidence: null,
          recommendedAction: null,
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
        hasRecommendation: !!result.recommendedAction,
      });

      return result;
    } catch (error) {
      logger.error('Failed to predict urgency', {
        error: error instanceof Error ? error.message : String(error),
        reportType,
        type,
      });
      // Return null jika error - tidak akan mengganggu proses pembuatan laporan
      return {
        urgencyPercentage: null,
        confidence: null,
        recommendedAction: null,
      };
    }
  }
}

export const aiPredictionService = new AIPredictionService();
