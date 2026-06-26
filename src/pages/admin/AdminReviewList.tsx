import React, { useState, useMemo } from 'react';
import { 
  Star, Search, Filter, Trash2, CheckCircle, XCircle, 
  Eye, Calendar, ArrowUpDown, ChevronLeft, ChevronRight,
  MoreVertical, MoreHorizontal, MessageSquare, ShieldCheck,
  Smartphone, User, Package, Clock, ShieldX, Ban, Archive,
  X, ChevronDown
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useReviewStore, ProductReview } from '../../store/useReviewStore';
import { useProductStore } from '../../store/useProductStore';
import { formatPrice, cn } from '../../lib/utils';
import { toast } from 'react-hot-toast';

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected' | 'hidden';

export default function AdminReviewList() {
  const navigate = useNavigate();
  const { reviews, deleteReview, approveReview, rejectReview, updateReview } = useReviewStore();
  const { products } = useProductStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');
  const [selectedReviews, setSelectedReviews] = useState<string[]>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Sorting
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'rating-high' | 'rating-low'>('newest');
  const [quickStatusTarget, setQuickStatusTarget] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<ProductReview['status']>('pending');

  const handleUpdateStatus = (id: string, status: ProductReview['status']) => {
    updateReview(id, { status });
    toast.success(`Review ${status} successfully`);
    setQuickStatusTarget(null);
  };

  const filteredReviews = useMemo(() => {
    return reviews.filter(rev => {
      const product = products.find(p => String(p.id) === String(rev.productId));
      const productName = product?.name.toLowerCase() || '';
      const matchesSearch = 
        rev.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        productName.includes(searchQuery.toLowerCase()) ||
        rev.reviewId.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || rev.status === statusFilter;
      const matchesRating = ratingFilter === 'all' || rev.rating === ratingFilter;
      
      return matchesSearch && matchesStatus && matchesRating;
    }).sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === 'rating-high') return b.rating - a.rating;
      if (sortBy === 'rating-low') return a.rating - b.rating;
      return 0;
    });
  }, [reviews, searchQuery, statusFilter, ratingFilter, products, sortBy]);

  const handleSelectAll = () => {
    if (selectedReviews.length === filteredReviews.length) {
      setSelectedReviews([]);
    } else {
      setSelectedReviews(filteredReviews.map(r => r.reviewId));
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedReviews(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkAction = (action: 'approve' | 'reject' | 'delete' | 'hide') => {
    if (selectedReviews.length === 0) return;

    if (action === 'delete') {
      if (window.confirm(`Are you sure you want to delete ${selectedReviews.length} reviews?`)) {
        selectedReviews.forEach(id => deleteReview(id));
        toast.success(`${selectedReviews.length} reviews deleted`);
        setSelectedReviews([]);
      }
      return;
    }

    selectedReviews.forEach(id => {
      if (action === 'approve') approveReview(id);
      if (action === 'reject') rejectReview(id, 'Rejected by bulk action');
      if (action === 'hide') updateReview(id, { status: 'hidden' });
    });

    toast.success(`${selectedReviews.length} reviews updated`);
    setSelectedReviews([]);
  };

  const getStatusBadge = (status: ProductReview['status']) => {
    switch (status) {
      case 'approved':
        return (
          <span className="flex items-center gap-1 text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
            <CheckCircle className="w-3 h-3" /> Approved
          </span>
        );
      case 'pending':
        return (
          <span className="flex items-center gap-1 text-[9px] font-black uppercase text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
      case 'rejected':
        return (
          <span className="flex items-center gap-1 text-[9px] font-black uppercase text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">
            <XCircle className="w-3 h-3" /> Rejected
          </span>
        );
      case 'hidden':
        return (
          <span className="flex items-center gap-1 text-[9px] font-black uppercase text-zinc-500 bg-zinc-50 px-2 py-0.5 rounded border border-zinc-100">
            <Archive className="w-3 h-3" /> Hidden
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Reviews', value: reviews.length, color: 'text-zinc-950', bg: 'bg-white', icon: Star },
          { label: 'Pending', value: reviews.filter(r => r.status === 'pending').length, color: 'text-amber-600', bg: 'bg-amber-50/50', icon: Clock },
          { label: 'Approved', value: reviews.filter(r => r.status === 'approved').length, color: 'text-emerald-600', bg: 'bg-emerald-50/50', icon: CheckCircle },
          { label: 'Rejected', value: reviews.filter(r => r.status === 'rejected').length, color: 'text-red-600', bg: 'bg-red-50/50', icon: XCircle },
        ].map((stat, i) => (
          <div key={i} className={cn("p-4 rounded-lg border border-zinc-100 shadow-sm", stat.bg)}>
            <div className="flex justify-between items-start mb-2">
              <stat.icon className={cn("w-4 h-4", stat.color)} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Live</span>
            </div>
            <div className="text-2xl font-bold tracking-tighter text-zinc-950">{stat.value}</div>
            <div className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filters & Actions */}
      <div className="bg-white p-4 rounded-lg border border-zinc-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input 
              type="text"
              placeholder="Search by customer, product, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 h-11 bg-zinc-50 border border-zinc-100 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-zinc-950/5 focus:border-zinc-950"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="px-4 h-11 bg-zinc-50 border border-zinc-100 rounded-lg text-[10px] font-bold uppercase tracking-widest focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="hidden">Hidden</option>
            </select>

            <select 
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="px-4 h-11 bg-zinc-50 border border-zinc-100 rounded-lg text-[10px] font-bold uppercase tracking-widest focus:outline-none"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>

            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 h-11 bg-zinc-50 border border-zinc-100 rounded-lg text-[10px] font-bold uppercase tracking-widest focus:outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="rating-high">Highest Rated</option>
              <option value="rating-low">Lowest Rated</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        <AnimatePresence>
          {selectedReviews.length > 0 && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex items-center justify-between p-3 bg-zinc-950 rounded-lg text-white overflow-hidden"
            >
              <div className="flex items-center gap-4">
                <div className="text-[10px] font-bold uppercase tracking-widest pl-2">
                  {selectedReviews.length} Selected
                </div>
                <div className="h-4 w-px bg-white/20" />
                <div className="flex items-center gap-1">
                  <button onClick={() => handleBulkAction('approve')} className="px-3 h-9 hover:bg-white/10 rounded-md text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 transition-colors">
                    <CheckCircle className="w-3 h-3 text-emerald-400" /> Approve
                  </button>
                  <button onClick={() => handleBulkAction('reject')} className="px-3 h-9 hover:bg-white/10 rounded-md text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 transition-colors">
                    <XCircle className="w-3 h-3 text-amber-400" /> Reject
                  </button>
                  <button onClick={() => handleBulkAction('hide')} className="px-3 h-9 hover:bg-white/10 rounded-md text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 transition-colors">
                    <Ban className="w-3 h-3 text-zinc-400" /> Hide
                  </button>
                  <button onClick={() => handleBulkAction('delete')} className="px-3 h-9 hover:bg-white/10 rounded-md text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 transition-colors text-red-400">
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              </div>
              <button onClick={() => setSelectedReviews([])} className="p-2 hover:bg-white/10 rounded-md">
                <XCircle className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Review Cards List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <button 
            onClick={handleSelectAll}
            className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-950 transition-colors"
          >
            {selectedReviews.length === filteredReviews.length ? 'Deselect All' : 'Select All Visible'}
          </button>
          <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            Showing {filteredReviews.length} Reviews
          </div>
        </div>

        {filteredReviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredReviews.map((review) => {
              const product = products.find(p => String(p.id) === String(review.productId));
              const isSelected = selectedReviews.includes(review.reviewId);

              return (
                <motion.div 
                  key={review.reviewId}
                  layout
                  className={cn(
                    "bg-white border rounded-lg p-5 shadow-sm transition-all group relative",
                    isSelected ? "border-zinc-950 ring-2 ring-zinc-950/5" : "border-zinc-100 hover:border-zinc-200"
                  )}
                >
                  {/* Select Checkbox */}
                  <button 
                    onClick={() => handleSelectOne(review.reviewId)}
                    className={cn(
                      "absolute top-5 left-5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all z-10",
                      isSelected ? "bg-zinc-950 border-zinc-950 text-white" : "bg-white border-zinc-200 opacity-0 group-hover:opacity-100"
                    )}
                  >
                    {isSelected && <CheckCircle className="w-3 h-3" />}
                  </button>

                  <div className={cn("space-y-4 transition-all", isSelected && "pl-8")}>
                    {/* Header Info */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0 border border-zinc-200 overflow-hidden">
                          {review.customerId ? (
                            <div className="text-xs font-bold text-zinc-400">{review.customerName.charAt(0)}</div>
                          ) : (
                            <User className="w-5 h-5 text-zinc-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-zinc-950 truncate uppercase tracking-tight">
                            {review.customerName}
                          </h4>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={cn(
                                    "w-2.5 h-2.5",
                                    i < review.rating ? "fill-amber-400 text-amber-400" : "fill-zinc-100 text-zinc-100"
                                  )} 
                                />
                              ))}
                            </div>
                            <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" />
                              {new Date(review.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="shrink-0">
                        {getStatusBadge(review.status)}
                      </div>
                    </div>

                    {/* Product Info */}
                    {product && (
                      <div className="flex items-center gap-2 p-2 bg-zinc-50 rounded-lg border border-zinc-100">
                        <div className="w-10 h-10 rounded-md overflow-hidden border border-zinc-200 shrink-0">
                          <img src={product.image} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Product</div>
                          <div className="text-[10px] font-bold text-zinc-950 uppercase truncate tracking-tight">{product.name}</div>
                        </div>
                      </div>
                    )}

                    {/* Review Text */}
                    <div className="relative">
                      <p className="text-xs text-zinc-600 font-medium leading-[1.6] line-clamp-3">
                        {review.reviewText}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-zinc-50">
                      <div className="flex items-center gap-1.5">
                        <div className="flex -space-x-1.5">
                          {review.mediaUrls?.slice(0, 3).map((url, idx) => (
                            <div key={idx} className="w-6 h-6 rounded-md border-2 border-white overflow-hidden bg-zinc-100">
                              <img src={url} alt="" className="w-full h-full object-cover" />
                            </div>
                          ))}
                          {review.mediaUrls && review.mediaUrls.length > 3 && (
                            <div className="w-6 h-6 rounded-md border-2 border-white bg-zinc-950 text-[8px] font-bold text-white flex items-center justify-center">
                              +{review.mediaUrls.length - 3}
                            </div>
                          )}
                        </div>
                        {review.mediaUrls && review.mediaUrls.length > 0 && (
                          <span className="text-[9px] font-bold uppercase text-zinc-400 tracking-widest">Media</span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => {
                            setQuickStatusTarget(review.reviewId);
                            setSelectedStatus(review.status);
                          }}
                          className={cn(
                            "flex items-center gap-1.5 px-3 h-8 rounded-lg border text-[9px] font-bold uppercase tracking-widest transition-all",
                            review.status === 'approved' ? "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100" :
                            review.status === 'rejected' ? "bg-red-50 text-red-600 border-red-100 hover:bg-red-100" :
                            "bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100"
                          )}
                        >
                          {review.status}
                          <ChevronDown className="w-3 h-3" />
                        </button>

                        <button 
                          onClick={() => navigate(`/admin/reviews/detail/${review.reviewId}`)}
                          className="p-2 text-zinc-400 hover:text-zinc-950 hover:bg-zinc-50 rounded-md transition-all"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            if (window.confirm('Delete this review?')) deleteReview(review.reviewId);
                          }}
                          className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                          title="Delete"
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
          <div className="bg-white border border-dashed border-zinc-200 rounded-lg p-12 text-center space-y-4">
            <div className="w-16 h-16 bg-zinc-50 rounded-lg flex items-center justify-center mx-auto text-zinc-300">
              <Search className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold uppercase tracking-tight text-zinc-950">No Reviews Found</h3>
              <p className="text-xs text-zinc-400 font-medium">Try adjusting your filters or search query.</p>
            </div>
            <button 
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setRatingFilter('all');
              }}
              className="px-6 h-10 bg-zinc-950 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Quick Status Modal */}
      <AnimatePresence>
        {quickStatusTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-sm rounded-lg overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-950">Update Review Status</h3>
                  <button onClick={() => setQuickStatusTarget(null)} className="p-1 hover:bg-zinc-100 rounded-md">
                    <X className="w-4 h-4 text-zinc-400" />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {(['pending', 'approved', 'rejected'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setSelectedStatus(status)}
                      className={cn(
                        "w-full h-12 rounded-lg border flex items-center justify-between px-4 transition-all",
                        selectedStatus === status
                          ? "border-zinc-950 bg-zinc-950 text-white shadow-md"
                          : "border-zinc-100 bg-zinc-50 hover:border-zinc-300 text-zinc-600"
                      )}
                    >
                      <span className="text-xs font-bold uppercase tracking-widest">{status}</span>
                      {selectedStatus === status && <CheckCircle className="w-4 h-4" />}
                    </button>
                  ))}
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => setQuickStatusTarget(null)}
                    className="flex-1 h-12 rounded-lg bg-zinc-100 text-zinc-950 text-xs font-bold uppercase tracking-widest hover:bg-zinc-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus(quickStatusTarget, selectedStatus)}
                    className="flex-1 h-12 rounded-lg bg-zinc-950 text-white text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors shadow-md"
                  >
                    Save Changes
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
