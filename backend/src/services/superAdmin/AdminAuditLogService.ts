import { SupabaseClient } from '@supabase/supabase-js';

export class AdminAuditLogService {
  constructor(private supabase: SupabaseClient) {}

  async logAction(
    userId: string,
    userRole: string | null,
    action: string,
    entityType: string,
    entityId: string,
    beforeState: any,
    afterState: any,
    requestId: string,
    ipAddress: string
  ): Promise<void> {
    const { error } = await this.supabase
      .from('admin_audit_logs')
      .insert([
        {
          user_id: userId,
          user_role: userRole,
          action,
          entity_type: entityType,
          entity_id: entityId,
          before_state: beforeState,
          after_state: afterState,
          request_id: requestId,
          ip_address: ipAddress,
        },
      ]);

    if (error) {
      console.error('[AdminAuditLogService] Error logging action:', error);
    }
  }

  async getLogs(page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    
    const { data, count, error } = await this.supabase
      .from('admin_audit_logs')
      .select('*, users (first_name, last_name, email)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { data, count };
  }
}
