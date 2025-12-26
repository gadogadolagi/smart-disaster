import { NextFunction, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { assignmentService } from '../services/assignment.service';
import { HTTP_STATUS, MESSAGES } from '../utils/constants';
import { asyncHandler } from '../utils/errorHandler';

export class AssignmentController {
  /**
   * Assign petugas to disaster report (admin only)
   */
  assignPetugasToDisasterReport = asyncHandler(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: MESSAGES.AUTH_UNAUTHORIZED,
        });
      }

      const { id } = req.params as { id: string };
      const { petugasId } = req.body;

      if (!petugasId) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Petugas ID is required',
        });
      }

      const report = await assignmentService.assignPetugasToDisasterReport(
        id,
        petugasId,
        req.user.id
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Petugas assigned successfully',
        data: report,
      });
    }
  );

  /**
   * Assign petugas to road report (admin only)
   */
  assignPetugasToRoadReport = asyncHandler(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: MESSAGES.AUTH_UNAUTHORIZED,
        });
      }

      const { id } = req.params as { id: string };
      const { petugasId } = req.body;

      if (!petugasId) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Petugas ID is required',
        });
      }

      const report = await assignmentService.assignPetugasToRoadReport(id, petugasId, req.user.id);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Petugas assigned successfully',
        data: report,
      });
    }
  );

  /**
   * Get list of petugas (admin only)
   */
  getPetugasList = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const petugas = await assignmentService.getPetugasList();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: petugas,
    });
  });

  /**
   * Get reports assigned to petugas (petugas only)
   */
  getAssignedReports = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: MESSAGES.AUTH_UNAUTHORIZED,
      });
    }

    const { reportType } = req.query;
    const reports = await assignmentService.getAssignedReports(
      req.user.id,
      reportType as 'disaster' | 'road' | undefined
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: reports,
    });
  });
}

export const assignmentController = new AssignmentController();
