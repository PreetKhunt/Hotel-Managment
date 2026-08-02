import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { housekeepingApi } from '@/lib/api/housekeeping';
import { maintenanceApi } from '@/lib/api/maintenance';
import { notificationsApi } from '@/lib/api/notifications';
import { HousekeepingStatus, MaintenanceStatus, TaskPriority, IssueType } from '@/types';
import toast from 'react-hot-toast';

// ─── HOUSEKEEPING HOOKS ───────────────────────────────────────────────────────

export function useHousekeepingTasks(filters?: { status?: HousekeepingStatus; assigned_to?: string; room_id?: string; priority?: TaskPriority }) {
  return useQuery({
    queryKey: ['housekeeping-tasks', filters],
    queryFn: () => housekeepingApi.getTasks(filters),
    refetchInterval: 15000, // Live syncing every 15 seconds
  });
}

export function useHousekeepingHistory(filters?: { room_id?: string; completed_by?: string; limit?: number; offset?: number }) {
  return useQuery({
    queryKey: ['housekeeping-history', filters],
    queryFn: () => housekeepingApi.getHistory(filters),
  });
}

export function useHousekeepingAnalytics() {
  return useQuery({
    queryKey: ['housekeeping-analytics'],
    queryFn: () => housekeepingApi.getAnalytics(),
    refetchInterval: 30000,
  });
}

export function useHousekeepingMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: { room_id: string; assigned_to?: string | null; priority: TaskPriority; remarks?: string }) =>
      housekeepingApi.createTask(data),
    onSuccess: () => {
      toast.success('Cleaning task assigned successfully');
      queryClient.invalidateQueries({ queryKey: ['housekeeping-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['housekeeping-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to create task');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: { status?: HousekeepingStatus; assigned_to?: string | null; priority?: TaskPriority; remarks?: string; version?: number } }) =>
      housekeepingApi.updateTaskStatus(id, updates),
    onSuccess: (_, variables) => {
      toast.success(`Task status updated to ${variables.updates.status || 'modified'}`);
      queryClient.invalidateQueries({ queryKey: ['housekeeping-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['housekeeping-history'] });
      queryClient.invalidateQueries({ queryKey: ['housekeeping-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
    onError: (err: any) => {
      if (err?.response?.status === 409 || err?.response?.data?.message?.includes('concurrency')) {
        toast.error('Conflict: Task was modified by another user. Refreshing...');
        queryClient.invalidateQueries({ queryKey: ['housekeeping-tasks'] });
      } else {
        toast.error(err?.response?.data?.message || 'Failed to update task');
      }
    },
  });

  return { createMutation, updateStatusMutation };
}

// ─── MAINTENANCE HOOKS ────────────────────────────────────────────────────────

export function useMaintenanceRequests(filters?: { status?: MaintenanceStatus; assigned_to?: string; reported_by?: string; room_id?: string; issue_type?: IssueType; priority?: TaskPriority }) {
  return useQuery({
    queryKey: ['maintenance-requests', filters],
    queryFn: () => maintenanceApi.getRequests(filters),
    refetchInterval: 15000, // Live syncing every 15 seconds
  });
}

export function useMaintenanceAuditLogs(filters?: { request_id?: string; assigned_technician_id?: string; limit?: number; offset?: number }) {
  return useQuery({
    queryKey: ['maintenance-audit-logs', filters],
    queryFn: () => maintenanceApi.getAuditLogs(filters),
  });
}

export function useMaintenanceAnalytics() {
  return useQuery({
    queryKey: ['maintenance-analytics'],
    queryFn: () => maintenanceApi.getAnalytics(),
    refetchInterval: 30000,
  });
}

export function useMaintenanceMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: { room_id: string; assigned_to?: string | null; issue_type: IssueType; description: string; priority?: TaskPriority; estimated_cost?: number }) =>
      maintenanceApi.createRequest(data),
    onSuccess: () => {
      toast.success('Maintenance repair request submitted successfully');
      queryClient.invalidateQueries({ queryKey: ['maintenance-requests'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to submit maintenance ticket');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: { status?: MaintenanceStatus; assigned_to?: string | null; priority?: TaskPriority; description?: string; estimated_cost?: number; actual_cost?: number; remarks?: string; version?: number } }) =>
      maintenanceApi.updateRequestStatus(id, updates),
    onSuccess: (_, variables) => {
      toast.success(`Maintenance order status set to ${variables.updates.status || 'updated'}`);
      queryClient.invalidateQueries({ queryKey: ['maintenance-requests'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance-audit-logs'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
    onError: (err: any) => {
      if (err?.response?.status === 409 || err?.response?.data?.message?.includes('concurrency')) {
        toast.error('Conflict: Record updated by another technician. Refreshing data...');
        queryClient.invalidateQueries({ queryKey: ['maintenance-requests'] });
      } else {
        toast.error(err?.response?.data?.message || 'Failed to update maintenance order');
      }
    },
  });

  return { createMutation, updateMutation };
}

// ─── REAL-TIME SYSTEM NOTIFICATIONS HOOK ──────────────────────────────────────

export function useSystemNotifications() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['system-notifications'],
    queryFn: () => notificationsApi.getNotifications(),
    refetchInterval: 10000, // Frequent background polling every 10 seconds for real-time alerting
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-notifications'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      toast.success('All notifications cleared');
      queryClient.invalidateQueries({ queryKey: ['system-notifications'] });
    },
  });

  return {
    notifications: query.data?.data || [],
    unreadCount: query.data?.unreadCount || 0,
    isLoading: query.isLoading,
    markRead: markReadMutation.mutate,
    markAllRead: markAllReadMutation.mutate,
  };
}
