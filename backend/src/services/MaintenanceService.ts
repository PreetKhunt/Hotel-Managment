import { Pool } from 'pg';
import {
  IMaintenanceRepository,
  MaintenanceRequest,
  CreateMaintenanceRequestDTO,
  UpdateMaintenanceRequestDTO,
  MaintenanceDashboardKPIs,
  TechnicianPerformance,
  MaintenanceStatus,
  IssueType
} from '../domain/repositories/IMaintenanceRepository';
import { TaskPriority } from '../domain/repositories/IHousekeepingRepository';
import { INotificationRepository, NotificationPriority } from '../domain/repositories/INotificationRepository';
import { AppError, ErrorCode } from '../utils/AppError';

export class MaintenanceService {
  constructor(
    private pool: Pool,
    private maintenanceRepo: IMaintenanceRepository,
    private notificationRepo: INotificationRepository
  ) {}

  async createRequest(dto: CreateMaintenanceRequestDTO, actorId: string, ipAddress?: string, correlationId?: string): Promise<MaintenanceRequest> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN ISOLATION LEVEL SERIALIZABLE');

      // 1. Check room inventory
      const roomCheck = await client.query('SELECT id, name FROM rooms WHERE id = $1', [dto.room_id]);
      if (roomCheck.rows.length === 0) {
        throw new AppError('Targeted room does not exist in inventory', 404, ErrorCode.NOT_FOUND);
      }
      const roomNumber = roomCheck.rows[0].name || dto.room_id.substring(0, 8);

      // 2. Create Request
      const request = await this.maintenanceRepo.createRequest({ ...dto, created_by: actorId }, client);

      // 3. Log Audit Trail
      await this.maintenanceRepo.logAudit({
        request_id: request.id,
        room_id: request.room_id,
        reporter_id: actorId,
        assigned_technician_id: request.assigned_to,
        performed_by: actorId,
        action: 'CREATED',
        old_value: null,
        new_value: request,
        ip_address: ipAddress || null,
        correlation_id: correlationId || null,
        repair_time_minutes: null,
        repair_cost: null,
        remarks: 'Maintenance ticket raised',
        completion_time: null
      }, client);

      // 4. Send role-aware alert to Technicians
      const priorityNotif = dto.priority === TaskPriority.EMERGENCY ? NotificationPriority.CRITICAL : NotificationPriority.WARNING;
      if (dto.assigned_to) {
        await this.notificationRepo.createNotification({
          recipient_id: dto.assigned_to,
          title: `New Repair Task: ${dto.issue_type} (Room ${roomNumber})`,
          message: `You have been assigned a ${dto.priority || 'Medium'}-priority maintenance task in Room ${roomNumber}: ${dto.description}`,
          priority: priorityNotif,
          link: `/dashboard/maintenance`,
          created_by: actorId
        }, client);
      } else {
        await this.notificationRepo.createNotification({
          role_target: 'Technician',
          title: `Unassigned Repair Issue: ${dto.issue_type} (Room ${roomNumber})`,
          message: `Room ${roomNumber} reported a ${dto.issue_type} problem (${dto.priority || 'Medium'} priority). Technicians please accept ticket.`,
          priority: priorityNotif,
          link: `/dashboard/maintenance`,
          created_by: actorId
        }, client);
      }

      await client.query('COMMIT');
      return request;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getRequests(filters?: { status?: MaintenanceStatus; assigned_to?: string; reported_by?: string; room_id?: string; issue_type?: IssueType; priority?: TaskPriority }): Promise<MaintenanceRequest[]> {
    return this.maintenanceRepo.findAll(filters);
  }

  async getRequestById(id: string): Promise<MaintenanceRequest> {
    const req = await this.maintenanceRepo.findById(id);
    if (!req) {
      throw new AppError('Maintenance request not found', 404, ErrorCode.NOT_FOUND);
    }
    return req;
  }

  async updateRequestStatus(
    id: string,
    dto: UpdateMaintenanceRequestDTO,
    actorId: string,
    actorRole?: string | null,
    ipAddress?: string,
    correlationId?: string
  ): Promise<MaintenanceRequest> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN ISOLATION LEVEL SERIALIZABLE');

      const currentReq = await this.maintenanceRepo.findById(id, client);
      if (!currentReq) {
        throw new AppError('Maintenance request not found', 404, ErrorCode.NOT_FOUND);
      }

      if (actorRole !== 'Admin' && actorRole !== 'Super Admin' && currentReq.assigned_to && currentReq.assigned_to !== actorId) {
        throw new AppError('You are not authorized to modify a maintenance request assigned to another technician', 403, ErrorCode.FORBIDDEN);
      }

      const updates: UpdateMaintenanceRequestDTO = { ...dto, updated_by: actorId };
      let actionName = 'UPDATED';

      if (dto.status === MaintenanceStatus.ASSIGNED && currentReq.status !== MaintenanceStatus.ASSIGNED) {
        actionName = 'ASSIGNED';
      }

      // If accepting or starting repairs
      if (dto.status === MaintenanceStatus.IN_PROGRESS) {
        actionName = 'STARTED';
        if (!currentReq.assigned_to) {
          updates.assigned_to = actorId;
        }
        if (!currentReq.started_at) {
          updates.started_at = new Date();
        }
        // Transition room to maintenance status
        await client.query(`UPDATE rooms SET status = 'maintenance' WHERE id = $1`, [currentReq.room_id]);
      }

      // If completing repairs
      let repairTimeMinutes: number | null = null;
      let finalCost: number | null = null;

