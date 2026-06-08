import { create } from 'zustand';
import { generateDemoCustomers } from '../utils/demoDataGenerator';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

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
  phones: string[];
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
  emails: string[];
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
  isRead?: boolean;
  isDemo?: boolean;
}

interface CustomerState {
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'isRead'> & { id?: string }) => void;
  syncCustomerFromAuth: (user: any) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearDemoData: () => void;
  subscribe: () => () => void;
}

export const initialDemoCustomers: Customer[] = generateDemoCustomers();

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

export const useCustomerStore = create<CustomerState>((set, get) => ({
  customers: initialDemoCustomers,
  addCustomer: (customerPayload) => {
    const id = customerPayload.id || Math.random().toString(36).substring(2, 9);
    const newCustomer = {
      ...customerPayload,
      id,
      createdAt: Date.now(),
      isRead: false,
    };
    
    setDoc(doc(db, 'customers', id), cleanUndefined(newCustomer))
      .catch(err => handleFirestoreError(err, OperationType.WRITE, `customers/${id}`));
      
    set((state) => ({
      customers: [...state.customers, newCustomer]
    }));
  },
  syncCustomerFromAuth: (user) => {
    if (!user || user.role !== 'customer') return;
    const customers = get().customers;
    const existing = customers.find(c => c.emails.includes(user.email) || (user.phone && c.phones.includes(user.phone)));
    
    if (existing) {
      get().updateCustomer(existing.id, { 
        lastLogin: Date.now(),
        totalLogins: (existing.totalLogins || 0) + 1,
        lastIP: '192.168.' + Math.floor(Math.random() * 255) + '.' + Math.floor(Math.random() * 255),
        deviceType: window.innerWidth < 768 ? 'Mobile' : 'Desktop'
      });
    } else {
      get().addCustomer({
        name: user.name,
        phones: user.phone ? [user.phone] : [],
        emails: [user.email],
        address: {
          country: user.country || 'Bangladesh',
          city: user.city || user.district || '',
          area: user.area || user.upazila || '',
          street: user.address || user.street || '',
          division: user.division,
          district: user.district,
          upazila: user.upazila,
          zipCode: user.zipCode
        },
        profileImage: user.profileImage,
        gender: user.gender,
        occasionName: user.occasionName, // Capture special day
        specialDate: user.specialDate,
        socialLinks: [],
        status: 'Active',
        customerType: 'New',
        totalOrders: 0,
        totalSpend: 0,
        lastLogin: Date.now(),
        totalLogins: 1,
        lastIP: 'User Sync',
        deviceType: window.innerWidth < 768 ? 'Mobile' : 'Desktop'
      });
    }
  },
  updateCustomer: (id, updates) => {
    setDoc(doc(db, 'customers', id), cleanUndefined(updates), { merge: true })
      .catch(err => handleFirestoreError(err, OperationType.WRITE, `customers/${id}`));
      
    set((state) => ({
      customers: state.customers.map(c => c.id === id ? { ...c, ...updates } : c)
    }));
  },
  deleteCustomer: (id) => {
    deleteDoc(doc(db, 'customers', id))
      .catch(err => handleFirestoreError(err, OperationType.DELETE, `customers/${id}`));
      
    set((state) => ({
      customers: state.customers.filter(c => c.id !== id)
    }));
  },
  markAsRead: (id) => {
    setDoc(doc(db, 'customers', id), { isRead: true }, { merge: true })
      .catch(err => handleFirestoreError(err, OperationType.WRITE, `customers/${id}`));
      
    set((state) => ({
      customers: state.customers.map(c => c.id === id ? { ...c, isRead: true } : c)
    }));
  },
  markAllAsRead: () => {
    get().customers.forEach((c) => {
      if (!c.isRead) {
        setDoc(doc(db, 'customers', c.id), { isRead: true }, { merge: true })
          .catch(err => handleFirestoreError(err, OperationType.WRITE, `customers/${c.id}`));
      }
    });
    
    set((state) => ({
      customers: state.customers.map(c => ({ ...c, isRead: true }))
    }));
  },
  clearDemoData: () => set((state) => ({
    customers: state.customers.filter(c => !c.isDemo)
  })),
  subscribe: () => {
    const unsubscribe = onSnapshot(collection(db, 'customers'), (snapshot) => {
      const list: Customer[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Customer);
      });
      // Fallback
      if (list.length > 0) {
        set({ customers: list });
      } else {
        set({ customers: initialDemoCustomers });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'customers');
    });
    return unsubscribe;
  }
}));
