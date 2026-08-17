import { getSupabase } from '../lib/supabase';

export interface Campaign {
  id: string;
  title: string;
  description: string;
  image_url: string;
  status: 'draft' | 'active' | 'expired' | 'disabled';
  start_at?: string;
  end_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CampaignProduct {
  id?: string;
  campaign_id: string;
  product_id: string;
}

export interface CampaignCategory {
  id?: string;
  campaign_id: string;
  category_id: string;
}

export interface Coupon {
  id?: string;
  campaign_id?: string;
  code: string;
  description?: string;
  discount_type: 'Percentage' | 'Fixed Amount';
  discount_value: number;
  active: boolean;
  created_at?: string;
  expires_at?: string;
}

// Check if tables exist by querying limit 1. If not, fallback to settings.
let useFallback = false;
let checkDone = false;

async function ensureDBSetup() {
  if (checkDone) return;
  const supabase = getSupabase();
  if (!supabase) return;
  const { error } = await supabase.from('campaigns').select('id').limit(1);
  if (error && error.message.includes('Could not find the table')) {
    useFallback = true;
    console.warn("Table 'campaigns' not found! Using 'settings' table as a fallback.");
  }
  checkDone = true;
}

// Fallback logic using settings table 'campaigns_data'
async function getFallbackData(): Promise<any[]> {
  const supabase = getSupabase();
  const { data } = await supabase.from('settings').select('value').eq('id', 'campaigns_data').single();
  return data?.value || [];
}
async function saveFallbackData(campaigns: any[]) {
  const supabase = getSupabase();
  await supabase.from('settings').upsert({ id: 'campaigns_data', value: campaigns });
}

export const campaignService = {
  async getCampaigns(): Promise<Campaign[]> {
    await ensureDBSetup();
    const supabase = getSupabase();
    if (useFallback) {
      const data = await getFallbackData();
      return data.map(d => d.campaign);
    }
    const { data, error } = await supabase.from('campaigns').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getActiveCampaigns(): Promise<(Campaign & { products: string[], categories: string[], coupon?: Coupon })[]> {
    await ensureDBSetup();
    const supabase = getSupabase();
    
    let dbCampaigns: any[] = [];
    if (useFallback) {
      const data = await getFallbackData();
      dbCampaigns = data.filter(d => d.campaign.status === 'active').map(d => ({
        ...d.campaign,
        products: d.products.map((p: any) => p.product_id),
        categories: d.categories.map((c: any) => c.category_id),
        coupon: d.coupon
      }));
    } else {
      // Using Supabase relationships (if foreign keys exist)
      const { data, error } = await supabase
        .from('campaigns')
        .select('*, campaign_products(product_id), campaign_categories(category_id), coupons(*)')
        .eq('status', 'active');
        
      if (!error && data) {
        dbCampaigns = data.map((d: any) => ({
          ...d,
          title: d.title || d.name,
          image_url: d.image_url || d.banners?.[0]?.url || d.customBannerUrls?.[0],
          products: d.campaign_products?.map((p: any) => p.product_id) || d.productIds || d.manualProductIds || [],
          categories: d.campaign_categories?.map((c: any) => c.category_id) || [],
          coupon: d.coupons?.[0] || d.coupon
        }));
      }
    }

    // Also include active offers from useOfferStore (created via Admin Offers)
    let storeOffers: any[] = [];
    try {
      const { useOfferStore } = await import('../store/useOfferStore');
      storeOffers = useOfferStore.getState().offers || [];
    } catch {
      // ignore
    }

    const offerCampaigns = storeOffers
      .filter(o => o.status === 'Active' && o.offersPageVisibility !== false)
      .map(o => ({
        id: o.id,
        title: o.name,
        description: o.description,
        image_url: o.banners?.[0]?.url || o.customBannerUrls?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=200',
        status: 'active' as const,
        products: [...(o.productIds || []), ...(o.manualProductIds || [])],
        categories: [],
        coupon: o.discountType ? {
          code: `DISCOUNT${o.discountValue || 0}`,
          discount_type: o.discountType === 'percentage' ? 'Percentage' : 'Fixed Amount',
          discount_value: o.discountValue || 0,
          active: true
        } : undefined,
        created_at: new Date().toISOString()
      }));

    // Also include active popup campaigns from usePopupStore (created via Admin Popup Management)
    let popupCampaignsList: any[] = [];
    try {
      const { usePopupStore } = await import('../store/usePopupStore');
      popupCampaignsList = usePopupStore.getState().popupCampaigns || [];
    } catch {
      // ignore
    }

    const popupOffers = popupCampaignsList
      .filter(p => p.status === 'ACTIVE')
      .map(p => ({
        id: p.id,
        title: p.title || p.campaignValue,
        description: p.subtitle,
        image_url: p.bannerUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=200',
        status: 'active' as const,
        products: p.selectedProducts || [],
        categories: p.selectedCategories || [],
        coupon: p.discountPercentage ? {
          code: p.campaignValue ? p.campaignValue.toUpperCase().replace(/\s+/g, '') : 'EIDOFFER',
          discount_type: 'Percentage',
          discount_value: parseInt(p.discountPercentage) || 10,
          active: true
        } : undefined,
        created_at: new Date().toISOString()
      }));

    // Combine and deduplicate by id
    const combined = [...dbCampaigns, ...offerCampaigns, ...popupOffers];
    const uniqueMap = new Map();
    for (const c of combined) {
      if (c.id && !uniqueMap.has(c.id)) {
        uniqueMap.set(c.id, c);
      }
    }

    return Array.from(uniqueMap.values());
  },

  async createCampaign(campaign: Omit<Campaign, 'id'>, productIds: string[], categoryIds: string[], coupon?: Omit<Coupon, 'campaign_id'>) {
    await ensureDBSetup();
    const supabase = getSupabase();
    
    if (useFallback) {
      const data = await getFallbackData();
      const newCampaign = { ...campaign, id: `camp_${Date.now()}`, created_at: new Date().toISOString() };
      const newCoupon = coupon ? { ...coupon, campaign_id: newCampaign.id } : null;
      data.push({
        campaign: newCampaign,
        products: productIds.map(p => ({ product_id: p })),
        categories: categoryIds.map(c => ({ category_id: c })),
        coupon: newCoupon
      });
      await saveFallbackData(data);
      return newCampaign;
    }

    // Insert Campaign
    const { data: campData, error: campErr } = await supabase.from('campaigns').insert([campaign]).select().single();
    if (campErr) throw campErr;
    const campaignId = campData.id;

    // Insert Products
    if (productIds.length > 0) {
      await supabase.from('campaign_products').insert(
        productIds.map(id => ({ campaign_id: campaignId, product_id: id }))
      );
    }

    // Insert Categories
    if (categoryIds.length > 0) {
      await supabase.from('campaign_categories').insert(
        categoryIds.map(id => ({ campaign_id: campaignId, category_id: id }))
      );
    }

    // Insert Coupon
    if (coupon && coupon.code) {
      await supabase.from('coupons').insert([{
        ...coupon,
        campaign_id: campaignId
      }]);
    }
    
    return campData;
  },
  
  async deleteCampaign(id: string) {
    await ensureDBSetup();
    if (useFallback) {
      let data = await getFallbackData();
      data = data.filter(d => d.campaign.id !== id);
      await saveFallbackData(data);
      return;
    }
    const supabase = getSupabase();
    await supabase.from('campaigns').delete().eq('id', id);
  },
  
  async getCouponByCode(code: string): Promise<(Coupon & { campaign?: Campaign }) | null> {
    await ensureDBSetup();
    const supabase = getSupabase();
    if (useFallback) {
      const data = await getFallbackData();
      const match = data.find(d => d.coupon && d.coupon.code === code && d.coupon.active);
      if (!match) return null;
      return { ...match.coupon, campaign: match.campaign };
    }
    
    const { data, error } = await supabase.from('coupons').select('*, campaigns(*)').eq('code', code).eq('active', true).single();
    if (error) return null;
    return { ...data, campaign: data.campaigns };
  }
};
