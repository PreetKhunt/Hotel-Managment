import { PoolClient } from 'pg';

export enum HousekeepingStatus {
  PENDING = 'Pending',
  ACCEPTED = 'Accepted',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  VERIFIED = 'Verified',
  CANCELLED = 'Cancelled'
}

export enum TaskPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  EMERGENCY = 'Emergency'
}

export interface HousekeepingTask {
  id: string;
  room_id: string;
  assigned_to: string | null;
  assigned_by: string | null;
  status: HousekeepingStatus;
  priority: TaskPriority;
  remarks: string | null;
  version: number;
  started_at: Date | null;
  completed_at: Date | null;
  created_by: string | null;
  updated_by: string | null;
  deleted_by: string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
  // Joins
  room_number?: string;
  room_name?: string;
  room_status?: string;
  assignee_name?: string;
  assigner_name?: string;
}

export interface CleaningHistoryRecord {
  id: string;
  task_id: string;
  room_id: string;
  assigned_by: string | null;
  completed_by: string | null;
  time_taken_minutes: number;
  remarks: string | null;
  created_by: string | null;
  completed_at: Date;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
  // Joins
  room_number?: string;
  room_name?: string;
  cleaner_name?: string;
  cleaner_email?: string;
}

export interface CreateHousekeepingTaskDTO {
  room_id: string;
  assigned_to?: string | null;
  assigned_by?: string | null;
  priority?: TaskPriority;
  remarks?: string;
  created_by?: string;
}

export interface UpdateHousekeepingTaskDTO {
  assigned_to?: string | null;
  status?: HousekeepingStatus;
  priority?: TaskPriority;
  remarks?: string;
  started_at?: Date;
  completed_at?: Date;
  updated_by?: string;
  version?: number; // For optimistic locking
}

export interface HousekeepingDashboardKPIs {
  totalTasks: number;
  completedToday: number;
  pendingTasks: number;
  emergencyTasks: number;
  averageCleaningTimeMinutes: number | null;
  completionRate: number;
  cleanCount: number;
  dirtyCount: number;
  underCleaningCount: number;
}

export interface StaffPerformanceRanking {
  staffId: string;
  staffName: string;
  email: string;
  completedTasks: number;
  averageTimeMinutes: number;
}

export interface IHousekeepingRepository {
  createTask(dto: CreateHousekeepingTaskDTO, client?: PoolClient): Promise<HousekeepingTask>;
  findById(id: string, client?: PoolClient): Promise<HousekeepingTask | null>;
  findAll(filters?: { status?: HousekeepingStatus; assigned_to?: string; room_id?: string; priority?: TaskPriority }, client?: PoolClient): Promise<HousekeepingTask[]>;
  updateTask(id: string, dto: UpdateHousekeepingTaskDTO, client?: PoolClient): Promise<HousekeepingTask>;
  deleteTask(id: string, deletedBy: string, client?: PoolClient): Promise<void>;
  
  createCleaningHistory(record: Omit<CleaningHistoryRecord, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>, client?: PoolClient): Promise<CleaningHistoryRecord>;
  getHistory(filters?: { room_id?: string; completed_by?: string; limit?: number; offset?: number }, client?: PoolClient): Promise<{ records: CleaningHistoryRecord[]; total: number }>;
  
  getDashboardKPIs(): Promise<HousekeepingDashboardKPIs>;
  getStaffPerformance(limit?: number): Promise<StaffPerformanceRanking[]>;
  getDailyCleaningTrend(days?: number): Promise<{ date: string; completedCount: number; avgTime: number }[]>;
}
