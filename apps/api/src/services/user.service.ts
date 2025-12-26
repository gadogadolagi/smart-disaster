import { prisma } from '../lib/prisma';
import { MESSAGES } from '../utils/constants';
import { AuthorizationError, NotFoundError } from '../utils/errorHandler';
import { createPaginationResponse, parsePaginationParams } from '../utils/pagination';

export class UserService {
  async getUsers(query: any, requesterRole: string) {
    // Only admin can view all users
    if (requesterRole !== 'admin') {
      throw new AuthorizationError(MESSAGES.AUTH_FORBIDDEN);
    }

    const { page, limit, skip } = parsePaginationParams(query);
    const { role, search } = query;

    const where: any = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          avatar: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.user.count({ where }),
    ]);

    return createPaginationResponse(users, total, page, limit);
  }

  async getUserById(id: string, requesterId?: string, requesterRole?: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Users can only view their own profile unless they're admin
    if (requesterId !== id && requesterRole !== 'admin') {
      throw new AuthorizationError(MESSAGES.AUTH_FORBIDDEN);
    }

    return user;
  }

  async updateUser(
    id: string,
    data: { name?: string; phone?: string; avatar?: string; isActive?: boolean },
    requesterRole: string
  ) {
    // Only admin can update isActive status
    if (data.isActive !== undefined && requesterRole !== 'admin') {
      throw new AuthorizationError(MESSAGES.AUTH_FORBIDDEN);
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.avatar !== undefined && { avatar: data.avatar }),
        ...(data.isActive !== undefined &&
          requesterRole === 'admin' && { isActive: data.isActive }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async deleteUser(id: string, requesterRole: string) {
    // Only admin can delete users
    if (requesterRole !== 'admin') {
      throw new AuthorizationError(MESSAGES.AUTH_FORBIDDEN);
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    await prisma.user.delete({
      where: { id },
    });

    return { message: 'User deleted successfully' };
  }
}

export const userService = new UserService();
