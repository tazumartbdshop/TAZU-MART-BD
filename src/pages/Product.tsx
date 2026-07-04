import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft, Share2, Heart, Star, Minus, Plus, 
  ShieldCheck, Truck, RotateCcw, Box, Eye, Flame, 
  ChevronLeft, ChevronRight, CheckCircle2, ShoppingBag, 
  Info, Sparkles, Loader2, ArrowRight, Coins, Play
} from 'lucide-react';
import { formatPrice } from '../lib/utils';
import { useCartStore } from '../store/useCartStore';
import { useProductStore } from '../store/useProductStore';
import { useOfferStore } from '../store/useOfferStore';
import { getProductDiscountDetails } from '../lib/offerUtils';
import { useRecentlyViewedStore } from '../store/useRecentlyViewedStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { useReviewStore } from '../store/useReviewStore';
import ProductCard from '../components/ui/ProductCard';
import ProductReviews from '../components/product/ProductReviews';
import BannerSlider from '../components/common/BannerSlider';
import { pixelService } from '../utils/pixelService';

const ALL_FALLBACK_PRODUCTS = [
  {
    id: 'f-1',
    name: 'Luxury Skeleton Automatic Dark Watch',
    sku: 'ACC-W091-BD1',
    category: 'Watches',
    price: 8500,
    discountPrice: 6500,
    stock: 12,
    image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=600',
    imageUrl: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=600',
    featured_image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=600',
    images: [
      'https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=600',
      'https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=600',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=600'
    ],
    rating: 4.9,
    reviews: 380,
    isNew: true,
    brand: 'Tazu Executive',
    status: 'active',
    description: 'Designed for the bold, this Skeleton automatic winding timepiece showcases a sophisticated mechanical watch face inside a premium stealth-coated casing. Finished with a breathable genuine leather wrap.',
    createdAt: Date.now(),
    soldCount: 380,
    reward_coins: 250,
    coin_enabled: true,
    seoPoints: ['Automatic Winding Mechanism', 'Stealth-Coated Premium Casing', 'Genuine Leather Wrap/Strap']
  },
  {
    id: 'f-2',
    name: 'Vintage Full-Grain Finished Leather Wallet',
    sku: 'ACC-W091-BD2',
    category: 'Wallets',
    price: 3400,
    discountPrice: 2450,
    stock: 24,
    image: 'https://images.unsplash.com/photo-1627124118303-19d4f0735f5e?q=80&w=600',
    imageUrl: 'https://images.unsplash.com/photo-1627124118303-19d4f0735f5e?q=80&w=600',
    featured_image: 'https://images.unsplash.com/photo-1627124118303-19d4f0735f5e?q=80&w=600',
    images: [
      'https://images.unsplash.com/photo-1627124118303-19d4f0735f5e?q=80&w=600',
      'https://images.unsplash.com/photo-1588444839799-eaa4344ecc1e?q=80&w=600'
    ],
    rating: 4.8,
    reviews: 220,
    isNew: true,
    brand: 'Calf & Tannery',
    status: 'active',
    description: 'Handcrafted using selected full-grain vegetable-tanned bovine hide, this wallet matures beautifully with an exquisite patina. Organized layout with multiple cash channels and quick-access cards slot.',
    createdAt: Date.now(),
    soldCount: 220,
    reward_coins: 150,
    coin_enabled: true,
    seoPoints: ['100% Vegetable-Tanned Genuine Leather', 'Extremely durable handcrafted stitch', 'Intelligent multi-pocket card layout']
  },
  {
    id: 'f-3',
    name: 'Classic Silver Chronometer Executive',
    sku: 'ACC-W091-BD3',
    category: 'Watches',
    price: 12000,
    discountPrice: 9800,
    stock: 8,
    image: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=600',
    imageUrl: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=600',
    featured_image: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=600',
    images: [
      'https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=600',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=600'
    ],
    rating: 5.0,
    reviews: 150,
    isNew: false,
    brand: 'Tazu Chrono',
    status: 'active',
    description: 'Classic brushed silver styling featuring premium Japanese-engineered multi-function chronograph movement. High structural resistance sapphire crystal glass ensures absolute dust and water sealing.',
    createdAt: Date.now(),
    soldCount: 150,
    reward_coins: 300,
    coin_enabled: true,
    seoPoints: ['Japanese-Engineered Chronograph Move', 'Heavy Brushed Silver Casing', 'Sapphire Glass Resistance']
  },
  {
    id: 'f-4',
    name: 'Gold Dial Luxury Royal Heritage mechanical',
    sku: 'ACC-W091-BD4',
    category: 'Watches',
    price: 15500,
    discountPrice: 13500,
    stock: 5,
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=600',
    imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=600',
    featured_image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=600',
    images: [
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=600',
      'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=600'
    ],
    rating: 4.9,
    reviews: 95,
    isNew: true,
    brand: 'Royal Heritage',
    status: 'active',
    description: 'Immersive premium legacy mechanical hand-winding timepiece showcasing an intricate golden dial with complex Roman numerals. A genuine hallmark of classical executive lineage.',
    createdAt: Date.now(),
    soldCount: 95,
    reward_coins: 400,
    coin_enabled: true,
    seoPoints: ['Gold Woven Intricate Dial', 'Classic Roman Numerals Design', 'Classy Mech Hand-winding caliber']
  },
  {
    id: 'fn-1',
    name: 'Handcrafted Stitch Minimalist Cardholder',
    sku: 'ACC-W091-BD5',
    category: 'Wallets',
    price: 1800,
    discountPrice: 1200,
    stock: 45,
    image: 'https://images.unsplash.com/photo-1588444839799-eaa4344ecc1e?q=80&w=600',
    imageUrl: 'https://images.unsplash.com/photo-1588444839799-eaa4344ecc1e?q=80&w=600',
    featured_image: 'https://images.unsplash.com/photo-1588444839799-eaa4344ecc1e?q=80&w=600',
    images: [
      'https://images.unsplash.com/photo-1588444839799-eaa4344ecc1e?q=80&w=600',
      'https://images.unsplash.com/photo-1627124118303-19d4f0735f5e?q=80&w=600'
    ],
    rating: 4.7,
    reviews: 110,
    isNew: true,
    brand: 'Calf & Tannery',
    status: 'active',
    description: 'Constructed from premium full-grain leather offcuts, hand-stitched with durable waxed thread. Holds up to 6 cards securely inside a super slim pocket outline.',
    createdAt: Date.now(),
    soldCount: 110,
    reward_coins: 100,
    coin_enabled: true,
    seoPoints: ['Waxed-Thread Handstitching', 'Supports up to 6 credit cards', 'Super slim pocket fitment profile']
  },
  {
    id: 'fn-2',
    name: 'Presidential Gold Mesh Strap Limited Edition',
    sku: 'ACC-W091-BD6',
    category: 'Watches',
    price: 17500,
    discountPrice: 14900,
    stock: 6,
    image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=600',
    imageUrl: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=600',
    featured_image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=600',
    images: [
      'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=600',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=600'
    ],
    rating: 4.9,
    reviews: 65,
    isNew: true,
    brand: 'Tazu Executive',
    status: 'active',
    description: 'Uncompromising presidential edition watch showcasing a delicate gold-woven mesh bracelet with minimalist dark face. Complements elegant evening attire with sublime grace.',
    createdAt: Date.now(),
    soldCount: 65,
    reward_coins: 500,
    coin_enabled: true,
    seoPoints: ['Luxurious Golden Mesh Weave Bracelet', 'Minimalist Dial Presentation', 'Water-Resistant up to 3 atm']
  },
  {
    id: 'fn-3',
    name: 'Tazu Executive Gift Dual Pen & Watch Set',
    sku: 'ACC-W091-BD7',
    category: 'Gift Set',
    price: 9500,
    discountPrice: 7200,
    stock: 15,
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=600',
    imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=600',
    featured_image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=600',
    images: [
      'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=600'
    ],
    rating: 5.0,
    reviews: 45,
    isNew: true,
    brand: 'Tazu Executive',
    status: 'active',
    description: 'Curated premium set including an executive rollerball ink pen paired beautifully with a matching modern quartz timepiece. Presented inside an expensive velvet presentation box.',
    createdAt: Date.now(),
    soldCount: 45,
    reward_coins: 200,
    coin_enabled: true,
    seoPoints: ['Gold Accented Executive Fine Roller Pen', 'Premium matching quartz movement', 'Elegant Premium Velvet Case packaging']
  },
  {
    id: 'fn-4',
    name: 'Tactical Matte Black Stealth Chrono',
    sku: 'ACC-W091-BD8',
    category: 'Watches',
    price: 5500,
    discountPrice: 4200,
    stock: 18,
    image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=600',
    imageUrl: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=600',
    featured_image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=600',
    images: [
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=600',
      'https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=600'
    ],
    rating: 4.6,
    reviews: 140,
    isNew: false,
    brand: 'Stealth Gear',
    status: 'active',
    description: 'Military-grade rugged shockproof casing enclosing an active multi-dial high-precision split-second chronograph. Perfect companion for adventurous outdoors.',
    createdAt: Date.now(),
    soldCount: 140,
    reward_coins: 180,
    coin_enabled: true,
    seoPoints: ['Military-Grade Casing Construction', 'Advanced Multi-dial split-second layout', 'Rugged Waterproof Tactility']
  }
];

