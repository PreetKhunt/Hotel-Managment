import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/UserService';
import { HTTP_STATUS } from '../constants/httpStatuses';
import { AppError, ErrorCode } from '../utils/AppError';

export class UserController {
  constructor(private readonly userService: UserService) {}

  getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) throw new AppError('An error occurred', 400, ErrorCode.VALIDATION_ERROR);

      const profile = await this.userService.getUserProfile(userId);

      const dataToReturn = {
        ...profile,
        role: {
          name: req.user?.roleName || 'Guest',
          permissions: req.user?.permissions || [],
        },
      };

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: dataToReturn,
      });
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) throw new AppError('An error occurred', 400, ErrorCode.VALIDATION_ERROR);

      const updatedProfile = await this.userService.updateProfile(userId, req.body);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedProfile,
      });
    } catch (error) {
      next(error);
    }
  };

  // Admin / Management endpoints
  getUsers = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await this.userService.getAllUsers();
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  };

  updateUserStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminId = req.user?.id;
      if (!adminId) throw new AppError('An error occurred', 400, ErrorCode.VALIDATION_ERROR);

      const targetUserId = req.params.id;
      const { status } = req.body;

      if (!status) throw new AppError('An error occurred', 400, ErrorCode.VALIDATION_ERROR);

      const updatedUser = await this.userService.updateUserStatus(adminId, targetUserId, status);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'User status updated',
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  };

  updateUserRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminId = req.user?.id;
      if (!adminId) throw new AppError('An error occurred', 400, ErrorCode.VALIDATION_ERROR);

      const targetUserId = req.params.id;
      const { roleId } = req.body;

      if (!roleId) throw new AppError('An error occurred', 400, ErrorCode.VALIDATION_ERROR);

      const updatedUser = await this.userService.updateUserRole(adminId, targetUserId, roleId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'User role updated',
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminId = req.user?.id;
      if (!adminId) throw new AppError('An error occurred', 400, ErrorCode.VALIDATION_ERROR);

      const targetUserId = req.params.id;

      await this.userService.softDeleteUser(adminId, targetUserId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'User deleted',
      });
    } catch (error) {
      next(error);
    }
  };
}
