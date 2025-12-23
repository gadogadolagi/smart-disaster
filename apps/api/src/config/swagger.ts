import swaggerJsdoc from 'swagger-jsdoc';
import { Application } from 'express';
import swaggerUi from 'swagger-ui-express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Portal Bencana API',
      version: '1.0.0',
      description: `
API untuk Portal Bencana - Sistem Pelaporan Bencana dan Kerusakan Jalan

## Fitur Utama
- **Autentikasi**: Login, Register, Profile Management
- **Laporan Bencana**: CRUD laporan bencana dengan upload gambar
- **Laporan Jalan**: CRUD laporan kerusakan jalan dengan AI analysis
- **User Management**: Kelola pengguna (admin only)

## Authentication
API menggunakan JWT (JSON Web Token) untuk autentikasi.
Tambahkan header \`Authorization: Bearer <token>\` pada request yang memerlukan autentikasi.
      `,
      contact: {
        name: 'UHTP Smart Disaster Team',
        email: 'support@uhtp.ac.id',
      },
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3001',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string', example: 'VALIDATION_ERROR' },
                message: { type: 'string', example: 'Validation failed' },
                details: { type: 'array', items: { type: 'object' } },
              },
            },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
            total: { type: 'number', example: 100 },
            totalPages: { type: 'number', example: 10 },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string', nullable: true },
            role: { type: 'string', enum: ['citizen', 'government', 'admin'] },
            avatar: { type: 'string', nullable: true },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        DisasterReport: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            type: {
              type: 'string',
              enum: ['flood', 'fire', 'earthquake', 'landslide', 'fallen_tree', 'other'],
            },
            title: { type: 'string' },
            description: { type: 'string' },
            address: { type: 'string' },
            lat: { type: 'number' },
            lng: { type: 'number' },
            district: { type: 'string' },
            images: { type: 'array', items: { type: 'string' } },
            status: {
              type: 'string',
              enum: ['pending', 'verified', 'in_progress', 'resolved', 'rejected'],
            },
            riskLevel: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
            reporterName: { type: 'string', nullable: true },
            reporterPhone: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        RoadReport: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            type: {
              type: 'string',
              enum: ['pothole', 'crack', 'landslide', 'flooding', 'bridge_damage'],
            },
            title: { type: 'string' },
            description: { type: 'string' },
            address: { type: 'string' },
            lat: { type: 'number' },
            lng: { type: 'number' },
            district: { type: 'string' },
            images: { type: 'array', items: { type: 'string' } },
            status: {
              type: 'string',
              enum: ['pending', 'verified', 'in_progress', 'resolved', 'rejected'],
            },
            dangerLevel: { type: 'string', enum: ['low', 'moderate', 'high', 'critical'] },
            aiDetectedIssues: { type: 'array', items: { type: 'string' } },
            aiConfidence: { type: 'number', nullable: true },
            aiRecommendedAction: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    tags: [
      { name: 'Health', description: 'Health check endpoints' },
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Reports - Disaster', description: 'Disaster report management' },
      { name: 'Reports - Road', description: 'Road damage report management' },
      { name: 'Users', description: 'User management (admin only)' },
    ],
  },
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts',
  ],
};

const swaggerSpec = swaggerJsdoc(options);

/**
 * Setup Swagger documentation
 */
export function setupSwagger(app: Application): void {
  // Swagger UI
  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Portal Bencana API Docs',
    })
  );

  // JSON spec endpoint
  app.get('/api/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
}

export { swaggerSpec };

