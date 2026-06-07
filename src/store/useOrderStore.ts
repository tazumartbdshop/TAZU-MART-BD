import { create } from 'zustand';
import { generateDemoOrders, generateDemoProducts, generateDemoCustomers } from '../utils/demoDataGenerator';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

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

// Generate matching data sets
const demoProducts = generateDemoProducts();
const demoCustomers = generateDemoCustomers();
const initialOrders: Order[] = generateDemoOrders(demoProducts, demoCustomers);

function cleanUndefined(obj: any): any {
  if (obj === null || obj === undefined) {
    return null;
  }
  if (Array.isArray(obj)) {
    return obj.map(cleanUndefined);
  }
  if (typeof obj === 'object') {
    const clean: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const val = obj[key];
        if (val !== undefined) {
          clean[key] = cleanUndefined(val);
        }
      }
    }
    return clean;
  }
  return obj;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: initialOrders,
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

    // Save to Firestore for real-time tracking across accounts
    setDoc(doc(db, 'orders', id), cleanUndefined(newOrder))
      .catch(err => handleFirestoreError(err, OperationType.WRITE, `orders/${id}`));

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

    setDoc(doc(db, 'orders', id), cleanUndefined(merged), { merge: true })
      .catch(err => handleFirestoreError(err, OperationType.WRITE, `orders/${id}`));

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

    setDoc(doc(db, 'orders', id), cleanUndefined(merged), { merge: true })
      .catch(err => handleFirestoreError(err, OperationType.WRITE, `orders/${id}`));

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

    setDoc(doc(db, 'orders', id), cleanUndefined(merged), { merge: true })
      .catch(err => handleFirestoreError(err, OperationType.WRITE, `orders/${id}`));

    set((state) => ({
      orders: state.orders.map(o => o.id === id ? merged : o)
    }));
  },
  deleteOrder: (id) => {
    deleteDoc(doc(db, 'orders', id))
      .catch(err => handleFirestoreError(err, OperationType.DELETE, `orders/${id}`));

    set((state) => ({
      orders: state.orders.filter(o => o.id !== id)
    }));
  },
  markAsRead: (id) => {
    const existingOrder = get().orders.find(o => o.id === id);
    if (!existingOrder) return;

    const merged = { ...existingOrder, isRead: true };

    setDoc(doc(db, 'orders', id), cleanUndefined(merged), { merge: true })
      .catch(err => handleFirestoreError(err, OperationType.WRITE, `orders/${id}`));

    set((state) => ({
      orders: state.orders.map(o => o.id === id ? merged : o)
    }));
  },
  markAllAsRead: () => {
    get().orders.forEach(o => {
      if (!o.isRead) {
        setDoc(doc(db, 'orders', o.id), { isRead: true }, { merge: true })
          .catch(err => handleFirestoreError(err, OperationType.WRITE, `orders/${o.id}`));
      }
    });

    set((state) => ({
      orders: state.orders.map(o => ({ ...o, isRead: true }))
    }));
  },
  clearDemoData: () => set((state) => ({
    orders: state.orders.filter(o => !o.isDemo)
  })),
  subscribeOrders: () => {
    const unsubscribe = onSnapshot(collection(db, 'orders'), (snapshot) => {
      const list: Order[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Order);
      });
      // Fallback cleanly to beautiful seed orders if DB is completely empty (guarantees stunning UI)
      if (list.length > 0) {
        list.sort((a, b) => b.date - a.date);
        set({ orders: list });
      } else {
        set({ orders: initialOrders });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'orders');
    });
    return unsubscribe;
  },
  subscribeTrackingStatuses: () => {
    const unsubscribe = onSnapshot(collection(db, 'tracking_statuses'), (snapshot) => {
      const list: { name: string; order: number }[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.name) {
          list.push({ 
            name: data.name, 
            order: typeof data.order === 'number' ? data.order : 99 
          });
        }
      });
      if (list.length > 0) {
        list.sort((a, b) => a.order - b.order);
        set({ trackingStatuses: list.map(item => item.name) });
      } else {
        // Seed database if empty
        const defaultList = [
          'Placed', 'Pending', 'Processing', 'Confirmed', 'Packaging', 'Shipping', 'Delivered', 'Cancelled', 'Returned'
        ];
        // Async background seeding
        defaultList.forEach((name, idx) => {
          const docId = name.toLowerCase();
          setDoc(doc(db, 'tracking_statuses', docId), { name, order: idx + 1 })
            .catch(err => console.error("Seeding tracking_status failed:", err));
        });
        set({ trackingStatuses: defaultList });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'tracking_statuses');
    });
    return unsubscribe;
  },
}));
