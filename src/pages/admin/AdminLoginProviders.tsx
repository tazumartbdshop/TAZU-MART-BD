import React, { useEffect, useState } from 'react';
import { useLoginProviderStore } from '../../store/useLoginProviderStore';
import { LoginProvider } from '../../services/loginProviderService';
import { Save, Loader2, CheckCircle2, AlertCircle, GripVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getProviderIcon } from '../../components/ProviderIcon';

// Since we don't have SVG assets, we can just use simple text or lucide icons if we prefer, but for the design let's just make it a colored button with provider name exactly as the prompt requested.

interface SortableItemProps {
  key?: string | number;
  provider: LoginProvider;
  onChange: (id: string, updates: Partial<LoginProvider>) => void;
}

function SortableItem({ provider, onChange }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: provider.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-4 bg-white p-4 border border-neutral-200 rounded-xl mb-3 shadow-[0_2px_4px_rgb(0,0,0,0.02)]">
      <div {...attributes} {...listeners} className="cursor-grab text-neutral-400 hover:text-neutral-800 touch-none">
        <GripVertical className="w-5 h-5" />
      </div>
      
      <div className="flex-1 font-bold text-neutral-800 text-sm">{provider.name}</div>
      
      <div className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider", provider.enabled ? "bg-emerald-100 text-emerald-700" : "bg-neutral-100 text-neutral-500")}>
        {provider.enabled ? 'Active' : 'Disabled'}
      </div>

      <button 
        onClick={() => onChange(provider.id, { enabled: !provider.enabled })}
        className={cn(
          "relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none",
          provider.enabled ? 'bg-black' : 'bg-neutral-300'
        )}
      >
        <div className={cn(
          "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300",
          provider.enabled ? 'left-7' : 'left-1'
        )} />
      </button>
    </div>
  );
}

export default function AdminLoginProviders() {
  const { providers, isLoading, fetchProviders, updateProviders } = useLoginProviderStore();
  const [localProviders, setLocalProviders] = useState<LoginProvider[]>([]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  useEffect(() => {
    setLocalProviders(providers);
  }, [providers]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setLocalProviders((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const reordered = arrayMove(items, oldIndex, newIndex) as LoginProvider[];
        return reordered.map((item, index) => ({ ...item, order: index }));
      });
    }
  };

  const handleProviderChange = (id: string, updates: Partial<LoginProvider>) => {
    if (id === 'email_password') return; // Cannot disable manual login
    setLocalProviders(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      setError(null);
      await updateProviders(localProviders);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save login providers');
    } finally {
      setIsSaving(false);
    }
  };

  const activeProviders = localProviders.filter(p => p.enabled && p.id !== 'email_password');
  const storeError = useLoginProviderStore(state => state.error);

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-black">LOGIN PROVIDER MANAGEMENT</h1>
          <p className="text-gray-500 font-medium tracking-tight">Configure available authentication methods.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-8 py-3 bg-neutral-950 text-white rounded-xl font-bold uppercase tracking-wider text-xs hover:opacity-90 transition-all disabled:opacity-50 shrink-0 shadow-lg active:scale-95"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {storeError && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5" />
            <span className="font-semibold text-sm">Unable to load provider settings</span>
          </div>
          <button 
            onClick={() => fetchProviders()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold uppercase hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <div className="bg-white p-6 rounded-[24px] border border-neutral-200 shadow-sm">
             <div className="mb-6 flex items-center justify-between border-b border-neutral-100 pb-4">
               <h3 className="font-bold text-neutral-800">Authentication Methods</h3>
               <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest bg-neutral-100 px-2 py-1 rounded">Drag to reorder</span>
             </div>
             
             <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={localProviders} strategy={verticalListSortingStrategy}>
                {localProviders.map((provider) => (
                  <SortableItem key={provider.id} provider={provider} onChange={handleProviderChange} />
                ))}
              </SortableContext>
            </DndContext>
          </div>
        </div>

        <div className="lg:col-span-4 sticky top-8 h-fit">
          <div className="bg-neutral-50 rounded-[24px] border border-neutral-200 p-8 flex flex-col gap-6 items-center shadow-sm">
             <div className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-2">
                Live Login Preview
             </div>
             
             <div className="w-full bg-white rounded-2xl border border-neutral-200 shadow-xl p-6 min-h-[400px]">
                <h4 className="font-bold text-center text-neutral-900 mb-6 text-xl">Sign in</h4>
                
                {localProviders.find(p => p.id === 'email_password')?.enabled && (
                  <div className="space-y-3 mb-6">
                    <div className="w-full h-[48px] bg-neutral-50 rounded-xl border border-neutral-200 flex items-center px-4 text-xs text-neutral-400 font-medium">Email Address</div>
                    <div className="w-full h-[48px] bg-neutral-50 rounded-xl border border-neutral-200 flex items-center px-4 text-xs text-neutral-400 font-medium">Password</div>
                    <div className="w-full h-[48px] bg-neutral-950 rounded-xl flex items-center justify-center text-white text-xs font-bold uppercase tracking-wider">Sign In</div>
                  </div>
                )}

                {activeProviders.length > 0 && (
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-neutral-200"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-white px-2 text-neutral-500 font-medium">Or continue with</span>
                    </div>
                  </div>
                )}

                <div className={cn(
                  "grid gap-3",
                  activeProviders.length === 1 ? "grid-cols-1" : "grid-cols-2"
                )}>
                  {activeProviders.map(p => (
                    <div 
                      key={p.id}
                      className="group h-[48px] bg-white rounded-xl border border-neutral-200 flex items-center justify-center gap-2 font-semibold text-[13px] text-neutral-700 shadow-sm transition-all hover:bg-neutral-50 cursor-default"
                    >
                      {getProviderIcon(p.id)}
                      <span className="truncate">{p.name}</span>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {success && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 right-8 z-[100] bg-neutral-900 text-white px-6 py-4 rounded-xl flex items-center gap-3 shadow-2xl"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm">Providers Updated</span>
          </motion.div>
        )}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 right-8 z-[100] bg-red-600 text-white px-6 py-4 rounded-xl flex items-center gap-3 shadow-2xl"
          >
            <AlertCircle className="w-5 h-5" />
            <span className="font-bold text-sm">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
