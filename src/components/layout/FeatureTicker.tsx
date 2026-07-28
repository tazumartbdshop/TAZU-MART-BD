import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { 
  Truck, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  Gift, 
  Star, 
  Headphones 
} from 'lucide-react';
import { themeSettingsService } from '../../services/themeSettingsService';

const featureMessages = [
  {
    id: 1,
    icon: Truck,
    iconColor: 'text-blue-500',
    text: 'Fast Delivery Across Bangladesh',
    bnText: '🚚 দ্রুত হোম ডেলিভারি সারা বাংলাদেশে'
  },
  {
    id: 2,
    icon: ShieldCheck,
    iconColor: 'text-emerald-500',
    text: 'Secure Payment',
    bnText: '🔒 ১০০% নিরাপদ পেমেন্ট ও ক্যাশ অন ডেলিভারি'
  },
  {
    id: 3,
    icon: CheckCircle2,
    iconColor: 'text-indigo-500',
    text: 'Trusted Online Shop',
    bnText: '✅ বিশ্বস্ত ও নির্ভরযোগ্য অনলাইন শপ'
  },
  {
    id: 4,
    icon: Sparkles,
    iconColor: 'text-amber-500',
    text: '100% Authentic Products',
    bnText: '💯 ১০০% অরজিনাল ও প্রিমিয়াম প্রোডাক্ট'
  },
  {
    id: 5,
    icon: Gift,
    iconColor: 'text-rose-500',
    text: 'Best Deals Every Day',
    bnText: '🎁 প্রতিদিন সেরা ডিল ও অফার'
  },
  {
    id: 6,
    icon: Star,
    iconColor: 'text-yellow-500',
    text: 'Premium Quality Guaranteed',
    bnText: '⭐ প্রিমিয়াম কোয়ালিটি নিশ্চিতকরণ'
  },
  {
    id: 7,
    icon: Headphones,
    iconColor: 'text-cyan-500',
    text: 'Friendly Customer Support',
    bnText: '📞 ২৪/৭ বন্ধুত্বপূর্ণ কাস্টমার সাপোর্ট'
  }
];

export function FeatureTicker() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [themeMode, setThemeMode] = useState<'black' | 'white'>('white');

  useEffect(() => {
    themeSettingsService.getThemeMode().then((mode) => {
      setThemeMode(mode === 'black' ? 'black' : 'white');
    });

    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setThemeMode(customEvent.detail === 'black' ? 'black' : 'white');
      }
    };

    window.addEventListener('tazu-theme-mode-changed', handleThemeChange);
    return () => {
      window.removeEventListener('tazu-theme-mode-changed', handleThemeChange);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % featureMessages.length);
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  const isDark = themeMode === 'black';
  const currentFeature = featureMessages[currentIndex];
  const IconComponent = currentFeature.icon;

  return (
    <div className="w-full mt-4 sm:mt-5 mb-4 sm:mb-5 px-4 sm:px-6 lg:px-8">
      <div 
        className={`max-w-7xl mx-auto h-[48px] sm:h-[52px] rounded-xl border flex items-center justify-center overflow-hidden transition-colors duration-300 shadow-sm relative ${
          isDark 
            ? 'bg-[#0a0a0a] border-zinc-800 text-white' 
            : 'bg-white border-zinc-200 text-zinc-900'
        }`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentFeature.id}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center justify-center gap-2.5 sm:gap-3 px-4 text-center select-none"
          >
            <div className={`p-1.5 rounded-lg shrink-0 ${isDark ? 'bg-zinc-900/80' : 'bg-zinc-100/80'}`}>
              <IconComponent className={`w-4 h-4 sm:w-5 sm:h-5 ${currentFeature.iconColor}`} />
            </div>
            <span className={`text-xs sm:text-sm font-semibold tracking-wide ${isDark ? 'text-zinc-100' : 'text-zinc-800'}`}>
              {currentFeature.bnText}
            </span>
          </motion.div>
        </AnimatePresence>

        {/* Progress dots indicator */}
        <div className="absolute right-3 sm:right-6 hidden md:flex items-center gap-1 opacity-40">
          {featureMessages.map((_, idx) => (
            <span 
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex 
                  ? 'w-4 bg-emerald-500 opacity-100' 
                  : `w-1.5 ${isDark ? 'bg-zinc-700' : 'bg-zinc-300'}`
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
