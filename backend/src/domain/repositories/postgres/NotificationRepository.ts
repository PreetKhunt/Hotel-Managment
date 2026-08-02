import { Pool, PoolClient } from 'pg';
import { INotificationRepository, SystemNotification, CreateNotificationDTO, NotificationPriority } from '../INotificationRepository';

export class NotificationRepository implements INotificationRepository {
  constructor(private pool: Pool) {}

  private getExecutor(client?: PoolClient): Pool | PoolClient {
    return client || this.pool;
  }

  async createNotification(dto: CreateNotificationDTO, client?: PoolClient): Promise<SystemNotification> {
    const db = this.getExecutor(client);
    const query = `
      INSERT INTO system_notifications (recipient_id, role_target, title, message, priority, link, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const values = [
      dto.recipient_id || null,
      dto.role_target || null,
      dto.title,
      dto.message,
      dto.priority || NotificationPriority.INFO,
      dto.link || null,
      dto.created_by || null
    ];
    const res = await db.query(query, values);
    return res.rows[0];
  }

  async getUserNotifications(userId: string, roleName?: string | null, client?: PoolClient): Promise<SystemNotification[]> {
    const db = this.getExecutor(client);
    const query = `
      SELECT * FROM system_notifications
      WHERE deleted_at IS NULL
        AND (
          recipient_id = $1
          OR (recipient_id IS NULL AND role_target IS NOT NULL AND LOWER(role_target) = LOWER($2))
          OR (recipient_id IS NULL AND role_target IS NULL) -- System global broadcasts
        )
      ORDER BY created_at DESC
      LIMIT 50
    `;
    const res = await db.query(query, [userId, roleName || '']);
    return res.rows;
  }

  async markAsRead(id: string, userId: string, client?: PoolClient): Promise<void> {
    const db = this.getExecutor(client);
    const query = `
      UPDATE system_notifications
      SET is_read = true, updated_at = NOW()
      WHERE id = $1 AND (recipient_id = $2 OR recipient_id IS NULL)
    `;
    await db.query(query, [id, userId]);
  }

  async markAllAsRead(userId: string, roleName?: string | null, client?: PoolClient): Promise<void> {
    const db = this.getExecutor(client);
    const query = `
      UPDATE system_notifications
      SET is_read = true, updated_at = NOW()
      WHERE deleted_at IS NULL AND is_read = false
        AND (
          recipient_id = $1
          OR (recipient_id IS NULL AND role_target IS NOT NULL AND LOWER(role_target) = LOWER($2))
          OR (recipient_id IS NULL AND role_target IS NULL)
        )
    `;
    await db.query(query, [userId, roleName || '']);
  }

  async deleteNotification(id: string, client?: PoolClient): Promise<void> {
    const db = this.getExecutor(client);
    const query = `
      UPDATE system_notifications
      SET deleted_at = NOW()
      WHERE id = $1
    `;
    await db.query(query, [id]);
  }
}
