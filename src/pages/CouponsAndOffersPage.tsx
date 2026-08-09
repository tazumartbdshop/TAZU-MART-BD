import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCheck, 
  Trash2, 
  ChevronRight, 
  ShoppingBag, 
  ExternalLink, 
  Search, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  Sparkles,
  Ticket,
  Flame,
  Tag,
  Gift
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotificationStore, PromotionalNotification } from '../store/useNotificationStore';
import { useProductStore, Product } from '../store/useProductStore';
import { useSettingsStore } from '../store/useSettingsStore';

export default function CouponsAndOffersPage() {
  const navigate = useNavigate();
  const { notifications, markAsRead, markAllAsRead, deleteNotification, getUnreadCount } = useNotificationStore();
  const { products } = useProductStore();
  const { settings } = useSettingsStore();

  const companyLogoFallback = settings.storeLogo || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=200';

  const [selectedNotif, setSelectedNotif] = useState<PromotionalNotification | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'coupons' | 'unread'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Expanded card IDs state for See More / See Less
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  // Copy coupon state
  const [copiedCouponCode, setCopiedCouponCode] = useState<string | null>(null);

  const unreadCount = getUnreadCount();

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (expandedIds.includes(id)) {
      setExpandedIds(expandedIds.filter(item => item !== id));
    } else {
      setExpandedIds([...expandedIds, id]);
    }
  };

  const handleCopyCoupon = (code: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCouponCode(code);
    setTimeout(() => setCopiedCouponCode(null), 2500);
  };

  // Filtered & sorted campaigns (newest first)
  const displayNotifications = useMemo(() => {
    return notifications
      .filter((n) => {
        if (n.publishedStatus === 'Draft') return false;
        if (filterType === 'unread' && n.isRead) return false;
        if (filterType === 'coupons' && !n.couponCode) return false;
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchTitle = (n.title || '').toLowerCase().includes(q);
          const matchDesc = (n.description || '').toLowerCase().includes(q);
          const matchCoupon = (n.couponCode || '').toLowerCase().includes(q);
          return matchTitle || matchDesc || matchCoupon;
        }
        return true;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [notifications, filterType, searchTerm]);

  // Open notification detail modal
  const handleSelectNotif = (notif: PromotionalNotification) => {
    setSelectedNotif(notif);
    if (!notif.isRead) {
      markAsRead(notif.id);
    }
  };

  // Map products for a notification
  const getNotificationProducts = (notif: PromotionalNotification): Product[] => {
    if (!notif.selectedProductIds || notif.selectedProductIds.length === 0) return [];
    const map = new Map<string, Product>();
    products.forEach((p) => {
      map.set(p.id, p);
      if (p.slug) map.set(p.slug, p);
    });

    const list: Product[] = [];
    notif.selectedProductIds.forEach((id) => {
      const found = map.get(id);
      if (found) list.push(found);
    });
    return list;
  };

  // Selected offer products for modal view
  const modalProducts = useMemo(() => {
    if (!selectedNotif) return [];
    return getNotificationProducts(selectedNotif);
  }, [selectedNotif, products]);

  // Handle clicking a product card in notification detail
  const handleProductClick = (product: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedNotif(null);
    const targetSlug = product.slug || product.id;
    navigate(`/product/${targetSlug}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-16 pt-2 px-2 sm:px-4 md:px-6">
      <div className="max-w-3xl mx-auto space-y-2.5">
        
        {/* COMPACT REDESIGNED HEADER */}
        <div className="h-14 bg-white px-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={() => navigate(-1)}
              className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-700 cursor-pointer shrink-0"
              title="Go Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 min-w-0">
              <Gift className="w-5 h-5 text-amber-500 shrink-0" />
              <h1 className="text-sm sm:text-base font-black text-slate-950 uppercase tracking-tight truncate">
                Coupons & Offers
              </h1>

              {unreadCount > 0 && (
                <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 animate-pulse">
                  {unreadCount} NEW
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="bg-slate-950 hover:bg-black text-white text-[10px] sm:text-xs font-black uppercase tracking-wider px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer active:scale-95"
              >
                <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Mark All Read</span>
                <span className="sm:hidden">Read All</span>
              </button>
            )}
          </div>
        </div>

        {/* SEARCH & FILTER CONTROLS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white p-2 rounded-xl border border-slate-200">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search offer or coupon code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-7 py-1.5 text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0 overflow-x-auto pb-0.5 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                filterType === 'all'
                  ? 'bg-slate-950 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({notifications.length})
            </button>

            <button
              onClick={() => setFilterType('coupons')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                filterType === 'coupons'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              <Ticket className="w-3 h-3" />
              <span>Coupons Only</span>
            </button>

            <button
              onClick={() => setFilterType('unread')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                filterType === 'unread'
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>Unread</span>
              {unreadCount > 0 && (
                <span className="bg-white text-red-600 text-[9px] font-black px-1.5 py-0.2 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* CAMPAIGN NOTIFICATION LIST */}
        <div className="space-y-2">
          {displayNotifications.length > 0 ? (
            displayNotifications.map((notif) => {
              const coverImg = notif.coverImage || notif.bannerImage;
              const hasCustomBanner = coverImg && coverImg.trim() !== '' && coverImg !== companyLogoFallback;
              const notifProducts = getNotificationProducts(notif);
              const isExpanded = expandedIds.includes(notif.id);

              const formattedDate = new Date(notif.createdAt).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              });

              const rawDesc = notif.description || notif.message || '';
              const isLongDesc = rawDesc.length > 110;

              return (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => handleSelectNotif(notif)}
                  className={`border rounded-xl p-3.5 transition-all cursor-pointer relative overflow-hidden bg-white hover:border-slate-400 space-y-2.5 ${
                    notif.isRead
                      ? 'border-slate-200'
                      : 'border-amber-300 bg-amber-50/20 ring-1 ring-amber-400/20'
                  }`}
                >
                  {/* TOP HEADER ROW OF CARD */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                      {!notif.isRead && (
                        <span className="bg-red-600 text-white text-[8.5px] font-black px-1.5 py-0.2 rounded uppercase tracking-wider shrink-0">
                          NEW OFFER
                        </span>
                      )}
                      
                      {notif.couponCode && (
                        <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1 shrink-0">
                          <Ticket className="w-3 h-3 text-amber-600" />
                          <span>COUPON: {notif.couponCode}</span>
                        </span>
                      )}

                      <span className="text-[10px] text-slate-400 font-bold uppercase">
                        {formattedDate}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notif.id);
                      }}
                      className="text-slate-300 hover:text-red-600 p-1 rounded hover:bg-slate-100 transition-colors shrink-0"
                      title="Remove from list"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* PREVIEW IMAGE(S) / BANNER VS PRODUCT PREVIEW */}
                  {hasCustomBanner ? (
                    <div className="w-full h-28 sm:h-36 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                      <img
                        src={coverImg}
                        alt={notif.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  ) : notifProducts.length > 0 ? (
                    <div className="space-y-1">
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">
                        Included Campaign Items ({notifProducts.length})
                      </span>
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                        {notifProducts.slice(0, 5).map((p, pIdx) => {
                          const pImg = p.images?.[0] || p.image || companyLogoFallback;
                          const effectivePrice = p.discountPrice || p.price;
                          return (
                            <div
                              key={p.id || pIdx}
                              className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg p-1 shrink-0 max-w-[140px]"
                            >
                              <img
                                src={pImg}
                                alt={p.name}
                                className="w-7 h-7 object-cover rounded shrink-0 border border-slate-200"
                              />
                              <div className="min-w-0 pr-1">
                                <h5 className="text-[9.5px] font-bold text-slate-900 truncate">{p.name}</h5>
                                <span className="text-[8.5px] font-black text-slate-950 block">
                                  BDT {effectivePrice?.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}

                  {/* TITLE & DESCRIPTION */}
                  <div className="space-y-1">
                    <h3 className={`text-xs sm:text-sm tracking-tight ${notif.isRead ? 'font-bold text-slate-900' : 'font-black text-slate-950'}`}>
                      {notif.title}
                    </h3>

                    <div className="text-[11px] font-medium text-slate-600 leading-normal">
                      {isExpanded ? (
                        <p className="whitespace-pre-line">{rawDesc}</p>
                      ) : (
                        <p className="line-clamp-2">{rawDesc}</p>
                      )}

                      {isLongDesc && (
                        <button
                          onClick={(e) => toggleExpand(notif.id, e)}
                          className="text-[10px] font-black text-amber-600 hover:text-amber-700 uppercase tracking-wider mt-0.5 inline-flex items-center gap-0.5 cursor-pointer"
                        >
                          <span>{isExpanded ? 'See Less' : 'See More'}</span>
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* COUPON QUICK COPY STRIP IF CODE IS PRESENT */}
                  {notif.couponCode && (
                    <div 
                      onClick={(e) => handleCopyCoupon(notif.couponCode!, e)}
                      className="bg-amber-100/70 hover:bg-amber-100 border border-amber-300/80 px-3 py-1.5 rounded-lg flex items-center justify-between gap-2 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Tag className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        <span className="text-[11px] font-black text-amber-950 tracking-wider font-mono">
                          {notif.couponCode}
                        </span>
                      </div>
                      <span className="text-[10px] font-black text-amber-800 uppercase tracking-wider flex items-center gap-1">
                        {copiedCouponCode === notif.couponCode ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Voucher</span>
                          </>
                        )}
                      </span>
                    </div>
                  )}

                  {/* BOTTOM FOOTER ACTION BUTTON */}
                  <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[9px] text-slate-400 font-bold uppercase">
                      Tap to open full details
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectNotif(notif);
                      }}
                      className="bg-slate-950 hover:bg-black text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <span>View Offer</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>

                </motion.div>
              );
            })
          ) : (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-xl p-8 text-center space-y-2">
              <Gift className="w-7 h-7 text-amber-400 mx-auto" />
              <h3 className="text-xs font-black text-slate-900 uppercase">No Active Offers Found</h3>
              <p className="text-[11px] text-slate-500 font-medium">
                {filterType === 'coupons'
                  ? 'No coupon voucher offers available right now.'
                  : filterType === 'unread'
                  ? 'You have viewed all promotional campaigns.'
                  : 'Check back soon for new discounts, vouchers, and deals!'}
              </p>
            </div>
          )}
        </div>

      </div>

      {/* POPUP / BOTTOM SHEET MODAL */}
      <AnimatePresence>
        {selectedNotif && (
          <div className="fixed inset-0 z-[250] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-slate-950 border-t sm:border border-slate-800 text-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* POPUP HEADER */}
              <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="bg-amber-500 text-slate-950 font-black text-[9px] uppercase px-2 py-0.5 rounded tracking-wider">
                    Special Offer
                  </span>
                  <span className="text-[10px] text-slate-300 font-bold">
                    {new Date(selectedNotif.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                  </span>
                </div>

                <button
                  onClick={() => setSelectedNotif(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-full cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* POPUP BODY CONTENT */}
              <div className="p-4 overflow-y-auto space-y-3.5 flex-1 text-left">
                
                {/* BANNER IMAGE IF PRESENT */}
                {(selectedNotif.coverImage || selectedNotif.bannerImage) && (
                  <div className="w-full h-36 sm:h-44 rounded-xl overflow-hidden border border-slate-800 bg-slate-900 shrink-0">
                    <img
                      src={selectedNotif.coverImage || selectedNotif.bannerImage}
                      alt={selectedNotif.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {/* TITLE & DESCRIPTION */}
                <div className="space-y-1.5">
                  <h2 className="text-sm sm:text-base font-black text-white uppercase leading-snug">
                    {selectedNotif.title}
                  </h2>
                  <p className="text-xs font-medium text-slate-300 leading-relaxed whitespace-pre-line bg-slate-900/90 border border-slate-800 p-3 rounded-xl">
                    {selectedNotif.description || selectedNotif.message}
                  </p>
                </div>

                {/* COUPON SUPPORT SECTION */}
                {selectedNotif.couponCode && (
                  <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[9px] font-black uppercase text-amber-400 block">
                        Exclusive Coupon Voucher
                      </span>
                      <span className="text-sm font-black text-amber-300 tracking-wider font-mono">
                        {selectedNotif.couponCode}
                      </span>
                    </div>

                    <button
                      onClick={(e) => handleCopyCoupon(selectedNotif.couponCode!, e)}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-3.5 py-1.5 rounded-xl uppercase tracking-wider transition-all cursor-pointer shadow-xs active:scale-95 shrink-0 flex items-center gap-1"
                    >
                      {copiedCouponCode === selectedNotif.couponCode ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-slate-950" />
                          <span>Copied Code!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Code</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* TARGET PRODUCTS GRID / LIST */}
                {modalProducts.length > 0 && (
                  <div className="space-y-2 pt-1 border-t border-slate-800">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black uppercase text-slate-200 tracking-wider flex items-center gap-1.5">
                        <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                        <span>Featured Campaign Products ({modalProducts.length})</span>
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
                      {modalProducts.map((p, idx) => {
                        const img = p.images?.[0] || p.image || companyLogoFallback;
                        const original = p.price;
                        const sale = p.discountPrice;
                        const hasDiscount = sale && original && original > sale;
                        const discountPercent = hasDiscount ? Math.round(((original - sale) / original) * 100) : 0;

                        return (
                          <div
                            key={p.id || idx}
                            className="border border-slate-800 bg-slate-900 p-2 rounded-xl flex items-center gap-2 transition-all hover:border-amber-400"
                          >
                            <img
                              src={img}
                              alt={p.name}
                              className="w-12 h-12 object-cover rounded-lg border border-slate-800 shrink-0 bg-slate-950"
                            />

                            <div className="flex-1 min-w-0">
                              <h4 className="text-[11px] font-black text-slate-200 truncate">
                                {p.name}
                              </h4>

                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-xs font-black text-amber-400">
                                  BDT {(sale || original)?.toLocaleString()}
                                </span>

                                {hasDiscount && (
                                  <span className="text-[9px] bg-red-950 text-red-400 border border-red-800 font-black px-1 rounded">
                                    -{discountPercent}%
                                  </span>
                                )}
                              </div>
                            </div>

                            <button
                              onClick={(e) => handleProductClick(p, e)}
                              className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-[9.5px] font-black uppercase px-2.5 py-1.5 rounded-lg transition-all shrink-0 cursor-pointer flex items-center gap-0.5"
                            >
                              <span>Open</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>

              {/* POPUP FOOTER */}
              <div className="bg-slate-900 border-t border-slate-800 px-4 py-2.5 flex items-center justify-between shrink-0">
                <span className="text-[9.5px] text-slate-400 font-bold uppercase">
                  Campaign Offer
                </span>

                <button
                  onClick={() => setSelectedNotif(null)}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase px-4 py-1.5 rounded-xl transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