export default function Product() {
  const { slug: urlParam } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addItem, clearCart } = useCartStore();
  const { products } = useProductStore();
  const { offers } = useOfferStore();
  const { addViewedProduct } = useRecentlyViewedStore();
  const { reviews } = useReviewStore();

  const product = useMemo(() => {
    if (!urlParam) return null;
    const found = products.find(p => String(p.id) === String(urlParam) || (p.slug && p.slug === urlParam)) || ALL_FALLBACK_PRODUCTS.find((p: any) => String(p.id) === String(urlParam) || (p.slug && p.slug === urlParam));
    return found || null;
  }, [products, urlParam]);

  const approvedReviewsForProduct = useMemo(() => {
    if (!product) return [];
    return reviews.filter(r => String(r.productId) === String(product.id) && r.status === 'approved');
  }, [reviews, product]);

  const liveReviewsCount = approvedReviewsForProduct.length;
  const liveAverageRating = useMemo(() => {
    if (liveReviewsCount === 0) return 0;
    return Number((approvedReviewsForProduct.reduce((sum, r) => sum + r.rating, 0) / liveReviewsCount).toFixed(1));
  }, [approvedReviewsForProduct, liveReviewsCount]);

  const showRating = liveReviewsCount > 0;
  
  const bannerUrls = useMemo(() => {
    if (!product || !product.banner_image) return [];
    return product.banner_image.split(',').map((url: string) => url.trim()).filter(Boolean);
  }, [product]);

  const bannerItems = useMemo(() => {
    return bannerUrls.map((url: string) => ({ url, link: '#' }));
  }, [bannerUrls]);
  
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'shipping' | 'returns'>('description');
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const isWishlisted = isInWishlist(product?.id || '');
  const [isShareSuccess, setIsShareSuccess] = useState(false);
  const [wishlistToast, setWishlistToast] = useState<'added' | 'removed' | null>(null);

  // Dynamic gallery image setup
  const images = useMemo(() => {
    if (!product) return [];
    
    let rawImages: string[] = [];
    if (Array.isArray(product.images)) {
      rawImages = product.images;
    } else if (typeof product.images === 'string') {
      const trimmed = product.images.trim();
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) {
            rawImages = parsed;
          } else {
            rawImages = [trimmed];
          }
        } catch {
          rawImages = trimmed.split(',').map((img: string) => img.trim()).filter(Boolean);
        }
      } else {
        rawImages = trimmed.split(',').map((img: string) => img.trim()).filter(Boolean);
      }
    } else if (product.images) {
      rawImages = [String(product.images)];
    }

    if (rawImages && rawImages.length > 0) {
      return rawImages;
    }
    const list = [product.imageUrl || product.image];
    const category = (product.category || '').toLowerCase();
    
    // Fallback premium gallery pictures of similar accessories
    if (category.includes('perfume')) {
      list.push('https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=800');
      list.push('https://images.unsplash.com/photo-1615397323862-5e6616eb6e8b?auto=format&fit=crop&q=80&w=800');
      list.push('https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800');
    } else if (category.includes('wallet') || category.includes('leather')) {
      list.push('https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=800');
      list.push('https://images.unsplash.com/photo-1590247813693-5541d1c609fd?auto=format&fit=crop&q=80&w=800');
      list.push('https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?auto=format&fit=crop&q=80&w=800');
    } else if (category.includes('watch') || category.includes('electron')) {
      list.push('https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=800');
      list.push('https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=800');
      list.push('https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&q=80&w=800');
    } else {
      list.push('https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800');
      list.push('https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800');
      list.push('https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=800');
    }
    return list;
  }, [product]);

  // Gallery Order supports [Video Thumbnail], [Image 1], [Image 2], [Image 3]
  const galleryItems = useMemo(() => {
    const list: { type: 'image' | 'video'; url: string; thumbnail: string }[] = [];
    if (!product) return list;
    
    if (product.videoUrl || product.mediaUrl) {
      const vUrl = product.videoUrl || product.mediaUrl || '';
      let thumb = 'https://images.unsplash.com/photo-1461151304267-38535e780c79?w=500&auto=format&fit=crop&q=60';
      
      if (vUrl.includes('youtube.com') || vUrl.includes('youtu.be')) {
        let videoId = '';
        if (vUrl.includes('/shorts/')) {
          const parts = vUrl.split('/shorts/');
          videoId = parts[parts.length - 1]?.split(/[?#]/)[0] || '';
        } else if (vUrl.includes('youtu.be/')) {
          const parts = vUrl.split('youtu.be/');
          videoId = parts[parts.length - 1]?.split(/[?#]/)[0] || '';
        } else {
          const match = vUrl.match(/[?&]v=([^&#]+)/);
          videoId = match ? match[1] : '';
        }
        if (videoId) {
          thumb = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        }
      }
      list.push({ type: 'video', url: vUrl, thumbnail: thumb });
    }
    
    if (Array.isArray(images)) {
      images.forEach(img => {
        if (img) {
          list.push({ type: 'image', url: img, thumbnail: img });
        }
      });
    }
    
    return list;
  }, [product, images]);

  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId = '';
      if (url.includes('/shorts/')) {
        const parts = url.split('/shorts/');
        videoId = parts[parts.length - 1]?.split(/[?#]/)[0] || '';
      } else if (url.includes('youtu.be/')) {
        const parts = url.split('youtu.be/');
        videoId = parts[parts.length - 1]?.split(/[?#]/)[0] || '';
      } else {
        const match = url.match(/[?&]v=([^&#]+)/);
        videoId = match ? match[1] : '';
      }
      if (videoId) return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    }
    
    if (url.includes('facebook.com') || url.includes('fb.watch') || url.includes('fb.com')) {
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=0&autoplay=1`;
    }
    return '';
  };

  // Align activeImage state on initial load to show Product Image 1 (index 1) by default if video exists
  useEffect(() => {
    if (product && (product.videoUrl || product.mediaUrl)) {
      setActiveImage(1);
    } else {
      setActiveImage(0);
    }
  }, [product]);

  // Keep activeImage within valid bounds if gallery size changes
  useEffect(() => {
    if (galleryItems.length > 0 && activeImage >= galleryItems.length) {
      setActiveImage(0);
    }
  }, [galleryItems, activeImage]);

  // Gestures for swipe action on mobile
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    
    if (diff > 50) {
      // Swiped left, show next picture
      setActiveImage((prev) => (prev + 1) % galleryItems.length);
    } else if (diff < -50) {
      // Swiped right, show prev picture
      setActiveImage((prev) => (prev - 1 + galleryItems.length) % galleryItems.length);
    }
    setTouchStart(null);
  };

  const groupedVariants = useMemo<Record<string, { option: string, price: string }[]>>(() => {
    const groups: Record<string, { option: string, price: string }[]> = {};
    
    const processVariant = (v: any) => {
      if (!v) return;
      if (v.name) {
        // New structure: { name: string, price: string }
        if (!groups['Variant']) groups['Variant'] = [];
        groups['Variant'].push({ option: v.name, price: v.price });
      } else if (v.title) {
        // Legacy structure: { title: string, option: string, price: string }
        if (!groups[v.title]) groups[v.title] = [];
        groups[v.title].push({ option: v.option, price: v.price });
      }
    };

    if (product && product.variants && Array.isArray(product.variants)) {
      product.variants.forEach(processVariant);
    } else if (product && product.variants && typeof product.variants === 'string') {
      try {
        const parsed = JSON.parse(product.variants);
        if (Array.isArray(parsed)) {
          parsed.forEach(processVariant);
        }
      } catch {}
    }
    return groups;
  }, [product]);

  // Handle standard default variation parameters
  useEffect(() => {
    const initialSelection: Record<string, string> = {};
    Object.entries(groupedVariants).forEach((entry) => {
      const title = entry[0];
      const options = entry[1] as { option: string; price: string }[];
      if (options.length > 0) {
        initialSelection[title] = options[0].option;
      }
    });
    setSelectedVariants(initialSelection);
    setQuantity(1);
    setActiveImage(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product?.id, groupedVariants]);

  // Track product view history automatically inside the dynamic store
  useEffect(() => {
    if (product && product.id) {
      addViewedProduct(product.id);
      pixelService.trackProductView({
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.category
      });
    }
  }, [product, addViewedProduct]);

  // Variant custom pricing
  const { extraPrice, variantBasePrice, variantOriginalPrice } = useMemo(() => {
    let totalExtra = 0;
    let overrideBase: number | null = null;
    let overrideOriginal: number | null = null;

    if (!product) return { extraPrice: 0, variantBasePrice: null, variantOriginalPrice: null };
    
    let variantsList = product.variants;
    if (variantsList && typeof variantsList === 'string') {
      try {
        const parsed = JSON.parse(variantsList);
        if (Array.isArray(parsed)) variantsList = parsed;
      } catch {}
    }
    
    for (const [title, option] of Object.entries(selectedVariants)) {
      if (variantsList && Array.isArray(variantsList)) {
        let variant;
        if (title === 'Variant') {
          // New structure
          variant = variantsList.find(v => v && v.name === option);
          if (variant && variant.price !== undefined && variant.price !== '') {
             overrideBase = parseFloat(variant.price);
             // Assume original price stays the same or we use the new base.
             // If there's a discount setup, maybe override base and let it calculate, but for simplicity:
             overrideOriginal = parseFloat(variant.price);
          }
        } else {
          // Legacy structure
          variant = variantsList.find(v => v && v.title === title && v.option === option);
          if (variant && variant.price) {
            totalExtra += parseFloat(variant.price) || 0;
          }
        }
      }
    }
    return { extraPrice: totalExtra, variantBasePrice: overrideBase, variantOriginalPrice: overrideOriginal };
  }, [selectedVariants, product]);

  // Effect to automatically prompt Add to Cart for Buy Again
  useEffect(() => {
    if (searchParams.get('buyAgain') === 'true' && product) {
      setTimeout(() => {
        if (window.confirm(`Would you like to add ${product.name} to your cart?`)) {
          const variantString = Object.entries(selectedVariants).map(([k,v]) => `${k}: ${v}`).join(', ');
          const cartItemId = `${product.id}-${Object.values(selectedVariants).join('-')}`;
          const cartItemName = `${product.name}${variantString ? ` - ${variantString}` : ''}`;
          
          addItem({
            id: cartItemId,
            name: cartItemName,
            price: (product.discountPrice || product.price) + extraPrice,
            originalPrice: (product.price || 0) + extraPrice,
            image: product.imageUrl || product.featured_image || product.image,
            slug: product.slug,
            sku: product.sku,
            quantity: 1,
          });
          toast.success("Product added to cart");
          navigate('/cart');
        } else {
          // Remove query param to prevent reappearing on reload
          navigate(`/product/${urlParam}`, { replace: true });
        }
      }, 500);
    }
  }, [product, searchParams, navigate, urlParam, selectedVariants, addItem, extraPrice]);

  const discountDetails = useMemo(() => {
    return getProductDiscountDetails(product, offers);
  }, [product, offers]);

  const basePrice = variantBasePrice !== null ? variantBasePrice : discountDetails.discountPrice;
  const currentPrice = basePrice + extraPrice;
  const originalTotal = (variantOriginalPrice !== null ? variantOriginalPrice : (product?.price || 0)) + extraPrice;

  const discountPercent = originalTotal > currentPrice 
    ? Math.round(((originalTotal - currentPrice) / originalTotal) * 100) 
    : 0;

  // Short feature highlight description (max 3 lines) formulated from raw description text
  const teaserHighlight = useMemo(() => {
    if (!product || !product.description) return 'Premium genuine accessories crafted to perfection with durable materials and sleek finish.';
    const clean = product.description.replace(/<[^>]*>/g, '').trim();
    return clean.length > 130 ? clean.substring(0, 130) + '...' : clean;
  }, [product]);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return products.filter(p => 
      String(p.category || '').trim().toLowerCase() === String(product.category || '').trim().toLowerCase() && 
      p.id !== product.id
    ).slice(0, 4);
  }, [products, product]);

  const isOutOfStock = !product || product.stock === 0 || product.stock === null || product.stock === undefined;

  const handleAddToCart = () => {
    const variantString = Object.entries(selectedVariants).map(([k,v]) => `${k}: ${v}`).join(', ');
    const cartItemId = `${product.id}-${Object.values(selectedVariants).join('-')}`;
    const cartItemName = `${product.name}${variantString ? ` - ${variantString}` : ''}`;
    
    addItem({
      id: cartItemId,
      name: cartItemName,
      price: currentPrice,
      originalPrice: originalTotal,
      image: product.imageUrl || product.featured_image || product.image,
      slug: product.slug,
      sku: product.sku,
      quantity: quantity,
    });

    pixelService.trackAddToCart({
      id: product.id,
      name: product.name,
      price: currentPrice,
      quantity: quantity
    });

    toast.success("Product added to cart successfully");
  };

  const handleBuyNow = () => {
    const variantString = Object.entries(selectedVariants).map(([k,v]) => `${k}: ${v}`).join(', ');
    const cartItemId = `${product.id}-${Object.values(selectedVariants).join('-')}`;
    const cartItemName = `${product.name}${variantString ? ` - ${variantString}` : ''}`;
    
    addItem({
      id: cartItemId,
      name: cartItemName,
      price: currentPrice,
      originalPrice: originalTotal,
      image: product.imageUrl || product.featured_image || product.image,
      slug: product.slug,
      sku: product.sku,
      quantity: quantity,
    });

    pixelService.trackAddToCart({
      id: product.id,
      name: product.name,
      price: currentPrice,
      quantity: quantity
    });

    navigate('/checkout');
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.protocol}//${window.location.host}/product/${product.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: teaserHighlight,
          url: shareUrl,
        });
      } catch (err) {
        navigator.clipboard.writeText(shareUrl);
        setIsShareSuccess(true);
        setTimeout(() => setIsShareSuccess(false), 2000);
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      setIsShareSuccess(true);
      setTimeout(() => setIsShareSuccess(false), 2000);
    }
  };

  // Dynamic Trust Indicators Ticker
  const animatedSold = useMemo(() => {
    if (!product) return '0';
    const customSeed = product.soldCount || 1200;
    if (customSeed >= 1000) {
      const formatted = Math.floor(customSeed / 100) / 10;
      return `${formatted}K`;
    }
    return `${customSeed}`;
  }, [product]);

  const animatedViews = useMemo(() => {
    if (!product) return '0';
    const customSeed = product.soldCount ? product.soldCount * 4 : 5800;
    return customSeed >= 1000 ? `${(customSeed / 1000).toFixed(1)}K` : `${customSeed}`;
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex justify-center items-center text-center">
        <div className="flex flex-col items-center gap-4 text-neutral-400">
           <Box className="w-12 h-12 mb-2 opacity-50" />
           <h2 className="text-xl font-black uppercase tracking-widest text-[#1a1a1a]">This product is no longer available.</h2>
           <p className="text-sm font-medium">The item you're looking for might have been removed or is temporarily unavailable.</p>
           <button onClick={() => navigate('/')} className="mt-4 bg-black text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-neutral-800 transition-colors">Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-32 md:pb-16 font-sans antialiased text-neutral-900 transition-all">
      
      {/* Dynamic feedback toast for copying link */}
      <AnimatePresence>
        {isShareSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-neutral-950 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 flex items-center gap-2 border border-neutral-800"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Product link copied successfully
          </motion.div>
        )}

        {wishlistToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-neutral-950 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 flex items-center gap-2 border border-neutral-800 shadow-xl"
          >
            <Heart className="w-3.5 h-3.5 text-red-500 fill-current animate-bounce" />
            <span>
              {wishlistToast === 'added' ? 'Product saved in wishlist' : 'Product removed from wishlist'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modern Compact Header (Dynamic status bar with soft blur effect) */}
      <div className="sticky top-[72px] md:top-[72px] z-30 bg-white/90 backdrop-blur-md border-b border-neutral-200 py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-1 px-2.5 bg-white hover:bg-neutral-50 border border-neutral-250 text-neutral-900 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 active:scale-95 transition-all select-none"
          >
            <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Back</span>
          </button>
          
          <span className="text-xs font-black uppercase tracking-wider truncate max-w-[200px] md:max-w-md hidden sm:inline-block">
            {product.name}
          </span>
          
          <div className="flex items-center gap-1.5">
            <button 
              onClick={handleShare}
              title="Share"
              className="p-2 border border-neutral-200 hover:bg-neutral-50 text-neutral-900 active:scale-90 transition-all"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button 
              onClick={() => {
                toggleWishlist(product.id);
                setWishlistToast(isWishlisted ? 'removed' : 'added');
                setTimeout(() => setWishlistToast(null), 2000);
              }}
              title="Wishlist"
              className={`p-2 border transition-all active:scale-95 duration-200 ${isWishlisted ? 'border-red-500 bg-red-50 text-red-600 shadow-[0_0_12px_rgba(239,68,68,0.12)]' : 'border-neutral-200 hover:bg-neutral-50 text-neutral-900'}`}
            >
              <Heart className={`w-4 h-4 transition-transform ${isWishlisted ? 'fill-red-600 text-red-600' : 'text-neutral-500 hover:text-red-500'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Product Banner Section */}
      {bannerUrls.length > 0 && (
        <section className="px-4 mt-4 -mb-2">
          <div className="container mx-auto max-w-7xl">
            <BannerSlider banners={bannerItems} />
          </div>
        </section>
      )}

      {/* Main Container */}
      <div className="container mx-auto px-4 lg:px-8 max-w-7xl pb-12 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          
          {/* IMAGE GALLERY SECTION (Col-Span-6) - Compact Balanced Visuals */}
          <div className="lg:col-span-6 space-y-3">
            <div 
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              className="relative aspect-square max-w-[390px] mx-auto w-full bg-neutral-50/50 border border-neutral-200/60 rounded-xl overflow-hidden flex items-center justify-center select-none p-2.5 hover:shadow-[0_4px_20px_rgba(0,0,0,0.015)] transition-all group"
            >
              {/* Overlay Tags */}
              <div className="absolute top-3.5 left-3.5 z-10 flex flex-col gap-1.5 pointer-events-none">
                {product.stock <= 0 && (
                  <span className="bg-red-600 text-white text-[9px] font-black px-2 py-0.5 tracking-widest uppercase rounded">
                    OUT OF STOCK
                  </span>
                )}
                {!isOutOfStock && product.isNew && (
                  <span className="bg-neutral-950 text-white text-[9px] font-black px-2 py-0.5 tracking-widest uppercase rounded">
                    NEW ARRIVAL
                  </span>
                )}
                {!isOutOfStock && discountPercent > 0 && (
                  <span className="bg-[#E2125B] text-white text-[9px] font-black px-2 py-0.5 tracking-widest uppercase rounded">
                    -{discountPercent}% OFF
                  </span>
                )}
              </div>

              {/* Central Premium Main Display Image with smooth hover scaling */}
              <AnimatePresence mode="wait">
                {galleryItems[activeImage]?.type === 'video' ? (
                  <motion.div
                     key="video-player-main"
                     initial={{ opacity: 0, scale: 0.98 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.98 }}
                     transition={{ duration: 0.25 }}
                     className="w-full h-full aspect-square relative bg-black flex items-center justify-center p-0"
                  >
                    {galleryItems[activeImage]?.url && getEmbedUrl(galleryItems[activeImage].url) ? (
                      <iframe
                        src={getEmbedUrl(galleryItems[activeImage].url)}
                        title="Product Video Player"
                        className="w-full h-full border-none absolute inset-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <video
                        src={galleryItems[activeImage]?.url || ''}
                        className="w-full h-full border-none absolute inset-0 object-contain"
                        controls
                        autoPlay
                      />
                    )}
                  </motion.div>
                ) : (
                  <motion.img 
                    key={activeImage}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.25 }}
                    src={galleryItems[activeImage]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60'} 
                    alt={product.name} 
                    className="w-full h-full object-contain p-1 transition-transform duration-500 group-hover:scale-[1.03]"
                    referrerPolicy="no-referrer"
                  />
                )}
              </AnimatePresence>

              {/* Minimal Left & Right Slider Arrows */}
              {galleryItems.length > 1 && (
                <>
                  <button 
                    type="button"
                    onClick={() => setActiveImage((prev) => (galleryItems.length > 0 ? (prev - 1 + galleryItems.length) % galleryItems.length : 0))}
                    className="absolute left-2.5 w-7.5 h-7.5 rounded-full bg-white/95 border border-neutral-200 flex items-center justify-center text-neutral-900 hover:bg-neutral-50 active:scale-90 transition-all shadow-sm"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    type="button"
                    onClick={() => setActiveImage((prev) => (galleryItems.length > 0 ? (prev + 1) % galleryItems.length : 0))}
                    className="absolute right-2.5 w-7.5 h-7.5 rounded-full bg-white/95 border border-neutral-200 flex items-center justify-center text-neutral-900 hover:bg-neutral-50 active:scale-90 transition-all shadow-sm"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </>
              )}

              {/* Compact Indicator Dots */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-1 bg-white/80 p-0.5 px-1.5 border border-neutral-150 rounded-full">
                {galleryItems.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`h-1.5 transition-all outline-none rounded-full ${activeImage === idx ? 'w-3 text-black bg-black' : 'w-1.5 bg-neutral-300'}`}
                  />
                ))}
              </div>
            </div>
            
            {/* Dynamic Multi-Image Mini Strips - Comfortable Gallery Alignment */}
            {galleryItems.length > 1 && (
              <div className="flex gap-2 overflow-x-auto justify-center pb-1 scrollbar-thin max-w-[390px] mx-auto">
                {galleryItems.map((item, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`relative w-11 h-11 rounded-lg overflow-hidden shrink-0 border transition-all bg-neutral-100 flex items-center justify-center p-0.5 ${activeImage === idx ? 'border-neutral-950 ring-1 ring-neutral-950 shadow-sm' : 'border-neutral-200 hover:border-neutral-400'}`}
                  >
                    <img 
                      src={item.thumbnail} 
                      alt={`Thumbnail ${idx + 1}`} 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                    {item.type === 'video' && (
                      <div className="absolute inset-0 bg-black/45 flex items-center justify-center transition-opacity hover:bg-black/30">
                        <Play className="w-5 h-5 text-white fill-white animate-pulse" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* PRODUCT DETAILS SIDEBAR (Col-Span-6) */}
          <div className="lg:col-span-6 space-y-5">
            
            {/* 1. Category and Brand Details */}
            <div className="space-y-1 pb-2 border-b border-neutral-100">
              <div className="flex items-center gap-1.5 text-[9px] font-bold text-neutral-400 uppercase tracking-widest flex-wrap">
                <span>{product.category}</span>
                {product.brand && (
                  <>
                    <span>/</span>
                    <span className="text-neutral-800 font-extrabold">{product.brand}</span>
                  </>
                )}
              </div>
              
              {/* Product Title */}
              <h1 className="text-xl md:text-2xl font-black text-neutral-950 uppercase tracking-tight leading-snug">
                {product.name}
              </h1>

              {/* SKU Code - Prominent position */}
              {(product.sku_code || product.sku) && (
                <div className="mt-1 text-[11px] font-mono font-bold text-zinc-500 uppercase tracking-widest">
                  SKU: {product.sku_code || product.sku}
                </div>
              )}

              {/* Dynamic Star Rating Block */}
              {showRating && (
                <div className="flex items-center gap-1.5 mt-2 select-none text-black font-[700] text-sm">
                  <span>⭐</span>
                  <span>{liveAverageRating.toFixed(1)}</span>
                  <span className="text-zinc-500 font-semibold text-xs">({liveReviewsCount})</span>
                </div>
              )}
            </div>

            {/* 2. Interactive Animated Ticker Tags */}
            <div className="flex flex-wrap items-center gap-3 py-1 text-xs">
              <div className="flex items-center gap-1.5 text-neutral-900 font-extrabold uppercase text-[10px] tracking-widest bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                VERIFIED IN-STOCK
              </div>
              
              <div className="flex items-center gap-1 text-[10.5px] font-extrabold text-[#E2125B] uppercase tracking-wide">
                <Flame className="w-3.5 h-3.5 fill-current animate-bounce" />
                <span className="font-mono">{animatedSold}</span> SOLD
              </div>

              <div className="flex items-center gap-1 text-[10.5px] font-semibold text-neutral-500 uppercase tracking-wide">
                <Eye className="w-3.5 h-3.5 stroke-[2]" />
                <span className="font-mono">{animatedViews}</span> VIEWS TODAY
              </div>
            </div>

            {/* 3. Pricing Area - Single Line Compact Layout with Coins */}
            <div className="py-3 px-4 border border-neutral-250 bg-neutral-50 rounded-xl">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3.5 flex-wrap">
                  <span className="text-2xl font-[800] text-neutral-950 tracking-tight">
                    {formatPrice(currentPrice)}
                  </span>
                  
                  {discountPercent > 0 && (
                    <div className="flex flex-col">
                      <span className="text-xs text-neutral-400 line-through font-bold tracking-tight">
                        {formatPrice(originalTotal)}
                      </span>
                      <span className="text-[#E2125B] text-[8.5px] font-black uppercase tracking-widest">
                        SAVE {formatPrice(originalTotal - currentPrice)} ({discountPercent}% OFF)
                      </span>
                    </div>
                  )}
                </div>

                {/* Tazu Coins Label */}
                {(product.coin_enabled ?? true) && (
                  <div className="flex items-center gap-2 bg-orange-100/50 px-3 py-1.5 rounded-full border border-orange-200">
                    <span className="text-[14px]">🪙</span>
                    <span className="text-[11px] font-black uppercase text-orange-700 tracking-tight">
                      {(product.reward_coins || 250) * quantity} Tazu Coins
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 4. Short Highlight Feature */}
            <p className="text-xs text-neutral-500 leading-relaxed font-semibold uppercase tracking-wide">
              {teaserHighlight}
            </p>

            {/* 5. Variant Selectors */}
            {Object.keys(groupedVariants).length > 0 && (
              <div className="space-y-4 pt-2">
                {Object.entries(groupedVariants).map((entry) => {
                  const title = entry[0];
                  const options = entry[1] as { option: string; price: string }[];
                  return (
                    <div key={title} className="space-y-2">
                      <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-neutral-400">
                        <span>SELECT {title}</span>
                        {selectedVariants[title] && (
                          <span className="text-neutral-900 border-b border-neutral-900 pb-0.5">SELECTED: {selectedVariants[title]}</span>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {options.map((opt, idx) => (
                          <button 
                            key={`${opt.option}-${idx}`}
                            onClick={() => setSelectedVariants(prev => ({...prev, [title]: opt.option}))}
                            className={`min-w-[70px] px-3.5 py-2 text-xs font-black uppercase tracking-widest transition-all rounded-none ${
                              selectedVariants[title] === opt.option 
                                ? 'bg-neutral-950 text-white shadow-sm border border-neutral-950' 
                                : 'bg-white text-neutral-500 border border-neutral-250 hover:border-neutral-900'
                            }`}
                          >
                            <span className="block">{opt.option}</span>
                            {opt.price && parseFloat(opt.price) > 0 && (
                              <span className={`block text-[8px] mt-0.5 font-bold ${selectedVariants[title] === opt.option ? 'text-neutral-300' : 'text-emerald-600'}`}>
                                +{parseFloat(opt.price)} BDT
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 6. Quantity Selector */}
            <div className="pt-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400 block mb-2">QUANTITY</span>
              <div className="flex items-center gap-4">
                
                {/* Compact Rectangular Quantity Control */}
                <div className={`flex items-center border border-neutral-350 bg-white select-none ${isOutOfStock ? 'opacity-50 pointer-events-none' : ''}`}>
                  <button 
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-9 flex items-center justify-center text-neutral-900 hover:bg-neutral-100 transition-colors uppercase font-black text-sm"
                  >
                    -
                  </button>
                  <div className="w-12 text-center text-xs font-black text-neutral-950 font-mono">
                    {quantity}
                  </div>
                  <button 
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-9 flex items-center justify-center text-neutral-900 hover:bg-neutral-100 transition-colors uppercase font-black text-sm"
                  >
                    +
                  </button>
                </div>

                <div className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">
                  {isOutOfStock ? 'Currently out of stock' : `${product.stock} units available`}
                </div>
              </div>
            </div>

            {/* 7. Action Button Panel (Desktop only - hidden on mobile bottom bar) */}
            <div className="hidden md:block pt-3">
              <button 
                type="button"
                onClick={handleBuyNow}
                className="w-full h-[52px] bg-neutral-950 text-white border border-neutral-950 font-black uppercase text-[11px] tracking-widest hover:bg-neutral-900 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
                <span>{isOutOfStock ? 'OUT OF STOCK' : 'BUY NOW'}</span>
              </button>
            </div>

            {/* 8. Tabbed Information Center */}
            <div className="pt-4 border-t border-neutral-200">
              <div className="flex border-b border-neutral-200">
                {[
                  { id: 'description', label: 'Description' },
                  { id: 'specs', label: 'Specifications' },
                  { id: 'shipping', label: 'Shipping' },
                  { id: 'returns', label: 'Returns' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`flex-1 pb-2.5 text-[10px] md:text-xs font-black uppercase tracking-wider border-b-2 text-center transition-all ${activeTab === item.id ? 'border-neutral-950 text-neutral-900' : 'border-transparent text-neutral-400 hover:text-neutral-700'}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Tab Outputs */}
              <div className="py-4 text-xs leading-relaxed text-neutral-600 uppercase font-semibold">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-4"
                  >
                    {activeTab === 'description' && (
                      <div className="space-y-3.5">
                        {product.seoPoints && Array.isArray(product.seoPoints) && product.seoPoints.length > 0 && (
                          <div className="space-y-2 border-b border-neutral-100 pb-3">
                            {product.seoPoints.map((point, index) => point && (
                              <div key={index} className="flex items-start gap-2 text-neutral-800">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                <span>{point}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="prose prose-xs text-neutral-600 select-text leading-relaxed font-semibold uppercase">
                          {product.description ? (
                            <div dangerouslySetInnerHTML={{ __html: product.description.replace(/\n/g, '<br/>') }} />
                          ) : (
                            "No details has been published. Rest assured of premium e-commerce standards."
                          )}
                        </div>
                      </div>
                    )}

                    {activeTab === 'specs' && (
                      <div className="border border-neutral-200">
                        {[
                          { key: 'SKU CODE', value: product.sku || 'ACC-W091-BD' },
                          { key: 'WARRANTY', value: product.warranty || '7-Day Replacement Policy' },
                          { key: 'UNIT VALUE', value: product.unitName || '1 Pcs Box Pack' },
                          { key: 'BRAND SELLER', value: product.brand || 'Premium Direct' },
                          { key: 'AUTHENTICITYScore', value: '100% Verified Quality standard' }
                        ].map((spec, index) => (
                          <div key={index} className="flex border-b border-indigo-50 last:border-b-0">
                            <span className="w-1/3 p-2.5 bg-neutral-50 text-neutral-400 font-black text-[9px] border-r border-neutral-200 uppercase">{spec.key}</span>
                            <span className="w-2/3 p-2.5 bg-white text-neutral-800 tracking-wide font-extrabold text-[10px] uppercase">{spec.value}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeTab === 'shipping' && (
                      <div className="space-y-3">
                        <div className="p-3 bg-neutral-50 border border-neutral-200 flex items-center gap-1.5">
                          <Truck className="w-4 h-4 text-neutral-800" />
                          <span className="text-[10px] font-black text-neutral-900 tracking-wider">SHIPPING POLICIES & CHARGES</span>
                        </div>
                        
                        {product.shippingZones && product.shippingZones.length > 0 ? (
                          <div className="border border-neutral-200">
                            {product.shippingZones.map((sz, idx) => sz.zone && (
                              <div key={idx} className="flex justify-between items-center p-3 border-b border-neutral-100 last:border-b-0">
                                <span className="font-extrabold text-neutral-700 select-all uppercase">{sz.zone}</span>
                                <span className="font-black text-neutral-900">{sz.charge} BDT</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="border border-neutral-200">
                            <div className="flex justify-between items-center p-3 border-b border-neutral-100">
                              <span className="font-extrabold text-neutral-700 uppercase">Inside Dhaka City</span>
                              <span className="font-black text-neutral-900">80 BDT</span>
                            </div>
                            <div className="flex justify-between items-center p-3">
                              <span className="font-extrabold text-neutral-700 uppercase">Dhaka Suburbs & Out of Dhaka</span>
                              <span className="font-black text-neutral-900">150 BDT</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'returns' && (
                      <div className="p-4 bg-neutral-50 border border-neutral-200 space-y-2 text-neutral-500 uppercase font-semibold">
                        <p className="font-black text-neutral-900 flex items-center gap-1">
                          <RotateCcw className="w-4 h-4" /> 7-DAY EASY REFUND & REPLACEMENT
                        </p>
                        <ul className="list-disc pl-4 space-y-1 text-neutral-500">
                          <li>Package must remain clean and unwrapped original state.</li>
                          <li>Required to document an unboxing video as validation.</li>
                          <li>Replacement orders processed instantly upon handoff verifying.</li>
                        </ul>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <ProductReviews />

      {/* Related Products - "You May Also Like" */}
      {relatedProducts.length > 0 && (
        <div className="container mx-auto px-4 lg:px-8 max-w-7xl py-12 border-t border-neutral-200">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg md:text-xl font-black uppercase tracking-tight">You May Also Like</h2>
            <button 
              type="button"
              onClick={() => navigate('/collections/all')} 
              className="text-[10px] font-black uppercase tracking-widest border-b border-neutral-900 pb-0.5 hover:text-neutral-500 hover:border-neutral-500 transition-all"
            >
              See All Products
            </button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map(rp => (
              <ProductCard key={rp.id} product={rp} />
            ))}
          </div>
        </div>
      )}

      {/* Sticky Bottom Purchase Bar (Highly optimized layout across all screens) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-between gap-4 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        
        <div className="flex flex-col flex-shrink-0 min-w-[80px]">
            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Total Price</span>
            <div className="flex items-baseline gap-1">
                <span className="text-xs font-bold text-gray-900">BDT</span>
                <span className="text-xl font-black text-gray-950">{formatPrice(currentPrice * quantity)}</span>
            </div>
        </div>

        <div className="flex flex-1 gap-3 max-w-xs sm:max-w-md ml-auto">
            
            <button 
              type="button"
              onClick={handleBuyNow}
              className="w-full bg-gray-950 hover:bg-gray-900 text-white font-semibold h-11 px-4 rounded-lg text-sm shadow-md shadow-gray-950/10 transition-all active:scale-95 flex items-center justify-center gap-1.5 focus:outline-none"
            >
                <ShoppingBag className="w-4 h-4" />
                <span>{isOutOfStock ? 'OUT OF STOCK' : 'BUY NOW'}</span>
            </button>

        </div>
      </div>

    </div>
  );
}
