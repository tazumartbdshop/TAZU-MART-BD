import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LoginEvent {
  id: string;
  profileImage?: string;
  name: string;
  email: string;
  method: string;
  password?: string;
  timestamp: number; // Login Time
  logoutTime?: number; // Logout Time
  ipAddress?: string; // IP Address
  device?: string; // Device Info
  browser?: string; // Browser Info
  status: 'Success' | 'Failed'; // Status (Success / Failed Login)
}

interface LoginHistoryState {
  history: LoginEvent[];
  addLoginEvent: (event: Partial<Omit<LoginEvent, 'id'>>) => void;
  clearHistory: () => void;
}

// Helpers to get current environment parameters
const getBrowserInfo = () => {
  if (typeof window === 'undefined') return 'NodeJS Runtime';
  const ua = window.navigator.userAgent;
  if (ua.includes('Chrome')) return 'Google Chrome';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Firefox')) return 'Mozilla Firefox';
  if (ua.includes('Edge')) return 'Microsoft Edge';
  return 'Web Browser';
};

const getDeviceInfo = () => {
  if (typeof window === 'undefined') return 'Server Instance';
  const ua = window.navigator.userAgent;
  if (/Android/i.test(ua)) return 'Android Device';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'Apple iOS';
  if (/Macintosh/i.test(ua)) return 'macOS Laptop';
  if (/Windows/i.test(ua)) return 'Windows Desktop';
  return 'Desktop Device';
};

const generateMockHistory = (): LoginEvent[] => {
  const baseTime = Date.now();
  return [
    {
      id: 'log-1',
      name: 'Super Admin',
      email: 'admin@tazumart.com',
      method: 'Manual Login',
      password: '••••••••',
      timestamp: baseTime - 1200000,
      logoutTime: baseTime - 400000,
      ipAddress: '103.145.228.45',
      device: 'Windows Desktop',
      browser: 'Google Chrome',
      status: 'Success'
    },
    {
      id: 'log-2',
      name: 'Super Admin',
      email: 'admin@tazumart.com',
      method: 'Manual Login',
      password: 'wrong_password_101',
      timestamp: baseTime - 1800000,
      logoutTime: undefined,
      ipAddress: '103.145.228.45',
      device: 'Windows Desktop',
      browser: 'Google Chrome',
      status: 'Failed'
    },
    {
      id: 'log-3',
      name: 'Imtiaz Khan',
      email: 'mdimtiazkhan.devolop@gmail.com',
      method: 'Google Login',
      timestamp: baseTime - 3600000,
      logoutTime: baseTime - 2000000,
      ipAddress: '180.234.12.199',
      device: 'macOS Laptop',
      browser: 'Safari',
      status: 'Success'
    },
    {
      id: 'log-4',
      name: 'Rahat Moderator',
      email: 'rahat@tazumart.com',
      method: 'Manual Login',
      password: '••••••••',
      timestamp: baseTime - 7200000,
      logoutTime: baseTime - 3600000,
      ipAddress: '119.30.2.145',
      device: 'Android Device',
      browser: 'Mozilla Firefox',
      status: 'Success'
    },
    {
      id: 'log-5',
      name: 'Guest Customer',
      email: 'guest_user@gmail.com',
      method: 'Facebook Login',
      timestamp: baseTime - 14400000,
      logoutTime: undefined,
      ipAddress: '27.147.202.32',
      device: 'Apple iOS',
      browser: 'Safari Mobile',
      status: 'Success'
    },
    {
      id: 'log-6',
      name: 'Super Admin',
      email: 'admin@tazumart.com',
      method: 'Manual Login',
      password: 'admin_test_keys',
      timestamp: baseTime - 28800000,
      logoutTime: undefined,
      ipAddress: '103.145.228.45',
      device: 'Windows Desktop',
      browser: 'Microsoft Edge',
      status: 'Failed'
    }
  ];
};

export const useLoginHistoryStore = create<LoginHistoryState>()(
  persist(
    (set) => ({
      history: generateMockHistory(),
      addLoginEvent: (event) => set((state) => {
        const randomIPNode = `103.145.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
        
        const newEvent: LoginEvent = {
          id: Math.random().toString(36).substring(2, 9),
          name: event.name || 'Anonymous User',
          email: event.email || 'unknown@domain.com',
          method: event.method || 'Manual Login',
          password: event.password,
          profileImage: event.profileImage,
          timestamp: event.timestamp || Date.now(),
          logoutTime: event.logoutTime,
          ipAddress: event.ipAddress || randomIPNode,
          device: event.device || getDeviceInfo(),
          browser: event.browser || getBrowserInfo(),
          status: event.status || 'Success',
        };

        return {
          history: [newEvent, ...state.history].slice(0, 500)
        };
      }),
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: 'tazu-login-history-v2',
    }
  )
);
