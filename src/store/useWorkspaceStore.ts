import { create } from 'zustand';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  addDoc, 
  deleteDoc, 
  updateDoc 
} from 'firebase/firestore';

export interface FolderType {
  id: string;
  name: string;
  type: 'folder' | 'file';
  size?: string;
  folderId?: string;
  createdAt: string;
}

export interface NoteType {
  id: string;
  title: string;
  content?: string;
  createdAt: string;
}

export interface TeamMemberType {
  id: string;
  name: string;
  email: string;
  role?: string;
  createdAt: string;
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
    
    set({ isSubscribed: true });
    console.log(`🔄 ফায়ারস্টোর লিসেনার শুরু: users/${uid} এর জন্য`);

    const foldersRef = collection(db, 'users', uid, 'folders');
    console.log(`%c[FIRESTORE_LISTEN_INIT]`, 'background: #000; color: #3b82f6; font-weight: bold; padding: 2px 4px;', `Path: users/${uid}/folders`);
    const unsubscribeFolders = onSnapshot(foldersRef, (snapshot) => {
      const list: FolderType[] = [];
      snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as FolderType));
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      set(state => ({ folders: list, isLoading: { ...state.isLoading, folders: false } }));
      console.log(`✅ ফোল্ডার সিঙ্ক হয়েছে (${list.length} আইটেম)`);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${uid}/folders`);
      set(state => ({ isLoading: { ...state.isLoading, folders: false } }));
    });

    const notesRef = collection(db, 'users', uid, 'notes');
    console.log(`%c[FIRESTORE_LISTEN_INIT]`, 'background: #000; color: #3b82f6; font-weight: bold; padding: 2px 4px;', `Path: users/${uid}/notes`);
    const unsubscribeNotes = onSnapshot(notesRef, (snapshot) => {
      const list: NoteType[] = [];
      snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as NoteType));
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      set(state => ({ notes: list, isLoading: { ...state.isLoading, notes: false } }));
      console.log(`✅ নোট সিঙ্ক হয়েছে (${list.length} আইটেম)`);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${uid}/notes`);
      set(state => ({ isLoading: { ...state.isLoading, notes: false } }));
    });

    const membersRef = collection(db, 'users', uid, 'teamMembers');
    console.log(`%c[FIRESTORE_LISTEN_INIT]`, 'background: #000; color: #3b82f6; font-weight: bold; padding: 2px 4px;', `Path: users/${uid}/teamMembers`);
    const unsubscribeMembers = onSnapshot(membersRef, (snapshot) => {
      const list: TeamMemberType[] = [];
      snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as TeamMemberType));
      list.sort((a, b) => a.name.localeCompare(b.name));
      set(state => ({ teamMembers: list, isLoading: { ...state.isLoading, teamMembers: false } }));
      console.log(`✅ টিম মেম্বার সিঙ্ক হয়েছে (${list.length} আইটেম)`);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${uid}/teamMembers`);
      set(state => ({ isLoading: { ...state.isLoading, teamMembers: false } }));
    });

    return () => {
      console.log(`🔌 ফায়ারস্টোর লিসেনার বন্ধ হয়েছে: users/${uid}`);
      unsubscribeFolders();
      unsubscribeNotes();
      unsubscribeMembers();
      set({ isSubscribed: false });
    };
  },

  addFolder: async (uid, name) => {
    if (!uid) {
      console.error("❌ ফায়ারস্টোর এরর: ইউজার আইডি (UID) পাওয়া যায়নি। অথেনটিকেশন চেক করুন।");
      return;
    }
    try {
      console.log(`📡 ফায়ারস্টোর রাইট শুরু: users/${uid}/folders - ডাটা:`, { name });
      const docRef = await addDoc(collection(db, 'users', uid, 'folders'), {
        name,
        type: 'folder',
        createdAt: new Date().toISOString()
      });
      console.log("✅ ফায়ারস্টোর সাকসেস: ফোল্ডার তৈরি হয়েছে, আইডি:", docRef.id);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${uid}/folders`);
      throw error;
    }
  },

  addFile: async (uid, name) => {
    if (!uid) {
      console.error("❌ ফায়ারস্টোর এরর: ইউজার আইডি (UID) পাওয়া যায়নি।");
      return;
    }
    try {
      console.log(`📡 ফায়ারস্টোর রাইট শুরু: users/${uid}/folders (File) - ডাটা:`, { name });
      const docRef = await addDoc(collection(db, 'users', uid, 'folders'), {
        name,
        type: 'file',
        createdAt: new Date().toISOString()
      });
      console.log("✅ ফায়ারস্টোর সাকসেস: ফাইল তৈরি হয়েছে, আইডি:", docRef.id);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${uid}/folders`);
      throw error;
    }
  },

  addNote: async (uid, content) => {
    if (!uid) {
      console.error("❌ ফায়ারস্টোর এরর: ইউজার আইডি (UID) পাওয়া যায়নি।");
      return;
    }
    try {
      console.log(`📡 ফায়ারস্টোর রাইট শুরু: users/${uid}/notes - ডাটা:`, { content });
      const docRef = await addDoc(collection(db, 'users', uid, 'notes'), {
        content,
        createdAt: new Date().toISOString()
      });
      console.log("✅ ফায়ারস্টোর সাকসেস: নোট তৈরি হয়েছে, আইডি:", docRef.id);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${uid}/notes`);
      throw error;
    }
  },

  addTeamMember: async (uid, name, email, role) => {
    if (!uid) {
      console.error("❌ ফায়ারস্টোর এরর: ইউজার আইডি (UID) পাওয়া যায়নি।");
      return;
    }
    try {
      console.log(`📡 ফায়ারস্টোর রাইট শুরু: users/${uid}/teamMembers - ডাটা:`, { name, email, role });
      const docRef = await addDoc(collection(db, 'users', uid, 'teamMembers'), {
        name,
        email,
        role,
        createdAt: new Date().toISOString()
      });
      console.log("✅ ফায়ারস্টোর সাকসেস: এটিম মেম্বার যোগ হয়েছে, আইডি:", docRef.id);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${uid}/teamMembers`);
      throw error;
    }
  },

  updateFolder: async (uid, id, name) => {
    if (!uid || !id) return;
    try {
      console.log(`📡 ফায়ারস্টোর আপডেট শুরু: users/${uid}/folders/${id}`);
      await updateDoc(doc(db, 'users', uid, 'folders', id), { name });
      console.log("✅ ফায়ারস্টোর সাকসেস: ফোল্ডার আপডেট হয়েছে");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${uid}/folders/${id}`);
      throw error;
    }
  },

  updateFile: async (uid, id, name) => {
    if (!uid || !id) return;
    try {
      console.log(`📡 ফায়ারস্টোর আপডেট শুরু: users/${uid}/folders/${id} (File)`);
      await updateDoc(doc(db, 'users', uid, 'folders', id), {
        name
      });
      console.log("✅ ফায়ারস্টোর সাকসেস: ফাইল আপডেট হয়েছে");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${uid}/folders/${id}`);
      throw error;
    }
  },

  updateNote: async (uid, id, content) => {
    if (!uid || !id) return;
    try {
      console.log(`📡 ফায়ারস্টোর আপডেট শুরু: users/${uid}/notes/${id}`);
      await updateDoc(doc(db, 'users', uid, 'notes', id), {
        content
      });
      console.log("✅ ফায়ারস্টোর সাকসেস: নোট আপডেট হয়েছে");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${uid}/notes/${id}`);
      throw error;
    }
  },

  updateTeamMember: async (uid, id, name, email, role) => {
    if (!uid || !id) return;
    try {
      console.log(`📡 ফায়ারস্টোর আপডেট শুরু: users/${uid}/teamMembers/${id}`);
      await updateDoc(doc(db, 'users', uid, 'teamMembers', id), {
        name,
        email,
        role
      });
      console.log("✅ ফায়ারস্টোর সাকসেস: টিম মেম্বার আপডেট হয়েছে");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${uid}/teamMembers/${id}`);
      throw error;
    }
  },

  deleteItem: async (uid, id, collectionName) => {
    if (!uid || !id) return;
    try {
      console.log(`📡 ফায়ারস্টোর ডিলিট শুরু: users/${uid}/${collectionName}/${id}`);
      await deleteDoc(doc(db, 'users', uid, collectionName, id));
      console.log(`✅ ফায়ারস্টোর সাকসেস: ${collectionName} থেকে আইটেম ডিলিট হয়েছে`);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${uid}/${collectionName}/${id}`);
      throw error;
    }
  }
}));
