import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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
        set({ user: null, isAuthenticated: false });
      },
      updateUser: (updatedUser) => {
        set((state) => {
          const newUser = state.user ? { ...state.user, ...updatedUser } : null;
          
          if (newUser && newUser.role === 'customer') {
            fetch('/api/admin/update-customer', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: newUser.id, updates: updatedUser })
            }).catch(err => console.warn("Update sync error:", err));
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
