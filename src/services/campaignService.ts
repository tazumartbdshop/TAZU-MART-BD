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
    if (useFallback) {
      const data = await getFallbackData();
      return data.filter(d => d.campaign.status === 'active').map(d => ({
        ...d.campaign,
        products: d.products.map(p => p.product_id),
        categories: d.categories.map(c => c.category_id),
        coupon: d.coupon
      }));
    }
    // Using Supabase relationships (if foreign keys exist)
    const { data, error } = await supabase
      .from('campaigns')
      .select('*, campaign_products(product_id), campaign_categories(category_id), coupons(*)')
      .eq('status', 'active');
      
    if (error) throw error;
    
    return data.map((d: any) => ({
      ...d,
      products: d.campaign_products?.map((p: any) => p.product_id) || [],
      categories: d.campaign_categories?.map((c: any) => c.category_id) || [],
      coupon: d.coupons?.[0]
    }));
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
