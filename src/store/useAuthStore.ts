import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getSupabase } from '../lib/supabase';
import { useCustomerStore } from './useCustomerStore';

type UserRole = 'customer' | 'admin' | 'moderator';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  username?: string;
  gender?: string;
  dob?: string;
  address?: string;
  country?: string;
  division?: string;
  district?: string;
  city?: string;
  upazila?: string;
  area?: string;
  houseRoad?: string;
  street?: string;
  zipCode?: string;
  postalCode?: string;
  landmark?: string;
  profileImage?: string;
  language?: string;
  occasionName?: string;
  specialDate?: string;
  interests?: string[];
  marketingEmail?: boolean;
  permissions?: string[];
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (updatedUser: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user) => {
        set({ user, isAuthenticated: true });
        // Sync customer data
        setTimeout(() => {
          useCustomerStore.getState().syncCustomerFromAuth(user);
        }, 500);
      },
      logout: () => {
        const supabase = getSupabase();
        if (supabase) {
          supabase.auth.signOut().catch((err) => console.error("Supabase signOut failed:", err));
        }
        set({ user: null, isAuthenticated: false });
      },
      updateUser: (updatedUser) => {
        set((state) => {
          const newUser = state.user ? { ...state.user, ...updatedUser } : null;
          
          // Sync to database if user is a customer
          if (newUser && newUser.role === 'customer') {
             const supabase = getSupabase();
             if (supabase) {
               // Update users table
               supabase.from('users').update(updatedUser).eq('id', newUser.id)
                 .then(({error}) => error && console.warn("Users sync error:", error));
               
               // Update customers table (needs some field mapping usually, but let's try direct for now)
               // Note: useCustomerStore.updateCustomer handles API call which is safer for sync
               useCustomerStore.getState().updateCustomer(newUser.id, updatedUser as any)
                 .catch(err => console.warn("Customers sync error:", err));
             }
          }
          
          return { user: newUser };
        });
      },
    }),
    {
      name: 'luxemart-auth',
    }
  )
);
