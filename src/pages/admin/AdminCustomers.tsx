import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Routes, Route, Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { 
  Search, Plus, Edit, Trash2, X, Image as ImageIcon, Eye, EyeOff, Lock, Mail, 
  Smartphone, MapPin, Calendar, Trash, RotateCw, UploadCloud, ChevronDown, Check, Sparkles, MessageSquare
} from 'lucide-react';
import { useCustomerStore, Customer } from '../../store/useCustomerStore';
import { useOrderStore } from '../../store/useOrderStore';
import { useCategoryStore } from '../../store/useCategoryStore';
import { useProductStore } from '../../store/useProductStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useSupportStore } from '../../store/useSupportStore';
import { bdAddressData, divisions } from '../../data/addressData';
import { getCompletedOrdersCount, LoyaltyBadge, VerifiedTick } from '../../lib/loyalty';

// Premium high-contrast avatar colors for placeholders
const AVATAR_COLORS = [
  { bg: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
  { bg: 'bg-emerald-50 border-emerald-250 text-emerald-700' },
  { bg: 'bg-amber-50 border-amber-200 text-amber-700' },
  { bg: 'bg-rose-50 border-rose-250 text-rose-700' },
  { bg: 'bg-purple-50 border-purple-200 text-purple-700' },
  { bg: 'bg-blue-50 border-blue-200 text-blue-700' },
  { bg: 'bg-cyan-50 border-cyan-200 text-cyan-700 font-bold' }
];

function getAvatarStyle(name: string) {
  const code = (name && name.length > 0) ? name.charCodeAt(0) : 0;
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

export default function AdminCustomers() {
  return (
    <Routes>
      <Route path="/" element={<AdminCustomerList />} />
      <Route path="/add" element={<AdminCustomerAdd />} />
      <Route path="/edit/:id" element={<AdminCustomerAdd />} />
    </Routes>
  );
}

function AdminCustomerList() {
  const { customers, deleteCustomer, updateCustomer, clearDemoData: clearDemoCustomers } = useCustomerStore();
  const { orders } = useOrderStore();
  const { createNewSession, setActiveSession } = useSupportStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  // Auto-open profile from query param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const profileId = params.get('profile');
    if (profileId) {
      setSelectedCustomerId(profileId);
    }
  }, [location.search]);

  const selectedCustomer = useMemo(() => 
    customers.find(c => c.id === selectedCustomerId), 
    [customers, selectedCustomerId]
  );

  const handleDeleteCustomer = (customerId: string) => {
    if (window.confirm('IRREVERSIBLE: Delete this customer profile permanently? This will instantly terminate their current session.')) {
      const activeUser = useAuthStore.getState().user;
      if (activeUser && activeUser.id === customerId) {
        useAuthStore.getState().logout();
      }
      deleteCustomer(customerId);
    }
  };

  const hasDemoData = customers.some(c => c.isDemo);

  const sortedAndFilteredCustomers = useMemo(() => {
    return [...customers]
      .filter(c => {
        // Apply Tab Filter (Status/Type)
        switch (activeFilter) {
          case 'active': return c.status === 'Active';
          case 'blocked': return c.status === 'Blocked';
          case 'suspended': return c.status === 'Suspended';
          case 'verified': return (c.totalOrders || 0) >= 5;
          case 'premium': return (c.totalSpend || 0) >= 20000 || c.status === 'VIP';
          case 'returning': return (c.totalOrders || 0) >= 2;
          case 'new': return new Date(c.createdAt).toDateString() === new Date().toDateString();
          default: return true;
        }
      })
      .sort((a, b) => {
        // Priority 1: Search Matches
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const aMatches = a.name.toLowerCase().includes(q) || a.id.toLowerCase().includes(q) || a.phones.some(p => p.includes(q)) || a.emails.some(e => e.toLowerCase().includes(q));
          const bMatches = b.name.toLowerCase().includes(q) || b.id.toLowerCase().includes(q) || b.phones.some(p => p.includes(q)) || b.emails.some(e => e.toLowerCase().includes(q));
          
          if (aMatches && !bMatches) return -1;
          if (!aMatches && bMatches) return 1;
        }

        // Priority 2: Newest First
        return b.createdAt - a.createdAt;
      });
  }, [customers, activeFilter, searchQuery]);

  // Summary Stats 8 cards
  const stats = {
    total: customers.length,
    active: customers.filter(c => c.status === 'Active').length,
    today: customers.filter(c => new Date(c.createdAt).toDateString() === new Date().toDateString()).length,
    blocked: customers.filter(c => c.status === 'Blocked').length,
    suspended: customers.filter(c => c.status === 'Suspended').length,
    verified: customers.filter(c => (c.totalOrders || 0) >= 5).length,
    premium: customers.filter(c => (c.totalSpend || 0) >= 20000 || c.status === 'VIP').length,
    returning: customers.filter(c => (c.totalOrders || 0) >= 2).length,
  };

  return (
    <div className="text-[#111111] space-y-8 max-w-7xl mx-auto p-4 md:p-6 font-sans">
      {/* 1. Statistics Cards - 8 Total */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Customers', value: stats.total, icon: Search, color: 'bg-white text-zinc-900 border-zinc-200' },
          { label: 'Active Accounts', value: stats.active, icon: Check, color: 'bg-white text-emerald-600 border-emerald-200' },
          { label: 'New Today', value: stats.today, icon: Plus, color: 'bg-white text-blue-600 border-blue-200' },
          { label: 'Blocked Accounts', value: stats.blocked, icon: X, color: 'bg-white text-rose-600 border-rose-200' },
          { label: 'Suspended Accounts', value: stats.suspended, icon: EyeOff, color: 'bg-white text-orange-600 border-orange-200' },
          { label: 'Verified Accounts', value: stats.verified, icon: VerifiedTick, color: 'bg-white text-indigo-600 border-indigo-200' },
          { label: 'Premium Members', value: stats.premium, icon: Sparkles, color: 'bg-white text-amber-600 border-amber-200' },
          { label: 'Returning Customers', value: stats.returning, icon: RotateCw, color: 'bg-white text-cyan-600 border-cyan-200' },
        ].map((item, idx) => (
          <div key={idx} className={cn("p-5 border rounded-xl shadow-sm flex flex-col justify-between h-32 transition-all hover:shadow-md", item.color)}>
             <div className="flex justify-between items-start">
               <span className="text-[11px] font-black uppercase tracking-widest leading-none opacity-70">{item.label}</span>
               {typeof item.icon === 'function' ? <item.icon className="w-5 h-5 opacity-40 shrink-0" /> : <div className="scale-75 opacity-70"><item.icon /></div>}
             </div>
             <span className="text-3xl font-black tracking-tight">{item.value.toLocaleString()}</span>
          </div>
        ))}
      </div>

      {/* 2. Controls Section (Filters & Search) */}
      <div className="space-y-4">
        {/* Horizontal Scroll Filter Bar */}
        <div className="bg-white border-b border-zinc-100 pb-2">
          <div className="flex overflow-x-auto no-scrollbar gap-2 flex-nowrap scroll-smooth py-1 px-1">
            {[
              { id: 'all', label: 'All Statuses' },
              { id: 'active', label: 'Active Accounts' },
              { id: 'blocked', label: 'Blocked Accounts' },
              { id: 'suspended', label: 'Suspended Accounts' },
              { id: 'verified', label: 'Verified Accounts' },
              { id: 'premium', label: 'Premium Members' },
              { id: 'returning', label: 'Returning Customers' },
              { id: 'new', label: 'New Customers' },
            ].map(filter => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={cn(
                  "flex-none h-[42px] px-5 text-[10px] font-black uppercase tracking-widest rounded-xl border transition-all whitespace-nowrap active:scale-95",
                  activeFilter === filter.id 
                    ? "bg-black text-white border-black shadow-md" 
                    : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-400"
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar & Actions */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300" />
            <input 
              type="text"
              placeholder="Search by Name, Email, Phone or Customer ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-6 bg-zinc-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-black transition-all placeholder:text-zinc-400"
            />
          </div>
          
          <div className="flex items-center gap-2">
            {hasDemoData && (
              <button
                onClick={() => {
                  if (window.confirm('IRREVERSIBLE ACTION: Purge all demo customers?')) {
                    clearDemoCustomers();
                  }
                }}
                className="h-12 px-4 bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest rounded-xl border border-rose-100 hover:bg-rose-600 hover:text-white transition-all flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Purge Demo
              </button>
            )}
            <Link 
              to="/admin/customers/add"
              className="h-12 px-6 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-zinc-800 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4 text-purple-400" /> Enroll
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Customer Listing */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
           <h2 className="text-xl font-black uppercase tracking-tight text-zinc-900">Customer Listing</h2>
        </div>

        {customers.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-zinc-200 rounded-2xl p-20 flex flex-col items-center justify-center text-center">
             <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-zinc-300" />
             </div>
             <p className="text-sm font-black text-zinc-900 uppercase tracking-widest">No Customers Available</p>
             <p className="text-xs text-zinc-400 uppercase tracking-wider mt-1">Ready to sync real-time registration data</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sortedAndFilteredCustomers.map((customer) => {
              const avatarStyle = getAvatarStyle(customer.name);
              const isMatch = searchQuery && (
                customer.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                customer.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                customer.phones.some(p => p.includes(searchQuery)) ||
                customer.emails.some(e => e.toLowerCase().includes(searchQuery.toLowerCase()))
              );

              const genderBadge = (gender?: string) => {
                if (!gender) return null;
                const g = gender.toLowerCase();
                let colors = "bg-zinc-100 text-zinc-600 border-zinc-200";
                let icon = "👤";

                if (g === 'male') {
                  colors = "bg-blue-50 text-blue-700 border-blue-100";
                  icon = "👨";
                } else if (g === 'female') {
                  colors = "bg-pink-50 text-pink-700 border-pink-100";
                  icon = "👩";
                } else if (g === 'others' || g === 'other') {
                  colors = "bg-purple-50 text-purple-700 border-purple-100";
                  icon = "⚧";
                }

                return (
                  <span className={cn("px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border", colors)}>
                    {icon} {gender}
                  </span>
                );
              };

              return (
                <div 
                  key={customer.id}
                  onClick={() => setSelectedCustomerId(customer.id)}
                  className={cn(
                    "bg-white rounded-xl border transition-all duration-300 flex flex-col group cursor-pointer overflow-hidden",
                    isMatch ? "border-black shadow-lg ring-1 ring-black/5 z-10" : "border-zinc-100 shadow-sm hover:shadow-md"
                  )}
                >
                  {/* Simplified Card Layout */}
                  <div className="p-4 flex gap-4 items-center">
                    <div className="w-14 h-14 shrink-0 rounded-xl bg-zinc-50 overflow-hidden relative border border-zinc-100 shadow-inner">
                      {customer.profileImage ? (
                        <img 
                          src={customer.profileImage} 
                          alt={customer.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform" 
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className={cn("w-full h-full flex items-center justify-center text-xl font-black uppercase", avatarStyle.bg)}>
                          {customer.name?.charAt(0) || 'U'}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-0.5">
                       <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-black text-zinc-900 uppercase truncate leading-none" title={customer.name}>
                            {customer.name}
                          </h4>
                          {(customer.totalOrders || 0) >= 5 && <VerifiedTick />}
                       </div>
                       
                       <p className="text-[10px] font-bold text-zinc-400 truncate">
                         {customer.phones[0] || 'No Phone'}
                       </p>
                       <p className="text-[10px] font-bold text-zinc-400 truncate">
                         {customer.emails[0] || 'No Email'}
                       </p>

                       <div className="pt-1 flex items-center gap-2">
                          {genderBadge(customer.gender)}
                       </div>
                    </div>
                  </div>

                  <div className="px-4 pb-4 mt-auto">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCustomerId(customer.id);
                      }}
                      className="w-full h-8 bg-zinc-50 hover:bg-zinc-100 text-zinc-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-zinc-200 transition-all flex items-center justify-center gap-2"
                    >
                      <Eye className="w-3 h-3" /> View Profile
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Customer Detail Expansion Modal */}
        {selectedCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div 
              className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl animate-scale-in"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-zinc-900 px-6 py-4 flex justify-between items-center text-white">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-purple-400" />
                   </div>
                   <div>
                     <h3 className="text-sm font-black uppercase tracking-wider">Customer Profile Overview</h3>
                     <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-black">Sync ID: {selectedCustomer.id}</p>
                   </div>
                </div>
                <button 
                  onClick={() => setSelectedCustomerId(null)}
                  className="w-8 h-8 flex items-center justify-center hover:bg-zinc-800 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 max-h-[80vh] overflow-y-auto no-scrollbar space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                   {/* Left Side: Identity */}
                   <div className="w-full md:w-48 shrink-0 flex flex-col items-center text-center space-y-4">
                      <div className="w-32 h-32 rounded-3xl border-4 border-zinc-50 shadow-xl overflow-hidden">
                        {selectedCustomer.profileImage ? (
                          <img src={selectedCustomer.profileImage} className="w-full h-full object-cover" />
                        ) : (
                          <div className={cn("w-full h-full flex items-center justify-center text-4xl font-black uppercase", getAvatarStyle(selectedCustomer.name).bg)}>
                            {selectedCustomer.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-zinc-900 uppercase leading-none">{selectedCustomer.name}</h4>
                        <div className="mt-2 flex justify-center">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm",
                            selectedCustomer.status === 'Active' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                            selectedCustomer.status === 'VIP' ? "bg-amber-50 text-amber-700 border-amber-100 animate-pulse" :
                            selectedCustomer.status === 'Blocked' ? "bg-rose-50 text-rose-700 border-rose-100" :
                            "bg-zinc-100 text-zinc-600 border-zinc-200"
                          )}>
                            {selectedCustomer.status}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 w-full">
                        <button 
                          onClick={() => navigate(`/admin/customers/edit/${selectedCustomer.id}`)}
                          className="flex-1 h-10 bg-black text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-zinc-800 flex items-center justify-center gap-2"
                        >
                          <Edit className="w-3 h-3" /> Edit
                        </button>
                        <button 
                          onClick={() => {
                            const sId = createNewSession(selectedCustomer.name, selectedCustomer.phones?.[0] || 'N/A');
                            setActiveSession(sId);
                            navigate('/admin/support');
                          }}
                          className="flex-1 h-10 bg-zinc-100 text-zinc-900 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-zinc-200 flex items-center justify-center gap-2 underline underline-offset-2"
                        >
                          <MessageSquare className="w-3 h-3" /> Chat
                        </button>
                      </div>
                   </div>

                   {/* Right Side: Details Grid */}
                   <div className="flex-1 space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                           <span className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Total Orders</span>
                           <span className="text-xl font-black text-zinc-900 leading-none">{selectedCustomer.totalOrders || 0}</span>
                        </div>
                        <div className="p-4 bg-emerald-50/30 rounded-2xl border border-emerald-100">
                           <span className="block text-[9px] font-black text-emerald-600/60 uppercase tracking-widest mb-1">Total Spent</span>
                           <span className="text-xl font-black text-emerald-600 leading-none">৳{(selectedCustomer.totalSpend || 0).toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-[11px]">
                         <div>
                            <label className="block text-zinc-400 font-bold uppercase mb-0.5">Customer ID</label>
                            <span className="font-black text-zinc-900">{selectedCustomer.id}</span>
                         </div>
                         <div>
                            <label className="block text-zinc-400 font-bold uppercase mb-0.5">Gender</label>
                            <span className="font-black text-zinc-900 uppercase">{selectedCustomer.gender || 'Not Set'}</span>
                         </div>
                         <div>
                            <label className="block text-zinc-400 font-bold uppercase mb-0.5">Join Date</label>
                            <span className="font-black text-zinc-900">{new Date(selectedCustomer.createdAt).toLocaleDateString()}</span>
                         </div>
                         <div>
                            <label className="block text-zinc-400 font-bold uppercase mb-0.5">Last Login</label>
                            <span className="font-black text-zinc-900">{selectedCustomer.lastLogin ? new Date(selectedCustomer.lastLogin).toLocaleString() : 'Never'}</span>
                         </div>
                         <div>
                            <label className="block text-zinc-400 font-bold uppercase mb-0.5">Loyalty Score</label>
                            <span className="font-black text-zinc-900">{selectedCustomer.totalLogins || 0} Professional Sessions</span>
                         </div>
                         <div>
                            <label className="block text-zinc-400 font-bold uppercase mb-0.5">Special Day</label>
                            <span className="font-black text-purple-600 uppercase">{selectedCustomer.occasionName || 'None'} {selectedCustomer.specialDate ? `(${selectedCustomer.specialDate})` : ''}</span>
                         </div>
                         <div className="col-span-2">
                            <label className="block text-zinc-400 font-bold uppercase mb-0.5">Primary Phone</label>
                            <span className="font-black text-zinc-900">{selectedCustomer.phones.join(', ') || 'N/A'}</span>
                         </div>
                         <div className="col-span-2">
                            <label className="block text-zinc-400 font-bold uppercase mb-0.5">Email Address</label>
                            <span className="font-black text-zinc-900">{selectedCustomer.emails.join(', ') || 'N/A'}</span>
                         </div>
                         <div className="col-span-2 space-y-1.5 bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                             <label className="block text-zinc-400 font-black uppercase text-[9px] mb-1 tracking-widest opacity-70">Operational Address Breakdown</label>
                             <div className="space-y-1">
                                <p className="text-[11px] font-black text-zinc-900 uppercase tracking-tight flex items-center gap-2">
                                  <span className="text-sm opacity-90">📍</span> Division: {selectedCustomer.address.division || 'Not Provided'}
                                </p>
                                <p className="text-[11px] font-black text-zinc-900 uppercase tracking-tight flex items-center gap-2">
                                  <span className="text-sm opacity-90">📍</span> District: {selectedCustomer.address.district || 'Not Provided'}
                                </p>
                                <p className="text-[11px] font-black text-zinc-900 uppercase tracking-tight flex items-center gap-2">
                                  <span className="text-sm opacity-90">📍</span> Thana: {selectedCustomer.address.upazila || selectedCustomer.address.area || 'Not Provided'}
                                </p>
                                <p className="text-[11px] font-black text-zinc-950 uppercase tracking-tight flex items-start gap-2 pt-2 mt-1 border-t border-zinc-200">
                                  <span className="text-sm opacity-90">🏠</span> Full Address: {selectedCustomer.address.street || 'Not Provided'}
                                </p>
                                {selectedCustomer.address.zipCode && (
                                  <p className="text-[10px] font-bold text-zinc-400 uppercase mt-1 pl-6 italic">Post Code: {selectedCustomer.address.zipCode}</p>
                                )}
                             </div>
                          </div>
                         {selectedCustomer.note && (
                           <div className="col-span-2 bg-amber-50 p-4 rounded-xl border border-amber-100">
                              <label className="block text-amber-700 font-black uppercase text-[9px] mb-1">Administrative Notes</label>
                              <p className="text-amber-800 leading-relaxed font-bold italic">"{selectedCustomer.note}"</p>
                           </div>
                         )}
                      </div>
                   </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 bg-zinc-50 border-t border-zinc-100 flex justify-end gap-3">
                <button 
                  onClick={() => handleDeleteCustomer(selectedCustomer.id)}
                  className="px-6 h-12 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all border border-rose-100 shadow-sm"
                >
                  Terminate Account
                </button>
                <button 
                  onClick={() => setSelectedCustomerId(null)}
                  className="px-8 h-12 bg-white text-zinc-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-100 transition-all border border-zinc-200 shadow-sm"
                >
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AdminCustomerAdd() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { customers, addCustomer, updateCustomer } = useCustomerStore();
  
  const editingCustomer = customers.find(c => c.id === id);
 
  // Form values
  const [formData, setFormData] = useState({
    name: '',
    phones: [''],
    emails: [''],
    address: {
      country: 'Bangladesh',
      division: '',
      district: '',
      upazila: '',
      area: '',
      zipCode: '',
      street: '',
      city: '',
    },
    whatsApp: '',
    note: '',
    profileImage: '',
    socialLinks: [{ platform: 'Facebook', username: '' }],
    password: '',
    confirmPassword: '',
    gender: 'Male',
    status: 'Active' as Customer['status'],
    customerType: 'Regular' as Customer['customerType'],
    totalOrders: 0,
    totalSpend: 0,
    lastLogin: Date.now(),
    totalLogins: 0,
  });

  // Special Days state multiplier
  const [specialDays, setSpecialDays] = useState<{ id: string; name: string; date: string }[]>([]);

  // Crop / editor photo variables
  const [uploadedRawImage, setUploadedRawImage] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Initialize core data on edit load
  useEffect(() => {
    if (editingCustomer) {
      // Extract days
      const names = editingCustomer.occasionName ? editingCustomer.occasionName.split(' | ') : [];
      const dates = editingCustomer.specialDate ? editingCustomer.specialDate.split(' | ') : [];
      const parsedDays = names.map((name, idx) => {
        let rawDate = dates[idx] || '';
        if (rawDate && rawDate.includes('-')) {
          const parts = rawDate.split('-');
          if (parts.length === 3 && parts[2].length === 4) {
            // Convert DD-MM-YYYY -> YYYY-MM-DD
            rawDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
          }
        }
        return {
          id: 'day_' + Math.random().toString(36).substring(2, 9),
          name: name,
          date: rawDate
        };
      });

      setSpecialDays(parsedDays);

      setFormData({
        ...editingCustomer,
        password: '', // Admin types a password optionally to reset / write a password
        confirmPassword: '',
      });
    }
  }, [editingCustomer]);

  const handleDragStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDragStart({ x: clientX - panX, y: clientY - panY });
  };

  const handleDragMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setPanX(clientX - dragStart.x);
    setPanY(clientY - dragStart.y);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedRawImage(reader.result as string);
        setZoom(1);
        setPanX(0);
        setPanY(0);
        setRotation(0);
      };
      reader.readAsDataURL(file);
    }
  };

  const cropImage = () => {
    if (!uploadedRawImage) return;
    const imgElement = new Image();
    imgElement.src = uploadedRawImage;
    imgElement.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const size = 300;
      canvas.width = size;
      canvas.height = size;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);

      const scaleToFit = Math.min(192 / imgElement.width, 192 / imgElement.height);
      const displayWidth = imgElement.width * scaleToFit;
      const displayHeight = imgElement.height * scaleToFit;

      const scaleCanvas = size / 192;

      ctx.save();
      ctx.translate(size / 2, size / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(zoom, zoom);

      const drawX = (-displayWidth / 2 + panX) * scaleCanvas;
      const drawY = (-displayHeight / 2 + panY) * scaleCanvas;

      ctx.drawImage(
        imgElement,
        drawX,
        drawY,
        displayWidth * scaleCanvas,
        displayHeight * scaleCanvas
      );
      ctx.restore();

      const croppedUrl = canvas.toDataURL('image/jpeg', 0.92);
      setFormData(prev => ({ ...prev, profileImage: croppedUrl }));
      setUploadedRawImage(null);
    };
  };

  const handleEditExistingPhoto = () => {
    if (formData.profileImage) {
      setUploadedRawImage(formData.profileImage);
      setZoom(1);
      setPanX(0);
      setPanY(0);
      setRotation(0);
    }
  };

  const addPhone = () => setFormData({ ...formData, phones: [...formData.phones, ''] });
  const removePhone = (index: number) => setFormData({ ...formData, phones: formData.phones.filter((_, i) => i !== index) });

  const addEmail = () => setFormData({ ...formData, emails: [...formData.emails, ''] });
  const removeEmail = (index: number) => setFormData({ ...formData, emails: formData.emails.filter((_, i) => i !== index) });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name) newErrors.name = 'Full Legal Name is required';
    if (!formData.phones[0]) newErrors.phone = 'Primary Mobile Phone is required';
    if (!formData.emails[0]) newErrors.email = 'Primary Email Address is required';

    // SPECIAL DAY BUILDER COMPULSORY VALIDATIONS (if multiplier added)
    if (specialDays.length > 0) {
      for (const day of specialDays) {
        if (!day.name.trim()) {
          newErrors.specialDays = 'Please choose/fill occasion name titles for all added fields.';
          break;
        }
        if (!day.date.trim()) {
          newErrors.specialDays = 'Please select a calendar date for all active special day fields.';
          break;
        }
      }
    }

    if (formData.password) {
      if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters.';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords entries do not match.';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // scroll to top to see error notice
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Prepare Occasion strings separated by '|' separators
    const occasionJoined = specialDays.length > 0 
      ? specialDays.map(d => d.name.trim()).join(' | ') 
      : '';
    
    const datesJoined = specialDays.length > 0
      ? specialDays.map(d => {
          const parts = d.date.split('-');
          if (parts.length === 3 && parts[0].length === 4) {
            // YYYY-MM-DD -> DD-MM-YYYY format
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
          }
          return d.date;
        }).join(' | ')
      : '';

    const { confirmPassword, ...payload } = formData;
    if (id && !payload.password) {
      delete (payload as any).password;
    }

    const finalPayload = {
      ...payload,
      occasionName: occasionJoined,
      specialDate: datesJoined
    };

    if (id) {
      updateCustomer(id, finalPayload as any);
    } else {
      addCustomer(finalPayload as any);
    }

    navigate('/admin/customers');
  };

  return (
    <div className="bg-white rounded-none border border-black overflow-hidden font-mono text-[#111111]">
      <div className="p-6 border-b border-black flex justify-between items-center bg-black text-white">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider">
            {id ? 'EDIT CUSTOMER PROFILE' : 'ENROLL NEW CUSTOMER PROFILE'}
          </h3>
          <p className="text-gray-400 text-[10px] uppercase tracking-widest mt-1">Configure user logins and days benefits</p>
        </div>
        <button 
          onClick={() => navigate('/admin/customers')} 
          className="text-white hover:bg-zinc-800 p-2 border border-zinc-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6 max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Error visual message strip */}
          {Object.keys(errors).length > 0 && (
            <div className="bg-red-50 text-red-700 border border-red-200 p-4 text-[11px] font-black uppercase tracking-wider space-y-1">
              <p className="text-xs">⚠️ Core enrollment errors found:</p>
              <ul className="list-disc list-inside">
                {Object.values(errors).map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Profile photo 1:1 ratio square system */}
          <div className="space-y-3 pb-6 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <label className="block text-[10.5px] font-black uppercase tracking-wider text-black">Profile Picture Avatar (1:1 Ratio)</label>
              <span className="text-[10px] font-bold text-gray-400 uppercase">Optional</span>
            </div>

            <div className="flex gap-4 items-center">
              <div 
                onClick={(e) => {
                  if (formData.profileImage) {
                    e.preventDefault();
                    handleEditExistingPhoto();
                  }
                }}
                className="relative flex flex-col items-center justify-center w-24 h-24 border border-[#111111] bg-neutral-50 hover:bg-neutral-100 transition-all cursor-pointer overflow-hidden group shrink-0 rounded-none"
              >
                {formData.profileImage ? (
                  <div className="relative w-full h-full group/preview">
                    <img 
                      src={formData.profileImage} 
                      alt="Profile Preview" 
                      className="w-full h-full object-cover rounded-none" 
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/preview:opacity-105 flex items-center justify-center transition-all">
                      <span className="px-2 py-1 bg-white text-black font-black text-[8px] uppercase tracking-wider border border-black max-w-[80%] text-center">
                        Edit Photo
                      </span>
                    </div>
                  </div>
                ) : (
                  <label className="w-full h-full cursor-pointer flex flex-col items-center justify-center text-center p-2">
                    <UploadCloud className="w-6 h-6 text-neutral-400 group-hover:text-black transition-colors" />
                    <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest group-hover:text-black transition-colors mt-1">UPLOAD</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                )}
              </div>

              <div className="space-y-1">
                <span className="block text-xs font-bold text-zinc-900 uppercase">Aspect Locked Portrait</span>
                <p className="text-[9px] text-gray-400 uppercase leading-relaxed max-w-[400px]">
                  Supports dynamic custom cropping, rotate tools, and position drags securely. Adjust for real-time mobile card style look.
                </p>

                {formData.profileImage && (
                  <div className="flex items-center gap-2 pt-1">
                    <button 
                      type="button" 
                      onClick={handleEditExistingPhoto}
                      className="text-[9px] font-black text-purple-700 hover:text-white bg-purple-50 hover:bg-purple-700 transition-colors py-1 px-2 border border-purple-200 uppercase"
                    >
                      Crop / Rotate
                    </button>
                    
                    <button 
                      type="button" 
                      onClick={() => setFormData(prev => ({ ...prev, profileImage: '' }))}
                      className="text-[9px] font-black text-red-600 hover:text-white bg-red-50 hover:bg-red-600 transition-colors py-1 px-2 border border-red-250 uppercase animate-fade-in"
                    >
                      Clear File
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Account information details section */}
          <div className="space-y-5">
            <h4 className="text-[11.5px] font-black text-black border-l-4 border-purple-600 pl-2 uppercase tracking-widest">
              Core Identification details
            </h4>
            
            {/* Compulsory Name, Email right under Name inside visual layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-[#111111] uppercase tracking-wider">Full Client Legal Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. mdimtiazkhan" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full h-10 px-3 bg-white border border-black focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-transform text-xs font-bold font-mono uppercase" 
                />
              </div>

              {/* Compulsory Email field right next to/under Name */}
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-[#111111] uppercase tracking-wider">Primary Email Address</label>
                <input 
                  type="email" 
                  required
                  placeholder="name@gmail.com" 
                  value={formData.emails[0] || ''}
                  onChange={e => {
                    const newEmails = [...formData.emails];
                    newEmails[0] = e.target.value;
                    setFormData({...formData, emails: newEmails});
                  }}
                  className="w-full h-10 px-3 bg-white border border-black focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-transform text-xs font-bold font-mono" 
                />
              </div>

              {/* Gender Selection */}
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-[#111111] uppercase tracking-wider">Gender Identity</label>
                <select
                  value={formData.gender}
                  onChange={e => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full h-10 px-3 bg-white border border-black focus:border-purple-600 focus:ring-1 focus:ring-purple-600 text-xs font-bold font-mono uppercase"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Others">Others</option>
                </select>
              </div>
            </div>

            {/* Mobile dynamic input group (compulsory) */}
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-black uppercase tracking-wider">Communication Channels (Mobile Numbers)</label>
              {formData.phones.map((phone, idx) => (
                <div key={idx} className="flex gap-2">
                  <input 
                    type="tel" 
                    required={idx === 0}
                    placeholder="017XXXXXXXX" 
                    value={phone}
                    onChange={e => {
                      const newPhones = [...formData.phones];
                      newPhones[idx] = e.target.value;
                      setFormData({...formData, phones: newPhones});
                    }}
                    className="flex-1 h-10 px-3 bg-white border border-black focus:border-[#111111] text-xs font-bold font-mono" 
                  />
                  {idx === 0 ? (
                    <button 
                      type="button" 
                      onClick={addPhone} 
                      className="px-4 border border-black bg-[#111111] text-white hover:bg-zinc-850 text-[10px] font-bold uppercase tracking-wider"
                    >
                      + ADD PHONE
                    </button>
                  ) : (
                    <button 
                      type="button" 
                      onClick={() => removePhone(idx)} 
                      className="px-4 border border-red-300 bg-red-50 text-red-600 hover:bg-red-100 text-[10px] font-bold uppercase tracking-wider"
                    >
                      REMOVE
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Full address details mapping */}
            <div className="bg-neutral-50 p-4 border border-black space-y-4">
              <span className="block text-[10px] font-black uppercase text-zinc-400">Operational Address Details</span>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[9px] font-black uppercase text-zinc-500">Division (বিভাগ)</label>
                    <select 
                      value={formData.address.division || ''}
                      onChange={e => {
                        const div = e.target.value;
                        setFormData({
                          ...formData, 
                          address: {
                            ...formData.address, 
                            division: div,
                            district: '',
                            upazila: '',
                            city: div // Default city to division if needed
                          }
                        });
                      }}
                      className="w-full h-10 px-3 border border-zinc-300 focus:border-black bg-white text-xs font-bold uppercase"
                    >
                    <option value="">Select Division</option>
                    {divisions.map(div => (
                      <option key={div} value={div}>{div}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-black uppercase text-zinc-500">District (জেলা)</label>
                    <select 
                      value={formData.address.district || ''}
                      disabled={!formData.address.division}
                      onChange={e => {
                        const dist = e.target.value;
                        setFormData({
                          ...formData, 
                          address: {
                            ...formData.address, 
                            district: dist,
                            upazila: '',
                            city: dist
                          }
                        });
                      }}
                      className="w-full h-10 px-3 border border-zinc-300 focus:border-black bg-white text-xs font-bold uppercase disabled:bg-gray-100"
                    >
                    <option value="">Select District</option>
                    {formData.address.division && bdAddressData[formData.address.division as keyof typeof bdAddressData] && 
                      Object.keys(bdAddressData[formData.address.division as keyof typeof bdAddressData]).map(dist => (
                        <option key={dist} value={dist}>{dist}</option>
                      ))
                    }
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-black uppercase text-zinc-500">Upazila / Thana (উপজেলা/থানা)</label>
                    <select 
                      value={formData.address.upazila || ''}
                      disabled={!formData.address.district}
                      onChange={e => setFormData({...formData, address: {...formData.address, upazila: e.target.value}})}
                      className="w-full h-10 px-3 border border-zinc-300 focus:border-black bg-white text-xs font-bold uppercase disabled:bg-gray-100"
                    >
                    <option value="">Select Upazila</option>
                    {formData.address.division && formData.address.district && bdAddressData[formData.address.division as keyof typeof bdAddressData]?.[formData.address.district]?.map(up => (
                        <option key={up} value={up}>{up}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-black uppercase text-zinc-500">Area / Union (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="Area or Union" 
                    value={formData.address.area || ''}
                    onChange={e => setFormData({...formData, address: {...formData.address, area: e.target.value}})}
                    className="w-full h-10 px-3 border border-zinc-300 focus:border-black bg-white text-xs font-bold uppercase" 
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-black uppercase text-zinc-500">Postal Code (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="Postal Code" 
                    value={formData.address.zipCode || ''}
                    onChange={e => setFormData({...formData, address: {...formData.address, zipCode: e.target.value}})}
                    className="w-full h-10 px-3 border border-zinc-300 focus:border-black bg-white text-xs font-bold uppercase" 
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-black uppercase text-zinc-500">House / Road / Village (Required)</label>
                <input 
                  type="text" 
                  placeholder="e.g. House 45, Road 12" 
                  value={formData.address.street}
                  onChange={e => setFormData({...formData, address: {...formData.address, street: e.target.value}})}
                  className="w-full h-10 px-3 border border-zinc-300 focus:border-black bg-white text-xs font-bold uppercase" 
                />
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div className="pt-6 border-t border-gray-100 space-y-4">
            <h4 className="text-[11.5px] font-black text-black border-l-4 border-emerald-600 pl-2 uppercase tracking-widest">
              Account Internal Settings
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-black">Account Status</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full h-10 px-3 border border-black bg-white text-xs font-bold uppercase"
                >
                  <option value="Active">Active Account</option>
                  <option value="VIP">VIP Account</option>
                  <option value="Suspended">Suspended Account</option>
                  <option value="Blocked">Blocked Account</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-black">Member Type</label>
                <select
                  value={formData.customerType}
                  onChange={e => setFormData({ ...formData, customerType: e.target.value as any })}
                  className="w-full h-10 px-3 border border-black bg-white text-xs font-bold uppercase"
                >
                  <option value="New">New Arrival</option>
                  <option value="Regular">Regular Member</option>
                  <option value="VIP">VIP Member</option>
                  <option value="Wholesale">Wholesale Partner</option>
                </select>
              </div>
            </div>
          </div>

          {/* Secure credentials & Instant password change rule */}
          <div className="pt-6 border-t border-gray-100 space-y-4">
            <h4 className="text-[11.5px] font-black text-black border-l-4 border-purple-600 pl-2 uppercase tracking-widest">
              Security Access Credentials
            </h4>
            <p className="text-[9px] text-purple-600 font-bold uppercase leading-relaxed max-w-[500px]">
              * Security Guideline: Setting a password here will instantly override the customer login password in real-time.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-black">New Account Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Type new password" 
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    className="w-full h-10 px-3 border border-black bg-white text-xs font-bold" 
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-neutral-400 font-black hover:text-black uppercase"
                  >
                    {showPassword ? 'HIDE' : 'SHOW'}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-black">Confirm Password</label>
                <div className="relative">
                  <input 
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Retype password matches" 
                    value={formData.confirmPassword}
                    onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                    className="w-full h-10 px-3 border border-black bg-white text-xs font-bold" 
                  />
                  <button 
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-neutral-400 font-black hover:text-black uppercase"
                  >
                    {showConfirmPassword ? 'HIDE' : 'SHOW'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Special Day Display Tracker multiplier section (No option badge, pure button) */}
          <div className="pt-6 border-t border-gray-100 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-black/10">
              <h4 className="text-[11px] font-black text-[#111111] uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-purple-600 shrink-0" />
                <span>Special Occasion Days</span>
              </h4>
              
              <button
                type="button"
                onClick={() => {
                  const id = 'day_' + Math.random().toString(36).substring(2, 9);
                  setSpecialDays([...specialDays, { id, name: '', date: '' }]);
                }}
                className="flex items-center gap-1 text-[9.5px] font-black uppercase text-purple-700 hover:text-[#111111] bg-purple-50 px-3 py-1.5 border border-purple-200 transition-colors h-8"
              >
                + Add More
              </button>
            </div>

            {specialDays.length === 0 ? (
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider py-1.5 border border-dashed border-gray-200 p-3 bg-neutral-50/50">
                No Special Days/Occasions set for this customer directory account yet. Add custom dates so that they receive reward coupons automatically.
              </p>
            ) : (
              <div className="space-y-3">
                {specialDays.map((day, dIdx) => (
                  <div key={day.id} className="p-3.5 border-2 border-black bg-neutral-50 relative space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-[#111111]/10">
                      <span className="text-[9.5px] font-black text-purple-700 uppercase tracking-wide">
                        Occasion Segment #{dIdx + 1} (Required to save)
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setSpecialDays(specialDays.filter(item => item.id !== day.id));
                        }}
                        className="text-red-500 hover:text-red-750 transition-colors p-1"
                        title="Remove segment"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[9px] font-black text-black uppercase">Day Celebration Name</label>
                        <input 
                          type="text" 
                          required
                          value={day.name}
                          onChange={(e) => {
                            const updated = [...specialDays];
                            updated[dIdx].name = e.target.value;
                            setSpecialDays(updated);
                          }}
                          placeholder="e.g. Birthday, Anniversary"
                          className="w-full h-9 px-2 bg-white border border-gray-300 text-xs font-bold uppercase"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9px] font-black text-black uppercase">Calendar Date Field</label>
                        <input 
                          type="date"
                          required
                          value={day.date}
                          onChange={(e) => {
                            const updated = [...specialDays];
                            updated[dIdx].date = e.target.value;
                            setSpecialDays(updated);
                          }}
                          className="w-full h-9 px-2 bg-white border border-gray-300 text-xs font-bold font-mono"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Action strip */}
          <div className="flex justify-end gap-3 pt-6 border-t border-black/10">
            <button 
              type="button" 
              onClick={() => navigate('/admin/customers')} 
              className="h-11 px-6 border border-zinc-450 hover:bg-zinc-50 text-[10px] font-bold uppercase tracking-wider text-center flex items-center justify-center transition-colors"
            >
              Cancel Profile Changes
            </button>
            <button 
              type="submit"
              className="h-11 px-8 bg-zinc-950 text-white hover:bg-zinc-850 text-[10s] font-black uppercase tracking-widest border border-black flex items-center justify-center transition-colors"
            >
              Sync Client to Database
            </button>
          </div>

        </form>
      </div>

      {/* Profile Photo Crop Canvas Portal Modal code block */}
      {uploadedRawImage && (
        <div className="fixed inset-0 bg-neutral-950/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 select-none animate-fade-in duration-200">
          <div className="bg-white border-2 border-black max-w-[360px] w-full p-6 space-y-4 rounded-none shadow-2xl relative text-left">
            
            {/* Header */}
            <div className="border-b border-black pb-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-purple-600 stroke-[2.5]" />
                  <span>Customize Member Avatar</span>
                </span>
                <button
                  type="button"
                  onClick={() => setUploadedRawImage(null)}
                  className="p-1 hover:bg-neutral-100 transition-colors border border-transparent hover:border-black"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[9px] text-gray-400 uppercase tracking-widest mt-1">
                Drag frame, zoom, or rotate to fit 1:1 format perfectly
              </p>
            </div>

            {/* Visual Viewport with cropped preview guidelines */}
            <div className="relative w-56 h-56 mx-auto border-2 border-black bg-neutral-900 overflow-hidden cursor-move shadow-inner rounded-none">
              <div 
                onMouseDown={handleDragStart}
                onMouseMove={handleDragMove}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
                onTouchStart={handleDragStart}
                onTouchMove={handleDragMove}
                onTouchEnd={handleDragEnd}
                className="absolute inset-0 flex items-center justify-center"
              >
                <img 
                  src={uploadedRawImage} 
                  alt="cropper display preview" 
                  draggable={false}
                  className="absolute origin-center transition-all duration-75 max-w-none pointer-events-none select-none"
                  style={{
                    transform: `translate(calc(-50% + ${panX}px), calc(-50% + ${panY}px)) scale(${zoom}) rotate(${rotation}deg)`,
                    top: '50%',
                    left: '50%',
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain'
                  }}
                />
              </div>

              {/* Grid guide rule lines overlay */}
              <div className="absolute inset-4 border border-dashed border-white/35 pointer-events-none flex flex-col justify-between">
                <div className="border-b border-dashed border-white/20 w-full h-[33%]" />
                <div className="border-t border-dashed border-white/20 w-full h-[33%]" />
              </div>
              <div className="absolute inset-4 border border-dashed border-white/35 pointer-events-none flex justify-between">
                <div className="border-r border-dashed border-white/20 h-full w-[33%]" />
                <div className="border-l border-dashed border-white/20 h-full w-[33%]" />
              </div>
              <div className="absolute inset-0 border-[16px] border-black/75 pointer-events-none" />
              <div className="absolute inset-0 border border-black pointer-events-none" />
            </div>

            {/* Slider bar scaling and rotate controls */}
            <div className="bg-neutral-50 p-3 border border-black space-y-3">
              <div className="flex items-center justify-between text-[9.5px] font-black text-black uppercase tracking-wider">
                <span>Scaling size ({zoom.toFixed(2)}x)</span>
                <span className="text-purple-600 font-extrabold text-[8.5px] bg-purple-50 px-1 py-0.5 border border-purple-200">Locked 1:1</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[9.5px] font-bold text-gray-400">Scale-</span>
                <input 
                  type="range"
                  min="0.8"
                  max="4"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="flex-1 h-1 bg-gray-200 cursor-pointer accent-black uppercase"
                />
                <span className="text-[9.5px] font-bold text-gray-500">Scale+</span>
              </div>

              {/* Action grid block */}
              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-black/15">
                <button
                  type="button"
                  onClick={() => setRotation(r => (r + 90) % 360)}
                  className="h-8 border border-black hover:bg-neutral-100 flex items-center justify-center gap-1 text-[9px] font-black uppercase text-black bg-white"
                >
                  <RotateCw className="w-3 h-3 text-purple-600" />
                  <span>ROTATE</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('modal-inner-uploader');
                    el?.click();
                  }}
                  className="h-8 border border-black hover:bg-neutral-100 flex items-center justify-center gap-1 text-[9px] font-black uppercase text-black bg-white"
                >
                  <UploadCloud className="w-3.5 h-3.5 text-purple-600" />
                  <span>NEW FILE</span>
                </button>
                <input 
                  type="file" 
                  id="modal-inner-uploader" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageUpload} 
                />

                <button
                  type="button"
                  onClick={() => {
                    setZoom(1);
                    setPanX(0);
                    setPanY(0);
                    setRotation(0);
                  }}
                  className="h-8 border border-black hover:bg-neutral-100 flex items-center justify-center text-[9px] font-black uppercase text-neutral-400 bg-white"
                >
                  RESET
                </button>
              </div>
            </div>

            {/* Quick manual nudge arrows */}
            <div className="grid grid-cols-4 gap-1 text-[9px] font-bold text-[#111111] uppercase tracking-wider">
              <button type="button" onClick={() => setPanY(y => y - 5)} className="border border-black py-1 hover:bg-neutral-50 bg-white">▲ Up</button>
              <button type="button" onClick={() => setPanY(y => y + 5)} className="border border-black py-1 hover:bg-neutral-50 bg-white">▼ Down</button>
              <button type="button" onClick={() => setPanX(x => x - 5)} className="border border-black py-1 hover:bg-neutral-50 bg-white">◀ Left</button>
              <button type="button" onClick={() => setPanX(x => x + 5)} className="border border-black py-1 hover:bg-neutral-50 bg-white">▶ Right</button>
            </div>

            {/* Modal Controls buttons footer */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-black/15">
              <button 
                type="button" 
                onClick={() => setUploadedRawImage(null)}
                className="h-9 border border-black text-[10px] font-bold hover:bg-neutral-50 uppercase tracking-wider text-center"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={cropImage}
                className="h-9 bg-purple-600 text-white text-[10px] font-black hover:bg-purple-700 uppercase tracking-wider text-center border border-black"
              >
                Crop & Save
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
