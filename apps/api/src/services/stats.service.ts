import { prisma } from '../lib/prisma';

export class StatsService {
  /**
   * Get dashboard statistics summary
   */
  async getDashboardStats() {
    // Get all reports counts
    const [
      totalDisasterReports,
      totalRoadReports,
      disasterReportsByStatus,
      roadReportsByStatus,
      disasterReportsByType,
      reportsByDistrict,
      recentDisasterReports,
      recentRoadReports,
      resolvedDisasterReports,
      resolvedRoadReports,
    ] = await Promise.all([
      // Total counts
      prisma.disasterReport.count(),
      prisma.roadReport.count(),

      // Disaster reports by status
      prisma.disasterReport.groupBy({
        by: ['status'],
        _count: true,
      }),

      // Road reports by status
      prisma.roadReport.groupBy({
        by: ['status'],
        _count: true,
      }),

      // Disaster reports by type
      prisma.disasterReport.groupBy({
        by: ['type'],
        _count: true,
      }),

      // Reports by district (both types)
      prisma.$queryRaw<Array<{ district: string; count: bigint }>>`
        SELECT district, COUNT(*)::bigint as count
        FROM (
          SELECT district FROM disaster_reports
          UNION ALL
          SELECT district FROM road_reports
        ) AS all_reports
        GROUP BY district
        ORDER BY count DESC
        LIMIT 10
      `,

      // Recent reports (last 7 days)
      prisma.disasterReport.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),

      prisma.roadReport.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),

      // Resolved reports for average calculation
      prisma.disasterReport.findMany({
        where: {
          status: 'resolved',
        },
        select: {
          createdAt: true,
          updatedAt: true,
        },
      }),

      prisma.roadReport.findMany({
        where: {
          status: 'resolved',
        },
        select: {
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

    // Calculate status counts
    const statusCounts: Record<string, number> = {};
    disasterReportsByStatus.forEach((item) => {
      statusCounts[item.status] = (statusCounts[item.status] || 0) + item._count;
    });
    roadReportsByStatus.forEach((item) => {
      statusCounts[item.status] = (statusCounts[item.status] || 0) + item._count;
    });

    // Calculate disaster by type
    const disasterByType: Record<string, number> = {};
    disasterReportsByType.forEach((item) => {
      disasterByType[item.type] = item._count;
    });

    // Calculate reports by district
    const reportsByDistrictMap: Record<string, number> = {};
    reportsByDistrict.forEach((item) => {
      reportsByDistrictMap[item.district] = Number(item.count);
    });

    // Calculate average resolution time (in hours)
    const allResolvedReports = [...resolvedDisasterReports, ...resolvedRoadReports];
    let averageResolutionTime = 0;
    if (allResolvedReports.length > 0) {
      const totalResolutionTime = allResolvedReports.reduce((sum, report) => {
        const resolutionTime = report.updatedAt.getTime() - report.createdAt.getTime();
        return sum + resolutionTime;
      }, 0);
      averageResolutionTime = Math.round(
        totalResolutionTime / allResolvedReports.length / (1000 * 60 * 60)
      ); // Convert to hours
    }

    const totalReports = totalDisasterReports + totalRoadReports;
    const recentReports = recentDisasterReports + recentRoadReports;

    // Get reports by date (last 30 days for trend)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [disasterReportsByDate, roadReportsByDate] = await Promise.all([
      prisma.disasterReport.findMany({
        where: {
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
        select: {
          createdAt: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      }),
      prisma.roadReport.findMany({
        where: {
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
        select: {
          createdAt: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      }),
    ]);

    // Group by date
    const reportsByDate: Record<string, { disaster: number; road: number; total: number }> = {};

    // Process disaster reports
    disasterReportsByDate.forEach((report) => {
      const dateKey = new Date(report.createdAt).toISOString().split('T')[0];
      if (dateKey) {
        if (!reportsByDate[dateKey]) {
          reportsByDate[dateKey] = { disaster: 0, road: 0, total: 0 };
        }
        reportsByDate[dateKey].disaster++;
        reportsByDate[dateKey].total++;
      }
    });

    // Process road reports
    roadReportsByDate.forEach((report) => {
      const dateKey = new Date(report.createdAt).toISOString().split('T')[0];
      if (dateKey) {
        if (!reportsByDate[dateKey]) {
          reportsByDate[dateKey] = { disaster: 0, road: 0, total: 0 };
        }
        reportsByDate[dateKey].road++;
        reportsByDate[dateKey].total++;
      }
    });

    // Convert to array format for chart
    const reportsTrend = Object.entries(reportsByDate)
      .map(([date, counts]) => ({
        date,
        disaster: counts.disaster,
        road: counts.road,
        total: counts.total,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalReports,
      totalDisasterReports,
      totalRoadReports,
      pendingReports: statusCounts.pending || 0,
      verifiedReports: statusCounts.verified || 0,
      inProgressReports: statusCounts.in_progress || 0,
      resolvedReports: statusCounts.resolved || 0,
      rejectedReports: statusCounts.rejected || 0,
      disasterByType,
      reportsByDistrict: reportsByDistrictMap,
      reportsByStatus: statusCounts,
      recentReports,
      averageResolutionTime,
      resolutionRate:
        totalReports > 0 ? Math.round(((statusCounts.resolved || 0) / totalReports) * 100) : 0,
      reportsTrend,
    };
  }

  /**
   * Get public transparency statistics (simplified version for public access)
   */
  async getPublicStats() {
    // Reuse the same logic but return public-safe data
    const dashboardStats = await this.getDashboardStats();

    // Return public-safe statistics (exclude sensitive info like rejected reports count)
    return {
      totalReports: dashboardStats.totalReports,
      totalDisasterReports: dashboardStats.totalDisasterReports,
      totalRoadReports: dashboardStats.totalRoadReports,
      pendingReports: dashboardStats.pendingReports,
      inProgressReports: dashboardStats.inProgressReports,
      resolvedReports: dashboardStats.resolvedReports,
      disasterByType: dashboardStats.disasterByType,
      reportsByDistrict: dashboardStats.reportsByDistrict,
      reportsByStatus: {
        pending: dashboardStats.pendingReports,
        in_progress: dashboardStats.inProgressReports,
        resolved: dashboardStats.resolvedReports,
        verified: dashboardStats.verifiedReports,
      },
      recentReports: dashboardStats.recentReports,
      averageResolutionTime: dashboardStats.averageResolutionTime,
      resolutionRate: dashboardStats.resolutionRate,
      reportsTrend: dashboardStats.reportsTrend,
    };
  }
}

export const statsService = new StatsService();
