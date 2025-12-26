import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { generateAccessToken, generateRefreshToken } from '../middleware/auth';
import { MESSAGES } from '../utils/constants';
import { AuthenticationError, NotFoundError, ValidationError } from '../utils/errorHandler';
import { loginSchema, registerSchema } from '../utils/validator';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: 'user' | 'admin' | 'petugas';
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: string;
    avatar?: string;
  };
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  async register(data: RegisterData): Promise<AuthResponse> {
    // Validate input
    const validation = registerSchema.safeParse(data);
    if (!validation.success) {
      throw new ValidationError(MESSAGES.AUTH_REGISTER_FAILED, validation.error.errors);
    }

    const { name, email, password, phone, role = 'user' } = validation.data;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new ValidationError(MESSAGES.AUTH_EMAIL_EXISTS);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        phone,
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Store refresh token in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    await prisma.session.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt,
      },
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || undefined,
        role: user.role,
        avatar: user.avatar || undefined,
      },
      accessToken,
      refreshToken,
    };
  }

  async login(data: LoginData): Promise<AuthResponse> {
    // Validate input
    const validation = loginSchema.safeParse(data);
    if (!validation.success) {
      throw new ValidationError(MESSAGES.AUTH_LOGIN_FAILED, validation.error.errors);
    }

    const { email, password } = validation.data;

    // Find user with password field (needed for verification)
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        phone: true,
        role: true,
        avatar: true,
        isActive: true,
      },
    });

    if (!user) {
      throw new AuthenticationError(MESSAGES.AUTH_INVALID_CREDENTIALS);
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AuthenticationError(MESSAGES.AUTH_UNAUTHORIZED);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AuthenticationError(MESSAGES.AUTH_INVALID_CREDENTIALS);
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Store refresh token in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    await prisma.session.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt,
      },
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || undefined,
        role: user.role,
        avatar: user.avatar || undefined,
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshAccessToken(
    refreshToken: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    // Validate token format
    if (!refreshToken || typeof refreshToken !== 'string' || refreshToken.trim().length === 0) {
      throw new AuthenticationError('Invalid refresh token');
    }

    const trimmedToken = refreshToken.trim();

    // Verify refresh token JWT signature first
    const { verifyRefreshToken } = await import('../middleware/auth');
    let decoded;
    try {
      decoded = verifyRefreshToken(trimmedToken);
    } catch (error) {
      throw new AuthenticationError('Invalid or expired refresh token');
    }

    // Check if refresh token exists in database
    const session = await prisma.session.findUnique({
      where: { token: trimmedToken },
      include: { user: true },
    });

    if (!session) {
      throw new AuthenticationError('Invalid or expired refresh token');
    }

    // Check if session is expired
    if (session.expiresAt < new Date()) {
      // Delete expired session
      await prisma.session.delete({ where: { id: session.id } });
      throw new AuthenticationError('Invalid or expired refresh token');
    }

    // Verify user is still active
    if (!session.user.isActive) {
      // Delete session for inactive user
      await prisma.session.delete({ where: { id: session.id } });
      throw new AuthenticationError(MESSAGES.AUTH_UNAUTHORIZED);
    }

    // Verify token payload matches session user
    if (decoded.id !== session.user.id || decoded.email !== session.user.email) {
      // Token mismatch - potential security issue, delete session
      await prisma.session.delete({ where: { id: session.id } });
      throw new AuthenticationError('Invalid refresh token');
    }

    // Generate new tokens (token rotation for security)
    const newAccessToken = generateAccessToken({
      id: session.user.id,
      email: session.user.email,
      role: session.user.role,
    });

    const newRefreshToken = generateRefreshToken({
      id: session.user.id,
      email: session.user.email,
      role: session.user.role,
    });

    // Update session with new refresh token (invalidate old one)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    await prisma.session.update({
      where: { id: session.id },
      data: {
        token: newRefreshToken,
        expiresAt,
      },
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(refreshToken: string): Promise<void> {
    // Validate token format
    if (!refreshToken || typeof refreshToken !== 'string' || refreshToken.trim().length === 0) {
      return; // Silently return if invalid to prevent token enumeration
    }

    // Delete session (silently fail if token doesn't exist)
    try {
      await prisma.session.deleteMany({
        where: { token: refreshToken.trim() },
      });
    } catch (error) {
      // Log error but don't throw to prevent token enumeration
      console.error('Error deleting session during logout:', error);
    }
  }

  async logoutAll(userId: string): Promise<void> {
    // Delete all sessions for user
    await prisma.session.deleteMany({
      where: { userId },
    });
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, data: { name?: string; phone?: string; avatar?: string }) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.avatar !== undefined && { avatar: data.avatar }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        password: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Verify old password
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid current password');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Password updated successfully' };
  }
}

export const authService = new AuthService();
