import { create } from 'zustand';
// Removed demo generators to enforce single DB rule
import { getSupabase } from '../lib/supabase';
import { objectToSnake, objectToCamel } from '../lib/supabaseUtils';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  variant: string;
  image?: string;
  variantDetails?: {
    size?: string;
    color?: string;
    storage?: string;
    weight?: string;
  };
}

export interface Order {
  id: string;
  orderId: string;
  billId: string;
  productLink: string;
  customerName: string;
  mobileNumber: string;
  email?: string;
  fullAddress: string;
  cityArea?: string;
  postalCode?: string;
  deliveryMode: 'Express Delivery' | 'Standard Delivery';
  paymentMethod: string;
  status: 'Placed' | 'Confirmed' | 'Processing' | 'Shipping' | 'Delivered' | 'Cancelled' | 'Pending' | 'Packaging' | 'Returned';
  statusHistory: { status: string; timestamp: number; updatedBy?: string }[];
  status_updated_at: number;
  edited_by_admin?: string;
  last_edit_time?: number;
  customerImage?: string;
  paymentStatus: 'Paid' | 'Partial' | 'Unpaid' | 'Cash on Delivery';
  type: 'Online' | 'Offline';
  items: OrderItem[];
  subtotal: number;
  discount: { type: 'percent' | 'fixed'; value: number; amount: number };
  tax: { percent: number; amount: number };
  deliveryCharge: number;
  paidAmount: number;
  dueAmount: number;
  total: number;
  date: number;
  notes?: string;
  isRead?: boolean;
  isDemo?: boolean;
  promoCodeUsed?: string;
  courier?: {
    name: string;
    trackingId?: string;
    status?: string;
  };
  utmParams?: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_term?: string;
    referrer?: string;
    landingPage?: string;
    firstTouch?: string;
    lastTouch?: string;
  };
}

