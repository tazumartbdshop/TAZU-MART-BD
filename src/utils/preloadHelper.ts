import { useCategoryStore } from '../store/useCategoryStore';
import { useProductStore } from '../store/useProductStore';
import { useBannerStore } from '../store/useBannerStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { useReviewStore } from '../store/useReviewStore';
import { safeFetch } from './apiUrl';


function toCamelCase(str: string): string {
  return str.replace(/([-_][a-z])/ig, ($1) => {
    return $1.toUpperCase()
      .replace('-', '')
      .replace('_', '');
  });
}

export function objectToCamel(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(v => objectToCamel(v));
  } else if (obj !== null && obj !== undefined && obj.constructor === Object) {
    return Object.keys(obj).reduce(
      (result, key) => ({
        ...result,
        [toCamelCase(key)]: objectToCamel(obj[key]),
      }),
      {}
    );
  }
  return obj;
}

export function mapDbToBanner(row: any): any {
  return objectToCamel(row);
}

export function mapDbToCategory(row: any): any {
  const camelRow: any = objectToCamel(row);
  return {
    id: camelRow.id || '',
    name: camelRow.name || '',
    slug: camelRow.slug || '',
    bannerName: camelRow.bannerName || '',
    bannerImage: camelRow.bannerImage || '',
    bannerImages: camelRow.bannerImages || (camelRow.bannerImage ? [camelRow.bannerImage] : []),
    iconImage: camelRow.iconImage || '',
    wideBannerImage: camelRow.wideBannerImage || '',
    buttonText: camelRow.buttonText || '',
    buttonLink: camelRow.buttonLink || '',
    featuredProducts: camelRow.featuredProducts || '',
    description: camelRow.description || '',
    displayOrder: Number(camelRow.displayOrder ?? 1),
    status: camelRow.status || 'Active',
    showOnHomepage: camelRow.showOnHomepage !== false,
    createdAt: camelRow.createdAt || '',
    metaTitle: camelRow.metaTitle || '',
    metaDescription: camelRow.metaDescription || '',
    keywords: camelRow.keywords || '',
    isDemo: camelRow.isDemo || false,
    sliderSettings: camelRow.sliderSettings || null
  };
}

export function mapDbToProduct(row: any): any {
  const camelRow: any = objectToCamel(row);

  let parsedImages: string[] = [];
  if (Array.isArray(camelRow.images)) {
    parsedImages = camelRow.images;
  } else if (typeof camelRow.images === 'string') {
    const trimmed = camelRow.images.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          parsedImages = parsed;
        } else {
          parsedImages = [trimmed];
        }
      } catch {
        parsedImages = trimmed.split(',').map((img: string) => img.trim()).filter(Boolean);
      }
    } else {
      parsedImages = trimmed.split(',').map((img: string) => img.trim()).filter(Boolean);
    }
  } else if (camelRow.images) {
    parsedImages = [String(camelRow.images)];
  }

  let parsedSeoPoints: string[] = [];
  if (Array.isArray(camelRow.seoPoints)) {
    parsedSeoPoints = camelRow.seoPoints;
  } else if (typeof camelRow.seoPoints === 'string') {
    const trimmed = camelRow.seoPoints.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          parsedSeoPoints = parsed;
        } else {
          parsedSeoPoints = [trimmed];
        }
      } catch {
        parsedSeoPoints = trimmed.split(',').map((p: string) => p.trim()).filter(Boolean);
      }
    } else {
      parsedSeoPoints = trimmed.split(',').map((p: string) => p.trim()).filter(Boolean);
    }
  } else if (camelRow.seoPoints) {
    parsedSeoPoints = [String(camelRow.seoPoints)];
  }

  let parsedVariants: any[] = [];
  if (Array.isArray(camelRow.variants)) {
    parsedVariants = camelRow.variants;
  } else if (typeof camelRow.variants === 'string') {
    const trimmed = camelRow.variants.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        parsedVariants = JSON.parse(trimmed);
      } catch {}
    }
  }

  let parsedShippingZones: any[] = [];
  if (Array.isArray(camelRow.shippingZones)) {
    parsedShippingZones = camelRow.shippingZones;
  } else if (typeof camelRow.shippingZones === 'string') {
    const trimmed = camelRow.shippingZones.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        parsedShippingZones = JSON.parse(trimmed);
      } catch {}
    }
  }

  let parsedKeywords: string[] = [];
  if (Array.isArray(camelRow.keywords)) {
    parsedKeywords = camelRow.keywords;
  } else if (typeof camelRow.keywords === 'string') {
    const trimmed = camelRow.keywords.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          parsedKeywords = parsed;
        } else {
          parsedKeywords = [trimmed];
        }
      } catch {
        parsedKeywords = trimmed.split(',').map((p: string) => p.trim()).filter(Boolean);
      }
    } else {
      parsedKeywords = trimmed.split(',').map((p: string) => p.trim()).filter(Boolean);
    }
  } else if (camelRow.keywords) {
    parsedKeywords = [String(camelRow.keywords)];
  }

  return {
    ...camelRow,
    id: camelRow.id || '',
    name: camelRow.name || '',
    sku: camelRow.sku || camelRow.skuCode || '',
    sku_code: camelRow.skuCode || camelRow.sku || '',
    category: camelRow.category || '',
    price: Number(camelRow.price || 0),
    discountPrice: camelRow.discountPrice,
    stock: Number(camelRow.stock || 0),
    image: camelRow.image || camelRow.imageUrl || camelRow.featuredImage || '',
    imageUrl: camelRow.imageUrl || camelRow.image || '',
    featured_image: camelRow.featuredImage || camelRow.image || '',
    banner_image: camelRow.bannerImage || '',
    images: parsedImages,
    videoUrl: camelRow.videoUrl || camelRow.mediaUrl || '',
    mediaUrl: camelRow.mediaUrl || camelRow.videoUrl || '',
    rating: Number(camelRow.rating || 4.5),
    reviews: Number(camelRow.reviews || 0),
    isNew: camelRow.isNew !== undefined ? camelRow.isNew : true,
    brand: camelRow.brand || '',
    status: (camelRow.status || 'active').toLowerCase(),
    description: camelRow.description || '',
    createdAt: camelRow.createdAt || Date.now(),
    buyingPrice: camelRow.buyingPrice,
    warranty: camelRow.warranty || '',
    unitName: camelRow.unitName,
    soldCount: Number(camelRow.soldCount || 0),
    productCode: camelRow.productCode || '',
    seoPoints: parsedSeoPoints,
    variants: parsedVariants,
    shippingZones: parsedShippingZones,
    is_flash_sale: !!camelRow.isFlashSale,
    is_trending: !!camelRow.isTrending,
    is_best_selling: !!camelRow.isBestSelling,
    is_regular: !!camelRow.isRegular,
    is_offer: !!camelRow.isOffer,
    reward_coins: camelRow.rewardCoins,
    coin_enabled: camelRow.coinEnabled,
    isDemo: !!camelRow.isDemo,
    keywords: parsedKeywords
  };
}

