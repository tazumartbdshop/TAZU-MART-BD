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
  isInitializing: boolean;
  setInitializing: (isInitializing: boolean) => void;
  login: (user: User) => void;
  logout: () => Promise<void>;
  updateUser: (updatedUser: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isInitializing: true,
      setInitializing: (isInitializing) => set({ isInitializing }),
      login: (user) => {
        set({ user, isAuthenticated: true, isInitializing: false });
        // Sync customer data
        setTimeout(() => {
          useCustomerStore.getState().syncCustomerFromAuth(user);
        }, 500);
      },
      logout: async () => {
        try {
          const supabase = getSupabase();
          if (supabase) {
            // Race with 1000ms timeout so a slow or hanging network call never blocks logout
            await Promise.race([
              supabase.auth.signOut(),
              new Promise((resolve) => setTimeout(resolve, 1000))
            ]).catch((err) => console.error("Supabase signOut failed:", err));
          }
        } catch (err) {
          console.error("Logout error:", err);
        } finally {
          set({ user: null, isAuthenticated: false, isInitializing: false });
          try {
            sessionStorage.clear();
          } catch (e) {
            console.warn("sessionStorage clear note:", e);
          }
        }
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
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
