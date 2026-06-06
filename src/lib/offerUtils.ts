import { Offer } from '../store/useOfferStore';
import { Product } from '../store/useProductStore';
import { useSupportStore } from '../store/useSupportStore';

export interface ProductDiscountResult {
  discountPrice: number;
  discountType: 'Percentage' | 'Fixed Amount' | null;
  discountValue: number;
  offerId: string | null;
  offerName: string | null;
  isOffer: boolean;
}

/**
 * Calculates a product's current discounted price and metadata based on active offers.
 * If no offer is active but the product has a static discountPrice, we fall back to it.
 */
export function getProductDiscountDetails(product: Product, offers: Offer[]): ProductDiscountResult {
  // 1. Check if there are active broadcast promotion booster deals matching this specific product or category
  try {
    const broadcasts = useSupportStore.getState().broadcasts || [];
    const activeBroadcasts = broadcasts.filter(b => b.status === 'active');
    
    // Check product specific offer
    const pName = (product.name || '').toLowerCase().trim();
    const productCampaign = activeBroadcasts.find(b => b.productId === product.id || (b.productName && pName === b.productName.toLowerCase().trim()));
    if (productCampaign && (productCampaign.productDiscount || productCampaign.offerPercentage)) {
      const discountValue = productCampaign.productDiscount || productCampaign.offerPercentage || 0;
      if (discountValue > 0) {
        const discountPrice = Math.round(product.price * (1 - discountValue / 100));
        return {
          discountPrice,
          discountType: 'Percentage',
          discountValue,
          offerId: productCampaign.id,
          offerName: productCampaign.title || 'Product Special Campaign',
          isOffer: true
        };
      }
    }

    // Check category specific offer (e.g. Wallet Collection, Perfume, Smart Watch, Fashion)
    const categoryCampaign = activeBroadcasts.find(b => {
      if (b.type !== 'category' || !b.categoryName) return false;
      const bCat = b.categoryName.toLowerCase().trim().replace(/[\s-]/g, '');
      const pCat = (product.category || '').toLowerCase().trim().replace(/[\s-]/g, '');
      // Try both category name and product ID checking for a match
      const pId = (product.id || '').toLowerCase().trim().replace(/[\s-]/g, '');
      return bCat === pCat || pId.includes(bCat) || bCat.includes(pCat);
    });

    if (categoryCampaign && categoryCampaign.offerPercentage !== undefined && categoryCampaign.offerPercentage > 0) {
      const discountValue = categoryCampaign.offerPercentage;
      const discountPrice = Math.round(product.price * (1 - discountValue / 100));
      return {
        discountPrice,
        discountType: 'Percentage',
        discountValue,
        offerId: categoryCampaign.id,
        offerName: categoryCampaign.title || 'Category Special Campaign',
        isOffer: true
      };
    }
  } catch (e) {
    console.error("Error evaluating broadcast campaign discounts:", e);
  }

  // 2. Find all active offers that contain this product
  const activeOffers = (offers || []).filter(o => {
    const isInside = (o.productIds || []).includes(product.id) || (o.manualProductIds || []).includes(product.id);
    if (!isInside) return false;
    
    // Status check
    if (o.status !== 'Active') return false;
    
    // Expiry and Start Date verification (considering Auto Expire setting)
    const today = new Date().toISOString().split('T')[0];
    if (o.startDate && today < o.startDate) return false;
    if (o.autoExpire !== false && o.endDate && today > o.endDate) return false;
    
    return true;
  });
  
  if (activeOffers.length > 0) {
    // Sort by priority (0 is highest/highest precedence)
    const bestOffer = [...activeOffers].sort((a, b) => (a.priority || 0) - (b.priority || 0))[0];
    
    if (bestOffer.discountType && bestOffer.discountValue !== undefined && bestOffer.discountValue > 0) {
      let discountPrice = product.price;
      if (bestOffer.discountType === 'percentage') {
        discountPrice = Math.round(product.price * (1 - bestOffer.discountValue / 100));
      } else if (bestOffer.discountType === 'fixed') {
        discountPrice = Math.max(0, product.price - bestOffer.discountValue);
      }
      return {
        discountPrice,
        discountType: bestOffer.discountType === 'percentage' ? 'Percentage' : 'Fixed Amount',
        discountValue: bestOffer.discountValue,
        offerId: bestOffer.id,
        offerName: bestOffer.name,
        isOffer: true
      };
    }
  }
  
  // Fallback to product-level static discountPrice if valid
  if (product.discountPrice && product.discountPrice < product.price) {
    return {
      discountPrice: product.discountPrice,
      discountType: 'Fixed Amount',
      discountValue: product.price - product.discountPrice,
      offerId: null,
      offerName: product.is_flash_sale ? 'Flash Sale' : 'Product Discount',
      isOffer: false
    };
  }
  
  return {
    discountPrice: product.price,
    discountType: null,
    discountValue: 0,
    offerId: null,
    offerName: null,
    isOffer: false
  };
}
