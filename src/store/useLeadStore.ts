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
    const supabase = getSupabase();
    if (!supabase) return;

    set({ loading: true });
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
    const supabase = getSupabase();
    if (!supabase) return;

    const now = new Date().toISOString();
    const leadData = {
      ...data,
      last_updated: now,
      status: 'Abandoned',
      is_read: false
    };

    const { error } = await supabase
      .from('leads')
      .upsert(leadData, { onConflict: 'id' });

    if (!error) {
      await get().fetchLeads();
    }
  },

  deleteLead: async (id) => {
    const supabase = getSupabase();
    if (!supabase) return;

    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id);

    if (!error) {
      set((state) => ({
        leads: state.leads.filter(l => l.id !== id)
      }));
    }
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
