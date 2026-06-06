import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PromotionalNotification {
  id: string;
  title: string;
  message: string;
  description: string;
  bannerImage?: string;
  type: 'flash_sale' | 'discount' | 'coupon' | 'launch' | 'delivery' | 'order' | 'stock' | 'festival' | 'free_shipping' | 'vip' | 'custom';
  targetAudience: 'all' | 'verified' | 'vip' | 'new' | 'specific' | 'purchase_count';
  couponCode?: string;
  redirectLink?: string;
  scheduledTime?: string;
  expiryDate?: string;
  createdAt: string;
  isRead: boolean;
  priority: 'urgent' | 'important' | 'offer' | 'normal';
}

interface NotificationStore {
  notifications: PromotionalNotification[];
  addNotification: (notification: Omit<PromotionalNotification, 'id' | 'createdAt' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
}

// Prepopulate structure with custom marketing notifications to show a stunning initial state!
const INITIAL_NOTIFICATIONS: PromotionalNotification[] = [
  {
    id: 'notif-1',
    title: '⚡ MEGA FLASH SALE IS LIVE!',
    message: 'Grab premium accessories up to 60% OFF before stock runs empty today.',
    description: 'Get extra 60% OFF on all premium watches, tech gadgets, and limited leather wallets. The flash clock is ticking down—expires in exactly 4 hours!',
    type: 'flash_sale',
    targetAudience: 'all',
    couponCode: 'FLASH60',
    redirectLink: '/offers',
    createdAt: new Date(Date.now() - 30 * 60000).toISOString(), // 30 mins ago
    isRead: false,
    priority: 'urgent',
    bannerImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'notif-2',
    title: '👑 VERIFIED EXCLUSIVE VOUCHER',
    message: 'A special thank you for being a part of our loyalty circle.',
    description: 'Claim your verified reward tier bonus! Get flat cuts on any elite luxury collections. Hand-selected for VIP and regular accounts.',
    type: 'vip',
    targetAudience: 'verified',
    couponCode: 'LOYALTY15',
    redirectLink: '/offers',
    createdAt: new Date(Date.now() - 3 * 3600000).toISOString(), // 3 hours ago
    isRead: false,
    priority: 'offer',
  },
  {
    id: 'notif-3',
    title: '🚚 FREE SHIPPING CAMPAIGN',
    message: 'Zero shipping costs active nationwide for next 24 hours.',
    description: 'Order any size, any amount, anywhere in the country—shipping fee is automatic zero at checkout page. No coupons needed.',
    type: 'free_shipping',
    targetAudience: 'all',
    redirectLink: '/categories',
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(), // 1 day ago
    isRead: true,
    priority: 'important',
  }
];

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set) => ({
      notifications: INITIAL_NOTIFICATIONS,

      addNotification: (notif) => {
        const newNotif: PromotionalNotification = {
          ...notif,
          id: `notif-${Date.now()}`,
          createdAt: new Date().toISOString(),
          isRead: false,
        };
        set((state) => ({
          notifications: [newNotif, ...state.notifications],
        }));
      },

      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          ),
        }));
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        }));
      },

      deleteNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      },

      clearAll: () => {
        set({ notifications: [] });
      },
    }),
    {
      name: 'tazu-promotional-notifications',
    }
  )
);
