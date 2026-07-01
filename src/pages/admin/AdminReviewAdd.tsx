import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Star, Image as ImageIcon, Video, CheckCircle, X, 
  ChevronLeft, Upload, Play, AlertCircle, Loader2, User, Package
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReviewStore } from '../../store/useReviewStore';
import { useProductStore } from '../../store/useProductStore';
import { useCustomerStore } from '../../store/useCustomerStore';
import { toast } from 'react-hot-toast';
import { cn } from '../../lib/utils';

export default function AdminReviewAdd() {
  const navigate = useNavigate();
  const { addReview, fetchReviews } = useReviewStore();
  const { products } = useProductStore();
  const { customers, fetchCustomers } = useCustomerStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [customerId, setCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [productId, setProductId] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [attachedMedia, setAttachedMedia] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [anonymousToggle, setAnonymousToggle] = useState(false);
  const [verifiedToggle, setVerifiedToggle] = useState(true);
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected' | 'hidden'>('approved');
  const [createdAt, setCreatedAt] = useState(new Date().toISOString().split('T')[0]);
  const [detailedError, setDetailedError] = useState<{
    title: string;
    reason: string;
    table?: string;
    missingColumn?: string;
    solution: string;
  } | null>(null);

  useEffect(() => {
    fetchCustomers();
    fetchReviews();
  }, []);

  useEffect(() => {
    if (products.length > 0 && !productId) {
      setProductId(String(products[0].id));
    }
  }, [products, productId]);

  const handleCustomerSelect = (id: string) => {
    setCustomerId(id);
    if (id) {
      const customer = customers.find(c => c.id === id);
      if (customer) {
        setCustomerName(customer.name);
        setCustomerEmail(customer.emails?.[0] || '');
        setCustomerPhone(customer.phones?.[0] || '');
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const filesArray = Array.from(files);
    const slotsLeft = 10 - attachedMedia.length;
    if (slotsLeft <= 0) {
      toast.error('Maximum 10 images allowed');
      return;
    }
    
    const filesToLoad = filesArray.slice(0, slotsLeft);
    filesToLoad.forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAttachedMedia(prev => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setVideoUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeMedia = (idx: number) => {
    setAttachedMedia(attachedMedia.filter((_, i) => i !== idx));
  };

  const removeVideo = () => {
    setVideoUrl('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!customerId) {
      toast.error('Please select a customer');
      return;
    }
    if (!rating) {
      toast.error('Please select a rating');
      return;
    }
    if (!productId) {
      toast.error('Please select a product');
      return;
    }
    if (!reviewText.trim()) {
      toast.error('Please write a review');
      return;
    }

    setIsSubmitting(true);
    setDetailedError(null);
    
    try {
      // Logic for uploading media
      const { uploadImage } = await import('../../lib/imageUtils');
      
      const finalImageUrls = await Promise.all(
        attachedMedia.map(async (media) => {
          if (media.startsWith('data:')) {
            const res = await fetch(media);
            const blob = await res.blob();
            return await uploadImage(blob, 'reviews', `img-${Date.now()}-${Math.random()}`);
          }
          return media;
        })
      );

      let finalVideoUrl = videoUrl;
      if (videoUrl.startsWith('data:')) {
        const res = await fetch(videoUrl);
        const blob = await res.blob();
        finalVideoUrl = await uploadImage(blob, 'reviews', `vid-${Date.now()}-${Math.random()}`);
      }

      const allMedia = [...finalImageUrls];
      if (finalVideoUrl) allMedia.push(finalVideoUrl);

      await addReview({
        productId,
        customerName: customerName.trim(),
        customerId: customerId,
        email: customerEmail.trim() || undefined,
        phone: customerPhone.trim() || undefined,
        rating,
        reviewText: reviewText.trim(),
        mediaUrls: allMedia,
        verified: verifiedToggle,
        anonymous: anonymousToggle,
        status,
        isPinned: false,
        createdAt: new Date(createdAt).toISOString()
      } as any);

      toast.success('Review added successfully.');
      navigate('/admin/reviews/list');
    } catch (err: any) {
      console.error("[Review Publish Flow Error]:", err);
      
      // Provide detailed error feedback
      const errorMsg = err.message || 'An unknown error occurred while saving the review.';
      setDetailedError({
        title: 'Database Save Failed',
        reason: errorMsg,
        table: 'public.reviews',
        solution: 'Check if the Supabase table "reviews" exists and has all the required columns (product_id, user_id, rating, review_text, etc.).'
      });
      
      toast.error(`Failed to add review: ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 bg-white p-6 rounded-lg border border-zinc-100 shadow-sm">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-zinc-50 rounded-md transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-zinc-950" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-zinc-950 uppercase tracking-tight">Add New Review</h2>
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Create a manual customer review entry</p>
        </div>
      </div>

      <AnimatePresence>
        {detailedError && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-red-50 border border-red-100 p-6 rounded-lg space-y-4"
          >
            <div className="flex items-start gap-3 text-red-600">
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider">{detailedError.title}</h4>
                <p className="text-xs mt-1 font-medium opacity-90 leading-relaxed">{detailedError.reason}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-red-100">
              {detailedError.table && (
                <div>
                  <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest block mb-1">Target Table</span>
                  <code className="text-[10px] font-mono bg-red-100/50 px-2 py-1 rounded text-red-700">{detailedError.table}</code>
                </div>
              )}
              <div>
                <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest block mb-1">Suggested Solution</span>
                <p className="text-[10px] font-bold text-red-700 leading-tight">{detailedError.solution}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Information */}
        <div className="bg-white p-8 rounded-lg border border-zinc-100 shadow-sm space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-zinc-400" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-950">Customer Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Select Customer *</label>
              <select 
                value={customerId}
                onChange={(e) => handleCustomerSelect(e.target.value)}
                className="w-full h-11 px-4 bg-zinc-50 border border-zinc-200 rounded-lg text-sm font-medium focus:outline-none focus:border-zinc-950 transition-all"
                required
              >
                <option value="">Choose customer</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Customer Name (Override)</label>
              <input 
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter customer name"
                className="w-full h-11 px-4 bg-zinc-50 border border-zinc-200 rounded-lg text-sm font-medium focus:outline-none focus:border-zinc-950 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Email Address (Optional)</label>
              <input 
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="customer@example.com"
                className="w-full h-11 px-4 bg-zinc-50 border border-zinc-200 rounded-lg text-sm font-medium focus:outline-none focus:border-zinc-950 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Phone Number (Optional)</label>
              <input 
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+880 1XXX-XXXXXX"
                className="w-full h-11 px-4 bg-zinc-50 border border-zinc-200 rounded-lg text-sm font-medium focus:outline-none focus:border-zinc-950 transition-all"
              />
            </div>
            <div className="flex items-center gap-6 pt-4">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className={cn(
                  "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                  anonymousToggle ? "bg-zinc-950 border-zinc-950" : "border-zinc-200 group-hover:border-zinc-400"
                )}>
                  <input 
                    type="checkbox" 
                    className="hidden"
                    checked={anonymousToggle}
                    onChange={(e) => setAnonymousToggle(e.target.checked)}
                  />
                  {anonymousToggle && <CheckCircle className="w-3 h-3 text-white" />}
                </div>
                <span className="text-xs font-bold text-zinc-600">Post Anonymously</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer group">
                <div className={cn(
                  "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                  verifiedToggle ? "bg-zinc-950 border-zinc-950" : "border-zinc-200 group-hover:border-zinc-400"
                )}>
                  <input 
                    type="checkbox" 
                    className="hidden"
                    checked={verifiedToggle}
                    onChange={(e) => setVerifiedToggle(e.target.checked)}
                  />
                  {verifiedToggle && <CheckCircle className="w-3 h-3 text-white" />}
                </div>
                <span className="text-xs font-bold text-zinc-600">Verified Purchase</span>
              </label>
            </div>
          </div>
        </div>

        {/* Product & Rating */}
        <div className="bg-white p-8 rounded-lg border border-zinc-100 shadow-sm space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-4 h-4 text-zinc-400" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-950">Review Details</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Select Product *</label>
              <select 
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="w-full h-11 px-4 bg-zinc-50 border border-zinc-200 rounded-lg text-sm font-medium focus:outline-none focus:border-zinc-950 transition-all"
                required
              >
                <option value="">Select a product</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Overall Rating *</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    onClick={() => setRating(star)}
                    className="transition-transform active:scale-90"
                  >
                    <Star 
                      className={cn(
                        "w-10 h-10 transition-colors",
                        star <= (hoveredStar || rating) 
                          ? "fill-amber-400 text-amber-400" 
                          : "fill-zinc-100 text-zinc-100"
                      )} 
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Review Message *</label>
              <textarea 
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Write the customer's review here..."
                rows={5}
                className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-lg text-sm font-medium leading-[1.6] focus:outline-none focus:border-zinc-950 transition-all resize-none"
                required
              />
            </div>
          </div>
        </div>

        {/* Media Upload */}
        <div className="bg-white p-8 rounded-lg border border-zinc-100 shadow-sm space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <ImageIcon className="w-4 h-4 text-zinc-400" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-950">Photos & Videos</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Images */}
            <div className="space-y-4">
              <div className="flex justify-between items-baseline">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-950">Customer Photos</label>
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{attachedMedia.length}/10</span>
              </div>
              
              <div className="grid grid-cols-4 gap-3">
                {attachedMedia.map((img, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-zinc-100 bg-zinc-50 group">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => removeMedia(i)}
                      className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {attachedMedia.length < 10 && (
                  <label className="aspect-square rounded-lg border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-50 hover:border-zinc-400 transition-all group">
                    <Upload className="w-5 h-5 text-zinc-400 group-hover:text-zinc-600 mb-1" />
                    <span className="text-[8px] font-bold uppercase tracking-tighter text-zinc-400 group-hover:text-zinc-600">Upload</span>
                    <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            {/* Video */}
            <div className="space-y-4">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-950">Customer Video</label>
              
              {videoUrl ? (
                <div className="relative aspect-video rounded-lg overflow-hidden bg-zinc-950 group">
                  <video src={videoUrl} className="w-full h-full object-cover" controls />
                  <button 
                    type="button"
                    onClick={removeVideo}
                    className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="aspect-video rounded-lg border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-50 hover:border-zinc-400 transition-all group">
                  <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-400 group-hover:text-zinc-600 mb-3">
                    <Video className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 group-hover:text-zinc-600">Click to upload video</span>
                  <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Status & Submit */}
        <div className="bg-white p-8 rounded-lg border border-zinc-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="space-y-1 flex-1 md:flex-none">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Created At *</label>
              <input 
                type="date"
                value={createdAt}
                onChange={(e) => setCreatedAt(e.target.value)}
                className="w-full md:w-48 h-11 px-4 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-bold focus:outline-none focus:border-zinc-950"
                required
              />
            </div>
            <div className="space-y-1 flex-1 md:flex-none">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Review Status *</label>
              <select 
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full md:w-48 h-11 px-4 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-bold focus:outline-none focus:border-zinc-950"
                required
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="hidden">Hidden</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button 
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 md:flex-none px-8 h-12 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-950 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-10 h-12 bg-zinc-950 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Publish Review
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
