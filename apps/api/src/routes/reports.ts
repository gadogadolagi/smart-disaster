import express, { Request, Response, Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { upload } from '../middleware/upload';

export const reportsRouter: Router = Router();

// Validation schemas for form data (with file upload)
const disasterReportFormSchema = z.object({
  type: z.enum(['flood', 'fire', 'fallen_tree', 'landslide', 'earthquake', 'other']),
  title: z.string().min(1, 'Judul laporan harus diisi'),
  description: z.string().min(1, 'Deskripsi harus diisi'),
  address: z.string().min(1, 'Alamat harus diisi'),
  lat: z.string().transform((val) => parseFloat(val)),
  lng: z.string().transform((val) => parseFloat(val)),
  district: z.string().min(1, 'Kecamatan harus diisi'),
  // Optional fields for anonymous reports
  reportedById: z.string().optional(),
  reporterName: z.string().optional(),
  reporterPhone: z.string().optional(),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']).optional().default('medium'),
});

// Validation schema for JSON API (backward compatibility)
const disasterReportSchema = z.object({
  type: z.enum(['flood', 'fire', 'fallen_tree', 'landslide', 'earthquake', 'other']),
  title: z.string().min(1),
  description: z.string().min(1),
  address: z.string().min(1),
  lat: z.number(),
  lng: z.number(),
  district: z.string().min(1),
  images: z.array(z.string()).optional().default([]),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']).optional().default('medium'),
  reportedById: z.string().optional(),
  reporterName: z.string().optional(),
  reporterPhone: z.string().optional(),
});

const roadReportSchema = z.object({
  type: z.enum(['pothole', 'landslide', 'bridge_damage', 'crack', 'flooding']),
  title: z.string().min(1),
  description: z.string().min(1),
  address: z.string().min(1),
  lat: z.number(),
  lng: z.number(),
  district: z.string().min(1),
  images: z.array(z.string()).optional().default([]),
  dangerLevel: z.enum(['minor', 'moderate', 'severe']).optional().default('moderate'),
  reportedById: z.string().min(1),
  aiDetectedIssues: z.array(z.string()).optional().default([]),
  aiConfidence: z.number().optional(),
  aiRecommendedAction: z.string().optional(),
});

const updateDisasterReportSchema = z.object({
  status: z.enum(['pending', 'verified', 'in_progress', 'resolved']).optional(),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  handledBy: z.string().optional(),
  notes: z.string().optional(),
});

const updateRoadReportSchema = z.object({
  status: z.enum(['pending', 'verified', 'in_progress', 'resolved']).optional(),
  dangerLevel: z.enum(['minor', 'moderate', 'severe']).optional(),
});

// ==================== DISASTER REPORTS ====================

// GET /api/reports/disaster - Get all disaster reports
reportsRouter.get('/disaster', async (req: Request, res: Response) => {
  try {
    const { status, riskLevel, district } = req.query;
    
    const where: any = {};
    if (status) where.status = status;
    if (riskLevel) where.riskLevel = riskLevel;
    if (district) {
      where.district = {
        contains: district as string,
        mode: 'insensitive' as const,
      };
    }

    const reports = await prisma.disasterReport.findMany({
      where,
      select: {
        id: true,
        type: true,
        title: true,
        description: true,
        address: true,
        lat: true,
        lng: true,
        district: true,
        images: true,
        status: true,
        riskLevel: true,
        reporterName: true,
        reporterPhone: true,
        handledBy: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
        reportedBy: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({ data: reports });
  } catch (error) {
    console.error('Error fetching disaster reports:', error);
    res.status(500).json({ error: 'Failed to fetch disaster reports' });
  }
});

// GET /api/reports/disaster/:id - Get single disaster report
reportsRouter.get('/disaster/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const report = await prisma.disasterReport.findUnique({
      where: { id },
      select: {
        id: true,
        type: true,
        title: true,
        description: true,
        address: true,
        lat: true,
        lng: true,
        district: true,
        images: true,
        status: true,
        riskLevel: true,
        reporterName: true,
        reporterPhone: true,
        handledBy: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
        reportedBy: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    if (!report) {
      return res.status(404).json({ error: 'Disaster report not found' });
    }

    res.json({ data: report });
  } catch (error) {
    console.error('Error fetching disaster report:', error);
    res.status(500).json({ error: 'Failed to fetch disaster report' });
  }
});

// POST /api/reports/disaster - Create disaster report (with file upload support)
reportsRouter.post('/disaster', (req: Request, res: Response, next: express.NextFunction) => {
  // Multer middleware with error handling
  upload.array('images', 5)(req, res, (err: any) => {
    if (err) {
      // Handle multer errors
      if (err instanceof Error) {
        if (err.message.includes('Invalid file type')) {
          return res.status(400).json({
            error: 'File upload error',
            message: 'Jenis file tidak valid. Hanya gambar (JPEG, PNG, WebP, GIF) yang diperbolehkan.',
          });
        }
        if (err.message.includes('File too large') || err.message.includes('LIMIT_FILE_SIZE')) {
          return res.status(400).json({
            error: 'File upload error',
            message: 'Ukuran file terlalu besar. Maksimal 5MB per file.',
          });
        }
        if (err.message.includes('LIMIT_FILE_COUNT')) {
          return res.status(400).json({
            error: 'File upload error',
            message: 'Terlalu banyak file. Maksimal 5 file per request.',
          });
        }
      }
      return res.status(400).json({
        error: 'File upload error',
        message: err.message || 'Terjadi kesalahan saat mengupload file.',
      });
    }
    next();
  });
}, async (req: Request, res: Response) => {
  try {
    // Handle file uploads
    const files = (req as any).files as Express.Multer.File[] || [];
    const imagePaths: string[] = [];
    
    if (files && files.length > 0) {
      files.forEach((file) => {
        // Store relative path from uploads folder
        const imagePath = `/uploads/${file.filename}`;
        imagePaths.push(imagePath);
        console.log(`File saved: ${file.filename} at ${file.path}`);
      });
    }

    console.log(`Received ${files.length} file(s) for upload`);

    // Parse and validate form data
    const formData = {
      ...req.body,
      lat: req.body.lat,
      lng: req.body.lng,
    };

    const validatedData = disasterReportFormSchema.parse(formData);

    // If reportedById is provided, verify user exists
    /* if (validatedData.reportedById) {
      const user = await prisma.user.findUnique({
        where: { id: validatedData.reportedById },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
    } */

    // Create report
    const report = await prisma.disasterReport.create({
      data: {
        type: validatedData.type,
        title: validatedData.title,
        description: validatedData.description,
        address: validatedData.address,
        lat: validatedData.lat,
        lng: validatedData.lng,
        district: validatedData.district,
        images: imagePaths,
        riskLevel: validatedData.riskLevel || 'medium',
        // User relation (if provided)
        reportedById: validatedData.reportedById || null,
        // Anonymous reporter info (if no user)
        reporterName: validatedData.reportedById ? null : (validatedData.reporterName || null),
        reporterPhone: validatedData.reportedById ? null : (validatedData.reporterPhone || null),
      },
      include: {
        reportedBy: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    console.log(`Report created successfully with ID: ${report.id}, Images: ${imagePaths.length}`);
    
    res.status(201).json({ 
      data: report,
      message: 'Laporan berhasil dikirim',
      uploadedImages: imagePaths.length,
    });
  } catch (error) {
    // If error occurs after files are uploaded, we should clean them up
    const files = (req as any).files as Express.Multer.File[] || [];
    if (files && files.length > 0) {
      const fs = require('fs');
      files.forEach((file) => {
        try {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
            console.log(`Cleaned up file: ${file.filename}`);
          }
        } catch (cleanupError) {
          console.error(`Failed to cleanup file ${file.filename}:`, cleanupError);
        }
      });
    }
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }))
      });
    }
    console.error('Error creating disaster report:', error);
    res.status(500).json({ error: 'Failed to create disaster report' });
  }
});

