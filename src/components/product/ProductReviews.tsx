import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Star, MessageSquare, Image as ImageIcon, Video, CheckCircle, X, 
  Edit3, Filter, MessageCircle, ChevronRight, Sparkles, SlidersHorizontal, ArrowUpDown,
  Plus, Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReviewStore, ProductReview } from '../../store/useReviewStore';
import { useProductStore } from '../../store/useProductStore';
import { useAuthStore } from '../../store/useAuthStore';

type FilterType = 'Latest' | 'Highest Rating' | 'Lowest Rating' | 'With Photos' | 'Verified Reviews';

export default function ProductReviews() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Dynamic Stores
  const { reviews, addReview, fetchReviews, isLoading } = useReviewStore();
  const { products } = useProductStore();
  const { user, isAuthenticated } = useAuthStore();

  React.useEffect(() => {
    fetchReviews();
  }, []);
  
  const product = products.find(p => String(p.id) === String(id));

  // Filter & Form States
  const [activeFilter, setActiveFilter] = useState<FilterType>('Latest');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);
  
  // Add Review Form Fields State
  const [rating, setRating] = useState(0);
  const [customerName, setCustomerName] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [mediaUrlInput, setMediaUrlInput] = useState('');
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [attachedMedia, setAttachedMedia] = useState<string[]>([]);
  const [verifiedToggle, setVerifiedToggle] = useState(true);
  const [anonymousToggle, setAnonymousToggle] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessPopupOpen, setIsSuccessPopupOpen] = useState(false);

  // Initialize form default values when opening the modal
  React.useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('openReview') === 'true' && isAuthenticated) {
      setIsReviewModalOpen(true);
      // Clean up the URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }

    if (isReviewModalOpen) {
      if (isAuthenticated && user) {
        setCustomerName(user.name || '');
      } else {
        setCustomerName('');
      }
      setRating(0);
      setReviewText('');
      setAttachedMedia([]);
      setVideoUrlInput('');
      setAnonymousToggle(false);
      setValidationError(null);
    }
  }, [isReviewModalOpen, isAuthenticated, user]);

  const handleWriteReviewClick = () => {
    if (!isAuthenticated) {
      const currentPath = window.location.pathname;
      const redirectUrl = `${currentPath}?openReview=true`;
      navigate(`/login?redirect=${encodeURIComponent(redirectUrl)}`, { 
        state: { message: 'Please log in to submit your review.' } 
      });
      return;
    }
    setIsReviewModalOpen(true);
  };

  // Image Viewer Modal
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  // Fetch reviews specific to this product & only approved
  const productReviews = reviews.filter(rev => rev.productId === id && rev.status === 'approved');

  // Compute stats on the fly for absolute live sync
  const totalReviews = productReviews.length;
  
  const averageRating = totalReviews > 0
    ? Number((productReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
    : 0;

  // Star breakdown calculation
  const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  productReviews.forEach(r => {
    const ratingKey = r.rating as 5 | 4 | 3 | 2 | 1;
    if (starCounts[ratingKey] !== undefined) {
      starCounts[ratingKey]++;
    }
  });

  // Collect customer photos for top carousel/grid preview
  const customerPhotos = productReviews.reduce<string[]>((acc, rev) => {
    if (rev.mediaUrls && rev.mediaUrls.length > 0) {
      acc.push(...rev.mediaUrls);
    }
    return acc;
  }, []);

  // Filter and Sort implementation
  let filteredReviews = [...productReviews];

  if (activeFilter === 'Highest Rating') {
    filteredReviews.sort((a, b) => b.rating - a.rating);
  } else if (activeFilter === 'Lowest Rating') {
    filteredReviews.sort((a, b) => a.rating - b.rating);
  } else if (activeFilter === 'With Photos') {
    filteredReviews = filteredReviews.filter(r => r.mediaUrls && r.mediaUrls.length > 0);
  } else if (activeFilter === 'Verified Reviews') {
    filteredReviews = filteredReviews.filter(r => r.verified === true);
  } else {
    // 'Latest'
    filteredReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Handle local media attachment additions and direct uploads
  const handleImageUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const filesArray = Array.from(files);
    
    // We already have some images in attachedMedia.
    const slotsLeft = 5 - attachedMedia.length;
    if (slotsLeft <= 0) return;
    const filesToLoad = filesArray.slice(0, slotsLeft);

    filesToLoad.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAttachedMedia(prev => {
            if (prev.length >= 5) return prev;
            return [...prev, reader.result as string];
          });
        }
      };
      reader.readAsDataURL(file as any);
    });
  };

  const handleVideoUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setVideoUrlInput(reader.result);
      }
    };
    reader.readAsDataURL(file as any);
  };

  const handleRemoveVideo = () => {
    setVideoUrlInput('');
  };

  const handleRemoveMedia = (idx: number) => {
    setAttachedMedia(attachedMedia.filter((_, i) => i !== idx));
  };

  // Form Submission Validation State
  const [validationError, setValidationError] = useState<string | null>(null);

  // Form Submission
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setValidationError(null);

    if (!rating || rating < 1 || rating > 5) {
      setValidationError("Please select a star rating.");
      return;
    }
    if (!anonymousToggle && !customerName.trim()) {
      setValidationError("Full Name is required.");
      return;
    }
    if (!reviewText.trim()) {
      setValidationError("Please write your review.");
      return;
    }

    setIsSubmitting(true);

    // Simulated loading state (2.5 seconds)
    await new Promise((resolve) => setTimeout(resolve, 2500));

    let finalVideoUrl = videoUrlInput.trim();
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
      attachedMedia.map(async (url) => {
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

    // Combine any images and videos
    const finalMedia = [...uploadedMediaUrls];
    if (finalVideoUrl) {
      finalMedia.push(finalVideoUrl);
    }

    const finalName = anonymousToggle ? 'Anonymous Customer' : customerName.trim();

    addReview({
      productId: id || 'f1',
      customerId: user?.id || 'guest',
      customerName: finalName,
      rating,
      reviewText: reviewText.trim(),
      mediaUrls: finalMedia,
      verified: verifiedToggle,
      isPinned: false,
      anonymous: anonymousToggle,
      email: user?.email,
      phone: user?.phone,
      status: 'pending' // Default status is now Pending
    });

    setIsSubmitting(false);
    setIsReviewModalOpen(false); // Close review form modal
    setIsSuccessPopupOpen(true); // Open success message popup modal

    // Reset form states
    setRating(0);
    setCustomerName('');
    setReviewText('');
    setAttachedMedia([]);
    setVideoUrlInput('');
    setAnonymousToggle(false);
  };

  return (
    <div className="bg-white border-t border-zinc-200 font-sans" id="reviews-section">
      <div className="container mx-auto px-4 lg:px-8 max-w-7xl py-16 md:py-24">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-12 border-b border-zinc-100 pb-10">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter mb-4 text-zinc-950">Ratings & Reviews</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-zinc-900 text-white px-2.5 py-0.5 rounded-full font-bold uppercase tracking-widest text-[9px]">
                TAZU MART Quality Verified
              </span>
            </div>
          </div>
          
          <button 
            onClick={handleWriteReviewClick}
            className="group flex items-center justify-center gap-2 bg-zinc-950 text-white hover:bg-zinc-800 px-8 py-4 rounded-none text-xs font-bold uppercase tracking-widest transition-all shadow-md active:translate-y-0.5"
          >
            <Edit3 className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
            Write Storefront Review
          </button>
        </div>

        {/* OVERALL RATING & STAR BREAKDOWN LAYOUT (Daraz + Amazon Hybrid style) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16 bg-zinc-50/50 p-6 md:p-8 border border-zinc-200/60 rounded-xl">
          
          {/* Left Column: Stats overview */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center text-center lg:border-r border-zinc-200 lg:pr-8 py-4">
            <span className="text-7xl font-black text-zinc-950 tracking-tighter leading-none mb-2">
              {averageRating > 0 ? averageRating : '0.0'}
            </span>
            
            <div className="flex items-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map(s => (
                <Star 
                  key={s} 
                  className={`w-5 h-5 ${
                    s <= Math.round(averageRating) 
                      ? 'fill-amber-500 text-amber-500' 
                      : 'fill-zinc-200 text-zinc-200 border-none'
                  }`} 
                />
              ))}
            </div>

            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">
              based on {totalReviews} trusted reviews
            </p>
          </div>

          {/* Middle Column: Star Breakdown progress bars */}
          <div className="lg:col-span-5 space-y-2.5 py-2">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = starCounts[stars as 5 | 4 | 3 | 2 | 1];
              const percent = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
              return (
                <div key={stars} className="flex items-center gap-3 text-xs font-semibold text-zinc-700">
                  <span className="w-12 text-zinc-600 font-bold whitespace-nowrap">{stars} Stars</span>
                  <div className="flex-1 h-3 bg-zinc-200/60 rounded-full overflow-hidden relative">
                    <div 
                      className="absolute left-0 top-0 h-full bg-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-zinc-500 font-bold">{percent}%</span>
                  <span className="text-[10px] text-zinc-400 font-bold">({count})</span>
                </div>
              );
            })}
          </div>

          {/* Right Column: Customer Photos grid preview */}
          <div className="lg:col-span-3 py-2 space-y-3">
            <h4 className="text-xs font-black uppercase text-zinc-800 tracking-wider">
              Customer Gallery ({customerPhotos.length})
            </h4>
            {customerPhotos.length === 0 ? (
              <p className="text-[11px] text-zinc-400 font-medium">No customer photos uploaded yet.</p>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {customerPhotos.slice(0, 8).map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setViewingImage(img)}
                    className="aspect-square bg-zinc-100 rounded border border-zinc-200 overflow-hidden relative group"
                  >
                    <img src={img} alt="review attachment" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                    {idx === 7 && customerPhotos.length > 8 && (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-white text-[9px] font-extrabold font-mono text-center">
                        +{customerPhotos.length - 8}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* REVIEW FILTERS (Daraz Stacked layout controls) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-5 mb-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <SlidersHorizontal className="w-4 h-4 text-zinc-500 shrink-0" />
            <span className="text-xs font-black uppercase text-zinc-500 tracking-wider mr-2">Filter By:</span>
            
            {(['Latest', 'Highest Rating', 'Lowest Rating', 'With Photos', 'Verified Reviews'] as FilterType[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-none text-[10px] font-bold uppercase tracking-wider transition-all border
                  ${activeFilter === filter 
                    ? 'bg-zinc-950 text-white border-zinc-950 shadow-sm' 
                    : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'}`}
              >
                {filter}
              </button>
            ))}
          </div>
          
          <div className="text-xs text-zinc-400 font-bold">
            Showing <span className="text-zinc-900">{filteredReviews.length}</span> of {totalReviews} reviews
          </div>
        </div>

        {/* REVIEWS DISPLAY LIST SYSTEM */}
        <div className="space-y-6">
          {filteredReviews.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-center bg-zinc-50 rounded-xl border border-zinc-200/80">
               <MessageSquare className="w-12 h-12 text-zinc-300 mb-4 animate-bounce" />
               <p className="text-zinc-500 font-bold text-sm tracking-wide">No reviews yet.</p>
               <p className="text-xs text-zinc-400 mt-1">Be the first to share your purchase reviews with the community!</p>
            </div>
          ) : (
            filteredReviews.map(review => {
              // Extract initials for the avatar bubble
              const displayName = review.anonymous ? 'Anonymous Customer' : review.customerName;
              const initials = displayName ? displayName.substring(0, 2).toUpperCase() : 'AC';
              
              // Verify video format if extension is standard video
              const isVideo = (url: string) => url.toLowerCase().endsWith('.mp4') || url.toLowerCase().includes('video');

              return (
                <motion.div 
                  key={review.reviewId} 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => navigate(`/product/${id}/reviews`)}
                  className="bg-white p-6 rounded-xl border border-zinc-200 shadow-[0_2px_12px_rgb(0,0,0,0.01)] hover:shadow-lg hover:border-zinc-400 transition-all cursor-pointer relative"
                >
                  {/* Pin status badge */}
                  {review.isPinned && (
                    <span className="absolute top-4 right-4 text-[8px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-2.5 py-1 rounded border border-amber-200/40 select-none">
                      📌 Pinned Review
                    </span>
                  )}

                  <div className="flex flex-col md:flex-row md:items-start gap-6">
                    {/* Customer Profile Column */}
                    <div className="flex md:flex-col items-center md:items-start gap-4 md:gap-2.5 md:w-44 shrink-0">
                      <div className="w-12 h-12 bg-zinc-900 border border-zinc-950 text-white rounded-full flex items-center justify-center text-sm font-black tracking-widest shadow-inner">
                        {initials}
                      </div>
                      
                      <div>
                        <h4 className="text-xs font-black text-zinc-900 flex items-center gap-1">
                          {displayName}
                        </h4>
                        
                        {review.verified && (
                          <div className="flex items-center gap-1 mt-1 text-[8px] font-extrabold text-emerald-600 uppercase tracking-wider bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">
                            <CheckCircle className="w-2.5 h-2.5" /> Verified Buyer
                          </div>
                        )}
                        
                        <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mt-1">
                          {new Date(review.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    {/* Review Specs & Media Column */}
                    <div className="flex-1 space-y-4">
                      
                      {/* Rating Stars */}
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star 
                            key={s} 
                            className={`w-4 h-4 ${
                              s <= review.rating 
                                ? 'fill-amber-500 text-amber-500' 
                                : 'fill-zinc-100 text-zinc-100 border-none'
                            }`} 
                          />
                        ))}
                      </div>

                      {/* Review Text */}
                      <p className="text-[13px] text-zinc-800 font-medium leading-relaxed select-text">
                        {review.reviewText}
                      </p>

                      {/* Display Uploaded Images or Videos inside specific Carousel */}
                      {review.mediaUrls && review.mediaUrls.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2.5 pt-2">
                          {review.mediaUrls.map((url, index) => {
                            if (isVideo(url)) {
                              return (
                                <div key={index} className="relative w-20 h-20 bg-zinc-950 border border-zinc-200 rounded-md overflow-hidden flex items-center justify-center text-white">
                                  <Video className="w-6 h-6 text-white" />
                                  <span className="absolute bottom-1 right-1 text-[7px] font-black uppercase bg-black text-white px-1">MP4</span>
                                </div>
                              );
                            }
                            return (
                              <button
                                key={index}
                                onClick={(e) => { e.stopPropagation(); setViewingImage(url); }}
                                className="w-20 h-20 rounded-md overflow-hidden border border-zinc-200/80 hover:border-zinc-500 transition-colors"
                              >
                                <img src={url} alt="user review media" className="w-full h-full object-cover rounded-md" referrerPolicy="no-referrer" />
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Brand Official Reply section inside bubble */}
                      {review.adminReply && (
                        <div className="mt-5 p-4 bg-zinc-100 text-zinc-900 border border-zinc-200/50 rounded-lg relative">
                           <div className="flex items-center gap-1.5 text-[8px] text-zinc-500 font-extrabold tracking-widest uppercase border-b border-zinc-200 pb-1 mt-0 mb-2 whitespace-nowrap">
                              <span className="w-3.5 h-3.5 bg-purple-600 text-white font-serif rounded-full flex items-center justify-center text-[7px] font-black shrink-0">T</span>
                              <span className="font-sans">TAZU MART BD</span>
                              <span className="text-[6.5px] bg-purple-950 text-purple-300 border border-purple-800/40 px-1 py-0.2 rounded font-black uppercase ml-auto">Official Response</span>
                           </div>
                           <p className="text-xs text-zinc-700 font-bold leading-relaxed">{review.adminReply}</p>
                        </div>
                      )}

                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {productReviews.length > 3 && (
          <div className="mt-12 flex justify-center">
            <button 
              onClick={() => navigate(`/product/${id}/reviews`)}
              className="px-8 py-4 bg-white border border-zinc-300 text-zinc-950 rounded-none text-xs font-bold uppercase tracking-widest hover:border-zinc-900 transition-all flex items-center gap-2 group"
            >
              See Detailed Review Page
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </div>

      {/* Write a review customer form modal overlay */}
      <AnimatePresence>
        {isReviewModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/65 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-xl rounded-none shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-zinc-200"
            >
              
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-white relative z-10">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-[#000000]">Post Product Review</h3>
                  <p className="text-[10px] text-zinc-400 font-bold mt-1 uppercase">Share your honest feedback on Tazu Mart</p>
                </div>
                <button 
                  onClick={() => !isSubmitting && setIsReviewModalOpen(false)}
                  disabled={isSubmitting}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 text-zinc-800 transition-colors focus:outline-none disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitReview} className="p-6 overflow-y-auto space-y-5">
                
                {validationError && (
                  <div className="bg-red-50 text-red-700 p-3 rounded-lg border border-red-200 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-650 inline-block animate-pulse shrink-0" />
                    <span className="flex-1">{validationError}</span>
                  </div>
                )}
                
                {/* Rating Selector */}
                <div className="flex flex-col items-center justify-center py-5 bg-zinc-50 border border-zinc-200/60 rounded-lg">
                  <span className="text-[9px] font-black text-zinc-400 bg-white px-3 py-1 border border-zinc-200 rounded-full uppercase tracking-widest mb-3">Overall Stars *</span>
                  <div className="flex gap-1.5">
                    {[1,2,3,4,5].map(s => (
                      <button
                        key={s}
                        type="button"
                        disabled={isSubmitting}
                        onMouseEnter={() => !isSubmitting && setHoveredStar(s)}
                        onMouseLeave={() => !isSubmitting && setHoveredStar(0)}
                        onClick={() => !isSubmitting && setRating(s)}
                        className="p-1.5 hover:scale-110 active:scale-95 transition-all text-amber-400 disabled:opacity-50"
                      >
                        <Star className={`w-8 h-8 ${
                          s <= (hoveredStar || rating) 
                            ? 'fill-amber-500 text-amber-500 drop-shadow-sm' 
                            : 'fill-zinc-200 text-zinc-200'
                        }`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Customer Block Info */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Full Name</label>
                  <input 
                    type="text" 
                    required={!anonymousToggle}
                    disabled={anonymousToggle || isSubmitting}
                    placeholder="Enter your name"
                    value={anonymousToggle ? 'Anonymous Customer' : customerName}
                    onChange={(e) => !anonymousToggle && setCustomerName(e.target.value)}
                    className={`w-full px-4 py-3 border border-zinc-200 rounded-md text-xs font-semibold placeholder-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-950/20 text-zinc-900 ${
                      anonymousToggle || isSubmitting ? 'bg-zinc-100 cursor-not-allowed text-zinc-500' : ''
                    }`}
                  />
                </div>

                {/* Review Text Area */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Review Experience</label>
                  <textarea 
                    required
                    rows={4}
                    disabled={isSubmitting}
                    placeholder="Write your detailed observations on sizing, delivery, colors, comfort..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="w-full px-4 py-3 border border-zinc-200 rounded-md text-xs font-bold placeholder-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-950/20 text-zinc-900 disabled:bg-zinc-50 disabled:text-zinc-500"
                  />
                </div>

                {/* IMAGE UPLOAD SECTION */}
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <label className="text-[11px] font-black text-zinc-950 uppercase tracking-widest flex items-center gap-1.5">
                      <span>🖼 REVIEWED PRODUCT IMAGE</span>
                    </label>
                    <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Max 5 Photos</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 font-semibold leading-none">
                    Upload product photos related to your review
                  </p>
                  <span className="text-[10px] text-zinc-400 font-bold block leading-none italic text-zinc-500">
                    “রিভিউকৃত প্রোডাক্টের ছবি আপলোড করুন”
                  </span>

                  <div className="mt-2">
                    <label className={`flex flex-col items-center justify-center border border-dashed border-zinc-350 bg-white hover:bg-zinc-50/50 hover:border-zinc-400 transition-all rounded-xl p-6 text-center h-40 ${isSubmitting || attachedMedia.length >= 5 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                      <input 
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        onChange={handleImageUploadChange}
                        className="hidden"
                        disabled={isSubmitting || attachedMedia.length >= 5}
                      />
                      <span className="w-9 h-9 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-800 border border-zinc-200/50 shadow-sm mb-2">
                        <Plus className="w-4 h-4 text-zinc-950" />
                      </span>
                      <p className="text-xs font-black text-zinc-950 uppercase tracking-wide">Tap to upload product images</p>
                      <p className="text-[10px] text-zinc-400 font-semibold mt-1">Supported formats: JPG, PNG, WEBP (Max 5)</p>
                    </label>
                  </div>

                  {/* Image gallery layout for uploaded images */}
                  {attachedMedia.length > 0 && (
                    <div className="flex items-center gap-2 overflow-x-auto py-2 px-1 scrollbar-thin scrollbar-thumb-zinc-200">
                      {attachedMedia.map((url, idx) => (
                        <div key={idx} className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden border border-zinc-200 bg-white group shadow-sm flex items-center justify-center">
                          <img src={url} alt="at" className="w-full h-full object-cover" />
                          <button 
                            type="button" 
                            disabled={isSubmitting}
                            onClick={() => handleRemoveMedia(idx)}
                            className="absolute top-1 right-1 bg-black/75 hover:bg-black text-white p-1 rounded-full transition-colors focus:outline-none disabled:opacity-50"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          <span className="absolute bottom-1 left-1.5 text-[8px] font-black uppercase bg-white/70 backdrop-blur-sm text-zinc-900 px-1 py-0.2 rounded">
                            Img {idx + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* VIDEO UPLOAD SECTION */}
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <label className="text-[11px] font-black text-zinc-950 uppercase tracking-widest flex items-center gap-1.5">
                      <span>🎥 REVIEW PRODUCT VIDEO</span>
                    </label>
                    <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Max 1 Video</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 font-semibold leading-none">
                    Upload a short review video of the product
                  </p>
                  <span className="text-[10px] text-zinc-400 font-bold block leading-none italic text-zinc-500">
                    “রিভিউকৃত প্রোডাক্টের ভিডিও আপলোড করুন”
                  </span>

                  <div className="mt-2">
                    <label className={`flex flex-col items-center justify-center border border-dashed border-zinc-350 bg-white hover:bg-zinc-50/50 hover:border-zinc-400 transition-all rounded-xl p-6 text-center h-40 ${isSubmitting || !!videoUrlInput ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                      <input 
                        type="file"
                        accept="video/mp4,video/quicktime,video/webm"
                        onChange={handleVideoUploadChange}
                        className="hidden"
                        disabled={isSubmitting || !!videoUrlInput}
                      />
                      <span className="w-9 h-9 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-800 border border-zinc-200/50 shadow-sm mb-2">
                        <Plus className="w-4 h-4 text-zinc-950" />
                      </span>
                      <p className="text-xs font-black text-zinc-950 uppercase tracking-wide">Tap to upload review video</p>
                      <p className="text-[10px] text-zinc-400 font-semibold mt-1">Supported formats: MP4, MOV, WEBM (Max 1)</p>
                    </label>
                  </div>

                  {/* Vertical video review 9:16 preview panel */}
                  {videoUrlInput && (
                    <div className="flex flex-col items-center justify-center bg-zinc-50 border border-zinc-200 rounded-xl p-4 mt-2">
                      <div className="relative w-full max-w-[180px] aspect-[9/16] bg-zinc-950 rounded-xl overflow-hidden shadow-lg border border-zinc-800">
                        <video 
                          src={videoUrlInput} 
                          controls 
                          playsInline 
                          className="w-full h-full object-cover" 
                        />
                        <button 
                          type="button" 
                          disabled={isSubmitting}
                          onClick={handleRemoveVideo}
                          className="absolute top-2 right-2 bg-black/75 hover:bg-black text-white p-1 rounded-full z-10 transition-colors focus:outline-none disabled:opacity-50"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        
                        {/* Absolute Center Play Button indicator to look extremely high fidelity */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/15">
                          <div className="w-10 h-10 rounded-full bg-white/25 backdrop-blur-sm border border-white/50 flex items-center justify-center text-white shadow-sm">
                            <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                          </div>
                        </div>

                        <div className="absolute bottom-2 left-2 z-10 bg-black/60 backdrop-blur-sm text-[8px] font-black uppercase text-amber-400 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <Video className="w-2.5 h-2.5 text-amber-400" />
                          <span>9:16 Vertical</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Toggles */}
                <div className="flex items-center justify-between gap-4 pt-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-zinc-700 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={verifiedToggle}
                      disabled={isSubmitting}
                      onChange={(e) => setVerifiedToggle(e.target.checked)}
                      className="w-4 h-4 accent-zinc-900 disabled:opacity-50"
                    />
                    <span>Verified Purchase</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-bold text-zinc-700 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={anonymousToggle}
                      disabled={isSubmitting}
                      onChange={(e) => setAnonymousToggle(e.target.checked)}
                      className="w-4 h-4 accent-zinc-900 disabled:opacity-50"
                    />
                    <span>Anonymously post</span>
                  </label>
                </div>

                <div className="pt-4 border-t border-zinc-100 flex justify-end gap-3">
                  <button 
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setIsReviewModalOpen(false)}
                    className="px-5 py-3 border border-zinc-200 rounded text-xs font-bold uppercase tracking-wider hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-zinc-950 text-white rounded text-xs font-black uppercase tracking-wider hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 min-w-[120px] disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <span>Post Review</span>
                    )}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Popup Modal Overlay */}
      <AnimatePresence>
        {isSuccessPopupOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-sm rounded-none shadow-2xl p-8 border border-zinc-200 text-center flex flex-col items-center justify-center space-y-6"
            >
              <motion.div 
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border border-emerald-200 shadow-sm"
              >
                <svg className="w-8 h-8 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </motion.div>

              <div className="space-y-2">
                <h4 className="text-base font-black text-zinc-950 uppercase tracking-tight">
                  Your review has been submitted successfully!
                </h4>
                <p className="text-xs text-zinc-500 font-bold leading-relaxed">
                  Thank you for sharing your feedback. <br />
                  Your review will appear in the Customer Ratings section after approval.
                </p>
              </div>

              <button
                onClick={() => setIsSuccessPopupOpen(false)}
                className="w-full py-3.5 bg-zinc-950 text-white hover:bg-zinc-800 rounded-none text-xs font-black uppercase tracking-widest transition-colors focus:outline-none shadow-md"
              >
                OK
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Viewing full image preview modal pop */}
      <AnimatePresence>
        {viewingImage && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md" onClick={() => setViewingImage(null)}>
             <button 
               className="absolute top-6 right-6 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors focus:outline-none"
               onClick={() => setViewingImage(null)}
             >
               <X className="w-5 h-5" />
             </button>
             <motion.img 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               src={viewingImage} 
               alt="Zoomed Review" 
               className="max-w-full max-h-[85vh] object-contain rounded-lg border border-zinc-700 shadow-2xl"
               onClick={e => e.stopPropagation()}
             />
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
