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
import { useLeadStore } from '../../store/useLeadStore';
import { formatPrice } from '../../lib/utils';
import { toast } from 'react-hot-toast';

export default function AdminIncompleteOrders() {
  const navigate = useNavigate();
  const { leads, loading, fetchLeads, deleteLead, markAsRead } = useLeadStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showDbGuide, setShowDbGuide] = useState(false);
  
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
    if (window.confirm('Are you sure you want to permanently delete this record?')) {
      try {
        await deleteLead(id);
        toast.success('Record removed successfully');
      } catch (error) {
        toast.error('Failed to delete record');
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
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 text-neutral-800 animate-spin" />
        <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Loading Records...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full font-sans text-neutral-900 bg-[#f8f9fa] p-4 sm:p-6 md:p-8 rounded-2xl">
      {/* Header Structure */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/admin/orders')}
            className="p-2.5 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 text-neutral-700 transition-colors shadow-2xs cursor-pointer"
            title="Back to Orders"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-neutral-900">
                Incomplete Orders
              </h1>
            </div>
            <p className="text-xs font-semibold text-neutral-500 mt-1 pl-0.5">
              Customers who left checkout without completing their order
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <button 
            onClick={() => setShowDbGuide(true)}
            className="bg-white text-neutral-600 px-3.5 py-2 rounded-xl border border-neutral-200 font-bold text-xs flex items-center gap-1.5 hover:bg-neutral-50 transition-colors shadow-2xs cursor-pointer"
          >
            <Database className="w-3.5 h-3.5 text-neutral-400" />
            Database Setup
          </button>
        </div>
      </div>

      {/* Summary Area */}
      <div className="bg-white rounded-xl border border-gray-200/80 p-4 mb-6 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs sm:text-sm font-bold text-neutral-800 uppercase tracking-wider">
            Incomplete Orders
          </span>
        </div>
        <div className="bg-red-50 text-red-600 px-3.5 py-1.5 rounded-lg border border-red-100 font-extrabold text-xs tracking-wide">
          {displayLeads.length} Records Found
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
                className="p-2 hover:bg-neutral-200 rounded-full transition-colors cursor-pointer"
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
                  className="absolute top-3 right-3 px-3 py-1.5 bg-neutral-800 text-white rounded-lg text-[9px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity border border-neutral-700 cursor-pointer"
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
                className="bg-black text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-neutral-800 transition-all shadow-md active:scale-95 cursor-pointer"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order / Customer Cards */}
      <div className="grid grid-cols-1 gap-4">
        {displayLeads.map((lead) => {
          const isExpanded = expandedId === lead.id;
          const customerDisplayName = lead.name && lead.name.trim() !== '' ? lead.name : 'Guest Customer';

          return (
            <div 
              key={lead.id}
              className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                lead.is_read 
                  ? 'border-gray-200/80 shadow-2xs' 
                  : 'border-red-200 shadow-xs ring-1 ring-red-100'
              }`}
            >
              {/* Card Header & Compact Info */}
              <div 
                onClick={() => toggleExpand(lead.id)}
                className="p-4 sm:p-5 cursor-pointer hover:bg-neutral-50/60 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Status Icon + Customer Name & Contact */}
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      lead.is_read ? 'bg-neutral-100 text-neutral-400' : 'bg-red-50 text-red-500'
                    }`}>
                      {lead.is_read ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <AlertCircle className="w-5 h-5" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-extrabold text-neutral-900 text-base sm:text-lg truncate">
                          {customerDisplayName}
                        </h4>
                        {!lead.is_read && (
                          <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
                            NEW
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs font-medium text-neutral-500 mt-1.5">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                          {getTimeAgo(lead.last_updated)}
                        </span>
                        {lead.phone && (
                          <span className="flex items-center gap-1.5 font-bold text-neutral-800">
                            <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                            {lead.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right side checkout/order-related icon */}
                  <div className={`p-2 rounded-xl transition-all shrink-0 ${
                    isExpanded ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-700'
                  }`}>
                    <ShoppingBag className="w-4.5 h-4.5" />
                  </div>
                </div>

                {/* Subtle Divider */}
                <div className="border-t border-gray-100 my-3.5" />

                {/* Bottom: Potential Total */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                    Potential Total
                  </span>
                  <span className="text-base sm:text-lg font-black text-red-600 font-mono">
                    {lead.total ? formatPrice(lead.total) : 'BDT 0'}
                  </span>
                </div>
              </div>

              {/* Expandable Details */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-3 bg-neutral-50/80 border-t border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Customer Captured Details */}
                    <div className="space-y-4">
                      <h5 className="text-[11px] font-black text-neutral-400 uppercase tracking-widest border-b border-gray-200/80 pb-1.5">
                        Captured Information
                      </h5>
                      <div className="space-y-3 text-xs">
                        <div className="flex items-start gap-2.5">
                          <MapPin className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[10px] font-black text-neutral-400 uppercase">Address</p>
                            <p className="font-semibold text-neutral-800 mt-0.5">
                              {lead.address || "No address entered"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5">
                          <Phone className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[10px] font-black text-neutral-400 uppercase">Phone</p>
                            <p className="font-semibold text-neutral-800 mt-0.5">
                              {lead.phone || "No phone entered"}
                            </p>
                          </div>
                        </div>

                        {lead.email && (
                          <div className="flex items-start gap-2.5">
                            <Mail className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-[10px] font-black text-neutral-400 uppercase">Email</p>
                              <p className="font-semibold text-neutral-800 mt-0.5">{lead.email}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Cart Items & Actions */}
                    <div className="space-y-4">
                      <h5 className="text-[11px] font-black text-neutral-400 uppercase tracking-widest border-b border-gray-200/80 pb-1.5">
                        Cart Items
                      </h5>
                      <div className="space-y-3">
                        {lead.items && lead.items.length > 0 ? (
                          <div className="grid gap-2">
                            {lead.items.map((item, i) => (
                              <div key={i} className="flex items-center justify-between p-2.5 bg-white border border-gray-200/80 rounded-xl">
                                <div className="flex items-center gap-2.5">
                                  <span className="w-6 h-6 bg-neutral-100 rounded-md flex items-center justify-center text-[10px] font-black text-neutral-600">
                                    {item.quantity}x
                                  </span>
                                  <p className="text-xs font-bold text-neutral-900">{item.name}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-3 bg-white border border-dashed border-gray-200 rounded-xl text-center">
                            <p className="text-xs font-semibold text-neutral-400">No items recorded</p>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-3 pt-2">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleWhatsApp(lead.phone);
                            }}
                            disabled={!lead.phone}
                            className="bg-[#25D366] text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
                          >
                            <MessageSquare className="w-4 h-4" />
                            WhatsApp
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteLead(lead.id);
                            }}
                            className="bg-white border border-red-200 text-red-600 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-red-600 hover:text-white transition-all shadow-2xs cursor-pointer"
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
          <div className="py-20 text-center bg-white border border-dashed border-gray-200 rounded-2xl">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 mb-1">
              No Incomplete Orders
            </h3>
            <p className="text-xs text-neutral-400 font-medium max-w-xs mx-auto leading-relaxed">
              When customers leave checkout without placing an order, their information will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

