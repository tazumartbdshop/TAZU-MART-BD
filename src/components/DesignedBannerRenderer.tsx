import React, { useState, useEffect } from 'react';
import { ArrowRight, Clock } from 'lucide-react';
import { Banner } from '../store/useBannerStore';
import { Link } from 'react-router-dom';

function isNumericOrId(text: string | null | undefined): boolean {
  if (!text) return false;
  const t = text.trim();
  // If it's purely numbers e.g. "1000049033" or "1000050220"
  if (/^\d+$/.test(t)) return true;
  // If it has standard database/banner prefix like ban_
  if (/^ban_/.test(t)) return true;
  // If it's a UUID or DB ID pattern
  if (/^[0-9a-fA-F-]{8,}$/.test(t)) return true;
  // If it looks like a filename, e.g., contains file extension
  if (/\.(jpg|jpeg|png|gif|webp)$/i.test(t)) return true;
  return false;
}

interface DesignedBannerRendererProps {
  banner: Banner;
  isDemo?: boolean; // If true, ignores navigation and prevents clicks in the creator preview
}

// Client-side ticking countdown component to prevent infinite store re-renders
function LocalCountdown({ targetDate, textColor }: { targetDate: string; textColor?: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTime = () => {
      const difference = +new Date(targetDate) - +new Date();
      if (difference <= 0) {
        setIsExpired(true);
        return;
      }
      setIsExpired(false);
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (isExpired) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-600 text-white text-[9px] md:text-xs font-black uppercase tracking-widest border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
        <Clock className="w-3 h-3 text-white stroke-[2.5]" />
        Offer Expired
      </div>
    );
  }

  const formatNum = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="flex items-center gap-1 md:gap-2 select-none" style={{ color: textColor || '#ffffff' }}>
      <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md border border-white/20 px-1.5 py-1 md:px-2 md:py-1.5 rounded-none shadow-sm text-center">
        <span className="font-mono text-[9px] md:text-sm font-black tracking-tight">{formatNum(timeLeft.days)}</span>
        <span className="text-[7px] md:text-[8px] font-bold text-gray-300 uppercase tracking-widest block">D</span>
      </div>
      <span className="font-mono text-xs md:text-sm font-black opacity-80 colon-sep animate-pulse">:</span>
      <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md border border-white/20 px-1.5 py-1 md:px-2 md:py-1.5 rounded-none shadow-sm text-center">
        <span className="font-mono text-[9px] md:text-sm font-black tracking-tight">{formatNum(timeLeft.hours)}</span>
        <span className="text-[7px] md:text-[8px] font-bold text-gray-300 uppercase tracking-widest block">H</span>
      </div>
      <span className="font-mono text-xs md:text-sm font-black opacity-80 colon-sep animate-pulse">:</span>
      <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md border border-white/20 px-1.5 py-1 md:px-2 md:py-1.5 rounded-none shadow-sm text-center">
        <span className="font-mono text-[9px] md:text-sm font-black tracking-tight">{formatNum(timeLeft.minutes)}</span>
        <span className="text-[7px] md:text-[8px] font-bold text-gray-300 uppercase tracking-widest block">M</span>
      </div>
      <span className="font-mono text-xs md:text-sm font-black opacity-80 colon-sep animate-pulse">:</span>
      <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md border border-white/20 px-1.5 py-1 md:px-2 md:py-1.5 rounded-none shadow-sm text-center">
        <span className="font-mono text-[9px] md:text-sm font-black tracking-tight">{formatNum(timeLeft.seconds)}</span>
        <span className="text-[7px] md:text-[8px] font-bold text-gray-300 uppercase tracking-widest block">S</span>
      </div>
    </div>
  );
}

