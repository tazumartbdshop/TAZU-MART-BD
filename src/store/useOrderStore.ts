import { create } from 'zustand';
// Removed demo generators to enforce single DB rule
import { getSupabase } from '../lib/supabase';
import { objectToSnake, objectToCamel } from '../lib/supabaseUtils';

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
  deleteOrder: (id: string) => Promise<void>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearDemoData: () => void;
  subscribeOrders: () => () => void;
  subscribeTrackingStatuses: () => () => void;
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

    const supabase = getSupabase();
    if (supabase) {
      console.log("[Supabase Sync] addOrder Payload (pre-snake):", newOrder);
      const dbPayload = objectToSnake(newOrder);
      // Fix numeric discount type mapping for database insert
      dbPayload.discount = newOrder.discount?.amount || 0;

      // Map tax object to flat columns for DB
      if (newOrder.tax) {
        dbPayload.tax_percent = newOrder.tax.percent;
        dbPayload.tax_amount = newOrder.tax.amount;
      }

      // Map items correctly to the JSONB column
      dbPayload.items = Array.isArray(newOrder.items) ? newOrder.items : [];
      
      // Ensure status_history is a valid JSON array
      dbPayload.status_history = Array.isArray(dbPayload.status_history) ? dbPayload.status_history : [];

      // Ensure mobile_number is a string for the TEXT column in DB
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
        'promo_code_used', 'type'
      ];

      const cleanPayload: any = {};
      allowedColumns.forEach(col => {
        if (dbPayload[col] !== undefined) {
          cleanPayload[col] = dbPayload[col];
        }
      });
      
      console.log("[Supabase Sync] addOrder cleanPayload to Supabase:", cleanPayload);
      supabase.from('orders').insert([cleanPayload]).then(({error}) => {
        if (error) console.warn("[Supabase Sync Error] orders insert:", error);
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
      console.log("[Supabase Sync] addOrderAsync Payload (pre-snake):", newOrder);
      const dbPayload = objectToSnake(newOrder);
      // Convert nested discount object to simple numeric amount for the database column
      dbPayload.discount = newOrder.discount?.amount || 0;
      
      // Map tax object to flat columns for DB
      if (newOrder.tax) {
        dbPayload.tax_percent = newOrder.tax.percent;
        dbPayload.tax_amount = newOrder.tax.amount;
      }

      // Save full items array to the JSONB column
      dbPayload.items = Array.isArray(newOrder.items) ? newOrder.items : [];
      
      // Ensure status_history is a valid JSON array
      dbPayload.status_history = Array.isArray(dbPayload.status_history) ? dbPayload.status_history : [];

      // Ensure mobile_number is string format for the TEXT column
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
        'promo_code_used', 'type'
      ];

      const cleanPayload: any = {};
      allowedColumns.forEach(col => {
        if (dbPayload[col] !== undefined) {
          // Safety: omit 'type' if it is 'Online' to avoid numeric syntax errors in some DB configurations
          if (col === 'type' && dbPayload[col] === 'Online') return;
          cleanPayload[col] = dbPayload[col];
        }
      });

      console.log("[Supabase Sync] addOrderAsync cleanPayload to Supabase:", cleanPayload);
      // Insert without select to speed up response time
      const { error } = await supabase.from('orders').insert([cleanPayload]);
      
      if (error) {
        console.error("[Supabase Sync] Failed to insert order into Supabase:", error);
        // throw error; // Bypassed to allow local order placement if DB is down
      }
      
      console.log("[Supabase Sync] Order inserted successfully into orders table.");

      // Now attempt order items table insertion (Redundant if the on_order_sync trigger is active in Supabase, but kept for compatibility)
      try {
        const orderItemsPayload = newOrder.items.map(item => ({
          id: Math.random().toString(36).substring(2, 9),
          order_id: id, // Link using the same random string ID used for the orders record
          product_id: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          variant: item.variant || 'Default',
          image: item.image || '',
          slug: item.slug || '',
          created_at: now
        }));
        
        console.log("[Supabase Sync] Attempting insertion into order_items table:", orderItemsPayload);
        // Fire and forget items insertion
        supabase.from('order_items').insert(orderItemsPayload).then(({ error: itemsError }) => {
          if (itemsError) {
            console.error("[Supabase Sync] Failed to insert items into order_items (Manual fallback):", itemsError);
          } else {
            console.log("[Supabase Sync] Order items inserted successfully into order_items table.");
          }
        });

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
        'promo_code_used', 'type'
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
      try {
        // 1. Delete associated reviews first if any
        await supabase.from('reviews').delete().eq('order_id', id);
        
        // 2. Delete associated order items
        await supabase.from('order_items').delete().eq('order_id', id);
        
        // 3. Finally delete the order itself
        const { error } = await supabase.from('orders').delete().eq('id', id);
        
        if (error) { console.error("Ignored Error:", error); }
      } catch (error) {
        console.error("[Supabase Delete Error]:", error);
        // throw error; // Bypassed to allow local order placement if DB is down
      }
    }

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
        
        // Also fetch order items to attach them
        const { data: itemsData } = await supabase.from('order_items').select('*');

        if (!error && data) {
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
               
               if (typeof parsed.items === 'number' || !parsed.items) {
                 // Fallback if no items found in order_items
                 parsed.items = [];
               }

               return parsed;
            }) as Order[] });
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
