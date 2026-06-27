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
  status: 'Placed' | 'Confirmed' | 'Processing' | 'Shipping' | 'Delivered' | 'Cancelled' | 'Pending' | 'Packaging' | 'Returned' | 'Completed';
  statusHistory: { status: string; timestamp: string; updatedBy?: string }[];
  status_updated_at: string;
  edited_by_admin?: string;
  last_edit_time?: string;
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
  date: string;
  notes?: string;
  isRead?: boolean;
  isDemo?: boolean;
  promoCodeUsed?: string;
  storeName?: string;
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
  addOrderAsync: (order: Omit<Order, 'id' | 'orderId' | 'billId' | 'productLink' | 'date' | 'statusHistory' | 'status_updated_at'>) => Promise<Order>;
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

const initialOrders: Order[] = [
  {
    id: 'demo-1',
    orderId: 'ORD-1001',
    billId: 'BILL-101',
    productLink: 'https://luxemart.bd/order/ORD-1001',
    customerName: 'Demo User',
    mobileNumber: '01700000000',
    email: 'demo@example.com',
    fullAddress: 'Dhaka',
    total: 2490,
    subtotal: 2490,
    paidAmount: 2490,
    dueAmount: 0,
    deliveryCharge: 0,
    tax: { percent: 0, amount: 0 },
    discount: { type: 'fixed', value: 0, amount: 0 },
    status: 'Completed',
    statusHistory: [],
    type: 'Online',
    date: new Date().toISOString(),
    status_updated_at: new Date().toISOString(),
    paymentMethod: 'bKash',
    deliveryMode: 'Standard Delivery',
    items: [
      {
        productId: 'p-1',
        name: 'Premium Wireless Earbuds',
        price: 2490,
        quantity: 1,
        variant: 'Black • Bluetooth 5.3',
      }
    ],
    paymentStatus: 'Paid',
    storeName: 'Tazu Mart BD Official'
  },
  {
    id: 'demo-2',
    orderId: 'ORD-1002',
    billId: 'BILL-102',
    productLink: 'https://luxemart.bd/order/ORD-1002',
    customerName: 'Demo User',
    mobileNumber: '01700000000',
    email: 'demo@example.com',
    fullAddress: 'Dhaka',
    total: 1900,
    subtotal: 1900,
    paidAmount: 1900,
    dueAmount: 0,
    deliveryCharge: 0,
    tax: { percent: 0, amount: 0 },
    discount: { type: 'fixed', value: 0, amount: 0 },
    status: 'Shipping',
    statusHistory: [],
    type: 'Online',
    date: new Date().toISOString(),
    status_updated_at: new Date().toISOString(),
    paymentMethod: 'bKash',
    deliveryMode: 'Standard Delivery',
    items: [
      {
        productId: 'p-2',
        name: 'Men Premium Polo Shirt',
        price: 950,
        quantity: 2,
        variant: 'Black • XL',
      }
    ],
    paymentStatus: 'Paid',
    storeName: 'Tazu Fashion'
  },
  {
    id: 'demo-3',
    orderId: 'ORD-1003',
    billId: 'BILL-103',
    productLink: 'https://luxemart.bd/order/ORD-1003',
    customerName: 'Demo User',
    mobileNumber: '01700000000',
    email: 'demo@example.com',
    fullAddress: 'Dhaka',
    total: 650,
    subtotal: 650,
    paidAmount: 650,
    dueAmount: 0,
    deliveryCharge: 0,
    tax: { percent: 0, amount: 0 },
    discount: { type: 'fixed', value: 0, amount: 0 },
    status: 'Pending',
    statusHistory: [],
    type: 'Online',
    date: new Date().toISOString(),
    status_updated_at: new Date().toISOString(),
    paymentMethod: 'bKash',
    deliveryMode: 'Standard Delivery',
    items: [
      {
        productId: 'p-3',
        name: 'Fast Charging Adapter 33W',
        price: 650,
        quantity: 1,
        variant: 'White',
      }
    ],
    paymentStatus: 'Paid',
    storeName: 'Tazu Electronics'
  },
  {
    id: 'demo-4',
    orderId: 'ORD-1004',
    billId: 'BILL-104',
    productLink: 'https://luxemart.bd/order/ORD-1004',
    customerName: 'Demo User',
    mobileNumber: '01700000000',
    email: 'demo@example.com',
    fullAddress: 'Dhaka',
    total: 3200,
    subtotal: 3200,
    paidAmount: 0,
    dueAmount: 3200,
    deliveryCharge: 0,
    tax: { percent: 0, amount: 0 },
    discount: { type: 'fixed', value: 0, amount: 0 },
    status: 'Placed',
    statusHistory: [],
    type: 'Online',
    date: new Date().toISOString(),
    status_updated_at: new Date().toISOString(),
    paymentMethod: 'Cash on Delivery',
    deliveryMode: 'Standard Delivery',
    items: [
      {
        productId: 'p-4',
        name: 'Sports Smart Watch',
        price: 3200,
        quantity: 1,
        variant: 'Black',
      }
    ],
    paymentStatus: 'Unpaid',
    storeName: 'Tazu Lifestyle'
  },
  {
    id: 'demo-5',
    orderId: 'ORD-1005',
    billId: 'BILL-105',
    productLink: 'https://luxemart.bd/order/ORD-1005',
    customerName: 'Demo User',
    mobileNumber: '01700000000',
    email: 'demo@example.com',
    fullAddress: 'Dhaka',
    total: 750,
    subtotal: 750,
    paidAmount: 750,
    dueAmount: 0,
    deliveryCharge: 0,
    tax: { percent: 0, amount: 0 },
    discount: { type: 'fixed', value: 0, amount: 0 },
    status: 'Completed',
    statusHistory: [],
    type: 'Online',
    date: new Date().toISOString(),
    status_updated_at: new Date().toISOString(),
    paymentMethod: 'bKash',
    deliveryMode: 'Standard Delivery',
    items: [
      {
        productId: 'p-5',
        name: 'USB Type-C Cable',
        price: 250,
        quantity: 3,
        variant: '1 Meter',
      }
    ],
    paymentStatus: 'Paid',
    storeName: 'Tazu Mart BD'
  }
];

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: initialOrders,
  trackingStatuses: [
    'Placed', 'Pending', 'Processing', 'Confirmed', 'Packaging', 'Shipping', 'Delivered', 'Cancelled', 'Returned'
  ],
  addOrder: (orderPayload) => {
    const nextOrderNum = Math.floor(10000000 + Math.random() * 90000000); // 8-digit random number
    const nextBillNum = Math.floor(100000 + Math.random() * 900000);
    const orderId = `TMB-${nextOrderNum}`;
    const now = new Date().toISOString();
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
      // Fix numeric discount type mapping for database insert
      dbPayload.discount = newOrder.discount?.amount || 0;
      
      supabase.from('orders').insert([dbPayload]).then(({error}) => {
        if (error) console.warn("[Supabase Sync Error]", error);
      });

      // Update sold_count and stock for each item
      newOrder.items.forEach(async (item) => {
        try {
          const { data: prod, error: prodErr } = await supabase
            .from('products')
            .select('sold_count, stock')
            .eq('id', item.productId)
            .single();
          if (!prodErr && prod) {
            await supabase
              .from('products')
              .update({
                sold_count: Number(prod.sold_count || 0) + Number(item.quantity || 1),
                stock: Math.max(0, Number(prod.stock || 0) - Number(item.quantity || 1))
              })
              .eq('id', item.productId);
          }
        } catch (err) {
          console.error("Failed to update product stats in addOrder:", err);
        }
      });
    }

    set((state) => ({ orders: [newOrder, ...state.orders] }));
    return newOrder;
  },
  addOrderAsync: async (orderPayload) => {
    const nextOrderNum = Math.floor(10000000 + Math.random() * 90000000); // 8-digit random number
    const nextBillNum = Math.floor(100000 + Math.random() * 900000);
    const orderId = `TMB-${nextOrderNum}`;
    const now = new Date().toISOString();
    const id = Math.random().toString(36).substring(2, 9);
    
    const newOrder: Order = {
      ...orderPayload,
      id,
      orderId,
      billId: `BILL-${nextBillNum}`,
      productLink: `https://luxemart.bd/order/${orderId}`,
      date: now,
      status_updated_at: now,
      statusHistory: [{ status: orderPayload.status, timestamp: now, updatedBy: 'Customer' }],
      isRead: false,
    };

    const supabase = getSupabase();
    if (supabase) {
      const dbPayload = objectToSnake(newOrder);
      // Convert nested discount object to simple numeric amount for the database column
      dbPayload.discount = newOrder.discount?.amount || 0;

      console.log("[Supabase Sync] Attempting insertion into orders table:", dbPayload);
      const { data, error } = await supabase.from('orders').insert([dbPayload]).select();
      
      if (error) {
        console.error("[Supabase Sync] Failed to insert order into Supabase:", error);
        throw error;
      }
      
      console.log("[Supabase Sync] Order inserted successfully into orders table:", data);

      // Now attempt order items table insertion
      try {
        const orderItemsPayload = newOrder.items.map(item => ({
          id: Math.random().toString(36).substring(2, 9),
          order_id: orderId,
          product_id: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          variant: item.variant || 'Default',
          image: item.image || '',
          created_at: now
        }));
        
        console.log("[Supabase Sync] Attempting insertion into order_items table:", orderItemsPayload);
        const { error: itemsError } = await supabase.from('order_items').insert(orderItemsPayload);
        if (itemsError) {
          console.error("[Supabase Sync] Failed to insert items into order_items:", itemsError);
        } else {
          console.log("[Supabase Sync] Order items inserted successfully into order_items table.");
        }

        // Update sold_count and stock for each item in Supabase
        newOrder.items.forEach(async (item) => {
          try {
            const { data: prod, error: prodErr } = await supabase
              .from('products')
              .select('sold_count, stock')
              .eq('id', item.productId)
              .single();
            if (!prodErr && prod) {
              await supabase
                .from('products')
                .update({
                  sold_count: Number(prod.sold_count || 0) + Number(item.quantity || 1),
                  stock: Math.max(0, Number(prod.stock || 0) - Number(item.quantity || 1))
                })
                .eq('id', item.productId);
            }
          } catch (err) {
            console.error("Failed to update product stats in addOrderAsync:", err);
          }
        });
      } catch (itemErr) {
        console.error("[Supabase Sync] Exception saving products to order_items:", itemErr);
      }
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
      last_edit_time: new Date().toISOString(),
      edited_by_admin: 'Admin'
    };

    const supabase = getSupabase();
    if (supabase) {
      const dbPayload = objectToSnake({
        ...updates,
        last_edit_time: merged.last_edit_time,
        edited_by_admin: merged.edited_by_admin
      });
      supabase.from('orders').update(dbPayload).eq('id', id).then(({error}) => error && console.warn(error));
    }

    set((state) => ({
      orders: state.orders.map(o => o.id === id ? merged : o)
    }));
  },
  updateOrderStatus: (id, status) => {
    const existingOrder = get().orders.find(o => o.id === id);
    if (!existingOrder) return;

    const now = new Date().toISOString();
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
