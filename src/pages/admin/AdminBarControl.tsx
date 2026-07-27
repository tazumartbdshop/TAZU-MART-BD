import React from 'react';
import { 
  GripVertical, 
  Edit, 
  Trash2, 
  ChevronDown, 
  ChevronRight,
  Zap,
  Sliders,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMenuSortStore } from '../../store/useMenuSortStore';
import { defaultNavItems } from '../../lib/adminMenus';

export default function AdminBarControl() {
  const { 
    mainMenuOrder, 
    submenuOrders, 
    renamedMenus = {}, 
    deletedMenus = [],
    updateAllSettings,
    resetToDefault
  } = useMenuSortStore();

  const [localMainMenu, setLocalMainMenu] = React.useState<string[]>([]);
  const [localSubmenus, setLocalSubmenus] = React.useState<Record<string, string[]>>({});
  const [localRenamed, setLocalRenamed] = React.useState<Record<string, string>>({});
  const [localDeleted, setLocalDeleted] = React.useState<string[]>([]);
  
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});
  const [editingKey, setEditingKey] = React.useState<string | null>(null);
  const [editValue, setEditValue] = React.useState('');

  const [draggingIdx, setDraggingIdx] = React.useState<number | null>(null);
  const [draggingSub, setDraggingSub] = React.useState<{parent: string, idx: number} | null>(null);
  const [dragOverIdx, setDragOverIdx] = React.useState<number | null>(null);
  const [dragOverSub, setDragOverSub] = React.useState<{parent: string, idx: number} | null>(null);

  const syncFromStore = React.useCallback(() => {
    const defaultNames = defaultNavItems.map(i => i.name);
    const allNames = [...defaultNames];
    
    let sorted = [...allNames];
    if (mainMenuOrder) {
      sorted.sort((a, b) => {
        const idxA = mainMenuOrder.indexOf(a);
        const idxB = mainMenuOrder.indexOf(b);
        if (idxA === -1 && idxB === -1) return 0;
        if (idxA === -1) return 1;
        if (idxB === -1) return -1;
        return idxA - idxB;
      });
    }
    setLocalMainMenu(sorted);

    const subs: Record<string, string[]> = {};
    defaultNavItems.forEach(item => {
      if (item.subItems) {
        const dNames = item.subItems.map(s => s.name);
        let sSorted = [...dNames];
        if (submenuOrders[item.name]) {
          sSorted.sort((a,b) => {
             const iA = submenuOrders[item.name].indexOf(a);
             const iB = submenuOrders[item.name].indexOf(b);
             if (iA === -1 && iB === -1) return 0;
             if (iA === -1) return 1;
             if (iB === -1) return -1;
             return iA - iB;
          });
        }
        subs[item.name] = sSorted;
      }
    });
    setLocalSubmenus(subs);
    setLocalRenamed(renamedMenus);
    setLocalDeleted(deletedMenus);
  }, [mainMenuOrder, submenuOrders, renamedMenus, deletedMenus]);

  React.useEffect(() => {
    syncFromStore();
  }, [syncFromStore]);

  const handleGlobalSave = () => {
    updateAllSettings(localMainMenu, localSubmenus, localRenamed, localDeleted);
    // Visual success feedback
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-8 right-8 bg-zinc-950 text-white px-6 py-3 text-[11px] font-black uppercase tracking-widest shadow-2xl animate-in slide-in-from-bottom-4 duration-300 z-50';
    toast.innerText = 'STRUCTURE SAVED TO TERMINAL';
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('animate-out', 'fade-out', 'slide-out-to-bottom-4');
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  };

  const handleReset = () => {
    if (window.confirm('Discard all unsaved changes and return to last saved layout?')) {
      syncFromStore();
      
      const toast = document.createElement('div');
      toast.className = 'fixed bottom-8 right-8 bg-amber-600 text-white px-6 py-3 text-[11px] font-black uppercase tracking-widest shadow-2xl animate-in slide-in-from-bottom-4 duration-300 z-50';
      toast.innerText = 'REVERTED TO LAST SAVED STATE';
      document.body.appendChild(toast);
      setTimeout(() => {
        toast.classList.add('animate-out', 'fade-out', 'slide-out-to-bottom-4');
        setTimeout(() => toast.remove(), 300);
      }, 2000);
    }
  };

  const moveItem = (fromIdx: number, toIdx: number) => {
    const newItems = [...localMainMenu];
    const [removed] = newItems.splice(fromIdx, 1);
    newItems.splice(toIdx, 0, removed);
    setLocalMainMenu(newItems);
  };

  const moveSubItem = (parent: string, fromIdx: number, toIdx: number) => {
    const newSubs = {...localSubmenus};
    const list = [...(newSubs[parent] || [])];
    const [removed] = list.splice(fromIdx, 1);
    list.splice(toIdx, 0, removed);
    newSubs[parent] = list;
    setLocalSubmenus(newSubs);
  };

  const toggleVisibilityLocal = (name: string) => {
    const isHidden = localDeleted.includes(name);
    if (!isHidden) {
      if (window.confirm(`Hide "${localRenamed[name] || name.split(':').pop()}" from menu?`)) {
        setLocalDeleted(prev => [...prev, name]);
      }
    } else {
      setLocalDeleted(prev => prev.filter(n => n !== name));
    }
  };

  const startEdit = (name: string) => {
    setEditingKey(name);
    setEditValue(localRenamed[name] || name.split(':').pop() || '');
  };

  const confirmEdit = () => {
    if (editingKey && editValue.trim()) {
      setLocalRenamed(prev => ({
        ...prev,
        [editingKey]: editValue.trim()
      }));
    }
    setEditingKey(null);
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in font-sans">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-black uppercase tracking-widest text-[#000000]">Bar Control</h2>
        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Manage sidebar visibility, labels and sort order</p>
      </div>

      <div className="border border-zinc-150 divide-y divide-zinc-100 bg-white shadow-sm overflow-hidden rounded-none">
        {localMainMenu.map((name, idx) => {
          const isEditing = editingKey === name;
          const hasSubs = (localSubmenus[name]?.length || 0) > 0;
          const isExpanded = !!expanded[name];
          const isHidden = localDeleted.includes(name);
          const displayName = localRenamed[name] || name;

          return (
            <div key={name} className="flex flex-col">
              <div 
                onDragOver={(e) => {
                  e.preventDefault();
                  if (draggingIdx !== null && draggingIdx !== idx) {
                    setDragOverIdx(idx);
                  }
                }}
                onDragEnter={() => {
                  if (draggingIdx !== null && draggingIdx !== idx) {
                     setDragOverIdx(idx);
                  }
                }}
                onDragLeave={() => setDragOverIdx(null)}
                onDrop={() => {
                  if (draggingIdx !== null) {
                    moveItem(draggingIdx, idx);
                    setDraggingIdx(null);
                    setDragOverIdx(null);
                  }
                }}
                className={`flex items-center justify-between p-3.5 group hover:bg-neutral-50 transition-all border-l-2 ${
                  draggingIdx === idx ? 'opacity-30 bg-zinc-50' : 
                  dragOverIdx === idx ? 'border-[#000000] bg-zinc-100 scale-[1.01]' : 'border-transparent'
                } ${isHidden ? 'bg-zinc-50/50' : ''}`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div 
                    draggable
                    onDragStart={(e) => {
                      setDraggingIdx(idx);
                    }}
                    className="cursor-grab active:cursor-grabbing text-zinc-300 group-hover:text-zinc-500 transition-colors p-1"
                  >
                    <GripVertical className="w-5 h-5" />
                  </div>
                  
                  {hasSubs && (
                    <button onClick={(e) => { e.stopPropagation(); setExpanded(p => ({...p, [name]: !p[name]})); }} className="text-zinc-400 hover:text-black">
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                  )}

                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <input 
                        autoFocus
                        className="text-xs font-bold uppercase tracking-wider bg-white border-2 border-zinc-950 px-2 py-1 outline-none min-w-[200px]"
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        onBlur={confirmEdit}
                        onKeyDown={e => e.key === 'Enter' && confirmEdit()}
                      />
                    </div>
                  ) : (
                    <span 
                      onClick={() => hasSubs && setExpanded(p => ({...p, [name]: !p[name]}))}
                      className={`text-[13px] font-black uppercase tracking-widest ${isHidden ? 'text-zinc-400' : 'text-zinc-900'} ${hasSubs ? 'cursor-pointer' : ''}`}
                    >
                      {displayName}
                      {isHidden && <span className="ml-2 text-[8px] px-1 py-0.5 bg-zinc-200 text-zinc-500 rounded">HIDDEN</span>}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                  <button 
                    onClick={() => toggleVisibilityLocal(name)} 
                    title={isHidden ? "Show in Sidebar" : "Hide from Sidebar"}
                    className={`w-8 h-8 flex items-center justify-center transition-all rounded-none ${isHidden ? 'text-amber-600 hover:bg-amber-50' : 'text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100'}`}
                  >
                    {isHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button onClick={() => startEdit(name)} className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100 transition-all rounded-none">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => toggleVisibilityLocal(name)} className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-all rounded-none">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Submenus */}
              <AnimatePresence initial={false}>
                {isExpanded && hasSubs && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="bg-neutral-50 border-l-[3px] border-zinc-200 ml-8 mb-2 space-y-1 overflow-hidden"
                  >
                    <div className="py-2 pr-3">
                      {localSubmenus[name].map((sName, sIdx) => {
                        const subKey = `${name}:${sName}`;
                        const isSubEditing = editingKey === subKey;
                        const subDisplayName = localRenamed[subKey] || sName;
                        const isSubHidden = localDeleted.includes(subKey);
                        return (
                          <div 
                            key={sName}
                            onDragOver={(e) => {
                              e.preventDefault();
                              if (draggingSub && draggingSub.parent === name && draggingSub.idx !== sIdx) {
                                setDragOverSub({ parent: name, idx: sIdx });
                              }
                            }}
                            onDragEnter={() => {
                              if (draggingSub && draggingSub.parent === name && draggingSub.idx !== sIdx) {
                                setDragOverSub({ parent: name, idx: sIdx });
                              }
                            }}
                            onDragLeave={() => setDragOverSub(null)}
                            onDrop={() => {
                              if (draggingSub && draggingSub.parent === name) {
                                moveSubItem(name, draggingSub.idx, sIdx);
                                setDraggingSub(null);
                                setDragOverSub(null);
                              }
                            }}
                            className={`flex items-center justify-between p-2 pl-3 group/sub transition-all border-l-2 ${
                              dragOverSub?.parent === name && dragOverSub.idx === sIdx ? 'border-[#000000] bg-white translate-x-1' : 'border-transparent'
                            } ${draggingSub?.parent === name && draggingSub.idx === sIdx ? 'opacity-30 bg-zinc-100' : 'hover:bg-white'} ${isSubHidden ? 'bg-zinc-100/50' : ''}`}
                          >
                            <div className="flex items-center gap-2 overflow-hidden">
                               <div 
                                 draggable
                                 onDragStart={() => setDraggingSub({parent: name, idx: sIdx})}
                                 className="cursor-grab active:cursor-grabbing text-zinc-300 group-hover/sub:text-zinc-500 scale-90 p-1"
                               >
                                  <GripVertical className="w-4 h-4" />
                               </div>
                               {isSubEditing ? (
                                  <input 
                                    autoFocus
                                    className="text-[11px] font-bold bg-white border-2 border-zinc-950 px-1.5 py-0.5 outline-none min-w-[150px]"
                                    value={editValue}
                                    onChange={e => setEditValue(e.target.value)}
                                    onBlur={confirmEdit}
                                    onKeyDown={e => e.key === 'Enter' && confirmEdit()}
                                  />
                               ) : (
                                  <span className={`text-[11px] font-bold truncate uppercase tracking-widest ${isSubHidden ? 'text-zinc-400' : 'text-zinc-600'}`}>
                                    {subDisplayName}
                                  </span>
                                )}
                            </div>
                            
                            <div className="flex items-center gap-0.5 opacity-0 group-hover/sub:opacity-100 transition-all shrink-0">
                              <button onClick={() => toggleVisibilityLocal(subKey)} className="w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-zinc-950 transition-all">
                                {isSubHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                              <button onClick={() => startEdit(subKey)} className="w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-zinc-950 transition-all">
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => toggleVisibilityLocal(subKey)} className="w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-red-500 transition-all">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
      
      <div className="mt-8 p-6 bg-zinc-50 border border-zinc-200 flex items-center justify-between">
         <div>
            <p className="text-[10px] font-black text-zinc-800 uppercase tracking-widest flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-500" /> SYSTEM LINK SYNC ACTIVE
            </p>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-1">
              Click "Save Changes" to apply your structure to the sidebar.
            </p>
         </div>

         <div className="flex items-center gap-3">
            <button 
              onClick={handleReset}
              className="px-6 py-2.5 text-[11px] font-black uppercase tracking-widest bg-white border-2 border-zinc-950 hover:bg-zinc-50 transition-colors"
            >
              Reset Layout
            </button>
            <button 
              onClick={handleGlobalSave}
              className="px-6 py-2.5 text-[11px] font-black uppercase tracking-widest bg-zinc-950 text-white hover:bg-zinc-800 transition-colors shadow-lg shadow-zinc-200"
            >
              Save Changes
            </button>
         </div>
      </div>
    </div>
  );
}
