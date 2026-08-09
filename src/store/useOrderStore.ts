import { create } from 'zustand';
// Removed demo generators to enforce single DB rule
import { getSupabase } from '../lib/supabase';
import { objectToSnake, objectToCamel } from '../lib/supabaseUtils';
import toast from 'react-hot-toast';

export interface OrderItem {
  productId: string;
  slug?: string;
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

export interface Refund {
  id: string;
  orderId: string;
  reason: string;
  amount: number;
  status: 'Pending' | 'Approved' | 'Processing' | 'Completed' | 'Rejected';
  createdAt: string;
  updatedAt: string;
  images?: string[];
  adminNote?: string;
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
  status: 'Placed' | 'Pending Payment' | 'Confirmed' | 'Preparing' | 'Packed' | 'Shipping' | 'Delivered' | 'Completed' | 'Cancelled' | 'Returned' | 'Refund Requested' | 'Refund Approved' | 'Refunded';
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
  userId?: string;
  notes?: string;
  isRead?: boolean;
  isDemo?: boolean;
  promoCodeUsed?: string;
  storeName?: string;
  refundInfo?: Refund;
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
  deleteOrder: (id: string) => Promise<void>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearDemoData: () => void;
  clearAllOrders: () => Promise<void>;
  subscribeOrders: (userId?: string) => () => void;
  subscribeTrackingStatuses: () => () => void;
  requestRefund: (orderId: string, reason: string, images?: string[]) => Promise<void>;
  updateRefundStatus: (refundId: string, status: Refund['status'], adminNote?: string) => Promise<void>;
  cancelOrder: (orderId: string) => Promise<void>;
  confirmReceived: (orderId: string) => Promise<void>;
}

const initialOrders: Order[] = [];

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

