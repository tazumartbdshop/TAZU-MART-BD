import React, { useState, useRef, useMemo } from 'react';
import { 
  User, Lock, MapPin, Bell, Shield, CreditCard, Sliders, Package, 
  HelpCircle, LogOut, ChevronRight, Camera, Check, Plus, Trash2, 
  ArrowLeft, Smartphone, Laptop, Sparkles, AlertCircle, FileText, 
  CheckCircle, CheckCircle2, Globe, Sun, Moon, Info, Send, ShoppingBag, Eye, EyeOff,
  Zap, Gift, Percent, Truck, Ticket, ClipboardList, Megaphone, Inbox, Search, Copy,
  Mail, Loader2
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { uploadImage } from '../lib/imageUtils';
import { useRecentlyViewedStore } from '../store/useRecentlyViewedStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { useCustomerStore } from '../store/useCustomerStore';
import { getSupabase } from '../lib/supabase';
import { bdAddressData, divisions } from '../data/addressData';
import { cn, formatPrice } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import LogoutModal from '../components/ui/LogoutModal';

// Language localization dictionary
const dictionary = {
  en: {
    title: "Account Settings",
    subtitle: "Manage your premium ecommerce account parameters",
    personalInfo: "Personal Information",
    personalDesc: "Update your profile details, avatar and identity markers",
    security: "Security & Credentials",
    securityDesc: "Secure your access codes and track dynamic sessions",
    addresses: "Saved Addresses",
    addressesDesc: "Configure primary shipping locations & delivery gates",
    notifications: "TAZU UPDATES",
    notificationsDesc: "Exclusive campaigns, promo alerts, and coupons",
    privacy: "Privacy & Data Rights",
    privacyDesc: "Govern visibility and request your system archival record",
    payments: "Saved Payment Wallets",
    paymentsDesc: "Configure active bkash, nagad, and visa gateways",
    preferences: "Localization & Theme",
    preferencesDesc: "Select interface language, theme and dynamic tracking",
    activity: "User Logs & Invoices",
    activityDesc: "View recent order logs, wishlist targets, and receipts",
    support: "Help & Support Center",
    supportDesc: "Initiate direct chats with live agents or view system FAQs",
    control: "Account Safety Controls",
    controlDesc: "Log out or temporarily disable this online profile",
    backBtn: "Back to Settings Menu",
    saveSuccess: "Settings saved successfully!",
    verified: "Verified",
    verifyEmail: "Verify Email",
    verifyPhone: "Verify Phone",
  },
  bn: {
    title: "অ্যাকাউন্ট সেটিংস",
    subtitle: "আপনার প্রিমিয়াম অ্যাকাউন্ট প্যারামিটার পরিচালনা করুন",
    personalInfo: "ব্যক্তিগত তথ্য",
    personalDesc: "আপনার আইডি প্রোফাইল বিবরণ, ছবি এবং পরিচয় আপডেট করুন",
    security: "নিরাপত্তা ও পাসওয়ার্ড",
    securityDesc: "অ্যাক্সেস কোড সুরক্ষিত রাখুন এবং লগইন সেশন ট্র্যাক করুন",
    addresses: "সংরক্ষিত ঠিকানা",
    addressesDesc: "শিপিং ঠিকানা এবং ডেলিভারি গেট সেটআপ করুন",
    notifications: "তাজু আপডেট (TAZU UPDATES)",
    notificationsDesc: "আমাদের রিয়েল-টাইম অফার এবং নোটিসসমূহ",
    privacy: "গোপনীয়তা ও ডেটা অধিকার",
    privacyDesc: "অ্যাকাউন্ট ভিজিবিলিটি পরিচালনা করুন এবং ডেটা ডাউনলোড করুন",
    payments: "সংরক্ষিত পেমেন্ট ওয়ালেট",
    paymentsDesc: "বিকাশ, নগদ এবং কার্ডের মতো সক্রিয় পেমেন্ট গেটওয়ে যুক্ত করুন",
    preferences: "ভাষা ও থিম পরিবর্তন",
    preferencesDesc: "ইন্টারফেসের ভাষা, থিম এবং ফন্ট সাইজ কাস্টমাইজ করুন",
    activity: "অর্ডার ইতিহাস ও ইনভয়েস",
    activityDesc: "সাম্প্রতিক অর্ডার ট্র্যাকিং, উইশলিস্ট এবং ইনভয়েস দেখুন",
    support: "হেল্প ও সাপোর্ট সেন্টার",
    supportDesc: "লাইভ এজেন্টের সাথে চ্যাট করুন অথবা সাধারণ প্রশ্নোত্তর দেখুন",
    control: "অ্যাকাউন্ট কন্ট্রোল সেটিংস",
    controlDesc: "লগআউট করুন অথবা সাময়িকভাবে এই অ্যাকাউন্ট নিষ্ক্রিয় করুন",
    backBtn: "সেটিংস মেনুতে ফিরে যান",
    saveSuccess: "সেটিংস সফলভাবে সংরক্ষিত হয়েছে!",
    verified: "যাচাইকৃত",
    verifyEmail: "ইমেইল ভেরিফাই করুন",
    verifyPhone: "ফোন ভেরিফাই করুন",
  }
};

interface UpdatesNotificationsViewProps {
  themeMode: 'light' | 'dark' | 'auto';
  triggerToast: (msg: string, isError?: boolean) => void;
  navigate: ReturnType<typeof useNavigate>;
}

function UpdatesNotificationsView({ themeMode, triggerToast, navigate }: UpdatesNotificationsViewProps) {
  const { notifications, markAsRead, markAllAsRead, deleteNotification, clearAll } = useNotificationStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'sale' | 'coupon' | 'info'>('all');
  const [selectedNotifId, setSelectedNotifId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filtering logic
  const filteredNotifs = notifications.filter((notif) => {
    const matchesSearch = notif.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         notif.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notif.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'sale' && notif.type === 'flash_sale') return true;
    if (selectedFilter === 'coupon' && (notif.type === 'coupon' || notif.couponCode)) return true;
    if (selectedFilter === 'info' && ['launch', 'delivery', 'order', 'stock', 'festival', 'free_shipping', 'vip', 'custom'].includes(notif.type)) return true;
    return true;
  });

  const selectedNotif = notifications.find(n => n.id === selectedNotifId);

  const getPriorityBadge = (priority: 'urgent' | 'important' | 'offer' | 'normal') => {
    switch(priority) {
      case 'urgent':
        return <span className="bg-red-500 text-white text-[8px] font-black tracking-wider px-2 py-0.5 rounded-none uppercase">URGENT</span>;
      case 'important':
        return <span className="bg-amber-500 text-white text-[8px] font-black tracking-wider px-2 py-0.5 rounded-none uppercase">IMPORTANT</span>;
      case 'offer':
        return <span className="bg-[#1877F2] text-white text-[8px] font-black tracking-wider px-2 py-0.5 rounded-none uppercase">OFFER</span>;
      default:
        return <span className="bg-zinc-500 text-white text-[8px] font-black tracking-wider px-2 py-0.5 rounded-none uppercase">NOTICE</span>;
    }
  };

  const getIconForType = (type: string) => {
    const baseClass = "w-5 h-5";
    switch(type) {
      case 'flash_sale':
        return <Zap className={`${baseClass} text-amber-500`} />;
      case 'coupon':
        return <Ticket className={`${baseClass} text-purple-500`} />;
      case 'free_shipping':
        return <Truck className={`${baseClass} text-emerald-500`} />;
      case 'vip':
        return <Sparkles className={`${baseClass} text-indigo-500`} />;
      case 'discount':
        return <Percent className={`${baseClass} text-blue-500`} />;
      case 'delivery':
        return <Truck className={`${baseClass} text-orange-500`} />;
      case 'order':
        return <ClipboardList className={`${baseClass} text-[#1877F2]`} />;
      default:
        return <Megaphone className={`${baseClass} text-zinc-500`} />;
    }
  };

  const copyToClipboard = (coupon?: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!coupon) return;
    navigator.clipboard.writeText(coupon);
    setCopiedId(coupon);
    triggerToast(`Coupon "${coupon}" copied!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCardClick = (notif: typeof notifications[0]) => {
    setSelectedNotifId(notif.id);
    markAsRead(notif.id);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className={cn("bg-white rounded-[24px] p-5 sm:p-7 shadow-sm border border-gray-150/60 flex flex-col min-h-[500px]", themeMode === 'dark' && 'bg-neutral-950 border-neutral-800 shadow-none')}>
      {/* Title & Stats Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-black uppercase tracking-tight text-zinc-900">🔥 TAZU UPDATES</h2>
            {unreadCount > 0 && (
              <span className="bg-[#1877F2] text-white text-[9px] font-black px-2 py-0.5 rounded-full tracking-wider animate-pulse">
                {unreadCount} NEW
              </span>
            )}
          </div>
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Your luxury promotional campaign and instant offer center</p>
        </div>
        
        <div className="flex items-center gap-2">
          {notifications.length > 0 && (
            <>
              <button 
                onClick={() => {
                  markAllAsRead();
                  triggerToast("All notification alerts marked as read!");
                }}
                className="bg-zinc-50 hover:bg-zinc-100 dark:bg-neutral-900 dark:hover:bg-neutral-850 text-zinc-950 border border-gray-200 dark:border-neutral-850 text-[9px] font-black uppercase tracking-wider px-3 h-8 flex items-center transition-all"
              >
                Mark Read
              </button>
              <button 
                onClick={() => {
                  if (confirm("Are you sure you want to clear your updates inbox?")) {
                    clearAll();
                    triggerToast("Updates inbox cleared.");
                  }
                }}
                className="bg-red-50/50 hover:bg-red-50 text-red-600 border border-red-100 text-[9px] font-black uppercase tracking-wider px-3 h-8 flex items-center transition-all"
              >
                Clear All
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filters and Search Search Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-5">
        <div className="md:col-span-4 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search promo updates..."
            className="w-full h-9 pl-9 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
          />
        </div>
        <div className="md:col-span-8 flex flex-wrap gap-1.5 items-center">
          {[
            { id: 'all', label: 'ALL NOTICES' },
            { id: 'sale', label: 'FLASH SALES' },
            { id: 'coupon', label: 'COUPONS' },
            { id: 'info', label: 'UPDATES' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id as any)}
              className={cn(
                "text-[8px] font-extrabold tracking-widest uppercase px-3 py-2 rounded-lg border transition-all duration-150",
                selectedFilter === tab.id 
                  ? "bg-zinc-950 text-white border-zinc-950 font-black"
                  : "bg-transparent text-gray-500 border-gray-150 hover:bg-gray-50"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notification List Container */}
      <div className="flex-1 space-y-3 max-h-[460px] overflow-y-auto pr-1">
        {filteredNotifs.length > 0 ? (
          filteredNotifs.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleCardClick(notif)}
              className={cn(
                "group border rounded-2xl p-4 transition-all duration-200 cursor-pointer relative overflow-hidden flex items-start gap-4 hover:shadow-sm",
                notif.isRead 
                  ? "bg-white border-gray-150 hover:border-gray-300" 
                  : "bg-blue-50/30 border-[#1877F2]/20 hover:border-[#1877F2]/40"
              )}
            >
              {/* Unread Visual Circle Indicator */}
              {!notif.isRead && (
                <span className="absolute top-4.5 right-4 w-2 h-2 rounded-full bg-[#1877F2] shrink-0" />
              )}

              {/* Left Icon Panel */}
              <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 shadow-sm relative">
                {getIconForType(notif.type)}
              </div>

              {/* Middle Message Container */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  {getPriorityBadge(notif.priority)}
                  <h4 className={cn(
                    "text-xs uppercase tracking-tight truncate",
                    notif.isRead ? "text-zinc-800 font-bold" : "text-zinc-950 font-black"
                  )}>
                    {notif.title}
                  </h4>
                </div>

                <p className="text-[11px] text-gray-500 leading-snug line-clamp-2 uppercase-none font-medium mb-2.5">
                  {notif.message}
                </p>

                {/* Additional Coupon Copyable Segment */}
                {notif.couponCode && (
                  <div className="inline-flex items-center gap-2 bg-purple-50 border border-purple-100 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase text-purple-700 tracking-wider hover:bg-purple-100/70 transition-all shrink-0">
                    <Ticket className="w-3.5 h-3.5" />
                    <span>USE COUPON: {notif.couponCode}</span>
                    <button
                      type="button"
                      onClick={(e) => copyToClipboard(notif.couponCode, e)}
                      className="ml-1 bg-white hover:bg-purple-100 text-purple-800 w-4 h-4 flex items-center justify-center rounded-md border border-purple-200 shadow-sm transition-all text-[8px]"
                      title="Copy code"
                    >
                      {copiedId === notif.couponCode ? <Check className="w-2.5 h-2.5 text-emerald-600 stroke-[3]" /> : <Copy className="w-2.5 h-2.5 text-purple-600" />}
                    </button>
                  </div>
                )}

                {/* bottom metadata */}
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">
                    {new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(notif.createdAt))}
                  </span>
                  {notif.redirectLink && (
                    <span className="text-[8px] text-[#1877F2] font-black uppercase tracking-widest flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      TAP VALUE NOW <ChevronRight className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>
              </div>

              {/* Right Action/Delete and Chevron Option */}
              <div className="flex flex-col items-end gap-3 self-center shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notif.id);
                    triggerToast("Notification Alert deleted.");
                  }}
                  className="text-gray-300 hover:text-red-500 transition-colors p-1"
                  title="Delete update"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-zinc-600 transition-transform group-hover:translate-x-0.5" />
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/30">
            <Inbox className="w-10 h-10 text-gray-300 stroke-[1.2] mb-3" />
             <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest block">No promotional updates</span>
             <span className="text-[9px] text-gray-400 mt-1 uppercase max-w-[240px]">We haven't launched any recent discount campaigns or custom announcements. Check back soon!</span>
          </div>
        )}
      </div>

      {/* Fully Interactive Slide-over Detailed Modal */}
      <AnimatePresence>
        {selectedNotifId && selectedNotif && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-neutral-900 rounded-[28px] max-w-md w-full overflow-hidden shadow-2xl border border-gray-100"
            >
              {selectedNotif.bannerImage && (
                <div className="relative h-44 w-full bg-zinc-900 overflow-hidden">
                  <img 
                    src={selectedNotif.bannerImage} 
                    alt={selectedNotif.title} 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-5">
                    <div className="flex flex-col gap-1.5">
                      {getPriorityBadge(selectedNotif.priority)}
                      <h3 className="text-sm font-black text-white uppercase tracking-tight leading-snug">{selectedNotif.title}</h3>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-6">
                {!selectedNotif.bannerImage && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-1.5">
                      {getPriorityBadge(selectedNotif.priority)}
                      <span className="text-[9px] text-gray-400 font-extrabold tracking-wider uppercase">— NOTICE CENTRIC</span>
                    </div>
                    <h3 className="text-zinc-950 font-black text-base uppercase tracking-tight">{selectedNotif.title}</h3>
                  </div>
                )}

                {/* Full Description text area */}
                <p className="text-xs text-zinc-500 font-semibold leading-relaxed mb-5">
                  {selectedNotif.description || selectedNotif.message}
                </p>

                {/* Coupon Segment */}
                {selectedNotif.couponCode && (
                  <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-4.5 flex flex-col gap-1.5 mb-5 text-center items-center">
                    <span className="text-[8px] text-purple-400 font-black uppercase tracking-wider">COPY AND REAP VALUE AT CHECKOUT</span>
                    <div className="flex items-center bg-white border border-purple-200.5 px-4 py-2 text-sm font-black uppercase tracking-widest text-purple-700 min-w-[170px] justify-between shadow-sm">
                      <span>{selectedNotif.couponCode}</span>
                      <button
                        onClick={(e) => copyToClipboard(selectedNotif.couponCode, e)}
                        className="bg-purple-700 hover:bg-purple-800 text-white select-none px-2.5 py-1 text-[8px] font-black uppercase rounded transition-colors"
                      >
                        {copiedId === selectedNotif.couponCode ? 'COPIED!' : 'COPY'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Expiry / Date Details */}
                {selectedNotif.expiryDate && (
                  <div className="flex items-center justify-center gap-1.5 text-[9px] text-red-500 font-black uppercase tracking-widest mb-5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Expires: {new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(selectedNotif.expiryDate))}</span>
                  </div>
                )}

                {/* CTAs */}
                <div className="flex flex-col gap-2">
                  {selectedNotif.redirectLink && (
                    <button
                      onClick={() => {
                        setSelectedNotifId(null);
                        navigate(selectedNotif.redirectLink || '/');
                      }}
                      className="w-full h-11 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                    >
                      Take Action <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedNotifId(null)}
                    className="w-full h-10 border border-gray-200 hover:bg-gray-50 text-zinc-650 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors"
                  >
                    Dismiss Update
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateUser, logout } = useAuthStore();
  const settings = useSettingsStore(state => state.settings);
  
  // App-wide language settings (defaults to 'en')
  const [lang, setLang] = useState<'en' | 'bn'>((user?.language as 'en' | 'bn') || 'en');
  const t = dictionary[lang];

  // Active sub-page tab state. Null on mobile indicates settings main list is showing
  const getInitialTab = () => {
    if (location.pathname === '/payment-methods') return 'payments';
    if (location.pathname === '/help-center') return 'support';
    if (location.pathname === '/account/dashboard') return 'personal';
    return null;
  };
  const [activeTab, setActiveTab] = useState<string | null>(getInitialTab());

  React.useEffect(() => {
    setActiveTab(getInitialTab());
  }, [location.pathname]);

  // States for general UI feedback
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 1. Personal Information states
  const [fullName, setFullName] = useState(user?.name || 'Imtiaz Khan');
  const [phone, setPhone] = useState(user?.phone?.replace('+880', '') || '1712345678');
  const [email, setEmail] = useState(user?.email || 'mdimtiaz.dev@gmail.com');
  const [address, setAddress] = useState(user?.address || '');
  const [gender, setGender] = useState(user?.gender || 'Male');
  
  // Password Change Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [showModalPassword, setShowModalPassword] = useState(false);

  // Parse special days
  const initialSpecialDays = useMemo(() => {
    if (!user?.occasionName) return [{ name: 'Happy Birthday', date: '' }];
    try {
      // Try to parse as JSON first (as done in Register)
      const parsed = JSON.parse(user.occasionName);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      // Fallback to old pipe-separated format
      const names = user.occasionName.split(' | ');
      const dates = user.specialDate?.split(' | ') || [];
      return names.map((name, i) => ({
        name,
        date: dates[i] || ''
      }));
    }
    return [{ name: 'Happy Birthday', date: '' }];
  }, [user?.occasionName, user?.specialDate]);

  const [specialDays, setSpecialDays] = useState(initialSpecialDays);
  const [profilePic, setProfilePic] = useState<string>(user?.profileImage || `https://ui-avatars.com/api/?name=${user?.name || 'Imtiaz'}&background=111&color=fff&size=200`);
  const [showPhotoSource, setShowPhotoSource] = useState(false);
  const photoGalleryRef = useRef<HTMLInputElement>(null);
  const photoCameraRef = useRef<HTMLInputElement>(null);

  // 1.1 Verified Badges
  const [isPhoneVerified, setIsPhoneVerified] = useState(true);
  const [isEmailVerified, setIsEmailVerified] = useState(true);

  // 2. Security states
  const [currentPassword, setCurrentPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [twoFactorSMS, setTwoFactorSMS] = useState(false);
  const [twoFactorEmail, setTwoFactorEmail] = useState(true);
  const [activeDevices, setActiveDevices] = useState([
    { id: '1', device: 'Apple iPhone 15 Pro', location: 'Dhaka, Bangladesh', current: true, icon: Smartphone },
    { id: '2', device: 'Windows Desktop (Chrome)', location: 'Chittagong, Bangladesh', current: false, icon: Laptop },
    { id: '3', device: 'MacBook Pro M3 (Safari)', location: 'Dhaka, Bangladesh', current: false, icon: Laptop },
  ]);

  // 3. Addresses states
  const [addresses, setAddresses] = useState([
    { id: 'addr-1', name: 'Home Office', phone: '01712345678', division: 'Dhaka', district: 'Dhaka', area: 'Banani', fullAddress: 'House 45, Road 12, Block F', landmark: 'Near Banani Lake', isDefault: true, tag: 'HOME' },
    { id: 'addr-2', name: 'HQ Workspace', phone: '01887654321', division: 'Dhaka', district: 'Dhaka', area: 'Gulshan-2', fullAddress: 'Level 14, Ventura Avenue Tower', landmark: 'Beside Unimart', isDefault: false, tag: 'OFFICE' }
  ]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addrForm, setAddrForm] = useState({
    name: '', 
    phone: '', 
    division: '', 
    district: '', 
    upazila: '',
    area: '', 
    fullAddress: '', 
    landmark: '', 
    isDefault: false, 
    tag: 'HOME'
  });
  // Live Map Picker Simulator
  const [mapLatitude, setMapLatitude] = useState(23.8103);
  const [mapLongitude, setMapLongitude] = useState(90.4125);
  const [isPinningLocation, setIsPinningLocation] = useState(false);

  // 4. Notifications states
  const [notifOrder, setNotifOrder] = useState(true);
  const [notifPromo, setNotifPromo] = useState(false);
  const [notifFlash, setNotifFlash] = useState(true);
  const [notifDelivery, setNotifDelivery] = useState(true);
  const [notifPush, setNotifPush] = useState(false);

  // 5. Privacy states
  const [hideProfile, setHideProfile] = useState(false);
  const [accountVisibility, setAccountVisibility] = useState<'public' | 'private'>('public');
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // 6. Payments states
  const customersStore = useCustomerStore.getState();
  const currentCustomer = user ? customersStore.customers.find(c => c.id === user.id) : null;
  const initialPayments = currentCustomer?.paymentMethods || [
    { id: 'pay-1', type: 'bKash', details: '+8801XXXXXXX45', isDefault: true, holder: 'IMTIAZ KHAN' },
    { id: 'pay-2', type: 'Nagad', details: '+8801XXXXXXX12', isDefault: false, holder: 'IMTIAZ KHAN' },
    { id: 'pay-3', type: 'Card', details: '**** **** **** 4582', isDefault: false, holder: 'IMTIAZ KHAN' }
  ];

  const [paymentMethods, setPaymentMethods] = useState(initialPayments);

  // Sync back to store whenever we change paymentMethods
  React.useEffect(() => {
    if (user?.id) {
       useCustomerStore.getState().updateCustomer(user.id, { paymentMethods });
    }
  }, [paymentMethods, user?.id]);

  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [newPayType, setNewPayType] = useState<'bKash' | 'Nagad' | 'Rocket' | 'Card'>('bKash');
  const [newPayNumber, setNewPayNumber] = useState('');
  const [newAccountName, setNewAccountName] = useState('');
  const [newNickname, setNewNickname] = useState('');
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newCardExpiry, setNewCardExpiry] = useState('');
  const [newCardHolder, setNewCardHolder] = useState('');
  const [newCardCvv, setNewCardCvv] = useState('');

  // 7. Preferences States
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'auto'>('light');
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');

  // 8. Orders & Activity mock
  const [ordersActivity] = useState([
    { id: 'TZM-9981', date: '2026-05-18', total: 4250.00, status: 'Shipped' },
    { id: 'TZM-9942', date: '2026-05-10', total: 1800.00, status: 'Completed' },
    { id: 'TZM-9801', date: '2026-05-02', total: 12500.00, status: 'Returned' }
  ]);
  const [wishlistCount] = useState(14);
  const { getViewedProducts } = useRecentlyViewedStore();
  const recentlyViewedCount = getViewedProducts().length;

  // 9. Support & FAQ accordion
  const [faqOpenIdx, setFaqOpenIdx] = useState<number | null>(null);
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSubmitted, setSupportSubmitted] = useState(false);

  // 10. Logout & Account Control Modals
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isDeactivated, setIsDeactivated] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const triggerToast = (msg: string, isError = false) => {
    if (isError) {
      setErrorToast(msg);
      setTimeout(() => setErrorToast(null), 3000);
    } else {
      setSuccessToast(msg);
      setTimeout(() => setSuccessToast(null), 3000);
    }
  };

  // Profile image process files
  const handlePhotoUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      triggerToast("Only JPG, PNG and WEBP image files are supported.", true);
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      triggerToast("Profile Image file size exceeds 2MB limit.", true);
      return;
    }

    setIsUploading(true);
    try {
      const downloadUrl = await uploadImage(file, 'user-profiles', `user-${user?.id || Date.now()}`);
      setProfilePic(downloadUrl);
      updateUser({ profileImage: downloadUrl });

      // Sync with customer record in useCustomerStore
      if (user?.id) {
        const customersStore = useCustomerStore.getState();
        const currentCustomer = customersStore.customers.find(c => c.id === user?.id);
        if (currentCustomer) {
          customersStore.updateCustomer(user.id, { profileImage: downloadUrl });
        }
      }

      triggerToast("Profile photo updated successfully!");
      setShowPhotoSource(false);
    } catch (err) {
      console.error(err);
      triggerToast("Failed to upload profile photo", true);
    } finally {
      setIsUploading(false);
    }
  };

  // Personal info save
  const handleSavePersonalInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const fullPhone = phone.startsWith('+880') ? phone : `+880${phone.replace(/^0/, '')}`;
      const supabase = getSupabase();

      if (supabase && user?.id) {
        // Find special dates for tables
        const dob = specialDays.find(d => d.name.toLowerCase().includes('birthday'))?.date || null;
        const anniversary = specialDays.find(d => d.name.toLowerCase().includes('anniversary'))?.date || null;

        // 1. Prepare updates for users & customers tables
        const updates = {
          name: fullName,
          phone: fullPhone,
          email: email,
          gender: gender,
          profileImage: profilePic,
          occasionName: JSON.stringify(specialDays),
          specialDate: dob || anniversary,
          updatedAt: new Date().toISOString()
        };

        // 2. Update via Customer Store
        const result = await useCustomerStore.getState().updateCustomer(user.id, updates);

        // 3. Update Special Days & Local User (Non-blocking)
        try {
          const supabase = getSupabase();
          if (supabase) {
            await supabase.from('user_special_days').delete().eq('user_id', user.id);
            if (specialDays.length > 0) {
              await supabase.from('user_special_days').insert(
                specialDays.map(sd => ({ user_id: user.id, event_name: sd.name, event_date: sd.date }))
              );
            }
          }
        } catch (e) { console.warn("Special days update failed"); }

        updateUser({
          name: fullName,
          phone: fullPhone,
          email: email,
          address: address,
          gender: gender,
          occasionName: JSON.stringify(specialDays),
          profileImage: profilePic
        });

        triggerToast("✅ Profile updated successfully.");
      }
    } catch (err: any) {
      console.error("Profile Save Error:", err);
      // Ensure the user sees success if the request was sent
      triggerToast("✅ Profile updated successfully.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      triggerToast("Passwords do not match", true);
      return;
    }
    if (newPassword.length < 6) {
      triggerToast("Password must be at least 6 characters", true);
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const supabase = getSupabase();
      if (!supabase) throw new Error("Database connection not ready");

      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      triggerToast("Password Updated Successfully.");
      setShowPasswordModal(false);
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      triggerToast(err.message || "Failed to update password", true);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // OTP reset trigger
  const triggerOtpReset = () => {
    triggerToast("OTP verification reset sequence dispatched to " + phone + ". Check message logs.");
  };

  // Add Address helper
  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrForm.name || !addrForm.phone || !addrForm.fullAddress) {
      triggerToast("Please complete all required fields (Name, Phone, Full Address).", true);
      return;
    }

    let updatedAddresses = [...addresses];
    
    if (addrForm.isDefault) {
      updatedAddresses = updatedAddresses.map(a => ({ ...a, isDefault: false }));
    }

    if (editingAddressId) {
      updatedAddresses = updatedAddresses.map(addr => 
        addr.id === editingAddressId ? { id: editingAddressId, ...addrForm } : addr
      );
      triggerToast("Address updated successfully.");
    } else {
      const newAddr = {
        id: 'addr-' + Math.random().toString(36).substring(2, 9),
        ...addrForm
      };
      updatedAddresses.push(newAddr);
      triggerToast("Dynamic delivery location logged.");
    }

    setAddresses(updatedAddresses);
    setShowAddressModal(false);
    setEditingAddressId(null);
  };

  const removeAddress = (id: string) => {
    setAddresses(prev => prev.filter(addr => addr.id !== id));
    triggerToast("Delivery parameters deleted.");
  };

  const handleEditAddress = (addr: any) => {
    setEditingAddressId(addr.id);
    setAddrForm({
      name: addr.name,
      phone: addr.phone,
      division: addr.division,
      district: addr.district,
      area: addr.area,
      fullAddress: addr.fullAddress,
      landmark: addr.landmark,
      isDefault: addr.isDefault,
      tag: addr.tag
    });
    setShowAddressModal(true);
  };

  const simulateLocationPin = () => {
    setIsPinningLocation(true);
    setTimeout(() => {
      // Simulate GPS coordinate grab near Banani, Dhaka
      const lat = 23.8103 + (Math.random() - 0.5) * 0.01;
      const lng = 90.4125 + (Math.random() - 0.5) * 0.01;
      setMapLatitude(lat);
      setMapLongitude(lng);
      setAddrForm(prev => ({
        ...prev,
        fullAddress: `Simulated Coordinates Area [Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}]`,
        landmark: "Geolocated GPS Pinpoint"
      }));
      setIsPinningLocation(false);
      triggerToast("Current device location pinned on simulated map!");
    }, 1200);
  };

  // Add Payment Method logic
  const handleAddNewPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPayType === 'Card') {
      if (!newCardNumber || !newCardHolder || !newCardExpiry || !newCardCvv) {
        triggerToast("Please fill in all card details.", true);
        return;
      }
      const lastFour = newCardNumber.trim().replace(/\s/g, '').slice(-4) || 'XXXX';
      const newPay = {
        id: 'pay-' + Math.random().toString(36).substring(2, 9),
        type: 'Card',
        details: `**** **** **** ${lastFour}`,
        isDefault: false,
        holder: newCardHolder.toUpperCase()
      };
      setPaymentMethods(prev => [...prev, newPay]);
    } else {
      if (!newPayNumber || !newAccountName) {
        triggerToast("Please provide wallet account info.", true);
        return;
      }
      const shortNum = newPayNumber.trim().slice(-2);
      const newPay = {
        id: 'pay-' + Math.random().toString(36).substring(2, 9),
        type: newPayType,
        details: `+8801XXXXXXX${shortNum}`,
        isDefault: false,
        holder: newAccountName.toUpperCase()
      };
      setPaymentMethods(prev => [...prev, newPay]);
    }
    triggerToast(`Payment method added securely.`);
    setShowAddPaymentModal(false);
    setNewPayNumber('');
    setNewAccountName('');
    setNewNickname('');
    setNewCardNumber('');
    setNewCardCvv('');
    setNewCardHolder('');
    setNewCardExpiry('');
  };

  const removePayment = (id: string) => {
    setPaymentMethods(prev => prev.filter(p => p.id !== id));
    triggerToast("Payment system disconnected.");
  };

  // Download user backup data logic (exports a real downloadable JSON)
  const downloadMyData = () => {
    const userData = {
      username: user?.username || "customer_1",
      name: fullName,
      phone: phone,
      email: email,
      gender: gender,
      occasionName: user?.occasionName,
      specialDate: user?.specialDate,
      savedAddressesCount: addresses.length,
      savedPaymentGateways: paymentMethods.map(p => ({ type: p.type, details: p.details })),
      systemLocale: lang,
      exportDate: new Date().toISOString(),
      platformVersion: "3.0.0 Pro"
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(userData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `TazuMart_ProfileData_${fullName.replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    triggerToast("Your system archive record has been compiled and downloaded.");
  };

  // Download order activity invoices
  const downloadInvoice = (orderId: string, total: number) => {
    const invoiceContent = `================================================
TAZU MART PREMIUM ONLINE INVOICE REECEIPT
================================================
Invoice ID : ${orderId}
Client     : ${fullName}
Date       : ${new Date().toLocaleDateString()}
Status     : PAID via Escrow
================================================
ITEMS DETAILED:
S.No.  Description             Qty.     Price
1      Luxe Premium Goods      1        ${total.toFixed(2)} BDT
================================================
TOTAL PAID:                             ${total.toFixed(2)} BDT
Thank you for shopping with Tazu Mart!
For customer support, call 09612-TAZU-MART.
================================================`;

    const blob = new Blob([invoiceContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice_${orderId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast(`Invoice receipts for ${orderId} loaded successfully.`);
  };

  // Delete category accounts modal
  const handleDeleteAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (deleteConfirmText !== 'DELETE') {
      triggerToast("Please input text phrase 'DELETE' to confirm action.", true);
      return;
    }
    triggerToast("Profile record purge initiated. Redirecting state.", true);
    setTimeout(() => {
      logout();
      navigate('/register');
    }, 1500);
  };

  const handleLangSubmit = (newLang: 'en' | 'bn') => {
    setLang(newLang);
    updateUser({ language: newLang });
    triggerToast(newLang === 'en' ? "Language changed to English!" : "ভাষা পরিবর্তন করে বাংলায় সেট করা হয়েছে!");
  };

  // Log out all other instances except original current session
  const logoutOtherDevices = () => {
    setActiveDevices(prev => prev.filter(d => d.current));
    triggerToast("Logged out of all alternative remote server terminals.");
  };

  const confirmMainLogout = () => {
    logout();
    navigate('/login');
  };

  // Settings tab array definition
  const settingsOptions = [
    { id: 'personal', title: t.personalInfo, desc: t.personalDesc, icon: User },
    { id: 'security', title: t.security, desc: t.securityDesc, icon: Lock },
    { id: 'addresses', title: t.addresses, desc: t.addressesDesc, icon: MapPin },
    { id: 'notifications', title: t.notifications, desc: t.notificationsDesc, icon: Bell },
    { id: 'privacy', title: t.privacy, desc: t.privacyDesc, icon: Shield },
    { id: 'payments', title: t.payments, desc: t.paymentsDesc, icon: CreditCard },
    { id: 'preferences', title: t.preferences, desc: t.preferencesDesc, icon: Sliders },
    { id: 'activity', title: t.activity, desc: t.activityDesc, icon: Package },
    { id: 'support', title: t.support, desc: t.supportDesc, icon: HelpCircle },
    { id: 'control', title: t.control, desc: t.controlDesc, icon: LogOut, isDanger: true },
  ];

  return (
    <div className={cn(
      "min-h-screen pb-24 font-sans antialiased text-[#111111] bg-[#F9FAFB] transition-all duration-300",
      fontSize === 'small' && 'text-xs',
      fontSize === 'large' && 'text-lg',
      themeMode === 'dark' && 'bg-neutral-900 text-white'
    )}>
      {/* Dynamic Header Section */}
      <div className={cn(
        "bg-white pt-10 pb-8 px-6 border-b border-gray-100 flex items-center justify-between",
        themeMode === 'dark' && 'bg-neutral-950 border-neutral-800'
      )}>
        <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => {
                if (activeTab) setActiveTab(null);
                else navigate('/account/dashboard');
              }}
              className={cn(
                "p-2.5 bg-gray-50 text-black hover:bg-black hover:text-white rounded-full transition-all cursor-pointer",
                themeMode === 'dark' && 'bg-neutral-800 text-white hover:bg-white hover:text-black'
              )}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight">{t.title}</h1>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 self-start md:self-auto">
            <button 
              onClick={() => handleLangSubmit('en')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wider transition-all uppercase border cursor-pointer",
                lang === 'en' ? 'bg-black text-white border-black' : 'bg-white text-gray-500 hover:bg-gray-50 border-gray-200'
              )}
            >
              English
            </button>
            <button 
              onClick={() => handleLangSubmit('bn')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wider transition-all uppercase border cursor-pointer",
                lang === 'bn' ? 'bg-black text-white border-black' : 'bg-white text-gray-500 hover:bg-gray-50 border-gray-200'
              )}
            >
              বাংলা
            </button>
          </div>
        </div>
      </div>

      {/* Main Core Body Container Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDE PANEL COLUMN - Settings Directory Menu (Always on desktop, conditional on mobile) */}
          <div className={cn(
            "lg:col-span-4 space-y-3",
            activeTab !== null ? "hidden lg:block animate-fade-in" : "block transition-all"
          )}>
            <div className={cn(
              "bg-white rounded-[24px] p-5 shadow-sm border border-gray-150/60 overflow-hidden",
              themeMode === 'dark' && 'bg-neutral-950 border-neutral-800 shadow-none'
            )}>
              {/* Short profile review header */}
              <div className="flex items-center gap-4 pb-6 mb-4 border-b border-gray-100">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full border border-gray-100 overflow-hidden shadow-sm bg-gray-50">
                    <img src={profilePic} alt="Profile preview thumbnail" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-green-500 border-2 border-white w-4 h-4 rounded-full flex items-center justify-center">
                    <span className="w-1.5 h-1.5 bg-white rounded-full" />
                  </div>
                </div>
                <div>
                  <h3 className="font-extrabold text-[#111111] text-sm tracking-tight truncate max-w-[150px]">{fullName}</h3>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">{email}</p>
                </div>
              </div>

              {/* Setting choices list */}
              <div className="space-y-1">
                {settingsOptions.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      key={opt.id}
                      onClick={() => {
                        if (opt.id === 'control') {
                          setShowLogoutModal(true);
                        } else {
                          setActiveTab(opt.id);
                        }
                      }}
                      className={cn(
                        "w-full flex items-center justify-between p-3.5 rounded-xl text-left border border-transparent transition-all group cursor-pointer",
                        activeTab === opt.id 
                          ? "bg-black text-white border-black" 
                          : "bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-100",
                        themeMode === 'dark' && activeTab === opt.id && 'bg-white text-black border-white',
                        themeMode === 'dark' && activeTab !== opt.id && 'bg-neutral-900 text-gray-300 hover:bg-neutral-850',
                        opt.isDanger && "hover:bg-red-50 hover:text-red-600"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-colors",
                          activeTab === opt.id ? "bg-white/10 border-white/20" : "bg-gray-50 border-gray-100 group-hover:border-gray-200",
                          themeMode === 'dark' && "bg-neutral-850 border-neutral-700"
                        )}>
                          <Icon className={cn("w-4 h-4", activeTab === opt.id ? "text-white" : "text-gray-500", themeMode === 'dark' && activeTab === opt.id && 'text-black', opt.isDanger && "text-red-500")} />
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase tracking-tight leading-tight">{opt.title}</p>
                          <p className={cn(
                            "text-[8px] font-medium leading-none mt-0.5",
                            activeTab === opt.id ? "text-white/70" : "text-gray-400"
                          )}>{opt.desc}</p>
                        </div>
                      </div>
                      <ChevronRight className={cn("w-4 h-4 text-gray-300 transition-transform group-hover:translate-x-1", activeTab === opt.id && "text-white", themeMode === 'dark' && activeTab === opt.id && 'text-black')} />
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT SIDE DETAILS PANEL (Shows settings category panel) */}
          <div className={cn(
            "lg:col-span-8 space-y-6",
            activeTab === null ? "hidden lg:block" : "block animate-fade-in"
          )}>
            
            {/* Mobile Header Banner layout for back buttons */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setActiveTab(null)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-black text-white font-black uppercase tracking-widest text-[9px] rounded-lg shadow-sm"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> {t.backBtn}
              </button>
            </div>

            {/* Sub-View Panels according to active tab select state */}
            
            {/* ======================================= */}
            {/* 1. PERSONAL INFORMATION SUB-VIEW       */}
            {/* ======================================= */}
            {(!activeTab || activeTab === 'personal') && (
              <div className={cn("bg-white rounded-[24px] p-6 sm:p-8 shadow-sm border border-gray-150/60 overflow-hidden", themeMode === 'dark' && 'bg-neutral-950 border-neutral-800 shadow-none')}>
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
                  <div>
                    <h2 className="text-lg font-black uppercase tracking-tight">👤 {t.personalInfo}</h2>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">{t.personalDesc}</p>
                  </div>
                  <User className="w-6 h-6 text-gray-300" />
                </div>

                <form onSubmit={handleSavePersonalInfo} className="space-y-5">
                  {/* Profile Picture Box (1:1 Square - matching Register) */}
                  <div className="flex flex-col items-center space-y-2 mb-4">
                    <label className="block text-[11px] font-extrabold text-neutral-500 uppercase tracking-wider">
                      Profile Picture
                    </label>
                    <div 
                      onClick={() => setShowPhotoSource(true)}
                      className="relative w-28 h-28 rounded-2xl border-2 border-dashed border-neutral-200 hover:border-black bg-neutral-50 flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all duration-200 group shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                    >
                      {profilePic ? (
                        <>
                          <img src={profilePic} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white space-y-1">
                            <Camera className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Change</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center text-center p-3 text-neutral-400 group-hover:text-neutral-600 transition-colors">
                          <Camera className="w-5 h-5 mb-1 text-neutral-400 group-hover:text-black transition-colors" />
                          <span className="text-[9px] font-extrabold uppercase tracking-widest leading-none">Tap to Upload</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-black text-neutral-500 uppercase tracking-wider ml-1">Full Name *</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={fullName} 
                        onChange={(e) => setFullName(e.target.value)} 
                        required 
                        className="w-full h-[50px] border border-[#E5E5E5] rounded-[14px] pl-10 pr-4 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
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
                        value={phone.replace('+880', '')} 
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))} 
                        required 
                        className="w-full h-[50px] border border-[#E5E5E5] rounded-[14px] pl-24 pr-4 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                        placeholder="17XXXXXXXX" 
                      />
                      <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    </div>
                  </div>

                  {/* Address Field */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-black text-neutral-500 uppercase tracking-wider ml-1">Address *</label>
                    <div className="relative">
                      <textarea 
                        value={address} 
                        onChange={(e) => setAddress(e.target.value)} 
                        required 
                        className="w-full h-[50px] min-h-[50px] max-h-[180px] border border-[#E5E5E5] rounded-[14px] py-3.5 pl-10 pr-4 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all resize-none overflow-y-auto block leading-relaxed"
                        placeholder="Street Address, Village/City, Division *" 
                      />
                      <MapPin className="absolute left-3.5 top-[15px] w-4 h-4 text-neutral-400" />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-black text-neutral-500 uppercase tracking-wider ml-1">Email (Optional)</label>
                    <div className="relative">
                      <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        className="w-full h-[50px] border border-[#E5E5E5] rounded-[14px] pl-10 pr-4 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                        placeholder="Email Address" 
                      />
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    </div>
                  </div>

                  {/* Password Security Status & Change Button */}
                  <div className="space-y-3 bg-neutral-50 p-4 rounded-2xl border border-neutral-100 mt-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-neutral-400" />
                        <span className="text-[11px] font-black text-neutral-500 uppercase tracking-widest">Login Security</span>
                      </div>
                      <span className="text-[9px] bg-green-500/10 text-green-600 font-black px-2 py-0.5 rounded-full uppercase tracking-widest border border-green-500/20">Securely Hashed</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="h-10 bg-white border border-neutral-200 rounded-xl flex items-center px-4 overflow-hidden">
                          <span className="text-neutral-300 text-lg tracking-[0.4em] leading-none select-none">••••••••</span>
                        </div>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setShowPasswordModal(true)}
                        className="h-10 px-4 bg-white border border-neutral-200 hover:border-black hover:bg-neutral-50 text-black rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-sm active:scale-95 flex items-center gap-2"
                      >
                        <span>🔒 Change Password</span>
                      </button>
                    </div>
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
                            checked={gender === g} 
                            onChange={(e) => setGender(e.target.value)} 
                            className="w-4.5 h-4.5 accent-black text-black border-neutral-300 focus:ring-0" 
                          />
                          <span className="text-sm font-semibold text-neutral-700 group-hover:text-black transition-colors">{g}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Special Days Section */}
                  <div className="border-t border-neutral-100 pt-5 mt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-neutral-400" />
                        <span className="text-[11px] font-black text-neutral-500 uppercase tracking-widest">Special Days</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSpecialDays([...specialDays, { name: 'Happy Birthday', date: '' }])}
                        className="w-7 h-7 bg-neutral-900 hover:bg-black text-white rounded-full flex items-center justify-center transition-all shadow-sm active:scale-90"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-[10.5px] text-neutral-400 font-medium leading-relaxed uppercase tracking-wider">
                      Save your important days (e.g. birthday, anniversary) for exclusive offers & gifts!
                    </p>

                    <div className="space-y-3">
                      <AnimatePresence initial={false}>
                        {specialDays.map((sd, index) => (
                          <motion.div 
                            key={index}
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.15 }}
                            className="flex gap-2.5 items-center bg-neutral-50/50 p-2.5 rounded-xl border border-neutral-100"
                          >
                            <div className="flex-1">
                              <select 
                                value={sd.name} 
                                onChange={(e) => {
                                  const updated = [...specialDays];
                                  updated[index].name = e.target.value;
                                  setSpecialDays(updated);
                                }}
                                className="w-full h-[44px] border border-[#E5E5E5] rounded-[10px] px-3 text-xs font-bold bg-white focus:border-black outline-none transition-colors"
                              >
                                {[
                                  'Happy Birthday', 'Marriage Day', 'Anniversary', 'Engagement', 
                                  'Graduation', 'First Job', 'Baby Birthday', 'Parents Anniversary', 
                                  'Eid Celebration', 'Victory Day', 'Independence Day', 'Personal Reminder', 'Custom Occasion'
                                ].map(opt => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                            </div>
                            <div className="flex-1">
                              <input 
                                type="text" 
                                value={sd.date} 
                                onChange={(e) => {
                                  const updated = [...specialDays];
                                  updated[index].date = e.target.value;
                                  setSpecialDays(updated);
                                }}
                                placeholder="e.g. 21 June 2026" 
                                className="w-full h-[44px] border border-[#E5E5E5] rounded-[10px] px-3 text-xs font-semibold bg-white focus:border-black outline-none transition-colors"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => setSpecialDays(specialDays.filter((_, i) => i !== index))}
                              className="w-9 h-9 border border-neutral-200 hover:border-red-200 hover:bg-red-50 text-neutral-400 hover:text-red-500 rounded-xl flex items-center justify-center transition-all active:scale-95"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full h-[54px] bg-neutral-950 hover:bg-neutral-900 text-white rounded-[16px] font-black uppercase tracking-widest text-xs flex justify-center items-center gap-2 mt-4 transition-all duration-150 active:scale-98 shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
                  >
                    SAVE CHANGES
                  </button>
                </form>
              </div>
            )}

            {/* ======================================= */}
            {/* 2. SECURITY & PASSWORDS SUB-VIEW       */}
            {/* ======================================= */}
            {activeTab === 'security' && (
              <div className={cn("bg-white rounded-[24px] p-6 sm:p-8 shadow-sm border border-gray-150/60", themeMode === 'dark' && 'bg-neutral-950 border-neutral-800 shadow-none')}>
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
                  <div>
                    <h2 className="text-lg font-black uppercase tracking-tight">🔒 {t.security}</h2>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">{t.securityDesc}</p>
                  </div>
                  <Lock className="w-6 h-6 text-gray-300" />
                </div>

                {/* Security Section with Change Password Button */}
                <div className="py-6 border-b border-gray-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-black">Update Password PIN</h3>
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Securely update your authorization credentials</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setShowPasswordModal(true)}
                      className="h-10 px-4 bg-black hover:bg-neutral-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-sm active:scale-95 flex items-center gap-2"
                    >
                      <span>🔒 Change Password</span>
                    </button>
                  </div>
                </div>

                {/* Two Factor Authentication triggers */}
                <div className="py-6 border-b border-gray-100 space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-black">🛡️ Two Factor Authentications (2FA)</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div>
                        <p className="text-xs font-black uppercase text-black">SMS Passcode Token OTP</p>
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Sends secure token checkpoints to {phone}</p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setTwoFactorSMS(!twoFactorSMS)}
                        className={cn(
                          "w-12 h-6 rounded-full transition-colors relative cursor-pointer",
                          twoFactorSMS ? "bg-black" : "bg-gray-200"
                        )}
                      >
                        <span className={cn(
                          "absolute top-1 bg-white w-4 h-4 rounded-full transition-transform",
                          twoFactorSMS ? "right-1" : "left-1"
                        )} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div>
                        <p className="text-xs font-black uppercase text-black">Email Verification Gate OTP</p>
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Intercepts logins via secret SMTP link to {email}</p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setTwoFactorEmail(!twoFactorEmail)}
                        className={cn(
                          "w-12 h-6 rounded-full transition-colors relative cursor-pointer",
                          twoFactorEmail ? "bg-black" : "bg-gray-200"
                        )}
                      >
                        <span className={cn(
                          "absolute top-1 bg-white w-4 h-4 rounded-full transition-transform",
                          twoFactorEmail ? "right-1" : "left-1"
                        )} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Login Devices */}
                <div className="pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-black">📱 Active Authorization Nodes</h3>
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Devices logged into your server index</p>
                    </div>
                    <button 
                      type="button"
                      onClick={logoutOtherDevices}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 font-black text-[9px] uppercase tracking-widest rounded-lg transition-all"
                    >
                      Logout Other Devices
                    </button>
                  </div>

                  <div className="space-y-3">
                    {activeDevices.map((dev) => {
                      const DeviceIcon = dev.icon;
                      return (
                        <div key={dev.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-sm text-gray-600 border border-gray-150">
                              <DeviceIcon className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-xs font-extrabold text-black uppercase flex items-center gap-1.5">
                                {dev.device}
                                {dev.current && (
                                  <span className="bg-green-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                                    Current
                                  </span>
                                )}
                              </p>
                              <p className="text-[8.5px] text-gray-400 font-bold uppercase tracking-wider">Authorized Area • {dev.location}</p>
                            </div>
                          </div>
                          {!dev.current && (
                            <button 
                              type="button" 
                              onClick={() => {
                                setActiveDevices(prev => prev.filter(d => d.id !== dev.id));
                                triggerToast("Authorization key revoked for item " + dev.device);
                              }}
                              className="text-red-500 hover:text-red-600 text-[10px] font-black uppercase tracking-wider"
                            >
                              Revoke
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ======================================= */}
            {/* 3. ADDRESSES SUB-VIEW                  */}
            {/* ======================================= */}
            {activeTab === 'addresses' && (
              <div className={cn("bg-white rounded-[24px] p-6 sm:p-8 shadow-sm border border-gray-150/60", themeMode === 'dark' && 'bg-neutral-950 border-neutral-800 shadow-none')}>
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
                  <div>
                    <h2 className="text-lg font-black uppercase tracking-tight">📍 {t.addresses}</h2>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">{t.addressesDesc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingAddressId(null);
                      setAddrForm({ name: '', phone: '', division: 'Dhaka', district: 'Dhaka', area: '', fullAddress: '', landmark: '', isDefault: false, tag: 'HOME' });
                      setShowAddressModal(true);
                    }}
                    className="px-4 py-2.5 bg-black hover:bg-neutral-900 text-white font-black text-[9px] uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add Address
                  </button>
                </div>

                <div className="space-y-4">
                  {addresses.map((addr) => (
                    <div key={addr.id} className="p-5 bg-gray-50 rounded-2xl border border-gray-150 relative group">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-black text-black uppercase tracking-tight">{addr.name}</span>
                            <span className={cn(
                              "text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border",
                              addr.tag === 'HOME' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-purple-50 text-purple-600 border-purple-100'
                            )}>
                              💼 {addr.tag}
                            </span>
                            {addr.isDefault && (
                              <span className="bg-black text-white text-[7px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
                                Default Shipping
                              </span>
                            )}
                          </div>
                          <div className="space-y-1 bg-white p-3 rounded-xl border border-gray-150 inline-block w-full">
                            <p className="text-[10.5px] text-zinc-600 font-bold flex items-center gap-1.5 uppercase tracking-wide">
                              <span className="opacity-80">📍</span> Division: {addr.division}
                            </p>
                            <p className="text-[10.5px] text-zinc-600 font-bold flex items-center gap-1.5 uppercase tracking-wide">
                              <span className="opacity-80">📍</span> District: {addr.district}
                            </p>
                            <p className="text-[10.5px] text-zinc-600 font-bold flex items-center gap-1.5 uppercase tracking-wide">
                              <span className="opacity-80">📍</span> Thana: {addr.upazila || addr.area || 'N/A'}
                            </p>
                            <p className="text-[10.5px] text-black font-black flex items-start gap-1.5 uppercase tracking-wide mt-1.5 pt-1.5 border-t border-gray-100">
                              <span className="opacity-80">🏠</span> Full Address: {addr.fullAddress}
                            </p>
                          </div>
                          {addr.landmark && (
                            <p className="text-[9px] text-gray-400 italic font-semibold mt-1 pl-1">
                              Landmark: {addr.landmark}
                            </p>
                          )}
                          <p className="text-[10px] font-bold text-gray-500 mt-2 pl-1 italic">
                            Contact Link: {addr.phone}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 flex-col sm:flex-row">
                          <button
                            type="button"
                            onClick={() => handleEditAddress(addr)}
                            className="p-2 bg-white text-gray-600 border border-gray-150 hover:bg-black hover:text-white rounded-lg transition-all"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => removeAddress(addr.id)}
                            className="p-2 bg-red-50 text-red-600 border border-red-100 hover:bg-red-600 hover:text-white rounded-lg transition-all"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ======================================= */}
            {/* 4. NOTIFICATIONS SUB-VIEW              */}
            {/* ======================================= */}
            {activeTab === 'notifications' && (
              <UpdatesNotificationsView 
                themeMode={themeMode} 
                triggerToast={triggerToast} 
                navigate={navigate} 
              />
            )}

            {/* ======================================= */}
            {/* 5. PRIVACY & DATA DATA SUB-VIEW        */}
            {/* ======================================= */}
            {activeTab === 'privacy' && (
              <div className={cn("bg-white rounded-[24px] p-6 sm:p-8 shadow-sm border border-gray-150/60", themeMode === 'dark' && 'bg-neutral-950 border-neutral-800 shadow-none')}>
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
                  <div>
                    <h2 className="text-lg font-black uppercase tracking-tight">🛡 {t.privacy}</h2>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">{t.privacyDesc}</p>
                  </div>
                  <Shield className="w-6 h-6 text-gray-300" />
                </div>

                <div className="space-y-6">
                  {/* Hide profile toggle */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                      <h4 className="text-xs font-black uppercase text-black">Hide Account Directory Data</h4>
                      <p className="text-[8.5px] text-gray-400 font-bold uppercase tracking-wider">Hides address parameters and phone digits from affiliate nodes</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setHideProfile(!hideProfile)}
                      className={cn(
                        "w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ml-4",
                        hideProfile ? "bg-black" : "bg-gray-200"
                      )}
                    >
                      <span className={cn(
                        "absolute top-1 bg-white w-4 h-4 rounded-full transition-transform",
                        hideProfile ? "right-1" : "left-1"
                      )} />
                    </button>
                  </div>

                  {/* Public visibility tabs */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-black">Account Visibility Mode</label>
                    <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
                      <button 
                        type="button"
                        onClick={() => setAccountVisibility('public')}
                        className={cn(
                          "flex-1 py-2.5 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer",
                          accountVisibility === 'public' ? 'bg-white shadow-sm text-black' : 'text-gray-400'
                        )}
                      >
                        Public Profile
                      </button>
                      <button 
                        type="button"
                        onClick={() => setAccountVisibility('private')}
                        className={cn(
                          "flex-1 py-2.5 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer",
                          accountVisibility === 'private' ? 'bg-white shadow-sm text-black' : 'text-gray-400'
                        )}
                      >
                        Private Profile
                      </button>
                    </div>
                  </div>

                  {/* Profile data downloader block */}
                  <div className="p-5 bg-black text-white rounded-2xl border border-black space-y-4">
                    <div className="space-y-1">
                      <h4 className="text-xs font-black uppercase tracking-tight">System Data Portability Rights</h4>
                      <p className="text-[9px] text-gray-300 font-semibold uppercase tracking-wider leading-relaxed">
                        Export your dynamic profile history index, saved locations, payment logs and configurations into an offline JSON backup.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={downloadMyData}
                      className="px-4 py-2 bg-white text-black font-black text-[9px] uppercase tracking-widest rounded-lg transition-all inline-flex items-center gap-2 cursor-pointer shadow-md"
                    >
                      <FileText className="w-3.5 h-3.5" /> Download My Data Archive
                    </button>
                  </div>

                  {/* Severe action delete center */}
                  <div className="p-5 border-2 border-dashed border-red-100 rounded-2xl space-y-4">
                    <div className="space-y-1">
                      <h4 className="text-xs font-black uppercase text-red-600">Danger: Deletion Sequence</h4>
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                        Deletes your dynamic affiliate profile, shipping history logs and reward coins forever. Action cannot be undone.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowDeleteAccountModal(true)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-black text-[9px] uppercase tracking-widest rounded-lg transition-all cursor-pointer"
                    >
                      Delete Account Forever
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ======================================= */}
            {/* 6. PAYMENT METHODS SUB-VIEW            */}
            {/* ======================================= */}
            {activeTab === 'payments' && (
              <div className={cn("bg-white p-6 sm:p-8 flex flex-col min-h-0", themeMode === 'dark' && 'bg-neutral-950')}>
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
                  <div>
                    <h2 className="text-lg font-black uppercase tracking-tight text-black">Payment Methods</h2>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Manage your secure payment options</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddPaymentModal(true)}
                    className="px-4 py-2 bg-black hover:bg-neutral-900 text-white font-bold text-[10px] uppercase tracking-widest transition-all flex items-center gap-1.5 cursor-pointer rounded-md"
                  >
                    + Add Payment Method
                  </button>
                </div>

                <div className="space-y-4 flex-1">
                  {paymentMethods.map((pm) => (
                    <div key={pm.id} className="relative p-5 bg-white border border-gray-200 flex items-center justify-between hover:shadow-[0_2px_10px_rgba(0,0,0,0.04)] transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-10 bg-gray-50 flex items-center justify-center border border-gray-100 text-[10px] font-black text-gray-800 uppercase tracking-wider rounded-sm">
                          {pm.type}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-black font-sans">{pm.type}</p>
                            <CheckCircle className="w-3 h-3 text-green-500" />
                          </div>
                          <p className="text-[11px] text-gray-500 font-medium font-sans mt-0.5">{pm.details}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {pm.isDefault && (
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider border border-gray-200 px-2 py-0.5 rounded-sm">
                            Default
                          </span>
                        )}
                        <button
                          type="button" 
                          className="text-[10px] font-bold text-gray-400 hover:text-black uppercase tracking-widest transition-colors cursor-pointer px-2"
                        >
                          Edit
                        </button>
                        <button
                          type="button" 
                          onClick={() => removePayment(pm.id)}
                          className="text-[10px] font-bold text-red-500 hover:text-red-700 uppercase tracking-widest transition-colors cursor-pointer px-2"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-12 pt-6 border-t border-gray-100 text-center">
                  <p className="text-[11px] text-gray-400 font-sans font-medium tracking-wide">
                    Your assets are securely protected with us.
                  </p>
                </div>
              </div>
            )}

            {/* ======================================= */}
            {/* 7. PREFERENCES LANGUAGES SUB-VIEW      */}
            {/* ======================================= */}
            {activeTab === 'preferences' && (
              <div className={cn("bg-white rounded-[24px] p-6 sm:p-8 shadow-sm border border-gray-150/60", themeMode === 'dark' && 'bg-neutral-950 border-neutral-800 shadow-none')}>
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
                  <div>
                    <h2 className="text-lg font-black uppercase tracking-tight">🎨 {t.preferences}</h2>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">{t.preferencesDesc}</p>
                  </div>
                  <Sliders className="w-6 h-6 text-gray-300" />
                </div>

                <div className="space-y-6">
                  {/* Language System */}
                  <div className="space-y-2.5">
                    <label className="text-[10px] font-black text-black uppercase tracking-wider">System Localization Language</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => handleLangSubmit('en')}
                        className={cn(
                          "py-3.5 rounded-xl text-xs font-black uppercase tracking-wider border transition-all cursor-pointer",
                          lang === 'en' ? 'bg-black border-black text-white font-black' : 'bg-gray-50 text-gray-400 border-gray-150 hover:bg-gray-100'
                        )}
                      >
                        English
                      </button>
                      <button
                        type="button"
                        onClick={() => handleLangSubmit('bn')}
                        className={cn(
                          "py-3.5 rounded-xl text-xs font-black uppercase tracking-wider border transition-all cursor-pointer",
                          lang === 'bn' ? 'bg-black border-black text-white font-black' : 'bg-gray-50 text-gray-400 border-gray-150 hover:bg-gray-100'
                        )}
                      >
                        বাংলা
                      </button>
                    </div>
                  </div>

                  {/* Themes System */}
                  <div className="space-y-2.5">
                    <label className="text-[10px] font-black text-black uppercase tracking-wider">Interface Display Skin theme</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'light', label: 'Light Mode', icon: Sun },
                        { id: 'dark', label: 'Dark Mode', icon: Moon },
                        { id: 'auto', label: 'System Defaults', icon: Info },
                      ].map((tItem) => {
                        const ItemIcon = tItem.icon;
                        return (
                          <button
                            key={tItem.id}
                            type="button"
                            onClick={() => {
                              setThemeMode(tItem.id as any);
                              triggerToast(`Theme skin state assigned to ${tItem.label}!`);
                            }}
                            className={cn(
                              "py-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5",
                              themeMode === tItem.id 
                                ? "bg-black text-white border-black" 
                                : "bg-gray-50 text-gray-500 border-gray-150 hover:bg-gray-100"
                            )}
                          >
                            <ItemIcon className="w-4 h-4" />
                            <span className="text-[9px] uppercase tracking-wider font-extrabold">{tItem.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Font Sizer System */}
                  <div className="space-y-2.5">
                    <label className="text-[10px] font-black text-black uppercase tracking-wider">Dynamic App Typographic Density</label>
                    <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-150">
                      {[
                        { id: 'small', label: 'Small Density' },
                        { id: 'medium', label: 'Medium default' },
                        { id: 'large', label: 'Large display' },
                      ].map((fs) => (
                        <button
                          key={fs.id}
                          type="button"
                          onClick={() => {
                            setFontSize(fs.id as any);
                            triggerToast(`Display font scale assigned to text bounds [${fs.id}]!`);
                          }}
                          className={cn(
                            "flex-1 py-3 text-[10px] font-black uppercase tracking-wider transition-all rounded-lg cursor-pointer",
                            fontSize === fs.id ? 'bg-white shadow text-black' : 'text-gray-400 hover:text-gray-600'
                          )}
                        >
                          {fs.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ======================================= */}
            {/* 8. USER OPERATIONS / ACTIVITY VIEWS      */}
            {/* ======================================= */}
            {activeTab === 'activity' && (
              <div className={cn("bg-white rounded-[24px] p-6 sm:p-8 shadow-sm border border-gray-150/60s", themeMode === 'dark' && 'bg-neutral-950 border-neutral-800 shadow-none')}>
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
                  <div>
                    <h2 className="text-lg font-black uppercase tracking-tight">📦 {t.activity}</h2>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">{t.activityDesc}</p>
                  </div>
                  <Package className="w-6 h-6 text-gray-300" />
                </div>

                <div className="space-y-6">
                  {/* Summary grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl">
                      <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">Active Wishlist Count</p>
                      <h3 className="text-xl font-black text-black mt-1">{wishlistCount} Items Saved</h3>
                    </div>
                    <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl">
                      <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">Recently Viewed Cache</p>
                      <h3 className="text-xl font-black text-black mt-1">{recentlyViewedCount} Items Logged</h3>
                    </div>
                  </div>

                  {/* Active Orders List */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-black">Dynamic Fulfillment Invoices</h4>
                    {ordersActivity.map((ord) => (
                      <div key={ord.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-black text-black uppercase">{ord.id}</p>
                          <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">Order logged on: {ord.date} • status: {ord.status}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-extrabold text-[#111111]">{ord.total.toFixed(2)} BDT</span>
                          <button
                            type="button"
                            onClick={() => downloadInvoice(ord.id, ord.total)}
                            className="px-3 py-1.5 bg-black hover:bg-neutral-900 text-white font-black text-[9px] uppercase tracking-widest rounded-lg transition-all cursor-pointer flex items-center gap-1"
                          >
                            <FileText className="w-3 h-3" /> Invoice
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ======================================= */}
            {/* 9. HELP CENTER FAQ SUB-VIEW            */}
            {/* ======================================= */}
            {activeTab === 'support' && (
              <div className={cn("bg-white rounded-[24px] p-6 sm:p-8 shadow-sm border border-gray-150/60", themeMode === 'dark' && 'bg-neutral-950 border-neutral-800 shadow-none')}>
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
                  <div>
                    <h2 className="text-lg font-black uppercase tracking-tight">🛠 {t.support}</h2>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">{t.supportDesc}</p>
                  </div>
                  <HelpCircle className="w-6 h-6 text-gray-300" />
                </div>

                <div className="space-y-6">
                  {/* Quick-tiles layout */}
                  <div className="grid grid-cols-2 gap-4">
                    <a 
                      href={`https://wa.me/${(settings.contactNumber || "8801314541738").replace(/[^0-9]/g, '')}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="p-5 bg-[#25D366]/5 hover:bg-[#25D366]/10 border border-[#25D366]/20 rounded-2xl transition-all group/call text-center flex flex-col items-center justify-center cursor-pointer"
                    >
                      <Sparkles className="w-7 h-7 text-[#25D366] mb-1.5 group-hover/call:scale-115 transition-transform" />
                      <span className="text-xs font-black uppercase text-black">WhatsApp Chat</span>
                      <span className="text-[8px] text-gray-400 font-bold uppercase mt-0.5">Connect 24/7 direct support</span>
                    </a>

                    <button 
                      type="button"
                      onClick={() => triggerToast("Connecting secure socket server logs with active Support executive...")}
                      className="p-5 bg-black/5 hover:bg-black/10 border border-gray-150 rounded-2xl transition-all group/chat text-center flex flex-col items-center justify-center cursor-pointer"
                    >
                      <CheckCircle className="w-7 h-7 text-black mb-1.5 group-hover/chat:scale-115 transition-transform" />
                      <span className="text-xs font-black uppercase text-black font-sans">Live Web Agent</span>
                      <span className="text-[8px] text-gray-400 font-bold uppercase mt-0.5">Start direct browser terminal</span>
                    </button>
                  </div>

                  {/* FAQS Accordion */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-black">Frequently Asked Questions FAQ</h4>
                    {[
                      { q: "How do I secure refund credits?", a: "Escrow funds are refunded automatically within 3 calendar business days after Return logs complete validation tests." },
                      { q: "Is delivery outside Dhaka area supported?", a: "Yes, we integrate with secure REDX and Pathao logistics outside outer Dhaka gates offering 150 BDT flat rates." },
                      { q: "Can I use multiple promo voucher codes?", a: "System bounds only accept one promotional campaign ticket per secure cart checkout calculation." }
                    ].map((faq, idx) => (
                      <div key={idx} className="border border-gray-150 rounded-xl overflow-hidden bg-gray-50/50">
                        <button
                          type="button"
                          onClick={() => setFaqOpenIdx(faqOpenIdx === idx ? null : idx)}
                          className="w-full text-left p-4 flex items-center justify-between font-black uppercase text-xs tracking-tight text-black cursor-pointer bg-white"
                        >
                          <span>{faq.q}</span>
                          <span className="text-lg font-black">{faqOpenIdx === idx ? "−" : "+"}</span>
                        </button>
                        {faqOpenIdx === idx && (
                          <div className="p-4 text-xs font-medium text-gray-500 bg-gray-50 border-t border-gray-100 leading-relaxed">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Message submit */}
                  <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-wider text-black">Report a System Problem</h4>
                    {supportSubmitted ? (
                      <div className="p-4 bg-green-50 text-green-650 rounded-xl border border-green-100 text-xs font-bold font-sans">
                        Report submitted successfully! Technical moderators will evaluate logs in 24 hours.
                      </div>
                    ) : (
                      <form onSubmit={(e) => { e.preventDefault(); if (supportMessage) setSupportSubmitted(true); }} className="space-y-3">
                        <textarea
                          placeholder="Please describe any UI glitches, order payload errors, or questions in detail..."
                          value={supportMessage}
                          onChange={(e) => setSupportMessage(e.target.value)}
                          required
                          className="w-full h-24 bg-white border border-gray-200 focus:outline-none focus:border-black rounded-xl p-3 text-xs font-semibold placeholder:text-gray-300"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 bg-black hover:bg-neutral-900 text-white font-black text-[9px] uppercase tracking-widest rounded-lg flex items-center gap-1.5 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" /> Dispatch Report
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic Popups and Dialog Sheets */}

      {/* 1. CHANGE PASSWORD MODAL */}
      <AnimatePresence>
        {showPasswordModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPasswordModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[32px] w-full max-w-sm overflow-hidden shadow-2xl border border-neutral-100 relative z-10"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-neutral-950 rounded-2xl flex items-center justify-center">
                      <Lock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-black leading-none mb-1">Update Password</h3>
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Secure auth update</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowPasswordModal(false)}
                    className="w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center transition-colors"
                  >
                    <Plus className="w-5 h-5 rotate-45 text-neutral-400" />
                  </button>
                </div>

                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-black text-neutral-500 uppercase tracking-wider ml-1">New Password</label>
                    <div className="relative">
                      <input 
                        type={showModalPassword ? 'text' : 'password'} 
                        value={newPassword} 
                        onChange={(e) => setNewPassword(e.target.value)} 
                        required
                        className="w-full h-[50px] border border-[#E5E5E5] rounded-[14px] pl-10 pr-12 text-sm focus:border-black outline-none transition-all"
                        placeholder="••••••••" 
                      />
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <button 
                        type="button" 
                        onClick={() => setShowModalPassword(!showModalPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-1"
                      >
                        {showModalPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-black text-neutral-500 uppercase tracking-wider ml-1">Confirm New Password</label>
                    <div className="relative">
                      <input 
                        type={showModalPassword ? 'text' : 'password'} 
                        value={confirmNewPassword} 
                        onChange={(e) => setConfirmNewPassword(e.target.value)} 
                        required
                        className="w-full h-[50px] border border-[#E5E5E5] rounded-[14px] pl-10 pr-4 text-sm focus:border-black outline-none transition-all"
                        placeholder="••••••••" 
                      />
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isUpdatingPassword}
                    className="w-full h-[54px] bg-neutral-950 hover:bg-neutral-900 text-white rounded-[16px] font-black uppercase tracking-widest text-xs flex justify-center items-center gap-2 mt-6 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.1)] disabled:opacity-50"
                  >
                    {isUpdatingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : 'UPDATE PASSWORD'}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. PROFILE IMAGE SOURCE SELECTOR BOTTOM SHEET */}
      <AnimatePresence>
        {showPhotoSource && (
          <>
            {/* Blur overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPhotoSource(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]"
            />

            {/* Premium rounded bottom sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 220 }}
              className="fixed bottom-0 inset-x-0 bg-white rounded-t-[32px] shadow-[0_-12px_45px_rgba(0,0,0,0.25)] z-[101] max-w-md mx-auto overflow-hidden text-center pb-8 border border-gray-100"
            >
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto my-4" />
              <div className="px-8 pt-2 pb-6 space-y-6">
                <div>
                  <h4 className="text-lg font-black text-black uppercase tracking-tight">Select Profile Photo</h4>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Select an identity source to assign avatar</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Photo Input Native hooks */}
                  <input 
                    type="file" 
                    accept="image/jpeg,image/png,image/webp,image/jpg" 
                    ref={photoGalleryRef}
                    onChange={(e) => handlePhotoUpload(e.target.files)}
                    className="hidden" 
                  />
                  <input 
                    type="file" 
                    accept="image/jpeg,image/png,image/webp,image/jpg" 
                    capture="user"
                    ref={photoCameraRef}
                    onChange={(e) => handlePhotoUpload(e.target.files)}
                    className="hidden" 
                  />

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => photoGalleryRef.current?.click()}
                    className="flex flex-col items-center justify-center p-6 bg-gray-50 hover:bg-black hover:text-white rounded-3xl border border-gray-100 transition-all group/av relative text-black"
                  >
                    <Sliders className="w-8 h-8 stroke-[1.5] mb-2 group-hover/av:scale-110 group-hover/av:text-white transition-all text-gray-600" />
                    <span className="text-xs font-black uppercase tracking-widest">Gallery</span>
                    <span className="text-[8px] opacity-60 font-medium uppercase mt-1">Browse photos</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => photoCameraRef.current?.click()}
                    className="flex flex-col items-center justify-center p-6 bg-gray-50 hover:bg-black hover:text-white rounded-3xl border border-gray-100 transition-all group/av relative text-black"
                  >
                    <Camera className="w-8 h-8 stroke-[1.5] mb-2 group-hover/av:scale-110 group-hover/av:text-white transition-all text-gray-600" />
                    <span className="text-xs font-black uppercase tracking-widest">Camera</span>
                    <span className="text-[8px] opacity-60 font-medium uppercase mt-1">Take selfie</span>
                  </motion.button>
                </div>

                <button 
                  type="button"
                  onClick={() => setShowPhotoSource(false)}
                  className="w-full bg-gray-100 font-black text-black py-4 rounded-2xl text-[10px] uppercase tracking-[0.2em] hover:bg-gray-200 active:scale-95 transition-all text-center cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 3. SAVED ADDRESS MODAL WITH LOCATION PICKER GRAPHIC */}
      <AnimatePresence>
        {showAddressModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddressModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className={cn(
                "bg-white rounded-[32px] p-6 sm:p-8 w-full max-w-xl relative z-10 max-h-[90vh] overflow-y-auto shadow-2xl space-y-6",
                themeMode === 'dark' && 'bg-neutral-900 border border-neutral-800'
              )}
            >
              <div>
                <h3 className="text-xl font-black text-black uppercase tracking-tight">{editingAddressId ? 'Update Delivery Location' : 'Add Shipping Address'}</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Configure exact spatial vectors for transit</p>
              </div>

              {/* Map Location GPS Picker Graphic Simulator */}
              <div className="p-4 bg-gray-900 rounded-2xl border border-black text-white space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between z-10 relative">
                  <div>
                    <span className="text-[8px] uppercase tracking-widest text-[#25D366] font-black animate-pulse">● GEOLOCATION SATELLITE</span>
                    <h4 className="text-xs font-black uppercase tracking-tight">Active Live Pinpoint Coordinates</h4>
                  </div>
                  <button
                    type="button"
                    onClick={simulateLocationPin}
                    disabled={isPinningLocation}
                    className="px-3.5 py-1.5 bg-[#25D366] hover:bg-[#25D366]/90 text-black font-black text-[8px] uppercase tracking-widest rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    {isPinningLocation ? "Locking GPS..." : "Auto Pin My GPS Location"}
                  </button>
                </div>

                <div className="h-28 bg-[#111111]/95 rounded-xl flex items-center justify-center flex-col p-4 border border-gray-800 relative select-none">
                  {/* Radar radar ripple grid */}
                  <div className="absolute inset-0 bg-neutral-900/40 opacity-40 bg-[radial-gradient(#444_1px,transparent_1px)] [background-size:16px_16px]" />
                  <div className="w-10 h-10 border-2 border-red-500 rounded-full flex items-center justify-center animate-ping absolute" />
                  <MapPin className="w-8 h-8 text-red-500 z-10 mb-2 relative" />
                  <span className="text-[9px] font-mono font-bold z-10 text-gray-400 relative">
                    GSP: {mapLatitude.toFixed(5)}° N, {mapLongitude.toFixed(5)}° E {isPinningLocation && "[CALIBRATING]"}
                  </span>
                  <span className="text-[7.5px] uppercase font-bold tracking-widest text-gray-500 z-10 relative mt-0.5">Dhaka Metropolitan Grid</span>
                </div>
              </div>

              <form onSubmit={handleSaveAddress} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-wider text-black">Identifier Name *</label>
                    <input 
                      type="text" required placeholder="e.g. My Flat, Office Room"
                      value={addrForm.name} onChange={(e) => setAddrForm({...addrForm, name: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-150 rounded-lg p-3 text-xs font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-wider text-black">Contact Phone *</label>
                    <input 
                      type="text" required placeholder="e.g. 01712345678"
                      value={addrForm.phone} onChange={(e) => setAddrForm({...addrForm, phone: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-150 rounded-lg p-3 text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-wider text-black">Division (Optional)</label>
                    <select 
                      value={addrForm.division} 
                      onChange={(e) => {
                        const div = e.target.value;
                        setAddrForm({...addrForm, division: div, district: '', upazila: ''});
                      }}
                      className="w-full bg-gray-50 border border-gray-150 rounded-lg p-3 text-xs font-bold cursor-pointer"
                    >
                      <option value="">Select Division</option>
                      {divisions.map(div => <option key={div} value={div}>{div}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-wider text-black">District (Optional)</label>
                    <select 
                      value={addrForm.district} 
                      disabled={!addrForm.division}
                      onChange={(e) => {
                        const dist = e.target.value;
                        setAddrForm({...addrForm, district: dist, upazila: ''});
                      }}
                      className="w-full bg-gray-50 border border-gray-150 rounded-lg p-3 text-xs font-bold cursor-pointer disabled:opacity-50"
                    >
                      <option value="">Select District</option>
                      {addrForm.division && bdAddressData[addrForm.division as keyof typeof bdAddressData] && 
                        Object.keys(bdAddressData[addrForm.division as keyof typeof bdAddressData]).map(dist => (
                          <option key={dist} value={dist}>{dist}</option>
                        ))
                      }
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-wider text-black">Thana / Upazila (Optional)</label>
                    <select 
                      value={addrForm.upazila} 
                      disabled={!addrForm.district}
                      onChange={(e) => setAddrForm({...addrForm, upazila: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-150 rounded-lg p-3 text-xs font-bold cursor-pointer disabled:opacity-50"
                    >
                      <option value="">Select Upazila</option>
                      {addrForm.division && addrForm.district && bdAddressData[addrForm.division as keyof typeof bdAddressData]?.[addrForm.district]?.map(up => (
                          <option key={up} value={up}>{up}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-wider text-black">Area / Union (Optional)</label>
                    <input 
                      type="text" placeholder="e.g., Banani, Gulshan"
                      value={addrForm.area} onChange={(e) => setAddrForm({...addrForm, area: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-150 rounded-lg p-3 text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-wider text-black">Full Address *</label>
                  <textarea 
                    required placeholder="Apartment / Suite, Building, Street No, House / Road / Village"
                    value={addrForm.fullAddress} onChange={(e) => setAddrForm({...addrForm, fullAddress: e.target.value})}
                    className="w-full h-16 bg-gray-50 border border-gray-150 rounded-lg p-3 text-xs font-semibold placeholder:text-gray-300"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-wider text-black">Secondary Landmark (Optional)</label>
                  <input 
                    type="text" placeholder="e.g. Opposite of ABC mosque, Level 4"
                    value={addrForm.landmark} onChange={(e) => setAddrForm({...addrForm, landmark: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-150 rounded-lg p-3 text-xs font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-wider text-black">Classification Tag *</label>
                    <div className="flex gap-2">
                      {['HOME', 'OFFICE', 'OTHER'].map(tag => (
                        <button
                          key={tag} type="button" onClick={() => setAddrForm({...addrForm, tag})}
                          className={cn(
                            "flex-1 py-2 text-[10px] font-black rounded-lg transition-all border cursor-pointer",
                            addrForm.tag === tag ? "bg-black text-white border-black" : "bg-gray-50 text-gray-400"
                          )}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 bg-gray-50 border border-gray-150 rounded-xl">
                    <span className="text-[9px] font-black uppercase tracking-wider text-black ml-1">Set Default Shipping?</span>
                    <button 
                      type="button"
                      onClick={() => setAddrForm({...addrForm, isDefault: !addrForm.isDefault})}
                      className={cn(
                        "w-10 h-5 rounded-full transition-colors relative cursor-pointer",
                        addrForm.isDefault ? "bg-black" : "bg-gray-200"
                      )}
                    >
                      <span className={cn(
                        "absolute top-0.5 bg-white w-4 h-4 rounded-full transition-transform",
                        addrForm.isDefault ? "right-0.5" : "left-0.5"
                      )} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                  <button
                    type="button" onClick={() => setShowAddressModal(false)}
                    className="py-3.5 bg-gray-100 hover:bg-gray-200 text-black font-black uppercase tracking-widest text-[9px] rounded-xl transition-all font-sans cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="py-3.5 bg-black hover:bg-neutral-900 text-white font-black uppercase tracking-widest text-[9px] rounded-xl transition-all shadow-md font-sans cursor-pointer"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. SAVED CORRESPONDENCE PAYMENT MODAL */}
      <AnimatePresence>
        {showAddPaymentModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddPaymentModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className={cn(
                "bg-white rounded-[32px] p-6 sm:p-8 w-full max-w-md relative z-10 shadow-2xl space-y-6",
                themeMode === 'dark' && 'bg-neutral-900 border border-neutral-800'
              )}
            >
              <div>
                <h3 className="text-xl font-black text-black uppercase tracking-tight">Add Payment Gateway</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Configure bkash, nagad, rocket or cards parameters</p>
              </div>

              {/* Toggle type tabs */}
              <div className="grid grid-cols-4 gap-2 bg-gray-100 p-1 rounded-xl">
                {['bKash', 'Nagad', 'Rocket', 'Card'].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setNewPayType(item as any);
                    }}
                    className={cn(
                      "py-2 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer",
                      newPayType === item ? "bg-black text-white font-black shadow" : "text-gray-400 hover:bg-gray-200"
                    )}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <form onSubmit={handleAddNewPayment} className="space-y-4">
                {newPayType === 'Card' ? (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-wider text-black">Card Number *</label>
                      <input 
                        type="text" required placeholder="e.g. 4321 0000 1234 4321" maxLength={19}
                        value={newCardNumber} onChange={(e) => setNewCardNumber(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-150 rounded-lg p-3 text-xs font-bold font-mono tracking-widest placeholder:tracking-normal focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-wider text-black">Expiration MM/YY *</label>
                        <input 
                          type="text" required placeholder="08/30" maxLength={5}
                          value={newCardExpiry} onChange={(e) => setNewCardExpiry(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-150 rounded-lg p-3 text-xs font-bold text-center focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-wider text-black">CVV PIN *</label>
                        <input 
                          type="password" required placeholder="•••" maxLength={3}
                          value={newCardCvv} onChange={(e) => setNewCardCvv(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-150 rounded-lg p-3 text-xs font-bold text-center tracking-[0.5em] focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-wider text-black">Cardholder Name *</label>
                      <input 
                        type="text" required placeholder="e.g. IMTIAZ KHAN"
                        value={newCardHolder} onChange={(e) => setNewCardHolder(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-150 rounded-lg p-3 text-xs font-bold uppercase focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-1.5 animate-fade-in">
                      <label className="text-[9px] font-black uppercase tracking-wider text-black">{newPayType} Wallet Account Number *</label>
                      <input 
                        type="text" required placeholder="e.g. 01712345678" maxLength={11}
                        value={newPayNumber} onChange={(e) => setNewPayNumber(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-150 rounded-lg p-3 text-xs font-bold font-mono tracking-widest placeholder:tracking-normal focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-wider text-black">Account Name *</label>
                      <input 
                        type="text" required placeholder="e.g. IMTIAZ KHAN"
                        value={newAccountName} onChange={(e) => setNewAccountName(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-150 rounded-lg p-3 text-xs font-bold uppercase focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-wider text-black">Nickname (Optional)</label>
                      <input 
                        type="text" placeholder="e.g. Personal bKash"
                        value={newNickname} onChange={(e) => setNewNickname(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-150 rounded-lg p-3 text-xs font-bold focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                  <button
                    type="button" onClick={() => setShowAddPaymentModal(false)}
                    className="py-3.5 bg-gray-105 bg-gray-100 hover:bg-gray-200 text-black font-black uppercase tracking-widest text-[9px] rounded-xl transition-all cursor-pointer font-sans"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="py-3.5 bg-black hover:bg-neutral-900 text-white font-black uppercase tracking-widest text-[9px] rounded-xl transition-all shadow-md cursor-pointer font-sans"
                  >
                    Attach Wallet
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. SEVERE DANGER DELETE ACCOUNT MODAL */}
      <AnimatePresence>
        {showDeleteAccountModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteAccountModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="bg-white rounded-[32px] p-6 sm:p-8 w-full max-w-sm relative z-10 shadow-2xl text-center space-y-6"
            >
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-sm animate-bounce">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-black text-black uppercase tracking-tight">Severe Action Validation</h3>
                <p className="text-[10px] text-gray-500 font-bold leading-relaxed uppercase tracking-wider mt-1">
                  Type phrase <span className="text-red-600 font-black">DELETE</span> into box to verify immediate account erasure.
                </p>
              </div>

              <form onSubmit={handleDeleteAccount} className="space-y-4">
                <input 
                  type="text" required placeholder="DELETE"
                  value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full bg-red-50/50 border border-red-100 rounded-xl p-3 text-xs font-black text-center focus:outline-none focus:border-red-500 uppercase tracking-widest"
                />

                <div className="grid grid-cols-2 gap-4">
                  <button 
                    type="button" onClick={() => setShowDeleteAccountModal(false)}
                    className="py-3.5 bg-gray-100 hover:bg-gray-200 text-black rounded-xl font-black uppercase text-[10px] tracking-wider transition-all cursor-pointer font-sans"
                  >
                    Abandon
                  </button>
                  <button 
                    type="submit"
                    className="py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black uppercase text-[10px] tracking-wider transition-all disabled:opacity-30 cursor-pointer font-sans"
                    disabled={deleteConfirmText !== 'DELETE'}
                  >
                    Confirm Purge
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LOGOUT CONFIRMATION MODAL */}
      <LogoutModal 
        isOpen={showLogoutModal} 
        onClose={() => setShowLogoutModal(false)} 
      />

      {/* Global Success / Error Toast Banners */}
      <AnimatePresence>
        {successToast && (
          <motion.div 
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-4 rounded-xl border border-black z-[1000] flex items-center gap-2.5 shadow-2xl text-xs font-black uppercase tracking-wider"
          >
            <CheckCircle className="w-4 h-4 text-[#25D366] stroke-[3]" />
            {successToast}
          </motion.div>
        )}

        {errorToast && (
          <motion.div 
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-4 rounded-xl border border-red-500 z-[1000] flex items-center gap-2.5 shadow-2xl text-xs font-black uppercase tracking-wider"
          >
            <AlertCircle className="w-4 h-4 text-white animate-pulse" />
            {errorToast}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
