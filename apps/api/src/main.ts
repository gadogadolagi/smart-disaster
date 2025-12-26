import compression from 'compression';
import cors from 'cors';
import express, { Application } from 'express';
import helmet from 'helmet';
import path from 'path';

// Load and validate environment variables first
import { env, envConfig } from './utils/env';

// Import middleware
import { apiRateLimiter, requestIdMiddleware } from './middleware';
import { errorHandler, notFoundHandler } from './utils/errorHandler';
import { logger } from './utils/logger';

// Import routes
import authRoutes from './routes/auth.routes';
import healthRoutes from './routes/health.routes';
import reportRoutes from './routes/report.routes';
import userRoutes from './routes/user.routes';
import potholeRoutes from './routes/pothole.routes';
import assignmentRoutes from './routes/assignment.routes';
import activityRoutes from './routes/activity.routes';
import commentRoutes from './routes/comment.routes';
import statsRoutes from './routes/stats.routes';

// Import swagger setup
import { setupSwagger } from './config/swagger';

const app: Application = express();

// Trust proxy (for rate limiting, IP detection behind reverse proxy)
app.set('trust proxy', 1);

// ============================================
// Security Middleware
// ============================================

// Helmet - Security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'blob:'],
      },
    },
    crossOriginEmbedderPolicy: false, // Allow embedding images
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow cross-origin resource loading
  })
);

// CORS configuration
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) {
      callback(null, true);
      return;
    }

    // In development, allow all origins
    if (envConfig.isDev) {
      callback(null, true);
      return;
    }

    // In production, check against allowed origins
    if (envConfig.allowedOrigins.length === 0 || envConfig.allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  exposedHeaders: ['X-Request-ID', 'RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset'],
  maxAge: 86400, // 24 hours
};

app.use(cors(corsOptions));

// ============================================
// Performance Middleware
// ============================================

// Compression - gzip/deflate response bodies
app.use(
  compression({
    filter: (req, res) => {
      // Don't compress if client doesn't accept it
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    },
    level: 6, // Balanced compression level
    threshold: 1024, // Only compress responses > 1KB
  })
);

// ============================================
// Request Processing Middleware
// ============================================

// Request ID - Add unique ID to each request
app.use(requestIdMiddleware);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();

  // Log request
  logger.info(`→ ${req.method} ${req.path}`, {
    requestId: req.requestId,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? 'warn' : 'info';

    logger[logLevel](`← ${req.method} ${req.path} ${res.statusCode} ${duration}ms`, {
      requestId: req.requestId,
      statusCode: res.statusCode,
      duration,
    });
  });

  next();
});

// ============================================
// Rate Limiting
// ============================================

// Apply general rate limiting to all API routes
app.use('/api', apiRateLimiter);

// ============================================
// Static Files
// ============================================

// Serve uploaded files with proper headers
app.use(
  '/uploads',
  express.static(path.join(process.cwd(), 'uploads'), {
    maxAge: '1d', // Cache for 1 day
    etag: true,
    lastModified: true,
    index: false, // Disable directory listing
  })
);

// ============================================
// API Documentation (Swagger)
// ============================================

setupSwagger(app);

// ============================================
// Routes
// ============================================

// Health check routes (no rate limiting)
app.use('/health', healthRoutes);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);
app.use('/api/pothole', potholeRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/stats', statsRoutes);

// ============================================
// Error Handling
// ============================================

// 404 handler - must be after all routes
app.use(notFoundHandler);

// Global error handler - must be last
app.use(errorHandler);

// ============================================
// Server Startup
// ============================================

const server = app.listen(envConfig.port, () => {
  logger.info('🚀 Server started successfully', {
    port: envConfig.port,
    environment: env.NODE_ENV,
    swagger: `http://localhost:${envConfig.port}/api/docs`,
  });

  if (envConfig.isDev) {
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    Portal Bencana API                        ║
╠══════════════════════════════════════════════════════════════╣
║  🌐 Server:    http://localhost:${envConfig.port}                       ║
║  📚 API Docs:  http://localhost:${envConfig.port}/api/docs              ║
║  💚 Health:    http://localhost:${envConfig.port}/health                ║
║  📊 Detailed:  http://localhost:${envConfig.port}/health/detailed       ║
╠══════════════════════════════════════════════════════════════╣
║  Environment: ${env.NODE_ENV.padEnd(45)}║
╚══════════════════════════════════════════════════════════════╝
    `);
  }
});

// ============================================
// Graceful Shutdown
// ============================================

const gracefulShutdown = (signal: string) => {
  logger.info(`${signal} signal received: starting graceful shutdown`);

  server.close((err) => {
    if (err) {
      logger.error('Error during shutdown', { error: err.message });
      process.exit(1);
    }

    logger.info('HTTP server closed');

    // Close database connections
    import('./lib/prisma')
      .then(({ prisma }) => prisma.$disconnect())
      .then(() => {
        logger.info('Database connection closed');
        process.exit(0);
      })
      .catch((error) => {
        logger.error('Error closing database connection', { error: error.message });
        process.exit(1);
      });
  });

  // Force exit after 30 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', {
    error: error.message,
    stack: error.stack,
  });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', {
    reason: reason instanceof Error ? reason.message : String(reason),
    stack: reason instanceof Error ? reason.stack : undefined,
  });
});

export default app;
