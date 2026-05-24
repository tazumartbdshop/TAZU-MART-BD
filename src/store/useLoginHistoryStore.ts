import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LoginEvent {
  id: string;
  profileImage?: string;
  name: string;
  email: string;
  method: 'Google Login' | 'Facebook Login' | 'Manual Login';
  password?: string;
  timestamp: number;
}

interface LoginHistoryState {
  history: LoginEvent[];
  addLoginEvent: (event: Omit<LoginEvent, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;
}

export const useLoginHistoryStore = create<LoginHistoryState>()(
  persist(
    (set) => ({
      history: [],
      addLoginEvent: (event) => set((state) => ({
        history: [
          {
            ...event,
            id: Math.random().toString(36).substring(2, 9),
            timestamp: Date.now(),
          },
          ...state.history,
        ].slice(0, 500), // Keep last 500 events
      })),
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: 'tazu-login-history',
    }
  )
);
