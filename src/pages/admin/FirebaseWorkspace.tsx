import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../../store/useAuthStore';
import { 
  Folder, 
  FileText, 
  Users, 
  Plus, 
  Trash2, 
  Search, 
  HardDrive, 
  Clock, 
  Lock, 
  Flame, 
  PlusCircle, 
  FolderPlus, 
  FilePlus, 
  UserPlus, 
  ArrowRight, 
  ShieldAlert,
  Loader2,
  FileCode,
  Sparkles,
  ChevronRight,
  Database,
  Briefcase
} from 'lucide-react';
import { auth, db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { collection, onSnapshot, doc, setDoc, addDoc, deleteDoc, getDoc, updateDoc } from 'firebase/firestore';

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

export interface UserProfileType {
  displayName: string;
  email: string;
  plan: string;
  createdAt: string;
}

interface FirebaseWorkspaceProps {
  defaultTab: 'files' | 'notes' | 'team-members';
}

export default function FirebaseWorkspace({ defaultTab }: FirebaseWorkspaceProps) {
  const navigate = useNavigate();
  const { user: authUser, isAuthenticated } = useAuthStore();
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  
  // Real-time collections
  const [profile, setProfile] = useState<UserProfileType | null>(null);
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [notes, setNotes] = useState<NoteType[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMemberType[]>([]);
  
  const activeUid = currentUser?.uid || (isAuthenticated ? authUser?.id : null);

  // Sagas loaders
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingFolders, setLoadingFolders] = useState(true);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(true);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolderFilter, setSelectedFolderFilter] = useState<string>('all');

  // Modals state
  const [activeModal, setActiveModal] = useState<'folder' | 'file' | 'note' | 'member' | 'delete' | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; type: 'folders' | 'note' | 'member'; name: string } | null>(null);
  const [editingItem, setEditingItem] = useState<{ id: string; type: 'folder' | 'file' | 'note' | 'member' } | null>(null);

  // Modal Form Inputs
  const [folderName, setFolderName] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileFolderId, setFileFolderId] = useState('');
  const [fileSize, setFileSize] = useState('1.2 MB');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [memberName, setMemberName] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState('Developer');

  // Auth Sync Listener
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setIsAuthLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

  // Sync / Read Data under users/{uid}
  useEffect(() => {
    if (!activeUid) {
      if (!isAuthLoading) {
        setProfile(null);
        setLoadingProfile(false);
        setLoadingFolders(false);
        setLoadingNotes(false);
        setLoadingMembers(false);
      }
      return;
    }

    // 1. Initial Profile Setup / Sync
    const profileRef = doc(db, 'users', activeUid);
    const unsubscribeProfile = onSnapshot(profileRef, (snapshot) => {
      if (snapshot.exists()) {
        setProfile(snapshot.data() as UserProfileType);
        setLoadingProfile(false);
      } else {
        // Initialize user record if absent
        const initialProfile: UserProfileType = {
          displayName: currentUser?.displayName || authUser?.name || 'Enterprise Member',
          email: currentUser?.email || authUser?.email || '',
          plan: 'Premium Developer Plan',
          createdAt: new Date().toISOString()
        };
        
        setDoc(profileRef, initialProfile)
          .then(() => {
            setProfile(initialProfile);
          })
          .catch((error) => {
            handleFirestoreError(error, OperationType.WRITE, `users/${activeUid}`);
          })
          .finally(() => {
            setLoadingProfile(false);
          });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${activeUid}`);
      setLoadingProfile(false);
    });

    // 2. folders Sync (Unified for Folders & Files)
    const foldersRef = collection(db, 'users', activeUid, 'folders');
    const unsubscribeFolders = onSnapshot(foldersRef, (snapshot) => {
      const foldersList: FolderType[] = [];
      snapshot.forEach((d) => {
        foldersList.push({ id: d.id, ...d.data() } as FolderType);
      });
      // Sort by newest
      foldersList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setFolders(foldersList);
      setLoadingFolders(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${activeUid}/folders`);
      setLoadingFolders(false);
    });

    // 3. Notes Sync
    const notesRef = collection(db, 'users', activeUid, 'notes');
    const unsubscribeNotes = onSnapshot(notesRef, (snapshot) => {
      const notesList: NoteType[] = [];
      snapshot.forEach((d) => {
        notesList.push({ id: d.id, ...d.data() } as NoteType);
      });
      // Sort by newest
      notesList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setNotes(notesList);
      setLoadingNotes(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${activeUid}/notes`);
      setLoadingNotes(false);
    });

    // 5. Team Members Sync
    const membersRef = collection(db, 'users', activeUid, 'teamMembers');
    const unsubscribeMembers = onSnapshot(membersRef, (snapshot) => {
      const membersList: TeamMemberType[] = [];
      snapshot.forEach((d) => {
        membersList.push({ id: d.id, ...d.data() } as TeamMemberType);
      });
      membersList.sort((a, b) => a.name.localeCompare(b.name));
      setTeamMembers(membersList);
      setLoadingMembers(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${activeUid}/teamMembers`);
      setLoadingMembers(false);
    });

    return () => {
      unsubscribeProfile();
      unsubscribeFolders();
      unsubscribeNotes();
      unsubscribeMembers();
    };
  }, [activeUid]);

  // Form Submission Handlers
  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUid) return;
    if (!folderName.trim()) {
      toast.error('Folder name cannot be blank.');
      return;
    }

    const path = `users/${activeUid}/folders`;
    try {
      // Close modal immediately for instant feedback
      setActiveModal(null);
      const name = folderName.trim();
      setFolderName('');

      const docRef = await addDoc(collection(db, 'users', activeUid, 'folders'), {
        name,
        type: 'folder',
        createdAt: new Date().toISOString()
      });
      console.log(`[FIREBASE_WORKSPACE] Folder created with ID: ${docRef.id}`);
      toast.success('Saved Successfully');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
      toast.error('Could not create folder.');
    }
  };

  const handleAddFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUid) return;
    if (!fileName.trim()) {
      toast.error('File name cannot be blank.');
      return;
    }

    const path = `users/${activeUid}/folders`; // INDEX FILE writes to folders
    try {
      const payload = {
        name: fileName.trim(),
        size: fileSize.trim() || '1.0 MB',
        createdAt: new Date().toISOString(),
        type: 'file'
      };

      // Close modal immediately for instant feedback
      setActiveModal(null);
      setFileName('');
      setFileSize('1.2 MB');

      const docRef = await addDoc(collection(db, 'users', activeUid, 'folders'), payload);
      console.log(`[FIREBASE_WORKSPACE] File indexed in folders with ID: ${docRef.id}`);
      toast.success('Saved Successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Could not add file';
      handleFirestoreError(err, OperationType.WRITE, path);
      toast.error(`Error: ${errorMessage}`);
    }
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUid) return;
    if (!noteTitle.trim()) {
      toast.error('Note title cannot be blank.');
      return;
    }

    const path = `users/${activeUid}/notes`;
    try {
      // Close modal immediately for instant feedback
      setActiveModal(null);
      const title = noteTitle.trim();
      const content = noteContent.trim();
      setNoteTitle('');
      setNoteContent('');

      const docRef = await addDoc(collection(db, 'users', activeUid, 'notes'), {
        title,
        content,
        createdAt: new Date().toISOString()
      });
      console.log(`[FIREBASE_WORKSPACE] Note created with ID: ${docRef.id}`);
      toast.success('Saved Successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Could not create note';
      handleFirestoreError(err, OperationType.WRITE, path);
      toast.error(`Error: ${errorMessage}`);
    }
  };

  const handleAddTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUid) return;
    if (!memberName.trim()) {
      toast.error('Team member name cannot be blank.');
      return;
    }

    const path = `users/${activeUid}/teamMembers`;
    try {
      // Close modal immediately for instant feedback
      setActiveModal(null);
      const name = memberName.trim();
      const email = memberEmail.trim();
      const role = memberRole.trim() || 'Contributor';
      setMemberName('');
      setMemberEmail('');
      setMemberRole('Developer');

      const docRef = await addDoc(collection(db, 'users', activeUid, 'teamMembers'), {
        name,
        email,
        role,
        createdAt: new Date().toISOString()
      });
      console.log(`[FIREBASE_WORKSPACE] Team member created with ID: ${docRef.id}`);
      toast.success('Saved Successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Could not save team member';
      handleFirestoreError(err, OperationType.WRITE, path);
      toast.error(`Error: ${errorMessage}`);
    }
  };

  const triggerDeleteConfirm = (id: string, type: 'folders' | 'note' | 'member', name: string) => {
    setDeleteTarget({ id, type, name });
    setActiveModal('delete');
  };

  const executeDelete = async () => {
    if (!activeUid || !deleteTarget) return;
    const { id, type } = deleteTarget;
    
    // Map collection name
    const colMap: Record<string, string> = {
      folders: 'folders',
      note: 'notes',
      member: 'teamMembers'
    };
    
    const colName = colMap[type];
    const path = `users/${activeUid}/${colName}/${id}`;
    
    try {
      // Close immediately for snappy response
      setActiveModal(null);
      const targetName = deleteTarget.name;
      setDeleteTarget(null);
      
      await deleteDoc(doc(db, 'users', activeUid, colName, id));
      toast.success('Deleted Successfully');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
      toast.error(`Failed to remove ${type}.`);
    }
  };

  const handleEditItem = (item: any, type: 'folder' | 'file' | 'note' | 'member') => {
    setEditingItem({ id: item.id, type });
    if (type === 'folder') {
      setFolderName(item.name);
      setActiveModal('folder');
    } else if (type === 'file') {
      setFileName(item.name);
      setFileSize(item.size || '1.0 MB');
      setFileFolderId(item.folderId || '');
      setActiveModal('file');
    } else if (type === 'note') {
      setNoteTitle(item.title);
      setNoteContent(item.content || '');
      setActiveModal('note');
    } else if (type === 'member') {
      setMemberName(item.name);
      setMemberEmail(item.email || '');
      setMemberRole(item.role || 'Developer');
      setActiveModal('member');
    }
  };

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUid || !editingItem) return;
    const { id, type } = editingItem;

    try {
      if (type === 'folder') {
        await updateDoc(doc(db, 'users', activeUid, 'folders', id), { name: folderName.trim() });
      } else if (type === 'file') {
        await updateDoc(doc(db, 'users', activeUid, 'folders', id), {
          name: fileName.trim(),
          size: fileSize.trim(),
          folderId: fileFolderId
        });
      } else if (type === 'note') {
        await updateDoc(doc(db, 'users', activeUid, 'notes', id), {
          title: noteTitle.trim(),
          content: noteContent.trim()
        });
      } else if (type === 'member') {
        await updateDoc(doc(db, 'users', activeUid, 'teamMembers', id), {
          name: memberName.trim(),
          email: memberEmail.trim(),
          role: memberRole.trim()
        });
      }

      toast.success('Updated Successfully');
      setActiveModal(null);
      setEditingItem(null);
      // Reset inputs
      setFolderName(''); setFileName(''); setFileSize('1.2 MB'); setFileFolderId('');
      setNoteTitle(''); setNoteContent(''); setMemberName(''); setMemberEmail(''); setMemberRole('Developer');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${activeUid}/${type}/${id}`);
      toast.error('Failed to update.');
    }
  };

  // Navigations / Tab click handlers
  const handleTabChange = (key: 'files' | 'notes' | 'team-members') => {
    navigate(`/admin/firebase-workspace/${key}`);
  };

  // Filters
  const filteredFiles = folders.filter(f => {
    if (f.type !== 'file') return false;
    const name = f.name || '';
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFolder = selectedFolderFilter === 'all' || f.folderId === selectedFolderFilter;
    return matchesSearch && matchesFolder;
  });

  const filteredNotes = notes.filter(n => {
    const title = n.title || '';
    const content = n.content || '';
    return title.toLowerCase().includes(searchQuery.toLowerCase()) || 
           content.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredMembers = teamMembers.filter(m => {
    const name = m.name || '';
    const role = m.role || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           role.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Authenticated guard message
  if (isAuthLoading) {
    return (
      <div className="flex-1 p-4 md:p-8 flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-black" />
          <p className="text-xs font-black uppercase tracking-widest text-neutral-400">Verifying Security Session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !currentUser) {
    return (
      <div className="flex-1 p-4 md:p-8 flex items-center justify-center min-h-[500px]">
        <div id="auth-unauth-card" className="bg-white border p-8 max-w-md w-full text-center space-y-4 shadow-sm">
          <Lock className="w-12 h-12 text-red-500 mx-auto animate-bounce" />
          <h2 className="text-xl font-bold uppercase tracking-wider text-neutral-800">Authorization Required</h2>
          <p className="text-sm text-neutral-500">
            Please log in first. You must authenticate to view your personal secure Firebase Workspace.
          </p>
          <button 
            onClick={() => navigate('/login')}
            className="w-full bg-[#000000] hover:bg-[#222222] transition-all text-white font-black uppercase text-xs py-3 tracking-widest"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-1 md:p-4 overflow-y-auto">
      {/* Banner Hub */}
      <div id="fw-banner" className="bg-black text-white p-6 md:p-8 relative overflow-hidden mb-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-y-1 scale-150">
          <Flame className="w-96 h-96 text-orange-500" />
        </div>
        
        <div className="relative z-10 space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-900 border border-neutral-850 rounded-none text-[10px] font-black uppercase text-orange-400 tracking-wider">
            <Flame className="w-3.5 h-3.5 fill-current" /> Live Firebase Integration
          </div>
          <h1 className="text-2xl md:text-3.5xl font-sans tracking-tight font-black uppercase leading-none">
            🔥 Firebase Workspace
          </h1>
          <p className="text-xs text-neutral-400 leading-relaxed font-medium">
            Authorized User context: <span className="text-neutral-200 underline font-semibold">{currentUser?.email || authUser?.email}</span>. Use standard secure isolated collections synced automatically.
          </p>
        </div>

        {/* Mini stats cards */}
        <div className="grid grid-cols-3 gap-3 relative z-10 shrink-0">
          <div className="bg-neutral-900 p-3 text-center border border-neutral-800 rounded-none min-w-[90px]">
            <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Files</p>
            <p className="text-xl font-black text-orange-400">{loadingFolders ? '...' : folders.filter(f => f.type === 'file').length}</p>
          </div>
          <div className="bg-neutral-900 p-3 text-center border border-neutral-800 rounded-none min-w-[90px]">
            <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Notes</p>
            <p className="text-xl font-black text-purple-400">{loadingNotes ? '...' : notes.length}</p>
          </div>
          <div className="bg-neutral-900 p-3 text-center border border-neutral-800 rounded-none min-w-[90px]">
            <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Team</p>
            <p className="text-xl font-black text-green-400">{loadingMembers ? '...' : teamMembers.length}</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs and Controls */}
      <div id="fw-tabs-container" className="bg-white border border-[#EEEEEE] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex gap-2 border-b md:border-b-0 pb-2 md:pb-0 overflow-x-auto">
          <button
            onClick={() => handleTabChange('files')}
            className={`px-5 py-2.5 font-sans font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 border-b-2 ${
              defaultTab === 'files' 
                ? 'border-black text-black bg-neutral-50' 
                : 'border-transparent text-neutral-400 hover:text-neutral-700'
            }`}
          >
            <Folder className="w-4 h-4" /> My Files 
            <span className={`text-[10px] py-0.5 px-2 rounded-full ${defaultTab === 'files' ? 'bg-[#000000] text-white' : 'bg-neutral-100 text-[#000000]'}`}>
              {folders.filter(f => f.type === 'file').length}
            </span>
          </button>
          <button
            onClick={() => handleTabChange('notes')}
            className={`px-5 py-2.5 font-sans font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 border-b-2 ${
              defaultTab === 'notes' 
                ? 'border-black text-black bg-neutral-50' 
                : 'border-transparent text-neutral-400 hover:text-neutral-700'
            }`}
          >
            <FileText className="w-4 h-4" /> My Notes
            <span className={`text-[10px] py-0.5 px-2 rounded-full ${defaultTab === 'notes' ? 'bg-[#000000] text-white' : 'bg-neutral-100 text-[#000000]'}`}>
              {notes.length}
            </span>
          </button>
          <button
            onClick={() => handleTabChange('team-members')}
            className={`px-5 py-2.5 font-sans font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 border-b-2 ${
              defaultTab === 'team-members' 
                ? 'border-black text-black bg-neutral-50' 
                : 'border-transparent text-neutral-400 hover:text-neutral-700'
            }`}
          >
            <Users className="w-4 h-4" /> Team Members
            <span className={`text-[10px] py-0.5 px-2 rounded-full ${defaultTab === 'team-members' ? 'bg-[#000000] text-white' : 'bg-neutral-100 text-[#000000]'}`}>
              {teamMembers.length}
            </span>
          </button>
        </div>

        {/* Active Tab Action Trigger Buttons & Search */}
        <div className="flex flex-wrap md:flex-nowrap items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Search ${defaultTab.replace('-', ' ')}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-neutral-200 text-xs text-[#000000] focus:ring-1 focus:ring-black focus:outline-none placeholder-gray-400 rounded-none bg-neutral-50"
            />
          </div>

          {defaultTab === 'files' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveModal('folder')}
                className="bg-neutral-100 hover:bg-neutral-200 transition-all text-[#000000] font-black uppercase text-[10px] py-2 px-3.5 tracking-wider flex items-center gap-1.5"
              >
                <FolderPlus className="w-3.5 h-3.5" /> New Folder
              </button>
              <button
                onClick={() => setActiveModal('file')}
                className="bg-black hover:bg-neutral-850 transition-all text-white font-black uppercase text-[10px] py-2 px-3.5 tracking-wider flex items-center gap-1.5"
              >
                <FilePlus className="w-3.5 h-3.5" /> INDEX FILE
              </button>
            </div>
          )}

          {defaultTab === 'notes' && (
            <button
              onClick={() => setActiveModal('note')}
              className="bg-black hover:bg-neutral-850 transition-all text-white font-black uppercase text-[10px] py-2 px-4 tracking-wider flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" /> New Note
            </button>
          )}

          {defaultTab === 'team-members' && (
            <button
              onClick={() => setActiveModal('member')}
              className="bg-black hover:bg-neutral-850 transition-all text-white font-black uppercase text-[10px] py-2 px-4 tracking-wider flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" /> REGISTER PERSONNEL
            </button>
          )}
        </div>
      </div>

      {/* Tab Contents */}
      <div id="fw-content-panel">
        {/* ==================== 1. MY FILES ==================== */}
        {defaultTab === 'files' && (
          <div className="space-y-6">
            {/* Filter by Folder Bar */}
            {folders.filter(f => f.type !== 'file').length > 0 && (
              <div className="bg-white border p-3 flex flex-wrap items-center gap-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400 mr-2">Filter by Folder:</span>
                <button
                  onClick={() => setSelectedFolderFilter('all')}
                  className={`text-[10px] font-extrabold uppercase px-3 py-1.5 transition-all ${
                    selectedFolderFilter === 'all' 
                      ? 'bg-black text-white' 
                      : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-600'
                  }`}
                >
                  All Files
                </button>
                {folders.filter(f => f.type !== 'file').map(f => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFolderFilter(f.id)}
                    className={`text-[10px] font-extrabold uppercase px-3 py-1.5 transition-all flex items-center gap-1 ${
                      selectedFolderFilter === f.id 
                        ? 'bg-black text-white' 
                        : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700'
                    }`}
                  >
                    <Folder className="w-3 h-3 fill-current opacity-70" /> {f.name}
                  </button>
                ))}
              </div>
            )}

            {/* Folders Overview Grid Section */}
            {selectedFolderFilter === 'all' && folders.filter(f => f.type !== 'file').length > 0 && (
              <div className="space-y-3">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-[#000000]">Directory Folders ({folders.filter(f => f.type !== 'file').length})</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {folders.filter(f => f.type !== 'file').map(folder => {
                    const filesInFolder = folders.filter(f => f.type === 'file' && f.folderId === folder.id).length;
                    return (
                      <div 
                        key={folder.id} 
                        className="bg-white border p-4 hover:shadow-md transition-all flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100">
                            <Folder className="w-5 h-5 fill-current" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wide text-neutral-800">{folder.name}</h4>
                            <p className="text-[9px] text-[#888888] font-semibold">{filesInFolder} indexed files</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button
                            onClick={() => handleEditItem(folder, 'folder')}
                            className="bg-neutral-50 hover:bg-neutral-100 text-neutral-400 hover:text-black p-1.5 transition-colors border border-transparent hover:border-neutral-200"
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => triggerDeleteConfirm(folder.id, 'folders', folder.name)}
                            className="bg-neutral-50 hover:bg-red-50 text-neutral-400 hover:text-red-500 transition-colors p-1.5 border border-transparent hover:border-red-100"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Loading/Empty State Files */}
            {loadingFolders ? (
              <div className="bg-white border p-12 text-center flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-[#000000]" />
                <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest">Reading Workspace Records...</p>
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="bg-white border p-12 text-center flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 bg-neutral-55 border text-neutral-400 flex items-center justify-center">
                  <HardDrive className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-black uppercase tracking-wider text-neutral-800">No Metadata Exist Yet</h4>
                  <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                    Configure catalogs and index directories to see folders and files inside your personalized secure sandbox.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveModal('folder')}
                    className="bg-neutral-100 hover:bg-neutral-200 text-black py-2.5 px-4 font-black uppercase text-[10px] tracking-wider"
                  >
                    Create First Folder
                  </button>
                  <button
                    onClick={() => setActiveModal('file')}
                    className="bg-black hover:bg-neutral-850 text-white py-2.5 px-4 font-black uppercase text-[10px] tracking-wider"
                  >
                    Index First File
                  </button>
                </div>
              </div>
            ) : (
              /* Files Table / Grid List */
              <div className="bg-white border overflow-hidden">
                <div className="bg-neutral-50 p-3.5 border-b flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#000000]">Document Files list</span>
                  <span className="text-[9px] font-mono text-[#888888] font-bold uppercase">{filteredFiles.length} item(s) found</span>
                </div>
                <div className="divide-y divide-neutral-100">
                  {filteredFiles.map(file => {
                    const parentFolder = folders.find(f => f.type !== 'file' && f.id === file.folderId);
                    return (
                      <div key={file.id} className="p-3.5 flex items-center justify-between hover:bg-neutral-50/65 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-neutral-100 text-neutral-700 border flex items-center justify-center">
                            <FileCode className="w-4 h-4 text-neutral-500" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-neutral-850 block">{file.name}</span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {parentFolder && (
                                <span className="inline-flex items-center gap-0.5 text-[8.5px] uppercase font-bold text-orange-600 border border-orange-100 bg-orange-50/50 px-1.5 rounded">
                                  <Folder className="w-2.5 h-2.5" /> {parentFolder.name}
                                </span>
                              )}
                              <span className="text-[9px] text-[#888888] flex items-center gap-1 font-semibold">
                                <Clock className="w-3 h-3" /> Indexed {new Date(file.createdAt || '').toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-right">
                          <div className="mr-2">
                            <span className="text-xs font-mono font-black text-[#000000]">{file.size}</span>
                            <p className="text-[8px] uppercase tracking-widest text-neutral-400 font-bold text-right">Metadata Size</p>
                          </div>
                          <button
                            onClick={() => handleEditItem(file, 'file')}
                            className="text-neutral-400 hover:text-black p-1.5 transition-colors hover:bg-neutral-100"
                          >
                            <PlusCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => triggerDeleteConfirm(file.id, 'folders', file.name)}
                            className="text-neutral-400 hover:text-red-500 p-1.5 transition-colors hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== 2. MY NOTES ==================== */}
        {defaultTab === 'notes' && (
          <div>
            {loadingNotes ? (
              <div className="bg-white border p-12 text-center flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-[#000000]" />
                <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest">Fetching personal notes...</p>
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="bg-white border p-12 text-center flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 bg-neutral-55 border text-neutral-400 flex items-center justify-center">
                  <FileText className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-black uppercase tracking-wider text-neutral-800">No Scratchpad Notes Exist</h4>
                  <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                    Persist your thoughts, queries, and team announcements securely inside Firebase's Cloud Firestore.
                  </p>
                </div>
                <button
                  onClick={() => setActiveModal('note')}
                  className="bg-black hover:bg-neutral-850 text-white py-2.5 px-4 font-black uppercase text-[10px] tracking-wider"
                >
                  Write Your First Note
                </button>
              </div>
            ) : (
              /* Notes Card Grid Layout */
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredNotes.map(note => (
                  <div key={note.id} className="bg-white border p-5 flex flex-col justify-between hover:shadow-md transition-all gap-4 relative group">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-sm font-sans font-black uppercase tracking-wide text-neutral-900 border-b pb-1 flex-1 leading-tight">{note.title}</h4>
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all">
                          <button
                            onClick={() => handleEditItem(note, 'note')}
                            className="text-neutral-400 hover:text-black transition-all p-1.5 shrink-0 hover:bg-neutral-50"
                          >
                            <PlusCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => triggerDeleteConfirm(note.id, 'note', note.title)}
                            className="text-neutral-400 hover:text-red-500 transition-all p-1.5 shrink-0 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-neutral-600 leading-relaxed whitespace-pre-wrap min-h-[60px] font-medium">
                        {note.content || <span className="text-[#BBBBBB] italic">No description provided</span>}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-[10px]">
                      <span className="text-neutral-400 flex items-center gap-1 font-semibold">
                        <Clock className="w-3.5 h-3.5" /> {new Date(note.createdAt).toLocaleDateString()}
                      </span>
                      <span className="text-[#888888] font-mono uppercase font-black tracking-wide text-[8.5px]">Firestore doc</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================== 3. TEAM MEMBERS ==================== */}
        {defaultTab === 'team-members' && (
          <div>
            {loadingMembers ? (
              <div className="bg-white border p-12 text-center flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-[#000000]" />
                <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest">Querying personnel registry...</p>
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="bg-white border p-12 text-center flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 bg-neutral-55 border text-neutral-400 flex items-center justify-center">
                  <Users className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-black uppercase tracking-wider text-neutral-800">No Team Members Registered</h4>
                  <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                    Record authorized team members and delegate project roles inside this secure user console.
                  </p>
                </div>
                <button
                  onClick={() => setActiveModal('member')}
                  className="bg-black hover:bg-neutral-850 text-white py-2.5 px-4 font-black uppercase text-[10px] tracking-wider"
                >
                  Register Team Personnel
                </button>
              </div>
            ) : (
              /* Personnel Registry Table */
              <div className="bg-white border overflow-hidden">
                <div className="bg-neutral-50 p-4 border-b">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#000000]">Team Members Registry list</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-neutral-50 text-[10px] font-sans font-black uppercase tracking-wider text-neutral-400 border-b">
                        <th className="p-4">Personnel Name</th>
                        <th className="p-4">Personnel Email</th>
                        <th className="p-4">Assigned Role</th>
                        <th className="p-4">Registered Date</th>
                        <th className="p-4 text-right">Administrative Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 text-xs">
                      {filteredMembers.map(member => (
                        <tr key={member.id} className="hover:bg-neutral-50/50 transition-all">
                          <td className="p-4 font-bold text-neutral-900 flex items-center gap-3">
                            <div className="w-8 h-8 bg-[#000000] text-white font-black flex items-center justify-center text-xs">
                              {(member.name || 'P').charAt(0).toUpperCase()}
                            </div>
                            <span>{member.name || 'Unnamed Personnel'}</span>
                          </td>
                          <td className="p-4 text-neutral-600 font-medium">
                            {member.email}
                          </td>
                          <td className="p-4">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-neutral-600 bg-neutral-100 py-1 px-2">
                              <Briefcase className="w-3 h-3" /> {member.role || 'Personnel'}
                            </span>
                          </td>
                          <td className="p-4 text-neutral-500 font-mono text-[10.5px]">
                            {new Date(member.createdAt).toLocaleString()}
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEditItem(member, 'member')}
                                className="text-neutral-400 hover:text-black transition-colors p-2 hover:bg-neutral-50"
                              >
                                <PlusCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => triggerDeleteConfirm(member.id, 'member', member.name)}
                                className="text-neutral-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 text-right h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================== */}
      {/* ==================== IN-APP MODAL REFS =================== */}
      {/* ========================================================== */}

      {/* 1. NEW FOLDER MODAL */}
      {activeModal === 'folder' && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-black max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <h3 className="text-sm font-sans font-black uppercase tracking-widest text-[#000000] border-b pb-2 flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-orange-500" /> {editingItem ? 'Update Directory Folder' : 'Create Directory Folder'}
            </h3>
            
            <form onSubmit={editingItem ? handleUpdateItem : handleCreateFolder} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 block">Folder Name</label>
                <input
                  type="text"
                  placeholder="e.g. MARKETING_CAMPAIGNS_2026"
                  required
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-neutral-300 text-xs text-black focus:ring-1 focus:ring-black focus:outline-none uppercase bg-neutral-50 rounded-none font-bold"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setFolderName('');
                    setActiveModal(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-neutral-500 hover:text-neutral-800 uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#000000] hover:bg-[#222222] text-white px-5 py-2 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2"
                >
                  {editingItem ? 'Update Folder' : 'Create Folder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. ADD FILE MODAL */}
      {activeModal === 'file' && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-black max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <h3 className="text-sm font-sans font-black uppercase tracking-widest text-[#000000] border-b pb-2 flex items-center gap-2">
              <FilePlus className="w-5 h-5 text-blue-500" /> {editingItem ? 'Update Directory File' : 'Index Directory File'}
            </h3>
            
            <form onSubmit={editingItem ? handleUpdateItem : handleAddFile} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 block">File Name / Extension</label>
                <input
                  type="text"
                  placeholder="e.g. pixel_attribution_tracker.config"
                  required
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-neutral-300 text-xs text-black focus:ring-1 focus:ring-black focus:outline-none bg-neutral-50 rounded-none font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 block">Virtual Size</label>
                  <input
                    type="text"
                    placeholder="e.g. 1.2 MB"
                    required
                    value={fileSize}
                    onChange={(e) => setFileSize(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-neutral-300 text-xs text-black focus:ring-1 focus:ring-black focus:outline-none bg-neutral-50 rounded-none font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 block">Folder Destination</label>
                  <select
                    value={fileFolderId}
                    onChange={(e) => setFileFolderId(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-neutral-300 text-xs text-black focus:ring-1 focus:ring-black focus:outline-none bg-neutral-50 rounded-none font-bold"
                  >
                    <option value="">Root Directory</option>
                    {folders.filter(f => f.type !== 'file').map(f => (
                      <option key={f.id} value={f.id}>{f.name.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setFileName('');
                    setFileSize('1.2 MB');
                    setFileFolderId('');
                    setActiveModal(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-neutral-500 hover:text-neutral-800 uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#000000] hover:bg-[#222222] text-white px-5 py-2 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2"
                >
                  {editingItem ? 'Update Metadata' : 'INDEX FILE'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. NEW NOTE MODAL */}
      {activeModal === 'note' && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-black max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <h3 className="text-sm font-sans font-black uppercase tracking-widest text-[#000000] border-b pb-2 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-purple-500" /> {editingItem ? 'Update Scratchpad Note' : 'Write Scratchpad Note'}
            </h3>
            
            <form onSubmit={editingItem ? handleUpdateItem : handleCreateNote} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 block">Note Title</label>
                <input
                  type="text"
                  placeholder="e.g. PIXEL AD BACKUP KEY"
                  required
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-neutral-300 text-xs text-black focus:ring-1 focus:ring-black focus:outline-none bg-neutral-50 rounded-none uppercase font-bold"
                />
              </div>

              <div className="space-y-1) ml-0.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 block">Detailed Content</label>
                <textarea
                  rows={4}
                  placeholder="Paste details, logs, credentials, or instructions..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-neutral-300 text-xs text-black focus:ring-1 focus:ring-black focus:outline-none bg-neutral-50 rounded-none font-medium h-[110px]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setNoteTitle('');
                    setNoteContent('');
                    setActiveModal(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-neutral-500 hover:text-neutral-800 uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#000000] hover:bg-[#222222] text-white px-5 py-2 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2"
                >
                  {editingItem ? 'Update Note' : 'SAVE NOTE'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. ADD MEMBER MODAL */}
      {activeModal === 'member' && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-black max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <h3 className="text-sm font-sans font-black uppercase tracking-widest text-[#000000] border-b pb-2 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-green-500" /> {editingItem ? 'Update Team Personnel' : 'Register Team Personnel'}
            </h3>
            
            <form onSubmit={editingItem ? handleUpdateItem : handleAddTeamMember} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 block">Personnel Name</label>
                <input
                  type="text"
                  placeholder="e.g. Adnan Sami"
                  required
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-neutral-300 text-xs text-black focus:ring-1 focus:ring-black focus:outline-none bg-neutral-50 rounded-none font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 block">Personnel Email</label>
                <input
                  type="email"
                  placeholder="e.g. adnan@enterprise.com"
                  required
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-neutral-300 text-xs text-black focus:ring-1 focus:ring-black focus:outline-none bg-neutral-50 rounded-none font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 block">Assigned Project Role</label>
                <select
                  value={memberRole}
                  onChange={(e) => setMemberRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-neutral-300 text-xs text-black focus:ring-1 focus:ring-black focus:outline-none bg-neutral-50 rounded-none font-bold"
                >
                  <option value="Lead Architect">Lead Architect</option>
                  <option value="Software Engineer">Software Engineer</option>
                  <option value="Database Controller">Database Controller</option>
                  <option value="Marketing Moderator">Marketing Moderator</option>
                  <option value="Security Officer">Security Officer</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMemberName('');
                    setMemberRole('Developer');
                    setActiveModal(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-neutral-500 hover:text-neutral-800 uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#000000] hover:bg-[#222222] text-white px-5 py-2 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2"
                >
                  {editingItem ? 'Update Personnel' : 'REGISTER PERSONNEL'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. SECURE IN-APP DELETE MODAL */}
      {activeModal === 'delete' && deleteTarget && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-neutral-900 max-w-sm w-full p-6 space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 bg-red-100 border border-red-200 text-red-650 flex items-center justify-center rounded-none mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            
            <div className="space-y-1.5">
              <h4 className="text-xs font-black uppercase tracking-widest text-[#000000]">Irreversible security action</h4>
              <p className="text-xs text-neutral-500 leading-relaxed font-semibold">
                Are you sure you want to permanently delete the {deleteTarget.type} <span className="font-extrabold text-black">"{deleteTarget.name}"</span>? This will wipe the document record completely from Firestore.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDeleteTarget(null);
                  setActiveModal(null);
                }}
                className="flex-1 border py-2 text-xs font-black uppercase tracking-widest text-neutral-500 hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black uppercase text-xs py-2 tracking-widest transition-all flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
