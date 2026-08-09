import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { broadcastSync } from '../lib/broadcastSync';

export interface PromotionalNotification {
  id: string;
  title: string;
  message?: string;
  description: string;
  coverImage?: string; // Campaign Cover Image or Company Logo fallback
  bannerImage?: string; // Alias for backwards compatibility
  selectedCategoryIds?: string[];
  selectedProductIds?: string[]; // Selected product IDs in chosen order
  type?: 'flash_sale' | 'discount' | 'coupon' | 'launch' | 'delivery' | 'order' | 'stock' | 'festival' | 'free_shipping' | 'vip' | 'custom';
  targetAudience?: 'all' | 'verified' | 'vip' | 'new' | 'specific' | 'purchase_count';
  couponCode?: string;
  couponDescription?: string;
  discountType?: 'Percentage' | 'Fixed Amount';
  discountAmount?: number;
  redirectLink?: string;
  scheduledTime?: string;
  expiryDate?: string;
  createdAt: string;
  createdBy?: string; // e.g. "Admin"
  publishedStatus?: 'Published' | 'Draft';
  readBy?: string[]; // Array of customer IDs/emails who have read this
  isRead?: boolean; // Fallback read status for guest / simple user
  priority?: 'urgent' | 'important' | 'offer' | 'normal';
  totalSent?: number;
  totalOpened?: number;
  totalClicked?: number;
}

interface NotificationStore {
  notifications: PromotionalNotification[];
  addNotification: (notification: Omit<PromotionalNotification, 'id' | 'createdAt'>) => void;
  updateNotification: (id: string, updates: Partial<PromotionalNotification>) => void;
  duplicateNotification: (id: string) => void;
  markAsRead: (id: string, userId?: string) => void;
  markAllAsRead: (userId?: string) => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  getUnreadCount: (userId?: string) => number;
}

// Prepopulate initial promotional notifications
const INITIAL_NOTIFICATIONS: PromotionalNotification[] = [
  {
    id: 'notif-1',
    title: '🔥 50% OFF Premium Watches & Tech',
    message: 'Grab premium watches and accessories up to 50% OFF today.',
    description: 'Get extra 50% OFF on all premium watches, tech gadgets, and luxury collections. Limited time offer live now for all active customers!',
    type: 'flash_sale',
    targetAudience: 'all',
    couponCode: 'FLASH50',
    selectedCategoryIds: ['cat-watches', 'cat-accessories'],
    selectedProductIds: [],
    createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
    createdBy: 'Admin',
    publishedStatus: 'Published',
    readBy: [],
    isRead: false,
    priority: 'urgent',
    coverImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'notif-2',
    title: '👑 VIP EXCLUSIVE DISCOUNT VOUCHER',
    message: 'Special rewards for being our loyal customer.',
    description: 'Claim your exclusive VIP reward voucher code. Get flat cuts on any elite luxury collection hand-selected for our valued customers.',
    type: 'vip',
    targetAudience: 'all',
    couponCode: 'VIP15',
    createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
    createdBy: 'Admin',
    publishedStatus: 'Published',
    readBy: [],
    isRead: false,
    priority: 'offer',
  },
  {
    id: 'notif-3',
    title: '🚚 NATIONWIDE FREE SHIPPING ACTIVE',
    message: 'Zero shipping fees on all orders nationwide for 24 hrs.',
    description: 'Order any product, any size across the country with zero delivery fees automatically applied at checkout.',
    type: 'free_shipping',
    targetAudience: 'all',
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    createdBy: 'Admin',
    publishedStatus: 'Published',
    readBy: [],
    isRead: true,
    priority: 'important',
  }
];

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: INITIAL_NOTIFICATIONS,

      addNotification: (notif) => {
        const newNotif: PromotionalNotification = {
          ...notif,
          id: `notif-${Date.now()}`,
          createdAt: new Date().toISOString(),
          createdBy: notif.createdBy || 'Admin',
          publishedStatus: notif.publishedStatus || 'Published',
          readBy: [],
          isRead: false,
          type: notif.type || 'custom',
          targetAudience: notif.targetAudience || 'all',
          priority: notif.priority || 'normal',
          totalSent: notif.totalSent || 1250,
          totalOpened: notif.totalOpened || 0,
          totalClicked: notif.totalClicked || 0,
        };
        const nextList = [newNotif, ...get().notifications];
        set({ notifications: nextList });
        broadcastSync.publish('notifications', nextList);
      },

      updateNotification: (id, updates) => {
        const nextList = get().notifications.map((n) =>
          n.id === id ? { ...n, ...updates } : n
        );
        set({ notifications: nextList });
        broadcastSync.publish('notifications', nextList);
      },

      duplicateNotification: (id) => {
        const found = get().notifications.find((n) => n.id === id);
        if (!found) return;
        const dup: PromotionalNotification = {
          ...found,
          id: `notif-${Date.now()}`,
          title: `${found.title} (Copy)`,
          createdAt: new Date().toISOString(),
          publishedStatus: 'Draft',
          totalOpened: 0,
          totalClicked: 0,
          readBy: [],
          isRead: false,
        };
        const nextList = [dup, ...get().notifications];
        set({ notifications: nextList });
        broadcastSync.publish('notifications', nextList);
      },

      markAsRead: (id, userId = 'guest') => {
        const nextList = get().notifications.map((n) => {
          if (n.id !== id) return n;
          const currentReadBy = n.readBy || [];
          if (!currentReadBy.includes(userId)) {
            return {
              ...n,
              isRead: true,
              readBy: [...currentReadBy, userId],
            };
          }
          return { ...n, isRead: true };
        });
        set({ notifications: nextList });
        broadcastSync.publish('notifications', nextList);
      },

      markAllAsRead: (userId = 'guest') => {
        const nextList = get().notifications.map((n) => {
          const currentReadBy = n.readBy || [];
          const updatedReadBy = currentReadBy.includes(userId) ? currentReadBy : [...currentReadBy, userId];
          return {
            ...n,
            isRead: true,
            readBy: updatedReadBy,
          };
        });
        set({ notifications: nextList });
        broadcastSync.publish('notifications', nextList);
      },

      deleteNotification: (id) => {
        const nextList = get().notifications.filter((n) => n.id !== id);
        set({ notifications: nextList });
        broadcastSync.publish('notifications', nextList);
      },

      clearAll: () => {
        set({ notifications: [] });
        broadcastSync.publish('notifications', []);
      },

      getUnreadCount: (userId = 'guest') => {
        return get().notifications.filter((n) => {
          if (n.publishedStatus === 'Draft') return false;
          if (n.readBy && n.readBy.includes(userId)) return false;
          return !n.isRead;
        }).length;
      },
    }),
    {
      name: 'tazu-promotional-notifications',
    }
  )
);

