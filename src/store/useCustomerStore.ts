import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Customer {
  id: string;
  name: string;
  phones: string[];
  address: {
    country: string;
    city: string;
    area: string;
    zipCode?: string;
    street: string;
  };
  emails: string[];
  whatsApp?: string;
  note?: string;
  profileImage?: string;
  socialLinks: { platform: string; username: string }[];
  password?: string;
  occasionName?: string;
  specialDate?: string;
  status?: 'Active' | 'Blocked';
  createdAt: number;
}

interface CustomerState {
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
}

export const useCustomerStore = create<CustomerState>()(
  persist(
    (set) => ({
      customers: [],
      addCustomer: (customerPayload) => set((state) => ({
        customers: [
          ...state.customers,
          {
            ...customerPayload,
            id: Math.random().toString(36).substring(2, 9),
            createdAt: Date.now(),
          }
        ]
      })),
      updateCustomer: (id, updates) => set((state) => ({
        customers: state.customers.map(c => c.id === id ? { ...c, ...updates } : c)
      })),
      deleteCustomer: (id) => set((state) => ({
        customers: state.customers.filter(c => c.id !== id)
      })),
    }),
    {
      name: 'luxemart-customers',
    }
  )
);
