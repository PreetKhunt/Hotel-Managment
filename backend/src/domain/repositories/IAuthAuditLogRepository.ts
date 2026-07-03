import { AuthAuditLog } from '../entities/AuthAuditLog';

export interface IAuthAuditLogRepository {
  create(log: Omit<AuthAuditLog, 'id' | 'createdAt'>): Promise<AuthAuditLog>;
  findByUserId(userId: string): Promise<AuthAuditLog[]>;
}
