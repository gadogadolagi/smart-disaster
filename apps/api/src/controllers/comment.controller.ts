import { NextFunction, Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { commentService } from '../services/comment.service';
import { HTTP_STATUS, MESSAGES } from '../utils/constants';
import { asyncHandler } from '../utils/errorHandler';

export class CommentController {
  /**
   * Create a comment on a report
   */
  createComment = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: MESSAGES.AUTH_UNAUTHORIZED,
      });
    }

    const { reportId, reportType, content } = req.body;

    if (!reportId || !reportType || !content) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Report ID, report type, and content are required',
      });
    }

    if (reportType !== 'disaster' && reportType !== 'road') {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Report type must be "disaster" or "road"',
      });
    }

    const comment = await commentService.createComment(
      {
        reportId,
        reportType: reportType as 'disaster' | 'road',
        content,
      },
      req.user.id
    );

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Comment created successfully',
      data: comment,
    });
  });

  /**
   * Get comments for a report
   */
  getReportComments = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params as { id: string };
    const { reportType } = req.query;

    if (!reportType || (reportType !== 'disaster' && reportType !== 'road')) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Report type must be "disaster" or "road"',
      });
    }

    const result = await commentService.getReportComments(
      id,
      reportType as 'disaster' | 'road',
      req.query
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      ...result,
    });
  });

  /**
   * Update a comment
   */
  updateComment = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: MESSAGES.AUTH_UNAUTHORIZED,
      });
    }

    const { id } = req.params as { id: string };
    const { content } = req.body;

    if (!content) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Content is required',
      });
    }

    const comment = await commentService.updateComment(id, content, req.user.id);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Comment updated successfully',
      data: comment,
    });
  });

  /**
   * Delete a comment
   */
  deleteComment = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: MESSAGES.AUTH_UNAUTHORIZED,
      });
    }

    const { id } = req.params as { id: string };

    await commentService.deleteComment(id, req.user.id, req.user.role);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Comment deleted successfully',
    });
  });
}

export const commentController = new CommentController();
