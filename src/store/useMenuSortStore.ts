import { create } from 'zustand';
import { getSupabase } from '../lib/supabase';

export interface MenuSortState {
  mainMenuOrder: string[] | null;
  submenuOrders: Record<string, string[]>; // Map parent menu name -> ordered subItem names
  memberOrder: string[] | null; // Ordered list of moderator IDs
  renamedMenus: Record<string, string>; // Map original name -> renamed name
  deletedMenus: string[]; // List of original names of deleted menus
  expandedMenus: Record<string, boolean>; // Expanded state
  isLoaded: boolean;
  subscribe: () => () => void;
  updateAllSettings: (
    mainMenu: string[] | null,
    submenus: Record<string, string[]>,
    renamed: Record<string, string>,
    deleted: string[]
  ) => void;
  saveOrders: (
    mainMenu: string[],
    submenus: Record<string, string[]>,
    members: string[]
  ) => void;
  renameMenu: (originalName: string, newName: string) => void;
  toggleVisibility: (menuName: string) => void;
  resetToDefault: () => void;
}

const defaultState = {
  mainMenuOrder: null,
  submenuOrders: {},
  memberOrder: null,
  renamedMenus: {},
  deletedMenus: [],
  expandedMenus: {},
};

export const useMenuSortStore = create<MenuSortState>((set, get) => ({
  ...defaultState,
  isLoaded: false,
  
  subscribe: () => {
    const supabase = getSupabase();
    if (!supabase) return () => {};

    const loadSettings = async () => {
        const { data, error } = await supabase.from('settings').select('*').eq('id', 'menuSort').limit(1);
        if (!error && data && data.length > 0) {
            const dataObj = data[0];
            set({
              mainMenuOrder: dataObj.mainMenuOrder ?? null,
              submenuOrders: dataObj.submenuOrders ?? {},
              memberOrder: dataObj.memberOrder ?? null,
              renamedMenus: dataObj.renamedMenus ?? {},
              deletedMenus: dataObj.deletedMenus ?? [],
              expandedMenus: dataObj.expandedMenus ?? {},
              isLoaded: true
            });
        } else if (!error && data && data.length === 0) {
            supabase.from('settings').upsert([{ id: 'menuSort', ...defaultState }]).then(({error}) => error && console.warn(error));
            set({ ...defaultState, isLoaded: true });
        }
    };
    
    loadSettings();
    
    const channel = supabase
      .channel('public:settings:menuSort')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings', filter: 'id=eq.menuSort' }, () => {
         loadSettings();
      })
      .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
  },

  updateAllSettings: (mainMenu, submenus, renamed, deleted) => {
    const updates = {
      mainMenuOrder: mainMenu,
      submenuOrders: submenus,
      renamedMenus: renamed,
      deletedMenus: deleted
    };
    set(updates);
    const supabase = getSupabase();
    if (supabase) {
        supabase.from('settings').update(updates).eq('id', 'menuSort').then(({error}) => error && console.warn(error));
    }
  },

  saveOrders: (mainMenu, submenus, members) => {
    const updates = {
      mainMenuOrder: mainMenu,
      submenuOrders: submenus,
      memberOrder: members,
    };
    set(updates);
    const supabase = getSupabase();
    if (supabase) {
        supabase.from('settings').update(updates).eq('id', 'menuSort').then(({error}) => error && console.warn(error));
    }
  },

  renameMenu: (originalName, newName) => {
    const updatedRenamed = {
      ...get().renamedMenus,
      [originalName]: newName,
    };
    set({ renamedMenus: updatedRenamed });
    const supabase = getSupabase();
    if (supabase) {
        supabase.from('settings').update({ renamedMenus: updatedRenamed }).eq('id', 'menuSort').then(({error}) => error && console.warn(error));
    }
  },

  toggleVisibility: (menuName) => {
    const currentDeleted = get().deletedMenus;
    const updatedDeleted = currentDeleted.includes(menuName)
      ? currentDeleted.filter((n) => n !== menuName)
      : [...currentDeleted, menuName];
    set({ deletedMenus: updatedDeleted });
    const supabase = getSupabase();
    if (supabase) {
        supabase.from('settings').update({ deletedMenus: updatedDeleted }).eq('id', 'menuSort').then(({error}) => error && console.warn(error));
    }
  },

  resetToDefault: () => {
    set(defaultState);
    const supabase = getSupabase();
    if (supabase) {
        supabase.from('settings').upsert([{ id: 'menuSort', ...defaultState }]).then(({error}) => error && console.warn(error));
    }
  },
}));
