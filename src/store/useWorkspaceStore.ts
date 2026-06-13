import { create } from 'zustand';
import { getSupabase } from '../lib/supabase';

export interface FolderType {
  id: string;
  name: string;
  type: 'folder' | 'file';
  size?: string;
  folderId?: string;
  createdAt: string;
  user_id?: string;
}

export interface NoteType {
  id: string;
  title: string;
  content?: string;
  createdAt: string;
  user_id?: string;
}

export interface TeamMemberType {
  id: string;
  name: string;
  email: string;
  role?: string;
  createdAt: string;
  user_id?: string;
}

interface WorkspaceState {
  folders: FolderType[];
  notes: NoteType[];
  teamMembers: TeamMemberType[];
  isLoading: {
    folders: boolean;
    notes: boolean;
    teamMembers: boolean;
  };
  isSubscribed: boolean;
  
  subscribe: (uid: string) => () => void;
  
  // Actions
  addFolder: (uid: string, name: string) => Promise<void>;
  addFile: (uid: string, name: string) => Promise<void>;
  addNote: (uid: string, content: string) => Promise<void>;
  addTeamMember: (uid: string, name: string, email: string, role: string) => Promise<void>;
  
  updateFolder: (uid: string, id: string, name: string) => Promise<void>;
  updateFile: (uid: string, id: string, name: string) => Promise<void>;
  updateNote: (uid: string, id: string, content: string) => Promise<void>;
  updateTeamMember: (uid: string, id: string, name: string, email: string, role: string) => Promise<void>;
  
  deleteItem: (uid: string, id: string, collectionName: 'folders' | 'notes' | 'teamMembers') => Promise<void>;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  folders: [],
  notes: [],
  teamMembers: [],
  isLoading: {
    folders: true,
    notes: true,
    teamMembers: true
  },
  isSubscribed: false,

  subscribe: (uid: string) => {
    if (!uid) {
      console.warn("⚠️ সাবস্ক্রাইব বাতিল: ইউজার আইডি (UID) পাওয়া যায়নি।");
      return () => {};
    }

    const supabase = getSupabase();
    if (!supabase) return () => {};
    
    set({ isSubscribed: true });
    
    const loadFolders = async () => {
        const { data, error } = await supabase.from('folders').select('*').eq('user_id', uid).order('createdAt', { ascending: false });
        if (!error && data) {
            set(state => ({ folders: data as FolderType[], isLoading: { ...state.isLoading, folders: false } }));
        } else {
            set(state => ({ isLoading: { ...state.isLoading, folders: false } }));
        }
    };
    
    const loadNotes = async () => {
        const { data, error } = await supabase.from('notes').select('*').eq('user_id', uid).order('createdAt', { ascending: false });
        if (!error && data) {
             set(state => ({ notes: data as NoteType[], isLoading: { ...state.isLoading, notes: false } }));
        } else {
             set(state => ({ isLoading: { ...state.isLoading, notes: false } }));
        }
    };
    
    const loadMembers = async () => {
         const { data, error } = await supabase.from('teamMembers').select('*').eq('user_id', uid).order('name', { ascending: true });
         if (!error && data) {
             set(state => ({ teamMembers: data as TeamMemberType[], isLoading: { ...state.isLoading, teamMembers: false } }));
         } else {
             set(state => ({ isLoading: { ...state.isLoading, teamMembers: false } }));
         }
    };
    
    loadFolders();
    loadNotes();
    loadMembers();

    const channel1 = supabase.channel(`public:folders:${uid}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'folders', filter: `user_id=eq.${uid}` }, loadFolders)
        .subscribe();
        
    const channel2 = supabase.channel(`public:notes:${uid}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'notes', filter: `user_id=eq.${uid}` }, loadNotes)
        .subscribe();
        
    const channel3 = supabase.channel(`public:teamMembers:${uid}`)
         .on('postgres_changes', { event: '*', schema: 'public', table: 'teamMembers', filter: `user_id=eq.${uid}` }, loadMembers)
         .subscribe();
         
    return () => {
      supabase.removeChannel(channel1);
      supabase.removeChannel(channel2);
      supabase.removeChannel(channel3);
      set({ isSubscribed: false });
    };
  },

  addFolder: async (uid, name) => {
    if (!uid) return;
    try {
      const supabase = getSupabase();
      if (supabase) {
          const { error } = await supabase.from('folders').insert([{ name, type: 'folder', createdAt: new Date().toISOString(), user_id: uid }]);
          if (error) throw error;
      }
    } catch (error) {
      console.error('Error adding folder:', error);
      throw error;
    }
  },

  addFile: async (uid, name) => {
    if (!uid) return;
    try {
      const supabase = getSupabase();
      if (supabase) {
          const { error } = await supabase.from('folders').insert([{ name, type: 'file', createdAt: new Date().toISOString(), user_id: uid }]);
          if (error) throw error;
      }
    } catch (error) {
      console.error('Error adding file:', error);
      throw error;
    }
  },

  addNote: async (uid, content) => {
    if (!uid) return;
    try {
      const supabase = getSupabase();
      if(supabase) {
          const { error } = await supabase.from('notes').insert([{ content, createdAt: new Date().toISOString(), user_id: uid }]);
          if (error) throw error;
      }
    } catch (error) {
      console.error('Error adding note:', error);
      throw error;
    }
  },

  addTeamMember: async (uid, name, email, role) => {
    if (!uid) return;
    try {
      const supabase = getSupabase();
      if(supabase) {
          const { error } = await supabase.from('teamMembers').insert([{ name, email, role, createdAt: new Date().toISOString(), user_id: uid }]);
          if(error) throw error;
      }
    } catch (error) {
       console.error('Error adding team member:', error);
       throw error;
    }
  },

  updateFolder: async (uid, id, name) => {
    if (!uid || !id) return;
    try {
      const supabase = getSupabase();
      if(supabase) {
          const { error } = await supabase.from('folders').update({ name }).eq('id', id).eq('user_id', uid);
          if(error) throw error;
      }
    } catch (error) {
      console.error('Error updating folder:', error);
      throw error;
    }
  },

  updateFile: async (uid, id, name) => {
    if (!uid || !id) return;
    try {
      const supabase = getSupabase();
      if(supabase) {
          const { error } = await supabase.from('folders').update({ name }).eq('id', id).eq('user_id', uid);
          if (error) throw error;
      }
    } catch (error) {
       console.error('Error updating file:', error);
       throw error;
    }
  },

  updateNote: async (uid, id, content) => {
    if (!uid || !id) return;
    try {
      const supabase = getSupabase();
      if(supabase) {
          const { error } = await supabase.from('notes').update({ content }).eq('id', id).eq('user_id', uid);
          if (error) throw error;
      }
    } catch (error) {
       console.error('Error updating note:', error);
       throw error;
    }
  },

  updateTeamMember: async (uid, id, name, email, role) => {
    if (!uid || !id) return;
    try {
      const supabase = getSupabase();
      if(supabase) {
         const { error } = await supabase.from('teamMembers').update({ name, email, role }).eq('id', id).eq('user_id', uid);
         if (error) throw error;
      }
    } catch (error) {
      console.error('Error updating team member:', error);
      throw error;
    }
  },

  deleteItem: async (uid, id, collectionName) => {
    if (!uid || !id) return;
    try {
      const supabase = getSupabase();
      if (supabase) {
          const { error } = await supabase.from(collectionName).delete().eq('id', id).eq('user_id', uid);
          if (error) throw error;
      }
    } catch (error) {
      console.error(`Error deleting item from ${collectionName}:`, error);
      throw error;
    }
  }
}));
