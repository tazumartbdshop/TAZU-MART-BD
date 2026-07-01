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

import AdminCustomerProfile from './AdminCustomerProfile';

export default function AdminCustomers() {
  return (
    <Routes>
      <Route path="/" element={<AdminCustomerList />} />
      <Route path="/add" element={<AdminCustomerAdd />} />
      <Route path="/edit/:id" element={<AdminCustomerAdd />} />
      <Route path="/profile/:id" element={<AdminCustomerProfile />} />
    </Routes>
  );
}

function AdminCustomerList() {
  const { customers, deleteCustomer, updateCustomer, clearDemoData: clearDemoCustomers } = useCustomerStore();
  const { orders } = useOrderStore();
  const { createNewSession, setActiveSession } = useSupportStore();
  const navigate = useNavigate();
  const location = useLocation();

  console.log("[AdminCustomers] Current customers in store:", customers);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  // Auto-open profile from query param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const profileId = params.get('profile');
    if (profileId) {
      navigate(`/admin/customers/profile/${profileId}`);
    }
  }, [location.search, navigate]);

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
          const aMatches = a.name.toLowerCase().includes(q) || a.id.toLowerCase().includes(q) || (a.phone && a.phone.includes(q)) || (a.email && a.email.toLowerCase().includes(q));
          const bMatches = b.name.toLowerCase().includes(q) || b.id.toLowerCase().includes(q) || (b.phone && b.phone.includes(q)) || (b.email && b.email.toLowerCase().includes(q));
          
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
      <div className="flex overflow-x-auto no-scrollbar gap-4 pb-2 snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0">
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
          <div 
            key={idx} 
            className={cn(
              "flex-none w-[240px] md:w-[280px] snap-start p-5 border rounded-xl shadow-sm flex flex-col justify-between h-32 transition-all hover:shadow-md", 
              item.color
            )}
          >
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
                  "flex-none h-[42px] px-5 text-[10px] font-black uppercase tracking-widest rounded-lg border transition-all whitespace-nowrap active:scale-95",
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
        <div className="bg-white border border-zinc-200 rounded-lg p-4 shadow-sm flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300" />
            <input 
              type="text"
              placeholder="Search by Name, Email, Phone or Customer ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-6 bg-zinc-50 border-none rounded-lg text-sm font-medium focus:ring-2 focus:ring-black transition-all placeholder:text-zinc-400"
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
                className="h-12 px-4 bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-rose-100 hover:bg-rose-600 hover:text-white transition-all flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Purge Demo
              </button>
            )}
            <Link 
              to="/admin/customers/add"
              className="h-12 px-6 bg-black text-white rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-zinc-800 transition-all shadow-sm"
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
          <div className="bg-white border-2 border-dashed border-zinc-200 rounded-lg p-20 flex flex-col items-center justify-center text-center">
             <div className="w-16 h-16 bg-zinc-50 rounded-lg flex items-center justify-center mb-4">
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
                (customer.phone && customer.phone.includes(searchQuery)) ||
                (customer.email && customer.email.toLowerCase().includes(searchQuery.toLowerCase()))
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
                  onClick={() => navigate(`/admin/customers/profile/${customer.id}`)}
                  className={cn(
                    "bg-white rounded-lg border transition-all duration-300 flex flex-col group cursor-pointer overflow-hidden",
                    isMatch ? "border-black shadow-lg ring-1 ring-black/5 z-10" : "border-zinc-100 shadow-sm hover:shadow-md"
                  )}
                >
                  {/* Simplified Card Layout */}
                  <div className="p-4 flex gap-4 items-center">
                    <div className="w-14 h-14 shrink-0 rounded-lg bg-zinc-50 overflow-hidden relative border border-zinc-100 shadow-inner">
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
                         {customer.phone || 'No Phone'}
                       </p>
                       <p className="text-[10px] font-bold text-zinc-400 truncate">
                         {customer.email || 'No Email'}
                       </p>
                       <div className="flex items-center gap-2 mt-1">
                          <span className={cn(
                            "px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border",
                            customer.loginProvider === 'Google' ? "bg-red-50 text-red-600 border-red-100" :
                            customer.loginProvider === 'Facebook' ? "bg-blue-50 text-blue-600 border-blue-100" :
                            "bg-zinc-50 text-zinc-600 border-zinc-100"
                          )}>
                            {customer.loginProvider || 'Email'}
                          </span>
                          <span className="text-[9px] font-bold text-zinc-400">
                             Reg: {new Date(customer.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                       <div className="pt-1 flex items-center gap-2">
                          {genderBadge(customer.gender)}
                       </div>
                    </div>
                  </div>

                  <div className="px-4 pb-4 mt-auto">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/admin/customers/profile/${customer.id}`);
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
      </div>
    </div>
  );
}

function AdminCustomerAdd() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { customers, addCustomer, updateCustomer } = useCustomerStore();
  
  const editingCustomer = customers.find(c => c.id === id);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    gender: 'Male',
    address: {
      division: '',
      district: '',
      upazila: '',
      street: '',
      zipCode: ''
    },
    password: '',
    status: 'Active' as Customer['status']
  });

  useEffect(() => {
    if (editingCustomer) {
      setFormData({
        name: editingCustomer.name || '',
        phone: editingCustomer.phone || '',
        email: editingCustomer.email || '',
        gender: editingCustomer.gender || 'Male',
        address: {
          division: editingCustomer.address.division || '',
          district: editingCustomer.address.district || '',
          upazila: editingCustomer.address.upazila || '',
          street: editingCustomer.address.street || '',
          zipCode: editingCustomer.address.zipCode || ''
        },
        password: '',
        status: editingCustomer.status || 'Active'
      });
    }
  }, [editingCustomer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name) newErrors.name = 'Full Client Legal Name is required';
    if (!formData.phone) newErrors.phone = 'Primary Mobile Phone is required';
    if (!formData.email) newErrors.email = 'Primary Email Address is required';
    if (!id && !formData.password) newErrors.password = 'Initial Account Password is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    const toast = (await import('react-hot-toast')).default;
    const toastId = toast.loading(id ? 'Updating records...' : 'Enrolling new client...');

    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        gender: formData.gender,
        address: formData.address,
        password: formData.password || undefined,
        status: formData.status
      };

      if (id) {
        await updateCustomer(id, payload as any);
        toast.success('Customer profile updated successfully', { id: toastId });
      } else {
        await addCustomer(payload as any);
        toast.success('New customer enrolled successfully', { id: toastId });
      }
      navigate('/admin/customers');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to save customer', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
      <div className="bg-black text-white p-8 rounded-xl flex justify-between items-center relative overflow-hidden">
        <div className="relative z-10">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2 block">Configure User Logins and Days Benefits</span>
          <h1 className="text-2xl font-black uppercase tracking-tight">
            {id ? 'Modify Existing Client' : 'Enroll New Core Client'}
          </h1>
        </div>
        <button onClick={() => navigate('/admin/customers')} className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center hover:bg-zinc-700 transition-all">
          <X className="w-6 h-6" />
        </button>
      </div>

      {Object.keys(errors).length > 0 && (
        <div className="bg-rose-50 border border-rose-100 p-6 rounded-xl flex items-start gap-4">
          <div className="w-10 h-10 bg-rose-600 rounded-lg flex items-center justify-center shrink-0">
             <X className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="text-rose-600 font-black uppercase text-sm tracking-wider">Core Enrollment Errors Found:</h4>
            <ul className="mt-1 space-y-0.5">
              {Object.values(errors).map((err, i) => (
                <li key={i} className="text-rose-500 text-xs font-bold uppercase tracking-tight">• {err}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Core Identification */}
        <div className="bg-white border border-zinc-200 rounded-xl p-8 space-y-8 shadow-sm">
          <div className="flex items-center gap-4">
             <div className="w-1 h-8 bg-purple-600 rounded-full"></div>
             <h2 className="text-lg font-black uppercase tracking-tight">Core Identification Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="block text-[11px] font-black uppercase tracking-[0.15em] text-zinc-500">Full Client Legal Name</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="Enter full name"
                className="w-full h-14 px-6 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold uppercase tracking-tight focus:bg-white focus:border-black transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-black uppercase tracking-[0.15em] text-zinc-500">Primary Email Address</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                placeholder="email@example.com"
                className="w-full h-14 px-6 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold lowercase tracking-tight focus:bg-white focus:border-black transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-black uppercase tracking-[0.15em] text-zinc-500">Gender Identity</label>
              <select 
                value={formData.gender}
                onChange={e => setFormData({...formData, gender: e.target.value})}
                className="w-full h-14 px-6 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold uppercase tracking-tight focus:bg-white focus:border-black transition-all"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-black uppercase tracking-[0.15em] text-zinc-500">Primary Mobile Phone</label>
              <input 
                type="text" 
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                placeholder="017XXXXXXXX"
                className="w-full h-14 px-6 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold tracking-tight focus:bg-white focus:border-black transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-black uppercase tracking-[0.15em] text-zinc-500">Account Password</label>
              <input 
                type="password" 
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                placeholder={id ? "Leave empty to keep current" : "Minimum 6 characters"}
                className="w-full h-14 px-6 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold tracking-tight focus:bg-white focus:border-black transition-all"
              />
            </div>
          </div>
        </div>

        {/* Operational Address */}
        <div className="bg-white border border-zinc-200 rounded-xl p-8 space-y-8 shadow-sm">
          <div className="flex items-center gap-4">
             <div className="w-1 h-8 bg-blue-600 rounded-full"></div>
             <h2 className="text-lg font-black uppercase tracking-tight">Operational Address Breakdown</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-[11px] font-black uppercase tracking-[0.15em] text-zinc-500">Division / State</label>
              <input 
                type="text" 
                value={formData.address.division}
                onChange={e => setFormData({...formData, address: {...formData.address, division: e.target.value}})}
                placeholder="e.g. Dhaka"
                className="w-full h-14 px-6 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold uppercase tracking-tight focus:bg-white focus:border-black transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-black uppercase tracking-[0.15em] text-zinc-500">District / City</label>
              <input 
                type="text" 
                value={formData.address.district}
                onChange={e => setFormData({...formData, address: {...formData.address, district: e.target.value}})}
                placeholder="e.g. Gazipur"
                className="w-full h-14 px-6 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold uppercase tracking-tight focus:bg-white focus:border-black transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-black uppercase tracking-[0.15em] text-zinc-500">Area / Upazila</label>
              <input 
                type="text" 
                value={formData.address.upazila}
                onChange={e => setFormData({...formData, address: {...formData.address, upazila: e.target.value}})}
                placeholder="e.g. Tongi"
                className="w-full h-14 px-6 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold uppercase tracking-tight focus:bg-white focus:border-black transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-black uppercase tracking-[0.15em] text-zinc-500">Postal Code</label>
              <input 
                type="text" 
                value={formData.address.zipCode}
                onChange={e => setFormData({...formData, address: {...formData.address, zipCode: e.target.value}})}
                placeholder="1700"
                className="w-full h-14 px-6 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold tracking-tight focus:bg-white focus:border-black transition-all"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="block text-[11px] font-black uppercase tracking-[0.15em] text-zinc-500">Detailed Street Address</label>
              <textarea 
                value={formData.address.street}
                onChange={e => setFormData({...formData, address: {...formData.address, street: e.target.value}})}
                placeholder="House No, Road Name, Landmarks..."
                rows={3}
                className="w-full p-6 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold uppercase tracking-tight focus:bg-white focus:border-black transition-all resize-none"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-col md:flex-row gap-4 pt-4">
           <button 
             type="button"
             onClick={() => navigate('/admin/customers')}
             className="flex-1 h-16 bg-white border border-zinc-200 text-zinc-500 rounded-xl text-[12px] font-black uppercase tracking-[0.2em] hover:bg-zinc-50 transition-all"
           >
             Discard Changes
           </button>
           <button 
             type="submit"
             disabled={isSubmitting}
             className="flex-[2] h-16 bg-black text-white rounded-xl text-[12px] font-black uppercase tracking-[0.2em] hover:bg-zinc-900 transition-all shadow-xl shadow-black/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
           >
             {isSubmitting ? <RotateCw className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5 text-purple-400" />}
             {id ? 'Sync Modified Profile' : 'Enroll Core Client'}
           </button>
        </div>
      </form>
    </div>
  );
}