// PUT /api/reports/disaster/:id - Update disaster report
reportsRouter.put('/disaster/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = updateDisasterReportSchema.parse(req.body);

    const report = await prisma.disasterReport.findUnique({
      where: { id },
    });

    if (!report) {
      return res.status(404).json({ error: 'Disaster report not found' });
    }

    const updatedReport = await prisma.disasterReport.update({
      where: { id },
      data: validatedData,
      select: {
        id: true,
        type: true,
        title: true,
        description: true,
        address: true,
        lat: true,
        lng: true,
        district: true,
        images: true,
        status: true,
        riskLevel: true,
        reporterName: true,
        reporterPhone: true,
        handledBy: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
        reportedBy: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    res.json({ data: updatedReport });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error updating disaster report:', error);
    res.status(500).json({ error: 'Failed to update disaster report' });
  }
});

// DELETE /api/reports/disaster/:id - Delete disaster report
reportsRouter.delete('/disaster/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const report = await prisma.disasterReport.findUnique({
      where: { id },
    });

    if (!report) {
      return res.status(404).json({ error: 'Disaster report not found' });
    }

    await prisma.disasterReport.delete({
      where: { id },
    });

    res.json({ message: 'Disaster report deleted successfully' });
  } catch (error) {
    console.error('Error deleting disaster report:', error);
    res.status(500).json({ error: 'Failed to delete disaster report' });
  }
});

