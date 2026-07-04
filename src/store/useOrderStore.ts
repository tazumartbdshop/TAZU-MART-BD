import { create } from 'zustand';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  variant: string;
  total: number;
  image?: string;
  variantDetails?: any;
}

export interface Order {
  id: string;
  order_id: string;
  orderId?: string; // mapping
  customer_name: string;
  customerName?: string; // mapping
  email?: string;
  phone: string;
  mobileNumber?: string; // mapping
  address: string;
  fullAddress?: string; // mapping
  cityArea?: string;
  subtotal: number;
  delivery_charge: number;
  deliveryCharge?: number; // mapping
  discount: { amount: number; code?: string } | any;
  tax?: { amount: number };
  total: number;
  amount?: number; // mapping
  payment_method: string;
  paymentMethod?: string; // mapping
  payment_status: string;
  paymentStatus?: string; // mapping
  order_status: string;
  status?: string; // mapping
  statusHistory?: any[];
  type?: string;
  date?: string; // mapping
  created_at: string;
  createdAt?: string; // mapping
  items: OrderItem[];
  notes?: string;
  isDemo?: boolean;
  isRead?: boolean;
  promoCodeUsed?: string;
  storeName?: string;
  postalCode?: string;
  deliveryMode?: string;
  paidAmount?: number;
  dueAmount?: number;
  utmParams?: any;
}

interface OrderState {
  orders: Order[];
  trackingStatuses: any[];
  isLoading: boolean;
  isLoaded: boolean;
  fetchUserOrders: (userId: number | string) => Promise<void>;
  fetchAllOrders: () => Promise<void>;
  addOrder: (order: any) => Promise<any>;
  addOrderAsync: (order: any) => Promise<any>;
  updateOrder: (id: string, updates: any) => Promise<void>;
  updateOrderStatus: (id: string, status: string) => Promise<void>;
  updatePaymentStatus: (id: string, status: string) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  subscribeOrders: (userId?: string | number) => () => void;
  subscribeTrackingStatuses: () => () => void;
  clearDemoData: () => void;
}

const mapOrder = (o: any): Order => ({
  ...o,
  id: String(o.id),
  orderId: o.order_id,
  customerName: o.customer_name,
  mobileNumber: o.phone,
  fullAddress: o.address,
  paymentMethod: o.payment_method,
  paymentStatus: o.payment_status,
  status: o.order_status,
  date: o.created_at,
  createdAt: o.created_at,
  amount: o.total,
  deliveryCharge: o.delivery_charge,
  discount: typeof o.discount === 'string' ? JSON.parse(o.discount) : (typeof o.discount === 'number' ? { amount: o.discount } : (o.discount || { amount: 0 })),
  items: typeof o.items === 'string' ? JSON.parse(o.items) : (o.items || [])
});

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  trackingStatuses: [],
  isLoading: false,
  isLoaded: false,

  fetchUserOrders: async (userId) => {
    set({ isLoading: true });
    try {
      const res = await fetch(`/api/user/orders?userId=${userId}`);
      const data = await res.json();
      set({ orders: data.map(mapOrder), isLoaded: true });
    } catch (err) {
      console.error("Failed to fetch user orders:", err);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchAllOrders: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/admin/orders');
      const data = await res.json();
      set({ orders: data.map(mapOrder), isLoaded: true });
    } catch (err) {
      console.error("Failed to fetch all orders:", err);
    } finally {
      set({ isLoading: false });
    }
  },

  addOrder: async (orderPayload) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Failed to place order:", err);
      throw err;
    }
  },

  addOrderAsync: async (orderPayload) => {
    return get().addOrder(orderPayload);
  },

  updateOrder: async (id, updates) => {
    try {
      const status = updates.order_status || updates.status;
      if (status) await get().updateOrderStatus(id, status);
    } catch (err) {
      console.error("Failed to update order:", err);
    }
  },

  updateOrderStatus: async (id, status) => {
    try {
      await fetch(`/api/admin/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      get().fetchAllOrders();
    } catch (err) {
      console.error("Failed to update order status:", err);
    }
  },

  updatePaymentStatus: async (id, status) => {
    try {
      await fetch(`/api/admin/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_status: status })
      });
      get().fetchAllOrders();
    } catch (err) {
      console.error("Failed to update payment status:", err);
    }
  },

  deleteOrder: async (id) => {
    try {
      await fetch(`/api/admin/orders/${id}`, { method: 'DELETE' });
      get().fetchAllOrders();
    } catch (err) {
      console.error("Failed to delete order:", err);
    }
  },

  markAsRead: async (id) => {
    set((state) => ({
      orders: state.orders.map(o => o.id === id ? { ...o, isRead: true } : o)
    }));
  },

  markAllAsRead: async () => {
    set((state) => ({
      orders: state.orders.map(o => ({ ...o, isRead: true }))
    }));
  },

  subscribeOrders: (userId) => {
    if (userId) {
      get().fetchUserOrders(userId);
    } else {
      get().fetchAllOrders();
    }
    return () => {};
  },

  subscribeTrackingStatuses: () => {
    return () => {};
  },

  clearDemoData: () => set({ orders: [] })
}));
