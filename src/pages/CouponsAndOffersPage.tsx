import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Copy, Check, Gift, Ticket, Tag } from 'lucide-react';
import { motion } from 'motion/react';
import { campaignService, Campaign, Coupon } from '../services/campaignService';
import { useSettingsStore } from '../store/useSettingsStore';
import toast from 'react-hot-toast';

export default function CouponsAndOffersPage() {
  const navigate = useNavigate();
  const { settings } = useSettingsStore();
  const [campaigns, setCampaigns] = useState<(Campaign & { products: string[], categories: string[], coupon?: Coupon })[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCouponId, setCopiedCouponId] = useState<string | null>(null);

  const companyLogoFallback = settings.storeLogo || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=200';

  useEffect(() => {
    campaignService.getActiveCampaigns()
      .then(data => {
        // Sort sequentially by created_at (oldest first or newest first? Usually newest first is best, but user says "sequence order" "01 -> Campaign 1, 02 -> Campaign 2". Let's sort by created_at ascending)
        data.sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());
        setCampaigns(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleCopyCoupon = (id: string, code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCouponId(id);
    toast.success('Coupon Copied!');
    setTimeout(() => setCopiedCouponId(null), 2500);
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] pb-24 font-sans selection:bg-black selection:text-white">
      {/* Header */}
      <div className="bg-black text-white pt-10 pb-6 px-4 relative flex flex-col items-center justify-center text-center">
        <button 
          onClick={() => navigate('/')}
          className="absolute left-4 top-10 p-2 hover:bg-neutral-800 rounded-full transition-all cursor-pointer text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-black uppercase tracking-widest text-[#00E676] mb-1">
          ACTIVE OFFERS
        </h1>
        <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest leading-relaxed">
          Exclusive Discounts & Vouchers
        </p>
      </div>

      <div className="pt-6 px-3 sm:px-6 max-w-4xl mx-auto">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          </div>
        ) : campaigns.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {campaigns.map((campaign, index) => (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-square w-full bg-neutral-100 flex items-center justify-center overflow-hidden">
                    <img
                      src={campaign.image_url || companyLogoFallback}
                      alt={campaign.title}
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2 left-2 bg-black text-white text-[9px] font-black uppercase px-2 py-0.5 rounded shadow-sm">
                      Offer {String(index + 1).padStart(2, '0')}
                    </div>
                  </div>

                  <div className="p-3 sm:p-4 flex flex-col gap-2">
                    <div>
                      <h3 className="text-xs sm:text-sm font-black uppercase tracking-tight text-slate-900 line-clamp-1" title={campaign.title}>
                        {campaign.title}
                      </h3>
                      {campaign.description && (
                        <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5 line-clamp-2 leading-relaxed">
                          {campaign.description}
                        </p>
                      )}
                    </div>

                    {campaign.coupon && campaign.coupon.active && (
                      <div className="bg-amber-50 border border-amber-200 p-2 sm:p-2.5 rounded-lg flex items-center justify-between text-xs">
                        <div className="flex flex-col truncate pr-1">
                          <span className="text-[9px] uppercase font-bold text-amber-700 tracking-wider">
                            Code: <span className="font-mono font-black">{campaign.coupon.code}</span>
                          </span>
                          <span className="text-[9px] font-bold text-amber-600 uppercase">
                            {campaign.coupon.discount_type === 'Percentage' ? `${campaign.coupon.discount_value}% OFF` : `৳${campaign.coupon.discount_value} OFF`}
                          </span>
                        </div>
                        
                        <button
                          onClick={(e) => handleCopyCoupon(campaign.id, campaign.coupon!.code, e)}
                          className="bg-amber-100 hover:bg-amber-200 text-amber-900 px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-colors shrink-0 cursor-pointer"
                        >
                          {copiedCouponId === campaign.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-3 sm:p-4 pt-0">
                  <button
                    onClick={() => {
                      const productId = campaign.products?.[0] || campaign.productIds?.[0];
                      if (productId) {
                        navigate(`/product/${productId}`);
                      } else {
                        navigate(`/campaign/${campaign.id}`);
                      }
                    }}
                    className="w-full h-9 sm:h-10 bg-black hover:bg-neutral-800 text-white rounded-lg font-black uppercase tracking-widest text-[10px] sm:text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    View Offer
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 px-6 border border-gray-200 mt-4 bg-white rounded-xl">
            <Gift className="w-10 h-10 text-gray-300 mx-auto mb-4" />
            <h3 className="text-[12px] font-black uppercase tracking-widest text-gray-800">No Active Offers Available</h3>
            <p className="text-[10px] font-bold text-gray-500 uppercase mt-2">Please Check Back Later</p>
          </div>
        )}
      </div>
    </div>
  );
}
