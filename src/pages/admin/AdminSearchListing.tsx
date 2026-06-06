import React, { useState } from 'react';
import { 
  Search, TrendingUp, Clock, BarChart2, Trash2, 
  ArrowUpRight, AlertTriangle, PlusCircle, CheckCircle, 
  HelpCircle, Eye, RefreshCw 
} from 'lucide-react';
import { useSearchStore, SearchRecord } from '../../store/useSearchStore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export default function AdminSearchListing() {
  const { searches, clearSearches, isLoading } = useSearchStore();
  const navigate = useNavigate();

  // Sort and segment datasets
  const topSuccessfulSearches = [...searches]
    .filter(s => s.hasResults !== false)
    .sort((a, b) => b.count - a.count);

  const noResultsSearches = [...searches]
    .filter(s => s.hasResults === false)
    .sort((a, b) => b.count - a.count);

  const recentHistoryLogs = [...searches]
    .sort((a, b) => b.timestamp - a.timestamp);

  // Stats calculation
  const totalSearchesCount = searches.reduce((acc, s) => acc + (s.count || 1), 0);
  const successfulCount = searches.filter(s => s.hasResults !== false).reduce((acc, s) => acc + (s.count || 1), 0);
  const failedCount = searches.filter(s => s.hasResults === false).reduce((acc, s) => acc + (s.count || 1), 0);
  const successRate = totalSearchesCount > 0 ? Math.round((successfulCount / totalSearchesCount) * 100) : 100;

  const formatTime = (ts: number) => {
    const now = Date.now();
    const diff = now - ts;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(ts).toLocaleDateString();
  };

  const handleClearAll = async () => {
    if (window.confirm("Are you sure you want to purge all Search Intelligence logs from Firestore? This action is irreversible.")) {
      try {
        await clearSearches();
        toast.success("All search logs cleared successfully.");
      } catch (err) {
        toast.error("Failed to delete search logs.");
      }
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Upper header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-[#000000] uppercase tracking-tighter">Search Analytics Center</h2>
          <p className="text-neutral-400 text-xs font-bold uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
            Real-time Customer Intent Mining (Daraz-Mode Engine)
          </p>
        </div>
        <button 
          onClick={handleClearAll}
          disabled={searches.length === 0}
          className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-[10px] font-black uppercase tracking-widest"
        >
          <Trash2 className="w-3.5 h-3.5" /> Purge Analytics Data
        </button>
      </div>

      {/* Analytics Scorecards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-neutral-100 p-5 shadow-[0_2px_4px_rgba(0,0,0,0.01)]">
          <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Total Search Volume</span>
          <div className="text-3xl font-black mt-1 text-neutral-950 font-mono">
            {totalSearchesCount}
          </div>
          <p className="text-[8px] text-neutral-400 uppercase font-bold mt-1">Unique keywords: {searches.length}</p>
        </div>
        <div className="bg-white border border-neutral-100 p-5 shadow-[0_2px_4px_rgba(0,0,0,0.01)] border-l-4 border-l-emerald-500">
          <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Successful Searches</span>
          <div className="text-3xl font-black mt-1 text-emerald-950 font-mono">
            {successfulCount}
          </div>
          <p className="text-[8px] text-neutral-400 uppercase font-bold mt-1">Matched catalog items</p>
        </div>
        <div className="bg-white border border-neutral-100 p-5 shadow-[0_2px_4px_rgba(0,0,0,0.01)] border-l-4 border-l-rose-500">
          <span className="text-[9px] font-black text-rose-600 uppercase tracking-widest">No-Result Searches</span>
          <div className="text-3xl font-black mt-1 text-rose-950 font-mono">
            {failedCount}
          </div>
          <p className="text-[8px] text-neutral-400 uppercase font-bold mt-1">Customers left empty handed</p>
        </div>
        <div className="bg-neutral-950 border border-neutral-800 p-5 text-white">
          <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Catalog Coverage</span>
          <div className="text-3xl font-black mt-1 text-sky-400 font-mono">
            {successRate}%
          </div>
          <p className="text-[8px] text-emerald-400 uppercase font-bold mt-1">Search conversion pulse</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* TOP SEARCHES PANEL (WITH RESULTS) */}
        <div className="bg-white border border-neutral-100 shadow-sm flex flex-col">
          <div className="p-5 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
            <h3 className="text-xs font-black uppercase tracking-[0.15em] text-neutral-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Top Searches (Successful Results)
            </h3>
            <span className="text-[8px] font-black bg-emerald-50 text-emerald-700 px-2 py-0.5 uppercase">Highly Coveted</span>
          </div>
          
          <div className="divide-y divide-neutral-100 overflow-y-auto max-h-[400px]">
            {topSuccessfulSearches.map((item, idx) => (
              <div key={item.id} className="p-4 flex items-center justify-between hover:bg-neutral-50/40 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 flex items-center justify-center shrink-0 border border-neutral-100 font-mono text-[10px] font-black bg-neutral-50">
                    #{idx + 1}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-neutral-900 uppercase block truncate">{item.keyword}</span>
                    <span className="text-[9px] text-[#9ca3af] font-bold uppercase tracking-wider block">{item.category || 'General'} Context</span>
                  </div>
                </div>

                <div className="flex items-center gap-6 shrink-0">
                  <div className="text-right">
                    <span className="text-xs font-black text-neutral-900 block font-mono">{item.count}</span>
                    <span className="text-[8px] text-neutral-400 uppercase font-bold tracking-tight block">Queries</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-neutral-50 text-neutral-500 text-[9px] font-black uppercase border border-neutral-100">
                    <CheckCircle className="w-3 h-3 text-emerald-500" /> Matches
                  </div>
                </div>
              </div>
            ))}

            {topSuccessfulSearches.length === 0 && (
              <div className="py-16 text-center text-neutral-400 text-xs font-bold uppercase tracking-widest">
                No matched searches reported
              </div>
            )}
          </div>
        </div>

        {/* NO RESULT ANALYTICS (MISSING PRODUCTS SIGNALS) */}
        <div className="bg-white border border-neutral-100 shadow-sm flex flex-col">
          <div className="p-5 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
            <h3 className="text-xs font-black uppercase tracking-[0.15em] text-neutral-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500 animate-pulse" />
              Missing Products (No Result searches)
            </h3>
            <span className="text-[8px] font-black bg-rose-50 text-rose-700 px-2 py-0.5 uppercase tracking-wide">Supply Gaps</span>
          </div>

          <div className="divide-y divide-neutral-100 overflow-y-auto max-h-[400px]">
            {noResultsSearches.map((item, idx) => (
              <div key={item.id} className="p-4 flex items-center justify-between hover:bg-neutral-50/40 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 flex items-center justify-center shrink-0 border border-neutral-100 bg-rose-50 text-rose-500 font-mono text-[10px] font-black">
                    #{idx + 1}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-[#b91c1c] uppercase block truncate">{item.keyword}</span>
                    <span className="text-[9px] text-[#9ca3af] font-bold uppercase tracking-wider block">Unmet Category Proposal</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <span className="text-xs font-black text-rose-900 block font-mono">{item.count}</span>
                    <span className="text-[8px] text-neutral-400 uppercase font-bold tracking-tight block">Wasted Queries</span>
                  </div>
                  
                  {/* Redirect button to help quickly register supply product */}
                  <button 
                    onClick={() => {
                      toast.success(`Redirecting to add product for: "${item.keyword}"`);
                      navigate(`/admin/products`);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-black text-white hover:bg-neutral-800 transition-colors text-[9px] font-black uppercase tracking-wider"
                  >
                    <PlusCircle className="w-3 h-3" /> Add Product
                  </button>
                </div>
              </div>
            ))}

            {noResultsSearches.length === 0 && (
              <div className="py-16 text-center text-neutral-400 text-xs font-bold uppercase tracking-widest">
                Excellent! Zero supply gaps recorded!
              </div>
            )}
          </div>
        </div>

      </div>

      {/* REAL-TIME LIVE ACTIVITY FEED LOGS */}
      <div className="bg-white border border-neutral-100 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
          <h3 className="text-xs font-black uppercase tracking-[0.15em] text-neutral-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-500" />
            Live Search Streams (Real-time Audit Logs)
          </h3>
          <div className="flex items-center gap-2 px-3 py-1 bg-white border border-neutral-250 text-[9px] font-extrabold uppercase tracking-widest text-[#4b5563]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-ping mr-1"></span>
            Streaming Intent
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50/50 text-neutral-400 text-[8.5px] uppercase tracking-[0.2em] font-black border-b border-neutral-100">
                <th className="p-4 pl-6">Search keyword</th>
                <th className="p-4">Sync context</th>
                <th className="p-4">Last Searched</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right pr-6">Activity scale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-sans">
              {recentHistoryLogs.map((log) => (
                <tr key={log.id} className="hover:bg-neutral-50/20 transition-colors group">
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 border ${
                        log.hasResults !== false 
                          ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                          : 'bg-rose-50 border-rose-100 text-rose-600'
                      }`}>
                        <Search className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-neutral-900 group-hover:text-black transition-colors block uppercase">{log.keyword}</span>
                        <span className="text-[8px] text-neutral-400 uppercase tracking-widest font-mono font-bold block">ID: {log.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-xs font-semibold text-neutral-700 uppercase tracking-wide">
                    {log.category || 'N/A'}{log.relatedProduct ? ` - ${log.relatedProduct}` : ''}
                  </td>
                  <td className="p-4 text-neutral-400 text-[10px] font-black uppercase font-mono tracking-tight">{formatTime(log.timestamp)}</td>
                  <td className="p-4 text-center">
                    <span className={`inline-block px-2.5 py-1 text-[8.5px] font-black uppercase tracking-wider ${
                      log.hasResults !== false 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100/50' 
                        : 'bg-rose-50 text-rose-700 border border-rose-100/50'
                    }`}>
                      {log.hasResults !== false ? 'Matched' : 'No Results'}
                    </span>
                  </td>
                  <td className="p-4 text-right pr-6 font-mono font-black text-xs text-neutral-900">
                    {log.count} searches
                  </td>
                </tr>
              ))}

              {recentHistoryLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="w-8 h-8 text-neutral-200" />
                      <p className="text-neutral-400 text-xs font-black uppercase tracking-widest">Awaiting customer searches activity log streams...</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
