import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Star, ChevronLeft, User, Package, MessageSquare, 
  Trash2, Image as ImageIcon, Video, CheckCircle, XCircle, 
  Calendar, Clock, ShieldCheck, Mail, Phone, Hash, 
  Layers, Edit3, Save, Trash, Plus, Upload, Play,
  ExternalLink, Ban, Eye, AlertCircle, ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReviewStore, ProductReview } from '../../store/useReviewStore';
import { useProductStore } from '../../store/useProductStore';
import { useCustomerStore } from '../../store/useCustomerStore';
import { formatPrice, cn } from '../../lib/utils';
import { toast } from 'react-hot-toast';

export default function AdminReviewDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { reviews, updateReview, deleteReview, fetchReviews } = useReviewStore();
  const { products } = useProductStore();
  const { customers, fetchCustomers } = useCustomerStore();

  useEffect(() => {
    fetchReviews();
    fetchCustomers();
  }, []);

  const review = reviews.find(r => r.reviewId === id);
  const product = products.find(p => String(p.id) === String(review?.productId));
  const customer = useMemo(() => 
    customers.find(c => c.id === review?.customerId), 
    [customers, review?.customerId]
  );

  // Edit States
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editRating, setEditRating] = useState(0);
  const [editText, setEditText] = useState('');
  const [editStatus, setEditStatus] = useState<ProductReview['status']>('pending');
  const [editMedia, setEditMedia] = useState<string[]>([]);
  const [editReply, setEditReply] = useState('');

  useEffect(() => {
    if (review) {
      setEditName(review.customerName);
      setEditRating(review.rating);
      setEditText(review.reviewText);
      setEditStatus(review.status);
      setEditMedia(review.mediaUrls || []);
      setEditReply(review.adminReply || '');
    }
  }, [review]);

  if (!review) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <XCircle className="w-12 h-12 text-red-500" />
        <h2 className="text-xl font-bold uppercase tracking-tight text-zinc-950">Review Not Found</h2>
        <button onClick={() => navigate('/admin/reviews/list')} className="px-6 h-10 bg-zinc-950 text-white rounded-lg text-xs font-bold uppercase tracking-widest">
          Back to List
        </button>
      </div>
    );
  }

  const handleSave = () => {
    if (!editName.trim() || !editText.trim()) {
      toast.error('Name and Review text are required');
      return;
    }

    updateReview(review.reviewId, {
      customerName: editName.trim(),
      rating: editRating,
      reviewText: editText.trim(),
      status: editStatus,
      mediaUrls: editMedia,
      adminReply: editReply.trim() || undefined
    });

    setIsEditing(false);
    toast.success('Review updated successfully');
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this review permanently?')) {
      deleteReview(review.reviewId);
      toast.success('Review deleted');
      navigate('/admin/reviews/list');
    }
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const filesArray = Array.from(files);
    filesArray.forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setEditMedia(prev => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeMedia = (idx: number) => {
    setEditMedia(editMedia.filter((_, i) => i !== idx));
  };

  const isVideo = (url: string) => url.match(/\.(mp4|webm|mov)$/i) || url.startsWith('data:video');

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Top Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-lg border border-zinc-100 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/reviews/list')}
            className="p-3 hover:bg-zinc-50 rounded-lg transition-colors border border-zinc-100"
          >
            <ChevronLeft className="w-5 h-5 text-zinc-950" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-zinc-950 uppercase tracking-tighter">Review Details</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[9px] font-bold uppercase text-zinc-400 tracking-widest font-mono">ID: {review.reviewId}</span>
              <div className="h-1 w-1 rounded-full bg-zinc-200" />
              <span className="text-[9px] font-bold uppercase text-zinc-400 tracking-widest">{new Date(review.createdAt).toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button 
                onClick={() => setIsEditing(false)}
                className="px-6 h-12 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-950 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="flex items-center gap-2 px-8 h-12 bg-zinc-950 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all"
              >
                <Save className="w-4 h-4" /> Save Changes
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={handleDelete}
                className="p-3 text-red-500 hover:bg-red-50 rounded-lg transition-all border border-red-100"
                title="Delete Review"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-8 h-12 bg-zinc-950 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all"
              >
                <Edit3 className="w-4 h-4" /> Edit Review
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Customer & Product Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Customer Card */}
          <div className="bg-white p-6 rounded-lg border border-zinc-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-zinc-400" />
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-950">Customer Profile</h3>
              </div>
              {review.verified && (
                <span className="flex items-center gap-1 text-[8px] font-bold uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                  <ShieldCheck className="w-3 h-3" /> Verified
                </span>
              )}
            </div>

            <div className="flex flex-col items-center text-center space-y-3 pb-4 border-b border-zinc-50">
              <div className="w-20 h-20 rounded-full bg-zinc-100 flex items-center justify-center border-4 border-white shadow-md text-2xl font-bold text-zinc-400 overflow-hidden">
                {customer?.profileImage ? (
                  <img src={customer.profileImage} alt="" className="w-full h-full object-cover" />
                ) : (
                  review.customerName.charAt(0)
                )}
              </div>
              <div>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="text-center w-full px-3 py-1 bg-zinc-50 border border-zinc-200 rounded-lg text-sm font-bold uppercase tracking-tight focus:outline-none focus:border-zinc-950"
                  />
                ) : (
                  <h4 className="text-lg font-bold text-zinc-950 uppercase tracking-tight">{review.customerName}</h4>
                )}
                <div className="flex flex-col items-center gap-1 mt-1">
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                    {review.anonymous ? 'Anonymous on Website' : 'Public Profile'}
                  </p>
                  {customer && (
                    <span className={cn(
                      "text-[8px] font-black uppercase px-2 py-0.5 rounded border",
                      customer.status === 'Active' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                    )}>
                      {customer.status} Status
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-50 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-zinc-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-[8px] font-bold uppercase tracking-widest text-zinc-400 leading-none">Email Address</p>
                  <p className="text-xs font-bold text-zinc-700 truncate">{customer?.emails[0] || review.email || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-50 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-zinc-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-[8px] font-bold uppercase tracking-widest text-zinc-400 leading-none">Phone Number</p>
                  <p className="text-xs font-bold text-zinc-700">{customer?.phones[0] || review.phone || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-50 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4 text-zinc-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-[8px] font-bold uppercase tracking-widest text-zinc-400 leading-none">Registration Date</p>
                  <p className="text-xs font-bold text-zinc-700">
                    {customer?.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-50 flex items-center justify-center shrink-0">
                  <Hash className="w-4 h-4 text-zinc-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-[8px] font-bold uppercase tracking-widest text-zinc-400 leading-none">Customer ID</p>
                  <p className="text-xs font-bold text-zinc-700 font-mono truncate">{review.customerId}</p>
                </div>
              </div>

              <button 
                onClick={() => navigate(`/admin/customers?profile=${review.customerId}`)}
                className="w-full h-11 bg-zinc-950 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-md mt-2"
              >
                Go to Customer Listing
              </button>
            </div>
          </div>

          {/* Product Card */}
          <div className="bg-white p-6 rounded-lg border border-zinc-100 shadow-sm space-y-6">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-zinc-400" />
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-950">Product Information</h3>
            </div>

            {product ? (
              <div className="space-y-4">
                <Link 
                  to={`/product/${product.id}`}
                  className="block aspect-square rounded-lg overflow-hidden border border-zinc-100 bg-zinc-50 relative group"
                >
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-all">
                    <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all" />
                  </div>
                </Link>
                <div>
                  <Link to={`/product/${product.id}`} className="text-sm font-bold text-zinc-950 uppercase tracking-tight hover:text-purple-600 transition-colors line-clamp-2">
                    {product.name}
                  </Link>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[9px] font-bold uppercase tracking-widest bg-zinc-950 text-white px-2 py-0.5 rounded">
                      {product.category}
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">
                      SKU: {product.sku}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                <p className="text-[10px] font-bold text-amber-700 uppercase leading-relaxed">Product no longer exists in database</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Review Details & Media */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Review Content */}
          <div className="bg-white p-8 rounded-lg border border-zinc-100 shadow-sm space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Overall Rating</label>
                {isEditing ? (
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button key={s} onClick={() => setEditRating(s)} className="transition-transform active:scale-90">
                        <Star className={cn("w-8 h-8", s <= editRating ? "fill-amber-400 text-amber-400" : "fill-zinc-100 text-zinc-100")} />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={cn("w-6 h-6", i < review.rating ? "fill-amber-400 text-amber-400" : "fill-zinc-100 text-zinc-100")} />
                      ))}
                    </div>
                    <span className="text-xl font-bold text-zinc-950 font-mono">{review.rating}.0</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Current Status</label>
                {isEditing ? (
                  <div className="flex flex-wrap gap-2">
                    {(['pending', 'approved', 'rejected', 'hidden'] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => setEditStatus(s)}
                        className={cn(
                          "px-4 h-10 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all border",
                          editStatus === s 
                            ? "bg-zinc-950 text-white border-zinc-950 shadow-md" 
                            : "bg-white text-zinc-400 border-zinc-100 hover:border-zinc-300"
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center">
                    {editStatus === 'approved' && (
                      <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                        <CheckCircle className="w-4 h-4" /> Approved & Published
                      </span>
                    )}
                    {editStatus === 'pending' && (
                      <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                        <Clock className="w-4 h-4" /> Pending Review
                      </span>
                    )}
                    {editStatus === 'rejected' && (
                      <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-100">
                        <XCircle className="w-4 h-4" /> Rejected
                      </span>
                    )}
                    {editStatus === 'hidden' && (
                      <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-zinc-500 bg-zinc-50 px-3 py-1 rounded-full border border-zinc-100">
                        <Ban className="w-4 h-4" /> Hidden from Public
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Review Description</label>
              {isEditing ? (
                <textarea 
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  rows={6}
                  className="w-full p-6 bg-zinc-50 border border-zinc-200 rounded-lg text-sm font-medium focus:outline-none focus:border-zinc-950 transition-all resize-none leading-[1.6]"
                />
              ) : (
                <div className="p-6 bg-zinc-50/50 rounded-lg border border-zinc-100 text-zinc-700 leading-[1.6] text-sm font-medium text-left">
                  {review.reviewText}
                </div>
              )}
            </div>
          </div>

          {/* Media Section */}
          <div className="bg-white p-8 rounded-lg border border-zinc-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-zinc-400" />
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-950">Review Media Gallery</h3>
              </div>
              {isEditing && (
                <label className="flex items-center gap-2 px-4 h-10 bg-zinc-50 hover:bg-zinc-100 rounded-lg border border-zinc-200 cursor-pointer transition-colors">
                  <Plus className="w-3.5 h-3.5 text-zinc-950" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-950">Add Media</span>
                  <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={handleMediaUpload} />
                </label>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {editMedia.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-zinc-100 bg-zinc-50 group">
                  {isVideo(url) ? (
                    <div className="w-full h-full bg-zinc-950 flex items-center justify-center relative">
                      <video src={url} className="w-full h-full object-cover opacity-60" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                          <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  )}
                  
                  {isEditing && (
                    <button 
                      onClick={() => removeMedia(i)}
                      className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg transition-all shadow-md hover:scale-110 active:scale-95"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  
                  {!isEditing && (
                    <a 
                      href={url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <ExternalLink className="w-6 h-6 text-white" />
                    </a>
                  )}
                </div>
              ))}
              {editMedia.length === 0 && (
                <div className="col-span-full py-12 flex flex-col items-center justify-center text-center space-y-2 bg-zinc-50/50 rounded-lg border border-dashed border-zinc-200">
                  <ImageIcon className="w-8 h-8 text-zinc-200" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-300">No media attached to this review</p>
                </div>
              )}
            </div>
          </div>

          {/* Admin Reply Section */}
          <div className="bg-white p-8 rounded-lg border border-zinc-100 shadow-sm space-y-6">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-zinc-400" />
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-950">Storefront Official Response</h3>
            </div>

            <div className="space-y-4">
              <textarea 
                value={editReply}
                onChange={(e) => setEditReply(e.target.value)}
                placeholder="Type your official response here..."
                rows={4}
                className="w-full p-6 bg-zinc-50 border border-zinc-200 rounded-lg text-sm font-medium focus:outline-none focus:border-zinc-950 transition-all resize-none leading-[1.6]"
              />
              <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck className="w-3 h-3" />
                This response will be visible publicly on the product page
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
