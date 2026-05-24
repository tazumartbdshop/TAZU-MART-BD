import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Star, CheckCircle, Clock, Smartphone, Mail, Phone, ShoppingCart, 
  MapPin, User, Eye, ArrowLeft, EyeOff, Trash2, Heart, Flag
} from 'lucide-react';
import { useReviewStore } from '../store/useReviewStore';
import { useProductStore } from '../store/useProductStore';

export default function ReviewDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { reviews } = useReviewStore();
  const { products } = useProductStore();

  const product = products.find(p => p.id === id);
  const productReviews = reviews.filter(rev => rev.productId === id && rev.status === 'approved');

  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(
    productReviews.length > 0 ? productReviews[0].reviewId : null
  );

  const selectedReview = productReviews.find(r => r.reviewId === selectedReviewId) || productReviews[0];

  const totalReviews = productReviews.length;
  const averageRating = totalReviews > 0
    ? Number((productReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
    : 0;

  // Star breakdown
  const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  productReviews.forEach(r => {
    const key = r.rating as 5 | 4 | 3 | 2 | 1;
    if (starCounts[key] !== undefined) starCounts[key]++;
  });

  return (
    <div className="bg-white min-h-screen text-zinc-900 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Back Link */}
        <button 
          onClick={() => navigate(`/product/${id}`)}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-950 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Product Details
        </button>

        {/* Product Summary Header Card */}
        {product && (
          <div className="bg-zinc-50 border border-zinc-200 p-6 rounded-none flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 bg-white border border-zinc-200 overflow-hidden shrink-0">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-widest">{product.category}</span>
                <h1 className="text-xl font-black text-black leading-tight uppercase tracking-tight">{product.name}</h1>
                <p className="text-sm font-semibold text-zinc-600">Model SKU: <span className="text-zinc-900 font-mono">{product.sku}</span></p>
              </div>
            </div>

            <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-zinc-200 pt-4 md:pt-0 md:pl-8 shrink-0">
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-1">
                  <span className="text-2xl font-black text-black">{averageRating}</span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} className={`w-4 h-4 ${s <= Math.round(averageRating) ? 'fill-amber-500 text-amber-500' : 'fill-zinc-200 text-zinc-200'}`} />
                    ))}
                  </div>
                </div>
                <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-black mt-1">({totalReviews} Approved Reviews)</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Reviews Stack Index List */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-zinc-200">
              <h2 className="text-sm font-black uppercase tracking-widest text-[#000000]">Customer Reviews ({productReviews.length})</h2>
              <span className="text-[10px] bg-zinc-900 text-white rounded px-2 py-0.5 font-bold uppercase">Latest Stack</span>
            </div>

            {productReviews.length === 0 ? (
              <div className="py-12 bg-zinc-50 border border-zinc-200 rounded-none text-center">
                <p className="text-xs text-zinc-500 font-bold">No verified reviews found for this product yet.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
                {productReviews.map(rev => {
                  const isActive = selectedReview?.reviewId === rev.reviewId;
                  return (
                    <div 
                      key={rev.reviewId}
                      onClick={() => setSelectedReviewId(rev.reviewId)}
                      className={`p-4 border transition-all cursor-pointer text-left relative ${
                        isActive 
                          ? 'bg-zinc-950 border-zinc-950 text-white shadow-xl translate-x-1' 
                          : 'bg-white border-zinc-200 hover:border-zinc-400 text-zinc-900'
                      }`}
                    >
                      {rev.isPinned && (
                        <span className="absolute top-3 right-3 text-[7px] font-black uppercase tracking-wider text-amber-500">📌 PINNED</span>
                      )}
                      
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black truncate max-w-[150px]">{rev.customerName}</span>
                        <span className={`text-[8px] font-bold uppercase ${isActive ? 'text-zinc-400' : 'text-zinc-400'}`}>
                          {new Date(rev.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>

                      <div className="flex gap-0.5 mb-2">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} className={`w-3.5 h-3.5 ${s <= rev.rating ? 'fill-amber-500 text-amber-500' : 'fill-zinc-200 text-zinc-200 border-none'}`} />
                        ))}
                      </div>

                      <p className={`text-[11px] line-clamp-2 ${isActive ? 'text-zinc-200' : 'text-zinc-500'}`}>
                        {rev.reviewText}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Full Review Specification sheet (Detailed View) */}
          <div className="lg:col-span-7">
            {selectedReview ? (
              <div className="border border-zinc-200 bg-white p-6 md:p-8 space-y-6 shadow-sm">
                
                {/* Header Information */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 pb-5">
                  <div className="space-y-1">
                    <span className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-widest">Selected Review Profile</span>
                    <h3 className="text-xl font-black text-black uppercase tracking-tight">{selectedReview.customerName}</h3>
                    {selectedReview.verified && (
                      <span className="inline-flex items-center gap-1 text-[8.5px] font-extrabold text-[#22c55e] uppercase tracking-wider bg-[#22c55e]/10 border border-[#22c55e]/30 px-2 py-0.5 rounded">
                        <CheckCircle className="w-2.5 h-2.5" /> Verified Purchase
                      </span>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-widest block">Review Rating</span>
                    <div className="flex items-center gap-1 justify-end mt-1">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} className={`w-4 h-4 ${s <= selectedReview.rating ? 'fill-amber-500 text-amber-500' : 'fill-zinc-200 text-zinc-200'}`} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Grid Metadata Spec Board */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-50/50 p-4 border border-zinc-200 text-xs">
                  
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Purchase Details</h4>
                    
                    <div className="space-y-1.5 font-semibold text-zinc-700">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase w-20">Order ID:</span>
                        <span className="text-zinc-900 font-mono">{selectedReview.orderId || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase w-20">Verified User:</span>
                        <span className="text-zinc-900">{selectedReview.verified ? 'Yes ✓' : 'No'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase w-20">Anonymous:</span>
                        <span className="text-zinc-900">{selectedReview.anonymous ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 border-t sm:border-t-0 sm:border-l border-zinc-200 sm:pl-4">
                    <h4 className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Customer Reference</h4>
                    
                    <div className="space-y-1.5 font-semibold text-zinc-700">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{selectedReview.phone || 'Phone hidden (privacy)'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{selectedReview.email || 'Email hidden (privacy)'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{new Date(selectedReview.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Review Message Text box */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Full Review Text</h4>
                  <p className="text-sm font-semibold text-zinc-800 leading-relaxed bg-zinc-50 border border-zinc-200/50 p-4 rounded-xl select-text">
                    "{selectedReview.reviewText}"
                  </p>
                </div>

                {/* Uploaded media files */}
                {selectedReview.mediaUrls && selectedReview.mediaUrls.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Attached Media Carousel</h4>
                    <div className="flex flex-wrap gap-3">
                      {selectedReview.mediaUrls.map((url, i) => (
                        <div key={i} className="w-24 h-24 bg-zinc-100 border rounded border-zinc-200 overflow-hidden">
                          {url.toLowerCase().endsWith('.mp4') ? (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950 text-white">
                              <span className="text-[10px] uppercase font-bold text-red-400">Video</span>
                            </div>
                          ) : (
                            <img src={url} alt="review media" className="w-full h-full object-cover" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Device and IP parameters */}
                {selectedReview.deviceIP && (
                  <div className="pt-4 border-t border-zinc-200/50 flex flex-wrap gap-4 text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">
                    <div className="flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Submitting Device IP: <span className="font-mono text-zinc-600 font-bold">{selectedReview.deviceIP}</span></span>
                    </div>
                  </div>
                )}

                {/* Tazu Mart BD response message */}
                {selectedReview.adminReply ? (
                  <div className="mt-8 p-5 bg-zinc-100 border border-zinc-200 rounded-lg">
                    <div className="flex items-center gap-1.5 text-[8.5px] text-zinc-500 font-extrabold tracking-widest uppercase border-b border-zinc-200 pb-2 mt-0 mb-3 whitespace-nowrap">
                       <span className="w-3.5 h-3.5 bg-purple-600 text-white font-serif rounded-full flex items-center justify-center text-[7.5px] font-black shrink-0">T</span>
                       <span className="font-sans">TAZU MART BD</span>
                       <span className="text-[6.5px] bg-purple-950 text-purple-300 border border-purple-800/40 px-1 py-0.2 rounded font-black uppercase ml-auto">Official Response</span>
                    </div>
                    <p className="text-xs text-zinc-700 font-bold leading-relaxed">
                      {selectedReview.adminReply}
                    </p>
                  </div>
                ) : (
                  <div className="py-8 text-center bg-zinc-50 rounded border border-dashed border-zinc-300">
                    <p className="text-xs text-zinc-400 font-bold">No manufacturer reply has been appended to this review yet.</p>
                  </div>
                )}

              </div>
            ) : (
              <div className="border border-dashed border-zinc-200 h-64 flex items-center justify-center text-zinc-400">
                <p className="text-sm font-semibold">Select a customer review from the stack to visualize details.</p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
