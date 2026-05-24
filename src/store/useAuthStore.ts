import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  zipCode?: string;
  landmark?: string;
  profileImage?: string;
  language?: string;
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
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
      updateUser: (updatedUser) => set((state) => ({
        user: state.user ? { ...state.user, ...updatedUser } : null
      })),
    }),
    {
      name: 'luxemart-auth',
    }
  )
);