export default function DesignedBannerRenderer({ banner, isDemo = false }: DesignedBannerRendererProps) {
  if (banner.bannerType === 'uploaded') {
    return (
      <div className="relative w-full h-full overflow-hidden bg-neutral-950 flex items-center justify-center">
        {banner.image ? (
          <img 
            src={banner.image} 
            alt={banner.name || "Campaign Banner"} 
            className="w-full h-full object-cover select-none pointer-events-none"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-mono uppercase bg-neutral-900 text-zinc-500">
            No uploaded graphic loaded
          </div>
        )}
      </div>
    );
  }

  // Extract custom designed elements
  const {
    name = '',
    description = '',
    offerText = '',
    discountText = '',
    backgroundColor = '#1e1b4b',
    backgroundGradient = '#312e81',
    isGradient = false,
    textColor = '#ffffff',
    buttonColor = '#fbbf24',
    buttonTextColor = '#111111',
    borderColor = '#312e81',
    fontFamily = 'sans',
    fontSize = '3xl',
    fontWeight = 'bold',
    italic = false,
    alignment = 'center',
    logoImage,
    productImage,
    stickerType = 'none',
    stickerText = 'SALE',
    countdownEnabled = false,
    countdownDate,
    buttonEnabled = false,
    buttonText = 'Shop Now',
    buttonLink = '',
    connectedProductId
  } = banner;

  // Compute background inline style
  const bgStyle: React.CSSProperties = isGradient
    ? { backgroundImage: `linear-gradient(135deg, ${backgroundColor}, ${backgroundGradient})` }
    : { backgroundColor };

  // Determine alignment styling classes
  const alignmentClass = 
    alignment === 'left' ? 'text-left items-start' : 
    alignment === 'right' ? 'text-right items-end' : 
    'text-center items-center';

  const flexAlignment =
    alignment === 'left' ? 'justify-start' : 
    alignment === 'right' ? 'justify-end' : 
    'justify-center';

  // Font family helper
  const getFontFamilyClass = () => {
    switch (fontFamily) {
      case 'mono':
        return 'font-mono tracking-tight';
      case 'serif':
        return 'font-serif';
      case 'display':
        return 'font-black tracking-tight uppercase';
      default:
        return 'font-sans tracking-tight';
    }
  };

  const getHeaderSizeClass = () => {
    switch (fontSize) {
      case 'base': return 'text-[3.5vw] md:text-lg lg:text-xl';
      case 'lg': return 'text-[4vw] md:text-xl lg:text-3xl';
      case 'xl': return 'text-[4.5vw] md:text-2xl lg:text-4xl';
      case '2xl': return 'text-[5.5vw] md:text-3xl lg:text-5xl';
      case '3xl': return 'text-[6.5vw] md:text-4xl lg:text-6xl';
      case '4xl': return 'text-[7.5vw] md:text-5xl lg:text-7xl';
      default: return 'text-[6.5vw] md:text-4xl lg:text-6xl';
    }
  };

  const getWeightClass = () => {
    switch (fontWeight) {
      case 'normal': return 'font-normal';
      case 'medium': return 'font-medium';
      case 'bold': return 'font-bold';
      case 'black': return 'font-black';
      default: return 'font-bold';
    }
  };

  // Click handler wrapper for dynamic redirects
  const linkTarget = connectedProductId ? `/product/${connectedProductId}` : (buttonLink || '/shop');

  // Standard Button Element used in designed layouts
  const renderedButton = (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 border-2 hover:opacity-90 shadow-md font-mono shrink-0 py-1.5 px-3 md:py-3.5 md:px-8 text-[9px] md:text-xs font-black uppercase tracking-widest"
      style={{
        backgroundColor: buttonColor || '#fbbf24',
        color: buttonTextColor || '#111111',
        borderColor: borderColor || '#000000',
      }}
    >
      <span>{buttonText}</span>
      <ArrowRight className="w-3 h-3 md:w-3.5 md:h-3.5 stroke-[2.5]" />
    </button>
  );

  // Sticker badge layout content
  const renderedStickerBadge = stickerType !== 'none' && (
    <div 
      className="absolute right-5 top-5 md:right-10 md:top-10 rotate-12 z-20 flex flex-col items-center justify-center bg-yellow-400 text-black border-2 border-black rounded-full shrink-0 shadow-lg animate-pulse select-none
                 w-14 h-14 md:w-20 md:h-20"
      style={{ fontFamily: 'monospace' }}
    >
      <span className="text-[7px] md:text-[9px] font-black tracking-widest text-[#111111] uppercase leading-none">
        {stickerType === 'percent' ? 'FLASH' : stickerType.toUpperCase()}
      </span>
      <span className="text-[9px] md:text-sm font-extrabold uppercase leading-none tracking-tighter text-zinc-950">
        {stickerText && stickerText.length <= 10 ? stickerText : 'HOT'}
      </span>
    </div>
  );

  // Layout Container block for grid alignment
  return (
    <div 
      className={`relative w-full h-full overflow-hidden flex items-center p-6 md:p-12 lg:p-16 select-none bg-cover bg-center transition-all ${getFontFamilyClass()}`}
      style={bgStyle}
    >
      {/* Background visual geometric accents */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-44 h-44 bg-white/5 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-black/10 rounded-full blur-3xl pointer-events-none" />

      {/* 1. Dynamic Logo Image Element inside designed slide */}
      {logoImage && (
        <img 
          src={logoImage} 
          alt="Brand Logo Overlay" 
          className="absolute top-3 left-4 md:top-6 md:left-10 max-h-[22px] md:max-h-[38px] object-contain z-20 filter drop-shadow-sm select-none pointer-events-none"
          referrerPolicy="no-referrer"
        />
      )}

      {/* 2. Visual Sticker Badge */}
      {renderedStickerBadge}

      {/* Split Grid Interface Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center w-full relative z-10">
        
        {/* Left Side: Parameters Typography Text Column (Takes up 7 or 8 columns on desktop) */}
        <div className={`col-span-1 md:col-span-8 flex flex-col justify-center gap-2 md:gap-4 ${alignmentClass}`}>
          
          {/* Dynamic Small Offer Header Badge text */}
          {offerText && !isNumericOrId(offerText) && (
            <span 
              className="inline-block px-2.5 py-1 text-[8px] md:text-[10px] font-black uppercase tracking-widest border border-dashed text-opacity-95 select-none"
              style={{
                borderColor: textColor || '#ffffff',
                color: textColor || '#ffffff'
              }}
            >
              🚀 {offerText}
            </span>
          )}

          {/* Core Mega Discount Label Text */}
          {discountText && !isNumericOrId(discountText) && (
            <p 
              className="text-xs md:text-sm font-mono tracking-widest uppercase font-black"
              style={{ color: buttonColor || '#fbbf24' }}
            >
              💥 {discountText}
            💥</p>
          )}

          {/* Primary Header/Title Text */}
          {name && !isNumericOrId(name) && (
            <h2 
              className={`${getHeaderSizeClass()} ${getWeightClass()} leading-[1.1] text-balance select-none`}
              style={{ 
                color: textColor || '#ffffff',
                fontStyle: italic ? 'italic' : 'normal'
              }}
            >
              {name}
            </h2>
          )}

          {/* Subtitle / Description Text */}
          {description && !isNumericOrId(description) && (
            <p 
              className="text-[9px] md:text-sm max-w-[85%] md:max-w-[75%] leading-relaxed opacity-90 select-none font-medium"
              style={{ 
                color: textColor || '#ffffff',
                textAlign: alignment
              }}
            >
              {description}
            </p>
          )}

          {/* Dynamic Tick Countdown FOMO module */}
          {countdownEnabled && countdownDate && (
            <div className="pt-2">
              <p className="text-[7.5px] md:text-[9px] font-black uppercase tracking-widest opacity-75 mb-1.5 select-none" style={{ color: textColor || '#ffffff' }}>
                ⌛ Limited campaign ends soon in:
              </p>
              <LocalCountdown targetDate={countdownDate} textColor={textColor} />
            </div>
          )}

          {/* Dynamic Button element Overlay */}
          {/* Removed CTA button inside the specific banner card frame */}

        </div>

        {/* Right Side: Floating Product Silhouette / Featured graphics (Takes up 4 columns on desktop) */}
        {productImage && (
          <div className="hidden md:flex md:col-span-4 justify-center items-center relative select-none">
            <div className="absolute inset-0 bg-black/10 rounded-full blur-xl scale-75 animate-pulse" />
            <div className="relative border-4 border-black/15 bg-white/5 p-3 backdrop-blur-xs shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-300 max-w-[210px] md:max-w-[280px]">
              <img 
                src={productImage} 
                alt="Product Showcase overlay" 
                className="w-full h-auto object-contain hover:scale-105 transition-transform duration-300 select-none pointer-events-none drop-shadow-xl"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-2 -left-2 bg-black text-white px-2 py-0.5 text-[7px] font-mono font-bold uppercase tracking-widest">
                FEATURED
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
