import { z } from 'zod';
import { HousekeepingStatus, TaskPriority } from '../domain/repositories/IHousekeepingRepository';

export const createHousekeepingTaskSchema = z.object({
  body: z.object({
    room_id: z.string().uuid('Invalid Room ID UUID'),
    assigned_to: z.string().uuid('Invalid Assignee UUID').nullable().optional(),
    priority: z.enum([TaskPriority.LOW, TaskPriority.MEDIUM, TaskPriority.HIGH, TaskPriority.EMERGENCY]).optional(),
    remarks: z.string().max(1000).optional(),
  }),
});

export const updateHousekeepingTaskSchema = z.object({
  body: z.object({
    assigned_to: z.string().uuid('Invalid Assignee UUID').nullable().optional(),
    status: z.enum([
      HousekeepingStatus.PENDING,
      HousekeepingStatus.ACCEPTED,
      HousekeepingStatus.IN_PROGRESS,
      HousekeepingStatus.COMPLETED,
      HousekeepingStatus.VERIFIED,
      HousekeepingStatus.CANCELLED,
    ]).optional(),
    priority: z.enum([TaskPriority.LOW, TaskPriority.MEDIUM, TaskPriority.HIGH, TaskPriority.EMERGENCY]).optional(),
    remarks: z.string().max(1000).optional(),
    version: z.number().int().positive().optional(),
  }),
});

export const verifyHousekeepingTaskSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid Task ID UUID'),
  }),
  body: z.object({
    status: z.enum([HousekeepingStatus.VERIFIED]).optional(),
    remarks: z.string().max(1000).optional(),
    version: z.number().int().positive().optional(),
  }).optional(),
});

export const filterHousekeepingHistorySchema = z.object({
  query: z.object({
    room_id: z.string().uuid().optional(),
    completed_by: z.string().uuid().optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    offset: z.string().regex(/^\d+$/).transform(Number).optional(),
  }),
});