// ==================== ROAD REPORTS ====================

// GET /api/reports/road - Get all road reports
reportsRouter.get('/road', async (req: Request, res: Response) => {
  try {
    const { status, dangerLevel, district } = req.query;
    
    const where: any = {};
    if (status) where.status = status;
    if (dangerLevel) where.dangerLevel = dangerLevel;
    if (district) {
      where.district = {
        contains: district as string,
        mode: 'insensitive' as const,
      };
    }

    const reports = await prisma.roadReport.findMany({
      where,
      include: {
        reportedBy: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({ data: reports });
  } catch (error) {
    console.error('Error fetching road reports:', error);
    res.status(500).json({ error: 'Failed to fetch road reports' });
  }
});

// GET /api/reports/road/:id - Get single road report
reportsRouter.get('/road/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const report = await prisma.roadReport.findUnique({
      where: { id },
      include: {
        reportedBy: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    if (!report) {
      return res.status(404).json({ error: 'Road report not found' });
    }

    res.json({ data: report });
  } catch (error) {
    console.error('Error fetching road report:', error);
    res.status(500).json({ error: 'Failed to fetch road report' });
  }
});

// POST /api/reports/road - Create road report
reportsRouter.post('/road', async (req: Request, res: Response) => {
  try {
    const validatedData = roadReportSchema.parse(req.body);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: validatedData.reportedById },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const report = await prisma.roadReport.create({
      data: {
        type: validatedData.type,
        title: validatedData.title,
        description: validatedData.description,
        address: validatedData.address,
        lat: validatedData.lat,
        lng: validatedData.lng,
        district: validatedData.district,
        images: validatedData.images || [],
        dangerLevel: validatedData.dangerLevel || 'moderate',
        reportedById: validatedData.reportedById,
        aiDetectedIssues: validatedData.aiDetectedIssues || [],
        aiConfidence: validatedData.aiConfidence,
        aiRecommendedAction: validatedData.aiRecommendedAction,
      },
      include: {
        reportedBy: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    res.status(201).json({ data: report });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error creating road report:', error);
    res.status(500).json({ error: 'Failed to create road report' });
  }
});

// PUT /api/reports/road/:id - Update road report
reportsRouter.put('/road/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = updateRoadReportSchema.parse(req.body);

    const report = await prisma.roadReport.findUnique({
      where: { id },
    });

    if (!report) {
      return res.status(404).json({ error: 'Road report not found' });
    }

    const updatedReport = await prisma.roadReport.update({
      where: { id },
      data: validatedData,
      include: {
        reportedBy: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    res.json({ data: updatedReport });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error updating road report:', error);
    res.status(500).json({ error: 'Failed to update road report' });
  }
});

// DELETE /api/reports/road/:id - Delete road report
reportsRouter.delete('/road/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const report = await prisma.roadReport.findUnique({
      where: { id },
    });

    if (!report) {
      return res.status(404).json({ error: 'Road report not found' });
    }

    await prisma.roadReport.delete({
      where: { id },
    });

    res.json({ message: 'Road report deleted successfully' });
  } catch (error) {
    console.error('Error deleting road report:', error);
    res.status(500).json({ error: 'Failed to delete road report' });
  }
});

