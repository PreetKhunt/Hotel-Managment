import api from '../api';
import { MaintenanceRequest, MaintenanceAuditLog, MaintenanceStatus, IssueType, TaskPriority } from '@/types';

export interface MaintenanceAnalytics {
  kpis: {
    reportedCount: number;
    inProgressCount: number;
    onHoldCount: number;
    completedTodayCount: number;
    mttrHours: number;
    totalMaintenanceCosts: number;
  };
  performance: {
    technician_id: string;
    technician_name?: string;
    completed_tickets: number;
    avg_mttr_hours: number;
    total_spend: number;
  }[];
  commonIssues: {
    issue_type: string;
    count: number;
    cost_sum: number;
  }[];
  costTrend: {
    month_year: string;
    total_cost: number;
    ticket_count: number;
  }[];
}

export const maintenanceApi = {
  getRequests: async (filters?: { status?: MaintenanceStatus; assigned_to?: string; reported_by?: string; room_id?: string; issue_type?: IssueType; priority?: TaskPriority }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.assigned_to) params.append('assigned_to', filters.assigned_to);
    if (filters?.reported_by) params.append('reported_by', filters.reported_by);
    if (filters?.room_id) params.append('room_id', filters.room_id);
    if (filters?.issue_type) params.append('issue_type', filters.issue_type);
    if (filters?.priority) params.append('priority', filters.priority);
    const response = await api.get<{ success: boolean; data: MaintenanceRequest[] }>(`/maintenance/requests?${params.toString()}`);
    return response.data.data;
  },

  getRequestById: async (id: string) => {
    const response = await api.get<{ success: boolean; data: MaintenanceRequest }>(`/maintenance/requests/${id}`);
    return response.data.data;
  },

  createRequest: async (data: { room_id: string; assigned_to?: string | null; issue_type: IssueType; description: string; priority?: TaskPriority; estimated_cost?: number }) => {
    const response = await api.post<{ success: boolean; data: MaintenanceRequest }>('/maintenance/requests', data);
    return response.data.data;
  },

  updateRequestStatus: async (id: string, updates: { status?: MaintenanceStatus; assigned_to?: string | null; priority?: TaskPriority; description?: string; estimated_cost?: number; actual_cost?: number; remarks?: string; version?: number }) => {
    const response = await api.patch<{ success: boolean; data: MaintenanceRequest }>(`/maintenance/requests/${id}/status`, updates);
    return response.data.data;
  },

  deleteRequest: async (id: string) => {
    await api.delete(`/maintenance/requests/${id}`);
  },

  getAuditLogs: async (filters?: { request_id?: string; assigned_technician_id?: string; limit?: number; offset?: number }) => {
    const params = new URLSearchParams();
    if (filters?.request_id) params.append('request_id', filters.request_id);
    if (filters?.assigned_technician_id) params.append('assigned_technician_id', filters.assigned_technician_id);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());
    const response = await api.get<{ success: boolean; data: MaintenanceAuditLog[]; total: number }>(`/maintenance/audit-logs?${params.toString()}`);
    return response.data;
  },

  getAnalytics: async () => {
    const response = await api.get<{ success: boolean; data: MaintenanceAnalytics }>('/maintenance/analytics');
    return response.data.data;
  }
};
