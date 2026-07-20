import React, { useState, useMemo } from 'react';
import { 
  Star, Search, Filter, Trash2, CheckCircle, XCircle, 
  Eye, Calendar, ArrowUpDown, ChevronLeft, ChevronRight,
  MoreVertical, MoreHorizontal, MessageSquare, ShieldCheck,
  Smartphone, User, Package, Clock, ShieldX, Ban, Archive,
  X, ChevronDown, Edit3
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useReviewStore, ProductReview } from '../../store/useReviewStore';
import { useProductStore } from '../../store/useProductStore';
import { formatPrice, cn } from '../../lib/utils';
import { toast } from 'react-hot-toast';

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected' | 'hidden';

export default function AdminReviewList() {
  const navigate = useNavigate();
  const { 
    reviews, deleteReview, approveReview, rejectReview, 
    updateReview, fetchReviews, isLoading, subscribe 
  } = useReviewStore();
  const { products } = useProductStore();

  React.useEffect(() => {
    fetchReviews();
    const unsubscribe = subscribe();
    return () => unsubscribe();
  }, [fetchReviews, subscribe]);

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

      {/* Review Table List */}
      <div className="bg-white rounded-lg border border-zinc-100 shadow-sm overflow-hidden relative min-h-[400px]">
        {isLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-zinc-200 border-t-zinc-950 rounded-full animate-spin" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Syncing Reviews...</p>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 border-b border-zinc-100">
                <th className="p-4 w-10">
                  <button 
                    onClick={handleSelectAll}
                    className={cn(
                      "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                      selectedReviews.length === filteredReviews.length && filteredReviews.length > 0
                        ? "bg-zinc-950 border-zinc-950 text-white" 
                        : "bg-white border-zinc-200"
                    )}
                  >
                    {selectedReviews.length === filteredReviews.length && filteredReviews.length > 0 && <CheckCircle className="w-3 h-3" />}
                  </button>
                </th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Customer Name</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Product Name</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Star Rating</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Review Status</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Review Date</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {filteredReviews.length > 0 ? (
                filteredReviews.map((review) => {
                  const product = products.find(p => String(p.id) === String(review.productId));
                  const isSelected = selectedReviews.includes(review.reviewId);

                  return (
                    <motion.tr 
                      key={review.reviewId}
                      layout
                      className={cn(
                        "hover:bg-zinc-50/50 transition-colors group",
                        isSelected && "bg-zinc-50"
                      )}
                    >
                      <td className="p-4">
                        <button 
                          onClick={() => handleSelectOne(review.reviewId)}
                          className={cn(
                            "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                            isSelected ? "bg-zinc-950 border-zinc-950 text-white" : "bg-white border-zinc-200"
                          )}
                        >
                          {isSelected && <CheckCircle className="w-3 h-3" />}
                        </button>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center shrink-0 border border-zinc-200">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase">{review.customerName.charAt(0)}</span>
                          </div>
                          <div className="min-w-0">
                            <div className="text-[11px] font-bold text-zinc-950 uppercase truncate">{review.customerName}</div>
                            {review.verified && (
                              <div className="flex items-center gap-1 text-[8px] font-bold text-emerald-600 uppercase tracking-widest">
                                <ShieldCheck className="w-2.5 h-2.5" /> Verified
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 max-w-[200px]">
                        <div className="flex items-center gap-2">
                          {product && (
                            <div className="w-8 h-8 rounded border border-zinc-100 overflow-hidden shrink-0">
                              <img src={product.image} alt="" className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div className="text-[11px] font-bold text-zinc-600 uppercase truncate">
                            {product?.name || 'Unknown Product'}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={cn(
                                "w-3 h-3",
                                i < review.rating ? "fill-amber-400 text-amber-400" : "fill-zinc-100 text-zinc-100"
                              )} 
                            />
                          ))}
                        </div>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(review.status)}
                      </td>
                      <td className="p-4">
                        <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                          {new Date(review.createdAt).toLocaleDateString('en-GB', { 
                            day: '2-digit', 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1">
                          <button 
                            onClick={() => navigate(`/admin/reviews/detail/${review.reviewId}`)}
                            className="p-2 text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100 rounded-md transition-all"
                            title="View"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => navigate(`/admin/reviews/detail/${review.reviewId}`)}
                            className="p-2 text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100 rounded-md transition-all"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this review?')) {
                                deleteReview(review.reviewId);
                              }
                            }}
                            className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="w-8 h-8 text-zinc-200" />
                      <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">No reviews found matching filters</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
