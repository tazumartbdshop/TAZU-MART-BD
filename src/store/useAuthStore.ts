import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';

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
  city?: string; // Added city
  upazila?: string; // Added upazila
  area?: string; // Added area
  houseRoad?: string; // Added houseRoad
  street?: string; // Added street
  zipCode?: string;
  postalCode?: string; // Added postalCode
  landmark?: string;
  profileImage?: string;
  language?: string;
  occasionName?: string;
  specialDate?: string;
  interests?: string[]; // Shopping interests
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
        signOut(auth).catch((err) => console.error("Firebase signOut failed:", err));
        import('../lib/supabase').then(m => m.getSupabase()).then(sb => {
          if (sb) {
            sb.auth.signOut().catch((err) => console.error("Supabase signOut failed:", err));
          }
        });
        set({ user: null, isAuthenticated: false });
      },
      updateUser: (updatedUser) => set((state) => ({
        user: state.user ? { ...state.user, ...updatedUser } : null
      })),
    }),
    {
      name: 'luxemart-auth',
    }
  )
);
