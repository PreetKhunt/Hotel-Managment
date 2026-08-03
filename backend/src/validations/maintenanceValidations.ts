import { z } from 'zod';
import { MaintenanceStatus, IssueType } from '../domain/repositories/IMaintenanceRepository';
import { TaskPriority } from '../domain/repositories/IHousekeepingRepository';

export const createMaintenanceRequestSchema = z.object({
  body: z.object({
    room_id: z.string().uuid('Invalid Room ID UUID'),
    assigned_to: z.string().uuid('Invalid Technician UUID').nullable().optional(),
    issue_type: z.enum([
      IssueType.ELECTRICAL,
      IssueType.PLUMBING,
      IssueType.FURNITURE,
      IssueType.INTERNET,
      IssueType.AC,
      IssueType.TV,
      IssueType.BATHROOM,
      IssueType.DOOR_LOCK,
      IssueType.WATER,
      IssueType.OTHER,
    ]),
    description: z.string().min(5, 'Description must be at least 5 characters').max(1500),
    priority: z.enum([TaskPriority.LOW, TaskPriority.MEDIUM, TaskPriority.HIGH, TaskPriority.EMERGENCY]).optional(),
    estimated_cost: z.number().min(0).max(1000000).optional(),
  }),
});

export const updateMaintenanceRequestSchema = z.object({
  body: z.object({
    assigned_to: z.string().uuid('Invalid Technician UUID').nullable().optional(),
    status: z.enum([
      MaintenanceStatus.PENDING,
      MaintenanceStatus.REPORTED,
      MaintenanceStatus.ASSIGNED,
      MaintenanceStatus.IN_PROGRESS,
      MaintenanceStatus.ON_HOLD,
      MaintenanceStatus.COMPLETED,
      MaintenanceStatus.VERIFIED,
      MaintenanceStatus.CANCELLED,
    ]).optional(),
    priority: z.enum([TaskPriority.LOW, TaskPriority.MEDIUM, TaskPriority.HIGH, TaskPriority.EMERGENCY]).optional(),
    description: z.string().min(5).max(1500).optional(),
    estimated_cost: z.number().min(0).max(1000000).optional(),
    actual_cost: z.number().min(0).max(1000000).optional(),
    actualCost: z.number().min(0).max(1000000).optional(),
    remarks: z.string().max(1000).optional(),
    version: z.number().int().positive().optional(),
  }),
});

export const verifyMaintenanceRequestSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid Maintenance Request ID UUID'),
  }),
  body: z.object({
    status: z.enum([MaintenanceStatus.VERIFIED]).optional(),
    actual_cost: z.number().min(0).max(1000000).optional(),
    actualCost: z.number().min(0).max(1000000).optional(),
    remarks: z.string().max(1000).optional(),
    version: z.number().int().positive().optional(),
  }).optional(),
});

export const filterMaintenanceHistorySchema = z.object({
  query: z.object({
    request_id: z.string().uuid().optional(),
    assigned_technician_id: z.string().uuid().optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    offset: z.string().regex(/^\d+$/).transform(Number).optional(),
  }),
});
