import React, { useState, useMemo } from 'react';
import { 
  Star, Search, Filter, ChevronLeft, Package, 
  Clock, CheckCircle, XCircle, Trash2, Edit3, 
  Eye, ShoppingBag, ArrowRight, MessageSquare
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useReviewStore, ProductReview } from '../store/useReviewStore';
import { useAuthStore } from '../store/useAuthStore';
import { useProductStore } from '../store/useProductStore';
import { formatPrice, cn } from '../lib/utils';
import { toast } from 'react-hot-toast';

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

export default function MyReviews() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { reviews, deleteReview } = useReviewStore();
  const { products } = useProductStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editingReview, setEditingReview] = useState<ProductReview | null>(null);
  const [editText, setEditText] = useState('');
  const [editRating, setEditRating] = useState(0);

  const { updateReview } = useReviewStore();

  // Filter reviews for current user
  const myReviews = useMemo(() => {
    if (!user) return [];
    
    // We match by customerId if it exists, or by email/phone as fallback
    // Note: In ProductReviews.tsx we should ensure customerId is set correctly
    return reviews.filter(r => 
      r.customerId === user.id || 
      (r.email && r.email === user.email) ||
      (r.phone && r.phone === user.phone)
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [reviews, user]);

  // Apply search and status filters
  const filteredReviews = useMemo(() => {
    return myReviews.filter(review => {
      const product = products.find(p => String(p.id) === String(review.productId));
      const productName = product?.name.toLowerCase() || '';
      const matchesSearch = productName.includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || review.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [myReviews, searchQuery, statusFilter, products]);

  const handleDelete = (reviewId: string) => {
    deleteReview(reviewId);
    setDeleteConfirmId(null);
    toast.success('Review deleted successfully');
  };

  const handleEditOpen = (review: ProductReview) => {
    setEditingReview(review);
    setEditText(review.reviewText);
    setEditRating(review.rating);
  };

  const handleEditSave = () => {
    if (!editingReview) return;
    if (!editText.trim()) {
      toast.error('Review text cannot be empty');
      return;
    }
    updateReview(editingReview.reviewId, {
      reviewText: editText.trim(),
      rating: editRating,
      status: 'pending' // Reset to pending for re-approval after edit
    });
    setEditingReview(null);
    toast.success('Review updated and sent for re-approval');
  };

  const getStatusBadge = (status: ProductReview['status']) => {
    switch (status) {
      case 'approved':
        return (
          <span className="flex items-center gap-1 text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
            <CheckCircle className="w-3 h-3" /> Approved
          </span>
        );
      case 'pending':
        return (
          <span className="flex items-center gap-1 text-[10px] font-black uppercase text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
            <Clock className="w-3 h-3" /> Pending Review
          </span>
        );
      case 'rejected':
        return (
          <span className="flex items-center gap-1 text-[10px] font-black uppercase text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">
            <XCircle className="w-3 h-3" /> Rejected
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[10px] font-black uppercase text-zinc-500 bg-zinc-50 px-2 py-0.5 rounded border border-zinc-100">
            Hidden
          </span>
        );
    }
  };

  return (
    <div className="bg-[#F8F9FE] min-h-screen pb-24 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-zinc-100 sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-4xl">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-zinc-50 rounded-full transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-zinc-950" />
            </button>
            <h1 className="text-lg font-black uppercase tracking-tight text-zinc-950">My Reviews</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-zinc-900 text-white text-[10px] font-black px-2 py-1 rounded-full uppercase">
              {myReviews.length} Total
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input 
              type="text"
              placeholder="Search by product name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-zinc-950/5 focus:border-zinc-950"
            />
          </div>
          <div className="flex bg-white p-1 rounded-xl border border-zinc-200 w-full md:w-auto">
            {(['all', 'pending', 'approved', 'rejected'] as StatusFilter[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={cn(
                  "flex-1 md:flex-none px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all",
                  statusFilter === filter 
                    ? "bg-zinc-950 text-white shadow-sm" 
                    : "text-zinc-500 hover:text-zinc-950"
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Reviews List */}
        {filteredReviews.length > 0 ? (
          <div className="space-y-4">
            {filteredReviews.map((review) => {
              const product = products.find(p => String(p.id) === String(review.productId));
              if (!product) return null;

              return (
                <motion.div 
                  key={review.reviewId}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-zinc-100 rounded-2xl p-5 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.1)] transition-all"
                >
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <Link to={`/product/${product.slug || product.id}`} className="shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-zinc-100 bg-zinc-50">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </Link>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <Link to={`/product/${product.slug || product.id}`} className="text-[11px] font-black text-zinc-950 uppercase tracking-tight hover:text-red-600 transition-colors line-clamp-1">
                            {product.name}
                          </Link>
                          <div className="flex items-center gap-1 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={cn(
                                  "w-3 h-3",
                                  i < review.rating ? "fill-amber-400 text-amber-400" : "fill-zinc-100 text-zinc-100"
                                )} 
                              />
                            ))}
                            <span className="text-[10px] text-zinc-400 font-bold ml-1">
                              {new Date(review.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                        </div>
                        {getStatusBadge(review.status)}
                      </div>

                      <p className="mt-3 text-xs text-zinc-700 font-medium leading-relaxed">
                        {review.reviewText}
                      </p>

                      {/* Attached Media */}
                      {review.mediaUrls && review.mediaUrls.length > 0 && (
                        <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar">
                          {review.mediaUrls.map((url, idx) => (
                            <div key={idx} className="w-16 h-16 rounded-lg overflow-hidden border border-zinc-100 shrink-0">
                              {url.match(/\.(mp4|webm|mov)$/i) ? (
                                <div className="w-full h-full bg-zinc-900 flex items-center justify-center relative">
                                  <video src={url} className="w-full h-full object-cover opacity-50" />
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                      <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[6px] border-l-white border-b-[4px] border-b-transparent ml-0.5" />
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <img src={url} alt="Review attachment" className="w-full h-full object-cover" />
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Admin Reply */}
                      {review.adminReply && (
                        <div className="mt-4 p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                          <div className="flex items-center gap-1.5 mb-1">
                            <MessageSquare className="w-3 h-3 text-zinc-400" />
                            <span className="text-[9px] font-black uppercase text-zinc-400 tracking-wider">Admin Reply</span>
                          </div>
                          <p className="text-[10px] text-zinc-600 font-bold italic leading-relaxed">
                            "{review.adminReply}"
                          </p>
                        </div>
                      )}

                      {/* Rejection Reason */}
                      {review.status === 'rejected' && review.rejectionReason && (
                        <div className="mt-4 p-3 bg-red-50 rounded-xl border border-red-100">
                          <div className="flex items-center gap-1.5 mb-1">
                            <XCircle className="w-3 h-3 text-red-400" />
                            <span className="text-[9px] font-black uppercase text-red-400 tracking-wider">Rejection Reason</span>
                          </div>
                          <p className="text-[10px] text-red-600 font-bold leading-relaxed">
                            {review.rejectionReason}
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="mt-5 pt-4 border-t border-zinc-50 flex items-center justify-between">
                        <Link 
                          to={`/product/${product.slug || product.id}`}
                          className="flex items-center gap-1.5 text-[9px] font-black uppercase text-zinc-400 hover:text-zinc-950 transition-colors tracking-widest"
                        >
                          View Product <ArrowRight className="w-3 h-3" />
                        </Link>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleEditOpen(review)}
                            className="p-2 text-zinc-400 hover:text-zinc-950 hover:bg-zinc-50 rounded-lg transition-all"
                            title="Edit Review"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setDeleteConfirmId(review.reviewId)}
                            className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete Review"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white border border-zinc-100 rounded-[32px] p-12 text-center flex flex-col items-center space-y-6">
            <div className="w-20 h-20 bg-[#F8F9FE] rounded-full flex items-center justify-center border border-zinc-100 shadow-inner">
              <Star className="w-8 h-8 text-zinc-200 fill-zinc-100" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black uppercase tracking-tight text-zinc-950">You haven't reviewed any products yet</h2>
              <p className="text-xs text-zinc-500 font-medium max-w-xs mx-auto leading-relaxed">
                Start shopping and share your experience with other customers. Your feedback helps others make better choices.
              </p>
            </div>
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-8 py-4 bg-zinc-950 text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-zinc-800 transition-all hover:scale-105 active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              Browse Products
            </button>
          </div>
        )}
      </div>

      {/* Edit Review Modal */}
      <AnimatePresence>
        {editingReview && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-lg rounded-[32px] p-8 border border-zinc-200 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black uppercase text-zinc-950 tracking-tight">Edit Your Review</h3>
                <button onClick={() => setEditingReview(null)} className="p-2 hover:bg-zinc-50 rounded-full">
                  <XCircle className="w-5 h-5 text-zinc-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        onClick={() => setEditRating(s)}
                        className="transition-transform active:scale-90"
                      >
                        <Star 
                          className={cn(
                            "w-8 h-8",
                            s <= editRating ? "fill-amber-400 text-amber-400" : "fill-zinc-100 text-zinc-100"
                          )} 
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Review Text</label>
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={5}
                    className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-zinc-950/5 focus:border-zinc-950 transition-all"
                    placeholder="Describe your experience..."
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-4">
                <button
                  onClick={handleEditSave}
                  className="w-full py-4 bg-zinc-950 text-white hover:bg-zinc-800 rounded-full text-xs font-black uppercase tracking-widest transition-all shadow-lg"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setEditingReview(null)}
                  className="w-full py-4 bg-white text-zinc-500 hover:text-zinc-950 rounded-full text-xs font-black uppercase tracking-widest transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-sm rounded-[32px] p-8 border border-zinc-200 text-center space-y-6 shadow-2xl"
            >
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-100">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-black uppercase text-zinc-950">Delete Review?</h3>
                <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                  Are you sure you want to delete this review? This action cannot be undone and the review will be removed from the product page.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleDelete(deleteConfirmId)}
                  className="w-full py-4 bg-red-600 text-white hover:bg-red-700 rounded-full text-xs font-black uppercase tracking-widest transition-colors shadow-lg shadow-red-200"
                >
                  Delete Permanently
                </button>
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="w-full py-4 bg-white text-zinc-500 hover:text-zinc-950 rounded-full text-xs font-black uppercase tracking-widest transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
