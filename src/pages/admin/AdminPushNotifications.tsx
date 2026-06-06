import React, { useState } from 'react';
import { 
  Bell, Megaphone, Send, Clock, Trash2, Shield, Plus, Sparkles, AlertCircle,
  CheckCircle, Ticket, Percent, Zap, Truck, Users, ArrowRight, Eye, RefreshCw, FileText
} from 'lucide-react';
import { motion } from 'motion/react';
import { useNotificationStore, PromotionalNotification } from '../../store/useNotificationStore';

const AUDIENCES = [
  { id: 'all', label: 'All Customers (Default)' },
  { id: 'verified', label: 'Verified Status Clients Only' },
  { id: 'vip', label: 'VIP Status Clients Only' },
  { id: 'new', label: 'New Registered Customer list' },
];

const PROMPT_TYPES = [
  { id: 'flash_sale', label: 'Flash Sale Countdown' },
  { id: 'discount', label: 'Discount Campaign Blast' },
  { id: 'coupon', label: 'Promotional Coupon Voucher' },
  { id: 'launch', label: 'New Product Launch Release' },
  { id: 'delivery', label: 'Order/Delivery Track Notice' },
  { id: 'stock', label: 'Limited Stock Warning' },
  { id: 'festival', label: 'Festival / Seasonal Event' },
  { id: 'free_shipping', label: 'Zero Shipping Fee Campaign' },
  { id: 'vip', label: 'Exclusive VIP Offer' },
  { id: 'custom', label: 'Custom Marketing/Announcement' },
];

