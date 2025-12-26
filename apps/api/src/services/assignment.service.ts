import { prisma } from '../lib/prisma';
import { NotFoundError, ValidationError } from '../utils/errorHandler';

export class AssignmentService {
  /**
   * Assign petugas to disaster report (admin only)
   */
  async assignPetugasToDisasterReport(reportId: string, petugasId: string, adminId: string) {
    // Verify report exists
    const report = await prisma.disasterReport.findUnique({
      where: { id: reportId },
      include: { assignedTo: true },
    });

    if (!report) {
      throw new NotFoundError('Disaster report not found');
    }

    // Verify petugas exists and has petugas role
    const petugas = await prisma.user.findUnique({
      where: { id: petugasId },
    });

    if (!petugas) {
      throw new NotFoundError('Petugas not found');
    }

    if (petugas.role !== 'petugas') {
      throw new ValidationError('User is not a petugas');
    }

    if (!petugas.isActive) {
      throw new ValidationError('Petugas is not active');
    }

    // Update report with assignment
    const updatedReport = await prisma.disasterReport.update({
      where: { id: reportId },
      data: {
        assignedToId: petugasId,
        status: report.status === 'pending' ? 'verified' : report.status,
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
          },
        },
        reportedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Create activity log
    await prisma.reportActivity.create({
      data: {
        reportId,
        reportType: 'disaster',
        activityType: 'assigned',
        description: `Laporan ditugaskan kepada petugas ${petugas.name}`,
        createdById: adminId,
        disasterReportId: reportId,
        metadata: {
          assignedTo: {
            id: petugas.id,
            name: petugas.name,
          },
          assignedBy: {
            id: adminId,
          },
        },
      },
    });

    return updatedReport;
  }

  /**
   * Assign petugas to road report (admin only)
   */
  async assignPetugasToRoadReport(reportId: string, petugasId: string, adminId: string) {
    // Verify report exists
    const report = await prisma.roadReport.findUnique({
      where: { id: reportId },
      include: { assignedTo: true },
    });

    if (!report) {
      throw new NotFoundError('Road report not found');
    }

    // Verify petugas exists and has petugas role
    const petugas = await prisma.user.findUnique({
      where: { id: petugasId },
    });

    if (!petugas) {
      throw new NotFoundError('Petugas not found');
    }

    if (petugas.role !== 'petugas') {
      throw new ValidationError('User is not a petugas');
    }

    if (!petugas.isActive) {
      throw new ValidationError('Petugas is not active');
    }

    // Update report with assignment
    const updatedReport = await prisma.roadReport.update({
      where: { id: reportId },
      data: {
        assignedToId: petugasId,
        status: report.status === 'pending' ? 'verified' : report.status,
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
          },
        },
        reportedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Create activity log
    await prisma.reportActivity.create({
      data: {
        reportId,
        reportType: 'road',
        activityType: 'assigned',
        description: `Laporan ditugaskan kepada petugas ${petugas.name}`,
        createdById: adminId,
        roadReportId: reportId,
        metadata: {
          assignedTo: {
            id: petugas.id,
            name: petugas.name,
          },
          assignedBy: {
            id: adminId,
          },
        },
      },
    });

    return updatedReport;
  }

  /**
   * Get all petugas (for admin to select)
   */
  async getPetugasList() {
    const petugas = await prisma.user.findMany({
      where: {
        role: 'petugas',
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        createdAt: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return petugas;
  }

  /**
   * Get reports assigned to a petugas
   */
  async getAssignedReports(petugasId: string, reportType?: 'disaster' | 'road') {
    const where: any = {
      assignedToId: petugasId,
    };

    const [disasterReports, roadReports] = await Promise.all([
      reportType !== 'road'
        ? prisma.disasterReport.findMany({
            where: reportType === 'disaster' ? where : { assignedToId: petugasId },
            include: {
              reportedBy: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                },
              },
              assignedTo: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          })
        : [],
      reportType !== 'disaster'
        ? prisma.roadReport.findMany({
            where: reportType === 'road' ? where : { assignedToId: petugasId },
            include: {
              reportedBy: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                },
              },
              assignedTo: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          })
        : [],
    ]);

    return {
      disasterReports,
      roadReports,
    };
  }
}

export const assignmentService = new AssignmentService();
