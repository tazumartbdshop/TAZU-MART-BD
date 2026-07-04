import { create } from 'zustand';
import { objectToSnake, objectToCamel } from '../lib/supabaseUtils';

export interface PaymentMethod {
  id: string;
  type: string; // 'bKash' | 'Nagad' | 'Rocket' | 'Card'
  details: string; // Masked number/account
  isDefault: boolean;
  holder?: string; // Account name or Cardholder
  isVerified?: boolean;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: {
    country: string;
    city: string;
    area: string;
    street: string;
    division?: string;
    district?: string;
    upazila?: string;
    zipCode?: string;
  };
  email: string;
  whatsApp?: string;
  note?: string;
  profileImage?: string;
  gender?: string;
  socialLinks: { platform: string; username: string }[];
  password?: string;
  occasionName?: string;
  specialDate?: string;
  status: 'Active' | 'Blocked' | 'VIP' | 'Suspended';
  customerType: 'New' | 'Regular' | 'VIP' | 'Wholesale';
  totalOrders: number;
  totalSpend: number;
  lastLogin: number;
  totalLogins: number;
  lastIP?: string;
  deviceType?: string;
  paymentMethods?: PaymentMethod[];
  createdAt: number;
  loginProvider?: 'Email' | 'Google' | 'Facebook';
  lastLoginAt?: string;
  isRead?: boolean;
  isDemo?: boolean;
}

interface CustomerState {
  customers: Customer[];
  isLoading: boolean;
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'isRead'> & { id?: string }) => Promise<void>;
  syncCustomerFromAuth: (user: any) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearDemoData: () => void;
  fetchCustomers: () => Promise<void>;
  checkAndCreateCustomerRecord: (user: any) => Promise<void>;
  subscribe: () => () => void;
}

export const useCustomerStore = create<CustomerState>((set, get) => ({
  customers: [],
  isLoading: false,

  addCustomer: async (customerData) => {
    try {
      const response = await fetch('/api/admin/create-customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData)
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned an invalid response (HTML). Please check server logs.");
      }

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to create customer');

      await get().fetchCustomers();
      return result;
    } catch (err: any) {
      console.error("[Store Add Customer] Error:", err);
      throw err;
    }
  },

  syncCustomerFromAuth: async (user) => {
    if (!user || user.role !== 'customer') return;
    
    await get().fetchCustomers();
    
    const customers = get().customers;
    const existing = customers.find(c => 
      c.id === String(user.id) || 
      c.email === user.email || 
      (user.phone && c.phone === user.phone)
    );
    
    if (existing) {
      get().updateCustomer(existing.id, { 
        lastLogin: Date.now(),
        lastLoginAt: new Date().toISOString(),
        totalLogins: (existing.totalLogins || 0) + 1,
        lastIP: 'User Sync',
        deviceType: window.innerWidth < 768 ? 'Mobile' : 'Desktop'
      });
    } else {
      await get().checkAndCreateCustomerRecord(user);
    }
  },

  checkAndCreateCustomerRecord: async (user) => {
    try {
      const customerRecord = {
        id: user.id,
        name: user.name || 'New Customer',
        email: user.email,
        phone: user.phone || '',
        status: 'Active',
        customer_type: 'New',
        created_at: new Date().toISOString()
      };

      await fetch('/api/admin/create-customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerRecord)
      });
      
      await get().fetchCustomers();
    } catch (err) {
      console.error("[checkAndCreateCustomerRecord] Error:", err);
    }
  },

  updateCustomer: async (id, updates) => {
    try {
      const response = await fetch('/api/admin/update-customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          updates: objectToSnake(updates)
        })
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned an invalid response (HTML). Please check server logs.");
      }

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update customer');
      }

      await get().fetchCustomers();
    } catch (error: any) {
      console.error("[Store Update Customer] Error:", error);
      throw error;
    }
  },

  deleteCustomer: async (id) => {
    try {
      const response = await fetch('/api/admin/delete-customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned an invalid response (HTML). Please check server logs.");
      }

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete customer');
      }

      set((state) => ({
        customers: state.customers.filter(c => c.id !== id)
      }));
    } catch (error: any) {
      console.error("[Store Delete Customer] Error:", error);
      throw error;
    }
  },

  markAsRead: (id) => {
    set((state) => ({
      customers: state.customers.map(c => c.id === id ? { ...c, isRead: true } : c)
    }));
  },

  markAllAsRead: () => {
    set((state) => ({
      customers: state.customers.map(c => ({ ...c, isRead: true }))
    }));
  },

  clearDemoData: () => set((state) => ({
    customers: state.customers.filter(c => !c.isDemo)
  })),

  fetchCustomers: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch('/api/admin/customers');
      if (response.ok) {
        const data = await response.json();
        const customers = Array.isArray(data) ? data : (data.customers || []);
        set({ 
          customers: customers.map((c: any) => ({
            ...objectToCamel(c),
            id: String(c.id),
            address: typeof c.address === 'string' ? JSON.parse(c.address) : (c.address || {})
          })) 
        });
      }
    } catch (err) {
      console.error("[Customer Store] fetchCustomers failed:", err);
    } finally {
      set({ isLoading: false });
    }
  },

  subscribe: () => {
    get().fetchCustomers();
    const interval = setInterval(() => {
      get().fetchCustomers();
    }, 10000); // Poll every 10s instead of 5s
      
    return () => clearInterval(interval);
  }
}));
