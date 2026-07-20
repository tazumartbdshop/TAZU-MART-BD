import React, { useState, useEffect } from 'react';
import { 
  ArrowUp, 
  ArrowDown, 
  Menu as MenuIcon, 
  RefreshCw, 
  Save, 
  Shield, 
  Users, 
  ChevronRight,
  ChevronDown,
  AlertCircle
} from 'lucide-react';
import { defaultNavItems } from '../../lib/adminMenus';
import { useMenuSortStore } from '../../store/useMenuSortStore';
import { useModeratorStore } from '../../store/useModeratorStore';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminMenuManagement() {
  // Store actions & states
  const { 
    mainMenuOrder, 
    submenuOrders, 
    memberOrder, 
    renamedMenus = {}, 
    deletedMenus = [], 
    expandedMenus = {}, 
    saveOrders, 
    resetToDefault 
  } = useMenuSortStore();
  const { moderators } = useModeratorStore();

  // Local state for interactive editing
  const [localMainMenu, setLocalMainMenu] = useState<string[]>([]);
  const [localSubmenus, setLocalSubmenus] = useState<Record<string, string[]>>({});
  const [localMembers, setLocalMembers] = useState<string[]>([]);
  const [localDeletedMenus, setLocalDeletedMenus] = useState<string[]>([]);
  const [localRenamedMenus, setLocalRenamedMenus] = useState<Record<string, string>>({});

  // Expanded submenu states (linked directly with local change and store)
  const [localExpandedMenus, setLocalExpandedMenus] = useState<Record<string, boolean>>({});

  // Modals for Actions
  const [pendingDeleteMenu, setPendingDeleteMenu] = useState<string | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const [pendingEditMenu, setPendingEditMenu] = useState<string | null>(null);
  const [editNewName, setEditNewName] = useState('');

  // Notification states
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Initialize local state from store or defaults
  useEffect(() => {
    // Sync deleted list, renamed map, and expanded system
    const activeDeleted = deletedMenus || [];
    const activeRenamed = renamedMenus || {};
    const activeExpanded = expandedMenus || {};

    setLocalDeletedMenus(activeDeleted);
    setLocalRenamedMenus(activeRenamed);
    setLocalExpandedMenus(activeExpanded);

    // 1. Filter out deleted menus from initial main menu names
    const defaultMainMenuNames = defaultNavItems.map(item => item.name);
    const nonDeletedMainMenuNames = defaultMainMenuNames.filter(name => !activeDeleted.includes(name));

    if (mainMenuOrder && mainMenuOrder.length > 0) {
      // Keep only saved items that are not deleted
      const activeSaved = mainMenuOrder.filter(name => defaultMainMenuNames.includes(name) && !activeDeleted.includes(name));
      const missing = nonDeletedMainMenuNames.filter(name => !activeSaved.includes(name));
      setLocalMainMenu([...activeSaved, ...missing]);
    } else {
      setLocalMainMenu(nonDeletedMainMenuNames);
    }

    // 2. Submenus Order inside localState
    const submaps: Record<string, string[]> = {};
    defaultNavItems.forEach(item => {
      if (item.subItems && item.subItems.length > 0) {
        const defaultSubs = item.subItems.map(sub => sub.name);
        const savedSubs = submenuOrders[item.name];
        if (savedSubs && savedSubs.length > 0) {
          const existing = savedSubs.filter(name => defaultSubs.includes(name));
          const missing = defaultSubs.filter(name => !savedSubs.includes(name));
          submaps[item.name] = [...existing, ...missing];
        } else {
          submaps[item.name] = defaultSubs;
        }
      }
    });
    setLocalSubmenus(submaps);

    // 3. Members Order
    const modIds = moderators.map(m => m.id);
    if (memberOrder && memberOrder.length > 0) {
      const existing = memberOrder.filter(id => modIds.includes(id));
      const missing = modIds.filter(id => !memberOrder.includes(id));
      setLocalMembers([...existing, ...missing]);
    } else {
      setLocalMembers(modIds);
    }
  }, [mainMenuOrder, submenuOrders, memberOrder, moderators, deletedMenus, renamedMenus, expandedMenus]);

  // Handle Drag Over (HTML5 Drag and Drop)
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Toggle Submenu expand inline and instantly save to local state
  const toggleExpandMenu = (name: string) => {
    setLocalExpandedMenus(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  // 1. Reordering Main Menu Items
  const moveMainMenuItem = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= localMainMenu.length) return;
    const updated = [...localMainMenu];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    setLocalMainMenu(updated);
  };

  const [draggedMainIdx, setDraggedMainIdx] = useState<number | null>(null);

  const handleMainDragStart = (idx: number) => {
    setDraggedMainIdx(idx);
  };

  const handleMainDrop = (toIdx: number) => {
    if (draggedMainIdx !== null && draggedMainIdx !== toIdx) {
      moveMainMenuItem(draggedMainIdx, toIdx);
    }
    setDraggedMainIdx(null);
  };

  // 2. Reordering Inline Submenu Items Directly
  const moveSubmenuInline = (parentName: string, fromIdx: number, toIdx: number) => {
    const list = localSubmenus[parentName];
    if (!list || toIdx < 0 || toIdx >= list.length) return;
    const updatedList = [...list];
    const [moved] = updatedList.splice(fromIdx, 1);
    updatedList.splice(toIdx, 0, moved);
    
    setLocalSubmenus(prev => ({
      ...prev,
      [parentName]: updatedList
    }));
  };

  // 3. Reordering Members / Roles
  const moveMemberItem = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= localMembers.length) return;
    const updated = [...localMembers];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    setLocalMembers(updated);
  };

  const [draggedMemberIdx, setDraggedMemberIdx] = useState<number | null>(null);

  const handleMemberDragStart = (idx: number) => {
    setDraggedMemberIdx(idx);
  };

  const handleMemberDrop = (toIdx: number) => {
    if (draggedMemberIdx !== null && draggedMemberIdx !== toIdx) {
      moveMemberItem(draggedMemberIdx, toIdx);
    }
    setDraggedMemberIdx(null);
  };

  const handleDragEnd = () => {
    setDraggedMainIdx(null);
    setDraggedMemberIdx(null);
  };

  // Perform secure delete action
  const handleConfirmDelete = (nameToDelete: string) => {
    const nextDeleted = [...localDeletedMenus, nameToDelete];
    setLocalDeletedMenus(nextDeleted);

    // Filter out from local display state immediately
    setLocalMainMenu(prev => prev.filter(name => name !== nameToDelete));
    
    // Reset confirmation states
    setPendingDeleteMenu(null);
    setDeleteConfirmText('');
  };

  // Save changes to persistent Store
  const handleSave = () => {
    // 1. Save standard order configurations for active menus
    saveOrders(localMainMenu, localSubmenus, localMembers);

    // 2. Perform direct write to Zustand persist state for metadata layers
    useMenuSortStore.setState({
      renamedMenus: localRenamedMenus,
      deletedMenus: localDeletedMenus,
      expandedMenus: localExpandedMenus
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Reset to original defaults
  const handleReset = () => {
    resetToDefault();

    // Reset local cache parameters
    setLocalDeletedMenus([]);
    setLocalRenamedMenus({});
    setLocalExpandedMenus({});
    const defaultMainMenuNames = defaultNavItems.map(item => item.name);
    setLocalMainMenu(defaultMainMenuNames);

    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-32 relative select-none">
      
      {/* Dynamic Action Alerts */}
      <AnimatePresence>
        {saveSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 right-8 z-55 bg-[#000000] text-white border border-zinc-805 px-6 py-4 rounded-none shadow-2xl flex items-center gap-3"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-black uppercase tracking-widest">MENU LAYOUTS SAVED SUCCESSFULLY</span>
          </motion.div>
        )}

        {resetSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 right-8 z-55 bg-[#000000] text-white border border-zinc-805 px-6 py-4 rounded-none shadow-2xl flex items-center gap-3"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            <span className="text-xs font-black uppercase tracking-widest">SYSTEM SCHEMES RESET TO DEFAULT</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ⚠️ DELETE CONFIRMATION POPUP / MODAL - Security System */}
      <AnimatePresence>
        {pendingDeleteMenu && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-zinc-200 p-6 md:p-8 max-w-md w-full rounded-none shadow-2xl space-y-6"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-zinc-950 uppercase tracking-widest">DELETE MENU BAR</h4>
                  <p className="text-xs text-red-600 font-extrabold uppercase tracking-wider">
                    You are about to permanently remove this menu bar.
                  </p>
                </div>
              </div>
              
              <p className="text-xs text-zinc-650 leading-relaxed font-semibold">
                This will hide <span className="font-extrabold text-zinc-950">"{localRenamedMenus[pendingDeleteMenu] || pendingDeleteMenu}"</span>, all connected submenus, and disable active routing visibility. To proceed, please type the exact menu name below:
              </p>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block">Type exact menu name to confirm deletion</label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder={localRenamedMenus[pendingDeleteMenu] || pendingDeleteMenu}
                  className="w-full px-4 py-3 border border-zinc-200 bg-white placeholder-zinc-300 font-bold text-xs text-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-950 rounded-none shadow-sm"
                />
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleConfirmDelete(pendingDeleteMenu)}
                  disabled={deleteConfirmText !== (localRenamedMenus[pendingDeleteMenu] || pendingDeleteMenu)}
                  className="w-full py-3.5 bg-red-600 hover:bg-red-700 disabled:bg-zinc-100 disabled:text-zinc-400 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-widest transition-all duration-300 rounded-none text-center shadow-md"
                >
                  [ DELETE { (localRenamedMenus[pendingDeleteMenu] || pendingDeleteMenu).toUpperCase() } ]
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setPendingDeleteMenu(null);
                    setDeleteConfirmText('');
                  }}
                  className="w-full py-3 bg-white border border-zinc-300 hover:border-zinc-950 text-zinc-950 font-black text-xs uppercase tracking-widest transition-all duration-300 rounded-none text-center"
                >
                  CANCEL
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ✏️ EDIT MENU Rename Modal */}
      <AnimatePresence>
        {pendingEditMenu && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-zinc-200 p-6 md:p-8 max-w-sm w-full rounded-none shadow-2xl space-y-6"
            >
              <div className="space-y-1">
                <h4 className="text-sm font-black text-zinc-950 uppercase tracking-widest">EDIT MENU BAR NAME</h4>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                  Update display labels layer without resetting permissions or access
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-zinc-50 p-3 border border-zinc-150">
                  <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block">Current Menu Name</span>
                  <p className="text-xs font-bold text-zinc-700">{localRenamedMenus[pendingEditMenu] || pendingEditMenu}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block">New Menu Name Input</label>
                  <input
                    type="text"
                    value={editNewName}
                    onChange={(e) => setEditNewName(e.target.value)}
                    placeholder="Enter new menu name"
                    className="w-full px-4 py-3 border border-zinc-200 bg-white font-bold text-xs text-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-950 rounded-none shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setPendingEditMenu(null);
                    setEditNewName('');
                  }}
                  className="py-2.5 bg-white border border-zinc-350 hover:border-zinc-950 text-zinc-900 font-extrabold text-xs uppercase tracking-widest transition-all rounded-none text-center"
                >
                  CANCEL
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (editNewName.trim()) {
                      setLocalRenamedMenus(prev => ({
                        ...prev,
                        [pendingEditMenu]: editNewName.trim()
                      }));
                      setPendingEditMenu(null);
                      setEditNewName('');
                    }
                  }}
                  disabled={!editNewName.trim()}
                  className="py-2.5 bg-black hover:bg-zinc-900 disabled:opacity-40 text-white font-black text-xs uppercase tracking-widest transition-all rounded-none text-center shadow-md"
                >
                  SAVE CHANGES
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Top Header Title Panel */}
      <div className="bg-white border border-zinc-200/80 p-6 sm:p-8 rounded-none shadow-[0_4px_25px_rgb(0,0,0,0.02)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-[9px] font-black tracking-widest bg-zinc-950 text-white uppercase rounded-none leading-none">SYSTEM CONTROL</span>
            <h2 className="text-xl font-bold font-sans tracking-tight text-zinc-950">ADMIN MENU MANAGEMENT</h2>
          </div>
          <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">
            Organize main navigation menus, drag positionings & inline submenu structures
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            type="button"
            onClick={handleReset}
            className="px-4 py-2.5 bg-white border border-zinc-350 hover:border-zinc-950 text-zinc-950 font-black text-xs uppercase tracking-wider transition-all duration-300 rounded-none flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4 text-zinc-950 animate-none" />
            RESET DEFAULT ORDER
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* SECTION 1: MAIN SIDEBAR MENUS (Expanded to span 8 representing primary area) */}
        <div className="lg:col-span-8 bg-white border border-zinc-200/80 rounded-none shadow-[0_4px_20px_rgb(0,0,0,0.015)] p-6 space-y-6 flex flex-col">
          <div className="space-y-1 border-b border-zinc-100 pb-4">
            <h3 className="text-xs font-black text-zinc-950 uppercase tracking-widest flex items-center gap-2">
              <span>1️⃣ Navigation Menus Structure Only</span>
            </h3>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider leading-relaxed">
              Edit labels, delete sections permanently, drag main categories, or click expand (☰) to reorder submenus directly!
            </p>
          </div>

          <div className="space-y-3.5 flex-grow select-none">
            {localMainMenu.map((name, idx) => {
              const originalItem = defaultNavItems.find(item => item.name === name);
              if (!originalItem) return null;
              const IconComp = originalItem.icon || MenuIcon;
              const isDragged = draggedMainIdx === idx;
              const displayName = localRenamedMenus[name] || name;
              const hasSubmenu = originalItem.subItems && originalItem.subItems.length > 0;
              const isExpanded = !!localExpandedMenus[name];

              return (
                <div key={name} className="flex flex-col space-y-1.5 msg-row group">
                  
                  {/* Each Menu Category Row Layout: [EDIT] [DELETE] [☰ DRAG/CLICK] [ICON] [NAME] */}
                  <div 
                    draggable
                    onDragStart={() => handleMainDragStart(idx)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleMainDrop(idx)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center justify-between p-3 border transition-all rounded-none ${
                      isDragged 
                        ? 'border-zinc-950 bg-zinc-50/50 shadow-md scale-[0.99] opacity-75' 
                        : 'border-zinc-150 bg-white hover:border-zinc-350 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      
                      {/* ACTION: Edit rename */}
                      <button
                        type="button"
                        onClick={() => {
                          setPendingEditMenu(name);
                          setEditNewName(displayName);
                        }}
                        title="Edit label"
                        className="w-8 h-8 flex items-center justify-center border border-zinc-200 text-zinc-600 hover:text-black hover:bg-zinc-50 transition-colors shrink-0 text-xs rounded-none"
                      >
                        ✏️
                      </button>

                      {/* ACTION: Delete Secure layer */}
                      <button
                        type="button"
                        onClick={() => {
                          setPendingDeleteMenu(name);
                        }}
                        title="Delete menu list"
                        className="w-8 h-8 flex items-center justify-center border border-zinc-200 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200 transition-colors shrink-0 text-xs rounded-none"
                      >
                        🗑
                      </button>

                      {/* ACTION: Drag handle - also expanded toggler */}
                      <button 
                        type="button"
                        onClick={() => toggleExpandMenu(name)}
                        title="Drag category row / Click to expand submenus inline"
                        className="w-12 h-8 flex items-center justify-center gap-1.5 border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 cursor-grab active:cursor-grabbing text-zinc-500 hover:text-zinc-950 transition-colors shrink-0 rounded-none text-xs"
                      >
                        <span className="font-bold">☰</span>
                        {hasSubmenu && (
                          <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? 'rotate-180' : 'rotate-0'}`} />
                        )}
                      </button>

                      {/* ICON & DISPLAY REMAINS */}
                      <div className="flex items-center gap-2 pl-1 truncate min-w-0">
                        <div className="w-7 h-7 bg-zinc-100 flex items-center justify-center shrink-0">
                          <IconComp className="w-4 h-4 text-zinc-700" />
                        </div>
                        <span className="text-xs font-black text-zinc-900 tracking-wide truncate">{displayName}</span>
                      </div>
                    </div>

                    {/* Up/Down helpers for click reordering of categories */}
                    <div className="flex items-center gap-1 shrink-0 pl-1">
                      <button 
                        type="button"
                        onClick={() => moveMainMenuItem(idx, idx - 1)}
                        disabled={idx === 0}
                        className="p-1 hover:bg-zinc-100 rounded text-zinc-400 hover:text-zinc-950 disabled:opacity-20 disabled:pointer-events-none transition-all"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        type="button"
                        onClick={() => moveMainMenuItem(idx, idx + 1)}
                        disabled={idx === localMainMenu.length - 1}
                        className="p-1 hover:bg-zinc-100 rounded text-zinc-400 hover:text-zinc-950 disabled:opacity-20 disabled:pointer-events-none transition-all"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* INLINE SUBMENU REORDER SYSTEM DROPDOWN WITH COMPACT LAYOUT */}
                  <AnimatePresence initial={false}>
                    {hasSubmenu && isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden bg-zinc-50 border border-zinc-200/60 shadow-inner ml-6 pl-4 pr-3 py-3 rounded-md space-y-2 border-l-4 border-l-zinc-400"
                      >
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-1">
                          Inline Subitems Structure:
                        </span>
                        
                        {localSubmenus[name] && localSubmenus[name].length > 0 ? (
                          localSubmenus[name].map((subName, subIdx) => {
                            const subMeta = originalItem.subItems?.find(sub => sub.name === subName);
                            const SubIcon = subMeta?.icon || ChevronRight;
                            return (
                              <div 
                                key={subName} 
                                className="flex items-center justify-between py-2 px-3 bg-white border border-zinc-200 shadow-sm text-xs hover:border-zinc-350 transition-all rounded-[4px]"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-zinc-400 text-xs font-mono select-none">☰</span>
                                  <div className="w-5 h-5 bg-zinc-50 flex items-center justify-center shrink-0">
                                    <SubIcon className="w-3.5 h-3.5 text-zinc-500" />
                                  </div>
                                  <span className="font-extrabold text-zinc-800 text-[11px] tracking-wide">
                                    {subName}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0 select-none">
                                  <button
                                    type="button"
                                    onClick={() => moveSubmenuInline(name, subIdx, subIdx - 1)}
                                    disabled={subIdx === 0}
                                    className="px-2 py-1 bg-zinc-50 border border-zinc-200 hover:bg-zinc-100 hover:border-zinc-350 disabled:opacity-20 disabled:pointer-events-none text-[11px] font-black text-zinc-700 hover:text-[#000] tracking-wide transition-all rounded-xs"
                                    title="Move Submenu Up"
                                  >
                                    ↑ Move Up
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => moveSubmenuInline(name, subIdx, subIdx + 1)}
                                    disabled={subIdx === (localSubmenus[name]?.length || 0) - 1}
                                    className="px-2 py-1 bg-zinc-50 border border-zinc-200 hover:bg-zinc-100 hover:border-zinc-350 disabled:opacity-20 disabled:pointer-events-none text-[11px] font-black text-zinc-700 hover:text-[#000] tracking-wide transition-all rounded-xs"
                                    title="Move Submenu Down"
                                  >
                                    ↓ Move Down
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block italic py-1 pl-1">
                            No active menu options inside this module
                          </span>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}

            {localMainMenu.length === 0 && (
              <div className="text-center py-16 text-zinc-400 text-[10px] font-bold uppercase tracking-widest border border-dashed border-zinc-200">
                All navigation menus temporary hidden/deleted
              </div>
            )}
          </div>
        </div>

        {/* SECTION 2 (FORMERLY SECTION 3): MEMBERS / ROLES (Now taking the remaining span 4 nicely) */}
        <div className="lg:col-span-4 bg-white border border-zinc-200/80 rounded-none shadow-[0_4px_20px_rgb(0,0,0,0.015)] p-6 space-y-6 flex flex-col">
          <div className="space-y-1 border-b border-zinc-100 pb-4">
            <h3 className="text-xs font-black text-zinc-950 uppercase tracking-widest flex items-center gap-2">
              <span>2️⃣ Moderator Members</span>
            </h3>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider leading-relaxed">
              Rearrange the serial sequence representation of active personnel.
            </p>
          </div>

          <div className="space-y-3 flex-grow select-none">
            {localMembers.map((id, idx) => {
              const mod = moderators.find(m => m.id === id);
              if (!mod) return null;
              const isDragged = draggedMemberIdx === idx;

              return (
                <div 
                  key={id}
                  draggable
                  onDragStart={() => handleMemberDragStart(idx)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleMemberDrop(idx)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center justify-between p-3 border transition-all rounded-none ${
                    isDragged 
                      ? 'border-zinc-950 bg-zinc-50/50 shadow-md scale-[0.99] opacity-75' 
                      : 'border-zinc-150 bg-white hover:border-zinc-350 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="cursor-grab active:cursor-grabbing text-zinc-400 hover:text-zinc-950 transition-colors p-1">
                      <MenuIcon className="w-3.5 h-3.5" />
                    </span>
                    <div className="w-7 h-7 bg-zinc-100/50 border border-zinc-250 flex items-center justify-center rounded">
                      <Users className="w-3.5 h-3.5 text-zinc-700" />
                    </div>
                    <div className="truncate">
                      <span className="text-xs font-black text-zinc-900 tracking-wide block leading-none truncate">{mod.name}</span>
                      <span className="text-[9px] text-[#22c55e] font-black uppercase tracking-widest block mt-1.5">{mod.status}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button 
                      type="button"
                      onClick={() => moveMemberItem(idx, idx - 1)}
                      disabled={idx === 0}
                      className="p-1 hover:bg-zinc-100 rounded text-zinc-400 hover:text-zinc-950 disabled:opacity-20 disabled:pointer-events-none transition-all"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      type="button"
                      onClick={() => moveMemberItem(idx, idx + 1)}
                      disabled={idx === localMembers.length - 1}
                      className="p-1 hover:bg-zinc-100 rounded text-zinc-400 hover:text-zinc-950 disabled:opacity-20 disabled:pointer-events-none transition-all"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {localMembers.length === 0 && (
              <div className="text-center py-12 text-zinc-400 text-[10px] font-bold uppercase tracking-widest border border-dashed border-zinc-200">
                No active personnel loaded
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Sticky bottom system save deck bar */}
      <div className="fixed bottom-0 left-0 right-0 md:left-64 lg:left-72 bg-white border-t border-zinc-200 py-4 px-6 sm:px-8 flex justify-between items-center z-40 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
        <div>
          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">WORKSPACE REORDER ENGINE</span>
          <p className="text-xs font-bold text-zinc-950 flex items-center gap-1.5 mt-0.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse shrink-0" />
            Configuring Live System Layouts
          </p>
        </div>
        
        <button
          type="button"
          onClick={handleSave}
          className="px-6 py-3 bg-[#000000] hover:bg-zinc-900 text-white font-black text-xs uppercase tracking-widest transition-all duration-300 rounded-none flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 pointer-events-auto cursor-pointer"
        >
          <Save className="w-4 h-4" />
          SAVE MENU ORDER
        </button>
      </div>

    </div>
  );
}
