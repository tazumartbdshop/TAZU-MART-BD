import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useCategoryStore } from '../../store/useCategoryStore';
import { useProductStore } from '../../store/useProductStore';
import { getSupabase } from '../../lib/supabase';
import { Database, ShieldAlert, CheckCircle2, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';

export function RuntimeDiagnostics() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isDebugActive = searchParams.get('debug') === 'true' || searchParams.get('debug') === '1';

  const [isOpen, setIsOpen] = useState(false);
  const { categories, isLoaded: categoriesLoaded } = useCategoryStore();
  const { products, isLoading: productsLoading } = useProductStore();

  const [supabaseStatus, setSupabaseStatus] = useState<'connected' | 'error' | 'disconnected'>('disconnected');
  const [supabaseUrlUsed, setSupabaseUrlUsed] = useState<string>('');
  const [activeSource, setActiveSource] = useState<string>('');

  useEffect(() => {
    if (!isDebugActive) return;

    const testSupabaseConnection = async () => {
      const client = getSupabase();
      if (!client) {
        setSupabaseStatus('disconnected');
        setSupabaseUrlUsed('None (Client empty)');
        setActiveSource('No credentials found in window/env');
        return;
      }

      // Read active configuration
      const winUrl = (window as any).__SUPABASE_URL || (window as any).__supabase_url;
      const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
      
      if (winUrl) {
        setSupabaseUrlUsed(winUrl);
        setActiveSource('Dynamic (Injected / fetched from API)');
      } else if (envUrl) {
        setSupabaseUrlUsed(envUrl);
        setActiveSource('Build-time (Vite .env compilation)');
      } else {
        setSupabaseUrlUsed('Unknown');
        setActiveSource('Fallback');
      }

      try {
        const { data, error } = await client.from('categories').select('id').limit(1);
        if (error) {
          console.error("[Debug Diagnostics] categories fetch tested negative:", error);
          setSupabaseStatus('error');
        } else {
          setSupabaseStatus('connected');
        }
      } catch (err) {
        console.error("[Debug Diagnostics] connection test failure:", err);
        setSupabaseStatus('error');
      }
    };

    testSupabaseConnection();
  }, [isDebugActive, categories]);

  if (!isDebugActive) return null;

  // Build diagnostics list of categories to see why they passed or failed the filters
  const categoryDetails = categories.map(c => {
    const statusStr = String(c.status || 'Active').toLowerCase();
    const isActive = statusStr === 'active';
    
    const showOnHome = c.showOnHomepage !== false && (c as any).show_on_homepage !== false;
    const isVisible = (c as any).is_visible !== false && (c as any).isVisible !== false;
    const isPublished = (c as any).published !== false;
    
    const passedHome = isActive && showOnHome && isVisible && isPublished;
    const passedPage = isActive && isVisible && isPublished;

    const reasons: string[] = [];
    if (!isActive) reasons.push(`status="${c.status}" (expected "Active")`);
    if (!showOnHome) reasons.push(`showOnHomepage=${c.showOnHomepage} (expected true)`);
    if (!isVisible) reasons.push(`is_visible=false`);
    if (!isPublished) reasons.push(`published=false`);

    return {
      id: c.id,
      name: c.name,
      slug: c.slug,
      displayOrder: c.displayOrder,
      passedHome,
      passedPage,
      reasons: reasons.join(', ')
    };
  });

  return (
    <div className="fixed bottom-6 right-6 z-[99999] font-mono leading-relaxed" id="runtime-diagnostics-container">
      {/* Mini floating toggle badge */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-neutral-900 border border-neutral-700 text-white px-4 py-2.5 rounded-full shadow-2xl hover:bg-neutral-800 transition-all font-sans text-xs font-black uppercase tracking-wider animate-bounce"
        >
          <Database className="w-4 h-4 text-emerald-400" />
          🔧 DB-DEBUG
        </button>
      )}

      {/* Main expanded panel */}
      {isOpen && (
        <div className="bg-neutral-950 border border-neutral-800 text-neutral-200 w-[550px] max-w-[95vw] h-[600px] max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-neutral-900 px-5 py-4 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Database className="w-5 h-5 text-emerald-400" />
              <span className="font-sans font-black text-xs uppercase tracking-widest text-white">Production Diagnostics Panel</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-neutral-400 hover:text-white text-xs font-bold font-sans uppercase tracking-widest bg-neutral-800 px-2.5 py-1.5 rounded-lg transition-colors border border-neutral-700"
            >
              Hide
            </button>
          </div>

          {/* Panel Scroll Content */}
          <div className="flex-1 p-5 overflow-y-auto space-y-6 text-xs">
            {/* Supabase Status Summary */}
            <div className="bg-neutral-900/60 p-4 rounded-xl border border-neutral-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-neutral-400 font-bold uppercase tracking-wider text-[10px]">Client Status</span>
                {supabaseStatus === 'connected' ? (
                  <span className="flex items-center gap-1.5 text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-900 px-2 py-0.5 rounded-full text-[10px] uppercase">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Connected
                  </span>
                ) : supabaseStatus === 'error' ? (
                  <span className="flex items-center gap-1.5 text-red-400 font-bold bg-red-950/40 border border-red-900 px-2 py-0.5 rounded-full text-[10px] uppercase">
                    <ShieldAlert className="w-3.5 h-3.5" /> Query Error
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-amber-400 font-bold bg-amber-950/40 border border-amber-900 px-2 py-0.5 rounded-full text-[10px] uppercase">
                    <ShieldAlert className="w-3.5 h-3.5" /> Unconfigured
                  </span>
                )}
              </div>

              <div className="space-y-1.5 pt-1.5 border-t border-neutral-800/50">
                <div className="flex justify-between">
                  <span className="text-neutral-400 font-sans">Active URL:</span>
                  <span className="text-white break-all text-right font-semibold select-all font-mono max-w-[280px]">
                    {supabaseUrlUsed || 'Empty'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400 font-sans">Config Source:</span>
                  <span className="text-sky-400 font-semibold">{activeSource}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions / Status Check */}
            {supabaseStatus === 'disconnected' && (
              <div className="bg-amber-950/20 border border-amber-900/50 p-4 rounded-xl space-y-2 leading-relaxed">
                <div className="font-bold text-amber-400 uppercase tracking-widest text-[10px] flex items-center gap-1">
                  <ShieldAlert className="w-4 h-4" /> Action Required: Missing Production Keys
                </div>
                <p className="text-neutral-300 font-sans">
                  The Supabase client is empty. Since Vercel serves the application statically, the server API cannot inject keys at runtime. You must add them to Vercel:
                </p>
                <ol className="list-decimal pl-4 space-y-1 text-[11px] font-sans text-neutral-300">
                  <li>Go to your <strong className="text-white">Vercel Dashboard</strong> &rarr; <strong className="text-white">Project Settings</strong> &rarr; <strong className="text-white">Environment Variables</strong>.</li>
                  <li>Add <strong className="text-white">VITE_SUPABASE_URL</strong> and <strong className="text-white">VITE_SUPABASE_ANON_KEY</strong>.</li>
                  <li><strong className="text-emerald-400">CRITICAL STEP:</strong> Trigger a <strong className="text-white">New Deployment</strong> in Vercel. Vite env constants are baked in during compilation—they do NOT apply to existing builds.</li>
                </ol>
              </div>
            )}

            {/* Counts */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-neutral-900/40 p-3.5 rounded-xl border border-neutral-800 text-center">
                <div className="text-neutral-400 font-sans uppercase tracking-widest text-[9px] mb-1">Categories in Store</div>
                <div className="text-2xl font-black text-white">{categoriesLoaded ? categories.length : 'Loading...'}</div>
                <div className="text-[9px] text-neutral-500 font-sans font-semibold mt-1">
                  Active (Homepage): {categoryDetails.filter(c => c.passedHome).length}
                </div>
              </div>
              <div className="bg-neutral-900/40 p-3.5 rounded-xl border border-neutral-800 text-center">
                <div className="text-neutral-400 font-sans uppercase tracking-widest text-[9px] mb-1">Products in Store</div>
                <div className="text-2xl font-black text-white">{productsLoading ? 'Loading...' : products.length}</div>
                <div className="text-[9px] text-neutral-500 font-sans font-semibold mt-1">
                  Active in Stock: {products.filter(p => String(p.status).toLowerCase() === 'active').length}
                </div>
              </div>
            </div>

            {/* Detailed Categories Table Filter Diagnostic */}
            <div className="space-y-2">
              <h4 className="font-sans font-black uppercase text-[10px] tracking-wider text-neutral-400">Category Filter Diagnostics</h4>
              <div className="border border-neutral-800 rounded-xl overflow-hidden divide-y divide-neutral-800">
                {categoryDetails.length === 0 ? (
                  <div className="p-4 text-center text-neutral-500 font-sans">No categories currently returned from Supabase.</div>
                ) : (
                  categoryDetails.map((c) => (
                    <div key={c.id} className="p-3 bg-neutral-950 hover:bg-neutral-900/50 transition-colors">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-white text-[12px]">{c.name}</span>
                        <div className="flex gap-2">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                            c.passedHome ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-900' : 'bg-red-950/80 text-red-400 border border-red-900'
                          }`}>
                            Home: {c.passedHome ? 'RENDERED' : 'FILTERED'}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1 text-neutral-400 text-[10px]">
                        <div><span className="text-neutral-600">ID:</span> {c.id} • <span className="text-neutral-600">Order:</span> {c.displayOrder}</div>
                        {!c.passedHome && (
                          <div className="text-amber-500 italic"><span className="text-neutral-600">Reason:</span> {c.reasons}</div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Detailed Products by Category Match diagnostics */}
            <div className="space-y-2">
              <h4 className="font-sans font-black uppercase text-[10px] tracking-wider text-neutral-400">Products Grouped by Category Name/ID</h4>
              <div className="bg-neutral-900/40 border border-neutral-800 rounded-xl p-3.5 space-y-2 font-sans">
                {categories.map(cat => {
                  const matchingCount = products.filter(p => {
                    const pCat = String(p.category || '').trim().toLowerCase();
                    const cId = String(cat.id || '').trim().toLowerCase();
                    const cName = String(cat.name || '').trim().toLowerCase();
                    const cSlug = String(cat.slug || '').trim().toLowerCase();
                    return pCat === cId || pCat === cName || pCat === cSlug;
                  }).length;

                  return (
                    <div key={`debug-cat-row-${cat.id}`} className="flex justify-between text-neutral-300 font-mono text-xs py-1 border-b border-neutral-800 last:border-0">
                      <span className="font-semibold text-white truncate max-w-[280px]">{cat.name}</span>
                      <span className="font-bold text-neutral-400">({matchingCount} products matched)</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-neutral-900 border-t border-neutral-800 p-3 text-[10px] text-neutral-500 text-center font-sans">
            Device LocalTime: {new Date().toLocaleTimeString()}
          </div>
        </div>
      )}
    </div>
  );
}
