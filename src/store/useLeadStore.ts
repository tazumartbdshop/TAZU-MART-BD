import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Lead {
  id: string;
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  items?: any[];
  total?: number;
  lastUpdated: string;
  status: 'Abandoned';
  isRead?: boolean;
}

interface LeadState {
  leads: Lead[];
  addOrUpdateLead: (data: Partial<Lead> & { id: string }) => void;
  deleteLead: (id: string) => void;
  clearLeads: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

export const useLeadStore = create<LeadState>()(
  persist(
    (set) => ({
      leads: [],
      addOrUpdateLead: (data) => set((state) => {
        const existingIndex = state.leads.findIndex(l => l.id === data.id);
        const updatedLeads = [...state.leads];
        const now = new Date().toISOString();

        if (existingIndex !== -1) {
          updatedLeads[existingIndex] = {
            ...updatedLeads[existingIndex],
            ...data,
            lastUpdated: now,
            isRead: false
          };
        } else {
          updatedLeads.unshift({
            status: 'Abandoned',
            lastUpdated: now,
            isRead: false,
            ...data
          } as Lead);
        }

        return { leads: updatedLeads };
      }),
      deleteLead: (id) => set((state) => ({
        leads: state.leads.filter(l => l.id !== id)
      })),
      clearLeads: () => set({ leads: [] }),
      markAsRead: (id) => set((state) => ({
        leads: state.leads.map(l => l.id === id ? { ...l, isRead: true } : l)
      })),
      markAllAsRead: () => set((state) => ({
        leads: state.leads.map(l => ({ ...l, isRead: true }))
      })),
    }),
    {
      name: 'lead-storage',
    }
  )
);
