import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useCustomerStore } from './useCustomerStore';

type UserRole = 'customer' | 'admin' | 'moderator';

export interface User {
  id: string;
  uuid?: string;
  name: string;
  email: string;
  role: UserRole;
  status?: string;
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
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token?: string) => void;
  logout: () => void;
  updateUser: (updatedUser: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => {
        set({ user, token: token || null, isAuthenticated: true });
        // Sync customer data
        setTimeout(() => {
          useCustomerStore.getState().syncCustomerFromAuth(user);
        }, 500);
      },
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },
      updateUser: (updatedUser) => {
        set((state) => {
          const newUser = state.user ? { ...state.user, ...updatedUser } : null;
          
          if (newUser && newUser.role === 'customer') {
            const headers: any = { 'Content-Type': 'application/json' };
            if (state.token) {
              headers['Authorization'] = `Bearer ${state.token}`;
            }
            fetch('/api/admin/update-customer', {
              method: 'POST',
              headers: headers,
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
