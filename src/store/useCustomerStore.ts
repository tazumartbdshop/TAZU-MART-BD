import { create } from 'zustand';
import { getSupabase } from '../lib/supabase';
import { safeFetch } from '../utils/apiUrl';
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
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'isRead'> & { id?: string }) => Promise<void>;
  syncCustomerFromAuth: (user: any) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => Promise<any>;
  deleteCustomer: (id: string) => Promise<void>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearDemoData: () => void;
  fetchCustomers: () => Promise<void>;
  checkAndCreateCustomerRecord: (user: any) => Promise<void>;
  subscribe: () => () => void;
}

export const initialDemoCustomers: Customer[] = [];

export const useCustomerStore = create<CustomerState>((set, get) => ({
  customers: initialDemoCustomers,
  addCustomer: async (customerData) => {
    try {
      const response = await safeFetch('/api/admin/create-customer', {
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
    
    // Refresh customers first to have latest state
    await get().fetchCustomers();
    
    const customers = get().customers;
    const existing = customers.find(c => 
      c.id === user.id || 
      c.email === user.email || 
      (user.phone && c.phone === user.phone)
    );
    
    if (existing) {
      try {
        await get().updateCustomer(existing.id, { 
          lastLogin: Date.now(),
          lastLoginAt: new Date().toISOString(),
          totalLogins: (existing.totalLogins || 0) + 1,
          lastIP: 'User Sync',
          deviceType: window.innerWidth < 768 ? 'Mobile' : 'Desktop'
        });
      } catch (err) {
        console.warn("[Customer Store] Failed to update customer on sync:", err);
      }
    } else {
      // If not in customer table, create the record (Auth user already exists here)
      try {
        await get().checkAndCreateCustomerRecord(user);
      } catch (err) {
        console.warn("[Customer Store] Failed to create customer on sync:", err);
      }
    }
  },
  checkAndCreateCustomerRecord: async (user) => {
    const supabase = getSupabase();
    if (!supabase) return;

    const customerRecord = {
      id: user.id,
      name: user.name || 'New Customer',
      email: user.email,
      phone: user.phone || '',
      address: {
        country: user.country || 'Bangladesh',
        city: user.city || user.district || '',
        area: user.area || user.upazila || '',
        street: user.address || user.street || '',
        division: user.division || '',
        district: user.district || '',
        upazila: user.upazila || '',
        zipCode: user.zipCode || ''
      },
      profileImage: user.profileImage,
      gender: user.gender,
      occasionName: user.occasionName,
      specialDate: user.specialDate,
      status: 'Active',
      customerType: 'New',
      loginProvider: user.app_metadata?.provider === 'google' ? 'Google' : 
                     user.app_metadata?.provider === 'facebook' ? 'Facebook' : 'Email',
      totalOrders: 0,
      totalSpend: 0,
      lastLogin: Date.now(),
      lastLoginAt: new Date().toISOString(),
      totalLogins: 1,
      createdAt: Date.now(),
      socialLinks: []
    };

    const { error } = await supabase.from('customers').upsert([objectToSnake(customerRecord)]);
    if (error) {
      console.error("[checkAndCreateCustomerRecord] Error:", error);
    } else {
      await get().fetchCustomers();
    }
  },
  updateCustomer: async (id, updates) => {
    try {
      const response = await safeFetch('/api/admin/update-customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          updates: objectToSnake(updates)
        })
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("[Store Update Customer] Non-JSON response:", text);
        throw new Error("Unable to save changes. Please try again.");
      }

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || result.error || 'Failed to update customer');
      }

      await get().fetchCustomers();
      return result;
    } catch (error: any) {
      console.error("[Store Update Customer] Error:", error);
      throw error;
    }
  },
  deleteCustomer: async (id) => {
    try {
      const response = await safeFetch('/api/admin/delete-customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("[Store Delete Customer] Non-JSON response:", text);
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
    const supabase = getSupabase();
    if (supabase) supabase.from('customers').update({ isRead: true }).eq('id', id).then(({error}) => error && console.warn(error));
      
    set((state) => ({
      customers: state.customers.map(c => c.id === id ? { ...c, isRead: true } : c)
    }));
  },
  markAllAsRead: () => {
    const supabase = getSupabase();
    if (supabase) {
        get().customers.forEach((c) => {
          if (!c.isRead) {
            supabase.from('customers').update({ isRead: true }).eq('id', c.id).then(({error}) => error && console.warn(error));
          }
        });
    }
    set((state) => ({
      customers: state.customers.map(c => ({ ...c, isRead: true }))
    }));
  },
  clearDemoData: () => set((state) => ({
    customers: state.customers.filter(c => !c.isDemo)
  })),
  fetchCustomers: async () => {
    try {
      console.log("[Customer Store] Fetching customers from API...");
      const response = await safeFetch('/api/admin/customers');
      const contentType = response.headers.get("content-type");
      if (response.ok && contentType?.includes("application/json")) {
        const data = await response.json();
        console.log("[Customer Store] API Response:", data);
        if (Array.isArray(data)) {
          set({ customers: data });
          return;
        } else if (data && data.customers && Array.isArray(data.customers)) {
          set({ customers: data.customers });
          return;
        }
      } else {
        console.warn("[Customer Store] API response not OK:", response.status);
      }
    } catch (err) {
      console.error("[Customer Store] fetchCustomers API failed, falling back to Supabase:", err);
    }

    try {
      console.log("[Customer Store] Falling back to Supabase fetch...");
      const supabase = getSupabase();
      if (!supabase) {
        console.warn("[Customer Store] Supabase client not available for fallback");
        return;
      }
      
      const { data, error } = await supabase.from('customers').select('*');
      if (error) {
        console.error("[Customer Store] Supabase fallback error:", error);
      } else if (data) {
        console.log("[Customer Store] Supabase fallback data:", data);
        set({ customers: (data as any[]).map(row => objectToCamel(row)) as Customer[] });
      }
    } catch (fallbackErr) {
      console.error("[Customer Store] Supabase fallback failed critically:", fallbackErr);
    }
  },
  subscribe: () => {
    // Initial fetch
    get().fetchCustomers();

    // Setup active polling every 5 seconds for robust real-time updates across Auth/Admin
    const interval = setInterval(() => {
      get().fetchCustomers();
    }, 5000);
      
    return () => {
      clearInterval(interval);
    };
  }
}));
