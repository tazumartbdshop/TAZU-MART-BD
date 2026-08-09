import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { broadcastSync } from '../lib/broadcastSync';

export type SystemNotificationType = 
  | 'order' 
  | 'payment' 
  | 'shipping' 
  | 'refund' 
  | 'account' 
  | 'security' 
  | 'system';

export interface SystemNotification {
  id: string;
  type: SystemNotificationType;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  orderId?: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

interface SystemNotificationStore {
  notifications: SystemNotification[];
  addNotification: (notification: Omit<SystemNotification, 'id' | 'createdAt' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  getUnreadCount: () => number;
}

export const useSystemNotificationStore = create<SystemNotificationStore>()(
  persist(
    (set, get) => ({
      // Currently empty by default for clean empty state
      notifications: [],

      addNotification: (notifData) => {
        const newNotif: SystemNotification = {
          ...notifData,
          id: 'sys_notif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
          createdAt: new Date().toISOString(),
          isRead: false,
        };
        const updated = [newNotif, ...get().notifications];
        set({ notifications: updated });
        broadcastSync.publish('system_notifications', updated);
      },

      markAsRead: (id: string) => {
        const updated = get().notifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n
        );
        set({ notifications: updated });
        broadcastSync.publish('system_notifications', updated);
      },

      markAllAsRead: () => {
        const updated = get().notifications.map((n) => ({ ...n, isRead: true }));
        set({ notifications: updated });
        broadcastSync.publish('system_notifications', updated);
      },

      deleteNotification: (id: string) => {
        const updated = get().notifications.filter((n) => n.id !== id);
        set({ notifications: updated });
        broadcastSync.publish('system_notifications', updated);
      },

      clearAll: () => {
        set({ notifications: [] });
        broadcastSync.publish('system_notifications', []);
      },

      getUnreadCount: () => {
        return get().notifications.filter((n) => !n.isRead).length;
      },
    }),
    {
      name: 'tazu-system-notifications',
    }
  )
);
