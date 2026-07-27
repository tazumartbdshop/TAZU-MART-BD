import React, { useState } from 'react';
import { 
  Star, Trash2, Plus, Search, Filter, X, Check, CheckCircle, 
  Video, Calendar, ExternalLink, ShieldAlert, ShieldCheck, Tag, Reply, Clock, Play,
  Edit, Eye, EyeOff, AlertTriangle, AlertCircle
} from 'lucide-react';
import { useReviewStore, ProductReview } from '../../store/useReviewStore';
import { useProductStore } from '../../store/useProductStore';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

export default function AdminReviews() {
  const { 
    reviews, 
    addReview, 
    updateReview,
    deleteReview, 
    replyToReview,
    fetchReviews,
    isLoading
  } = useReviewStore();

  const { products } = useProductStore();

  React.useEffect(() => {
    fetchReviews();
  }, []);

  // Modal controls for adding/editing reviews
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  
  // Reply text state per-review
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});

  // Deletion confirmation modal state
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);

  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRating, setFilterRating] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  // Form States for creating/editing reviews
  const [formCustomerName, setFormCustomerName] = useState('');
  const [formProductId, setFormProductId] = useState('');
  const [formRating, setFormRating] = useState(5);
  const [formReviewTitle, setFormReviewTitle] = useState('');
  const [formReviewText, setFormReviewText] = useState('');
  const [formMediaUrls, setFormMediaUrls] = useState<string[]>([]);
  const [formVideoUrl, setFormVideoUrl] = useState('');
  const [formVerified, setFormVerified] = useState(true);
  const [formAnonymous, setFormAnonymous] = useState(false);
  const [formStatus, setFormStatus] = useState<'pending' | 'approved' | 'hidden' | 'rejected'>('approved');

  // Compute live statistics for summary
  const totalCount = reviews.length;
  const ratingSum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
  const avgRating = totalCount > 0 ? Number((ratingSum / totalCount).toFixed(1)) : 0;

  const publishedCount = reviews.filter(r => r.status === 'approved').length;
  const pendingCount = reviews.filter(r => r.status === 'pending').length;
  const hiddenCount = reviews.filter(r => r.status === 'hidden' || r.status === 'rejected').length;

  // Helper to parse review text splitter
  const parseReviewText = (text: string) => {
    if (!text) return { title: '', description: '' };
    const parts = text.split('|||');
    if (parts.length > 1) {
      return { title: parts[0].trim(), description: parts[1].trim() };
    }
    return { title: '', description: text };
  };

  // Filter implementation
  const filteredReviews = reviews.filter(rev => {
    const product = products.find(p => p.id === rev.productId);
    const productName = product ? product.name.toLowerCase() : '';
    const nameMatch = rev.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || productName.includes(searchQuery.toLowerCase());
    
    const ratingMatch = filterRating === 'All' || rev.rating === parseInt(filterRating);

    let statusMatch = true;
    if (filterStatus !== 'All') {
      if (filterStatus === 'Published') {
        statusMatch = rev.status === 'approved';
      } else if (filterStatus === 'Pending') {
        statusMatch = rev.status === 'pending';
      } else if (filterStatus === 'Hidden') {
        statusMatch = rev.status === 'hidden' || rev.status === 'rejected';
      }
    }

    return nameMatch && ratingMatch && statusMatch;
  });

  // Handle image upload states inside form
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

  // Open Edit Form prefilled with existing review data
  const handleEditClick = (rev: ProductReview) => {
    setEditingReviewId(rev.reviewId);
    setFormCustomerName(rev.customerName);
    setFormProductId(rev.productId);
    setFormRating(rev.rating);
    
    const { title, description } = parseReviewText(rev.reviewText);
    setFormReviewTitle(title);
    setFormReviewText(description);

    const imageUrls = rev.mediaUrls?.filter(url => !isVideoUrl(url)) || [];
    const videoUrl = rev.mediaUrls?.find(url => isVideoUrl(url)) || '';

    setFormMediaUrls(imageUrls);
    setFormVideoUrl(videoUrl);
    setFormVerified(rev.verified);
    setFormAnonymous(!!rev.anonymous);
    setFormStatus(rev.status || 'approved');
    
    setIsAddModalOpen(true);
  };

  // Clear states and open Add Form
  const handleAddClick = () => {
    setEditingReviewId(null);
    setFormCustomerName('');
    setFormProductId(products[0]?.id || '');
    setFormRating(5);
    setFormReviewTitle('');
    setFormReviewText('');
    setFormMediaUrls([]);
    setFormVideoUrl('');
    setFormVerified(true);
    setFormAnonymous(false);
    setFormStatus('approved');
    setIsAddModalOpen(true);
  };

  // Form Submission for Create & Edit Updates
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCustomerName.trim() || !formReviewText.trim()) {
      toast.error('Name and Description are required.');
      return;
    }

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

    const combinedText = formReviewTitle.trim() 
      ? `${formReviewTitle.trim()} ||| ${formReviewText.trim()}`
      : formReviewText.trim();

    try {
      if (editingReviewId) {
        // Edit mode
        await updateReview(editingReviewId, {
          customerName: formCustomerName.trim(),
          rating: formRating,
          reviewText: combinedText,
          mediaUrls: finalMedia,
          verified: formVerified,
          anonymous: formAnonymous,
          status: formStatus
        });
        toast.success('Review updated successfully.');
      } else {
        // Create mode
        await addReview({
          productId: formProductId,
          customerId: `cust-manual-${Date.now()}`,
          customerName: formCustomerName.trim(),
          rating: formRating,
          reviewText: combinedText,
          mediaUrls: finalMedia,
          verified: formVerified,
          isPinned: false,
          anonymous: formAnonymous,
          phone: '+880 1700-000000',
          email: `${formCustomerName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
          orderId: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
          deviceIP: '127.0.0.1',
          status: formStatus
        });
        toast.success('Review added successfully.');
      }
    } catch (err: any) {
      console.error("[Review Form Submission Flow Error]:", err);
      toast.error(err.message || 'Error occurred while saving review.');
    }

    // Reset states
    setIsAddModalOpen(false);
    setEditingReviewId(null);
  };

  // Direct Inline Status Dropdown handler
  const handleStatusChange = async (reviewId: string, newStatus: 'pending' | 'approved' | 'hidden' | 'rejected') => {
    await updateReview(reviewId, { status: newStatus });
    toast.success('Status updated successfully.');
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

  // Deletion logic
  const triggerDelete = (reviewId: string) => {
    setDeletingReviewId(reviewId);
  };

  const handleConfirmDelete = async () => {
    if (!deletingReviewId) return;
    await deleteReview(deletingReviewId);
    setDeletingReviewId(null);
  };

  // Helper detection for standard video format
  const isVideoUrl = (url: string) => {
    return url.toLowerCase().endsWith('.mp4') || url.toLowerCase().includes('video');
  };

  return (
    <div className="space-y-6 font-sans px-2 sm:px-4 max-w-5xl mx-auto pb-10">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-zinc-200/60 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-zinc-950 uppercase tracking-tight">Review Center</h2>
          <p className="text-xs text-zinc-500 font-bold mt-1 uppercase tracking-wider">
            Mobile-First Ecommerce Feedback Management System
          </p>
        </div>
        
        <button 
          onClick={handleAddClick}
          className="flex items-center gap-2 bg-zinc-950 text-white hover:bg-zinc-800 px-5 py-3 text-xs font-black uppercase tracking-widest transition-all rounded-xl shadow-md w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4 text-emerald-400" />
          Add Store Review
        </button>
      </div>

      {/* COMPACT STATISTICS OVERVIEW */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-zinc-200 flex flex-col justify-between shadow-sm">
          <span className="text-[9px] text-zinc-400 font-black uppercase tracking-widest">Total Reviews</span>
          <span className="text-2xl font-black text-zinc-950 mt-1">{totalCount}</span>
          <span className="text-[8px] text-zinc-400 font-semibold mt-1">Direct Database Entries</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200 flex flex-col justify-between shadow-sm">
          <span className="text-[9px] text-zinc-400 font-black uppercase tracking-widest">Published Loop</span>
          <span className="text-2xl font-black text-emerald-600 mt-1">{publishedCount}</span>
          <span className="text-[8px] text-emerald-600 font-extrabold uppercase mt-1">🟢 Live on Feed</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200 flex flex-col justify-between shadow-sm">
          <span className="text-[9px] text-zinc-400 font-black uppercase tracking-widest">Pending Audit</span>
          <span className="text-2xl font-black text-amber-500 mt-1">{pendingCount}</span>
          <span className="text-[8px] text-amber-600 font-extrabold uppercase mt-1">🟡 Awaiting Action</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200 flex flex-col justify-between shadow-sm">
          <span className="text-[9px] text-zinc-400 font-black uppercase tracking-widest">Average Score</span>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-2xl font-black text-zinc-950">{avgRating}</span>
            <div className="flex text-amber-500">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            </div>
          </div>
          <span className="text-[8px] text-indigo-600 font-extrabold uppercase mt-1">Auto Recalculating</span>
        </div>
      </div>

      {/* FILTERS & SEARCH */}
      <div className="bg-white p-3.5 rounded-xl border border-zinc-200 flex flex-col md:flex-row items-center gap-3 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-400" />
          <input 
            type="text"
            placeholder="Search reviews by customer name or product keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-zinc-200 rounded-xl text-xs font-semibold placeholder-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-950/20 text-zinc-900"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select 
            value={filterRating} 
            onChange={(e) => setFilterRating(e.target.value)}
            className="flex-1 md:flex-none bg-white border border-zinc-200 px-3.5 py-3 text-xs font-bold text-zinc-700 rounded-xl focus:outline-none focus:border-zinc-950"
          >
            <option value="All">All Stars</option>
            <option value="5">⭐⭐⭐⭐⭐</option>
            <option value="4">⭐⭐⭐⭐</option>
            <option value="3">⭐⭐⭐</option>
            <option value="2">⭐⭐</option>
            <option value="1">⭐</option>
          </select>

          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="flex-1 md:flex-none bg-white border border-zinc-200 px-3.5 py-3 text-xs font-bold text-zinc-700 rounded-xl focus:outline-none focus:border-zinc-950"
          >
            <option value="All">All Statuses</option>
            <option value="Published">🟢 Published</option>
            <option value="Pending">🟡 Pending</option>
            <option value="Hidden">⚪ Hidden / Rejected</option>
          </select>
        </div>
      </div>

      {/* ADMIN REVIEW listing (Card Design) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredReviews.length === 0 ? (
          <div className="col-span-full bg-white py-16 px-4 rounded-2xl border border-zinc-200 text-center text-zinc-400 space-y-2">
            <p className="font-bold text-xs uppercase tracking-wider text-zinc-500">No customer feedback matches filters</p>
            <p className="text-[10px] text-zinc-400">Add a manually simulated review using the button above.</p>
          </div>
        ) : (
          filteredReviews.map(rev => {
            const product = products.find(p => p.id === rev.productId);
            
            // Filter images and videos
            const imageUrls = rev.mediaUrls?.filter(url => !isVideoUrl(url)) || [];
            const videoUrls = rev.mediaUrls?.filter(url => isVideoUrl(url)) || [];

            const { title, description } = parseReviewText(rev.reviewText);
            const displayName = rev.customerName;
            const initials = displayName ? displayName.substring(0, 2).toUpperCase() : 'AC';

            return (
              <div 
                key={rev.reviewId}
                className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-5 relative overflow-hidden"
              >
                
                {/* Header Info */}
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-center gap-2.5">
                    {/* Customer Avatar Circle */}
                    <div className="w-10 h-10 bg-zinc-950 border border-zinc-900 text-white rounded-full flex items-center justify-center text-xs font-black tracking-widest shrink-0 shadow-inner">
                      {initials}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-zinc-950 flex items-center gap-1">
                        {displayName}
                        {rev.anonymous && (
                          <span className="text-[7px] bg-amber-50 text-amber-700 border border-amber-200/50 px-1 rounded uppercase font-bold">Anon</span>
                        )}
                      </h4>
                      <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-zinc-300" />
                        {new Date(rev.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  {/* Top Status Indicators */}
                  <div>
                    {rev.verified && (
                      <span className="inline-flex items-center gap-0.5 text-[7.5px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded uppercase">
                        Verified
                      </span>
                    )}
                  </div>
                </div>

                {/* TARGETED PRODUCT INFO */}
                <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-150 flex items-center gap-2.5 shadow-inner">
                  {product?.image && (
                    <img src={product.image} alt={product.name} className="w-9 h-9 object-cover border border-zinc-200 rounded" />
                  )}
                  <div className="min-w-0">
                    <p className="text-[10px] font-black text-zinc-950 uppercase truncate">{product?.name || `ID: ${rev.productId}`}</p>
                    <span className="text-[8px] text-zinc-400 font-bold uppercase tracking-wider block mt-0.5">
                      SKU: <span className="font-mono text-zinc-600">{product?.sku || 'N/A'}</span>
                    </span>
                  </div>
                </div>

                {/* Star Rating Row */}
                <div className="flex gap-0.5 text-amber-500 pl-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < rev.rating ? 'fill-amber-500 text-amber-500' : 'text-zinc-200'}`} 
                    />
                  ))}
                </div>

                {/* Content Box */}
                <div className="space-y-1.5 pl-0.5 flex-1">
                  {title && (
                    <h5 className="text-xs font-black text-zinc-950 leading-tight">
                      {title}
                    </h5>
                  )}
                  <p className="text-[11px] font-semibold text-zinc-700 leading-relaxed italic whitespace-pre-wrap select-text">
                    "{description}"
                  </p>
                </div>

                {/* Images Preview Section */}
                {imageUrls.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 p-1 bg-zinc-50/50 rounded-lg border border-zinc-150 max-h-24 overflow-y-auto">
                    {imageUrls.map((url, i) => (
                      <a 
                        key={i} 
                        href={url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="w-12 h-12 rounded overflow-hidden border border-zinc-200 shrink-0 relative block"
                      >
                        <img 
                          src={url} 
                          alt="review item Attachment" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </a>
                    ))}
                  </div>
                )}

                {/* Video Preview if exists */}
                {videoUrls.length > 0 && (
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-zinc-50 border border-zinc-200 rounded-lg text-[9px] font-bold text-zinc-600">
                    <Video className="w-3.5 h-3.5 text-red-500" />
                    <span>Customer Review Clip attached (MP4)</span>
                  </div>
                )}

                {/* MANUFACTURER REPLY SUBSECTION */}
                <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-150 space-y-2 mt-1">
                  <div className="flex items-center gap-1 text-[8px] text-zinc-500 font-extrabold tracking-widest uppercase border-b border-zinc-200 pb-1">
                     <span className="w-3.5 h-3.5 bg-purple-600 text-white font-serif rounded-full flex items-center justify-center text-[7px] font-black shrink-0">T</span>
                     <span>TAZU MART Reply</span>
                  </div>

                  {rev.adminReply ? (
                    <p className="text-[10px] text-zinc-700 font-semibold italic bg-white p-2 rounded border border-zinc-150 leading-relaxed">
                      "{rev.adminReply}"
                    </p>
                  ) : (
                    <p className="text-[8.5px] text-zinc-400 font-bold italic">No manufacturer reply posted yet.</p>
                  )}

                  <form onSubmit={(e) => handleReplySubmit(e, rev.reviewId)} className="flex items-center gap-1.5 pt-0.5">
                    <input 
                      type="text" 
                      placeholder="Type reply here..."
                      value={replyInputs[rev.reviewId] || ''}
                      onChange={(e) => handleReplyChange(rev.reviewId, e.target.value)}
                      className="flex-1 px-2.5 py-1.5 text-[10px] border border-zinc-250 bg-white rounded-lg text-zinc-900 focus:outline-none focus:border-zinc-950 font-semibold"
                    />
                    <button 
                      type="submit"
                      className="px-2.5 py-1.5 bg-zinc-950/95 text-white text-[8px] font-black uppercase tracking-wider hover:bg-zinc-900 rounded-lg whitespace-nowrap"
                    >
                      Reply
                    </button>
                  </form>
                </div>

                {/* THREE ACTION BUTTONS */}
                <div className="grid grid-cols-3 gap-2 border-t border-zinc-100 pt-3.5">
                  
                  {/* EDIT BUTTON */}
                  <button
                    onClick={() => handleEditClick(rev)}
                    className="flex items-center justify-center gap-1 border border-zinc-250 hover:bg-zinc-50 text-zinc-700 text-[10px] font-bold uppercase tracking-wider py-2 rounded-xl transition-all"
                  >
                    <Edit className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Edit</span>
                  </button>

                  {/* STATUS SELECT BOX (Custom Inline Selection) */}
                  <div className="relative">
                    <select
                      value={rev.status === 'approved' ? 'approved' : rev.status || 'approved'}
                      onChange={(e) => handleStatusChange(rev.reviewId, e.target.value as any)}
                      className={`w-full appearance-none px-2 py-2 text-center text-[10px] font-bold border rounded-xl transition-all focus:outline-none cursor-pointer h-full
                        ${(rev.status === 'approved' || !rev.status) ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : ''}
                        ${rev.status === 'hidden' ? 'bg-zinc-100 text-zinc-700 border-zinc-200 hover:bg-zinc-200' : ''}
                        ${rev.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' : ''}
                        ${rev.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' : ''}
                      `}
                    >
                      <option value="approved">Published</option>
                      <option value="hidden">Hidden</option>
                      <option value="pending">Pending</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  {/* DELETE BUTTON */}
                  <button
                    onClick={() => triggerDelete(rev.reviewId)}
                    className="flex items-center justify-center gap-1 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 hover:border-red-350 text-[10px] font-bold uppercase tracking-wider py-2 rounded-xl transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-650" />
                    <span>Delete</span>
                  </button>

                </div>

              </div>
            );
          })
        )}
      </div>

      {/* ADD / EDIT REVIEW FORM DIALOG MODAL */}
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
                  <h3 className="text-sm font-black uppercase tracking-widest text-zinc-950">
                    {editingReviewId ? '📝 Edit Customer Feedback' : '➖ Add Customer Feedback'}
                  </h3>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase mt-1">
                    {editingReviewId ? 'Modify review content and stats on store' : 'New submissions are automatically live'}
                  </p>
                </div>
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-10 h-10 hover:bg-zinc-100 text-zinc-500 flex items-center justify-center rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto space-y-5">
                
                {/* Product Select Field */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block">Choose Targeted Product *</label>
                  <select 
                    value={formProductId}
                    onChange={(e) => setFormProductId(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-800 focus:outline-none"
                  >
                    <option value="" disabled>Select targeted product...</option>
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

                {/* Status Selection (Published, Hidden, Pending) */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block">Review Status *</label>
                  <select 
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-xs font-bold text-zinc-700 focus:outline-none"
                  >
                    <option value="approved">🟢 Published (Live on Website Feed)</option>
                    <option value="hidden">⚪ Hidden (Admin view only)</option>
                    <option value="pending">🟡 Pending (Awaiting confirmation)</option>
                    <option value="rejected">🔴 Rejected (Disallowed feedback)</option>
                  </select>
                </div>

                {/* Review Title */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block">Review Title *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Premium Quality Product, Highly recommended"
                    value={formReviewTitle}
                    onChange={(e) => setFormReviewTitle(e.target.value)}
                    className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder-zinc-350 focus:outline-none font-bold"
                  />
                </div>

                {/* Review Message Content */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block">Review Description *</label>
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

                  <div className="mt-2">
                    <label className="flex flex-col items-center justify-center border border-dashed border-zinc-300 bg-white hover:bg-zinc-50/50 hover:border-zinc-400 transition-all cursor-pointer rounded-xl p-5 text-center h-32">
                      <input 
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        onChange={handleFormImageUploadChange}
                        className="hidden"
                        disabled={formMediaUrls.length >= 5}
                      />
                      <p className="text-xs font-black text-zinc-950 uppercase tracking-wide">Tap to upload product images</p>
                      <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Supported formats: JPG, PNG, WEBP (Max 5)</p>
                    </label>
                  </div>

                  {formMediaUrls.length > 0 && (
                    <div className="flex items-center gap-2 overflow-x-auto py-2 px-1 scrollbar-thin">
                      {formMediaUrls.map((url, i) => (
                        <div key={i} className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden border border-zinc-200 bg-white shadow-sm flex items-center justify-center">
                          <img src={url} alt="attached file" className="w-full h-full object-cover" />
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

                  <div className="mt-2">
                    <label className="flex flex-col items-center justify-center border border-dashed border-zinc-300 bg-white hover:bg-zinc-50/50 hover:border-zinc-400 transition-all cursor-pointer rounded-xl p-5 text-center h-32">
                      <input 
                        type="file"
                        accept="video/mp4,video/quicktime,video/webm"
                        onChange={handleFormVideoUploadChange}
                        className="hidden"
                        disabled={!!formVideoUrl}
                      />
                      <p className="text-xs font-black text-zinc-950 uppercase tracking-wide">Tap to upload review video</p>
                      <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">MP4, MOV, WEBM (Max 1)</p>
                    </label>
                  </div>

                  {formVideoUrl && (
                    <div className="flex flex-col items-center justify-center bg-zinc-50 border border-zinc-200 rounded-xl p-3 mt-2">
                      <div className="relative w-full max-w-[130px] aspect-[9/16] bg-zinc-950 rounded-xl overflow-hidden shadow-lg border border-zinc-800">
                        <video src={formVideoUrl} controls playsInline className="w-full h-full object-cover" />
                        <button 
                          type="button" 
                          onClick={handleFormRemoveVideo}
                          className="absolute top-1 right-1 bg-black/75 hover:bg-black text-white p-1 rounded-full z-10 transition-colors focus:outline-none"
                        >
                          <X className="w-3 h-3" />
                        </button>
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
                    {editingReviewId ? 'Update Review' : 'Publish Instantly'}
                  </button>
                </div>

              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CUSTOM DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deletingReviewId && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full border border-zinc-200 shadow-2xl relative text-center"
            >
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black uppercase tracking-tight text-zinc-950 mb-2">Delete Review?</h3>
              <p className="text-xs text-zinc-500 font-bold leading-relaxed mb-6">
                Are you absolutely sure you want to permanently delete this customer review? This action cannot be undone.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDeletingReviewId(null)}
                  className="py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-black text-xs uppercase tracking-wider rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="py-3 bg-red-650 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-colors"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
