import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, TrendingUp, Star, 
  ShoppingBag, Sparkles, 
  Calendar, Gift, Percent,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

export default function OffersListing() {
  const categories = [
    { 
      id: 'featured', 
      label: 'Featured Offers', 
      icon: Sparkles, 
      color: 'text-purple-600', 
      bg: 'bg-purple-50',
      border: 'border-purple-100',
      hash: '#offer-featured'
    },
    { 
      id: 'flash-sale', 
      label: 'Flash Sale Offers', 
      icon: Zap, 
      color: 'text-red-600', 
      bg: 'bg-red-50', 
      border: 'border-red-100',
      hash: '#offer-flash-sale'
    },
    { 
      id: 'trending', 
      label: 'Limited Time Deals', 
      icon: Calendar, 
      color: 'text-orange-600', 
      bg: 'bg-orange-50', 
      border: 'border-orange-100',
      hash: '#offer-trending'
    },
    { 
      id: 'coupon', 
      label: 'Coupon Offers', 
      icon: Percent, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50', 
      border: 'border-blue-100',
      hash: '#offer-coupon'
    },
    { 
      id: 'campaigns', 
      label: 'Special Campaigns', 
      icon: Gift, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50', 
      border: 'border-emerald-100',
      hash: '#offer-campaigns'
    },
    { 
      id: 'seasonal', 
      label: 'Seasonal Offers', 
      icon: ShoppingBag, 
      color: 'text-indigo-600', 
      bg: 'bg-indigo-50', 
      border: 'border-indigo-100',
      hash: '#offer-seasonal'
    }
  ];

  return (
    <section id="offers-listing" className="py-6 bg-white border-b border-neutral-100">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-5">
           <div className="flex flex-col">
              <h2 className="text-sm font-black text-neutral-900 uppercase tracking-[0.2em]">Offers for you</h2>
              <div className="h-0.5 w-10 bg-black mt-1"></div>
           </div>
           <Link to="/offers" className="text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-black transition-colors flex items-center gap-1">
              Explore Hub <ArrowRight className="w-3 h-3" />
           </Link>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/offers${cat.hash}`}
              className={cn(
                "group flex flex-col items-center justify-center p-5 rounded-2xl border transition-all hover:shadow-lg hover:-translate-y-1 active:scale-95",
                cat.bg,
                cat.border
              )}
            >
              <div className={cn("p-2.5 rounded-xl bg-white shadow-sm mb-3 group-hover:scale-110 transition-transform", cat.color)}>
                <cat.icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-tight text-neutral-900 text-center">
                {cat.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
