import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { userService } from '../services/user.service';
import { asyncHandler } from '../utils/errorHandler';
import { HTTP_STATUS } from '../utils/constants';

export class UserController {
  getUsers = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const result = await userService.getUsers(req.query, req.user.role);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      ...result,
    });
  });

  getUserById = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const { id } = req.params;
    const user = await userService.getUserById(id, req.user.id, req.user.role);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: user,
    });
  });

  updateUser = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const { id } = req.params;
    const user = await userService.updateUser(id, req.body, req.user.role);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'User updated successfully',
      data: user,
    });
  });

  deleteUser = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const { id } = req.params;
    await userService.deleteUser(id, req.user.role);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'User deleted successfully',
    });
  });
}

export const userController = new UserController();
