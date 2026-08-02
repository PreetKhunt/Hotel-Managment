import api from '../api';
import { SystemNotification } from '@/types';

export const notificationsApi = {
  getNotifications: async () => {
    const response = await api.get<{ success: boolean; data: SystemNotification[]; unreadCount: number }>('/notifications');
    return response.data;
  },

  markAsRead: async (id: string) => {
    await api.patch(`/notifications/${id}/read`, {});
  },

  markAllAsRead: async () => {
    await api.patch('/notifications/mark-all-read', {});
  }
};
