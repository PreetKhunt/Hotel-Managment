import { PoolClient } from 'pg';

export enum NotificationPriority {
  INFO = 'Info',
  WARNING = 'Warning',
  CRITICAL = 'Critical'
}

export interface SystemNotification {
  id: string;
  recipient_id: string | null;
  role_target: string | null;
  title: string;
  message: string;
  priority: NotificationPriority;
  is_read: boolean;
  link: string | null;
  created_by: string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface CreateNotificationDTO {
  recipient_id?: string | null;
  role_target?: string | null;
  title: string;
  message: string;
  priority?: NotificationPriority;
  link?: string;
  created_by?: string;
}

export interface INotificationRepository {
  createNotification(dto: CreateNotificationDTO, client?: PoolClient): Promise<SystemNotification>;
  getUserNotifications(userId: string, roleName?: string | null, client?: PoolClient): Promise<SystemNotification[]>;
  markAsRead(id: string, userId: string, client?: PoolClient): Promise<void>;
  markAllAsRead(userId: string, roleName?: string | null, client?: PoolClient): Promise<void>;
  deleteNotification(id: string, client?: PoolClient): Promise<void>;
}
