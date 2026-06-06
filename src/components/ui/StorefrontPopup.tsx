import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Flame, Timer, Sparkles, AlertCircle } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePopupStore, getPopupStatus, PopupConfig } from '../../store/usePopupStore';
import { usePopupOfferStore } from '../../store/usePopupOfferStore';
import { useProductStore } from '../../store/useProductStore';

export function StorefrontPopup() {
  const { popupCampaigns } = usePopupStore();
  const { 
    popupOffers, incrementViews, incrementBuyNowClicks, incrementSkipClicks 
  } = usePopupOfferStore();
  const { products } = useProductStore();

  const [currentIdx, setCurrentIdx] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [completedCycles, setCompletedCycles] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const rotationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // New welcome popup state/logic
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const welcomedRef = useRef<string | null>(null);

  // Check category product context
  const pathMatch = location.pathname.match(/\/product\/([^/]+)/);
  let viewedProductCategory: string | null = null;
  if (pathMatch) {
    const viewedProductId = pathMatch[1];
    const viewedProduct = products.find(p => p?.id === viewedProductId);
    if (viewedProduct) {
      viewedProductCategory = viewedProduct.category;
    }
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const activeOffer = popupOffers.find(offer => {
    if (offer.status !== 'Published') return false;
    if (todayStr < offer.startDate || todayStr > offer.endDate) return false;
    
    // Category targeting condition
    if (offer.categoryId) {
      return viewedProductCategory === offer.categoryId;
    }
    return true;
  });

  const welcomeDismissed = sessionStorage.getItem('welcome_popup_offer_dismissed_session') === 'true';

  useEffect(() => {
    if (activeOffer && !welcomeDismissed) {
      setWelcomeOpen(true);
    } else {
      setWelcomeOpen(false);
    }
  }, [activeOffer, welcomeDismissed, location.pathname]);

  // Record views strictly once per active campaign session load
  useEffect(() => {
    if (welcomeOpen && activeOffer && welcomedRef.current !== activeOffer.id) {
      welcomedRef.current = activeOffer.id;
      incrementViews(activeOffer.id).catch(err => console.error(err));
    }
  }, [welcomeOpen, activeOffer]);



  // 1. Filter and prioritize popups
  // Priority: 1. Active (general), 2. Scheduled, 3. Expiring Soon (Ends in < 24 hrs)
  const getPriorityScore = (popup: PopupConfig) => {
    const status = getPopupStatus(popup);
    if (status === 'ACTIVE') {
      try {
        const now = new Date();
        const endDateTime = new Date(`${popup.endDate}T${popup.endTime}`);
        const hoursRemaining = (endDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
        if (hoursRemaining > 0 && hoursRemaining <= 24) {
          return 1; // Expiring soon (priority level 3 in instructions, we put it in list sorted)
        }
      } catch (e) {}
      return 3; // General Active (priority level 1)
    }
    if (status === 'SCHEDULED') return 2; // Scheduled (priority level 2)
    return 0; // Disabled / Expired
  };

  const eligiblePopups = popupCampaigns
    // Check main active status toggled by admin
    .filter(p => p.status === 'ACTIVE')
    // Router check: if it is homepage restricted, only show on home root
    .filter(p => !p.showOnlyHomepage || location.pathname === '/')
    // Priority order sorting specified: 1. Active Popup, 2. Scheduled Popup, 3. Expiring Soon
    .sort((a, b) => {
      const scoreA = getPriorityScore(a);
      const scoreB = getPriorityScore(b);
      return scoreB - scoreA;
    });

  const activePopup = eligiblePopups[currentIdx] as PopupConfig | undefined;

  // 2. Setup triggers (delayed, scroll-based, once-per-session checks)
  useEffect(() => {
    if (eligiblePopups.length === 0) {
      setIsOpen(false);
      return;
    }

    // Checking globally if user has dismissed the current session's popups
    const isDismissed = sessionStorage.getItem('luxemart_popup_dismissed_session') === 'true';
    if (isDismissed) {
      setIsOpen(false);
      return;
    }

    const firstPopup = eligiblePopups[0];
    
    // Check once per user session
    if (firstPopup.showOncePerUser) {
      const alreadyShown = sessionStorage.getItem(`luxemart_popup_shown_${firstPopup.id}`);
      if (alreadyShown) {
        setIsOpen(false);
        return;
      }
    }

    let startDelay: NodeJS.Timeout;

    if (firstPopup.showAfter3Seconds) {
      startDelay = setTimeout(() => {
        setIsOpen(true);
      }, 3000);
    } else if (firstPopup.showAfterScroll) {
      const handleScroll = () => {
        if (window.scrollY > 300 && !hasScrolled) {
          setHasScrolled(true);
          setIsOpen(true);
        }
      };
      window.addEventListener('scroll', handleScroll);
      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    } else {
      setIsOpen(true);
    }

    return () => {
      if (startDelay) clearTimeout(startDelay);
    };
  }, [eligiblePopups.length, location.pathname, hasScrolled]);

  // 3. Setup dynamic rotation timer
  useEffect(() => {
    if (!isOpen || eligiblePopups.length <= 1 || !activePopup) {
      if (rotationTimerRef.current) clearTimeout(rotationTimerRef.current);
      return;
    }

    const duration = (activePopup.displayDuration || 2) * 1000;

    rotationTimerRef.current = setTimeout(() => {
      // Dynamic fade / slide transition triggers index shift
      const nextIdx = currentIdx + 1;
      
      if (nextIdx >= eligiblePopups.length) {
        // We finished one entire cycle of all active popups
        // Auto Close mechanism: if sequence ends and customer didn't skip, close everything
        setIsOpen(false);
      } else {
        setCurrentIdx(nextIdx);
      }
    }, duration);

    return () => {
      if (rotationTimerRef.current) clearTimeout(rotationTimerRef.current);
    };
  }, [isOpen, currentIdx, eligiblePopups.length, activePopup]);

  const handleWelcomeClose = async () => {
    if (!activeOffer) return;
    setWelcomeOpen(false);
    sessionStorage.setItem('welcome_popup_offer_dismissed_session', 'true');
    await incrementSkipClicks(activeOffer.id).catch(err => console.error(err));
  };

  const handleWelcomeActionClick = async () => {
    if (!activeOffer) return;
    setWelcomeOpen(false);
    sessionStorage.setItem('welcome_popup_offer_dismissed_session', 'true');
    await incrementBuyNowClicks(activeOffer.id).catch(err => console.error(err));
    if (activeOffer.productId) {
      navigate(`/product/${activeOffer.productId}`);
    } else {
      navigate('/shop');
    }
  };

  if (welcomeOpen && activeOffer) {
    return (
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4">
          
          {/* Backdrop screen overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleWelcomeClose}
            className="absolute inset-0 bg-black/65 backdrop-blur-xs"
          />

          {/* Central Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 150 }}
            className="relative w-full max-w-[340px] sm:max-w-[370px] bg-white rounded-3xl overflow-hidden shadow-2xl border border-neutral-200/50 flex flex-col items-center z-10 p-0"
          >
            {/* Top Close (X) mark button overlay */}
            <button
              onClick={handleWelcomeClose}
              className="absolute top-2.5 right-2.5 z-30 bg-neutral-900/60 text-white hover:bg-neutral-900 duration-200 p-1.5 rounded-full cursor-pointer border border-white/10"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Fire header bar matching Daraz mega banner orange pattern */}
            <div className="w-full bg-[#f57224] py-2 px-4 text-center text-[10px] font-black tracking-widest text-white flex justify-center items-center gap-1.5 uppercase shrink-0 select-none">
              <Flame className="w-3.5 h-3.5 fill-white animate-bounce" /> {activeOffer.subtitle || 'MEGA SURPRISE SALE'}
            </div>

            {/* Banner image 1:1 Square display */}
            <div className="w-full aspect-square bg-neutral-50 overflow-hidden relative shrink-0 border-b border-neutral-100">
              <img 
                src={activeOffer.bannerUrl} 
                alt={activeOffer.title} 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Details Content text block */}
            <div className="p-5 text-center w-full bg-white select-none">
              <h2 className="font-sans font-black uppercase text-sm leading-tight tracking-tight text-neutral-900 mb-1">
                {activeOffer.title}
              </h2>

              {/* Daraz simulated Coupon voucher indicator */}
              <div className="bg-orange-50 text-[#f57224] font-black text-xs py-1.5 px-3.5 rounded-xl border border-dashed border-[#f57224] max-w-xs mx-auto my-3 flex flex-col items-center justify-center">
                <span className="text-[8px] font-bold text-neutral-800 tracking-wide uppercase">COUPON CODE HOOK</span>
                <span>{activeOffer.categoryId ? 'Category Targeted Surprise' : 'Welcome Storewide Deal'}</span>
              </div>

              <p className="text-neutral-550 text-xs font-semibold leading-relaxed max-w-[270px] mx-auto">
                {activeOffer.description}
              </p>
            </div>

            {/* Bottom Actions Buttons */}
            <div className="flex gap-3 px-5 pb-5 w-full shrink-0">
              {/* Secondary CTA Skip Deal */}
              <button
                onClick={handleWelcomeClose}
                className="flex-1 h-[44px] bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-200 rounded-2xl text-[10px] uppercase tracking-widest font-black transition-all cursor-pointer active:scale-95"
              >
                {activeOffer.secondaryButtonText}
              </button>

              {/* Primary CTA Buy Now */}
              <button
                onClick={handleWelcomeActionClick}
                className="flex-1 h-[44px] bg-[#EE0000] text-white rounded-2xl text-[10px] uppercase tracking-widest font-black transition-all shadow-md hover:bg-red-700 cursor-pointer active:scale-95 text-center flex items-center justify-center"
              >
                {activeOffer.primaryButtonText}
              </button>
            </div>

          </motion.div>

        </div>
      </AnimatePresence>
    );
  }

  if (!isOpen || !activePopup) return null;

  const calculatedStatus = getPopupStatus(activePopup);
  const isExpired = calculatedStatus === 'EXPIRED';
  const isScheduled = calculatedStatus === 'SCHEDULED';

  const handleClose = () => {
    // Stop rotation immediately
    if (rotationTimerRef.current) clearTimeout(rotationTimerRef.current);
    setIsOpen(false);
    
    // Save dismiss session temporarily so no further popups are shown during this session
    sessionStorage.setItem('luxemart_popup_dismissed_session', 'true');

    // Also flag individual if set
    if (activePopup.showOncePerUser) {
      sessionStorage.setItem(`luxemart_popup_shown_${activePopup.id}`, 'true');
    }
  };

  const handleActionClick = (url?: string) => {
    if (isExpired) return;
    
    // Close overlay on action click
    handleClose();

    // TARGET REDIRECT LOGIC with Priority: 1. Product, 2. Category, 3. Manual URL
    if (activePopup.selectedProducts && activePopup.selectedProducts.length > 0) {
      navigate(`/product/${activePopup.selectedProducts[0]}`);
    } else if (activePopup.selectedCategories && activePopup.selectedCategories.length > 0) {
      navigate(`/category/${activePopup.selectedCategories[0]}`);
    } else if (url) {
      if (url.startsWith('http')) {
        window.location.href = url;
      } else {
        navigate(url);
      }
    } else {
      navigate('/shop');
    }
  };

  // Animation variants mapped from popup settings
  const animationVariants = {
    'Fade In': {
      hidden: { opacity: 0, filter: 'blur(4px)' },
      visible: { opacity: 1, filter: 'blur(0px)', transition: { duration: 0.25 } },
      exit: { opacity: 0, filter: 'blur(4px)', transition: { duration: 0.2 } }
    },
    'Zoom In': {
      hidden: { opacity: 0, scale: 0.8 },
      visible: { opacity: 1, scale: 1, transition: { type: 'spring', damping: 20, stiffness: 140 } },
      exit: { opacity: 0, scale: 0.85, transition: { duration: 0.18 } }
    },
    'Slide Up': {
      hidden: { opacity: 0, y: 80, filter: 'blur(2px)' },
      visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: 'spring', damping: 22, stiffness: 120 } },
      exit: { opacity: 0, y: 60, transition: { duration: 0.18 } }
    },
    'Bounce': {
      hidden: { opacity: 0, scale: 0.5 },
      visible: { opacity: 1, scale: 1, transition: { type: 'spring', bounce: 0.45, duration: 0.45 } },
      exit: { opacity: 0, scale: 0.8, transition: { duration: 0.18 } }
    },
    'Scale Pop': {
      hidden: { opacity: 0, scale: 0.7, filter: 'blur(3px)' },
      visible: { opacity: 1, scale: 1.04, transition: { duration: 0.2, ease: 'easeOut' } },
      exit: { opacity: 0, scale: 0.9, transition: { duration: 0.16 } }
    },
    'Rotate Fade': {
      hidden: { opacity: 0, rotate: -10, scale: 0.9 },
      visible: { opacity: 1, rotate: 0, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
      exit: { opacity: 0, rotate: 8, scale: 0.92, transition: { duration: 0.18 } }
    }
  };

  const selectedAnimation = animationVariants[activePopup.entranceAnimation] || animationVariants['Fade In'];

  const buttonStyleClasses = {
    'solid-black': 'bg-black text-white hover:bg-neutral-900 border border-black',
    'solid-accent': 'bg-red-600 hover:bg-red-700 text-white border border-red-600',
    'luxury-gradient': 'bg-gradient-to-r from-amber-500 via-yellow-650 to-amber-700 text-white shadow-md hover:shadow-lg',
    'minimal-outline': 'bg-transparent text-black border-2 border-black hover:bg-black hover:text-white',
    'glass-translucent': 'bg-white/20 backdrop-blur-md text-white border border-white/40 hover:bg-white/30'
  };

  const btnClass = buttonStyleClasses[activePopup.buttonStyle] || buttonStyleClasses['luxury-gradient'];

  const renderTemplateContent = () => {
    switch (activePopup.templateId) {
      case '1': // Center Poster
        return (
          <div className="relative flex flex-col items-center">
            {activePopup.bannerUrl && (
              <div className="w-full h-44 sm:h-52 overflow-hidden relative">
                <img src={activePopup.bannerUrl} alt={activePopup.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              </div>
            )}
            <div className="p-6 text-center w-full">
              {activePopup.campaignValue && (
                <span className="text-[10px] bg-neutral-100 border border-neutral-200 text-neutral-800 font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-full mb-3 inline-flex items-center gap-1.5 justify-center mx-auto">
                  <Flame className="w-3 h-3 text-red-500 fill-red-500 animate-pulse" /> {activePopup.campaignValue}
                </span>
              )}
              <h2 className="font-serif font-black text-stone-900 leading-tight mb-2 uppercase break-words" style={{ fontSize: `${activePopup.titleFontSize}px` }}>
                {activePopup.title}
              </h2>
              {activePopup.discountPercentage && (
                <div className="text-red-650 font-extrabold text-2xl sm:text-3xl tracking-tight my-2">
                  {activePopup.discountPercentage} {activePopup.discountLabel}
                </div>
              )}
              <p className="text-zinc-500 text-xs font-bold tracking-wider uppercase" style={{ fontSize: `${activePopup.subtitleFontSize}px` }}>
                {activePopup.subtitle}
              </p>
            </div>
          </div>
        );

      case '2': // Side Teaser Compact
        return (
          <div className="flex flex-col p-5 text-center">
            <div className="flex items-center gap-3 justify-center mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{activePopup.campaignValue}</span>
            </div>
            {activePopup.bannerUrl && (
              <div className="w-full h-32 rounded-xl overflow-hidden mb-4">
                <img src={activePopup.bannerUrl} alt={activePopup.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            )}
            <h2 className="font-sans font-black text-black uppercase leading-tight tracking-tight mb-2" style={{ fontSize: `${activePopup.titleFontSize * 0.8}px` }}>
              {activePopup.title}
            </h2>
            <div className="text-neutral-900 font-extrabold text-xl mb-1">
              {activePopup.discountPercentage} <span className="text-stone-550 text-xs">{activePopup.discountLabel}</span>
            </div>
            <p className="text-gray-500 text-xs" style={{ fontSize: `${activePopup.subtitleFontSize}px` }}>
              {activePopup.subtitle}
            </p>
          </div>
        );

      case '3': // Rounded Circular
        return (
          <div className="p-6 text-center flex flex-col items-center justify-center h-full">
            {activePopup.bannerUrl && (
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-amber-500 p-0.5 mb-3">
                <img src={activePopup.bannerUrl} alt={activePopup.title} className="w-full h-full rounded-full object-cover" referrerPolicy="no-referrer" />
              </div>
            )}
            <span className="text-[8px] bg-amber-500 text-white font-extrabold uppercase px-2 py-0.5 rounded-full mb-1 inline-block">
              {activePopup.campaignValue}
            </span>
            <h2 className="font-serif font-black text-amber-950 uppercase leading-tight line-clamp-2 max-w-[220px] mb-1.5" style={{ fontSize: `${activePopup.titleFontSize * 0.65}px` }}>
              {activePopup.title}
            </h2>
            <div className="bg-amber-50 border border-amber-100 px-3 py-1 rounded-xl mb-2">
              <span className="text-amber-800 font-black text-xl">{activePopup.discountPercentage}</span>
              <span className="text-amber-600 font-bold text-[9px] uppercase tracking-wider block">{activePopup.discountLabel}</span>
            </div>
            <p className="text-amber-905 text-[10px] font-medium leading-tight max-w-[200px]" style={{ fontSize: `${activePopup.subtitleFontSize}px` }}>
              {activePopup.subtitle}
            </p>
          </div>
        );

      case '4': // Luxury Black Poster
        return (
          <div className="bg-neutral-950 text-[#D4AF37] relative overflow-hidden flex flex-col items-center border border-[#D4AF37]/35 w-full">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#D4AF37]"></div>
            {activePopup.bannerUrl && (
              <div className="w-full h-40 overflow-hidden relative grayscale opacity-70 contrast-125">
                <img src={activePopup.bannerUrl} alt={activePopup.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/30 to-transparent"></div>
              </div>
            )}
            <div className="p-6 text-center w-full z-10">
              <span className="text-[9px] border border-[#D4AF37] text-[#D4AF37] font-black uppercase tracking-[0.2em] px-3 py-1 mb-3 inline-block">
                ⚜️ {activePopup.campaignValue} ⚜️
              </span>
              <h2 className="font-serif font-bold uppercase tracking-wider mb-2 text-white" style={{ fontSize: `${activePopup.titleFontSize * 0.85}px` }}>
                {activePopup.title}
              </h2>
              <div className="text-[#D4AF37] font-serif font-bold text-3xl tracking-widest my-2 uppercase">
                {activePopup.discountPercentage} {activePopup.discountLabel}
              </div>
              <p className="text-neutral-450 text-xs tracking-widest uppercase" style={{ fontSize: `${activePopup.subtitleFontSize}px` }}>
                {activePopup.subtitle}
              </p>
            </div>
          </div>
        );

      case '5': // Glassmorphism layout
        return (
          <div className="bg-[#171717]/85 backdrop-blur-xl text-white border border-white/10 p-5 rounded-[24px] text-center flex flex-col items-center w-full">
            {activePopup.bannerUrl && (
              <div className="w-full h-32 rounded-xl overflow-hidden mb-3 relative border border-white/5">
                <img src={activePopup.bannerUrl} alt={activePopup.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-black/20"></div>
              </div>
            )}
            <span className="bg-white/10 text-white border border-white/15 text-[8.5px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full mb-2">
              ✨ {activePopup.campaignValue}
            </span>
            <h2 className="font-sans font-black uppercase leading-tight tracking-tight mb-2 text-white" style={{ fontSize: `${activePopup.titleFontSize * 0.8}px` }}>
              {activePopup.title}
            </h2>
            <div className="text-white font-extrabold text-2xl my-1.5">
              {activePopup.discountPercentage} <span className="text-white/60 text-sm uppercase font-bold">{activePopup.discountLabel}</span>
            </div>
            <p className="text-white/60 text-xs" style={{ fontSize: `${activePopup.subtitleFontSize}px` }}>
              {activePopup.subtitle}
            </p>
          </div>
        );

      case '6': // Festival style (Vibrant/Celebrate Border)
        return (
          <div className="bg-gradient-to-br from-indigo-900 to-slate-950 border-2 border-yellow-400 text-yellow-300 p-6 flex flex-col items-center text-center relative w-full">
            <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-yellow-400"></div>
            <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-yellow-400"></div>
            <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-yellow-400"></div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-yellow-400"></div>
            <div className="text-xl mb-1 animate-bounce">🎉</div>
            <span className="text-[9px] font-black text-yellow-400 tracking-wider uppercase mb-1">
              ★ {activePopup.campaignValue} ★
            </span>
            <h2 className="font-sans font-black tracking-wide text-white uppercase leading-tight mb-2" style={{ fontSize: `${activePopup.titleFontSize * 0.8}px` }}>
              {activePopup.title}
            </h2>
            <div className="text-yellow-450 font-extrabold text-2xl tracking-wide my-1.5 uppercase">
              {activePopup.discountPercentage} DISCOUNT!
            </div>
            <p className="text-indigo-200 text-xs uppercase" style={{ fontSize: `${activePopup.subtitleFontSize}px` }}>
              {activePopup.subtitle}
            </p>
          </div>
        );

      case '7': // Minimal Line Art
        return (
          <div className="bg-white p-5 border-2 border-black rounded-none text-left flex flex-col w-full">
            <div className="border-b border-black pb-2 mb-3.5 flex justify-between items-center">
              <span className="text-[9px] font-black text-black uppercase tracking-widest">{activePopup.campaignValue}</span>
              <span className="text-[9px] font-bold text-gray-400 font-mono">ID: {activePopup.id.substring(0, 8)}</span>
            </div>
            <h2 className="font-mono font-black text-black leading-tight uppercase mb-1 tracking-tight" style={{ fontSize: `${activePopup.titleFontSize * 0.75}px` }}>
              {activePopup.title}
            </h2>
            <div className="text-neutral-950 font-mono font-extrabold text-3xl my-2">
              -{activePopup.discountPercentage}
            </div>
            <p className="text-neutral-500 font-sans text-xs uppercase font-bold" style={{ fontSize: `${activePopup.subtitleFontSize}px` }}>
              * {activePopup.subtitle}
            </p>
          </div>
        );

      case '8': // Vaporwave Ambient Layout
        return (
          <div className="relative overflow-hidden p-6 text-center bg-neutral-900 border border-purple-500/20 text-white flex flex-col items-center w-full">
            {/* Ambient colorful gradients */}
            <div className="absolute -top-16 -left-16 w-36 h-36 bg-purple-500/15 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-16 -right-16 w-36 h-36 bg-cyan-500/15 rounded-full blur-3xl animate-pulse"></div>
            
            <span className="text-[9px] bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500 text-white font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full mb-2 inline-flex items-center gap-1.5 ring-2 ring-purple-500/15">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" /> {activePopup.campaignValue}
            </span>
            <h2 className="font-sans font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-white to-neutral-200 leading-tight mb-2" style={{ fontSize: `${activePopup.titleFontSize * 0.8}px` }}>
              {activePopup.title}
            </h2>
            <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-350 my-1">
              {activePopup.discountPercentage}
            </div>
            <p className="text-gray-400 text-[11px] uppercase tracking-wide" style={{ fontSize: `${activePopup.subtitleFontSize}px` }}>
              {activePopup.subtitle}
            </p>
          </div>
        );

      case '9': // Charcoal Glow
        return (
          <div className="bg-zinc-950 border border-zinc-900 text-white p-5 rounded-[20px] text-center flex flex-col items-center w-full">
            {activePopup.bannerUrl && (
              <div className="w-full h-32 rounded-lg overflow-hidden mb-3 border border-zinc-900">
                <img src={activePopup.bannerUrl} alt={activePopup.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            )}
            <span className="text-[8px] font-black tracking-widest text-cyan-400 uppercase border border-cyan-400/25 px-2 py-0.5 rounded mb-2">
              {activePopup.campaignValue}
            </span>
            <h2 className="font-serif font-bold tracking-tight text-white uppercase leading-tight mb-2" style={{ fontSize: `${activePopup.titleFontSize * 0.75}px` }}>
              {activePopup.title}
            </h2>
            <div className="text-cyan-400 font-sans font-black text-2xl my-1.5">
              {activePopup.discountPercentage} {activePopup.discountLabel}
            </div>
            <p className="text-zinc-400 text-[10px] uppercase font-bold" style={{ fontSize: `${activePopup.subtitleFontSize}px` }}>
              {activePopup.subtitle}
            </p>
          </div>
        );

      case '10': // Daraz Mega Fire
        return (
          <div className="bg-[#f57224] text-white overflow-hidden relative flex flex-col items-center w-full">
            <div className="w-full bg-neutral-900 py-1.5 px-3 text-center text-[10px] font-black tracking-wider text-white flex justify-center items-center gap-1.5 uppercase shrink-0">
              <Flame className="w-3.5 h-3.5 text-[#f57224] fill-[#f57224] animate-bounce" /> {activePopup.campaignValue || 'MEGA SALE'}
            </div>
            {activePopup.bannerUrl && (
              <div className="w-full h-36 overflow-hidden relative shrink-0">
                <img src={activePopup.bannerUrl} alt={activePopup.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            )}
            <div className="p-5 text-center w-full">
              <h2 className="font-sans font-black uppercase mb-1 leading-tight tracking-tight text-white" style={{ fontSize: `${activePopup.titleFontSize * 0.75}px` }}>
                {activePopup.title}
              </h2>
              <div className="bg-white text-[#f57224] font-black text-xl py-1 px-3 rounded-lg border border-dashed border-[#f57224] max-w-xs mx-auto my-2.5 flex flex-col items-center justify-center">
                <span className="text-[9px] font-bold text-neutral-800 tracking-wide">COUPON VOUCHER</span>
                <span>{activePopup.discountPercentage} SAVING</span>
              </div>
              <p className="text-white/95 text-[10px] font-black uppercase tracking-wider" style={{ fontSize: `${activePopup.subtitleFontSize}px` }}>
                {activePopup.subtitle}
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const isCentered = activePopup.templateId !== '2';

  return (
    <AnimatePresence>
      <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-4`}>
        
        {/* Semi-transparent dark overlay for background focus */}
        {activePopup.backgroundDarkOverlay && isCentered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={activePopup.clickOutsideToClose ? handleClose : undefined}
            className="absolute inset-0 bg-black/55 backdrop-blur-xs"
          />
        )}

        {/* The Interactive Pop-Up Container with unique exit/enter key mapping */}
        <div className="relative flex flex-col items-center max-w-[340px] sm:max-w-[390px] w-full z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePopup.id} // Changing popup ID automatically triggers transition anim!
              variants={selectedAnimation}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={`
                relative w-full 
                overflow-hidden shadow-2xl border border-neutral-200/50
                bg-white pointer-events-auto transition-all duration-300
                ${activePopup.templateId === '3' ? 'rounded-full max-w-[310px] sm:max-w-[340px] aspect-square flex flex-col justify-center' : ''}
                ${activePopup.templateId === '4' ? 'rounded-none border-2 border-[#D4AF37]' : ''}
                ${activePopup.templateId === '5' ? 'rounded-[24px]' : ''}
                ${activePopup.templateId === '7' ? 'rounded-none shadow-none border-2 border-black' : ''}
                ${activePopup.templateId === '9' ? 'rounded-[20px]' : ''}
                ${activePopup.templateId === '10' ? 'rounded-[14px]' : 'rounded-3xl'}
              `}
            >
              {/* Sequence micro pagination dots to showcase premium Daraz style rotation state */}
              {eligiblePopups.length > 1 && (
                <div className="absolute top-3.5 left-4 z-30 flex items-center gap-1 bg-black/40 backdrop-blur-xs py-1 px-2.5 rounded-full select-none text-[8px] font-bold text-white tracking-widest uppercase">
                  {eligiblePopups.map((p, pidx) => (
                    <span
                      key={p.id}
                      className={`h-1.5 rounded-full transition-all duration-300 ${pidx === currentIdx ? 'w-3 bg-white' : 'w-1.5 bg-white/40'}`}
                    />
                  ))}
                  <span className="ml-1 text-[7px] text-white/90">{currentIdx+1}/{eligiblePopups.length}</span>
                </div>
              )}

              {/* Template specific visuals placement */}
              {renderTemplateContent()}

              {/* Expiration visual block indicator */}
              {isExpired && (
                <div className="w-full bg-red-600 py-2.5 text-center text-[10px] font-black text-white flex justify-center items-center gap-1.5 sticky bottom-0 left-0 z-20">
                  <AlertCircle className="w-3.5 h-3.5" /> CODE EXPIRED / EXPIRED
                </div>
              )}
              {isScheduled && (
                <div className="w-full bg-amber-600 py-2.5 text-center text-[10px] font-black text-white flex justify-center items-center gap-1.5 sticky bottom-0 left-0 z-20 uppercase tracking-widest">
                  <Calendar className="w-3.5 h-3.5" /> Coming Soon
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* NEW GLOBAL ACTION BAR - 16px below popup */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-3 mt-4 w-full"
          >
            {/* CTA Button 1: Secondary (Luxury Yellow) */}
            <button
              onClick={() => handleActionClick(activePopup.secondaryButtonUrl)}
              className="flex-1 h-[48px] bg-[#FFD700] shadow-[0_0_15px_rgba(255,215,0,0.3)] hover:shadow-[0_0_25px_rgba(255,215,0,0.5)] rounded-[16px] text-black font-black text-[11px] px-3 uppercase tracking-widest active:scale-95 hover:scale-105 transition-all duration-300 flex items-center justify-center cursor-pointer"
            >
              {activePopup.secondaryButtonText || 'VIEW DEAL'}
            </button>

            {/* CTA Button 2: Primary (Premium Red) */}
            <button
              onClick={() => handleActionClick(activePopup.buttonUrl)}
              className="flex-1 h-[48px] bg-[#EE0000] shadow-[0_0_15px_rgba(238,0,0,0.3)] hover:shadow-[0_0_25px_rgba(238,0,0,0.5)] rounded-[16px] text-white font-black text-[11px] px-3 uppercase tracking-widest active:scale-95 hover:scale-105 transition-all duration-300 flex items-center justify-center cursor-pointer"
            >
              {activePopup.buttonText || 'SHOP NOW'}
            </button>

            {/* CTA Button 3: SKIP (Purple Gradient) */}
            <button
              onClick={handleClose}
              className="flex-1 h-[48px] bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 border border-white/20 backdrop-blur-md rounded-[16px] text-white font-black text-[11px] px-3 uppercase tracking-widest active:scale-95 hover:scale-105 transition-all duration-300 flex items-center justify-center cursor-pointer shadow-lg"
            >
              SKIP
            </button>
          </motion.div>

          {activePopup.endDate && !isExpired && (
            <div className="flex items-center gap-1 mt-3 justify-center text-[8.5px] font-bold text-gray-400/80 uppercase tracking-widest font-mono">
              <Timer className="w-3 h-3 text-red-500/60 fill-red-500/5" /> ENDS: {activePopup.endDate} • {activePopup.endTime}
            </div>
          )}
        </div>
      </div>
    </AnimatePresence>
  );
}
