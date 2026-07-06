import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Routes, Route, Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { 
  Search, Plus, Edit, Trash2, X, Image as ImageIcon, Eye, EyeOff, Lock, Mail, 
  Smartphone, MapPin, Calendar, Trash, RotateCw, UploadCloud, ChevronDown, Check, Sparkles, MessageSquare, User
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
      deleteCustomer(customerId).catch(err => {
        console.error("[AdminCustomers] Delete customer failed:", err);
        // We can use a toast or just a console error as the confirmation alert already handled intent
      });
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
  
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    confirmPassword: '',
    status: 'Active' as Customer['status'],
    profileImage: ''
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
        confirmPassword: '',
        status: editingCustomer.status || 'Active',
        profileImage: editingCustomer.profileImage || ''
      });
    }
  }, [editingCustomer]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [formData.address.street]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, profileImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFormData(prev => ({ ...prev, profileImage: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let pass = "";
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password: pass, confirmPassword: pass }));
  };

  const passStrength = useMemo(() => {
    const pass = formData.password;
    if (!pass) return { strength: 'empty', message: '', borderClass: 'border-[#E5E5E5]' };

    const hasLetter = /[a-zA-Z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    const hasSpecial = /[@#$!%*?&]/.test(pass);
    const isOnlyNumbers = /^[0-9]+$/.test(pass);

    if (isOnlyNumbers) {
      return {
        strength: 'weak',
        message: 'Password must include letters and special characters.',
        borderClass: 'border-red-500 focus:border-red-600 focus:ring-red-500/10'
      };
    }

    if (hasLetter && hasNumber && hasSpecial && pass.length >= 6) {
      return {
        strength: 'strong',
        message: 'Strong Password',
        borderClass: 'border-emerald-500 focus:border-emerald-600 focus:ring-emerald-500/10'
      };
    }

    return {
      strength: 'medium',
      message: 'Medium Password',
      borderClass: 'border-amber-500 focus:border-amber-600 focus:ring-amber-500/10'
    };
  }, [formData.password]);

  const isPasswordsMatching = formData.password && formData.password === formData.confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name) newErrors.name = 'Full Name is required';
    if (!formData.phone) newErrors.phone = 'Phone Number is required';
    if (!formData.address.street) newErrors.address = 'Address is required';
    if (!id && !formData.password) newErrors.password = 'Password is required';
    if (formData.password && !isPasswordsMatching) newErrors.confirmPassword = 'Passwords do not match';

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
        status: formData.status,
        profileImage: formData.profileImage
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
    <div className="min-h-screen bg-neutral-50/50 flex flex-col items-center p-4 py-8 md:py-12 font-sans text-neutral-900">
      <div className="w-full max-w-[550px] bg-white p-6 md:p-8 rounded-[24px] border border-neutral-200 shadow-sm relative">
        <button 
          type="button"
          onClick={() => navigate('/admin/customers')} 
          className="absolute right-6 top-6 w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center hover:bg-neutral-200 transition-colors"
        >
          <X className="w-4 h-4 text-neutral-500" />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-xl font-black tracking-tight uppercase">ADD CUSTOMER</h2>
        </div>

        {Object.keys(errors).length > 0 && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 text-red-700 text-xs font-semibold border border-red-100 flex items-start gap-2.5">
            <X className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <ul className="space-y-1">
                {Object.values(errors).map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Profile Picture Box (1:1 Square) */}
          <div className="flex flex-col items-center space-y-2 mb-4">
            <label className="block text-[11px] font-extrabold text-neutral-500 uppercase tracking-wider">
              Profile Picture
            </label>
            <div 
              onClick={handleImageClick}
              className="relative w-28 h-28 rounded-2xl border-2 border-dashed border-neutral-200 hover:border-black bg-neutral-50 flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all duration-200 group shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
            >
              {formData.profileImage ? (
                <>
                  <img src={formData.profileImage} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white space-y-1">
                    <ImageIcon className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Change</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center text-center p-3 text-neutral-400 group-hover:text-neutral-600 transition-colors">
                  <ImageIcon className="w-5 h-5 mb-1 text-neutral-400 group-hover:text-black transition-colors" />
                  <UploadCloud className="w-3.5 h-3.5 text-neutral-300 group-hover:text-black transition-colors mb-1.5" />
                  <span className="text-[9px] font-extrabold uppercase tracking-widest leading-none">Tap to Upload</span>
                </div>
              )}
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                onChange={handleImageChange} 
                className="hidden" 
              />
            </div>
            {formData.profileImage && (
              <button 
                type="button" 
                onClick={handleRemoveImage}
                className="text-[10px] font-extrabold text-red-500 hover:text-red-600 uppercase tracking-wider"
              >
                Remove Image
              </button>
            )}
          </div>

          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-black text-neutral-500 uppercase tracking-wider ml-1">Full Name *</label>
            <div className="relative">
              <input 
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full h-[50px] border border-[#E5E5E5] focus:border-black focus:ring-1 focus:ring-black rounded-[14px] pl-10 pr-10 text-sm transition-all duration-150 outline-none"
                placeholder="Full Name" 
              />
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            </div>
          </div>

          {/* Phone Number */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-black text-neutral-500 uppercase tracking-wider ml-1">Phone Number *</label>
            <div className="relative flex items-center">
              <span className="absolute left-10 text-sm font-bold text-neutral-800 border-r border-neutral-200 pr-2 h-5 flex items-center select-none">
                +880
              </span>
              <input 
                type="tel" 
                value={formData.phone}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 11);
                  setFormData({...formData, phone: val});
                }}
                className="w-full h-[50px] border border-[#E5E5E5] focus:border-black focus:ring-1 focus:ring-black rounded-[14px] pl-24 pr-10 text-sm transition-all duration-150 outline-none"
                placeholder="1834800916" 
              />
              <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-black text-neutral-500 uppercase tracking-wider ml-1">Address *</label>
            <div className="relative">
              <textarea 
                ref={textareaRef}
                value={formData.address.street}
                onChange={e => setFormData({...formData, address: {...formData.address, street: e.target.value}})}
                className="w-full h-[50px] min-h-[50px] max-h-[180px] border border-[#E5E5E5] focus:border-black focus:ring-1 focus:ring-black rounded-[14px] py-3.5 pl-10 pr-10 text-sm transition-all duration-150 outline-none resize-none overflow-y-auto block leading-relaxed"
                placeholder="Street Address, Village/City, Division *" 
              />
              <MapPin className="absolute left-3.5 top-[15px] w-4 h-4 text-neutral-400" />
            </div>
          </div>

          {/* Email (Optional) */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-black text-neutral-500 uppercase tracking-wider ml-1">Email (Optional)</label>
            <div className="relative">
              <input 
                type="email" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full h-[50px] border border-[#E5E5E5] rounded-[14px] pl-10 pr-4 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all duration-150"
                placeholder="john@example.com" 
              />
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            </div>
          </div>

          {/* Password with Generate option */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center px-1">
              <label className="block text-[11px] font-black text-neutral-500 uppercase tracking-wider">Password {id ? '(Optional)' : '*'}</label>
              {passStrength.strength !== 'empty' && (
                <span className={cn(
                  "text-[10px] font-extrabold uppercase tracking-widest",
                  passStrength.strength === 'weak' && "text-red-500",
                  passStrength.strength === 'medium' && "text-amber-500",
                  passStrength.strength === 'strong' && "text-emerald-500"
                )}>
                  {passStrength.message}
                </span>
              )}
            </div>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                className={cn(
                  "w-full h-[50px] border rounded-[14px] pl-10 pr-12 text-sm outline-none transition-all duration-150",
                  passStrength.strength === 'empty' ? "border-[#E5E5E5] focus:border-black focus:ring-1 focus:ring-black" : passStrength.borderClass
                )}
                placeholder={id ? "Leave blank to keep current" : "••••••••"} 
              />
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <button 
                type="button" 
                onClick={(e) => {
                  e.preventDefault();
                  setShowPassword(!showPassword);
                }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-1 z-10"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={generatePassword}
                className="text-[10px] font-black uppercase text-blue-600 hover:text-blue-700 tracking-widest transition-colors flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                Generate Password
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-black text-neutral-500 uppercase tracking-wider ml-1">Confirm Password {id ? '(Optional)' : '*'}</label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={formData.confirmPassword}
                onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                className={cn(
                  "w-full h-[50px] border rounded-[14px] pl-10 pr-10 text-sm outline-none transition-all duration-150",
                  !formData.confirmPassword 
                    ? "border-[#E5E5E5] focus:border-black focus:ring-1 focus:ring-black" 
                    : isPasswordsMatching
                      ? "border-emerald-500 bg-emerald-50/5 focus:ring-1 focus:ring-emerald-500"
                      : "border-red-500 bg-red-50/5 focus:ring-1 focus:ring-red-500"
                )}
                placeholder="••••••••" 
              />
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              {formData.confirmPassword && (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center">
                  {isPasswordsMatching ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <X className="w-4 h-4 text-red-500" />
                  )}
                </div>
              )}
            </div>
            {formData.confirmPassword && !isPasswordsMatching && (
              <p className="text-[10.5px] text-red-500 font-bold uppercase tracking-wider ml-1 mt-1">
                Password does not match.
              </p>
            )}
          </div>

          {/* Gender selection */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-black text-neutral-500 uppercase tracking-wider ml-1">Gender *</label>
            <div className="flex gap-6 pl-1 pt-1">
              {['Male', 'Female', 'Other'].map(g => (
                <label key={g} className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="radio" 
                    name="gender" 
                    value={g} 
                    checked={formData.gender === g} 
                    onChange={e => setFormData({...formData, gender: e.target.value})}
                    className="w-4.5 h-4.5 accent-black text-black border-neutral-300 focus:ring-0" 
                  />
                  <span className="text-sm font-semibold text-neutral-700 group-hover:text-black transition-colors">{g}</span>
                </label>
              ))}
            </div>
          </div>
          
          {/* Status */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-black text-neutral-500 uppercase tracking-wider ml-1">Account Status</label>
            <div className="relative">
              <select 
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value as Customer['status']})}
                className="w-full h-[50px] border border-[#E5E5E5] focus:border-black focus:ring-1 focus:ring-black rounded-[14px] px-4 text-sm transition-all duration-150 outline-none appearance-none bg-white"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <ChevronDown className="w-4 h-4 text-neutral-400" />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full h-[54px] bg-neutral-950 hover:bg-neutral-900 text-white rounded-[16px] font-black uppercase tracking-widest text-xs flex justify-center items-center gap-2 mt-4 transition-all duration-150 active:scale-98 shadow-[0_4px_12px_rgba(0,0,0,0.1)] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? <RotateCw className="w-5 h-5 animate-spin" /> : 'SAVE CUSTOMER'}
          </button>
        </form>
      </div>
    </div>
  );
}

