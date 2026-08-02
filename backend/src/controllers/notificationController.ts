import { Request, Response, NextFunction } from 'express';
import { INotificationRepository } from '../domain/repositories/INotificationRepository';
import { AppError, ErrorCode } from '../utils/AppError';

export class NotificationController {
  constructor(private readonly notificationRepo: INotificationRepository) {}

  public getMyNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (!user) throw new AppError('Authentication required', 401, ErrorCode.UNAUTHORIZED);

      const notifs = await this.notificationRepo.getUserNotifications(user.id, user.roleName || null);

      res.status(200).json({
        success: true,
        data: notifs,
        unreadCount: notifs.filter(n => !n.is_read).length
      });
    } catch (error) {
      next(error);
    }
  };

  public markAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (!user) throw new AppError('Authentication required', 401, ErrorCode.UNAUTHORIZED);
      const { id } = req.params;

      await this.notificationRepo.markAsRead(id, user.id);

      res.status(200).json({
        success: true,
        message: 'Notification marked as read',
      });
    } catch (error) {
      next(error);
    }
  };

  public markAllAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (!user) throw new AppError('Authentication required', 401, ErrorCode.UNAUTHORIZED);

      await this.notificationRepo.markAllAsRead(user.id, user.roleName || null);

      res.status(200).json({
        success: true,
        message: 'All notifications marked as read',
      });
    } catch (error) {
      next(error);
    }
  };
}
