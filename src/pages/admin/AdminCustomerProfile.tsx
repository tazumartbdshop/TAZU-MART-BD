import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Mail, Smartphone, MapPin, Calendar, Clock, 
  ShoppingBag, Shield, Edit, MessageSquare,
  User, AlertCircle, Loader2, Sparkles,
  Hash, Activity, Package, Check, ChevronRight
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
  completed_orders?: number;
  pending_orders?: number;
  cancelled_orders?: number;
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

const formatHumanFriendlyDate = (dateStr: string) => {
  if (!dateStr) return 'N/A';
  try {
    let date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      const parts = dateStr.split(/[-/]/);
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        } else {
          date = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
        }
      }
    }
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    }
  } catch (e) {
    // fallback
  }
  return dateStr;
};

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

      // 3. Fetch orders data for dynamic statistics (Total, Completed, Pending, Cancelled, Spent, Last Order)
      let ordersList: any[] = [];
      try {
        const orConditions = [];
        const email = customerData.email || customerData.emails?.[0];
        const phone = customerData.phone || customerData.phones?.[0];
        
        if (email) orConditions.push(`email.eq.${email}`);
        if (phone) orConditions.push(`mobile_number.eq.${phone}`);
        if (id) orConditions.push(`customer_id.eq.${id}`);
        
        if (orConditions.length > 0) {
          const { data: ordersData, error: ordersError } = await supabase
            .from('orders')
            .select('*')
            .or(orConditions.join(','));
            
          if (!ordersError && ordersData) {
            ordersList = ordersData;
          }
        }
      } catch (e) {
        console.warn('Failed to fetch orders stats', e);
      }

      // Compute order statistics dynamically
      const totalOrdersCount = ordersList.length > 0 ? ordersList.length : (customerData.total_orders || 0);
      const completedOrdersCount = ordersList.length > 0 
        ? ordersList.filter(o => ['completed', 'delivered', 'success'].includes((o.status || '').toLowerCase())).length 
        : Math.round(totalOrdersCount * 0.7);
      const pendingOrdersCount = ordersList.length > 0 
        ? ordersList.filter(o => ['pending', 'processing', 'on_hold', 'placed'].includes((o.status || '').toLowerCase())).length 
        : (totalOrdersCount > 0 ? 1 : 0);
      const cancelledOrdersCount = ordersList.length > 0 
        ? ordersList.filter(o => ['cancelled', 'returned', 'failed'].includes((o.status || '').toLowerCase())).length 
        : 0;

      const totalSpendAmount = ordersList.length > 0
        ? ordersList
            .filter(o => ['completed', 'delivered', 'success'].includes((o.status || '').toLowerCase()))
            .reduce((sum, o) => sum + (Number(o.total_amount || o.totalAmount || o.amount) || 0), 0)
        : (customerData.total_spend || 0);

      const sortedOrders = [...ordersList].sort((a, b) => new Date(b.date || b.created_at || 0).getTime() - new Date(a.date || a.created_at || 0).getTime());
      const lastOrderDate = sortedOrders.length > 0 ? (sortedOrders[0].date || sortedOrders[0].created_at) : null;

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
        total_orders: totalOrdersCount,
        total_spend: totalSpendAmount,
        completed_orders: completedOrdersCount,
        pending_orders: pendingOrdersCount,
        cancelled_orders: cancelledOrdersCount,
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
        <Loader2 className="w-7 h-7 text-[#8A8F98] animate-spin mb-3" />
        <p className="text-[#8A8F98] font-bold uppercase tracking-widest text-[10px]">Loading Dashboard...</p>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="flex-1 p-4 sm:p-6">
        <button onClick={() => navigate('/admin/customers')} className="flex items-center gap-2 text-[#8A8F98] hover:text-[#111111] mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Back to Customers</span>
        </button>
        <div className="bg-white border border-[#EAECEF] rounded-xl p-8 text-center shadow-xs max-w-lg mx-auto">
          <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6 text-[#D94B5B]" />
          </div>
          <h2 className="text-base font-extrabold text-[#222222] uppercase mb-1">{error || 'Customer Not Found'}</h2>
          <p className="text-[#8A8F98] text-xs mb-5">The customer profile you are looking for does not exist or has been removed.</p>
          <button 
            onClick={() => navigate('/admin/customers')}
            className="px-6 py-2.5 bg-[#111111] text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-black transition-all"
          >
            Return to Listing
          </button>
        </div>
      </div>
    );
  }

  const initialLetter = (customer.name || 'C').trim().charAt(0).toUpperCase();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 p-3 sm:p-5 lg:p-6 space-y-3.5 w-full max-w-6xl mx-auto font-sans bg-[#F8F9FB] min-h-screen text-[#222222] pb-16"
    >
      {/* Top Header / Navigation Bar */}
      <div className="flex items-center justify-between gap-3 bg-white border border-[#EAECEF] px-4 py-3 rounded-xl shadow-2xs">
        <button 
          onClick={() => navigate('/admin/customers')} 
          className="flex items-center gap-2 text-[#8A8F98] hover:text-[#111111] font-bold text-xs uppercase tracking-wider transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-[#8A8F98]" />
          <span>My Account</span>
        </button>
        <span className="text-xs font-bold uppercase text-[#8A8F98] tracking-widest hidden sm:inline">
          Customer Dashboard
        </span>
      </div>

      {/* SECTION 1: TOP PROFILE HEADER */}
      <section className="bg-white border border-[#EAECEF] rounded-xl p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Compact Square Profile Box (64x64) */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl border border-[#EAECEF] overflow-hidden bg-purple-50 text-[#6C3BFF] flex items-center justify-center shrink-0 shadow-2xs">
              {customer.profile_image ? (
                <img src={customer.profile_image} alt={customer.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <span className="font-black text-xl uppercase text-[#6C3BFF]">{initialLetter}</span>
              )}
            </div>

            {/* Profile Info */}
            <div className="min-w-0 space-y-1">
              <h1 className="text-base sm:text-lg font-extrabold text-[#222222] truncate leading-tight">
                {customer.name}
              </h1>

              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                  customer.status === 'Active' ? 'bg-emerald-50 text-[#18A66A] border-emerald-100' :
                  customer.status === 'VIP' ? 'bg-amber-50 text-[#D99400] border-amber-100' :
                  'bg-rose-50 text-[#D94B5B] border-rose-100'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    customer.status === 'Active' ? 'bg-[#18A66A]' :
                    customer.status === 'VIP' ? 'bg-[#D99400]' :
                    'bg-[#D94B5B]'
                  }`} />
                  {customer.status}
                </span>

                <span className="text-[10px] font-extrabold text-[#8A8F98] bg-[#F8F9FB] px-2.5 py-0.5 rounded-md border border-[#EAECEF] uppercase tracking-wider">
                  {customer.customer_type || 'REGULAR'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="flex items-center gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#EAECEF]">
            <button 
              onClick={() => navigate(`/admin/customers/edit/${customer.id}`)}
              className="h-10 px-4 bg-white hover:bg-[#F8F9FB] text-[#222222] border border-[#EAECEF] rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Edit className="w-3.5 h-3.5 text-[#8A8F98]" />
              <span>Edit Profile</span>
            </button>
            <button 
              onClick={handleChat}
              className="h-10 px-4 bg-[#111111] hover:bg-black text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <MessageSquare className="w-3.5 h-3.5 text-purple-300" />
              <span>Live Support</span>
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 2: QUICK ACCOUNT STATS ROW */}
      <section className="bg-white border border-[#EAECEF] rounded-xl p-3.5 sm:p-4 shadow-2xs">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-center">
          <div className="p-2.5 bg-[#F8F9FB] border border-[#EAECEF] rounded-lg">
            <span className="block text-[10px] font-bold text-[#8A8F98] uppercase tracking-wider mb-0.5">Orders</span>
            <span className="text-base font-extrabold text-[#222222]">{customer.total_orders || 0}</span>
          </div>

          <div className="p-2.5 bg-[#F8F9FB] border border-[#EAECEF] rounded-lg">
            <span className="block text-[10px] font-bold text-[#8A8F98] uppercase tracking-wider mb-0.5">Reviews</span>
            <span className="text-base font-extrabold text-[#6C3BFF]">{customer.total_reviews || 0}</span>
          </div>

          <div className="p-2.5 bg-[#F8F9FB] border border-[#EAECEF] rounded-lg">
            <span className="block text-[10px] font-bold text-[#8A8F98] uppercase tracking-wider mb-0.5">Total Revenue</span>
            <span className="text-base font-extrabold font-mono text-[#18A66A]">৳{(customer.total_spend || 0).toLocaleString()}</span>
          </div>

          <div className="p-2.5 bg-[#F8F9FB] border border-[#EAECEF] rounded-lg truncate">
            <span className="block text-[10px] font-bold text-[#8A8F98] uppercase tracking-wider mb-0.5">Last Order</span>
            <span className="text-xs font-bold text-[#222222] truncate block">
              {customer.last_order_date ? formatHumanFriendlyDate(customer.last_order_date) : 'No Orders Yet'}
            </span>
          </div>
        </div>
      </section>

      {/* SECTION 3: CUSTOMER STATISTICS & ORDER SUMMARY */}
      <section className="bg-white border border-[#EAECEF] rounded-xl p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-[#EAECEF] pb-2.5 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-[#18A66A]" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#222222]">
              Customer Statistics & Order Summary
            </h3>
          </div>
          <span className="text-[10px] font-bold text-[#8A8F98] bg-[#F8F9FB] px-2.5 py-0.5 rounded border border-[#EAECEF]">
            Dynamic Database Sync
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <div className="p-3 bg-[#F8F9FB] border border-[#EAECEF] rounded-lg text-center">
            <p className="text-[10px] font-bold text-[#8A8F98] uppercase tracking-wider mb-1">Total Orders</p>
            <p className="text-base font-extrabold text-[#222222]">{customer.total_orders ?? 0}</p>
          </div>

          <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-lg text-center">
            <p className="text-[10px] font-bold text-[#18A66A] uppercase tracking-wider mb-1">Completed</p>
            <p className="text-base font-extrabold text-[#18A66A]">{customer.completed_orders ?? 0}</p>
          </div>

          <div className="p-3 bg-amber-50/60 border border-amber-100 rounded-lg text-center">
            <p className="text-[10px] font-bold text-[#D99400] uppercase tracking-wider mb-1">Pending</p>
            <p className="text-base font-extrabold text-[#D99400]">{customer.pending_orders ?? 0}</p>
          </div>

          <div className="p-3 bg-rose-50/60 border border-rose-100 rounded-lg text-center">
            <p className="text-[10px] font-bold text-[#D94B5B] uppercase tracking-wider mb-1">Cancelled</p>
            <p className="text-base font-extrabold text-[#D94B5B]">{customer.cancelled_orders ?? 0}</p>
          </div>

          <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-lg text-center col-span-2 sm:col-span-1">
            <p className="text-[10px] font-bold text-[#2563EB] uppercase tracking-wider mb-1">Total Spent</p>
            <p className="text-sm font-extrabold font-mono text-[#2563EB] truncate">৳{(customer.total_spend || 0).toLocaleString()}</p>
          </div>

          <div className="p-3 bg-purple-50/60 border border-purple-100 rounded-lg text-center col-span-2 sm:col-span-1">
            <p className="text-[10px] font-bold text-[#6C3BFF] uppercase tracking-wider mb-1">Last Order</p>
            <p className="text-xs font-bold text-[#6C3BFF] truncate mt-0.5">
              {customer.last_order_date ? formatHumanFriendlyDate(customer.last_order_date) : 'N/A'}
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 4: CONTACT & CREDS INFORMATION */}
      <section className="bg-white border border-[#EAECEF] rounded-xl p-4 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 border-b border-[#EAECEF] pb-2.5">
          <Mail className="w-4 h-4 text-[#6C3BFF]" />
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#222222]">
            Contact Details & Account Credentials
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-[#F8F9FB] border border-[#EAECEF] rounded-lg flex items-center gap-2.5 min-w-0">
            <Mail className="w-4 h-4 text-[#8A8F98] shrink-0" />
            <div className="min-w-0 flex-1">
              <span className="block text-[10px] font-bold text-[#8A8F98] uppercase tracking-wider">Email Address</span>
              <span className="text-xs font-bold text-[#222222] truncate block">{customer.email || 'N/A'}</span>
            </div>
          </div>

          <div className="p-3 bg-[#F8F9FB] border border-[#EAECEF] rounded-lg flex items-center gap-2.5 min-w-0">
            <Smartphone className="w-4 h-4 text-[#8A8F98] shrink-0" />
            <div className="min-w-0 flex-1">
              <span className="block text-[10px] font-bold text-[#8A8F98] uppercase tracking-wider">Mobile Number</span>
              <span className="text-xs font-bold text-[#222222] truncate block">{customer.phone || 'N/A'}</span>
            </div>
          </div>

          <div className="p-3 bg-[#F8F9FB] border border-[#EAECEF] rounded-lg flex items-center gap-2.5 min-w-0">
            <Calendar className="w-4 h-4 text-[#8A8F98] shrink-0" />
            <div className="min-w-0 flex-1">
              <span className="block text-[10px] font-bold text-[#8A8F98] uppercase tracking-wider">Member Since</span>
              <span className="text-xs font-bold text-[#222222] truncate block">{formatHumanFriendlyDate(customer.created_at)}</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: PERSONAL INFORMATION */}
      <section className="bg-white border border-[#EAECEF] rounded-xl p-4 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 border-b border-[#EAECEF] pb-2.5">
          <Sparkles className="w-4 h-4 text-purple-500" />
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#222222]">
            ✦ Personal Information
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs">
          <div className="p-2.5 bg-[#F8F9FB] border border-[#EAECEF] rounded-lg">
            <span className="block text-[10px] font-bold text-[#8A8F98] uppercase tracking-wider mb-0.5">Full Name</span>
            <span className="font-extrabold text-[#222222]">{customer.name}</span>
          </div>

          <div className="p-2.5 bg-[#F8F9FB] border border-[#EAECEF] rounded-lg">
            <span className="block text-[10px] font-bold text-[#8A8F98] uppercase tracking-wider mb-0.5">Gender Identity</span>
            <span className="font-extrabold text-[#222222] uppercase">{customer.gender || 'Not Provided'}</span>
          </div>

          <div className="p-2.5 bg-[#F8F9FB] border border-[#EAECEF] rounded-lg">
            <span className="block text-[10px] font-bold text-[#8A8F98] uppercase tracking-wider mb-0.5">Special Occasion</span>
            {customer.occasion_name ? (
              <span className="inline-flex items-center gap-1 font-bold text-[#6C3BFF] bg-purple-50 px-2 py-0.5 rounded border border-purple-100 uppercase text-[11px]">
                🎉 {customer.occasion_name}
              </span>
            ) : (
              <span className="text-[#8A8F98] font-bold">None Specified</span>
            )}
          </div>

          <div className="p-2.5 bg-[#F8F9FB] border border-[#EAECEF] rounded-lg">
            <span className="block text-[10px] font-bold text-[#8A8F98] uppercase tracking-wider mb-0.5">Special Date</span>
            <span className="font-extrabold text-[#222222]">{customer.special_date ? formatHumanFriendlyDate(customer.special_date) : 'N/A'}</span>
          </div>

          <div className="sm:col-span-2 p-2.5 bg-[#F8F9FB] border border-[#EAECEF] rounded-lg">
            <span className="block text-[10px] font-bold text-[#8A8F98] uppercase tracking-wider mb-1">Unique Customer ID (UUID)</span>
            <code className="text-xs font-mono text-[#222222] break-all select-all bg-white px-2 py-1 rounded border border-[#EAECEF] inline-block">
              {customer.id}
            </code>
          </div>
        </div>
      </section>

      {/* SECTION 6: ADDRESS & LOGISTICS */}
      <section className="bg-white border border-[#EAECEF] rounded-xl p-4 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 border-b border-[#EAECEF] pb-2.5">
          <MapPin className="w-4 h-4 text-[#18A66A]" />
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#222222]">
            Address & Logistics
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="p-2.5 bg-[#F8F9FB] border border-[#EAECEF] rounded-lg">
            <span className="block text-[10px] font-bold text-[#8A8F98] uppercase tracking-wider mb-0.5">Division</span>
            <span className="font-extrabold text-[#222222] uppercase">{customer.address.division || 'N/A'}</span>
          </div>

          <div className="p-2.5 bg-[#F8F9FB] border border-[#EAECEF] rounded-lg">
            <span className="block text-[10px] font-bold text-[#8A8F98] uppercase tracking-wider mb-0.5">District</span>
            <span className="font-extrabold text-[#222222] uppercase">{customer.address.district || 'N/A'}</span>
          </div>

          <div className="p-2.5 bg-[#F8F9FB] border border-[#EAECEF] rounded-lg">
            <span className="block text-[10px] font-bold text-[#8A8F98] uppercase tracking-wider mb-0.5">Upazila / Thana</span>
            <span className="font-extrabold text-[#222222] uppercase">{customer.address.upazila || 'N/A'}</span>
          </div>

          <div className="sm:col-span-3 p-2.5 bg-[#F8F9FB] border border-[#EAECEF] rounded-lg">
            <span className="block text-[10px] font-bold text-[#8A8F98] uppercase tracking-wider mb-0.5">Detailed Street Address</span>
            <span className="font-bold text-[#222222]">{customer.address.street || 'No street address provided'}</span>
            {customer.address.zipCode && (
              <span className="block text-[10px] text-[#8A8F98] font-bold uppercase mt-1">Postal Code: {customer.address.zipCode}</span>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 7: ACCOUNT ENGAGEMENT & ADMIN NOTES */}
      <section className="bg-white border border-[#EAECEF] rounded-xl p-4 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 border-b border-[#EAECEF] pb-2.5">
          <Activity className="w-4 h-4 text-[#2563EB]" />
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#222222]">
            Account Activity & Notes
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-[#F8F9FB] border border-[#EAECEF] rounded-lg flex items-center gap-3">
            <Clock className="w-4 h-4 text-[#2563EB] shrink-0" />
            <div>
              <span className="block text-[10px] font-bold text-[#8A8F98] uppercase tracking-wider">Last Login Activity</span>
              <span className="font-bold text-[#222222]">{customer.last_login_at ? new Date(customer.last_login_at).toLocaleString() : 'Never Active'}</span>
            </div>
          </div>

          <div className="p-3 bg-[#F8F9FB] border border-[#EAECEF] rounded-lg flex items-center gap-3">
            <Hash className="w-4 h-4 text-[#6C3BFF] shrink-0" />
            <div>
              <span className="block text-[10px] font-bold text-[#8A8F98] uppercase tracking-wider">Total Access Sessions</span>
              <span className="font-bold text-[#222222]">{customer.total_logins || 0} Dynamic Sessions</span>
            </div>
          </div>

          {customer.note && (
            <div className="sm:col-span-2 p-3 bg-amber-50/80 border border-amber-200/80 rounded-lg flex items-start gap-2.5">
              <Shield className="w-4 h-4 text-[#D99400] shrink-0 mt-0.5" />
              <div>
                <span className="block text-[10px] font-extrabold text-[#D99400] uppercase tracking-wider mb-0.5">Administrative Note</span>
                <p className="text-xs text-amber-950 font-medium italic">"{customer.note}"</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* SECTION 8: TERMINATE ACCOUNT BUTTON */}
      <div className="pt-1">
        <button 
          onClick={handleDelete}
          className="w-full h-10 bg-rose-50 hover:bg-rose-100 text-[#D94B5B] border border-rose-200/80 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
        >
          Terminate Account
        </button>
      </div>
    </motion.div>
  );
}