      if (dto.status === MaintenanceStatus.COMPLETED) {
        actionName = 'COMPLETED';
        updates.completed_at = new Date();
        const start = currentReq.started_at ? new Date(currentReq.started_at).getTime() : Date.now() - (45 * 60 * 1000);
        repairTimeMinutes = Math.max(1, Math.round((Date.now() - start) / (1000 * 60)));
        finalCost = dto.actual_cost !== undefined ? dto.actual_cost : currentReq.actual_cost;

        // Transition room back to available
        await client.query(`UPDATE rooms SET status = 'available' WHERE id = $1`, [currentReq.room_id]);

        // Notify Reception & Admin
        await this.notificationRepo.createNotification({
          role_target: 'Reception',
          title: `Room ${currentReq.room_name || currentReq.room_number || ''} Maintenance Resolved`,
          message: `Technician resolved ${currentReq.issue_type} issue in Room ${currentReq.room_name || currentReq.room_number || ''} (Time: ${repairTimeMinutes} min, Cost: $${finalCost}). Room is now available.`,
          priority: NotificationPriority.INFO,
          link: `/dashboard/rooms`,
          created_by: actorId
        }, client);
      }

      if (dto.status === MaintenanceStatus.CANCELLED) {
        actionName = 'CANCELLED';
      }

      if (dto.status === MaintenanceStatus.VERIFIED) {
        actionName = 'VERIFIED';
        updates.version = currentReq.version;
        if (!currentReq.completed_at) {
          updates.completed_at = new Date();
        }
        await client.query(`UPDATE rooms SET status = 'available' WHERE id = $1`, [currentReq.room_id]);
      }

      const updatedReq = await this.maintenanceRepo.updateRequest(id, updates, client);

      // Record detailed Audit Log
      await this.maintenanceRepo.logAudit({
        request_id: currentReq.id,
        room_id: currentReq.room_id,
        reporter_id: currentReq.reported_by,
        assigned_technician_id: updatedReq.assigned_to,
        performed_by: actorId,
        action: actionName,
        old_value: currentReq,
        new_value: updatedReq,
        ip_address: ipAddress || null,
        correlation_id: correlationId || null,
        repair_time_minutes: repairTimeMinutes,
        repair_cost: finalCost !== null ? finalCost : updatedReq.actual_cost,
        remarks: dto.remarks || `Status transitioned to ${updatedReq.status}`,
        completion_time: updates.completed_at || null
      }, client);

      await client.query('COMMIT');
      return updatedReq;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async verifyRequest(
    id: string,
    actorId: string,
    _actorRole?: string | null,
    dto: any = {},
    ipAddress?: string,
    correlationId?: string
  ): Promise<MaintenanceRequest> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN ISOLATION LEVEL SERIALIZABLE');

      // Automatically fetch latest version before verify (Requirement #7)
      const currentReq = await this.maintenanceRepo.findById(id, client);
      if (!currentReq) {
        throw new AppError('Maintenance request not found', 404, ErrorCode.NOT_FOUND);
      }

      const finalCost = dto.actual_cost ?? dto.actualCost ?? currentReq.actual_cost ?? currentReq.estimated_cost ?? 0.00;
      const remarks = dto.remarks || 'Repair verified and quality assured by staff';

      const updates: UpdateMaintenanceRequestDTO = {
        status: MaintenanceStatus.VERIFIED,
        actual_cost: finalCost,
        remarks: remarks,
        updated_by: actorId,
        version: currentReq.version,
      };

      if (!currentReq.completed_at) {
        updates.completed_at = new Date();
      }

      const updatedReq = await this.maintenanceRepo.updateRequest(id, updates, client);

      await client.query(`UPDATE rooms SET status = 'available' WHERE id = $1`, [currentReq.room_id]);

      await this.maintenanceRepo.logAudit({
        request_id: currentReq.id,
        room_id: currentReq.room_id,
        reporter_id: currentReq.reported_by,
        assigned_technician_id: updatedReq.assigned_to,
        performed_by: actorId,
        action: 'VERIFIED',
        old_value: currentReq,
        new_value: updatedReq,
        ip_address: ipAddress || null,
        correlation_id: correlationId || null,
        repair_time_minutes: null,
        repair_cost: finalCost,
        remarks: remarks,
        completion_time: updates.completed_at || currentReq.completed_at || null
      }, client);

      await client.query('COMMIT');
      return updatedReq;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async deleteRequest(id: string, actorId: string): Promise<void> {
    const req = await this.maintenanceRepo.findById(id);
    if (!req) {
      throw new AppError('Maintenance record not found or already deleted', 404, ErrorCode.NOT_FOUND);
    }
    await this.maintenanceRepo.deleteRequest(id, actorId);
  }

  async getAuditLogs(filters?: { request_id?: string; assigned_technician_id?: string; limit?: number; offset?: number }) {
    return this.maintenanceRepo.getAuditLogs(filters);
  }

  async getDashboardKPIs(): Promise<MaintenanceDashboardKPIs> {
    return this.maintenanceRepo.getDashboardKPIs();
  }

  async getTechnicianPerformance(limit?: number): Promise<TechnicianPerformance[]> {
    return this.maintenanceRepo.getTechnicianPerformance(limit);
  }

  async getCommonIssuesDistribution() {
    return this.maintenanceRepo.getCommonIssuesDistribution();
  }

  async getMonthlyCostTrend(months?: number) {
    return this.maintenanceRepo.getMonthlyCostTrend(months);
  }
}
