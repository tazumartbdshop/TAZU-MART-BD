import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Moderator {
  id: string;
  name: string;
  email: string;
  phone?: string;
  dob?: string;
  gender?: 'Male' | 'Female' | '';
  password: string;
  role: 'moderator';
  status: 'Active' | 'Inactive';
  permissions: string[];
  createdAt: number;
}

interface ModeratorStore {
  moderators: Moderator[];
  isUnlocked: boolean;
  isSimUnlocked: boolean;
  sectionPassword: string;
  addModerator: (moderator: Omit<Moderator, 'id' | 'createdAt'>) => void;
  updateModerator: (id: string, updatedModerator: Partial<Moderator>) => void;
  deleteModerator: (id: string) => void;
  getModeratorByEmail: (email: string) => Moderator | undefined;
  setUnlocked: (v: boolean) => void;
  setSimUnlocked: (v: boolean) => void;
  setSectionPassword: (v: string) => void;
}

export const useModeratorStore = create<ModeratorStore>()(
  persist(
    (set, get) => ({
      moderators: [
        {
          id: 'mod_1',
          name: 'Rakib Hasan',
          email: 'rakib.hasan@gmail.com',
          phone: '01711111111',
          dob: '1995-05-15',
          gender: 'Male',
          password: 'moderator123',
          role: 'moderator',
          status: 'Active',
          permissions: ['dashboard', 'orders'],
          createdAt: Date.now(),
        },
        {
          id: 'mod_2',
          name: 'Nusrat Jahan',
          email: 'nusrat.jahan@gmail.com',
          phone: '01722222222',
          dob: '1998-08-20',
          gender: 'Female',
          password: 'moderator123',
          role: 'moderator',
          status: 'Active',
          permissions: ['dashboard', 'products', 'categories'],
          createdAt: Date.now(),
        },
        {
          id: 'mod_3',
          name: 'Imran Hossain',
          email: 'imran.hossain@gmail.com',
          phone: '01733333333',
          dob: '1992-12-10',
          gender: 'Male',
          password: 'moderator123',
          role: 'moderator',
          status: 'Inactive',
          permissions: ['dashboard', 'analytics'],
          createdAt: Date.now(),
        },
        {
          id: 'mod_4',
          name: 'Sadia Islam',
          email: 'sadia.islam@gmail.com',
          phone: '01744444444',
          dob: '1997-03-25',
          gender: 'Female',
          password: 'moderator123',
          role: 'moderator',
          status: 'Active',
          permissions: ['dashboard', 'orders', 'payments'],
          createdAt: Date.now(),
        }
      ],
      isUnlocked: false,
      isSimUnlocked: false,
      sectionPassword: 'Aistudio@2026',
      setUnlocked: (v) => set({ isUnlocked: v }),
      setSimUnlocked: (v) => set({ isSimUnlocked: v }),
      setSectionPassword: (v) => set({ sectionPassword: v }),
      addModerator: (moderator) => {
        const newModerator: Moderator = {
          ...moderator,
          id: `mod_${Date.now()}`,
          createdAt: Date.now(),
        };
        set((state) => ({
          moderators: [newModerator, ...state.moderators],
        }));
      },
      updateModerator: (id, updatedModerator) => {
        set((state) => ({
          moderators: state.moderators.map((m) =>
            m.id === id ? { ...m, ...updatedModerator } : m
          ),
        }));
      },
      deleteModerator: (id) => {
        set((state) => ({
          moderators: state.moderators.filter((m) => m.id !== id),
        }));
      },
      getModeratorByEmail: (email) => {
        return get().moderators.find(
          (m) => m.email.toLowerCase() === email.toLowerCase()
        );
      },
    }),
    {
      name: 'tazumart-moderators',
      partialize: (state) => ({ 
        moderators: state.moderators,
        sectionPassword: state.sectionPassword 
      }), // Exclude isUnlocked from persistence
    }
  )
);
