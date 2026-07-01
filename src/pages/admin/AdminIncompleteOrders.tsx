import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  Trash2, 
  MessageSquare, 
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  MapPin,
  Phone,
  Mail,
  ShoppingBag,
  Database,
  Info,
  X
} from 'lucide-react';
import { useLeadStore, Lead } from '../../store/useLeadStore';
import { formatPrice } from '../../lib/utils';
import { toast } from 'react-hot-toast';

export default function AdminIncompleteOrders() {
  const navigate = useNavigate();
  const { leads, loading, fetchLeads, deleteLead, markAsRead } = useLeadStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showDbGuide, setShowDbGuide] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchLeads();
  }, []);

  const displayLeads = leads;

  const toggleExpand = (id: string) => {
    if (expandedId !== id) {
      markAsRead(id);
      setExpandedId(id);
    } else {
      setExpandedId(null);
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (window.confirm('Are you sure you want to permanently delete this lead record from the database?')) {
      try {
        setIsDeleting(id);
        await deleteLead(id);
        toast.success('Record removed from database');
      } catch (error) {
        toast.error('Failed to delete record');
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const handleWhatsApp = (phone?: string) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/\D/g, '');
    const finalPhone = cleanPhone.startsWith('88') ? cleanPhone : `88${cleanPhone}`;
    window.open(`https://wa.me/${finalPhone}`, '_blank');
  };

  const getTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      if (diffInSeconds < 60) return 'Just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
      return `${Math.floor(diffInSeconds / 86400)}d ago`;
    } catch (e) {
      return 'Recently';
    }
  };

  const dbSchemaSql = `CREATE TABLE IF NOT EXISTS public.leads (
  id TEXT PRIMARY KEY,
  name TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  items JSONB DEFAULT '[]'::jsonb,
  total NUMERIC DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'Abandoned',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Policy for Public Access
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leads access" ON public.leads FOR ALL TO public USING (true) WITH CHECK (true);`;

  if (loading && leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 text-black animate-spin" />
        <p className="text-sm font-black uppercase tracking-widest text-neutral-400">Loading Leads...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full font-sans text-black bg-[#f8f8f8]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 border-b border-gray-200 pb-6 bg-white -mx-8 px-8 pt-2 gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/orders')}
            className="p-2 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <h3 className="text-2xl font-black uppercase tracking-tight">Incomplete Orders</h3>
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">Captured Leads from Abandoned Checkouts</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowDbGuide(true)}
            className="bg-neutral-100 text-neutral-600 px-4 py-2.5 rounded-xl border border-neutral-200 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-neutral-200 transition-colors"
          >
            <Database className="w-3.5 h-3.5" />
            Database Setup
          </button>
          <div className="bg-red-50 text-red-600 px-5 py-2.5 rounded-xl border border-red-100 font-black text-[11px] uppercase tracking-widest flex items-center gap-2">
            <span className="text-lg">{displayLeads.length}</span> Records Found
          </div>
        </div>
      </div>

      {/* Database Guide Modal */}
      {showDbGuide && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-sm uppercase tracking-widest">Database Schema Guide</h4>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase">Leads Table Structure</p>
                </div>
              </div>
              <button 
                onClick={() => setShowDbGuide(false)}
                className="p-2 hover:bg-neutral-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-xs font-bold text-blue-800 leading-relaxed">
                  Run this SQL command in your Supabase SQL Editor to create the necessary table and columns for capturing incomplete orders.
                </p>
              </div>
              
              <div className="relative group">
                <pre className="bg-neutral-900 text-blue-400 p-5 rounded-2xl text-[11px] font-mono overflow-x-auto border border-neutral-800 leading-relaxed max-h-[300px] thin-scrollbar">
                  {dbSchemaSql}
                </pre>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(dbSchemaSql);
                    toast.success('SQL copied to clipboard');
                  }}
                  className="absolute top-3 right-3 px-3 py-1.5 bg-neutral-800 text-white rounded-lg text-[9px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity border border-neutral-700"
                >
                  Copy SQL
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border border-neutral-200 rounded-2xl">
                  <h5 className="text-[10px] font-black text-neutral-400 uppercase mb-2">Column Prep</h5>
                  <ul className="text-[11px] font-bold text-neutral-600 space-y-1.5">
                    <li className="flex items-center gap-2">• id (Primary Key)</li>
                    <li className="flex items-center gap-2">• name, phone, email</li>
                    <li className="flex items-center gap-2">• items (JSONB)</li>
                  </ul>
                </div>
                <div className="p-4 border border-neutral-200 rounded-2xl">
                  <h5 className="text-[10px] font-black text-neutral-400 uppercase mb-2">Metadata</h5>
                  <ul className="text-[11px] font-bold text-neutral-600 space-y-1.5">
                    <li className="flex items-center gap-2">• last_updated</li>
                    <li className="flex items-center gap-2">• status (Abandoned)</li>
                    <li className="flex items-center gap-2">• is_read (Boolean)</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="p-6 bg-neutral-50 border-t border-neutral-100 flex justify-end">
              <button 
                onClick={() => setShowDbGuide(false)}
                className="bg-black text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-neutral-800 transition-all shadow-md active:scale-95"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Accordion List View */}
      <div className="grid gap-4">
        {displayLeads.map((lead, index) => {
          const isExpanded = expandedId === lead.id;
          const customerDisplayName = lead.name && lead.name.trim() !== '' ? lead.name : `Guest Customer`;

          return (
            <div 
              key={lead.id}
              className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${
                lead.is_read ? 'border-neutral-100 shadow-sm opacity-90' : 'border-red-200 shadow-md ring-1 ring-red-50'
              }`}
            >
              {/* Compact View */}
              <div 
                onClick={() => toggleExpand(lead.id)}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-neutral-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    lead.is_read ? 'bg-neutral-100' : 'bg-red-50'
                  }`}>
                    {lead.is_read ? (
                      <CheckCircle className="w-6 h-6 text-neutral-400" />
                    ) : (
                      <AlertCircle className="w-6 h-6 text-red-500" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-black text-black text-lg uppercase leading-none mb-1.5">
                      {customerDisplayName}
                    </h4>
                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-neutral-500 font-black uppercase tracking-widest">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {getTimeAgo(lead.last_updated)}
                      </span>
                      {lead.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {lead.phone}
                        </span>
                      )}
                      {!lead.is_read && (
                        <span className="bg-red-500 text-white px-2 py-0.5 rounded-md text-[8px]">NEW</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-0 pt-3 md:pt-0">
                  <div className="text-right">
                    <p className="text-[9px] text-neutral-400 font-black uppercase tracking-widest mb-0.5">Potential Total</p>
                    <p className="font-black text-red-600 text-xl font-mono">
                      {lead.total ? formatPrice(lead.total) : '---'}
                    </p>
                  </div>
                  <div className={`p-2 rounded-xl transition-colors ${
                    isExpanded ? 'bg-black text-white' : 'bg-neutral-50 text-neutral-400'
                  }`}>
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Expandable Details */}
              {isExpanded && (
                <div className="px-6 pb-6 pt-2 bg-neutral-50 border-t border-neutral-100 animate-in slide-in-from-top-2 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* Customer Info */}
                    <div className="space-y-5">
                      <h5 className="text-[11px] font-black text-neutral-400 uppercase tracking-widest border-b border-neutral-200 pb-2">Customer Intelligence</h5>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <MapPin className="w-4 h-4 text-neutral-400 mt-1" />
                          <div>
                            <p className="text-[10px] font-black text-neutral-400 uppercase">Shipping Address</p>
                            <p className="text-sm font-bold text-black leading-tight mt-0.5">
                              {lead.address || "No address captured yet"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Phone className="w-4 h-4 text-neutral-400 mt-1" />
                          <div>
                            <p className="text-[10px] font-black text-neutral-400 uppercase">Contact Number</p>
                            <p className="text-sm font-bold text-black mt-0.5">
                              {lead.phone || "No phone provided"}
                            </p>
                          </div>
                        </div>
                        {lead.email && (
                          <div className="flex items-start gap-3">
                            <Mail className="w-4 h-4 text-neutral-400 mt-1" />
                            <div>
                              <p className="text-[10px] font-black text-neutral-400 uppercase">Email Address</p>
                              <p className="text-sm font-bold text-black mt-0.5">{lead.email}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Cart Info & Actions */}
                    <div className="space-y-5">
                      <h5 className="text-[11px] font-black text-neutral-400 uppercase tracking-widest border-b border-neutral-200 pb-2">Abandoned Items</h5>
                      <div className="space-y-3">
                        {lead.items && lead.items.length > 0 ? (
                          <div className="grid gap-2">
                            {lead.items.map((item, i) => (
                              <div key={i} className="flex items-center justify-between p-3 bg-white border border-neutral-200 rounded-xl">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-neutral-50 rounded-lg flex items-center justify-center text-[10px] font-black text-neutral-400">
                                    {item.quantity}x
                                  </div>
                                  <p className="text-sm font-bold text-black">{item.name}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-4 bg-white border border-dashed border-neutral-300 rounded-xl text-center">
                            <p className="text-xs font-bold text-neutral-400 uppercase">No items recorded</p>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-3 pt-4">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleWhatsApp(lead.phone);
                            }}
                            className="bg-[#25D366] text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-sm"
                            disabled={!lead.phone}
                          >
                            <MessageSquare className="w-4 h-4" />
                            WhatsApp
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteLead(lead.id);
                            }}
                            className="bg-white border border-red-200 text-red-600 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>
          );
        })}

        {displayLeads.length === 0 && (
          <div className="py-32 text-center bg-white border border-dashed border-gray-200 rounded-2xl">
             <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-300" />
             </div>
             <h3 className="text-sm font-black uppercase tracking-widest text-black mb-2">No Incomplete Orders</h3>
             <p className="text-xs text-gray-400 font-bold uppercase tracking-widest max-w-[240px] mx-auto leading-relaxed">
                Leads from abandoned checkouts will be captured here automatically
             </p>
          </div>
        )}
      </div>
    </div>
  );
}
