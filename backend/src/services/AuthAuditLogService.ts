import { IAuthAuditLogRepository } from '../domain/repositories/IAuthAuditLogRepository';
import { AuthAuditLog } from '../domain/entities/AuthAuditLog';

export class AuthAuditLogService {
  constructor(private readonly authAuditLogRepo: IAuthAuditLogRepository) {}

  async logAction(data: Omit<AuthAuditLog, 'id' | 'createdAt'>): Promise<void> {
    try {
      await this.authAuditLogRepo.create(data);
    } catch (error) {
      console.error('Failed to log auth audit event', error);
      // We purposefully don't throw here so that audit logging failure 
      // doesn't bring down the main auth flow, but we log the error.
    }
  }

  async getUserLogs(userId: string): Promise<AuthAuditLog[]> {
    return this.authAuditLogRepo.findByUserId(userId);
  }
}
