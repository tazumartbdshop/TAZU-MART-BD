import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Flame, Timer } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePopupStore, getPopupStatus, PopupConfig } from '../../store/usePopupStore';
import { useProductStore } from '../../store/useProductStore';

export function StorefrontPopup() {
  const { popupCampaigns } = usePopupStore();
  const { products } = useProductStore();

  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const rotationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Check category product context for targeting
  const pathMatch = location.pathname.match(/\/product\/([^/]+)/);
  let viewedProductCategory: string | null = null;
  if (pathMatch) {
    const viewedProductId = pathMatch[1];
    const viewedProduct = products.find(p => p?.id === viewedProductId);
    if (viewedProduct) {
      viewedProductCategory = viewedProduct.category;
    }
  }

  // State to track dismissed popups across this session/visit to preserve sequential queue behavior
  const [dismissedPopupIds, setDismissedPopupIds] = useState<string[]>(() => {
    try {
      return JSON.parse(sessionStorage.getItem('tazumart_dismissed_popups') || '[]');
    } catch {
      return [];
    }
  });

  const markPopupAsDismissed = (id: string) => {
    const updated = [...dismissedPopupIds, id];
    setDismissedPopupIds(updated);
    sessionStorage.setItem('tazumart_dismissed_popups', JSON.stringify(updated));
  };

  // 1. Filter, prioritize, and sort active popups by displayOrder
  const eligiblePopups = popupCampaigns
    .filter(p => {
      // Must be ACTIVE based on scheduler or manually active
      const currentStatus = getPopupStatus(p);
      if (currentStatus !== 'ACTIVE') return false;

      // Must not be dismissed in this session
      if (dismissedPopupIds.includes(p.id)) return false;

      // Optional Homepage targeting check
      if (p.showOnlyHomepage && location.pathname !== '/') return false;

      // Optional category targeting check (if configured)
      if (p.selectedCategories && p.selectedCategories.length > 0) {
        if (!viewedProductCategory || !p.selectedCategories.includes(viewedProductCategory)) {
          // If product targeting is also set, let it check product id first
          const hasMatchingProduct = p.selectedProducts && p.selectedProducts.includes(pathMatch ? pathMatch[1] : '');
          if (!hasMatchingProduct) {
            return false;
          }
        }
      }

      return true;
    })
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  const activePopup = eligiblePopups[0] as PopupConfig | undefined;

  // 2. Setup triggers and status
  useEffect(() => {
    if (eligiblePopups.length > 0) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [eligiblePopups.length, location.pathname]);

  // 3. Setup dynamic rotation timer based on displayDuration
  useEffect(() => {
    if (!isOpen || !activePopup) {
      if (rotationTimerRef.current) clearTimeout(rotationTimerRef.current);
      return;
    }

    const duration = (activePopup.displayDuration || 3) * 1000;

    rotationTimerRef.current = setTimeout(() => {
      markPopupAsDismissed(activePopup.id);
    }, duration);

    return () => {
      if (rotationTimerRef.current) clearTimeout(rotationTimerRef.current);
    };
  }, [isOpen, activePopup?.id]);

  if (!isOpen || !activePopup) return null;

  const handleCampaignActionClick = () => {
    markPopupAsDismissed(activePopup.id);
    setIsOpen(false);

    // TARGET REDIRECT LOGIC with Priority: 1. Product, 2. Category, 3. Manual URL
    if (activePopup.selectedProducts && activePopup.selectedProducts.length > 0) {
      navigate(`/product/${activePopup.selectedProducts[0]}`);
    } else if (activePopup.selectedCategories && activePopup.selectedCategories.length > 0) {
      navigate(`/category/${activePopup.selectedCategories[0]}`);
    } else if (activePopup.buttonUrl) {
      if (activePopup.buttonUrl.startsWith('http')) {
        window.location.href = activePopup.buttonUrl;
      } else {
        navigate(activePopup.buttonUrl);
      }
    } else {
      navigate('/shop');
    }
  };

  // Dynamic Button Style Mapper
  const buttonStyleClasses = {
    'solid-black': 'bg-black text-white hover:bg-neutral-900 border-transparent',
    'solid-accent': 'bg-red-650 text-white hover:bg-red-700 border-transparent',
    'luxury-gradient': 'bg-gradient-to-r from-amber-500 to-amber-700 text-white hover:from-amber-600 hover:to-amber-800 border-transparent',
    'minimal-outline': 'bg-transparent text-black border-black border-2 hover:bg-black hover:text-white',
    'glass-translucent': 'bg-neutral-800 text-white border-neutral-700 hover:bg-neutral-900'
  };

  const activeBtnClass = buttonStyleClasses[activePopup.buttonStyle] || buttonStyleClasses['luxury-gradient'];

  // Motion Variants
  const entranceAnimations = {
    'Fade In': { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
    'Zoom In': { initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.8 } },
    'Slide Up': { initial: { opacity: 0, y: 50 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 50 } },
    'Bounce': { initial: { opacity: 0, scale: 0.3 }, animate: { opacity: 1, scale: 1.05 }, exit: { opacity: 0, scale: 0.3 } },
    'Scale Pop': { initial: { opacity: 0, scale: 0.9, y: 10 }, animate: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.9, y: 10 } },
    'Rotate Fade': { initial: { opacity: 0, rotate: -3 }, animate: { opacity: 1, rotate: 0 }, exit: { opacity: 0, rotate: -3 } }
  };

  const anim = entranceAnimations[activePopup.entranceAnimation] || entranceAnimations['Scale Pop'];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        
        {/* Backdrop (Respect setting: backgroundDarkOverlay) */}
        {activePopup.backgroundDarkOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => activePopup.clickOutsideToClose && markPopupAsDismissed(activePopup.id)}
            className="absolute inset-0 bg-black/45 backdrop-blur-[1px]"
          />
        )}

        {/* Dynamic centered floating model container: 30%-35% width (max-w-[340px] to max-w-[360px]) */}
        <motion.div
           initial={anim.initial}
           animate={anim.animate}
           exit={anim.exit}
           transition={{ type: 'spring', damping: 25, stiffness: 180 }}
           className="relative w-full max-w-[340px] md:max-w-[360px] bg-white rounded-2xl overflow-hidden shadow-2xl border border-neutral-200/50 flex flex-col z-10 p-0 pointer-events-auto"
        >
          {/* Close (X) button at top-right corner */}
          {activePopup.closeButtonVisible && (
            <button
              onClick={() => markPopupAsDismissed(activePopup.id)}
              className="absolute top-2.5 right-2.5 z-30 bg-neutral-900/65 text-white hover:bg-neutral-950 duration-200 p-1.5 rounded-full cursor-pointer border border-white/10"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Banner Image portion */}
          {activePopup.bannerUrl && (
            <div className="w-full aspect-[16/10] bg-neutral-50 overflow-hidden relative shrink-0">
              <img 
                src={activePopup.bannerUrl} 
                alt={activePopup.title} 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-2 left-2 bg-black/45 backdrop-blur-xs text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-md flex items-center gap-1">
                <Flame className="w-2.5 h-2.5 text-orange-500 fill-orange-500" /> Display #{activePopup.displayOrder || 1}
              </div>
              <div className="absolute top-2 right-12 bg-[#f57224] text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-md flex items-center gap-1">
                <Timer className="w-2.5 h-2.5 text-white" /> {activePopup.displayDuration || 3}s
              </div>
            </div>
          )}

          {/* Details & CTA Segment */}
          <div className="p-5 text-center w-full bg-white flex flex-col items-center select-none">
            {/* Title */}
            <h3 className="font-sans font-black uppercase text-xs sm:text-xs leading-snug tracking-wider text-neutral-800 mb-1.5 px-1 line-clamp-2">
              {activePopup.title}
            </h3>
            
            {/* Description (subtitle field) */}
            <p className="text-neutral-550 text-[11px] font-semibold leading-relaxed max-w-[270px] mx-auto mb-4 line-clamp-2">
              {activePopup.subtitle || activePopup.discountLabel || 'Exquisite deal just for you'}
            </p>

            {/* Bottom Actions Row */}
            <div className="flex gap-2.5 w-full shrink-0">
              {/* Skip Button */}
              <button
                onClick={() => markPopupAsDismissed(activePopup.id)}
                className="flex-1 h-9 bg-neutral-100 hover:bg-neutral-200 text-neutral-750 border border-neutral-200/80 rounded-xl text-[10px] uppercase tracking-widest font-black transition-all cursor-pointer active:scale-95"
              >
                Skip
              </button>

              {/* View Offer CTA */}
              <button
                onClick={handleCampaignActionClick}
                className={`flex-1 h-9 rounded-xl text-[10px] uppercase tracking-widest font-black transition-all shadow-md cursor-pointer active:scale-95 text-center flex items-center justify-center ${activeBtnClass}`}
              >
                {activePopup.buttonText || 'View Offer'}
              </button>
            </div>
          </div>

        </motion.div>

      </div>
    </AnimatePresence>
  );
}
