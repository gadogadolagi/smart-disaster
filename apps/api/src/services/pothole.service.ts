import * as tf from '@tensorflow/tfjs-node';
import * as fs from 'fs';
import * as path from 'path';
import { logger } from '../utils/logger';

// Kategori kondisi jalan (4 kategori) - sesuai dengan training di notebook
// Urutan sesuai dengan class_indices dari train_generator: {'Baik': 0, 'Rusak Berat': 1, 'Rusak Ringan': 2, 'Sedang': 3}
export const POTHOLE_CATEGORIES = [
  'Baik', // Index 0
  'Rusak Berat', // Index 1
  'Rusak Ringan', // Index 2
  'Sedang', // Index 3
] as const;

export type PotholeCategory = (typeof POTHOLE_CATEGORIES)[number];

export interface PotholePrediction {
  category: PotholeCategory;
  confidence: number;
  allPredictions: Array<{
    category: PotholeCategory;
    confidence: number;
  }>;
}

class PotholeService {
  // Menggunakan GraphModel karena model diexport sebagai tfjs_graph_model
  private model: tf.GraphModel | null = null;
  private modelPath: string;
  private isModelLoading: boolean = false;
  private modelLoadPromise: Promise<void> | null = null;

  constructor() {
    // Path ke model folder
    this.modelPath = path.join(process.cwd(), 'models', 'potholes');
  }

  /**
   * Load model jika belum di-load
   */
  private async loadModel(): Promise<void> {
    // Jika model sudah di-load, return
    if (this.model) {
      return;
    }

    // Jika sedang loading, tunggu promise yang ada
    if (this.isModelLoading && this.modelLoadPromise) {
      return this.modelLoadPromise;
    }

    // Start loading
    this.isModelLoading = true;
    this.modelLoadPromise = this._loadModelInternal();

    try {
      await this.modelLoadPromise;
    } finally {
      this.isModelLoading = false;
    }
  }

  private async _loadModelInternal(): Promise<void> {
    try {
      const modelJsonPath = path.join(this.modelPath, 'model.json');

      // Check if model.json exists
      if (!fs.existsSync(modelJsonPath)) {
        throw new Error(`Model file not found at ${modelJsonPath}`);
      }

      logger.info('Loading pothole prediction model...', { modelPath: this.modelPath });

      // Load model menggunakan file:// protocol untuk local files
      // Gunakan loadGraphModel karena model diexport sebagai tfjs_graph_model
      const modelUrl = `file://${modelJsonPath}`;
      this.model = await tf.loadGraphModel(modelUrl);

      logger.info('Pothole prediction model loaded successfully');
    } catch (error) {
      logger.error('Failed to load pothole prediction model', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error(
        `Failed to load model: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Preprocess image untuk model menggunakan TensorFlow.js native functions
   * Ini lebih reliable dan compatible dengan model yang di-export
   */
  private async preprocessImage(imagePath: string): Promise<tf.Tensor4D> {
    try {
      // Read image file as buffer
      const imageBuffer = fs.readFileSync(imagePath);

      // Decode image menggunakan TensorFlow.js native decoder
      // Parameter kedua (3) memastikan output selalu RGB (3 channels)
      const decodedImage = tf.node.decodeImage(imageBuffer, 3);

      // Resize image ke 224x224 menggunakan bilinear interpolation
      const resizedImage = tf.image.resizeBilinear(decodedImage as tf.Tensor3D, [224, 224]);

      // Dispose decoded image karena sudah tidak diperlukan
      decodedImage.dispose();

      // Apply MobileNetV2 preprocessing: scale dari [0, 255] ke [-1, 1]
      // Formula: (x / 127.5) - 1
      const preprocessed = resizedImage.toFloat().div(127.5).sub(1);

      // Dispose resized image
      resizedImage.dispose();

      // Add batch dimension [224, 224, 3] -> [1, 224, 224, 3]
      const batched = preprocessed.expandDims(0) as tf.Tensor4D;

      // Dispose preprocessed tensor
      preprocessed.dispose();

      return batched;
    } catch (error) {
      logger.error('Failed to preprocess image', {
        error: error instanceof Error ? error.message : String(error),
        imagePath,
      });
      throw new Error(
        `Failed to preprocess image: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Predict kondisi jalan dari image
   */
  async predictPothole(imagePath: string): Promise<PotholePrediction> {
    try {
      // Load model jika belum
      await this.loadModel();

      if (!this.model) {
        throw new Error('Model not loaded');
      }

      // Preprocess image
      const preprocessedImage = await this.preprocessImage(imagePath);

      // Predict menggunakan GraphModel
      // GraphModel.predict() mengembalikan Tensor atau Tensor[]
      const prediction = this.model.predict(preprocessedImage);

      // Handle tipe prediction - bisa Tensor atau Tensor[]
      let predictionTensor: tf.Tensor;
      if (Array.isArray(prediction)) {
        const firstPrediction = prediction[0];
        if (!firstPrediction) {
          throw new Error('Model returned empty prediction array');
        }
        predictionTensor = firstPrediction;
      } else {
        predictionTensor = prediction as tf.Tensor;
      }

      // Get prediction data
      const predictionArray = await predictionTensor.data();

      // Cleanup tensors
      preprocessedImage.dispose();
      if (Array.isArray(prediction)) {
        prediction.forEach((t) => {
          if (t && typeof t.dispose === 'function') {
            t.dispose();
          }
        });
      } else if (prediction && typeof (prediction as tf.Tensor).dispose === 'function') {
        (prediction as tf.Tensor).dispose();
      }

      // Get predictions untuk semua kategori
      const allPredictions = POTHOLE_CATEGORIES.map((category, index) => ({
        category,
        confidence: Number(predictionArray[index] ?? 0),
      }));

      // Sort by confidence (descending)
      allPredictions.sort((a, b) => b.confidence - a.confidence);

      // Get top prediction - allPredictions always has 4 elements so this is safe
      const topPrediction = allPredictions[0]!;

      logger.info('Pothole prediction completed', {
        imagePath,
        predictedCategory: topPrediction.category,
        confidence: topPrediction.confidence,
      });

      return {
        category: topPrediction.category,
        confidence: topPrediction.confidence,
        allPredictions,
      };
    } catch (error) {
      logger.error('Failed to predict pothole', {
        error: error instanceof Error ? error.message : String(error),
        imagePath,
      });
      throw error;
    }
  }
}

export const potholeService = new PotholeService();
