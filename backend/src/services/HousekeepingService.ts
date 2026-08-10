import { Pool } from 'pg';
import {
  IHousekeepingRepository,
  HousekeepingTask,
  CreateHousekeepingTaskDTO,
  UpdateHousekeepingTaskDTO,
  HousekeepingDashboardKPIs,
  StaffPerformanceRanking,
  HousekeepingStatus,
  TaskPriority
} from '../domain/repositories/IHousekeepingRepository';
import { INotificationRepository, NotificationPriority } from '../domain/repositories/INotificationRepository';
import { AppError, ErrorCode } from '../utils/AppError';

export class HousekeepingService {
  constructor(
    private pool: Pool,
    private housekeepingRepo: IHousekeepingRepository,
    private notificationRepo: INotificationRepository
  ) {}

  async createCleaningTask(dto: CreateHousekeepingTaskDTO, _ipAddress?: string, _correlationId?: string): Promise<HousekeepingTask> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN ISOLATION LEVEL SERIALIZABLE');

      // 1. Check if room exists
      const roomCheck = await client.query('SELECT id, name FROM rooms WHERE id = $1', [dto.room_id]);
      if (roomCheck.rows.length === 0) {
        throw new AppError('Targeted room does not exist in inventory', 404, ErrorCode.NOT_FOUND);
      }
      const roomNumber = roomCheck.rows[0].name || dto.room_id.substring(0, 8);

      // 1.5 Prevent duplicate tasks
      const activeTaskCheck = await client.query(
        `SELECT id FROM housekeeping_tasks WHERE room_id = $1 AND status IN ('Pending', 'Accepted', 'In Progress', 'Completed') AND deleted_at IS NULL`,
        [dto.room_id]
      );
      if (activeTaskCheck.rows.length > 0) {
        throw new AppError('This room already has an active cleaning task.', 409, ErrorCode.CONFLICT);
      }

      // 2. Create the task
      const task = await this.housekeepingRepo.createTask(dto, client);

      // Update Room Status to 'dirty'
      await client.query(`UPDATE rooms SET status = 'dirty' WHERE id = $1`, [dto.room_id]);

      // 3. Notify assigned staff or general housekeeping team
      const priorityNotif = dto.priority === TaskPriority.EMERGENCY ? NotificationPriority.CRITICAL : NotificationPriority.INFO;
      if (dto.assigned_to) {
        await this.notificationRepo.createNotification({
          recipient_id: dto.assigned_to,
          title: `New Cleaning Task Assigned (Room ${roomNumber})`,
          message: `You have been assigned a cleaning task for Room ${roomNumber} with ${task.priority} priority.`,
          priority: priorityNotif,
          link: `/dashboard/housekeeping`,
          created_by: dto.created_by
        }, client);
      } else {
        await this.notificationRepo.createNotification({
          role_target: 'Housekeeping',
          title: `New Unassigned Room Cleaning (Room ${roomNumber})`,
          message: `Room ${roomNumber} requires cleaning (${task.priority} priority). Available staff please accept.`,
          priority: priorityNotif,
          link: `/dashboard/housekeeping`,
          created_by: dto.created_by
        }, client);
      }

      await client.query('COMMIT');
      return task;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getTasks(filters?: { status?: HousekeepingStatus; assigned_to?: string; room_id?: string; priority?: TaskPriority }): Promise<HousekeepingTask[]> {
    return this.housekeepingRepo.findAll(filters);
  }

  async getTaskById(id: string): Promise<HousekeepingTask> {
    const task = await this.housekeepingRepo.findById(id);
    if (!task) {
      throw new AppError('Housekeeping task not found', 404, ErrorCode.NOT_FOUND);
    }
    return task;
  }

  async updateTaskStatus(
    taskId: string,
    dto: UpdateHousekeepingTaskDTO,
    actorId: string,
    actorRole?: string | null,
    _ipAddress?: string,
    _correlationId?: string
  ): Promise<HousekeepingTask> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN ISOLATION LEVEL SERIALIZABLE');

      const currentTask = await this.housekeepingRepo.findById(taskId, client);
      if (!currentTask) {
        throw new AppError('Housekeeping task not found', 404, ErrorCode.NOT_FOUND);
      }

      // RBAC check: Staff can only act on tasks assigned to them or unassigned pending tasks
      if (actorRole !== 'Admin' && actorRole !== 'Super Admin' && currentTask.assigned_to && currentTask.assigned_to !== actorId) {
        throw new AppError('You are not authorized to modify a cleaning task assigned to another staff member', 403, ErrorCode.FORBIDDEN);
      }

      const updates: UpdateHousekeepingTaskDTO = { ...dto, updated_by: actorId };

