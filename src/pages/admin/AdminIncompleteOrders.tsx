import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  Trash2, 
  MessageSquare, 
} from 'lucide-react';
import { useLeadStore, Lead } from '../../store/useLeadStore';
import { formatPrice } from '../../lib/utils';
import { toast } from 'react-hot-toast';

export default function AdminIncompleteOrders() {
  const navigate = useNavigate();
  const { leads, deleteLead, markAsRead } = useLeadStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const displayLeads = leads;

  const toggleExpand = (id: string) => {
    if (expandedId !== id) {
      markAsRead(id);
    }
    setExpandedId(expandedId === id ? null : id);
  };

  const handleWhatsApp = (phone?: string) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  return (
    <div className="flex flex-col min-h-full font-sans text-black bg-[#f8f8f8]">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-6 bg-white -mx-8 px-8 pt-2">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/orders')}
            className="p-2 border border-gray-200 rounded-none bg-white hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h3 className="text-2xl font-black uppercase tracking-tight">Incomplete Orders</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">Captured Leads from Abandoned Checkouts</p>
          </div>
        </div>
        <div className="bg-black text-white px-5 py-2.5 rounded-none font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
          {displayLeads.length} Records Found
        </div>
      </div>

      {/* Accordion List View */}
      <div className="space-y-3">
        {displayLeads.map((lead, index) => {
          const isExpanded = expandedId === lead.id;
          const formattedFullDate = new Intl.DateTimeFormat('en-GB', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }).format(new Date(lead.lastUpdated));

          const customerDisplayName = lead.name && lead.name.trim() !== '' ? lead.name : `Customer ${displayLeads.length - index}`;

          return (
            <div 
              key={lead.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
            >
              {/* Compact View */}
              <div 
                onClick={() => toggleExpand(lead.id)}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-850 font-black flex items-center justify-center text-xs shrink-0 relative">
                    {index + 1}
                    {!lead.isRead && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 border-2 border-white rounded-full"></span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-black text-sm sm:text-base font-sans">
                      {customerDisplayName}
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(lead.lastUpdated))}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <p className="font-black text-black text-sm sm:text-base font-mono">
                    {lead.total ? formatPrice(lead.total) : 'No Information'}
                  </p>
                  <span className="px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 bg-yellow-50 text-yellow-700 border border-yellow-200 select-none">
                    <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
                    Incomplete Order
                  </span>
                </div>
              </div>

              {/* Expandable Details Point-by-point List */}
              {isExpanded && (
                <div className="px-4 pb-5 pt-3 bg-gray-50 border-t border-gray-100 text-xs sm:text-sm space-y-4 animate-in slide-in-from-top-2 duration-150">
                  
                  {/* Customer Information Points */}
                  <div className="space-y-2">
                    <h4 className="font-extrabold text-[10px] uppercase tracking-wider text-gray-400">Customer Details</h4>
                    <div className="space-y-2">
                      <div>
                        <span className="text-gray-500 block text-xs">Customer Name</span>
                        <p className={`font-bold ${lead.name && lead.name.trim() !== '' ? 'text-black' : 'text-gray-400 italic'}`}>
                          {lead.name && lead.name.trim() !== '' ? lead.name : 'No Information'}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-xs">Mobile Number</span>
                        <p className={`font-bold ${lead.phone && lead.phone.trim() !== '' ? 'text-black' : 'text-gray-400 italic'}`}>
                          {lead.phone && lead.phone.trim() !== '' ? lead.phone : 'No Information'}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-xs">Full Address</span>
                        <p className={`font-bold ${lead.address && lead.address.trim() !== '' ? 'text-black' : 'text-gray-400 italic'}`}>
                          {lead.address && lead.address.trim() !== '' ? lead.address : 'No Information'}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-xs">Email Address</span>
                        <p className={`font-bold ${lead.email && lead.email.trim() !== '' ? 'text-black' : 'text-gray-400 italic'}`}>
                          {lead.email && lead.email.trim() !== '' ? lead.email : 'No Information'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <hr className="border-gray-200" />

                  {/* Payment Method */}
                  <div className="space-y-2">
                    <h4 className="font-extrabold text-[10px] uppercase tracking-wider text-gray-400">Payment Information</h4>
                    <div>
                      <span className="text-gray-500 block text-xs">Payment Method</span>
                      <p className="font-bold text-gray-900 uppercase">
                        {(lead as any).paymentMethod || 'No Information'}
                      </p>
                    </div>
                  </div>

                  <hr className="border-gray-200" />

                  {/* Product Info points */}
                  <div className="space-y-3">
                    <h4 className="font-extrabold text-[10px] uppercase tracking-wider text-gray-400">Product Information</h4>
                    {lead.items && lead.items.length > 0 ? (
                      <div className="space-y-3">
                        {lead.items.map((item, i) => (
                          <div key={i} className="p-3 bg-white border border-gray-150 rounded-lg space-y-2">
                            <div>
                              <span className="text-gray-450 text-[10px] uppercase font-bold block">Product Name</span>
                              <p className="font-extrabold text-black text-xs sm:text-sm">{item.name || 'No Information'}</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1.5 border-t border-gray-100 mt-2">
                              <div>
                                <span className="text-gray-400 text-[10px] uppercase font-bold block">Quantity</span>
                                <p className="font-semibold text-black text-xs">{item.quantity || 1}</p>
                              </div>
                              <div>
                                <span className="text-gray-400 text-[10px] uppercase font-bold block">Product Price / Est. Total</span>
                                <p className="font-semibold text-black text-xs">
                                  {lead.total ? formatPrice(lead.total) : 'No Information'}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 italic">No Information</p>
                    )}
                  </div>

                  <hr className="border-gray-200" />

                  {/* Metadata field */}
                  <div>
                    <span className="text-gray-500 block text-xs">Last Updated</span>
                    <p className="font-bold text-gray-800 text-xs sm:text-sm">{formattedFullDate}</p>
                  </div>

                  {/* Action buttons list vertically */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleWhatsApp(lead.phone);
                      }}
                      className="bg-white border border-black text-black py-2.5 rounded-lg font-bold text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-black hover:text-white transition-all disabled:opacity-30"
                      disabled={!lead.phone || lead.phone.includes('X')}
                    >
                      <MessageSquare className="w-4 h-4" />
                      Contact customer
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Are you sure you want to delete this lead record?')) {
                          deleteLead(lead.id);
                          toast.success('Lead record deleted successfully');
                        }
                      }}
                      className="border border-red-200 text-red-650 hover:bg-red-50/50 py-2.5 rounded-lg font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Lead Record
                    </button>
                  </div>

                </div>
              )}
            </div>
          );
        })}

        {displayLeads.length === 0 && (
          <div className="py-24 text-center bg-white border border-dashed border-gray-200 rounded-xl">
             <h3 className="text-sm font-black uppercase tracking-widest text-black mb-2">No Incomplete Orders</h3>
             <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                Abandoned checkouts will appear here automatically
             </p>
          </div>
        )}
      </div>
    </div>
  );
}
