import { Pool, PoolClient } from 'pg';
import {
  IMaintenanceRepository,
  MaintenanceRequest,
  MaintenanceAuditLog,
  CreateMaintenanceRequestDTO,
  UpdateMaintenanceRequestDTO,
  MaintenanceDashboardKPIs,
  TechnicianPerformance,
  MaintenanceStatus,
  IssueType
} from '../IMaintenanceRepository';
import { TaskPriority } from '../IHousekeepingRepository';
import { AppError, ErrorCode } from '../../../utils/AppError';

export class MaintenanceRepository implements IMaintenanceRepository {
  constructor(private pool: Pool) {}

  private getExecutor(client?: PoolClient): Pool | PoolClient {
    return client || this.pool;
  }

  async createRequest(dto: CreateMaintenanceRequestDTO, client?: PoolClient): Promise<MaintenanceRequest> {
    const db = this.getExecutor(client);
    const query = `
      INSERT INTO maintenance_requests (room_id, reported_by, assigned_to, issue_type, description, priority, estimated_cost, created_by, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const values = [
      dto.room_id,
      dto.reported_by || null,
      dto.assigned_to || null,
      dto.issue_type,
      dto.description,
      dto.priority || TaskPriority.MEDIUM,
      dto.estimated_cost || 0.00,
      dto.created_by || null,
      MaintenanceStatus.PENDING
    ];
    const res = await db.query(query, values);
    return this.findById(res.rows[0].id, client) as Promise<MaintenanceRequest>;
  }

  async findById(id: string, client?: PoolClient): Promise<MaintenanceRequest | null> {
    const db = this.getExecutor(client);
    const query = `
      SELECT m.*,
             r.name AS room_name,
             r.name AS room_number,
             COALESCE(NULLIF(TRIM(u.first_name || ' ' || u.last_name), ''), u.email, 'User') AS reporter_name,
             u.email AS reporter_email,
             COALESCE(NULLIF(TRIM(tech.first_name || ' ' || tech.last_name), ''), tech.email, 'Unassigned') AS technician_name,
             tech.email AS technician_email
      FROM maintenance_requests m
      LEFT JOIN rooms r ON r.id = m.room_id
      LEFT JOIN users u ON u.id = m.reported_by
      LEFT JOIN users tech ON tech.id = m.assigned_to
      WHERE m.id = $1 AND m.deleted_at IS NULL
    `;
    const res = await db.query(query, [id]);
    return res.rows[0] || null;
  }

  async findAll(filters?: { status?: MaintenanceStatus; assigned_to?: string; reported_by?: string; room_id?: string; issue_type?: IssueType; priority?: TaskPriority }, client?: PoolClient): Promise<MaintenanceRequest[]> {
    const db = this.getExecutor(client);
    let query = `
      SELECT m.*,
             r.name AS room_name,
             r.name AS room_number,
             COALESCE(NULLIF(TRIM(u.first_name || ' ' || u.last_name), ''), u.email, 'User') AS reporter_name,
             u.email AS reporter_email,
             COALESCE(NULLIF(TRIM(tech.first_name || ' ' || tech.last_name), ''), tech.email, 'Unassigned') AS technician_name,
             tech.email AS technician_email
      FROM maintenance_requests m
      LEFT JOIN rooms r ON r.id = m.room_id
      LEFT JOIN users u ON u.id = m.reported_by
      LEFT JOIN users tech ON tech.id = m.assigned_to
      WHERE m.deleted_at IS NULL
    `;
    const values: any[] = [];
    let idx = 1;

    if (filters?.status) {
      query += ` AND m.status = $${idx++}`;
      values.push(filters.status);
    }
    if (filters?.assigned_to) {
      query += ` AND m.assigned_to = $${idx++}`;
      values.push(filters.assigned_to);
    }
    if (filters?.reported_by) {
      query += ` AND m.reported_by = $${idx++}`;
      values.push(filters.reported_by);
    }
    if (filters?.room_id) {
      query += ` AND m.room_id = $${idx++}`;
      values.push(filters.room_id);
    }
    if (filters?.issue_type) {
      query += ` AND m.issue_type = $${idx++}`;
      values.push(filters.issue_type);
    }
    if (filters?.priority) {
      query += ` AND m.priority = $${idx++}`;
      values.push(filters.priority);
    }

    query += ` ORDER BY 
      CASE WHEN m.priority = 'Emergency' THEN 1 WHEN m.priority = 'High' THEN 2 WHEN m.priority = 'Medium' THEN 3 ELSE 4 END ASC,
      m.created_at DESC`;

    const res = await db.query(query, values);
    return res.rows;
  }

  async updateRequest(id: string, dto: UpdateMaintenanceRequestDTO, client?: PoolClient): Promise<MaintenanceRequest> {
    const db = this.getExecutor(client);
    const fields: string[] = [];
    const values: any[] = [id];
    let idx = 2;

    if (dto.assigned_to !== undefined) {
      fields.push(`assigned_to = $${idx++}`);
      values.push(dto.assigned_to);
    }
    if (dto.priority !== undefined) {
      fields.push(`priority = $${idx++}`);
      values.push(dto.priority);
    }
    if (dto.status !== undefined) {
      fields.push(`status = $${idx++}`);
      values.push(dto.status);
    }
    if (dto.description !== undefined) {
      fields.push(`description = $${idx++}`);
      values.push(dto.description);
    }
    if (dto.estimated_cost !== undefined) {
      fields.push(`estimated_cost = $${idx++}`);
      values.push(dto.estimated_cost);
    }
    if (dto.actual_cost !== undefined) {
      fields.push(`actual_cost = $${idx++}`);
      values.push(dto.actual_cost);
    }
    if (dto.started_at !== undefined) {
      fields.push(`started_at = $${idx++}`);
      values.push(dto.started_at);
    }
    if (dto.completed_at !== undefined) {
      fields.push(`completed_at = $${idx++}`);
      values.push(dto.completed_at);
    }
    if (dto.updated_by !== undefined) {
      fields.push(`updated_by = $${idx++}`);
      values.push(dto.updated_by);
    }

    fields.push(`version = version + 1`);
    fields.push(`updated_at = NOW()`);

    let query = `UPDATE maintenance_requests SET ${fields.join(', ')} WHERE id = $1 AND deleted_at IS NULL`;

    if (dto.version !== undefined) {
      query += ` AND version = $${idx++}`;
      values.push(dto.version);
    }

    query += ` RETURNING id`;
    const res = await db.query(query, values);

    if (res.rows.length === 0) {
      throw new AppError('Concurrency lock conflict or request not found. This record was modified by another technician.', 409, ErrorCode.CONFLICT);
    }

    return this.findById(id, client) as Promise<MaintenanceRequest>;
  }

  async deleteRequest(id: string, deletedBy: string, client?: PoolClient): Promise<void> {
    const db = this.getExecutor(client);
    const query = `
      UPDATE maintenance_requests
      SET deleted_at = NOW(), deleted_by = $2, updated_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
    `;
    await db.query(query, [id, deletedBy]);
  }

  async logAudit(audit: Omit<MaintenanceAuditLog, 'id' | 'created_at'>, client?: PoolClient): Promise<MaintenanceAuditLog> {
    const db = this.getExecutor(client);
    const query = `
      INSERT INTO maintenance_audit_logs (request_id, room_id, reporter_id, assigned_technician_id, performed_by, action, old_value, new_value, ip_address, correlation_id, repair_time_minutes, repair_cost, remarks, completion_time)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `;
    const values = [
      audit.request_id || null,
      audit.room_id || null,
      audit.reporter_id || null,
      audit.assigned_technician_id || null,
      audit.performed_by || null,
      audit.action,
      audit.old_value ? JSON.stringify(audit.old_value) : null,
      audit.new_value ? JSON.stringify(audit.new_value) : null,
      audit.ip_address || null,
      audit.correlation_id || null,
      audit.repair_time_minutes || null,
      audit.repair_cost || null,
      audit.remarks || null,
      audit.completion_time || null
    ];
    const res = await db.query(query, values);
    return res.rows[0];
  }

  async getAuditLogs(filters?: { request_id?: string; assigned_technician_id?: string; limit?: number; offset?: number }, client?: PoolClient): Promise<{ records: MaintenanceAuditLog[]; total: number }> {
    const db = this.getExecutor(client);
    let where = `WHERE 1=1`;
    const values: any[] = [];
    let idx = 1;

    if (filters?.request_id) {
      where += ` AND l.request_id = $${idx++}`;
      values.push(filters.request_id);
    }
    if (filters?.assigned_technician_id) {
      where += ` AND l.assigned_technician_id = $${idx++}`;
      values.push(filters.assigned_technician_id);
    }

    const countRes = await db.query(`SELECT COUNT(*) as total FROM maintenance_audit_logs l ${where}`, values);
    const total = parseInt(countRes.rows[0]?.total || '0', 10);

    const limit = filters?.limit || 30;
    const offset = filters?.offset || 0;
    const query = `
      SELECT l.*,
             r.name AS room_name,
             r.name AS room_number,
             u.email AS performer_email,
             COALESCE(NULLIF(TRIM(tech.first_name || ' ' || tech.last_name), ''), tech.email, 'Unassigned') AS technician_name
      FROM maintenance_audit_logs l
      LEFT JOIN rooms r ON r.id = l.room_id
      LEFT JOIN users u ON u.id = l.performed_by
      LEFT JOIN users tech ON tech.id = l.assigned_technician_id
      ${where}
      ORDER BY l.created_at DESC
      LIMIT $${idx++} OFFSET $${idx++}
    `;
    values.push(limit, offset);

    const res = await db.query(query, values);
    return { records: res.rows, total };
  }

  async getDashboardKPIs(): Promise<MaintenanceDashboardKPIs> {
    const db = this.pool;
    const statsQuery = `
      SELECT
        COUNT(*) FILTER (WHERE status = 'Pending') AS pending_requests,
        COUNT(*) FILTER (WHERE status IN ('Assigned', 'In Progress')) AS in_progress,
        COUNT(*) FILTER (WHERE status = 'Completed' AND date_trunc('month', completed_at) = date_trunc('month', CURRENT_DATE)) AS completed_month,
        COUNT(*) FILTER (WHERE priority = 'Emergency' AND status != 'Completed' AND status != 'Cancelled') AS emergency_issues,
        COALESCE(SUM(actual_cost) FILTER (WHERE status = 'Completed' AND date_trunc('month', completed_at) = date_trunc('month', CURRENT_DATE)), 0) AS monthly_cost
      FROM maintenance_requests
      WHERE deleted_at IS NULL
    `;
    const statsRes = await db.query(statsQuery);
    const row = statsRes.rows[0] || { pending_requests: '0', in_progress: '0', completed_month: '0', emergency_issues: '0', monthly_cost: '0' };

    const avgQuery = `
      SELECT COALESCE(AVG(repair_time_minutes), 0) as avg_time
      FROM maintenance_audit_logs
      WHERE action = 'COMPLETED' AND repair_time_minutes IS NOT NULL
    `;
    const avgRes = await db.query(avgQuery);
    const avgTime = Math.round(parseFloat(avgRes.rows[0]?.avg_time || '0'));

    const mttrQuery = `
      SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (completed_at - created_at)) / 60), 0) AS mttr_min
      FROM maintenance_requests
      WHERE status = 'Completed' AND deleted_at IS NULL AND completed_at IS NOT NULL AND created_at IS NOT NULL
    `;
    const mttrRes = await db.query(mttrQuery);
    const mttrMinutes = Math.round(parseFloat(mttrRes.rows[0]?.mttr_min || '0'));

    return {
      pendingRequests: parseInt(row.pending_requests, 10),
      inProgress: parseInt(row.in_progress, 10),
      completedThisMonth: parseInt(row.completed_month, 10),
      emergencyIssues: parseInt(row.emergency_issues, 10),
      averageRepairTimeMinutes: avgTime,
      monthlyMaintenanceCost: parseFloat(row.monthly_cost),
      mttrMinutes
    };
  }

  async getTechnicianPerformance(limit: number = 10): Promise<TechnicianPerformance[]> {
    const db = this.pool;
    const query = `
      SELECT
        u.id AS technician_id,
        COALESCE(NULLIF(TRIM(u.first_name || ' ' || u.last_name), ''), u.email, 'Technician') AS technician_name,
        u.email,
        COUNT(m.id) AS assigned_count,
        COUNT(m.id) FILTER (WHERE m.status = 'Completed') AS completed_count,
        COALESCE(AVG(EXTRACT(EPOCH FROM (m.completed_at - m.started_at)) / 60) FILTER (WHERE m.status = 'Completed' AND m.started_at IS NOT NULL AND m.completed_at IS NOT NULL), 0) AS avg_resolution_minutes,
        COALESCE(SUM(m.actual_cost) FILTER (WHERE m.status = 'Completed'), 0) AS total_repair_cost
      FROM maintenance_requests m
      JOIN users u ON u.id = m.assigned_to
      WHERE m.deleted_at IS NULL
      GROUP BY u.id, u.first_name, u.last_name, u.email
      ORDER BY completed_count DESC, total_repair_cost DESC
      LIMIT $1
    `;
    const res = await db.query(query, [limit]);
    return res.rows.map(r => ({
      technicianId: r.technician_id,
      technicianName: r.technician_name || 'Technician',
      email: r.email,
      assignedCount: parseInt(r.assigned_count, 10),
      completedCount: parseInt(r.completed_count, 10),
      avgResolutionMinutes: Math.round(parseFloat(r.avg_resolution_minutes)),
      totalRepairCost: parseFloat(r.total_repair_cost)
    }));
  }

  async getCommonIssuesDistribution(): Promise<{ issue_type: string; count: number; total_cost: number }[]> {
    const db = this.pool;
    const query = `
      SELECT
        issue_type,
        COUNT(*) AS count,
        COALESCE(SUM(actual_cost), 0) AS total_cost
      FROM maintenance_requests
      WHERE deleted_at IS NULL
      GROUP BY issue_type
      ORDER BY count DESC
    `;
    const res = await db.query(query);
    return res.rows.map(r => ({
      issue_type: r.issue_type,
      count: parseInt(r.count, 10),
      total_cost: parseFloat(r.total_cost)
    }));
  }

  async getMonthlyCostTrend(months: number = 6): Promise<{ month: string; totalCost: number; repairCount: number }[]> {
    const db = this.pool;
    const query = `
      SELECT
        TO_CHAR(completed_at, 'YYYY-MM') AS month,
        COALESCE(SUM(actual_cost), 0) AS total_cost,
        COUNT(*) AS repair_count
      FROM maintenance_requests
      WHERE deleted_at IS NULL AND status = 'Completed' AND completed_at >= NOW() - ($1 * INTERVAL '1 month')
      GROUP BY TO_CHAR(completed_at, 'YYYY-MM')
      ORDER BY month ASC
    `;
    const res = await db.query(query, [months]);
    return res.rows.map(r => ({
      month: r.month,
      totalCost: parseFloat(r.total_cost),
      repairCount: parseInt(r.repair_count, 10)
    }));
  }
}