      // If staff is accepting an unassigned task
      if (dto.status === HousekeepingStatus.ACCEPTED || dto.status === HousekeepingStatus.IN_PROGRESS) {
        if (!currentTask.assigned_to) {
          updates.assigned_to = actorId;
        }
        if (dto.status === HousekeepingStatus.IN_PROGRESS && !currentTask.started_at) {
          updates.started_at = new Date();
        }
        // Update Room Status to 'under cleaning'
        await client.query(`UPDATE rooms SET status = 'under cleaning' WHERE id = $1`, [currentTask.room_id]);
      }

      // If completing task
      if (dto.status === HousekeepingStatus.COMPLETED) {
        updates.completed_at = new Date();
        let diffMinutes = 0;
        if (currentTask.started_at) {
          const start = new Date(currentTask.started_at).getTime();
          diffMinutes = Math.max(1, Math.round((Date.now() - start) / (1000 * 60)));
        }

        // 1. Update Room Status to 'dirty' (completed but unverified, remains unavailable/dirty)
        await client.query(`UPDATE rooms SET status = 'dirty' WHERE id = $1`, [currentTask.room_id]);

        // 2. Create cleaning history entry
        await this.housekeepingRepo.createCleaningHistory({
          task_id: currentTask.id,
          room_id: currentTask.room_id,
          assigned_by: currentTask.assigned_by,
          completed_by: updates.assigned_to || currentTask.assigned_to || actorId,
          time_taken_minutes: diffMinutes,
          remarks: dto.remarks || currentTask.remarks || 'Standard cleaning completed successfully',
          created_by: actorId,
          completed_at: updates.completed_at || new Date()
        }, client);

        // 3. Notify Reception and Admin that room is clean and ready
        await this.notificationRepo.createNotification({
          role_target: 'Reception',
          title: `Room ${currentTask.room_name || currentTask.room_number || ''} Clean & Ready`,
          message: `Housekeeping has finished cleaning Room ${currentTask.room_name || currentTask.room_number || ''} in ${diffMinutes} minutes. Status is now Clean.`,
          priority: NotificationPriority.INFO,
          link: `/dashboard/rooms`,
          created_by: actorId
        }, client);
      }

      // If verifying task (Requirement #7: automatically adopt latest version for optimistic locking on verification)
      if (dto.status === HousekeepingStatus.VERIFIED) {
        updates.version = currentTask.version;
        if (!currentTask.completed_at) {
          updates.completed_at = new Date();
        }
        await client.query(`UPDATE rooms SET status = 'available' WHERE id = $1`, [currentTask.room_id]);
      }

      const updatedTask = await this.housekeepingRepo.updateTask(taskId, updates, client);
      await client.query('COMMIT');
      return updatedTask;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async verifyTask(
    taskId: string,
    actorId: string,
    _actorRole?: string | null,
    dto: UpdateHousekeepingTaskDTO = {}
  ): Promise<HousekeepingTask> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN ISOLATION LEVEL SERIALIZABLE');

      // Automatically fetch latest version before verify (Requirement #7)
      const currentTask = await this.housekeepingRepo.findById(taskId, client);
      if (!currentTask) {
        throw new AppError('Housekeeping task not found', 404, ErrorCode.NOT_FOUND);
      }

      const updates: UpdateHousekeepingTaskDTO = {
        ...dto,
        status: HousekeepingStatus.VERIFIED,
        updated_by: actorId,
        version: currentTask.version,
      };

      if (!updates.completed_at && !currentTask.completed_at) {
        updates.completed_at = new Date();
      }

      const updatedTask = await this.housekeepingRepo.updateTask(taskId, updates, client);

      await client.query(`UPDATE rooms SET status = 'available' WHERE id = $1`, [currentTask.room_id]);

      await client.query('COMMIT');
      return updatedTask;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async deleteTask(id: string, actorId: string): Promise<void> {
    const task = await this.housekeepingRepo.findById(id);
    if (!task) {
      throw new AppError('Housekeeping task not found or already deleted', 404, ErrorCode.NOT_FOUND);
    }
    await this.housekeepingRepo.deleteTask(id, actorId);
  }

  async getCleaningHistory(filters?: { room_id?: string; completed_by?: string; limit?: number; offset?: number }) {
    return this.housekeepingRepo.getHistory(filters);
  }

  async getDashboardKPIs(): Promise<HousekeepingDashboardKPIs> {
    return this.housekeepingRepo.getDashboardKPIs();
  }

  async getStaffPerformance(limit?: number): Promise<StaffPerformanceRanking[]> {
    return this.housekeepingRepo.getStaffPerformance(limit);
  }

  async getDailyCleaningTrend(days?: number) {
    return this.housekeepingRepo.getDailyCleaningTrend(days);
  }
}
