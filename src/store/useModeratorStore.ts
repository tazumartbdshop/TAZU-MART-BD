import { create } from 'zustand';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot, getDoc } from 'firebase/firestore';

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
    // We store moderators in their own collection, and section password in settings
    const unsubMods = onSnapshot(collection(db, 'moderators'), (snapshot) => {
      const list: Moderator[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as Moderator);
      });
      // Seed if empty
      if (list.length === 0) {
        defaultModerators.forEach(mod => {
          setDoc(doc(db, 'moderators', mod.id), mod)
            .catch(err => console.error("Initial mod seed error", err));
        });
        set({ moderators: defaultModerators });
      } else {
        set({ moderators: list });
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, 'moderators'));

    const unsubSettings = onSnapshot(doc(db, 'settings', 'moderatorAuth'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.sectionPassword) {
          set({ sectionPassword: data.sectionPassword, isLoaded: true });
        }
      } else {
        setDoc(doc(db, 'settings', 'moderatorAuth'), { sectionPassword: 'Aistudio@2026' }).then(() => {
          set({ isLoaded: true });
        });
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, 'settings/moderatorAuth'));

    return () => {
      unsubMods();
      unsubSettings();
    };
  },

  setUnlocked: (v) => set({ isUnlocked: v }),
  setSimUnlocked: (v) => set({ isSimUnlocked: v }),
  setSectionPassword: (v) => {
    set({ sectionPassword: v });
    setDoc(doc(db, 'settings', 'moderatorAuth'), { sectionPassword: v }, { merge: true })
      .catch(err => handleFirestoreError(err, OperationType.WRITE, 'settings/moderatorAuth'));
  },

  addModerator: (moderator) => {
    const id = `mod_${Date.now()}`;
    const newModerator: Moderator = {
      ...moderator,
      id,
      createdAt: Date.now(),
    };
    set((state) => ({ moderators: [newModerator, ...state.moderators] }));
    setDoc(doc(db, 'moderators', id), newModerator)
      .catch(err => handleFirestoreError(err, OperationType.WRITE, `moderators/${id}`));
  },

  updateModerator: (id, updatedModerator) => {
    set((state) => ({
      moderators: state.moderators.map((m) =>
        m.id === id ? { ...m, ...updatedModerator } : m
      ),
    }));
    setDoc(doc(db, 'moderators', id), updatedModerator, { merge: true })
      .catch(err => handleFirestoreError(err, OperationType.WRITE, `moderators/${id}`));
  },

  deleteModerator: (id) => {
    set((state) => ({
      moderators: state.moderators.filter((m) => m.id !== id),
    }));
    deleteDoc(doc(db, 'moderators', id))
      .catch(err => handleFirestoreError(err, OperationType.DELETE, `moderators/${id}`));
  },

  getModeratorByEmail: (email) => {
    return get().moderators.find(
      (m) => m.email.toLowerCase() === email.toLowerCase()
    );
  },
}));
