import { Request, Response, NextFunction } from 'express';
import { HousekeepingService } from '../services/HousekeepingService';
import { AppError, ErrorCode } from '../utils/AppError';
import { HousekeepingStatus, TaskPriority } from '../domain/repositories/IHousekeepingRepository';

export class HousekeepingController {
  constructor(private readonly housekeepingService: HousekeepingService) {}

  public createTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (!user) throw new AppError('Authentication required', 401, ErrorCode.UNAUTHORIZED);

      const { room_id, assigned_to, priority, remarks } = req.body;
      const task = await this.housekeepingService.createCleaningTask({
        room_id,
        assigned_to: assigned_to || null,
        assigned_by: user.id,
        priority: priority as TaskPriority,
        remarks,
        created_by: user.id,
      }, req.ip || '', req.headers['x-correlation-id'] as string || '');

      res.status(201).json({
        success: true,
        message: 'Housekeeping cleaning task created successfully',
        data: task,
      });
    } catch (error) {
      next(error);
    }
  };

  public getTasks = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status, assigned_to, room_id, priority } = req.query;
      const tasks = await this.housekeepingService.getTasks({
        status: status as HousekeepingStatus,
        assigned_to: assigned_to as string,
        room_id: room_id as string,
        priority: priority as TaskPriority,
      });

      res.status(200).json({
        success: true,
        data: tasks,
      });
    } catch (error) {
      next(error);
    }
  };

  public getTaskById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const task = await this.housekeepingService.getTaskById(id);

      res.status(200).json({
        success: true,
        data: task,
      });
    } catch (error) {
      next(error);
    }
  };

  public updateTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (!user) throw new AppError('Authentication required', 401, ErrorCode.UNAUTHORIZED);

      const { id } = req.params;
      const updatedTask = await this.housekeepingService.updateTaskStatus(
        id,
        req.body,
        user.id,
        user.roleName || null,
        req.ip || '',
        req.headers['x-correlation-id'] as string || ''
      );

      res.status(200).json({
        success: true,
        message: 'Housekeeping task updated successfully',
        data: updatedTask,
      });
    } catch (error) {
      next(error);
    }
  };

  public verifyTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (!user) throw new AppError('Authentication required', 401, ErrorCode.UNAUTHORIZED);

      const { id } = req.params;
      const verifiedTask = await this.housekeepingService.verifyTask(
        id,
        user.id,
        user.roleName || null,
        req.body || {}
      );

      res.status(200).json({
        success: true,
        message: 'Housekeeping task verified successfully',
        data: verifiedTask,
      });
    } catch (error) {
      next(error);
    }
  };

  public deleteTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (!user) throw new AppError('Authentication required', 401, ErrorCode.UNAUTHORIZED);
      const { id } = req.params;

      await this.housekeepingService.deleteTask(id, user.id);

      res.status(200).json({
        success: true,
        message: 'Housekeeping task deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  public getCleaningHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { room_id, completed_by, limit, offset } = req.query;
      const history = await this.housekeepingService.getCleaningHistory({
        room_id: room_id as string,
        completed_by: completed_by as string,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        offset: offset ? parseInt(offset as string, 10) : undefined,
      });

      res.status(200).json({
        success: true,
        data: history.records,
        total: history.total,
      });
    } catch (error) {
      next(error);
    }
  };

  public getDashboardAnalytics = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const [kpis, performance, trend] = await Promise.all([
        this.housekeepingService.getDashboardKPIs(),
        this.housekeepingService.getStaffPerformance(10),
        this.housekeepingService.getDailyCleaningTrend(14)
      ]);

      res.status(200).json({
        success: true,
        data: {
          kpis: {
            ...kpis,
            avgTurnaroundMinutes: kpis.averageCleaningTimeMinutes,
            pendingTasksCount: kpis.pendingTasks,
            highPriorityCount: kpis.emergencyTasks
          },
          performance,
          trend,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
