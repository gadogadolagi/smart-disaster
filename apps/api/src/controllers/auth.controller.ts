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

    const { oldPassword, newPassword, currentPassword } = req.body;
    const password = oldPassword || currentPassword;

    if (!password || !newPassword) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Current password and new password are required',
      });
    }

    if (newPassword.length < 8) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'New password must be at least 8 characters long',
      });
    }

    await authService.changePassword(req.user.id, password, newPassword);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Password changed successfully',
    });
  });

  refreshToken = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { refreshToken } = req.body;

    if (!refreshToken || typeof refreshToken !== 'string' || refreshToken.trim().length === 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Refresh token is required',
      });
    }

    try {
      const tokens = await authService.refreshAccessToken(refreshToken.trim());

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Token refreshed successfully',
        data: tokens,
      });
    } catch (error: any) {
      // Don't expose internal error details
      if (error.message?.includes('Invalid') || error.message?.includes('expired')) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: 'Invalid or expired refresh token',
        });
      }
      throw error;
    }
  });

  logout = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { refreshToken } = req.body;

    // Validate refresh token format
    if (!refreshToken || typeof refreshToken !== 'string' || refreshToken.trim().length === 0) {
      // Still return success to prevent token enumeration attacks
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Logged out successfully',
      });
    }

    try {
      // Delete the session (refresh token)
      await authService.logout(refreshToken.trim());
    } catch (error) {
      // Log error but don't expose it to client
      // Still return success to prevent token enumeration
      console.error('Error during logout:', error);
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Logged out successfully',
    });
  });
}

export const authController = new AuthController();
