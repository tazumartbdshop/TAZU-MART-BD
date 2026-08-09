import React, { useState } from 'react';
import { 
  Star, Trash2, Plus, Search, Filter, X, Check, CheckCircle, 
  Video, Calendar, ExternalLink, ShieldAlert, ShieldCheck, Tag, Reply, Clock, Play,
  Edit, Eye, EyeOff, AlertTriangle, AlertCircle, RefreshCw
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

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [viewingReview, setViewingReview] = useState<ProductReview | null>(null);
  const [statusPopupReview, setStatusPopupReview] = useState<ProductReview | null>(null);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);

  // Reply text state per-review
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});

  // Filtering & Search & Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRating, setFilterRating] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

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

  // Status popup temporary state
  const [popupSelectedStatus, setPopupSelectedStatus] = useState<'pending' | 'approved' | 'hidden' | 'rejected'>('approved');

  // Compute live statistics
  const totalCount = reviews.length;
  const approvedReviewsList = reviews.filter(r => r.status === 'approved');
  const ratingSum = approvedReviewsList.reduce((acc, curr) => acc + curr.rating, 0);
  const avgRating = approvedReviewsList.length > 0 ? Number((ratingSum / approvedReviewsList.length).toFixed(1)) : 0;

  const publishedCount = reviews.filter(r => r.status === 'approved').length;
  const pendingCount = reviews.filter(r => r.status === 'pending').length;
  const disapprovedCount = reviews.filter(r => r.status === 'hidden' || r.status === 'rejected').length;

  // Helper to parse review text splitter
  const parseReviewText = (text: string) => {
    if (!text) return { title: '', description: '' };
    const parts = text.split('|||');
    if (parts.length > 1) {
      return { title: parts[0].trim(), description: parts[1].trim() };
    }
    return { title: '', description: text };
  };

  // Filter and Sort implementation
  const filteredReviews = reviews.filter(rev => {
    const product = products.find(p => p.id === rev.productId);
    const productName = product ? product.name.toLowerCase() : '';
    const nameMatch = rev.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || productName.includes(searchQuery.toLowerCase());
    
    const ratingMatch = filterRating === 'All' || rev.rating === parseInt(filterRating);

    let statusMatch = true;
    if (filterStatus !== 'All') {
      if (filterStatus === 'Approved') {
        statusMatch = rev.status === 'approved';
      } else if (filterStatus === 'Pending') {
        statusMatch = rev.status === 'pending';
      } else if (filterStatus === 'Disapproved') {
        statusMatch = rev.status === 'hidden' || rev.status === 'rejected';
      }
    }

    return nameMatch && ratingMatch && statusMatch;
  }).sort((a, b) => {
    const timeA = new Date(a.createdAt).getTime();
    const timeB = new Date(b.createdAt).getTime();
    return sortBy === 'newest' ? timeB - timeA : timeA - timeB;
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

    setIsAddModalOpen(false);
    setEditingReviewId(null);
  };

  // Status popup open
  const openStatusPopup = (rev: ProductReview) => {
    setStatusPopupReview(rev);
    setPopupSelectedStatus(rev.status || 'approved');
  };

  const handleSaveStatusPopup = async () => {
    if (!statusPopupReview) return;
    await updateReview(statusPopupReview.reviewId, { status: popupSelectedStatus });
    toast.success('Review status updated successfully.');
    setStatusPopupReview(null);
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
    toast.success('Review Deleted Successfully');
  };

  const isVideoUrl = (url: string) => {
    return url.toLowerCase().endsWith('.mp4') || url.toLowerCase().includes('video') || url.startsWith('data:video');
  };

  return (
    <div className="space-y-6 font-sans px-2 sm:px-4 max-w-7xl mx-auto pb-16">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-none border border-zinc-200 shadow-none">
        <div>
          <h2 className="text-2xl font-black text-zinc-950 uppercase tracking-tight">Review Management System</h2>
          <p className="text-xs text-zinc-500 font-bold mt-1 uppercase tracking-wider">
            Square Card Layout • Professional SaaS Admin Dashboard
          </p>
        </div>
        
        <button 
          onClick={handleAddClick}
          className="flex items-center gap-2 bg-zinc-950 text-white hover:bg-zinc-800 px-5 py-3 text-xs font-black uppercase tracking-widest transition-all rounded-none shadow-none w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4 text-emerald-400" />
          Add Customer Review
        </button>
      </div>

      {/* TOP SUMMARY CARDS (STATISTICS) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-none border border-zinc-200 flex flex-col justify-between shadow-none">
          <span className="text-[9px] text-zinc-400 font-black uppercase tracking-widest">Total Reviews</span>
          <span className="text-2xl font-black text-zinc-950 mt-1">{totalCount}</span>
          <span className="text-[8px] text-zinc-400 font-semibold mt-1">All database items</span>
        </div>

        <div className="bg-white p-4 rounded-none border border-zinc-200 flex flex-col justify-between shadow-none">
          <span className="text-[9px] text-zinc-400 font-black uppercase tracking-widest">Approved</span>
          <span className="text-2xl font-black text-emerald-600 mt-1">{publishedCount}</span>
          <span className="text-[8px] text-emerald-600 font-extrabold uppercase mt-1">🟢 Live on Store</span>
        </div>

        <div className="bg-white p-4 rounded-none border border-zinc-200 flex flex-col justify-between shadow-none">
          <span className="text-[9px] text-zinc-400 font-black uppercase tracking-widest">Pending</span>
          <span className="text-2xl font-black text-amber-500 mt-1">{pendingCount}</span>
          <span className="text-[8px] text-amber-600 font-extrabold uppercase mt-1">🟡 Admin Audit</span>
        </div>

        <div className="bg-white p-4 rounded-none border border-zinc-200 flex flex-col justify-between shadow-none">
          <span className="text-[9px] text-zinc-400 font-black uppercase tracking-widest">Disapproved</span>
          <span className="text-2xl font-black text-red-600 mt-1">{disapprovedCount}</span>
          <span className="text-[8px] text-red-600 font-extrabold uppercase mt-1">🔴 Hidden / Rejected</span>
        </div>

        <div className="bg-white p-4 rounded-none border border-zinc-200 flex flex-col justify-between shadow-none col-span-2 sm:col-span-1">
          <span className="text-[9px] text-zinc-400 font-black uppercase tracking-widest">Average Rating</span>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-2xl font-black text-zinc-950">{avgRating}</span>
            <div className="flex text-amber-500">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            </div>
          </div>
          <span className="text-[8px] text-zinc-500 font-extrabold uppercase mt-1">Approved Reviews only</span>
        </div>
      </div>

      {/* SEARCH, FILTER & SORT BAR */}
      <div className="bg-white p-3.5 rounded-none border border-zinc-200 flex flex-col md:flex-row items-center gap-3 shadow-none">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-400" />
          <input 
            type="text"
            placeholder="Search by customer name or product name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-zinc-200 rounded-none text-xs font-semibold placeholder-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-950 text-zinc-900"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          <select 
            value={filterRating} 
            onChange={(e) => setFilterRating(e.target.value)}
            className="bg-white border border-zinc-200 px-3.5 py-3 text-xs font-bold text-zinc-700 rounded-none focus:outline-none focus:border-zinc-950"
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
            className="bg-white border border-zinc-200 px-3.5 py-3 text-xs font-bold text-zinc-700 rounded-none focus:outline-none focus:border-zinc-950"
          >
            <option value="All">All Statuses</option>
            <option value="Approved">🟢 Approved</option>
            <option value="Pending">🟡 Pending</option>
            <option value="Disapproved">🔴 Disapproved</option>
          </select>

          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-white border border-zinc-200 px-3.5 py-3 text-xs font-bold text-zinc-700 rounded-none focus:outline-none focus:border-zinc-950"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* REVIEW LISTING: SQUARE CARD LAYOUT (NO ROUNDED CORNERS, NO UNNECESSARY GAPS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filteredReviews.length === 0 ? (
          <div className="col-span-full bg-white py-16 px-4 rounded-none border border-zinc-200 text-center text-zinc-400 space-y-2">
            <p className="font-bold text-xs uppercase tracking-wider text-zinc-500">No reviews found matching current filter criteria</p>
            <p className="text-[10px] text-zinc-400">Try adjusting your search query or status filter.</p>
          </div>
        ) : (
          filteredReviews.map(rev => {
            const product = products.find(p => p.id === rev.productId);
            
            const imageUrls = rev.mediaUrls?.filter(url => !isVideoUrl(url)) || [];
            const videoUrls = rev.mediaUrls?.filter(url => isVideoUrl(url)) || [];

            const { title, description } = parseReviewText(rev.reviewText);
            const displayName = rev.customerName;
            const initials = displayName ? displayName.substring(0, 2).toUpperCase() : 'CU';

            // Status Badge styling
            const statusVal = rev.status || 'approved';
            let badgeBg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
            let badgeText = 'Approved';
            if (statusVal === 'pending') {
              badgeBg = 'bg-amber-50 text-amber-700 border-amber-200';
              badgeText = 'Pending';
            } else if (statusVal === 'hidden' || statusVal === 'rejected') {
              badgeBg = 'bg-red-50 text-red-700 border-red-200';
              badgeText = 'Disapproved';
            }

            return (
              <div 
                key={rev.reviewId}
                className="bg-white rounded-none border border-zinc-200 p-4 shadow-none hover:border-zinc-950 transition-all flex flex-col justify-between gap-3 relative"
              >
                
                {/* CARD TOP SECTION: Product Image + Customer Info */}
                <div className="flex items-start gap-3 border-b border-zinc-100 pb-3">
                  {/* Product Thumbnail */}
                  <div className="w-12 h-12 bg-zinc-100 rounded-none border border-zinc-200 overflow-hidden shrink-0">
                    {product?.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-zinc-400">IMG</div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-black text-zinc-950 truncate uppercase">{displayName}</h4>
                      <span className={`text-[8px] font-black px-1.5 py-0.5 border rounded-none uppercase ${badgeBg}`}>
                        {badgeText}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-500 font-bold truncate mt-0.5">{product?.name || `Product ID: ${rev.productId}`}</p>
                    <p className="text-[8.5px] text-zinc-400 font-semibold uppercase mt-0.5 flex items-center gap-1">
                      <Calendar className="w-2.5 h-2.5 text-zinc-300" />
                      {new Date(rev.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                {/* RATING STARS */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-0.5 text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-500 text-amber-500' : 'text-zinc-200'}`} 
                      />
                    ))}
                  </div>
                  {rev.verified && (
                    <span className="text-[7.5px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1 py-0.2 uppercase">
                      Verified
                    </span>
                  )}
                </div>

                {/* REVIEW PREVIEW (2-3 lines max) */}
                <div 
                  onClick={() => setViewingReview(rev)}
                  className="cursor-pointer space-y-1 bg-zinc-50/70 p-2.5 rounded-none border border-zinc-150 hover:bg-zinc-100/50 transition-colors"
                  title="Click to view full review details"
                >
                  {title && (
                    <h5 className="text-[11px] font-black text-zinc-950 line-clamp-1">
                      {title}
                    </h5>
                  )}
                  <p className="text-[10.5px] font-medium text-zinc-700 line-clamp-2 leading-relaxed italic">
                    "{description}"
                  </p>
                  <span className="text-[8px] text-indigo-600 font-bold uppercase tracking-wider block pt-0.5">Click to view full review →</span>
                </div>

                {/* MEDIA PREVIEW IF ANY */}
                {(imageUrls.length > 0 || videoUrls.length > 0) && (
                  <div className="flex items-center gap-1 overflow-x-auto py-1">
                    {imageUrls.slice(0, 3).map((url, i) => (
                      <img key={i} src={url} alt="review media" className="w-8 h-8 object-cover border border-zinc-200 rounded-none shrink-0" referrerPolicy="no-referrer" />
                    ))}
                    {videoUrls.length > 0 && (
                      <div className="w-8 h-8 bg-zinc-900 text-white flex items-center justify-center shrink-0">
                        <Video className="w-4 h-4 text-red-400" />
                      </div>
                    )}
                  </div>
                )}

                {/* FOOTER INFO: CREATED / UPDATED */}
                <div className="text-[8px] text-zinc-400 font-semibold uppercase flex justify-between pt-1 border-t border-zinc-100">
                  <span>Source: Customer Panel</span>
                  <span>{rev.createdAt ? new Date(rev.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                </div>

                {/* CARD ACTION BUTTONS (EDIT, STATUS, DELETE) */}
                <div className="grid grid-cols-3 gap-1 pt-1">
                  
                  {/* EDIT REVIEW BUTTON */}
                  <button
                    onClick={() => handleEditClick(rev)}
                    className="flex items-center justify-center gap-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-[10px] font-bold uppercase tracking-wider py-2 rounded-none transition-all border border-zinc-300"
                  >
                    <Edit className="w-3 h-3 text-zinc-700" />
                    <span>Edit</span>
                  </button>

                  {/* STATUS POPUP BUTTON */}
                  <button
                    onClick={() => openStatusPopup(rev)}
                    className="flex items-center justify-center gap-1 bg-zinc-950 text-white hover:bg-zinc-800 text-[10px] font-bold uppercase tracking-wider py-2 rounded-none transition-all"
                  >
                    <RefreshCw className="w-3 h-3 text-emerald-400" />
                    <span>Status</span>
                  </button>

                  {/* DELETE REVIEW BUTTON */}
                  <button
                    onClick={() => triggerDelete(rev.reviewId)}
                    className="flex items-center justify-center gap-1 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-[10px] font-bold uppercase tracking-wider py-2 rounded-none transition-all"
                  >
                    <Trash2 className="w-3 h-3 text-red-650" />
                    <span>Delete</span>
                  </button>

                </div>

              </div>
            );
          })
        )}
      </div>

      {/* VIEW REVIEW DETAILS POPUP MODAL */}
      <AnimatePresence>
        {viewingReview && (() => {
          const product = products.find(p => p.id === viewingReview.productId);
          const { title, description } = parseReviewText(viewingReview.reviewText);
          const imageUrls = viewingReview.mediaUrls?.filter(url => !isVideoUrl(url)) || [];
          const videoUrls = viewingReview.mediaUrls?.filter(url => isVideoUrl(url)) || [];

          return (
            <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white w-full max-w-2xl border border-zinc-200 rounded-none shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
              >
                <div className="p-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-950 text-white">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest">Review Details</h3>
                    <p className="text-[9px] text-zinc-400 uppercase mt-0.5">Review ID: {viewingReview.reviewId}</p>
                  </div>
                  <button onClick={() => setViewingReview(null)} className="text-zinc-400 hover:text-white p-1">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-5">
                  {/* Customer & Product Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-50 p-4 border border-zinc-200 rounded-none">
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block">Customer Information</span>
                      <p className="text-xs font-black text-zinc-950">{viewingReview.customerName}</p>
                      <p className="text-[10px] text-zinc-600">Email: {viewingReview.email || 'N/A'}</p>
                      <p className="text-[10px] text-zinc-600">Phone: {viewingReview.phone || 'N/A'}</p>
                      <p className="text-[10px] text-zinc-600">Customer ID: {viewingReview.customerId}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block">Targeted Product</span>
                      <div className="flex items-center gap-2 mt-1">
                        {product?.image && <img src={product.image} alt="" className="w-10 h-10 object-cover border border-zinc-200" />}
                        <div>
                          <p className="text-xs font-black text-zinc-950 uppercase">{product?.name || viewingReview.productId}</p>
                          <p className="text-[9px] text-zinc-500">SKU: {product?.sku || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Rating & Status */}
                  <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                    <div>
                      <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Rating Given</span>
                      <div className="flex text-amber-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < viewingReview.rating ? 'fill-amber-500 text-amber-500' : 'text-zinc-200'}`} />
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Current Status</span>
                      <span className="text-xs font-black px-2.5 py-1 bg-zinc-900 text-white uppercase rounded-none">
                        {viewingReview.status || 'approved'}
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-2">
                    {title && (
                      <div>
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block">Review Title</span>
                        <h4 className="text-sm font-bold text-zinc-950">{title}</h4>
                      </div>
                    )}
                    <div>
                      <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block">Review Description</span>
                      <p className="text-xs font-medium text-zinc-800 bg-zinc-50 p-3 border border-zinc-200 rounded-none leading-relaxed whitespace-pre-wrap">
                        {description}
                      </p>
                    </div>
                  </div>

                  {/* Media attachments */}
                  {imageUrls.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block">Uploaded Images ({imageUrls.length})</span>
                      <div className="grid grid-cols-4 gap-2">
                        {imageUrls.map((url, i) => (
                          <a key={i} href={url} target="_blank" rel="noreferrer" className="aspect-square border border-zinc-200 rounded-none overflow-hidden block">
                            <img src={url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Video attachment */}
                  {videoUrls.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block">Uploaded Video</span>
                      <video src={videoUrls[0]} controls className="w-full max-h-48 bg-black rounded-none" />
                    </div>
                  )}

                  {/* Timestamps & Source */}
                  <div className="text-[10px] text-zinc-500 space-y-1 pt-2 border-t border-zinc-200">
                    <p>Review Date: {new Date(viewingReview.createdAt).toLocaleString()}</p>
                    <p>Source: Customer Storefront Panel</p>
                    <p>Verified Purchase: {viewingReview.verified ? 'Yes' : 'No'}</p>
                  </div>
                </div>

                <div className="p-4 border-t border-zinc-200 bg-zinc-50 flex justify-end">
                  <button 
                    onClick={() => setViewingReview(null)}
                    className="px-5 py-2.5 bg-zinc-950 text-white font-black text-xs uppercase rounded-none hover:bg-zinc-800"
                  >
                    Close Details
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* STATUS CHANGE POPUP MODAL */}
      <AnimatePresence>
        {statusPopupReview && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md border border-zinc-200 rounded-none shadow-2xl p-6 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-950">Change Review Status</h3>
                <button onClick={() => setStatusPopupReview(null)} className="text-zinc-400 hover:text-zinc-950">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-zinc-600 font-semibold">
                  Select status for review by <span className="font-bold text-zinc-950">{statusPopupReview.customerName}</span>:
                </p>

                <div className="space-y-2">
                  <label className={`flex items-center gap-3 p-3 border cursor-pointer rounded-none transition-all ${popupSelectedStatus === 'approved' ? 'bg-emerald-50 border-emerald-500 font-bold text-emerald-900' : 'border-zinc-200 bg-white text-zinc-700'}`}>
                    <input 
                      type="radio" 
                      name="statusChoice" 
                      value="approved" 
                      checked={popupSelectedStatus === 'approved'}
                      onChange={() => setPopupSelectedStatus('approved')}
                      className="accent-emerald-600"
                    />
                    <div>
                      <p className="text-xs font-black uppercase">Approved</p>
                      <p className="text-[10px] text-zinc-500 font-normal">Shows on Product Page, updates Average Rating & Review Count.</p>
                    </div>
                  </label>

                  <label className={`flex items-center gap-3 p-3 border cursor-pointer rounded-none transition-all ${popupSelectedStatus === 'pending' ? 'bg-amber-50 border-amber-500 font-bold text-amber-900' : 'border-zinc-200 bg-white text-zinc-700'}`}>
                    <input 
                      type="radio" 
                      name="statusChoice" 
                      value="pending" 
                      checked={popupSelectedStatus === 'pending'}
                      onChange={() => setPopupSelectedStatus('pending')}
                      className="accent-amber-500"
                    />
                    <div>
                      <p className="text-xs font-black uppercase">Pending</p>
                      <p className="text-[10px] text-zinc-500 font-normal">Awaiting admin audit. Not visible on public product page.</p>
                    </div>
                  </label>

                  <label className={`flex items-center gap-3 p-3 border cursor-pointer rounded-none transition-all ${popupSelectedStatus === 'hidden' ? 'bg-red-50 border-red-500 font-bold text-red-900' : 'border-zinc-200 bg-white text-zinc-700'}`}>
                    <input 
                      type="radio" 
                      name="statusChoice" 
                      value="hidden" 
                      checked={popupSelectedStatus === 'hidden'}
                      onChange={() => setPopupSelectedStatus('hidden')}
                      className="accent-red-600"
                    />
                    <div>
                      <p className="text-xs font-black uppercase">Disapproved / Hidden</p>
                      <p className="text-[10px] text-zinc-500 font-normal">Hidden from store feed. Excluded from rating calculations.</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-200">
                <button 
                  onClick={() => setStatusPopupReview(null)}
                  className="px-4 py-2.5 border border-zinc-300 text-zinc-700 text-xs font-black uppercase rounded-none hover:bg-zinc-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveStatusPopup}
                  className="px-5 py-2.5 bg-zinc-950 text-white text-xs font-black uppercase tracking-wider rounded-none hover:bg-zinc-800"
                >
                  Save Status
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD / EDIT REVIEW FORM MODAL */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 bg-black/65 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-xl border border-zinc-200 shadow-2xl rounded-none overflow-hidden flex flex-col max-h-[90vh]"
            >
              
              <div className="p-6 border-b border-zinc-200 flex items-center justify-between bg-zinc-950 text-white">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest">
                    {editingReviewId ? '✏ Edit Customer Review' : '➕ Add Customer Review'}
                  </h3>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase mt-1">
                    {editingReviewId ? 'Update existing feedback and store stats' : 'Create new customer review'}
                  </p>
                </div>
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-8 h-8 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center rounded-none transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto space-y-4">
                
                {/* Product Select Field */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block">Target Product *</label>
                  <select 
                    value={formProductId}
                    onChange={(e) => setFormProductId(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white border border-zinc-300 rounded-none text-xs font-semibold text-zinc-900 focus:outline-none focus:border-zinc-950"
                  >
                    <option value="" disabled>Select product...</option>
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
                      placeholder="e.g. Tanvir Ahmed"
                      value={formCustomerName}
                      onChange={(e) => setFormCustomerName(e.target.value)}
                      className="w-full px-4 py-3 border border-zinc-300 rounded-none text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-950 font-semibold"
                    />
                  </div>

                  {/* Star Rating */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block">Rating (1-5 Stars) *</label>
                    <select 
                      value={formRating}
                      onChange={(e) => setFormRating(parseInt(e.target.value))}
                      className="w-full px-4 py-3 bg-white border border-zinc-300 rounded-none text-xs font-bold text-amber-500 focus:outline-none"
                    >
                      <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
                      <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
                      <option value="3">⭐⭐⭐ (3 Stars)</option>
                      <option value="2">⭐⭐ (2 Stars)</option>
                      <option value="1">⭐ (1 Star)</option>
                    </select>
                  </div>
                </div>

                {/* Status Selection */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block">Review Status *</label>
                  <select 
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-4 py-3 bg-white border border-zinc-300 rounded-none text-xs font-bold text-zinc-900 focus:outline-none"
                  >
                    <option value="approved">🟢 Approved (Shows on Product Page)</option>
                    <option value="pending">🟡 Pending (Admin Panel only)</option>
                    <option value="hidden">🔴 Disapproved / Hidden</option>
                  </select>
                </div>

                {/* Review Title */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block">Review Title *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Excellent build quality and fast delivery"
                    value={formReviewTitle}
                    onChange={(e) => setFormReviewTitle(e.target.value)}
                    className="w-full px-4 py-3 border border-zinc-300 rounded-none text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none font-bold"
                  />
                </div>

                {/* Review Description */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block">Review Description *</label>
                  <textarea 
                    rows={4}
                    required
                    placeholder="Write review description..."
                    value={formReviewText}
                    onChange={(e) => setFormReviewText(e.target.value)}
                    className="w-full px-4 py-3 border border-zinc-300 rounded-none text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none font-medium"
                  />
                </div>

                {/* Image Uploads */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block">Review Photos (Max 5)</label>
                  <label className="flex flex-col items-center justify-center border border-dashed border-zinc-300 bg-zinc-50 hover:bg-zinc-100 transition-all cursor-pointer rounded-none p-4 text-center">
                    <input 
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFormImageUploadChange}
                      className="hidden"
                      disabled={formMediaUrls.length >= 5}
                    />
                    <p className="text-xs font-black text-zinc-900 uppercase">Click to upload review images</p>
                  </label>

                  {formMediaUrls.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto py-1">
                      {formMediaUrls.map((url, i) => (
                        <div key={i} className="relative w-14 h-14 shrink-0 border border-zinc-300 bg-white">
                          <img src={url} alt="" className="w-full h-full object-cover" />
                          <button 
                            type="button"
                            onClick={() => handleFormRemoveMedia(i)}
                            className="absolute top-0 right-0 bg-black text-white p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 pt-2 border-t border-zinc-200">
                  <label className="flex items-center gap-2 text-xs font-bold text-zinc-750 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formVerified}
                      onChange={(e) => setFormVerified(e.target.checked)}
                      className="w-4 h-4 accent-zinc-950 rounded-none"
                    />
                    <span>Verified Purchase</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-bold text-zinc-750 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formAnonymous}
                      onChange={(e) => setFormAnonymous(e.target.checked)}
                      className="w-4 h-4 accent-zinc-950 rounded-none"
                    />
                    <span>Anonymous</span>
                  </label>
                </div>

                <div className="border-t border-zinc-200 pt-4 flex justify-end gap-2">
                  <button 
                    type="button" 
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-5 py-3 border border-zinc-300 text-zinc-700 rounded-none text-xs font-bold uppercase hover:bg-zinc-100"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-6 py-3 bg-zinc-950 text-white rounded-none text-xs font-black uppercase tracking-widest hover:bg-zinc-800"
                  >
                    {editingReviewId ? 'Save Changes' : 'Submit Review'}
                  </button>
                </div>

              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deletingReviewId && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-none p-6 max-w-sm w-full border border-zinc-200 shadow-2xl relative text-center space-y-4"
            >
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-none flex items-center justify-center mx-auto border border-red-200">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black uppercase tracking-tight text-zinc-950 mb-1">Delete Review?</h3>
                <p className="text-xs text-zinc-500 font-semibold leading-relaxed">
                  Are you sure you want to permanently delete this review?
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingReviewId(null)}
                  className="py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-black text-xs uppercase tracking-wider rounded-none transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="py-3 bg-red-650 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider rounded-none transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
