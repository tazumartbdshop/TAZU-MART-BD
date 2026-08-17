import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, ArrowRight, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { campaignService, Campaign, Coupon } from '../../services/campaignService';
import toast from 'react-hot-toast';

export function StorefrontPopup() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<(Campaign & { products: string[], categories: string[], coupon?: Coupon })[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(6);

  useEffect(() => {
    // Check if the user has already seen the popup in this specific session.
    // We use sessionStorage so it persists during website navigation/refreshes,
    // but resets completely when the user leaves the site or closes the tab.
    const hasSeenInSession = sessionStorage.getItem('tazumart_campaigns_seen');
    if (!hasSeenInSession) {
      campaignService.getActiveCampaigns().then(data => {
        if (data.length > 0) {
          setCampaigns(data);
          setIsOpen(true);
        }
      }).catch(console.error);
    }
  }, []);

  const activeCampaign = campaigns[currentIndex];

  useEffect(() => {
    if (!isOpen || !activeCampaign) return;

    setTimeLeft(6);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleNext();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, currentIndex, activeCampaign]);

  const handleNext = () => {
    if (currentIndex < campaigns.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('tazumart_campaigns_seen', 'true');
  };

  const handleView = () => {
    if (!activeCampaign) return;
    const productId = activeCampaign.products?.[0] || activeCampaign.productIds?.[0];
    if (productId) {
      navigate(`/product/${productId}`);
    } else {
      navigate(`/campaign/${activeCampaign.id}`);
    }
    handleClose();
  };

  const handleCopyCoupon = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeCampaign?.coupon?.code) {
      navigator.clipboard.writeText(activeCampaign.coupon.code);
      setCopied(true);
      toast.success('Copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen || !activeCampaign) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden relative"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
          >
            <button 
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
              className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center bg-black/50 text-white rounded-full hover:bg-black/80 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="relative aspect-[3/2] w-full bg-slate-100 overflow-hidden">
              <img 
                src={activeCampaign.image_url} 
                alt={activeCampaign.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            
            <div className="p-6 flex flex-col items-center text-center space-y-4">
              <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 leading-tight">
                {activeCampaign.title}
              </h3>
              
              {activeCampaign.description && (
                <p className="text-sm text-slate-600 font-medium max-w-xs mx-auto line-clamp-2">
                  {activeCampaign.description}
                </p>
              )}
              
              {activeCampaign.coupon && activeCampaign.coupon.active && (
                <div className="w-full bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center justify-between mt-2">
                  <div className="flex flex-col items-start">
                    <span className="text-[10px] uppercase font-bold text-amber-600">Use Code</span>
                    <span className="font-mono font-black text-amber-900 text-sm">{activeCampaign.coupon.code}</span>
                  </div>
                  <button 
                    onClick={handleCopyCoupon}
                    className="h-8 px-3 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              )}
              
              <div className="w-full flex gap-2 pt-2">
                <button 
                  onClick={(e) => { e.stopPropagation(); handleNext(); }}
                  className="flex-1 h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold uppercase tracking-wider text-xs transition-colors"
                >
                  Skip ({timeLeft})
                </button>
                <button 
                  onClick={handleView}
                  className="flex-[2] h-11 bg-slate-950 hover:bg-black text-white rounded-xl font-black uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-md"
                >
                  View Offer
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
