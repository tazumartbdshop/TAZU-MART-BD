import { create } from 'zustand';
import { getSupabase } from '../lib/supabase';

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
  isLoaded: boolean;
  subscribe: () => () => void;
  addModerator: (moderator: Omit<Moderator, 'id' | 'createdAt'>) => void;
  updateModerator: (id: string, updatedModerator: Partial<Moderator>) => void;
  deleteModerator: (id: string) => void;
  getModeratorByEmail: (email: string) => Moderator | undefined;
  setUnlocked: (v: boolean) => void;
  setSimUnlocked: (v: boolean) => void;
  setSectionPassword: (v: string) => void;
}

const defaultModerators: Moderator[] = [
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
];

export const useModeratorStore = create<ModeratorStore>((set, get) => ({
  moderators: defaultModerators,
  isUnlocked: false,
  isSimUnlocked: false,
  sectionPassword: 'Aistudio@2026',
  isLoaded: false,
  
  subscribe: () => {
    const supabase = getSupabase();
    if (!supabase) return () => {};

    const loadMods = async () => {
        const { data, error } = await supabase.from('moderators').select('*');
        if (!error && data && data.length > 0) {
            set({ moderators: data as Moderator[] });
        } else if (!error && data && data.length === 0) {
            supabase.from('moderators').upsert(defaultModerators).then(({error}) => error && console.warn(error));
            set({ moderators: defaultModerators });
        }
    };
    
    const loadSettings = async () => {
        const { data, error } = await supabase.from('settings').select('*').eq('id', 'moderatorAuth').limit(1);
        if (!error && data && data.length > 0) {
            const dataObj = data[0];
            if (dataObj.sectionPassword) {
                set({ sectionPassword: dataObj.sectionPassword, isLoaded: true });
            }
        } else if (!error && data && data.length === 0) {
            supabase.from('settings').upsert([{ id: 'moderatorAuth', sectionPassword: 'Aistudio@2026' }]).then(({error}) => error && console.warn(error));
            set({ isLoaded: true });
        }
    };

    loadMods();
    loadSettings();
    
    const channel1 = supabase
      .channel('public:moderators')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'moderators' }, () => {
         loadMods();
      })
      .subscribe();
      
    const channel2 = supabase
      .channel('public:settings:moderatorAuth')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings', filter: 'id=eq.moderatorAuth' }, () => {
         loadSettings();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel1);
      supabase.removeChannel(channel2);
    };
  },

  setUnlocked: (v) => set({ isUnlocked: v }),
  setSimUnlocked: (v) => set({ isSimUnlocked: v }),
  setSectionPassword: (v) => {
    set({ sectionPassword: v });
    const supabase = getSupabase();
    if(supabase) supabase.from('settings').update({ sectionPassword: v }).eq('id', 'moderatorAuth').then(({error}) => error && console.warn(error));
  },

  addModerator: (moderator) => {
    const id = `mod_${Date.now()}`;
    const newModerator: Moderator = {
      ...moderator,
      id,
      createdAt: Date.now(),
    };
    set((state) => ({ moderators: [newModerator, ...state.moderators] }));
    const supabase = getSupabase();
    if (supabase) supabase.from('moderators').insert([newModerator]).then(({error}) => error && console.warn(error));
  },

  updateModerator: (id, updatedModerator) => {
    set((state) => ({
      moderators: state.moderators.map((m) =>
        m.id === id ? { ...m, ...updatedModerator } : m
      ),
    }));
    const supabase = getSupabase();
    if (supabase) supabase.from('moderators').update(updatedModerator).eq('id', id).then(({error}) => error && console.warn(error));
  },

  deleteModerator: (id) => {
    set((state) => ({
      moderators: state.moderators.filter((m) => m.id !== id),
    }));
    const supabase = getSupabase();
    if (supabase) supabase.from('moderators').delete().eq('id', id).then(({error}) => error && console.warn(error));
  },

  getModeratorByEmail: (email) => {
    return get().moderators.find(
      (m) => m.email.toLowerCase() === email.toLowerCase()
    );
  },
}));
