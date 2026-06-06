import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface MenuSortState {
  mainMenuOrder: string[] | null;
  submenuOrders: Record<string, string[]>; // Map parent menu name -> ordered subItem names
  memberOrder: string[] | null; // Ordered list of moderator IDs
  renamedMenus: Record<string, string>; // Map original name -> renamed name
  deletedMenus: string[]; // List of original names of deleted menus
  expandedMenus: Record<string, boolean>; // Persisted expanded state
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

export const useMenuSortStore = create<MenuSortState>()(
  persist(
    (set) => ({
      mainMenuOrder: null,
      submenuOrders: {},
      memberOrder: null,
      renamedMenus: {},
      deletedMenus: [],
      expandedMenus: {},
      updateAllSettings: (mainMenu, submenus, renamed, deleted) => {
        set({
          mainMenuOrder: mainMenu,
          submenuOrders: submenus,
          renamedMenus: renamed,
          deletedMenus: deleted
        });
      },
      saveOrders: (mainMenu, submenus, members) => {
        set({
          mainMenuOrder: mainMenu,
          submenuOrders: submenus,
          memberOrder: members,
        });
      },
      renameMenu: (originalName, newName) => {
        set((state) => ({
          renamedMenus: {
            ...state.renamedMenus,
            [originalName]: newName,
          },
        }));
      },
      toggleVisibility: (menuName) => {
        set((state) => ({
          deletedMenus: state.deletedMenus.includes(menuName)
            ? state.deletedMenus.filter((n) => n !== menuName)
            : [...state.deletedMenus, menuName],
        }));
      },
      resetToDefault: () => {
        set({
          mainMenuOrder: null,
          submenuOrders: {},
          memberOrder: null,
          renamedMenus: {},
          deletedMenus: [],
          expandedMenus: {},
        });
      },
    }),
    {
      name: 'tazumart-menu-sort',
    }
  )
);
