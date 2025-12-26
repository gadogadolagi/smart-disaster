import { prisma } from '../lib/prisma';
import { NotFoundError, ValidationError } from '../utils/errorHandler';
import { createPaginationResponse, parsePaginationParams } from '../utils/pagination';

export interface CreateCommentData {
  reportId: string;
  reportType: 'disaster' | 'road';
  content: string;
}

export class CommentService {
  /**
   * Create a comment on a report
   */
  async createComment(data: CreateCommentData, authorId: string) {
    // Verify report exists
    if (data.reportType === 'disaster') {
      const report = await prisma.disasterReport.findUnique({
        where: { id: data.reportId },
      });
      if (!report) {
        throw new NotFoundError('Disaster report not found');
      }
    } else {
      const report = await prisma.roadReport.findUnique({
        where: { id: data.reportId },
      });
      if (!report) {
        throw new NotFoundError('Road report not found');
      }
    }

    // Validate content
    if (!data.content || data.content.trim().length === 0) {
      throw new ValidationError('Comment content cannot be empty');
    }

    if (data.content.length > 1000) {
      throw new ValidationError('Comment content cannot exceed 1000 characters');
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        reportId: data.reportId,
        reportType: data.reportType,
        content: data.content.trim(),
        authorId,
        ...(data.reportType === 'disaster'
          ? { disasterReportId: data.reportId }
          : { roadReportId: data.reportId }),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
          },
        },
      },
    });

    // Create activity log for comment
    await prisma.reportActivity.create({
      data: {
        reportId: data.reportId,
        reportType: data.reportType,
        activityType: 'comment_added',
        description: `Komentar ditambahkan`,
        createdById: authorId,
        metadata: {
          commentId: comment.id,
        },
        ...(data.reportType === 'disaster'
          ? { disasterReportId: data.reportId }
          : { roadReportId: data.reportId }),
      },
    });

    return comment;
  }

  /**
   * Get comments for a report
   */
  async getReportComments(reportId: string, reportType: 'disaster' | 'road', query: any) {
    // Verify report exists
    if (reportType === 'disaster') {
      const report = await prisma.disasterReport.findUnique({
        where: { id: reportId },
      });
      if (!report) {
        throw new NotFoundError('Disaster report not found');
      }
    } else {
      const report = await prisma.roadReport.findUnique({
        where: { id: reportId },
      });
      if (!report) {
        throw new NotFoundError('Road report not found');
      }
    }

    const { page, limit, skip } = parsePaginationParams(query);

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: {
          reportId,
          reportType,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              role: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
        skip,
        take: limit,
      }),
      prisma.comment.count({
        where: {
          reportId,
          reportType,
        },
      }),
    ]);

    return createPaginationResponse(comments, total, page, limit);
  }

  /**
   * Update a comment (only by author)
   */
  async updateComment(commentId: string, content: string, authorId: string) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundError('Comment not found');
    }

    if (comment.authorId !== authorId) {
      throw new ValidationError('You can only update your own comments');
    }

    // Validate content
    if (!content || content.trim().length === 0) {
      throw new ValidationError('Comment content cannot be empty');
    }

    if (content.length > 1000) {
      throw new ValidationError('Comment content cannot exceed 1000 characters');
    }

    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: {
        content: content.trim(),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
          },
        },
      },
    });

    return updatedComment;
  }

  /**
   * Delete a comment (only by author or admin)
   */
  async deleteComment(commentId: string, userId: string, userRole: string) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundError('Comment not found');
    }

    if (comment.authorId !== userId && userRole !== 'admin') {
      throw new ValidationError('You can only delete your own comments');
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    return { message: 'Comment deleted successfully' };
  }
}

export const commentService = new CommentService();
