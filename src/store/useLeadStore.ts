import { create } from 'zustand';

export interface Lead {
  id: string;
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  items?: any[];
  total?: number;
  last_updated: string;
  status: 'Abandoned';
  is_read?: boolean;
  created_at?: string;
}

interface LeadState {
  leads: Lead[];
  loading: boolean;
  fetchLeads: () => Promise<void>;
  addOrUpdateLead: (data: Partial<Lead> & { id: string }) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  clearLeads: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export const useLeadStore = create<LeadState>()((set, get) => ({
  leads: [],
  loading: false,

  fetchLeads: async () => {
    set({ loading: true });
    try {
      const response = await fetch('/api/admin/leads');
      if (response.ok) {
        const data = await response.json();
        set({ leads: data, loading: false });
      } else {
        set({ loading: false });
      }
    } catch (err) {
      console.error("[Lead Store] fetchLeads failed:", err);
      set({ loading: false });
    }
  },

  addOrUpdateLead: async (data) => {
    try {
      const response = await fetch('/api/admin/leads/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        await get().fetchLeads();
      }
    } catch (err) {
      console.error("[Lead Store] addOrUpdateLead failed:", err);
    }
  },

  deleteLead: async (id) => {
    try {
      const response = await fetch(`/api/admin/leads/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        set((state) => ({
          leads: state.leads.filter(l => l.id !== id)
        }));
      }
    } catch (err) {
      console.error("[Lead Store] deleteLead failed:", err);
    }
  },

  clearLeads: async () => {
    try {
      const response = await fetch('/api/admin/leads', {
        method: 'DELETE'
      });
      if (response.ok) {
        set({ leads: [] });
      }
    } catch (err) {
      console.error("[Lead Store] clearLeads failed:", err);
    }
  },

  markAsRead: async (id) => {
    try {
      const response = await fetch(`/api/admin/leads/${id}/read`, {
        method: 'PATCH'
      });
      if (response.ok) {
        set((state) => ({
          leads: state.leads.map(l => l.id === id ? { ...l, is_read: true } : l)
        }));
      }
    } catch (err) {
      console.error("[Lead Store] markAsRead failed:", err);
    }
  },

  markAllAsRead: async () => {
    try {
      const response = await fetch('/api/admin/leads/read-all', {
        method: 'PATCH'
      });
      if (response.ok) {
        set((state) => ({
          leads: state.leads.map(l => ({ ...l, is_read: true }))
        }));
      }
    } catch (err) {
      console.error("[Lead Store] markAllAsRead failed:", err);
    }
  },
}));
