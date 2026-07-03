import { Pool } from 'pg';
import { AuthAuditLog } from '../../entities/AuthAuditLog';
import { IAuthAuditLogRepository } from '../IAuthAuditLogRepository';

export class AuthAuditLogRepository implements IAuthAuditLogRepository {
  constructor(private pool: Pool) {}

  private mapToLog(row: any): AuthAuditLog {
    return {
      id: row.id,
      userId: row.user_id,
      action: row.action,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      requestId: row.request_id,
      createdAt: row.created_at,
    };
  }

  async create(log: Omit<AuthAuditLog, 'id' | 'createdAt'>): Promise<AuthAuditLog> {
    const result = await this.pool.query(
      `INSERT INTO auth_audit_logs (
        user_id, action, ip_address, user_agent, request_id
      ) VALUES (
        $1, $2, $3, $4, $5
      ) RETURNING *`,
      [log.userId, log.action, log.ipAddress, log.userAgent, log.requestId]
    );
    return this.mapToLog(result.rows[0]);
  }

  async findByUserId(userId: string): Promise<AuthAuditLog[]> {
    const result = await this.pool.query(
      'SELECT * FROM auth_audit_logs WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows.map(this.mapToLog);
  }
}
