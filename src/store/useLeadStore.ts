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
}

interface LeadState {
  leads: Lead[];
  addOrUpdateLead: (data: Partial<Lead> & { id: string }) => void;
  deleteLead: (id: string) => void;
  clearLeads: () => void;
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
            lastUpdated: now
          };
        } else {
          updatedLeads.unshift({
            status: 'Abandoned',
            lastUpdated: now,
            ...data
          } as Lead);
        }

        return { leads: updatedLeads };
      }),
      deleteLead: (id) => set((state) => ({
        leads: state.leads.filter(l => l.id !== id)
      })),
      clearLeads: () => set({ leads: [] }),
    }),
    {
      name: 'lead-storage',
    }
  )
);
