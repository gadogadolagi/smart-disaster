import { NextFunction, Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { authService } from '../services/auth.service';
import { HTTP_STATUS, MESSAGES } from '../utils/constants';
import { asyncHandler } from '../utils/errorHandler';

export class AuthController {
  register = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const result = await authService.register(req.body);

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: MESSAGES.AUTH_REGISTER_SUCCESS,
      data: result,
    });
  });

  login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const result = await authService.login(req.body);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: MESSAGES.AUTH_LOGIN_SUCCESS,
      data: result,
    });
  });

  getProfile = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: MESSAGES.AUTH_UNAUTHORIZED,
      });
    }

    const user = await authService.getProfile(req.user.id);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: user,
    });
  });

  updateProfile = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: MESSAGES.AUTH_UNAUTHORIZED,
      });
    }

    const user = await authService.updateProfile(req.user.id, req.body);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    });
  });

  changePassword = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: MESSAGES.AUTH_UNAUTHORIZED,
      });
    }

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Old password and new password are required',
      });
    }

    await authService.changePassword(req.user.id, oldPassword, newPassword);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Password changed successfully',
    });
  });
}

export const authController = new AuthController();
