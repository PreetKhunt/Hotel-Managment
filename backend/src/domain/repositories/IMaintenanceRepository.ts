import { PoolClient } from 'pg';
import { TaskPriority } from './IHousekeepingRepository';

export enum MaintenanceStatus {
  PENDING = 'Pending',
  ASSIGNED = 'Assigned',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled'
}

export enum IssueType {
  ELECTRICAL = 'Electrical',
  PLUMBING = 'Plumbing',
  FURNITURE = 'Furniture',
  INTERNET = 'Internet',
  AC = 'AC',
  TV = 'TV',
  BATHROOM = 'Bathroom',
  DOOR_LOCK = 'Door Lock',
  WATER = 'Water',
  OTHER = 'Other'
}

export interface MaintenanceRequest {
  id: string;
  room_id: string;
  reported_by: string | null;
  assigned_to: string | null;
  issue_type: IssueType;
  description: string;
  priority: TaskPriority;
  status: MaintenanceStatus;
  estimated_cost: number;
  actual_cost: number;
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
  reporter_name?: string;
  reporter_email?: string;
  technician_name?: string;
  technician_email?: string;
}

export interface MaintenanceAuditLog {
  id: string;
  request_id: string | null;
  room_id: string | null;
  reporter_id: string | null;
  assigned_technician_id: string | null;
  performed_by: string | null;
  action: string;
  old_value: any;
  new_value: any;
  ip_address: string | null;
  correlation_id: string | null;
  repair_time_minutes: number | null;
  repair_cost: number | null;
  remarks: string | null;
  completion_time: Date | null;
  created_at: Date;
  // Joins
  room_number?: string;
  performer_email?: string;
  technician_name?: string;
}

export interface CreateMaintenanceRequestDTO {
  room_id: string;
  reported_by: string;
  assigned_to?: string | null;
  issue_type: IssueType;
  description: string;
  priority?: TaskPriority;
  estimated_cost?: number;
  created_by?: string;
}

export interface UpdateMaintenanceRequestDTO {
  assigned_to?: string | null;
  priority?: TaskPriority;
  status?: MaintenanceStatus;
  description?: string;
  estimated_cost?: number;
  actual_cost?: number;
  started_at?: Date;
  completed_at?: Date;
  updated_by?: string;
  remarks?: string;
  version?: number; // Optimistic locking
}

export interface MaintenanceDashboardKPIs {
  pendingRequests: number;
  inProgress: number;
  completedThisMonth: number;
  emergencyIssues: number;
  averageRepairTimeMinutes: number;
  monthlyMaintenanceCost: number;
  mttrMinutes: number; // Mean Time To Resolution
}

export interface TechnicianPerformance {
  technicianId: string;
  technicianName: string;
  email: string;
  assignedCount: number;
  completedCount: number;
  avgResolutionMinutes: number;
  totalRepairCost: number;
}

export interface IMaintenanceRepository {
  createRequest(dto: CreateMaintenanceRequestDTO, client?: PoolClient): Promise<MaintenanceRequest>;
  findById(id: string, client?: PoolClient): Promise<MaintenanceRequest | null>;
  findAll(filters?: { status?: MaintenanceStatus; assigned_to?: string; reported_by?: string; room_id?: string; issue_type?: IssueType; priority?: TaskPriority }, client?: PoolClient): Promise<MaintenanceRequest[]>;
  updateRequest(id: string, dto: UpdateMaintenanceRequestDTO, client?: PoolClient): Promise<MaintenanceRequest>;
  deleteRequest(id: string, deletedBy: string, client?: PoolClient): Promise<void>;

  logAudit(audit: Omit<MaintenanceAuditLog, 'id' | 'created_at'>, client?: PoolClient): Promise<MaintenanceAuditLog>;
  getAuditLogs(filters?: { request_id?: string; assigned_technician_id?: string; limit?: number; offset?: number }, client?: PoolClient): Promise<{ records: MaintenanceAuditLog[]; total: number }>;

  getDashboardKPIs(): Promise<MaintenanceDashboardKPIs>;
  getTechnicianPerformance(limit?: number): Promise<TechnicianPerformance[]>;
  getCommonIssuesDistribution(): Promise<{ issue_type: string; count: number; total_cost: number }[]>;
  getMonthlyCostTrend(months?: number): Promise<{ month: string; totalCost: number; repairCount: number }[]>;
}
