import { Pool, PoolClient } from 'pg';
import {
  IHousekeepingRepository,
  HousekeepingTask,
  CleaningHistoryRecord,
  CreateHousekeepingTaskDTO,
  UpdateHousekeepingTaskDTO,
  HousekeepingDashboardKPIs,
  StaffPerformanceRanking,
  HousekeepingStatus,
  TaskPriority
} from '../IHousekeepingRepository';
import { AppError, ErrorCode } from '../../../utils/AppError';

export class HousekeepingRepository implements IHousekeepingRepository {
  constructor(private pool: Pool) {}

  private getExecutor(client?: PoolClient): Pool | PoolClient {
    return client || this.pool;
  }

  async createTask(dto: CreateHousekeepingTaskDTO, client?: PoolClient): Promise<HousekeepingTask> {
    const db = this.getExecutor(client);
    const query = `
      INSERT INTO housekeeping_tasks (room_id, assigned_to, assigned_by, priority, remarks, created_by, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const values = [
      dto.room_id,
      dto.assigned_to || null,
      dto.assigned_by || null,
      dto.priority || TaskPriority.MEDIUM,
      dto.remarks || null,
      dto.created_by || null,
      HousekeepingStatus.PENDING
    ];
    const res = await db.query(query, values);
    return this.findById(res.rows[0].id, client) as Promise<HousekeepingTask>;
  }

  async findById(id: string, client?: PoolClient): Promise<HousekeepingTask | null> {
    const db = this.getExecutor(client);
    const query = `
      SELECT t.*,
             r.room_number,
             r.status AS room_status,
             u.name AS assignee_name,
             ab.name AS assigner_name
      FROM housekeeping_tasks t
      LEFT JOIN rooms r ON r.id = t.room_id
      LEFT JOIN users u ON u.id = t.assigned_to
      LEFT JOIN users ab ON ab.id = t.assigned_by
      WHERE t.id = $1 AND t.deleted_at IS NULL
    `;
    const res = await db.query(query, [id]);
    return res.rows[0] || null;
  }

  async findAll(filters?: { status?: HousekeepingStatus; assigned_to?: string; room_id?: string; priority?: TaskPriority }, client?: PoolClient): Promise<HousekeepingTask[]> {
    const db = this.getExecutor(client);
    let query = `
      SELECT t.*,
             r.room_number,
             r.status AS room_status,
             u.name AS assignee_name,
             ab.name AS assigner_name
      FROM housekeeping_tasks t
      LEFT JOIN rooms r ON r.id = t.room_id
      LEFT JOIN users u ON u.id = t.assigned_to
      LEFT JOIN users ab ON ab.id = t.assigned_by
      WHERE t.deleted_at IS NULL
    `;
    const values: any[] = [];
    let idx = 1;

    if (filters?.status) {
      query += ` AND t.status = $${idx++}`;
      values.push(filters.status);
    }
    if (filters?.assigned_to) {
      query += ` AND t.assigned_to = $${idx++}`;
      values.push(filters.assigned_to);
    }
    if (filters?.room_id) {
      query += ` AND t.room_id = $${idx++}`;
      values.push(filters.room_id);
    }
    if (filters?.priority) {
      query += ` AND t.priority = $${idx++}`;
      values.push(filters.priority);
    }

    query += ` ORDER BY 
      CASE WHEN t.priority = 'Emergency' THEN 1 WHEN t.priority = 'High' THEN 2 WHEN t.priority = 'Medium' THEN 3 ELSE 4 END ASC,
      t.created_at DESC`;

    const res = await db.query(query, values);
    return res.rows;
  }

  async updateTask(id: string, dto: UpdateHousekeepingTaskDTO, client?: PoolClient): Promise<HousekeepingTask> {
    const db = this.getExecutor(client);
    const fields: string[] = [];
    const values: any[] = [id];
    let idx = 2;

    if (dto.assigned_to !== undefined) {
      fields.push(`assigned_to = $${idx++}`);
      values.push(dto.assigned_to);
    }
    if (dto.status !== undefined) {
      fields.push(`status = $${idx++}`);
      values.push(dto.status);
    }
    if (dto.priority !== undefined) {
      fields.push(`priority = $${idx++}`);
      values.push(dto.priority);
    }
    if (dto.remarks !== undefined) {
      fields.push(`remarks = $${idx++}`);
      values.push(dto.remarks);
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

    let query = `UPDATE housekeeping_tasks SET ${fields.join(', ')} WHERE id = $1 AND deleted_at IS NULL`;

    if (dto.version !== undefined) {
      query += ` AND version = $${idx++}`;
      values.push(dto.version);
    }

    query += ` RETURNING id`;
    const res = await db.query(query, values);

    if (res.rows.length === 0) {
      throw new AppError('Concurrency error or task not found. The task was modified by another user.', 409, ErrorCode.CONFLICT);
    }

    return this.findById(id, client) as Promise<HousekeepingTask>;
  }

  async deleteTask(id: string, deletedBy: string, client?: PoolClient): Promise<void> {
    const db = this.getExecutor(client);
    const query = `
      UPDATE housekeeping_tasks
      SET deleted_at = NOW(), deleted_by = $2, updated_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
    `;
    await db.query(query, [id, deletedBy]);
  }

  async createCleaningHistory(record: Omit<CleaningHistoryRecord, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>, client?: PoolClient): Promise<CleaningHistoryRecord> {
    const db = this.getExecutor(client);
    const query = `
      INSERT INTO cleaning_history (task_id, room_id, assigned_by, completed_by, time_taken_minutes, remarks, created_by, completed_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const values = [
      record.task_id,
      record.room_id,
      record.assigned_by || null,
      record.completed_by || null,
      record.time_taken_minutes || 0,
      record.remarks || null,
      record.created_by || null,
      record.completed_at || new Date()
    ];
    const res = await db.query(query, values);
    return res.rows[0];
  }

  async getHistory(filters?: { room_id?: string; completed_by?: string; limit?: number; offset?: number }, client?: PoolClient): Promise<{ records: CleaningHistoryRecord[]; total: number }> {
    const db = this.getExecutor(client);
    let where = `WHERE ch.deleted_at IS NULL`;
    const values: any[] = [];
    let idx = 1;

    if (filters?.room_id) {
      where += ` AND ch.room_id = $${idx++}`;
      values.push(filters.room_id);
    }
    if (filters?.completed_by) {
      where += ` AND ch.completed_by = $${idx++}`;
      values.push(filters.completed_by);
    }

    const countRes = await db.query(`SELECT COUNT(*) as total FROM cleaning_history ch ${where}`, values);
    const total = parseInt(countRes.rows[0]?.total || '0', 10);

    const limit = filters?.limit || 20;
    const offset = filters?.offset || 0;
    const query = `
      SELECT ch.*,
             r.room_number,
             u.name AS cleaner_name,
             u.email AS cleaner_email
      FROM cleaning_history ch
      LEFT JOIN rooms r ON r.id = ch.room_id
      LEFT JOIN users u ON u.id = ch.completed_by
      ${where}
      ORDER BY ch.completed_at DESC
      LIMIT $${idx++} OFFSET $${idx++}
    `;
    values.push(limit, offset);

    const res = await db.query(query, values);
    return { records: res.rows, total };
  }

  async getDashboardKPIs(): Promise<HousekeepingDashboardKPIs> {
    const db = this.pool;
    const statsQuery = `
      SELECT
        COUNT(*) AS total_tasks,
        COUNT(*) FILTER (WHERE status = 'Completed' AND DATE(completed_at) = CURRENT_DATE) AS completed_today,
        COUNT(*) FILTER (WHERE status IN ('Pending', 'Accepted', 'In Progress')) AS pending_tasks,
        COUNT(*) FILTER (WHERE priority = 'Emergency' AND status IN ('Pending', 'Accepted', 'In Progress')) AS emergency_tasks
      FROM housekeeping_tasks
      WHERE deleted_at IS NULL
    `;
    const statsRes = await db.query(statsQuery);
    const row = statsRes.rows[0] || { total_tasks: '0', completed_today: '0', pending_tasks: '0', emergency_tasks: '0' };

    const avgQuery = `
      SELECT COALESCE(AVG(time_taken_minutes), 0) as avg_time
      FROM cleaning_history
      WHERE deleted_at IS NULL
    `;
    const avgRes = await db.query(avgQuery);
    const avgTime = Math.round(parseFloat(avgRes.rows[0]?.avg_time || '0'));

    const total = parseInt(row.total_tasks, 10);
    const completedTotalQuery = `SELECT COUNT(*) as cnt FROM housekeeping_tasks WHERE status = 'Completed' AND deleted_at IS NULL`;
    const compRes = await db.query(completedTotalQuery);
    const totalComp = parseInt(compRes.rows[0]?.cnt || '0', 10);
    const completionRate = total > 0 ? Math.round((totalComp / total) * 100) : 100;

    return {
      totalTasks: total,
      completedToday: parseInt(row.completed_today, 10),
      pendingTasks: parseInt(row.pending_tasks, 10),
      emergencyTasks: parseInt(row.emergency_tasks, 10),
      averageCleaningTimeMinutes: avgTime,
      completionRate
    };
  }

  async getStaffPerformance(limit: number = 10): Promise<StaffPerformanceRanking[]> {
    const db = this.pool;
    const query = `
      SELECT
        u.id AS staff_id,
        u.name AS staff_name,
        u.email,
        COUNT(ch.id) AS completed_tasks,
        COALESCE(AVG(ch.time_taken_minutes), 0) AS average_time_minutes
      FROM cleaning_history ch
      JOIN users u ON u.id = ch.completed_by
      WHERE ch.deleted_at IS NULL
      GROUP BY u.id, u.name, u.email
      ORDER BY completed_tasks DESC, average_time_minutes ASC
      LIMIT $1
    `;
    const res = await db.query(query, [limit]);
    return res.rows.map(r => ({
      staffId: r.staff_id,
      staffName: r.staff_name || 'Staff Member',
      email: r.email,
      completedTasks: parseInt(r.completed_tasks, 10),
      averageTimeMinutes: Math.round(parseFloat(r.average_time_minutes))
    }));
  }

  async getDailyCleaningTrend(days: number = 7): Promise<{ date: string; completedCount: number; avgTime: number }[]> {
    const db = this.pool;
    const query = `
      SELECT
        TO_CHAR(completed_at, 'YYYY-MM-DD') AS date,
        COUNT(*) AS completed_count,
        COALESCE(AVG(time_taken_minutes), 0) AS avg_time
      FROM cleaning_history
      WHERE deleted_at IS NULL AND completed_at >= NOW() - ($1 * INTERVAL '1 day')
      GROUP BY TO_CHAR(completed_at, 'YYYY-MM-DD')
      ORDER BY date ASC
    `;
    const res = await db.query(query, [days]);
    return res.rows.map(r => ({
      date: r.date,
      completedCount: parseInt(r.completed_count, 10),
      avgTime: Math.round(parseFloat(r.avg_time))
    }));
  }
}
