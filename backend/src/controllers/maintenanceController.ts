import { Request, Response, NextFunction } from 'express';
import { MaintenanceService } from '../services/MaintenanceService';
import { AppError, ErrorCode } from '../utils/AppError';
import { MaintenanceStatus, IssueType } from '../domain/repositories/IMaintenanceRepository';
import { TaskPriority } from '../domain/repositories/IHousekeepingRepository';

export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  public createRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (!user) throw new AppError('Authentication required', 401, ErrorCode.UNAUTHORIZED);

      const { room_id, assigned_to, issue_type, description, priority, estimated_cost } = req.body;
      const request = await this.maintenanceService.createRequest({
        room_id,
        reported_by: user.id,
        assigned_to: assigned_to || null,
        issue_type: issue_type as IssueType,
        description,
        priority: priority as TaskPriority,
        estimated_cost: estimated_cost || 0.00,
        created_by: user.id,
      }, user.id, req.ip || '', req.headers['x-correlation-id'] as string || '');

      res.status(201).json({
        success: true,
        message: 'Maintenance request created successfully',
        data: request,
      });
    } catch (error) {
      next(error);
    }
  };

  public getRequests = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status, assigned_to, reported_by, room_id, issue_type, priority } = req.query;
      const requests = await this.maintenanceService.getRequests({
        status: status as MaintenanceStatus,
        assigned_to: assigned_to as string,
        reported_by: reported_by as string,
        room_id: room_id as string,
        issue_type: issue_type as IssueType,
        priority: priority as TaskPriority,
      });

      res.status(200).json({
        success: true,
        data: requests,
      });
    } catch (error) {
      next(error);
    }
  };

  public getRequestById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const request = await this.maintenanceService.getRequestById(id);

      res.status(200).json({
        success: true,
        data: request,
      });
    } catch (error) {
      next(error);
    }
  };

  public updateRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (!user) throw new AppError('Authentication required', 401, ErrorCode.UNAUTHORIZED);

      const { id } = req.params;
      const updatedReq = await this.maintenanceService.updateRequestStatus(
        id,
        req.body,
        user.id,
        user.roleName || null,
        req.ip || '',
        req.headers['x-correlation-id'] as string || ''
      );

      res.status(200).json({
        success: true,
        message: 'Maintenance request updated successfully',
        data: updatedReq,
      });
    } catch (error) {
      next(error);
    }
  };

  public verifyRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (!user) throw new AppError('Authentication required', 401, ErrorCode.UNAUTHORIZED);

      const { id } = req.params;
      const verifiedReq = await this.maintenanceService.verifyRequest(
        id,
        user.id,
        user.roleName || null,
        req.body || {},
        req.ip || '',
        req.headers['x-correlation-id'] as string || ''
      );

      res.status(200).json({
        success: true,
        message: 'Maintenance repair verified successfully',
        data: verifiedReq,
      });
    } catch (error) {
      next(error);
    }
  };

  public deleteRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (!user) throw new AppError('Authentication required', 401, ErrorCode.UNAUTHORIZED);
      const { id } = req.params;

      await this.maintenanceService.deleteRequest(id, user.id);

      res.status(200).json({
        success: true,
        message: 'Maintenance record deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  public getAuditLogs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { request_id, assigned_technician_id, limit, offset } = req.query;
      const logs = await this.maintenanceService.getAuditLogs({
        request_id: request_id as string,
        assigned_technician_id: assigned_technician_id as string,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        offset: offset ? parseInt(offset as string, 10) : undefined,
      });

      res.status(200).json({
        success: true,
        data: logs.records,
        total: logs.total,
      });
    } catch (error) {
      next(error);
    }
  };

  public getDashboardAnalytics = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const [kpis, performance, commonIssues, costTrend] = await Promise.all([
        this.maintenanceService.getDashboardKPIs(),
        this.maintenanceService.getTechnicianPerformance(10),
        this.maintenanceService.getCommonIssuesDistribution(),
        this.maintenanceService.getMonthlyCostTrend(6),
      ]);

      res.status(200).json({
        success: true,
        data: {
          kpis,
          performance,
          commonIssues,
          costTrend,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