interface OrderState {
  orders: Order[];
  trackingStatuses: string[];
  addOrder: (order: Omit<Order, 'id' | 'orderId' | 'billId' | 'productLink' | 'date' | 'statusHistory' | 'status_updated_at'>) => Order;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  updatePaymentStatus: (id: string, paymentStatus: Order['paymentStatus']) => void;
  deleteOrder: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearDemoData: () => void;
  subscribeOrders: () => () => void;
  subscribeTrackingStatuses: () => () => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  trackingStatuses: [
    'Placed', 'Pending', 'Processing', 'Confirmed', 'Packaging', 'Shipping', 'Delivered', 'Cancelled', 'Returned'
  ],
  addOrder: (orderPayload) => {
    const nextOrderNum = Math.floor(100000 + Math.random() * 900000);
    const nextBillNum = Math.floor(100000 + Math.random() * 900000);
    const orderId = `ORD-${nextOrderNum}`;
    const now = Date.now();
    const id = Math.random().toString(36).substring(2, 9);
    
    const newOrder: Order = {
      ...orderPayload,
      id,
      orderId,
      billId: `BILL-${nextBillNum}`,
      productLink: `https://luxemart.bd/order/${orderId}`,
      date: now,
      status_updated_at: now,
      statusHistory: [{ status: orderPayload.status, timestamp: now, updatedBy: 'Admin' }],
      isRead: false,
    };

    const supabase = getSupabase();
    if (supabase) {
      const dbPayload = objectToSnake(newOrder);
      supabase.from('orders').insert([dbPayload]).then(({error}) => error && console.warn(error));
    }

    set((state) => ({ orders: [newOrder, ...state.orders] }));
    return newOrder;
  },
  updateOrder: (id, updates) => {
    const existingOrder = get().orders.find(o => o.id === id);
    if (!existingOrder) return;

    const merged: Order = {
      ...existingOrder,
      ...updates,
      last_edit_time: Date.now(),
      edited_by_admin: 'Admin'
    };

    const supabase = getSupabase();
    if (supabase) {
      const dbPayload = objectToSnake(updates);
      supabase.from('orders').update(dbPayload).eq('id', id).then(({error}) => error && console.warn(error));
    }

    set((state) => ({
      orders: state.orders.map(o => o.id === id ? merged : o)
    }));
  },
  updateOrderStatus: (id, status) => {
    const existingOrder = get().orders.find(o => o.id === id);
    if (!existingOrder) return;

    const now = Date.now();
    const merged: Order = {
      ...existingOrder,
      status,
      status_updated_at: now,
      statusHistory: [...(existingOrder.statusHistory || []), { status, timestamp: now, updatedBy: 'Admin' }]
    };

    const supabase = getSupabase();
    if (supabase) {
        const dbPayload = objectToSnake({
            status,
            status_updated_at: merged.status_updated_at,
            statusHistory: merged.statusHistory
        });
        supabase.from('orders').update(dbPayload).eq('id', id).then(({error}) => error && console.warn(error));
    }

    set((state) => ({
      orders: state.orders.map(o => o.id === id ? merged : o)
    }));
  },
  updatePaymentStatus: (id, paymentStatus) => {
    const existingOrder = get().orders.find(o => o.id === id);
    if (!existingOrder) return;

    const merged: Order = {
      ...existingOrder,
      paymentStatus
    };

    const supabase = getSupabase();
    if (supabase) {
        const dbPayload = objectToSnake({ paymentStatus });
        supabase.from('orders').update(dbPayload).eq('id', id).then(({error}) => error && console.warn(error));
    }

    set((state) => ({
      orders: state.orders.map(o => o.id === id ? merged : o)
    }));
  },
  deleteOrder: (id) => {
    const supabase = getSupabase();
    if (supabase) supabase.from('orders').delete().eq('id', id).then(({error}) => error && console.warn(error));

    set((state) => ({
      orders: state.orders.filter(o => o.id !== id)
    }));
  },
  markAsRead: (id) => {
    const existingOrder = get().orders.find(o => o.id === id);
    if (!existingOrder) return;

    const merged = { ...existingOrder, isRead: true };

    const supabase = getSupabase();
    if (supabase) supabase.from('orders').update({ isRead: true }).eq('id', id).then(({error}) => error && console.warn(error));

    set((state) => ({
      orders: state.orders.map(o => o.id === id ? merged : o)
    }));
  },
  markAllAsRead: () => {
    const supabase = getSupabase();
    if (supabase) {
        get().orders.forEach(o => {
          if (!o.isRead) {
            supabase.from('orders').update({ isRead: true }).eq('id', o.id).then(({error}) => error && console.warn(error));
          }
        });
    }

    set((state) => ({
      orders: state.orders.map(o => ({ ...o, isRead: true }))
    }));
  },
  clearDemoData: () => set((state) => ({
    orders: state.orders.filter(o => !o.isDemo)
  })),
  subscribeOrders: () => {
    const supabase = getSupabase();
    if (!supabase) return () => {};

    const loadOrders = async () => {
        const { data, error } = await supabase.from('orders').select('*').order('date', { ascending: false });
        if (!error && data) {
            set({ orders: (data as any[]).map(row => objectToCamel(row)) as Order[] });
        } else {
            if (error && error.code !== '42P01') {
                console.error('Error fetching orders:', error);
            }
            set({ orders: [] });
        }
    };
    
    loadOrders();
    
    const channel = supabase
      .channel('public:orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
          loadOrders();
      })
      .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
  },
  subscribeTrackingStatuses: () => {
    const supabase = getSupabase();
    if (!supabase) return () => {};

    const loadStatuses = async () => {
        const { data, error } = await supabase.from('tracking_statuses').select('*').order('order', { ascending: true });
        if (!error && data && data.length > 0) {
            set({ trackingStatuses: data.map(d => objectToCamel(d).name) });
        } else {
            const defaultList = [
              'Placed', 'Pending', 'Processing', 'Confirmed', 'Packaging', 'Shipping', 'Delivered', 'Cancelled', 'Returned'
            ];
            const toInsert = defaultList.map((name, idx) => ({ id: name.toLowerCase(), name, order: idx + 1 }));
            supabase.from('tracking_statuses').upsert(toInsert).then();
            set({ trackingStatuses: defaultList });
        }
    };
    loadStatuses();
    
    const channel = supabase
      .channel('public:tracking_statuses')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tracking_statuses' }, () => {
          loadStatuses();
      })
      .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
  },
}));