export function mapDbToReview(r: any): any {
  return {
    reviewId: r.id,
    productId: r.product_id,
    customerId: r.user_id,
    customerName: r.customer_name,
    rating: r.rating,
    reviewText: r.review_text,
    mediaUrls: r.media_urls || [],
    adminReply: r.admin_reply,
    status: r.status,
    verified: r.verified,
    createdAt: r.created_at,
    phone: r.phone,
    email: r.email,
    orderId: r.order_id,
    deviceIP: r.device_ip,
    anonymous: r.anonymous,
    isPinned: r.is_pinned,
    rejectionReason: r.rejection_reason
  };
}

export function preloadImage(url: string): Promise<void> {
  return new Promise((resolve) => {
    if (!url) {
      resolve();
      return;
    }
    const img = new Image();
    img.src = url;
    img.onload = () => resolve();
    img.onerror = () => resolve(); // Resolve anyway so we don't block app rendering
  });
}

export async function preloadHomepageDataAndAssets(): Promise<void> {
  try {
    const res = await safeFetch('/api/homepage-data');
    if (!res.ok) throw new Error("Failed to fetch homepage data");
    const data = await res.json();

    // Store the global database error for UI messaging/diagnostics
    if (typeof window !== 'undefined') {
      (window as any).__SUPABASE_DB_ERROR = data.dbError;
    }

    // 1. Map data to client models
    const banners = (data.banners || []).map(mapDbToBanner);
    const categories = (data.categories || []).map(mapDbToCategory);
    const products = (data.products || []).map(mapDbToProduct);
    const reviews = (data.reviews || []).map(mapDbToReview);

    // 2. Load settings
    let settings = {};
    if (data.settings && data.settings.length > 0) {
      const row = data.settings[0];
      if (row.value) {
        try {
          const parsedValue = typeof row.value === 'string' ? JSON.parse(row.value) : row.value;
          settings = objectToCamel(parsedValue);
        } catch {
          settings = objectToCamel(row);
        }
      } else {
        settings = objectToCamel(row);
      }
    }

    // 3. Populate stores directly
    useBannerStore.setState({ banners, isLoaded: true });
    useCategoryStore.setState({ categories, isLoaded: true });
    useProductStore.setState({ products, isLoaded: true, isLoading: false });
    useReviewStore.setState({ reviews, isLoading: false });
    if (Object.keys(settings).length > 0) {
      useSettingsStore.setState({ settings: { ...useSettingsStore.getState().settings, ...settings }, isLoaded: true });
    }

    // Save to local caches so subsequent views are instant from store initializer
    try {
      localStorage.setItem('cached_banners', JSON.stringify(banners));
      localStorage.setItem('cached_categories', JSON.stringify(categories));
      localStorage.setItem('cached_products', JSON.stringify(products));
    } catch (e) {
      console.warn("Failed to save homepage data to localStorage cache (quota likely exceeded):", e);
    }

    // 4. Extract first image resources for background asset preloading (above the fold)
    const imagesToPreload: string[] = [];

    // First banner
    const firstBanner = banners.find((b: any) => b.placement === 'Slider' || b.placement === 'slider');
    if (firstBanner && firstBanner.imageUrl) {
      imagesToPreload.push(firstBanner.imageUrl);
    }

    // First 6 category thumbnail images
    categories.slice(0, 6).forEach((cat: any) => {
      const img = cat.iconImage || cat.bannerImage;
      if (img) imagesToPreload.push(img);
    });

    // First 4 products
    products.slice(0, 4).forEach((prod: any) => {
      const img = prod.image || prod.imageUrl || (prod.images && prod.images[0]);
      if (img) imagesToPreload.push(img);
    });

    // Run preload on images in parallel
    await Promise.all(imagesToPreload.map(url => preloadImage(url)));
  } catch (error) {
    console.error("Error preloading homepage data and assets:", error);
  }
}
