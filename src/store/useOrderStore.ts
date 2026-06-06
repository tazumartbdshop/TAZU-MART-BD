import { create } from 'zustand';
import { generateDemoOrders, generateDemoProducts, generateDemoCustomers } from '../utils/demoDataGenerator';

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
  addOrder: (order: Omit<Order, 'id' | 'orderId' | 'billId' | 'productLink' | 'date' | 'statusHistory' | 'status_updated_at'>) => Order;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  updatePaymentStatus: (id: string, paymentStatus: Order['paymentStatus']) => void;
  deleteOrder: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearDemoData: () => void;
}

// Generate matching data sets
const demoProducts = generateDemoProducts();
const demoCustomers = generateDemoCustomers();
const initialOrders: Order[] = generateDemoOrders(demoProducts, demoCustomers);

export const useOrderStore = create<OrderState>((set) => ({
  orders: initialOrders,
  addOrder: (orderPayload) => {
    const nextOrderNum = Math.floor(100000 + Math.random() * 900000);
    const nextBillNum = Math.floor(100000 + Math.random() * 900000);
    const orderId = `ORD-${nextOrderNum}`;
    const now = Date.now();
    
    const newOrder: Order = {
      ...orderPayload,
      id: Math.random().toString(36).substring(2, 9),
      orderId,
      billId: `BILL-${nextBillNum}`,
      productLink: `https://luxemart.bd/order/${orderId}`,
      date: now,
      status_updated_at: now,
      statusHistory: [{ status: orderPayload.status, timestamp: now, updatedBy: 'Admin' }],
      isRead: false,
    };
    set((state) => ({ orders: [newOrder, ...state.orders] }));
    return newOrder;
  },
  updateOrder: (id, updates) => set((state) => ({
    orders: state.orders.map(o => o.id === id ? { 
      ...o, 
      ...updates, 
      last_edit_time: Date.now(), 
      edited_by_admin: 'Admin' 
    } : o)
  })),
  updateOrderStatus: (id, status) => set((state) => {
    const now = Date.now();
    return {
      orders: state.orders.map(o => o.id === id ? { 
        ...o, 
        status,
        status_updated_at: now,
        statusHistory: [...o.statusHistory, { status, timestamp: now, updatedBy: 'Admin' }]
      } : o)
    };
  }),
  updatePaymentStatus: (id, paymentStatus) => set((state) => ({
    orders: state.orders.map(o => o.id === id ? {
      ...o,
      paymentStatus
    } : o)
  })),
  deleteOrder: (id) => set((state) => ({
    orders: state.orders.filter(o => o.id !== id)
  })),
  markAsRead: (id) => set((state) => ({
    orders: state.orders.map(o => o.id === id ? { ...o, isRead: true } : o)
  })),
  markAllAsRead: () => set((state) => ({
    orders: state.orders.map(o => ({ ...o, isRead: true }))
  })),
  clearDemoData: () => set((state) => ({
    orders: state.orders.filter(o => !o.isDemo)
  })),
}));
