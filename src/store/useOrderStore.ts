import { create } from 'zustand';

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
  paymentMethod: 'bKash' | 'Nagad' | 'Rocket' | 'Card';
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
  courier?: {
    name: string;
    trackingId?: string;
    status?: string;
  };
}

interface OrderState {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'orderId' | 'billId' | 'productLink' | 'date' | 'statusHistory' | 'status_updated_at'>) => Order;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  updatePaymentStatus: (id: string, paymentStatus: Order['paymentStatus']) => void;
  deleteOrder: (id: string) => void;
}

const initialOrders: Order[] = [
  {
    id: '1',
    orderId: 'ORD-684521',
    billId: 'BILL-195666',
    productLink: 'https://tazumart.bd/order/ORD-684521',
    customerName: 'Rahim Ahmed',
    mobileNumber: '01711111111',
    fullAddress: 'Dhaka, Bangladesh',
    deliveryMode: 'Standard Delivery',
    paymentMethod: 'bKash',
    status: 'Pending',
    statusHistory: [{ status: 'Pending', timestamp: 1779626400000 }], // 21 May 2026
    paymentStatus: 'Unpaid',
    type: 'Online',
    items: [
      { productId: 'p1', name: 'Premium Leather Shoes', price: 6280, quantity: 2, variant: 'Brown', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&auto=format&fit=crop&q=60' }
    ],
    subtotal: 12560,
    discount: { type: 'fixed', value: 0, amount: 0 },
    tax: { percent: 0, amount: 0 },
    deliveryCharge: 0,
    paidAmount: 0,
    dueAmount: 12560,
    total: 12560,
    date: 1779626400000,
    status_updated_at: 1779626400000,
  },
  {
    id: '2',
    orderId: 'ORD-548785',
    billId: 'BILL-295666',
    productLink: 'https://tazumart.bd/order/ORD-548785',
    customerName: 'Karim Hasan',
    mobileNumber: '01711111112',
    email: 'karim@gmail.com',
    fullAddress: 'Chattogram, Bangladesh',
    deliveryMode: 'Standard Delivery',
    paymentMethod: 'Nagad',
    status: 'Confirmed',
    statusHistory: [{ status: 'Confirmed', timestamp: 1779540000000 }], 
    paymentStatus: 'Paid',
    type: 'Online',
    items: [
      { productId: 'p2', name: 'Smart Fitness Band', price: 4200, quantity: 2, variant: 'Black', image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&auto=format&fit=crop&q=60' }
    ],
    subtotal: 8400,
    discount: { type: 'fixed', value: 0, amount: 0 },
    tax: { percent: 0, amount: 0 },
    deliveryCharge: 0,
    paidAmount: 8400,
    dueAmount: 0,
    total: 8400,
    date: 1779540000000,
    status_updated_at: 1779540000000,
  },
  {
    id: '3',
    orderId: 'ORD-987654',
    billId: 'BILL-395666',
    productLink: 'https://tazumart.bd/order/ORD-987654',
    customerName: 'Sadia Islam',
    mobileNumber: '01711111113',
    fullAddress: 'Sylhet, Bangladesh',
    deliveryMode: 'Standard Delivery',
    paymentMethod: 'Card',
    status: 'Pending',
    statusHistory: [{ status: 'Pending', timestamp: 1779453600000 }], 
    paymentStatus: 'Unpaid',
    type: 'Online',
    items: [
      { productId: 'p3', name: 'Bluetooth Earbuds', price: 2950, quantity: 1, variant: 'White', image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&auto=format&fit=crop&q=60' }
    ],
    subtotal: 2950,
    discount: { type: 'fixed', value: 0, amount: 0 },
    tax: { percent: 0, amount: 0 },
    deliveryCharge: 0,
    paidAmount: 0,
    dueAmount: 2950,
    total: 2950,
    date: 1779453600000,
    status_updated_at: 1779453600000,
  }
];

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
      productLink: `https://tazumart.bd/order/${orderId}`,
      date: now,
      status_updated_at: now,
      statusHistory: [{ status: orderPayload.status, timestamp: now, updatedBy: 'Admin' }],
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
  }))
}));
