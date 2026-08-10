import api from '../api';
import { HousekeepingTask, CleaningHistoryRecord, HousekeepingStatus, TaskPriority } from '@/types';

export interface HousekeepingAnalytics {
  kpis: {
    cleanCount: number;
    dirtyCount: number;
    underCleaningCount: number;
    pendingTasksCount: number;
    highPriorityCount: number;
    avgTurnaroundMinutes: number | null;
  };
  performance: {
    staff_id: string;
    staff_name?: string;
    tasks_completed: number;
    avg_minutes_per_room: number;
  }[];
  trend: {
    cleaning_date: string;
    rooms_cleaned: number;
    avg_duration_min: number;
  }[];
}

export const housekeepingApi = {
  getTasks: async (filters?: { status?: HousekeepingStatus; assigned_to?: string; room_id?: string; priority?: TaskPriority }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.assigned_to) params.append('assigned_to', filters.assigned_to);
    if (filters?.room_id) params.append('room_id', filters.room_id);
    if (filters?.priority) params.append('priority', filters.priority);
    const response = await api.get<{ success: boolean; data: HousekeepingTask[] }>(`/housekeeping/tasks?${params.toString()}`);
    return response.data.data;
  },

  getTaskById: async (id: string) => {
    const response = await api.get<{ success: boolean; data: HousekeepingTask }>(`/housekeeping/tasks/${id}`);
    return response.data.data;
  },

  createTask: async (data: { room_id: string; assigned_to?: string | null; priority: TaskPriority; remarks?: string }) => {
    const response = await api.post<{ success: boolean; data: HousekeepingTask }>('/housekeeping/tasks', data);
    return response.data.data;
  },

  updateTaskStatus: async (id: string, updates: { status?: HousekeepingStatus; assigned_to?: string | null; priority?: TaskPriority; remarks?: string; version?: number }) => {
    const response = await api.patch<{ success: boolean; data: HousekeepingTask }>(`/housekeeping/tasks/${id}/status`, updates);
    return response.data.data;
  },

  deleteTask: async (id: string) => {
    await api.delete(`/housekeeping/tasks/${id}`);
  },

  getHistory: async (filters?: { room_id?: string; completed_by?: string; limit?: number; offset?: number }) => {
    const params = new URLSearchParams();
    if (filters?.room_id) params.append('room_id', filters.room_id);
    if (filters?.completed_by) params.append('completed_by', filters.completed_by);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());
    const response = await api.get<{ success: boolean; data: CleaningHistoryRecord[]; total: number }>(`/housekeeping/history?${params.toString()}`);
    return response.data;
  },

  getAnalytics: async () => {
    const response = await api.get<{ success: boolean; data: HousekeepingAnalytics }>('/housekeeping/analytics');
    return response.data.data;
  }
};