    // Trigger backend API for server-role order insert
    fetch('/api/orders/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder)
    }).then(res => res.json()).then(data => {
      console.log("[useOrderStore] addOrder backend API result:", data);
    }).catch(err => {
      console.warn("[useOrderStore] addOrder backend API fallback to client insert:", err);
      const supabase = getSupabase();
      if (supabase) {
        const dbPayload = objectToSnake(newOrder);
        dbPayload.discount = newOrder.discount?.amount || 0;
        if (newOrder.tax) {
          dbPayload.tax_percent = newOrder.tax.percent;
          dbPayload.tax_amount = newOrder.tax.amount;
        }
        dbPayload.items = Array.isArray(newOrder.items) ? newOrder.items : [];
        dbPayload.status_history = Array.isArray(dbPayload.status_history) ? dbPayload.status_history : [];
        if (dbPayload.mobile_number) dbPayload.mobile_number = dbPayload.mobile_number.toString();

        const allowedColumns = [
          'id', 'order_id', 'bill_id', 'product_link', 'customer_name', 
          'mobile_number', 'full_address', 'landmark', 'city_area', 'devision', 
          'district', 'upazila', 'save_address', 'notes', 'delivery_mode', 
          'payment_method', 'status', 'order_status', 'status_history', 
          'status_updated_at', 'subtotal', 'discount', 'reword_coins', 
          'delivery_charge', 'tax', 'tax_percent', 'tax_amount', 'total', 
          'total_amount', 'payment_status', 'paid_amount', 'due_amount', 
          'is_read', 'items', 'date', 'created_at', 'promo_code_used', 'type'
        ];

        const cleanPayload: any = {};
        allowedColumns.forEach(col => {
          if (dbPayload[col] !== undefined) cleanPayload[col] = dbPayload[col];
        });

        supabase.from('orders').insert([cleanPayload]).then(({ error }) => {
          if (error) console.error("[Supabase Sync Error] orders insert:", error);
        });
      }
    });

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

    let apiSuccess = false;

    // 1. Try server API route first (uses Service Role to guarantee DB save bypasses RLS)
    try {
      const apiRes = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });
      if (apiRes.ok) {
        const resData = await apiRes.json();
        if (resData.status === 'success') {
          console.log("[Supabase Sync] Order inserted successfully via backend API!");
          apiSuccess = true;
        }
      }
    } catch (apiErr) {
      console.warn("[Supabase Sync] Backend API order creation failed, falling back to client-side Supabase insert:", apiErr);
    }

    // 2. Client-side Supabase insert fallback if backend API was not reached
    if (!apiSuccess) {
      const supabase = getSupabase();
      if (supabase) {
        console.log("[Supabase Sync] addOrderAsync Payload (pre-snake):", newOrder);
        const dbPayload = objectToSnake(newOrder);
        dbPayload.discount = newOrder.discount?.amount || 0;
        
        if (newOrder.tax) {
          dbPayload.tax_percent = newOrder.tax.percent;
          dbPayload.tax_amount = newOrder.tax.amount;
        }

        dbPayload.items = Array.isArray(newOrder.items) ? newOrder.items : [];
        dbPayload.status_history = Array.isArray(dbPayload.status_history) ? dbPayload.status_history : [];

        if (dbPayload.mobile_number) {
          dbPayload.mobile_number = dbPayload.mobile_number.toString();
        }

        const allowedColumns = [
          'id', 'order_id', 'bill_id', 'product_link', 'customer_name', 
          'mobile_number', 'full_address', 'landmark', 'city_area', 'devision', 
          'district', 'upazila', 'save_address', 'notes', 'delivery_mode', 
          'payment_method', 'status', 'order_status', 'status_history', 
          'status_updated_at', 'subtotal', 'discount', 'reword_coins', 
          'delivery_charge', 'tax', 'tax_percent', 'tax_amount', 'total', 
          'total_amount', 'payment_status', 'paid_amount', 'due_amount', 
          'is_read', 'items', 'date', 'created_at', 'promo_code_used', 'type'
        ];

        const cleanPayload: any = {};
        allowedColumns.forEach(col => {
          if (dbPayload[col] !== undefined) {
            cleanPayload[col] = dbPayload[col];
          }
        });

        console.log("[Supabase Sync] addOrderAsync cleanPayload to Supabase:", cleanPayload);
        const { error } = await supabase.from('orders').insert([cleanPayload]);
        
        if (error) {
          console.error("[Supabase Sync] Failed to insert order into Supabase:", error);
        } else {
          console.log("[Supabase Sync] Order inserted successfully into orders table via client.");
        }

        // Order items table insertion
        try {
          const orderItemsPayload = newOrder.items.map(item => ({
            id: Math.random().toString(36).substring(2, 9),
            order_id: id,
            product_id: item.productId,
            product_name: item.name,
            product_price: item.price,
            quantity: item.quantity,
            product_image: item.image || '',
            created_at: now
          }));
          
          supabase.from('order_items').insert(orderItemsPayload).then(({ error: itemsError }) => {
            if (itemsError) {
              console.warn("[Supabase Sync] order_items insert warning:", itemsError.message);
            } else {
              console.log("[Supabase Sync] Order items inserted successfully into order_items table.");
            }
          });
        } catch (itemErr) {
          console.error("[Supabase Sync] Exception saving products to order_items:", itemErr);
        }
      }
    }

    // Update product sold_count and stock in Supabase
    const supabaseClient = getSupabase();
    if (supabaseClient) {
      newOrder.items.forEach(async (item) => {
        try {
          const { data: prod, error: prodErr } = await supabaseClient
            .from('products')
            .select('sold_count, stock')
            .eq('id', item.productId)
            .single();
          if (!prodErr && prod) {
            await supabaseClient
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
      console.log("[Supabase Sync] updateOrder Updates:", updates);
      const dbPayload = objectToSnake(updates);
      
      // Update metadata fields
      dbPayload.last_edit_time = merged.last_edit_time;
      dbPayload.edited_by_admin = merged.edited_by_admin;
      
      if (dbPayload.discount && typeof dbPayload.discount === 'object') {
        dbPayload.discount = dbPayload.discount.amount || 0;
      }
      
      if ('items' in dbPayload && Array.isArray(dbPayload.items)) {
        // Map items to the cleanPayload correctly
      }

      if (updates.tax) {
        dbPayload.tax_percent = updates.tax.percent;
        dbPayload.tax_amount = updates.tax.amount;
      }
      
      if (dbPayload.mobile_number) {
        dbPayload.mobile_number = dbPayload.mobile_number.toString();
      }

      // Filter payload to only include columns that exist in the database schema
      const allowedColumns = [
        'id', 'order_id', 'bill_id', 'product_link', 'customer_name', 
        'mobile_number', 'email', 'full_address', 'city_area', 'postal_code', 
        'delivery_mode', 'payment_method', 'status', 'status_history', 
        'status_updated_at', 'edited_by_admin', 'last_edit_time', 
        'customer_image', 'subtotal', 'delivery_charge', 'discount', 
        'total', 'payment_status', 'is_read', 'items', 'date', 'utm_params',
        'notes', 'tax_percent', 'tax_amount', 'paid_amount', 'due_amount', 
        'promo_code_used', 'type', 'user_id'
      ];

      const cleanPayload: any = {};
      allowedColumns.forEach(col => {
        if (dbPayload[col] !== undefined) {
          cleanPayload[col] = dbPayload[col];
        }
      });
      
      console.log("[Supabase Sync] updateOrder cleanPayload to Supabase:", cleanPayload);
      supabase.from('orders').update(cleanPayload).eq('id', id).then(({error}) => {
        if (error) console.warn("[Supabase Sync Error] order update:", error);
      });
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
  deleteOrder: async (id) => {
    const supabase = getSupabase();
    if (supabase) {
      // 1. Delete associated reviews first if any
      const { error: revErr } = await supabase.from('reviews').delete().eq('order_id', id);
      if (revErr) throw revErr;
        
      // 2. Delete associated order items
      const { error: itemErr } = await supabase.from('order_items').delete().eq('order_id', id);
      if (itemErr) throw itemErr;
        
      // 3. Finally delete the order itself
      const { error } = await supabase.from('orders').delete().eq('id', id);
      if (error) throw error;
    }

    set((state) => ({
      orders: state.orders.filter(o => o.id !== id)
    }));
  },
  clearAllOrders: async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    
    const { data: orders, error: fetchErr } = await supabase.from('orders').select('id');
    if (fetchErr) throw fetchErr;
    
    if (orders && orders.length > 0) {
      const ids = orders.map(o => o.id);
      
      // Delete reviews linked to these orders
      await supabase.from('reviews').delete().in('order_id', ids);
      
      // Delete order_items
      await supabase.from('order_items').delete().in('order_id', ids);
      
      // Delete orders
      await supabase.from('orders').delete().in('id', ids);
    }
    
    set({ orders: [] });
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
  subscribeOrders: (userId?: string) => {
    const supabase = getSupabase();
    if (!supabase) return () => {};
    console.log("[Supabase Sync] Subscribing to orders. Filter userId:", userId);

    const loadOrders = async () => {
        let query = supabase.from('orders').select('*');
        
        if (userId) {
          query = query.eq('user_id', userId);
        }

        const { data, error } = await query.order('date', { ascending: false });
        
        if (error) {
            if (error.code !== '42P01') console.error('Error fetching orders:', error);
            set({ orders: [] });
            return;
        }

        if (!data || data.length === 0) {
            set({ orders: [] });
            return;
        }

        const orderIds = data.map(o => o.id);
        const orderIdStrings = data.map(o => o.order_id);
        
        // Fetch order items only for the orders we just retrieved
        const { data: itemsData } = await supabase
            .from('order_items')
            .select('*')
            .or(`order_id.in.(${orderIds.join(',')}),order_id.in.(${orderIdStrings.join(',')})`);

        set({ orders: (data as any[]).map(row => {
               const parsed = objectToCamel(row);
               if (Array.isArray(parsed.customerName)) {
                 parsed.customerName = parsed.customerName[0] || '';
               }
               if (typeof parsed.mobileNumber === 'number') {
                 parsed.mobileNumber = '0' + parsed.mobileNumber.toString();
               }
               
               // Parse statusHistory back to array
               if (typeof parsed.statusHistory === 'string') {
                 try {
                   parsed.statusHistory = JSON.parse(parsed.statusHistory);
                 } catch(e) {
                   parsed.statusHistory = [];
                 }
               }

               // Attach actual items from order_items table
               if (itemsData) {
                 const orderItems = itemsData.filter(item => item.order_id === parsed.orderId || item.order_id === parsed.id);
                 if (orderItems.length > 0) {
                   parsed.items = orderItems.map(item => ({
                     productId: item.product_id || item.productId,
                     name: item.name || item.product_name || 'Unknown',
                     price: item.price || item.product_price || 0,
                     quantity: item.quantity || 1,
                     image: item.image || item.product_image || '',
                     variant: item.variant || 'Default',
                     slug: item.slug || item.productId
                   }));
                 }
               }
               
               if (typeof parsed.items === 'number' || !parsed.items || !Array.isArray(parsed.items) || parsed.items.length === 0) {
                 // Fallback if no items found in order_items: parse from row.items
                 if (row.items) {
                   if (typeof row.items === 'string') {
                     try { parsed.items = JSON.parse(row.items); } catch(e) { parsed.items = []; }
                   } else if (Array.isArray(row.items)) {
                     parsed.items = row.items;
                   }
                 } else {
                   parsed.items = [];
                 }
               }

               return parsed;
            }) as Order[] });
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
  requestRefund: async (orderId, reason, images = []) => {
    const supabase = getSupabase();
    if (!supabase) return;

    const order = get().orders.find(o => o.id === orderId || o.orderId === orderId);
    if (!order) throw new Error('Order not found');

    const refundId = Math.random().toString(36).substring(2, 9);
    const now = new Date().toISOString();

    const refund: Refund = {
      id: refundId,
      orderId: order.id,
      reason,
      amount: order.total,
      status: 'Pending',
      createdAt: now,
      updatedAt: now,
      images
    };

    const { error } = await supabase.from('refunds').insert([objectToSnake(refund)]);
    if (error) throw error;

    // Update order status to Refund Requested
    get().updateOrderStatus(order.id, 'Refund Requested');
    
    // Create notification
    const notificationId = Math.random().toString(36).substring(2, 9);
    await supabase.from('notifications').insert([{
      id: notificationId,
      user_id: order.userId || 'admin',
      title: 'Refund Requested',
      message: `A refund has been requested for Order #${order.orderId}`,
      type: 'refund',
      created_at: now
    }]);
  },
  updateRefundStatus: async (refundId, status, adminNote) => {
    const supabase = getSupabase();
    if (!supabase) return;

    const now = new Date().toISOString();
    const { data: refundData, error: fetchErr } = await supabase.from('refunds').select('*').eq('id', refundId).single();
    if (fetchErr || !refundData) throw new Error('Refund not found');

    const updates: any = { status, updated_at: now };
    if (adminNote) updates.admin_note = adminNote;

    const { error } = await supabase.from('refunds').update(updates).eq('id', refundId);
    if (error) throw error;

    // If approved or completed, update order status
    if (status === 'Approved' || status === 'Completed') {
      const orderStatus = status === 'Completed' ? 'Refunded' : 'Refund Requested';
      get().updateOrderStatus(refundData.order_id, orderStatus);
    }

    // Notify user
    const { data: orderData } = await supabase.from('orders').select('user_id, order_id').eq('id', refundData.order_id).single();
    if (orderData?.user_id) {
      await supabase.from('notifications').insert([{
        id: Math.random().toString(36).substring(2, 9),
        user_id: orderData.user_id,
        title: `Refund ${status}`,
        message: `Your refund request for Order #${orderData.order_id} has been ${status.toLowerCase()}.`,
        type: 'refund',
        created_at: now
      }]);
    }
  },
  cancelOrder: async (orderId) => {
    try {
      await get().updateOrderStatus(orderId, 'Cancelled');
      toast.success('Order cancelled successfully');
    } catch (err) {
      toast.error('Failed to cancel order');
    }
  },
  confirmReceived: async (orderId) => {
    try {
      await get().updateOrderStatus(orderId, 'Completed');
      toast.success('Order confirmed as received');
    } catch (err) {
      toast.error('Failed to confirm delivery');
    }
  }
}));