export default function AdminPushNotifications() {
  const { notifications, addNotification, deleteNotification, clearAll } = useNotificationStore();

  // Create Notif Form states
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<PromotionalNotification['type']>('flash_sale');
  const [targetAudience, setTargetAudience] = useState<PromotionalNotification['targetAudience']>('all');
  const [couponCode, setCouponCode] = useState('');
  const [redirectLink, setRedirectLink] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [priority, setPriority] = useState<PromotionalNotification['priority']>('normal');
  const [bannerImage, setBannerImage] = useState('');

  // UI state
  const [showPreview, setShowPreview] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleSendNow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim() || !description.trim()) {
      triggerToast('⚠️ Title, Message, and Description are required!');
      return;
    }

    addNotification({
      title,
      message,
      description,
      type,
      targetAudience,
      couponCode: couponCode.trim() || undefined,
      redirectLink: redirectLink.trim() || undefined,
      scheduledTime: scheduledTime ? new Date(scheduledTime).toISOString() : undefined,
      expiryDate: expiryDate ? new Date(expiryDate).toISOString() : undefined,
      priority,
      bannerImage: bannerImage.trim() || undefined,
    });

    triggerToast('🚀 Campaign push notification broadcasted successfully!');
    
    // Clear form inputs
    setTitle('');
    setMessage('');
    setDescription('');
    setCouponCode('');
    setRedirectLink('');
    setBannerImage('');
    setScheduledTime('');
    setExpiryDate('');
    setPriority('normal');
  };

  const loadUnsplashPreset = (url: string) => {
    setBannerImage(url);
    triggerToast('🖼️ Template banner image selected!');
  };

  const PRESET_BANNERS = [
    { name: 'Luxury Sales', url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=400' },
    { name: 'Electronics Tech', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400' },
    { name: 'VIP Gold', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400' },
  ];

  return (
    <div className="font-sans text-[#111111] p-6 max-w-7xl mx-auto space-y-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-6 right-6 bg-zinc-950 text-white px-4 py-3 shadow-xl z-50 rounded-xl flex items-center gap-3 border border-zinc-800 animate-slide-up text-xs font-black uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Panel */}
      <div className="bg-white border border-gray-200 p-6 sm:p-8 rounded-[24px] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center border border-purple-100 shrink-0">
              <Megaphone className="w-5 h-5 text-purple-700" />
            </div>
            <div>
              <h1 className="text-xl font-black uppercase tracking-tight text-zinc-950">Marketing & Campaign Push Console</h1>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Push real-time promotional alerts, event coupons, and custom announcements to client devices</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] bg-purple-100 text-purple-800 font-extrabold px-3 py-1.5 uppercase tracking-widest border border-purple-200">
            {notifications.length} Total Campaigns
          </span>
          {notifications.length > 0 && (
            <button 
              onClick={() => {
                if (confirm('Delete all notification logs permanently?')) {
                  clearAll();
                  triggerToast('Promotional system database cleared.');
                }
              }}
              className="px-3 h-9 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 text-[10px] font-black uppercase tracking-wider transition-all"
            >
              Clear DB
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Creator Control Form */}
        <div className="lg:col-span-7 bg-white border border-gray-200 rounded-[24px] p-6 shadow-xs flex flex-col">
          <div className="pb-4 border-b border-gray-100 mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black uppercase text-zinc-950 tracking-tight">Create New Campaign Alert</h2>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Fill target metadata to build high-converting push broadcasts</p>
            </div>
            <Megaphone className="w-4 h-4 text-gray-300" />
          </div>

          <form onSubmit={handleSendNow} className="space-y-4">
            {/* Title & Short Message */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-zinc-700 mb-1 tracking-wider">Notification Title *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. ⚡ MID-SEASON MADNESS SALE LIVE!"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-zinc-700 mb-1 tracking-wider">Short Feed Message *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Save flat 40% on headphones now."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                />
              </div>
            </div>

            {/* Full Description text area */}
            <div>
              <label className="block text-[10px] font-black uppercase text-zinc-700 mb-1 tracking-wider">Full In-App Description *</label>
              <textarea 
                required
                rows={3}
                placeholder="Write exhaustive details, terms, and action motivation. Shows up when customer clicks the notification tile."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all resize-none"
              />
            </div>

            {/* Type & Audience Choose */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-zinc-700 mb-1 tracking-wider">Campaign Type / Icon Indicator</label>
                <select 
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-black uppercase tracking-wider focus:outline-none focus:border-black"
                >
                  {PROMPT_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-zinc-700 mb-1 tracking-wider">Target Audience Segment</label>
                <select 
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value as any)}
                  className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-black uppercase tracking-wider focus:outline-none focus:border-black"
                >
                  {AUDIENCES.map((aud) => (
                    <option key={aud.id} value={aud.id}>{aud.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Optional Coupon & Redirect url link */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-zinc-700 mb-1 tracking-wider">Coupon Code (Optional)</label>
                <input 
                  type="text"
                  placeholder="e.g. FLASH40"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-black uppercase focus:outline-none focus:border-black"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-zinc-700 mb-1 tracking-wider">Redirect Target Route</label>
                <select 
                  value={redirectLink}
                  onChange={(e) => setRedirectLink(e.target.value)}
                  className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-black uppercase tracking-wider focus:outline-none focus:border-black"
                >
                  <option value="">No redirect (Simple Alert)</option>
                  <option value="/offers">Promo Campaign Offers View</option>
                  <option value="/categories">Category Navigation Feed</option>
                  <option value="/cart">Direct Checkout Cart</option>
                  <option value="/account/dashboard">Customer Personal Settings</option>
                </select>
              </div>
            </div>

            {/* Date scheduling / scheduling & priority */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-zinc-700 mb-1 tracking-wider">Campaign Priority Badge</label>
                <select 
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-black uppercase tracking-wider focus:outline-none"
                >
                  <option value="normal">NORMAL NOTICE</option>
                  <option value="important">IMPORTANT FLASH</option>
                  <option value="offer">OFFER / VOUCHER</option>
                  <option value="urgent">URGENT ACTION</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-zinc-700 mb-1 tracking-wider">Scheduling Date/Time (GMT)</label>
                <input 
                  type="datetime-local"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-zinc-700 mb-1 tracking-wider">De-activation / Expiry Date</label>
                <input 
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none"
                />
              </div>
            </div>

            {/* Banner Image URL & presets */}
            <div>
              <label className="block text-[10px] font-black uppercase text-zinc-700 mb-1 tracking-wider">Direct Banner/Image URL (Optional)</label>
              <input 
                type="text"
                placeholder="https://images.unsplash.com/promo-banner.jpg..."
                value={bannerImage}
                onChange={(e) => setBannerImage(e.target.value)}
                className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-black mb-2"
              />
              <div className="flex gap-2 flex-wrap">
                <span className="text-[9px] text-gray-400 font-extrabold uppercase my-auto">Templates:</span>
                {PRESET_BANNERS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => loadUnsplashPreset(preset.url)}
                    className="bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-[8px] font-extrabold uppercase px-2 py-1 rounded-md"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Actions Row */}
            <div className="pt-4 border-t border-gray-150 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="h-11 px-4.5 border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => triggerToast('💾 Campaign notification draft saved successfully.')}
                  className="h-11 px-4 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                >
                  Save Draft
                </button>
                <button
                  type="submit"
                  className="h-11 px-6 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-sm"
                >
                  <Send className="w-4 h-4" />
                  Send Now
                </button>
              </div>
            </div>
          </form>

          {/* Inline Live Preview Component */}
          {showPreview && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-5 border border-purple-100 bg-purple-50/20 rounded-2xl"
            >
              <div className="flex justify-between items-center mb-3">
                <span className="text-[9px] text-purple-600 font-black uppercase tracking-widest">In-App Customer Feed Mockup</span>
                <span className="text-[8px] bg-amber-100 text-amber-800 px-1.5 py-0.5 font-bold uppercase">Live Preview</span>
              </div>
              <div className="bg-white border border-gray-150 p-4 rounded-xl flex items-start gap-4">
                <div className="w-9 h-9 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0">
                  <Megaphone className="w-4 h-4 text-purple-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-purple-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-none uppercase">
                      {priority.toUpperCase()}
                    </span>
                    <h4 className="text-xs font-black text-zinc-900 uppercase tracking-tight truncate">
                      {title || 'Example Title Here'}
                    </h4>
                  </div>
                  <p className="text-[11px] text-zinc-500 font-medium leading-snug">
                    {message || 'Type short feed message above to preview real-time appearance...'}
                  </p>
                  {couponCode && (
                    <div className="mt-2.5 inline-flex bg-purple-50 px-2 py-0.5 border border-purple-100 text-[8px] font-black uppercase text-purple-700 rounded-md">
                      Coupon: {couponCode}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Sent & Scheduled History Sidebar */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white border border-gray-200 rounded-[24px] p-6 shadow-xs flex-1 flex flex-col">
            <div className="pb-4 border-b border-gray-100 mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black uppercase text-zinc-950 tracking-tight">Campaign Broadcast Archive</h2>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Live database view of sent campaigns</p>
              </div>
              <Clock className="w-4 h-4 text-gray-300" />
            </div>

            <div className="flex-1 space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <div 
                    key={notif.id}
                    className="border border-gray-150 p-4.5 rounded-2xl bg-gray-50 flex items-start gap-3.5 hover:border-zinc-300 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-zinc-200 flex items-center justify-center shrink-0 text-zinc-700 shadow-xs text-xs font-black">
                      {notif.type[0].toUpperCase()}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[8px] font-extrabold text-[#1877F2] uppercase tracking-wider">
                          [{notif.targetAudience.toUpperCase()}]
                        </span>
                        <h4 className="text-[11px] font-black text-zinc-950 uppercase tracking-tight truncate">
                          {notif.title}
                        </h4>
                      </div>

                      <p className="text-[10px] text-zinc-500 font-medium leading-snug line-clamp-2 mt-1">
                        {notif.message}
                      </p>

                      <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-gray-200/60 pt-2 text-[8px] text-gray-400 font-bold uppercase tracking-wider">
                        <span>
                          {new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(notif.createdAt))}
                        </span>
                        <button
                          onClick={() => {
                            deleteNotification(notif.id);
                            triggerToast('Notification log deleted safely.');
                          }}
                          className="text-red-500 hover:text-red-700 font-black"
                        >
                          DELETE
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-gray-100 rounded-2xl my-auto">
                  <Megaphone className="w-8 h-8 text-gray-300 stroke-[1.2] mb-2" />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">No archived campaigns</span>
                  <span className="text-[8px] text-gray-400 max-w-[200px] uppercase mt-1">Submit your first promotion on the left form to deploy real customers updates</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
