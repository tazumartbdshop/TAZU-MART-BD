import { create } from 'zustand';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

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
    const docRef = doc(db, 'settings', 'menuSort');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        set({
          mainMenuOrder: data.mainMenuOrder ?? null,
          submenuOrders: data.submenuOrders ?? {},
          memberOrder: data.memberOrder ?? null,
          renamedMenus: data.renamedMenus ?? {},
          deletedMenus: data.deletedMenus ?? [],
          expandedMenus: data.expandedMenus ?? {},
          isLoaded: true
        });
      } else {
        // Seed initial menu sort document in Firestore
        setDoc(docRef, defaultState)
          .then(() => {
            set({ ...defaultState, isLoaded: true });
          })
          .catch((err) => console.error("Initial menu sort seed failed:", err));
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/menuSort');
    });
    return unsubscribe;
  },

  updateAllSettings: (mainMenu, submenus, renamed, deleted) => {
    const updates = {
      mainMenuOrder: mainMenu,
      submenuOrders: submenus,
      renamedMenus: renamed,
      deletedMenus: deleted
    };
    set(updates);
    setDoc(doc(db, 'settings', 'menuSort'), updates, { merge: true })
      .catch((err) => handleFirestoreError(err, OperationType.WRITE, 'settings/menuSort'));
  },

  saveOrders: (mainMenu, submenus, members) => {
    const updates = {
      mainMenuOrder: mainMenu,
      submenuOrders: submenus,
      memberOrder: members,
    };
    set(updates);
    setDoc(doc(db, 'settings', 'menuSort'), updates, { merge: true })
      .catch((err) => handleFirestoreError(err, OperationType.WRITE, 'settings/menuSort'));
  },

  renameMenu: (originalName, newName) => {
    const updatedRenamed = {
      ...get().renamedMenus,
      [originalName]: newName,
    };
    set({ renamedMenus: updatedRenamed });
    setDoc(doc(db, 'settings', 'menuSort'), { renamedMenus: updatedRenamed }, { merge: true })
      .catch((err) => handleFirestoreError(err, OperationType.WRITE, 'settings/menuSort'));
  },

  toggleVisibility: (menuName) => {
    const currentDeleted = get().deletedMenus;
    const updatedDeleted = currentDeleted.includes(menuName)
      ? currentDeleted.filter((n) => n !== menuName)
      : [...currentDeleted, menuName];
    set({ deletedMenus: updatedDeleted });
    setDoc(doc(db, 'settings', 'menuSort'), { deletedMenus: updatedDeleted }, { merge: true })
      .catch((err) => handleFirestoreError(err, OperationType.WRITE, 'settings/menuSort'));
  },

  resetToDefault: () => {
    set(defaultState);
    setDoc(doc(db, 'settings', 'menuSort'), defaultState)
      .catch((err) => handleFirestoreError(err, OperationType.WRITE, 'settings/menuSort'));
  },
}));
