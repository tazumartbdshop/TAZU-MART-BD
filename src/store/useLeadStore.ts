import { create } from 'zustand';
import { getSupabase } from '../lib/supabase';

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
      const res = await fetch('/api/leads');
      if (res.ok) {
        const json = await res.json();
        if (json.leads) {
          set({ leads: json.leads, loading: false });
          return;
        }
      }
    } catch (e) {
      console.warn("[useLeadStore] API fetchLeads fallback to client Supabase:", e);
    }

    const supabase = getSupabase();
    if (!supabase) {
      set({ loading: false });
      return;
    }

    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('last_updated', { ascending: false });

    if (!error && data) {
      set({ leads: data, loading: false });
    } else {
      set({ loading: false });
    }
  },

  addOrUpdateLead: async (data) => {
    const now = new Date().toISOString();
    const leadData = {
      ...data,
      last_updated: now,
      status: 'Abandoned' as const,
      is_read: false
    };

    try {
      const res = await fetch('/api/leads/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.status === 'success' && json.lead) {
          set((state) => {
            const exists = state.leads.some(l => l.id === leadData.id);
            if (exists) {
              return { leads: state.leads.map(l => l.id === leadData.id ? { ...l, ...leadData } : l) };
            } else {
              return { leads: [json.lead, ...state.leads] };
            }
          });
          return;
        }
      }
    } catch (e) {
      console.warn("[useLeadStore] API addOrUpdateLead fallback to client Supabase:", e);
    }

    const supabase = getSupabase();
    if (!supabase) return;

    const { error } = await supabase
      .from('leads')
      .upsert(leadData, { onConflict: 'id' });

    if (!error) {
      await get().fetchLeads();
    }
  },

  deleteLead: async (id) => {
    // Immediately update local store for speed
    set((state) => ({
      leads: state.leads.filter(l => l.id !== id)
    }));

    try {
      await fetch('/api/leads/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
    } catch (e) {
      console.warn("[useLeadStore] API deleteLead fallback to client Supabase:", e);
    }

    const supabase = getSupabase();
    if (!supabase) return;

    await supabase
      .from('leads')
      .delete()
      .eq('id', id);
  },

  clearLeads: async () => {
    const supabase = getSupabase();
    if (!supabase) return;

    const { error } = await supabase
      .from('leads')
      .delete()
      .neq('id', '');

    if (!error) {
      set({ leads: [] });
    }
  },

  markAsRead: async (id) => {
    const supabase = getSupabase();
    if (!supabase) return;

    const { error } = await supabase
      .from('leads')
      .update({ is_read: true })
      .eq('id', id);

    if (!error) {
      set((state) => ({
        leads: state.leads.map(l => l.id === id ? { ...l, is_read: true } : l)
      }));
    }
  },

  markAllAsRead: async () => {
    const supabase = getSupabase();
    if (!supabase) return;

    const { error } = await supabase
      .from('leads')
      .update({ is_read: true })
      .neq('id', '');

    if (!error) {
      set((state) => ({
        leads: state.leads.map(l => ({ ...l, is_read: true }))
      }));
    }
  },
}));
