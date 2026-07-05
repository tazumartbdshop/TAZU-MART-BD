import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Mail, Smartphone, MapPin, Calendar, Clock, 
  ShoppingBag, Star, Shield, Trash2, Edit, MessageSquare,
  User, CheckCircle, AlertCircle, Loader2, Sparkles,
  Map, Hash, Activity
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useSupportStore } from '../../store/useSupportStore';
import { useCustomerStore } from '../../store/useCustomerStore';
import { toast } from 'react-hot-toast';
import { motion } from 'motion/react';

interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender?: string;
  status: string;
  customer_type?: string;
  profile_image?: string;
  created_at: string;
  last_login?: string;
  last_login_at?: string;
  total_orders?: number;
  total_spend?: number;
  total_reviews?: number;
  last_order_date?: string;
  total_logins?: number;
  occasion_name?: string;
  special_date?: string;
  note?: string;
  address: {
    division?: string;
    district?: string;
    upazila?: string;
    street?: string;
    zipCode?: string;
  };
}

export default function AdminCustomerProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { createNewSession, setActiveSession } = useSupportStore();
  const { customers, deleteCustomer } = useCustomerStore();
  
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchCustomerData();
    }
  }, [id, customers]);

  const fetchCustomerData = async () => {
    try {
      if (!customer) setLoading(true);
      setError(null);

      // 1. Fetch customer identity
      let data = null;
      try {
        const { data: dbData, error: fetchError } = await supabase
          .from('customers')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        if (!fetchError && dbData) {
          data = dbData;
        }
      } catch (err) {
        console.warn('Could not fetch from customers table, falling back to store:', err);
      }
      
      const storeCustomer = customers.find(c => c.id === id);
      const customerData = data || storeCustomer;

      if (!customerData) {
        setError('Customer not found');
        return;
      }

      // 2. Fetch total reviews count
      const { count: reviewCount } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', id);

      // 3. Fetch last order date (querying by email or phone if user_id link is weak)
      let lastOrderDate = null;
      try {
        const orConditions = [];
        const email = customerData.email || customerData.emails?.[0];
        const phone = customerData.phone || customerData.phones?.[0];
        
        if (email) orConditions.push(`email.eq.${email}`);
        if (phone) orConditions.push(`mobile_number.eq.${phone}`);
        
        if (orConditions.length > 0) {
          const { data: ordersData, error: ordersError } = await supabase
            .from('orders')
            .select('date')
            .or(orConditions.join(','))
            .order('date', { ascending: false })
            .limit(1)
            .maybeSingle();
            
          if (!ordersError && ordersData) {
            lastOrderDate = ordersData.date;
          }
        }
      } catch (e) {
        console.warn('Failed to fetch last order date', e);
      }

      // Map to camelCase if necessary (matching the DB structure)
      const mappedCustomer: CustomerProfile = {
        id: customerData.id,
        name: customerData.name || 'Anonymous User',
        email: customerData.email || (customerData.emails?.[0] || ''),
        phone: customerData.phone || (customerData.phones?.[0] || ''),
        gender: customerData.gender,
        status: customerData.status || 'Active',
        customer_type: customerData.customer_type || customerData.customerType || 'Regular',
        profile_image: customerData.profile_image || customerData.profileImage,
        created_at: customerData.created_at || customerData.createdAt,
        last_login: customerData.last_login,
        last_login_at: customerData.last_login_at,
        total_orders: customerData.total_orders || customerData.totalOrders,
        total_spend: customerData.total_spend || customerData.totalSpend,
        total_reviews: reviewCount || 0,
        last_order_date: lastOrderDate,
        total_logins: customerData.total_logins,
        occasion_name: customerData.occasion_name,
        special_date: customerData.special_date,
        note: customerData.note,
        address: customerData.address || {}
      };

      setCustomer(mappedCustomer);
    } catch (err: any) {
      console.error("[Profile Fetch] Error:", err);
      toast.error(err.message || 'Failed to load customer profile');
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!customer) return;
    if (window.confirm('IRREVERSIBLE: Delete this customer profile permanently? This will instantly terminate their current session.')) {
      try {
        await deleteCustomer(customer.id);
        toast.success('Customer deleted successfully');
        navigate('/admin/customers');
      } catch (err: any) {
        toast.error(err.message || 'Failed to delete customer');
      }
    }
  };

  const handleChat = () => {
    if (!customer) return;
    const sId = createNewSession(customer.name, customer.phone || 'N/A');
    setActiveSession(sId);
    navigate('/admin/support');
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-zinc-400 animate-spin mb-4" />
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Loading Profile...</p>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="flex-1 p-6">
        <button onClick={() => navigate('/admin/customers')} className="flex items-center gap-2 text-zinc-500 hover:text-black mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Back to Customers</span>
        </button>
        <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-rose-500" />
          </div>
          <h2 className="text-xl font-black text-zinc-900 uppercase mb-2">{error || 'Customer Not Found'}</h2>
          <p className="text-zinc-500 text-sm mb-6 max-w-md mx-auto">The customer profile you are looking for does not exist or has been removed from the database.</p>
          <button 
            onClick={() => navigate('/admin/customers')}
            className="px-8 py-3 bg-black text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all"
          >
            Return to Listing
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full pb-20"
    >
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button onClick={() => navigate('/admin/customers')} className="flex items-center gap-2 text-zinc-500 hover:text-black transition-colors group w-fit">
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span className="text-xs font-bold uppercase tracking-wider">Back to Customers</span>
        </button>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(`/admin/customers/edit/${customer.id}`)}
            className="flex-1 sm:flex-none h-10 px-6 bg-zinc-100 text-zinc-900 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 flex items-center justify-center gap-2 transition-all border border-zinc-200"
          >
            <Edit className="w-3.5 h-3.5" /> Edit Profile
          </button>
          <button 
            onClick={handleChat}
            className="flex-1 sm:flex-none h-10 px-6 bg-black text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 flex items-center justify-center gap-2 transition-all shadow-lg"
          >
            <MessageSquare className="w-3.5 h-3.5" /> Live Support
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Identity Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm sticky top-8">
            <div className="h-24 bg-gradient-to-br from-zinc-900 to-zinc-800"></div>
            <div className="px-6 pb-8 -mt-12 text-center">
              <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-xl overflow-hidden mx-auto mb-4 bg-zinc-100">
                {customer.profile_image ? (
                  <img src={customer.profile_image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-white text-3xl font-black">
                    {customer.name.charAt(0)}
                  </div>
                )}
              </div>
              
              <h2 className="text-xl font-black text-zinc-900 uppercase mb-1">{customer.name}</h2>
              <div className="flex justify-center gap-2 mb-6">
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm ${
                  customer.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                  customer.status === 'VIP' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                  'bg-rose-50 text-rose-700 border-rose-100'
                }`}>
                  {customer.status}
                </span>
                <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-zinc-100 bg-zinc-50 text-zinc-600">
                  {customer.customer_type || 'Regular'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-8">
                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                  <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1">Orders</p>
                  <p className="text-xl font-black text-zinc-900">{customer.total_orders || 0}</p>
                </div>
                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                  <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1">Reviews</p>
                  <p className="text-xl font-black text-purple-600">{customer.total_reviews || 0}</p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-zinc-100 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400 text-[10px] font-black">
                    ৳
                  </div>
                  <div className="flex-1 truncate">
                    <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-0.5">Total Revenue</p>
                    <p className="text-xs font-bold text-emerald-600 truncate">৳{(customer.total_spend || 0).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div className="flex-1 truncate">
                    <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-0.5">Last Order Date</p>
                    <p className="text-xs font-bold text-zinc-900 truncate">
                      {customer.last_order_date ? new Date(customer.last_order_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'No Orders Yet'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="flex-1 truncate">
                    <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-0.5">Email Address</p>
                    <p className="text-xs font-bold text-zinc-900 truncate">{customer.email || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div className="flex-1 truncate">
                    <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-0.5">Mobile Number</p>
                    <p className="text-xs font-bold text-zinc-900 truncate">{customer.phone || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="flex-1 truncate">
                    <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-0.5">Member Since</p>
                    <p className="text-xs font-bold text-zinc-900 truncate">{new Date(customer.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-zinc-100">
                <button 
                  onClick={handleDelete}
                  className="w-full h-11 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all border border-rose-100"
                >
                  Terminate Account
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Info Sections */}
        <div className="lg:col-span-2 space-y-6">
          {/* Detailed Information Section */}
          <section className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-900">Personal Information</h3>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
              <div>
                <label className="block text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1.5">Full Name</label>
                <p className="text-sm font-bold text-zinc-900">{customer.name}</p>
              </div>
              <div>
                <label className="block text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1.5">Gender Identity</label>
                <p className="text-sm font-bold text-zinc-900 uppercase">{customer.gender || 'Not Provided'}</p>
              </div>
              <div>
                <label className="block text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1.5">Special Occasion</label>
                <p className="text-sm font-bold text-purple-600 uppercase">{customer.occasion_name || 'None'}</p>
              </div>
              <div>
                <label className="block text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1.5">Special Date</label>
                <p className="text-sm font-bold text-zinc-900">{customer.special_date || 'N/A'}</p>
              </div>
              <div className="col-span-1 sm:col-span-2">
                <label className="block text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1.5">Unique Customer ID (UUID)</label>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-zinc-50 px-3 py-1.5 rounded-lg border border-zinc-100 font-mono text-zinc-600 flex-1">{customer.id}</code>
                </div>
              </div>
            </div>
          </section>

          {/* Address Information Section */}
          <section className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center gap-3">
              <MapPin className="w-4 h-4 text-emerald-500" />
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-900">Address & Logistics</h3>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                <label className="block text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1">Division</label>
                <p className="text-sm font-black text-zinc-900 uppercase">{customer.address.division || 'N/A'}</p>
              </div>
              <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                <label className="block text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1">District</label>
                <p className="text-sm font-black text-zinc-900 uppercase">{customer.address.district || 'N/A'}</p>
              </div>
              <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                <label className="block text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1">Upazila / Thana</label>
                <p className="text-sm font-black text-zinc-900 uppercase">{customer.address.upazila || 'N/A'}</p>
              </div>
              <div className="sm:col-span-3 p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                <label className="block text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1">Detailed Street Address</label>
                <p className="text-sm font-bold text-zinc-900">{customer.address.street || 'No street address provided'}</p>
                {customer.address.zipCode && (
                  <p className="mt-2 text-xs text-zinc-400 font-bold italic uppercase tracking-wider">Post Code: {customer.address.zipCode}</p>
                )}
              </div>
            </div>
          </section>

          {/* Account Metrics Section */}
          <section className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center gap-3">
              <Activity className="w-4 h-4 text-blue-500" />
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-900">Account Engagement</h3>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <label className="block text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-0.5">Last Login Activity</label>
                  <p className="text-sm font-black text-zinc-900">{customer.last_login_at ? new Date(customer.last_login_at).toLocaleString() : 'Never Active'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                  <Hash className="w-5 h-5" />
                </div>
                <div>
                  <label className="block text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-0.5">Total Access Sessions</label>
                  <p className="text-sm font-black text-zinc-900">{customer.total_logins || 0} Dynamic Sessions</p>
                </div>
              </div>
              {customer.note && (
                <div className="sm:col-span-2 p-5 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <label className="block text-[8px] font-black text-amber-700/60 uppercase tracking-widest mb-1">Administrative Intelligence</label>
                    <p className="text-sm text-amber-900 font-bold italic leading-relaxed">"{customer.note}"</p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </motion.div>
  );
}
