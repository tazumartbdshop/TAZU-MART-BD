import { create } from 'zustand';

interface DebugState {
  lastCreatedDocId: string;
  lastWriteStatus: 'Idle' | 'Success' | 'Failed' | 'Pending';
  setLastWrite: (docId: string, status: 'Success' | 'Failed' | 'Pending') => void;
}

export const useDebugStore = create<DebugState>((set) => ({
  lastCreatedDocId: localStorage.getItem('debug_last_created_id') || 'None yet',
  lastWriteStatus: 'Idle',
  setLastWrite: (docId, status) => {
    localStorage.setItem('debug_last_created_id', docId);
    set({ lastCreatedDocId: docId, lastWriteStatus: status });
  }
}));
