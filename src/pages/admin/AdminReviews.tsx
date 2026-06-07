import React, { useState } from 'react';
import { 
  Star, Trash2, Plus, Search, Filter, X, Check, CheckCircle, 
  Video, Calendar, ArrowRight, CornerDownRight, ExternalLink, 
  ShieldAlert, ShieldCheck, Tag, Reply, Clock, Play
} from 'lucide-react';
import { useReviewStore, ProductReview } from '../../store/useReviewStore';
import { useProductStore } from '../../store/useProductStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminReviews() {
  const { 
    reviews, 
    addReview, 
    deleteReview, 
    replyToReview 
  } = useReviewStore();

  const { products } = useProductStore();

  // Track which review IDs are expanded
  const [expandedReviews, setExpandedReviews] = useState<Record<string, boolean>>({
    'rev-101': true // Expand first one by default for instant visibility
  });

  // Modal controls for adding reviews
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Reply text state per-review to prevent mixing inputs
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});

  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRating, setFilterRating] = useState<string>('All');

  // Form States for creating standard reviews
  const [formCustomerName, setFormCustomerName] = useState('');
  const [formProductId, setFormProductId] = useState(products[0]?.id || '');
  const [formRating, setFormRating] = useState(5);
  const [formReviewText, setFormReviewText] = useState('');
  const [formMediaUrls, setFormMediaUrls] = useState<string[]>([]);
  const [formUrlInput, setFormUrlInput] = useState('');
  const [formVideoUrl, setFormVideoUrl] = useState('');
  const [formVerified, setFormVerified] = useState(true);
  const [formAnonymous, setFormAnonymous] = useState(false);

  // Compute live statistics for summary
  const totalCount = reviews.length;
  const ratingSum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
  const avgRating = totalCount > 0 ? Number((ratingSum / totalCount).toFixed(1)) : 0;

  // Filter implementation (Only show approved/live reviews according to simplified specification)
  const filteredReviews = reviews.filter(rev => {
    const product = products.find(p => p.id === rev.productId);
    const productName = product ? product.name.toLowerCase() : '';
    const nameMatch = rev.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || productName.includes(searchQuery.toLowerCase());
    
    const ratingMatch = filterRating === 'All' || rev.rating === parseInt(filterRating);

    return nameMatch && ratingMatch;
  });

  // Toggle expansion
  const toggleExpand = (id: string) => {
    setExpandedReviews(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Handle direct file upload states for manual review creation
  const handleFormImageUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const filesArray = Array.from(files);
    const slotsLeft = 5 - formMediaUrls.length;
    if (slotsLeft <= 0) return;
    const filesToLoad = filesArray.slice(0, slotsLeft);

    filesToLoad.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setFormMediaUrls(prev => {
            if (prev.length >= 5) return prev;
            return [...prev, reader.result as string];
          });
        }
      };
      reader.readAsDataURL(file as any);
    });
  };

  const handleFormVideoUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setFormVideoUrl(reader.result);
      }
    };
    reader.readAsDataURL(file as any);
  };

  const handleFormRemoveVideo = () => {
    setFormVideoUrl('');
  };

  const handleFormRemoveMedia = (index: number) => {
    setFormMediaUrls(formMediaUrls.filter((_, i) => i !== index));
  };

  // Submission handler
  const handleAddNewReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCustomerName.trim() || !formReviewText.trim()) return;

    let finalVideoUrl = formVideoUrl.trim();
    if (finalVideoUrl.startsWith('data:')) {
      try {
        const { uploadImage } = await import('../../lib/imageUtils');
        const res = await fetch(finalVideoUrl);
        const blob = await res.blob();
        finalVideoUrl = await uploadImage(blob, 'reviews', `video-${Date.now()}`);
      } catch (err) {
        console.error('Failed to upload video:', err);
      }
    }

    const uploadedMediaUrls = await Promise.all(
      formMediaUrls.map(async (url) => {
        if (url.startsWith('data:')) {
          try {
            const { uploadImage } = await import('../../lib/imageUtils');
            const res = await fetch(url);
            const blob = await res.blob();
            return await uploadImage(blob, 'reviews', `image-${Date.now()}`);
          } catch (err) {
            console.error('Failed to upload image:', err);
            return url;
          }
        }
        return url;
      })
    );

    const finalMedia = [...uploadedMediaUrls];
    if (finalVideoUrl) {
      finalMedia.push(finalVideoUrl);
    }

    addReview({
      productId: formProductId,
      customerId: `cust-manual-${Date.now()}`,
      customerName: formCustomerName.trim(),
      rating: formRating,
      reviewText: formReviewText.trim(),
      mediaUrls: finalMedia,
      verified: formVerified,
      isPinned: false,
      anonymous: formAnonymous,
      phone: '+880 1700-000000',
      email: `${formCustomerName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      orderId: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      deviceIP: '127.0.0.1',
      status: 'approved' // Automatically Approved
    });

    // Reset states
    setIsAddModalOpen(false);
    setFormCustomerName('');
    setFormReviewText('');
    setFormMediaUrls([]);
    setFormVideoUrl('');
    setFormVerified(true);
    setFormAnonymous(false);
    setFormRating(5);
  };

  // Reply Submission
  const handleReplySubmit = (e: React.FormEvent, reviewId: string) => {
    e.preventDefault();
    const replyText = replyInputs[reviewId] || '';
    if (!replyText.trim()) return;
    replyToReview(reviewId, replyText.trim());
    setReplyInputs(prev => ({ ...prev, [reviewId]: '' }));
  };

  const handleReplyChange = (reviewId: string, val: string) => {
    setReplyInputs(prev => ({ ...prev, [reviewId]: val }));
  };

  // Helper detection for standard video format
  const isVideoUrl = (url: string) => {
    return url.toLowerCase().endsWith('.mp4') || url.toLowerCase().includes('video');
  };

  return (
    <div className="space-y-6 font-sans px-2 sm:px-4 max-w-4xl mx-auto">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-zinc-950 uppercase tracking-tight">Review Center</h2>
          <p className="text-xs text-zinc-500 font-bold mt-1 uppercase tracking-wider">
            Mobile-First Ecommerce Feedback Management System
          </p>
        </div>
        
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-zinc-950 text-white hover:bg-zinc-800 px-5  py-3 text-xs font-black uppercase tracking-widest transition-all rounded-xl shadow-md w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4 text-emerald-400" />
          Add Store Review
        </button>
      </div>

      {/* COMPACT STATISTICS OVERVIEW */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-xl border border-zinc-150 flex flex-col justify-between">
          <span className="text-[9px] text-zinc-400 font-black uppercase tracking-widest">Total Reviews</span>
          <span className="text-2xl font-black text-zinc-950 mt-1">{totalCount}</span>
          <span className="text-[8px] text-emerald-600 font-extrabold uppercase mt-1">🟢 Fully Live Loop</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-150 flex flex-col justify-between">
          <span className="text-[9px] text-zinc-400 font-black uppercase tracking-widest">Average Score</span>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-2xl font-black text-zinc-950">{avgRating}</span>
            <div className="flex text-amber-500">
              <Star className="w-4 h-4 fill-amber-500" />
            </div>
          </div>
          <span className="text-[8px] text-indigo-600 font-extrabold uppercase mt-1">Auto Recalculating</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-150 flex flex-col justify-between col-span-2 sm:col-span-1">
          <span className="text-[9px] text-zinc-400 font-black uppercase tracking-widest">System Approval Status</span>
          <span className="text-xs font-bold text-emerald-600 mt-2 flex items-center gap-1.5 uppercase">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
            Auto Approved
          </span>
          <span className="text-[8px] text-zinc-400 font-bold uppercase mt-1">Manual Approval Removed</span>
        </div>
      </div>

      {/* FILTERS & SEARCH */}
      <div className="bg-white p-3 rounded-xl border border-zinc-150 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-400" />
          <input 
            type="text"
            placeholder="Search reviews by customer name or product keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-zinc-150 rounded-xl text-xs font-semibold placeholder-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-950/20 text-zinc-900"
          />
        </div>

        <div className="w-full sm:w-auto">
          <select 
            value={filterRating} 
            onChange={(e) => setFilterRating(e.target.value)}
            className="w-full bg-white border border-zinc-150 px-4 py-3 text-xs font-bold text-zinc-700 rounded-xl focus:outline-none focus:border-zinc-950"
          >
            <option value="All">All Star Ratings</option>
            <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
            <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
            <option value="3">⭐⭐⭐ (3 Stars)</option>
            <option value="2">⭐⭐ (2 Stars)</option>
            <option value="1">⭐ (1 Star)</option>
          </select>
        </div>
      </div>

      {/* COMPACT INTERACTIVE ACCORDION LIST */}
      <div className="space-y-3">
        {filteredReviews.length === 0 ? (
          <div className="bg-white py-12 px-4 rounded-2xl border border-zinc-150 text-center text-zinc-400 space-y-2">
            <p className="font-bold text-xs uppercase tracking-wider text-zinc-500">No matching storefront feedback found</p>
            <p className="text-[10px] text-zinc-400">Add a manually simulated review using the button above.</p>
          </div>
        ) : (
          filteredReviews.map(rev => {
            const isExpanded = !!expandedReviews[rev.reviewId];
            const product = products.find(p => p.id === rev.productId);
            
            // Filter images and videos
            const imageUrls = rev.mediaUrls?.filter(url => !isVideoUrl(url)) || [];
            const videoUrls = rev.mediaUrls?.filter(url => isVideoUrl(url)) || [];

            return (
              <div 
                key={rev.reviewId}
                id={`card-${rev.reviewId}`}
                className="bg-white rounded-xl border border-zinc-150 overflow-hidden shadow-sm hover:shadow transition-shadow flex flex-col"
              >
                {/* COMPACT CARD WRAPPER - Header / Click to expand */}
                <div 
                  onClick={() => toggleExpand(rev.reviewId)}
                  className="px-4 py-3.5 flex items-center justify-between cursor-pointer hover:bg-zinc-50/50 transition-colors select-none"
                >
                  <div className="space-y-1">
                    {/* CUSTOMER NAME */}
                    <h4 className="text-sm font-black text-zinc-900 tracking-tight flex items-center gap-1.5">
                      {rev.customerName}
                    </h4>
                    
                    {/* STAR RATING */}
                    <div className="flex gap-0.5 text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-500 text-amber-500' : 'text-zinc-200'}`} 
                        />
                      ))}
                    </div>
                  </div>

                  {/* SIMPLIFIED REVIEW STATUS (Only show rating numeric + Live badge) */}
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black uppercase text-zinc-400 tracking-wider">
                      ★ {rev.rating}/5
                    </span>
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200/50 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live Review
                    </span>
                  </div>
                </div>

                {/* DROPDOWN EXPANDABLE SUBSECTION */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden border-t border-zinc-105 bg-zinc-50/50"
                    >
                      <div className="p-4 space-y-5 text-zinc-800">
                        {/* 1️⃣ CUSTOMER FULL NAME */}
                        <div className="space-y-1">
                          <span className="text-[9px] text-zinc-400 font-extrabold uppercase tracking-widest block">1️⃣ Customer Full Name</span>
                          <p className="text-sm font-black text-zinc-950 flex items-center gap-2">
                            {rev.customerName} 
                            {rev.anonymous && (
                              <span className="text-[8px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded font-black uppercase">
                                Posted Anonymously on Website
                              </span>
                            )}
                          </p>
                        </div>

                        {/* 2️⃣ STAR RATING */}
                        <div className="space-y-1">
                          <span className="text-[9px] text-zinc-400 font-extrabold uppercase tracking-widest block">2️⃣ Star Rating</span>
                          <div className="flex items-center gap-1">
                            <div className="flex text-amber-500">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className={`w-4 h-4 ${i < rev.rating ? 'fill-amber-500 text-amber-500' : 'text-zinc-200'}`} />
                              ))}
                            </div>
                            <span className="text-xs font-bold text-zinc-700">({rev.rating} out of 5 stars)</span>
                          </div>
                        </div>

                        {/* 3️⃣ REVIEW DESCRIPTION */}
                        <div className="space-y-1">
                          <span className="text-[9px] text-zinc-400 font-extrabold uppercase tracking-widest block">3️⃣ Review Description</span>
                          <p className="text-xs font-semibold text-zinc-800 bg-white p-3 rounded-lg border border-zinc-155 italic leading-relaxed select-text shadow-sm">
                            "{rev.reviewText}"
                          </p>
                        </div>

                        {/* 4️⃣ REVIEW IMAGES (if uploaded) */}
                        <div className="space-y-1">
                          <span className="text-[9px] text-zinc-400 font-extrabold uppercase tracking-widest block font-sans">4️⃣ Customer Images</span>
                          {imageUrls.length > 0 ? (
                            <div className="bg-white p-2 border border-zinc-150 rounded-lg shadow-inner">
                              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                {imageUrls.map((url, i) => (
                                  <a 
                                    key={i} 
                                    href={url} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="aspect-square bg-zinc-100 rounded overflow-hidden border border-zinc-150 relative group block"
                                  >
                                    <img 
                                      src={url} 
                                      alt="review item Attachment" 
                                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                      referrerPolicy="no-referrer"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/35 flex items-center justify-center transition-colors">
                                      <ExternalLink className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                  </a>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <p className="text-[9px] text-zinc-400 font-black tracking-widest bg-zinc-100/70 p-3 rounded-lg border border-dashed border-zinc-200 block">
                              NO CUSTOMER IMAGE PROVIDED
                            </p>
                          )}
                        </div>

                        {/* 5️⃣ REVIEW VIDEOS (if uploaded) */}
                        <div className="space-y-1">
                          <span className="text-[9px] text-zinc-400 font-extrabold uppercase tracking-widest block">5️⃣ Review Videos</span>
                          {videoUrls.length > 0 ? (
                            <div className="bg-white p-3 border border-zinc-150 rounded-lg shadow-inner space-y-1.5 flex flex-col items-center">
                              {videoUrls.map((url, i) => (
                                <div key={i} className="w-full max-w-sm bg-zinc-950 rounded-lg overflow-hidden border border-zinc-800">
                                  <video 
                                    src={url} 
                                    controls 
                                    playsInline 
                                    className="w-full h-auto aspect-video outline-none" 
                                  />
                                  <div className="p-2 bg-zinc-900 border-t border-zinc-850 flex items-center gap-1.5 text-zinc-400 text-[10px] font-bold">
                                    <Video className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                                    PLAYABLE ITEM MP4 CLIP
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[9px] text-zinc-400 font-black tracking-widest bg-zinc-100/70 p-3 rounded-lg border border-dashed border-zinc-200 block">
                              NO VIDEO ATTACHED
                            </p>
                          )}
                        </div>

                        {/* 6️⃣ PRODUCT TARGETED */}
                        <div className="space-y-1">
                          <span className="text-[9px] text-zinc-400 font-extrabold uppercase tracking-widest block">6️⃣ Product Targeted</span>
                          <div className="bg-white p-3 rounded-lg border border-zinc-150 flex items-center gap-3 shadow-inner">
                            {product?.image && (
                              <img src={product.image} alt={product.name} className="w-10 h-10 object-cover border border-zinc-100 rounded" />
                            )}
                            <div>
                              <p className="text-xs font-black text-zinc-950 uppercase">{product?.name || `ID: ${rev.productId}`}</p>
                              <span className="text-[9px] text-zinc-400 font-bold uppercase block mt-0.5">
                                SKU: <span className="font-mono text-zinc-600">{product?.sku || 'N/A'}</span> | Category: {product?.category || 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* 7️⃣ REVIEW TIME & DATE */}
                        <div className="space-y-1">
                          <span className="text-[9px] text-zinc-400 font-extrabold uppercase tracking-widest block">7️⃣ Submitted Date & Time</span>
                          <p className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-zinc-400" />
                            {new Date(rev.createdAt).toLocaleString(undefined, { 
                              dateStyle: 'medium', 
                              timeStyle: 'short' 
                            })}
                          </p>
                        </div>

                        {/* 8️⃣ VERIFIED PURCHASE BADGE */}
                        <div className="space-y-1">
                          <span className="text-[9px] text-zinc-400 font-extrabold uppercase tracking-widest block">8️⃣ Verified Purchase Status</span>
                          <div>
                            {rev.verified ? (
                              <span className="inline-flex items-center gap-1 backdrop-blur-sm bg-emerald-50 text-emerald-700 border border-emerald-200/50 text-[9.5px] font-black uppercase tracking-wider px-3 py-1 rounded">
                                <CheckCircle className="w-3.5 h-3.5" /> Verified Purchase Badge Active
                              </span>
                            ) : (
                              <p className="text-[9px] text-zinc-400 font-black tracking-widest bg-zinc-100/70 p-3 rounded-lg border border-dashed border-zinc-200 block">
                                NO VERIFIED PURCHASE INFO
                              </p>
                            )}
                          </div>
                        </div>

                        {/* OPTIONAL MANUFACTURER OFFICIAL REPLY */}
                        <div className="bg-white p-4 rounded-xl border border-zinc-200 space-y-3.5 mt-2">
                          <div className="flex items-center gap-1 text-[8.5px] text-zinc-500 font-extrabold tracking-widest uppercase border-b border-zinc-100 pb-2">
                             <span className="w-4 h-4 bg-purple-600 text-white font-serif rounded-full flex items-center justify-center text-[8px] font-black shrink-0">T</span>
                             <span>TAZU MART BD Official Response</span>
                             <span className="text-[7.5px] bg-purple-950 text-purple-300 px-1.5 py-0.2 rounded font-black uppercase ml-auto">Interactive Reply</span>
                          </div>

                          {rev.adminReply ? (
                            <p className="text-xs text-zinc-700 font-bold bg-zinc-50 p-3 rounded-lg border border-dashed border-zinc-200 leading-relaxed">
                              "{rev.adminReply}"
                            </p>
                          ) : (
                            <p className="text-[10px] text-zinc-400 font-bold italic">No official manufacturers response appended to this buyer review yet.</p>
                          )}

                          <form onSubmit={(e) => handleReplySubmit(e, rev.reviewId)} className="flex items-center gap-2 pt-1">
                            <input 
                              type="text" 
                              placeholder="Type official storefront response here..."
                              value={replyInputs[rev.reviewId] || ''}
                              onChange={(e) => handleReplyChange(rev.reviewId, e.target.value)}
                              className="flex-1 px-3 py-2 text-xs border border-zinc-200 rounded-lg text-zinc-900 focus:outline-none focus:border-zinc-950 font-semibold"
                            />
                            <button 
                              type="submit"
                              className="px-3 py-2 bg-zinc-950/90 text-white text-[9.5px] font-black uppercase tracking-wider hover:bg-zinc-900 rounded-lg whitespace-nowrap"
                            >
                              Send Response
                            </button>
                          </form>
                        </div>

                        {/* DELETE SYSTEM & FUNCTIONALITY */}
                        <div className="pt-4 border-t border-zinc-150 flex justify-end">
                          <button 
                            onClick={() => {
                              if (window.confirm(`Are you holding absolute and complete intent to permanently delete this customer review from ${rev.customerName}?`)) {
                                deleteReview(rev.reviewId);
                              }
                            }}
                            className="flex items-center justify-center gap-2 bg-red-50 text-red-700 hover:bg-red-100/80 active:bg-red-100 border border-red-200/60 hover:border-red-300 font-black text-[10px] uppercase tracking-wider py-3 px-6 rounded-xl transition-all shadow-sm focus:outline-none w-full sm:w-auto"
                          >
                            <Trash2 className="w-4 h-4 text-red-650" />
                            Delete Review
                          </button>
                        </div>

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            );
          })
        )}
      </div>

      {/* ADD REVIEW FORM DIALOG MODAL */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 bg-black/65 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="bg-white w-full max-w-xl border border-zinc-200 shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-[#000000]">➖ Add Customer Feedback</h3>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase mt-1">New submissions are automatically approved & live</p>
                </div>
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-10 h-10 hover:bg-zinc-100 text-zinc-500 flex items-center justify-center rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddNewReview} className="p-6 overflow-y-auto space-y-5">
                
                {/* Product Select Field */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block">Choose Targeted Product *</label>
                  <select 
                    value={formProductId}
                    onChange={(e) => setFormProductId(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-800 focus:outline-none"
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>({p.category}) {p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Customer Name */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block">Customer Name *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Rakib Hasan"
                      value={formCustomerName}
                      onChange={(e) => setFormCustomerName(e.target.value)}
                      className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder-zinc-300 focus:outline-none font-semibold"
                    />
                  </div>

                  {/* Rating Stars Selection */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block">Star Rating Value (1-5) *</label>
                    <select 
                      value={formRating}
                      onChange={(e) => setFormRating(parseInt(e.target.value))}
                      className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-xs font-bold text-amber-500 focus:outline-none"
                    >
                      <option value="5">⭐⭐⭐⭐⭐ (5 Star)</option>
                      <option value="4">⭐⭐⭐⭐ (4 Star)</option>
                      <option value="3">⭐⭐⭐ (3 Star)</option>
                      <option value="2">⭐⭐ (2 Star)</option>
                      <option value="1">⭐ (1 Star)</option>
                    </select>
                  </div>

                </div>

                {/* Review Message Content */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block">Review Text Message *</label>
                  <textarea 
                    rows={4}
                    required
                    placeholder="Type review text observations..."
                    value={formReviewText}
                    onChange={(e) => setFormReviewText(e.target.value)}
                    className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder-zinc-300 focus:outline-none font-bold"
                  />
                </div>

                {/* Media Image attachments */}
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <label className="text-[10px] font-black text-zinc-950 uppercase tracking-widest flex items-center gap-1.5">
                      <span>🖼 REVIEWED PRODUCT IMAGE</span>
                    </label>
                    <span className="text-[8px] text-zinc-400 font-bold uppercase tracking-wider">Max 5 Photos</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 font-semibold leading-none">
                    Upload product photos related to your review
                  </p>
                  <span className="text-[10px] text-zinc-400 font-bold block leading-none italic text-zinc-500">
                    “রিভিউকৃত প্রোডাক্টের ছবি আপলোড করুন”
                  </span>

                  <div className="mt-2">
                    <label className="flex flex-col items-center justify-center border border-dashed border-zinc-300 bg-white hover:bg-zinc-50/50 hover:border-zinc-400 transition-all cursor-pointer rounded-xl p-5 text-center h-36">
                      <input 
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        onChange={handleFormImageUploadChange}
                        className="hidden"
                        disabled={formMediaUrls.length >= 5}
                      />
                      <span className="w-8 h-8 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-800 border border-zinc-200/50 shadow-sm mb-1.5">
                        <Plus className="w-4 h-4 text-zinc-950" />
                      </span>
                      <p className="text-xs font-black text-zinc-950 uppercase tracking-wide">Tap to upload product images</p>
                      <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Supported formats: JPG, PNG, WEBP (Max 5)</p>
                    </label>
                  </div>

                  {formMediaUrls.length > 0 && (
                    <div className="flex items-center gap-2 overflow-x-auto py-2 px-1 scrollbar-thin">
                      {formMediaUrls.map((url, i) => (
                        <div key={i} className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden border border-zinc-200 bg-white shadow-sm flex items-center justify-center">
                          <img src={url} alt="attached customer review file" className="w-full h-full object-cover" />
                          <button 
                            type="button"
                            onClick={() => handleFormRemoveMedia(i)}
                            className="absolute top-1 right-1 bg-black/75 hover:bg-black text-white p-1 rounded-full transition-colors focus:outline-none"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Video URL optional */}
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <label className="text-[10px] font-black text-zinc-950 uppercase tracking-widest flex items-center gap-1.5">
                      <span>🎥 REVIEW PRODUCT VIDEO</span>
                    </label>
                    <span className="text-[8px] text-zinc-400 font-bold uppercase tracking-wider">Max 1 Video</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 font-semibold leading-none">
                    Upload a short review video of the product
                  </p>
                  <span className="text-[10px] text-zinc-400 font-bold block leading-none italic text-zinc-500">
                    “রিভিউকৃত প্রোডাক্টের ভিডিও আপলোড করুন”
                  </span>

                  <div className="mt-2">
                    <label className="flex flex-col items-center justify-center border border-dashed border-zinc-300 bg-white hover:bg-zinc-50/50 hover:border-zinc-400 transition-all cursor-pointer rounded-xl p-5 text-center h-36">
                      <input 
                        type="file"
                        accept="video/mp4,video/quicktime,video/webm"
                        onChange={handleFormVideoUploadChange}
                        className="hidden"
                        disabled={!!formVideoUrl}
                      />
                      <span className="w-8 h-8 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-800 border border-zinc-200/50 shadow-sm mb-1.5">
                        <Plus className="w-4 h-4 text-zinc-950" />
                      </span>
                      <p className="text-xs font-black text-zinc-950 uppercase tracking-wide">Tap to upload review video</p>
                      <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Supported formats: MP4, MOV, WEBM (Max 1)</p>
                    </label>
                  </div>

                  {formVideoUrl && (
                    <div className="flex flex-col items-center justify-center bg-zinc-50 border border-zinc-200 rounded-xl p-3 mt-2">
                      <div className="relative w-full max-w-[150px] aspect-[9/16] bg-zinc-950 rounded-xl overflow-hidden shadow-lg border border-zinc-800">
                        <video 
                          src={formVideoUrl} 
                          controls 
                          playsInline 
                          className="w-full h-full object-cover" 
                        />
                        <button 
                          type="button" 
                          onClick={handleFormRemoveVideo}
                          className="absolute top-1.5 right-1.5 bg-black/75 hover:bg-black text-white p-1 rounded-full z-10 transition-colors focus:outline-none"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/15">
                          <div className="w-8 h-8 rounded-full bg-white/25 backdrop-blur-sm border border-white/50 flex items-center justify-center text-white">
                            <Play className="w-3.5 h-3.5 fill-white text-white ml-0.5" />
                          </div>
                        </div>
                        <div className="absolute bottom-1.5 left-1.5 z-10 bg-black/60 backdrop-blur-sm text-[7px] font-black uppercase text-amber-400 px-1 py-0.2 rounded">
                          9:16 Preview
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Verified Toggle + Anonymous Toggle */}
                <div className="flex items-center justify-between gap-4 pt-2 border-t border-zinc-100">
                  <label className="flex items-center gap-2 text-xs font-bold text-zinc-700 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formVerified}
                      onChange={(e) => setFormVerified(e.target.checked)}
                      className="w-4 h-4 accent-zinc-950 rounded"
                    />
                    <span>Verified Purchase badge</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-bold text-zinc-700 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formAnonymous}
                      onChange={(e) => setFormAnonymous(e.target.checked)}
                      className="w-4 h-4 accent-zinc-950 rounded"
                    />
                    <span>Hide name (Anonymous)</span>
                  </label>
                </div>

                <div className="border-t border-zinc-100 pt-4 flex justify-end gap-2.5">
                  <button 
                    type="button" 
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-5 py-3 border border-zinc-200 text-zinc-700 rounded-xl text-xs font-bold uppercase hover:bg-zinc-50"
                  >
                    Discard Form
                  </button>
                  <button 
                    type="submit" 
                    className="px-6 py-3 bg-zinc-950 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-zinc-800"
                  >
                    Publish Instantly
                  </button>
                </div>

              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
