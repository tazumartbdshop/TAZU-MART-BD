import { create } from 'zustand';
import { getSupabase } from '../lib/supabase';
import { objectToSnake, objectToCamel } from '../lib/supabaseUtils';
import { useBrandingStore } from './useBrandingStore';

export interface AppSettings {
  // 1. Store Identity
  storeName: string;
  storeEmail: string;
  contactNumber: string;
  timezone: string;
  websiteUrl: string;
  storeSlug: string;
  businessType: string;
  storeTagline: string;
  storeDescription?: string;

  // 2. Branding
  primaryColor: string;
  secondaryColor: string;
  footerContentColor: string;
  footerHeadingColor: string;
  footerMutedColor: string;
  footerIconColor: string;
  footerSmallTextColor?: string;
  footerCopyrightColor?: string;
  storeLogo?: string;
  favicon?: string;
  mobileSplash?: string;
  invoiceLogo?: string;
  packagingLogo?: string;

  // 3. Business Address
  businessName: string;
  contactPerson: string;
  houseBuilding: string;
  roadStreet: string;
  areaThana: string;
  city: string;
  division: string;
  district: string;
  zipCode: string;
  country: string;
  phone: string;
  email: string;
  googleMapLink: string;

  // 4. Business Owner
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  nationalId: string;
  ownerProfilePhoto?: string;

  // 5. Customer Login Settings
  customerRegistration: boolean;
  otpLogin: boolean;
  gmailLogin: boolean;
  passwordLogin: boolean;
  autoAccountCreate: boolean;

  // 6. Order Settings
  autoOrderId: boolean;
  autoInvoice: boolean;
  orderTracking: boolean;
  deliveryStatus: boolean;
  cancelOrder: boolean;
  returnOrder: boolean;

  // 7. Delivery & Shipping
  defaultDeliveryCharge: number;
  insideCityCharge: number;
  outsideCityCharge: number;
  expressDeliveryCharge: number;
  estimatedDeliveryTime: string;

  // 8. Payment Settings
  codEnabled: boolean;
  cardEnabled: boolean;
  bkashEnabled: boolean;
  nagadEnabled: boolean;
  rocketEnabled: boolean;
  bankTransferEnabled: boolean;
  bkashNumber: string;
  nagadNumber: string;
  rocketNumber: string;
  bankDetails: string;
  paymentInstructions: string;

  // Extended dynamic payment custom fields
  codLogo?: string;
  codName?: string;
  codInstruction?: string;

  bkashLogo?: string;
  bkashName?: string;
  bkashInstruction?: string;

  nagadLogo?: string;
  nagadName?: string;
  nagadInstruction?: string;

  rocketLogo?: string;
  rocketName?: string;
  rocketInstruction?: string;

  cardLogo?: string;
  cardName?: string;
  cardNumber?: string;
  cardGatewayLink?: string;
  cardInstruction?: string;

  // Personal vs Merchant payments active switches
  paymentPersonalActive: boolean;
  paymentMerchantActive: boolean;

  // Merchant structures
  merchantGateway?: 'bkash' | 'nagad' | 'rocket' | 'sslcommerz' | 'other';
  merchantName?: string;
  merchantNumber?: string;
  merchantApiKey?: string;
  merchantApiSecret?: string;
  merchantUsername?: string;
  merchantPassword?: string;
  merchantStoreId?: string;
  merchantCallbackUrl?: string;
  merchantSuccessUrl?: string;
  merchantCancelUrl?: string;

  // 9. Email & Notifications
  smtpSettings: string;
  orderConfirmationEmail: boolean;
  smsNotification: boolean;
  pushNotification: boolean;
  shippingUpdate: boolean;

  // 10. Invoice Settings
  invoicePrefix: string;
  invoiceFooterText: string;
  returnPolicy: string;
  currencySymbol: string;
  invoiceTheme: 'white-black' | 'dark' | 'minimal';
  autoPrintOption: boolean;
  watermarkLogo?: string;
  customerSupportNumber: string;

  // 11. SEO Settings
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  openGraphImage?: string;
  googleAnalyticsCode: string;
  facebookPixelCode: string;
  googleSearchConsoleCode?: string;

  // 12. Social Media Settings
  facebookUrl: string;
  facebookEnabled: boolean;
  facebookPageUrl: string;
  facebookPageEnabled: boolean;
  messengerUrl: string;
  messengerEnabled: boolean;
  whatsappNumber: string;
  whatsappEnabled: boolean;
  instagramUrl: string;
  instagramEnabled: boolean;
  youtubeUrl: string;
  youtubeEnabled: boolean;
  tiktokUrl: string;
  tiktokEnabled: boolean;
  telegramLink: string; // compatibility
  telegramUrl: string;
  telegramEnabled: boolean;
  twitterUrl: string;
  twitterEnabled: boolean;
  linkedinUrl: string;
  linkedinEnabled: boolean;

  // 13. Security Settings
  admin2fa: boolean;
  loginDeviceHistory: boolean;
  failedLoginProtection: boolean;
  ipRestriction: boolean;
  adminEmail?: string;
  adminPassword?: string;

  // 14. Website Appearance
  darkModeToggle: boolean;
  themeColor: string;
  fontStyle: string;
  mobileLayoutToggle: boolean;

  // 15. Checkout Settings
  guestCheckout: boolean;
  gmailRequired: boolean;
  phoneRequired: boolean;
  addressRequired: boolean;
  checkoutNote: boolean;

  // 16. Customer Support
  hotlineNumber: string;
  liveChatEnable: boolean;
  whatsappChatButton: boolean;
  aiChatSupport: boolean;
  supportEmail: string;

  // 17. File & Media
  maxUploadSize: string;
  allowedFileTypes: string;
  videoUploadEnable: boolean;
  cloudStorageEnable: boolean;

  // 18. Backup & System
  autoBackup: boolean;
  coin_rate_coin: number;
  coin_rate_money: number;

  // 19. Promotion & Offers
  flashSaleEnabled: boolean;
  flashSaleEndTime: string;
  allowStackDiscount: boolean;
  
  // 20. Supabase Settings
  supabaseUrl: string;
  supabaseKey: string;
}

const defaultSettings: AppSettings = {
  storeName: '',
  storeEmail: '',
  contactNumber: '',
  timezone: '',
  websiteUrl: '',
  storeSlug: '',
  businessType: '',
  storeTagline: '',
  storeDescription: '',

  primaryColor: '#000000',
  secondaryColor: '#666666',
  footerContentColor: '#E5E5E5',
  footerHeadingColor: '#FFFFFF',
  footerMutedColor: '#B8B8B8',
  footerIconColor: '#DADADA',
  footerSmallTextColor: '#B8B8B8',
  footerCopyrightColor: '#B8B8B8',

  businessName: 'TAZU MART BD',
  contactPerson: 'Admin',
  houseBuilding: '39 কাজী ভবন',
  roadStreet: '',
  areaThana: '',
  city: 'Dhaka',
  division: 'Dhaka',
  district: 'Dhaka',
  zipCode: '1212',
  country: 'Bangladesh',
  phone: '+880 1711223344',
  email: 'admin@tazumartbd.com',
  googleMapLink: 'https://maps.google.com/?q=39+Kazi+Bhaban,Dhaka',

  ownerName: 'Admin Owner',
  ownerEmail: 'owner@tazumartbd.com',
  ownerPhone: '+880 1711223344',
  nationalId: '',

  customerRegistration: true,
  otpLogin: true,
  gmailLogin: true,
  passwordLogin: true,
  autoAccountCreate: true,

  autoOrderId: true,
  autoInvoice: true,
  orderTracking: true,
  deliveryStatus: true,
  cancelOrder: false,
  returnOrder: false,

  defaultDeliveryCharge: 60,
  insideCityCharge: 60,
  outsideCityCharge: 120,
  expressDeliveryCharge: 150,
  estimatedDeliveryTime: '2-3 Days',

  codEnabled: true,
  cardEnabled: false,
  bkashEnabled: true,
  nagadEnabled: true,
  rocketEnabled: true,
  bankTransferEnabled: false,
  bkashNumber: '01711223344',
  nagadNumber: '01811223344',
  rocketNumber: '01911223344',
  bankDetails: '',
  paymentInstructions: 'Please send money and enter TXN ID',

  codLogo: '',
  codName: 'Cash on Delivery',
  codInstruction: 'Pay with cash upon receiving your order at your doorstep.',

  bkashLogo: '',
  bkashName: 'bKash Personal',
  bkashInstruction: 'Please Send Money to the bKash Personal number above. Enter your bKash wallet number and your transaction reference ID (TxnID) below to process.',

  nagadLogo: '',
  nagadName: 'Nagad Personal',
  nagadInstruction: 'Please Send Money to the Nagad Personal number above. Enter your Nagad wallet number and your transaction reference ID (TxnID) below to process.',

  rocketLogo: '',
  rocketName: 'Rocket Personal',
  rocketInstruction: 'Please Send Money to the Rocket Personal number above. Enter your Rocket wallet number and your transaction reference ID (TxnID) below to process.',

  cardLogo: '',
  cardName: 'Secure SSL Gateway',
  cardNumber: 'Secure 256-Bit Sandbox Handshake',
  cardGatewayLink: '',
  cardInstruction: 'Please authorize card payment securely via our sandbox-integrated SSL connection gateway.',

  paymentPersonalActive: true,
  paymentMerchantActive: false,
  merchantGateway: 'sslcommerz',
  merchantName: 'bKash Merchant Pay',
  merchantNumber: '01700990099',
  merchantApiKey: 'bk_api_key_88abec97',
  merchantApiSecret: 'bk_sec_9934bc76',
  merchantUsername: 'tazumart_merchant',
  merchantPassword: '••••••••',
  merchantStoreId: 'tazum5019',
  merchantCallbackUrl: 'https://ais-pre-bprxi4s6ojh56gigyoabm3-918145641738.asia-southeast1.run.app/api/payment/callback',
  merchantSuccessUrl: 'https://tazumart.bd/checkout/success',
  merchantCancelUrl: 'https://tazumart.bd/checkout/cancel',

  smtpSettings: '',
  orderConfirmationEmail: true,
  smsNotification: true,
  pushNotification: false,
  shippingUpdate: true,

  invoicePrefix: 'INV-',
  invoiceFooterText: 'Thank you for shopping with us!',
  returnPolicy: '7 days exchange available.',
  currencySymbol: '৳',
  invoiceTheme: 'white-black',
  autoPrintOption: false,
  customerSupportNumber: '+880 1711223344',

  metaTitle: 'TAZU MART BD - Online Store',
  metaDescription: 'Description here',
  keywords: 'ecommerce, bangladesh, shopping',
  googleAnalyticsCode: '',
  facebookPixelCode: '',
  googleSearchConsoleCode: '',

  facebookUrl: 'https://facebook.com/tazumartbd',
  facebookEnabled: true,
  facebookPageUrl: 'https://facebook.com/tazumartbd.page',
  facebookPageEnabled: true,
  messengerUrl: 'https://m.me/tazumartbd',
  messengerEnabled: true,
  whatsappNumber: '+8801711223344',
  whatsappEnabled: true,
  instagramUrl: 'https://instagram.com/tazumartbd',
  instagramEnabled: true,
  youtubeUrl: 'https://youtube.com/tazumartbd/videos',
  youtubeEnabled: false,
  tiktokUrl: 'https://tiktok.com/@tazumartbd',
  tiktokEnabled: false,
  telegramLink: 'https://t.me/tazumartbd',
  telegramUrl: 'https://t.me/tazumartbd',
  telegramEnabled: true,
  twitterUrl: 'https://twitter.com/tazumartbd',
  twitterEnabled: false,
  linkedinUrl: 'https://linkedin.com/company/tazumartbd',
  linkedinEnabled: false,

  admin2fa: false,
  loginDeviceHistory: true,
  failedLoginProtection: true,
  ipRestriction: false,
  adminEmail: 'admin.tazumartbd@gmail.com',
  adminPassword: '8963885522',

  darkModeToggle: false,
  themeColor: '#000000',
  fontStyle: 'Outfit',
  mobileLayoutToggle: true,

  guestCheckout: true,
  gmailRequired: false,
  phoneRequired: true,
  addressRequired: true,
  checkoutNote: true,

  hotlineNumber: '+880 1711223344',
  liveChatEnable: false,
  whatsappChatButton: true,
  aiChatSupport: false,
  supportEmail: 'support@tazumartbd.com',

  maxUploadSize: '5MB',
  allowedFileTypes: 'PNG, JPG, PDF',
  videoUploadEnable: false,
  cloudStorageEnable: false,

  autoBackup: true,
  coin_rate_coin: 100,
  coin_rate_money: 1,

  flashSaleEnabled: true,
  flashSaleEndTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  allowStackDiscount: false,
  
  supabaseUrl: '',
  supabaseKey: '',
};

interface SettingsState {
  settings: AppSettings;
  draftSettings: AppSettings;
  isLoaded: boolean;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  updateDraftSettings: (updates: Partial<AppSettings>) => void;
  publishSettings: () => Promise<void>;
  resetDraftSettings: () => void;
  subscribe: () => () => void;
  fetchLatestLogo: () => Promise<string | null>;
}

// Robust helper to write logo to site_settings with fallback schemas
const saveLogoToSiteSettings = async (logoUrl: string) => {
  const supabase = getSupabase();
  if (!supabase || !logoUrl) return;

  console.log("Upserting logo to site_settings table:", logoUrl);
  const cleanUrl = logoUrl.split('?')[0];

  try {
    const dbPayload = objectToSnake({ 
      id: 'logo', 
      logoUrl: cleanUrl, 
      logo: cleanUrl,
      url: cleanUrl,
      value: cleanUrl,
      updatedAt: new Date().toISOString()
    });
    // Attempt 1: ID-column oriented row
    const { error: err1 } = await supabase.from('site_settings').upsert([dbPayload]);
    
    if (err1) {
      console.warn("site_settings upsert format 1 failed, trying format 2...", err1.message);
      // Attempt 2: Key-value oriented row
      const dbPayload2 = objectToSnake({ 
        key: 'logo_url', 
        value: cleanUrl,
        logoUrl: cleanUrl,
        updatedAt: new Date().toISOString()
      });
      const { error: err2 } = await supabase.from('site_settings').upsert([dbPayload2]);
      
      if (err2) {
        console.warn("site_settings upsert format 2 failed, trying format 3...", err2.message);
        // Attempt 3: Key-value alternative row
        await supabase.from('site_settings').upsert([objectToSnake({ 
          key: 'logo', 
          value: cleanUrl, 
          updatedAt: new Date().toISOString() 
        })]);
      }
    }
  } catch (e) {
    console.warn("site_settings upsert caught error:", e);
  }
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: defaultSettings,
  draftSettings: defaultSettings,
  isLoaded: false,
  fetchLatestLogo: async () => {
    const supabase = getSupabase();
    if (!supabase) return null;
    try {
      const { data, error } = await supabase.from('site_settings').select('*');
      if (error) {
        console.warn("Could not query 'site_settings' table (may not exist or is loading):", error.message);
        return null;
      }
      
      if (data && data.length > 0) {
        let foundUrl = '';
        const keysToSearch = ['logo_url', 'logoUrl', 'value', 'url', 'storeLogo', 'logo'];
        for (const row of data) {
          const camelRow = objectToCamel(row);
          for (const k of keysToSearch) {
            if (camelRow[k] && typeof camelRow[k] === 'string' && camelRow[k].startsWith('http')) {
              foundUrl = camelRow[k];
              break;
            }
          }
          if (foundUrl) break;
        }

        if (foundUrl) {
          const cleanUrl = foundUrl.split('?')[0];
          // Cache bust URL by appending current timestamp
          const bustedUrl = `${cleanUrl}?t=${Date.now()}`;
          
          set((state) => ({
            settings: { ...state.settings, storeLogo: bustedUrl },
            draftSettings: { ...state.draftSettings, storeLogo: bustedUrl }
          }));
          return bustedUrl;
        }
      }
    } catch (err) {
      console.error("Error fetching logo from site_settings:", err);
    }
    return null;
  },
  updateSettings: async (updates) => {
    const { settings } = get();
    const newSettings = { ...settings, ...updates };

    const supabase = getSupabase();
    if (!supabase) {
      throw new Error("Supabase is not initialized. Please connect your database first.");
    }

    // 1. Sync to store_identity table (Master Source of Truth)
    const identityPayload = objectToSnake({
      id: 'global',
      store_name: newSettings.storeName,
      store_slug: newSettings.storeSlug,
      store_description: newSettings.storeDescription || newSettings.storeTagline,
      support_email: newSettings.supportEmail || newSettings.storeEmail,
      contact_number: newSettings.contactNumber,
      website_url: newSettings.websiteUrl,
      timezone: newSettings.timezone,
      industry: newSettings.businessType,
      primary_logo: newSettings.storeLogo,
      updated_at: new Date().toISOString()
    });

    const { error: identityError } = await supabase.from('store_identity').upsert([identityPayload]);
    if (identityError) {
      console.error("Supabase store_identity update fail:", identityError);
      throw new Error(`[Database Table: store_identity] Save failed: ${identityError.message}. Make sure the table exists and Row Level Security (RLS) is configured correctly.`);
    }

    // 2. Double-check persistence by querying back the master record immediately
    const { data: verifyData, error: verifyError } = await supabase
      .from('store_identity')
      .select('store_name, store_slug')
      .eq('id', 'global')
      .single();

    if (verifyError || !verifyData) {
      throw new Error(`Database verification failed: Could not read back the saved record from the 'store_identity' table. Details: ${verifyError?.message || 'Empty record'}`);
    }

    // 3. Update main settings table (as JSON in 'value' column to avoid schema issues)
    const dbPayload = { 
        id: 'global', 
        value: JSON.stringify(objectToSnake(newSettings)),
        updated_at: new Date().toISOString()
    };
    const { error: settingsError } = await supabase.from('settings').upsert([dbPayload]);
    if (settingsError && settingsError.code !== '42P01') {
      console.error("Supabase settings update fail:", settingsError);
    }
    
    // 4. Update the local states only after DB confirmation and verification
    set({ settings: newSettings, draftSettings: newSettings });
    
    // 5. Propagate to branding if logo changed
    if (updates.storeLogo) {
      await saveLogoToSiteSettings(updates.storeLogo);
      
      const logoUrl = updates.storeLogo;
      const brandingUpdates = {
        primary_logo: logoUrl,
        secondary_logo: logoUrl,
        favicon: logoUrl,
        apple_touch_icon: logoUrl,
        mobile_logo: logoUrl,
        desktop_logo: logoUrl,
        dark_logo: logoUrl,
        light_logo: logoUrl,
        footer_logo: logoUrl,
        invoice_logo: logoUrl,
        email_logo: logoUrl,
        loading_logo: logoUrl,
        watermark_logo: logoUrl,
        share_logo: logoUrl,
        login_logo: logoUrl,
        signup_logo: logoUrl,
        updated_at: new Date().toISOString()
      };
      
      const { error: brandingError } = await supabase.from('branding_settings').upsert([{ id: 'global', ...brandingUpdates }]);
      if (brandingError) {
        console.warn("Failed to update branding_settings:", brandingError.message);
      }
      useBrandingStore.getState().fetchBranding();
    }
  },
  updateDraftSettings: (updates) => {
    set((state) => ({ draftSettings: { ...state.draftSettings, ...updates } }));
  },
  publishSettings: async () => {
    try {
      const draft = get().draftSettings;

      const supabase = getSupabase();
      if (!supabase) {
        throw new Error("Supabase is not initialized.");
      }

      // 1. Sync to store_identity table
      const identityPayload = objectToSnake({
        id: 'global',
        store_name: draft.storeName,
        store_slug: draft.storeSlug,
        store_description: draft.storeDescription || draft.storeTagline,
        support_email: draft.supportEmail || draft.storeEmail,
        contact_number: draft.contactNumber,
        website_url: draft.websiteUrl,
        timezone: draft.timezone,
        industry: draft.businessType,
        primary_logo: draft.storeLogo,
        updated_at: new Date().toISOString()
      });
      const { error: identityError } = await supabase.from('store_identity').upsert([identityPayload]);
      if (identityError) {
        throw new Error(`[Database Table: store_identity] Publish failed: ${identityError.message}`);
      }

      // 2. Update settings table
      const dbPayload = { 
        id: 'global', 
        value: JSON.stringify(objectToSnake(draft)),
        updated_at: new Date().toISOString()
      };
      const { error: settingsError } = await supabase.from('settings').upsert([dbPayload]);
      if (settingsError && settingsError.code !== '42P01') throw settingsError;
      
      // 3. Branding propagation
      if (draft.storeLogo) {
        await saveLogoToSiteSettings(draft.storeLogo);
        const logoUrl = draft.storeLogo;
        const brandingUpdates = {
          primary_logo: logoUrl,
          secondary_logo: logoUrl,
          favicon: logoUrl,
          apple_touch_icon: logoUrl,
          mobile_logo: logoUrl,
          desktop_logo: logoUrl,
          dark_logo: logoUrl,
          light_logo: logoUrl,
          footer_logo: logoUrl,
          invoice_logo: logoUrl,
          email_logo: logoUrl,
          loading_logo: logoUrl,
          watermark_logo: logoUrl,
          share_logo: logoUrl,
          login_logo: logoUrl,
          signup_logo: logoUrl,
          updated_at: new Date().toISOString()
        };
        await supabase.from('branding_settings').upsert([{ id: 'global', ...brandingUpdates }]);
        useBrandingStore.getState().fetchBranding();
      }

      set({ settings: draft });
      console.log("Settings published to Supabase");
    } catch (error) {
      console.error("Supabase publishSettings error:", error);
      throw error;
    }
  },
  resetDraftSettings: () => set((state) => ({ draftSettings: state.settings })),
  subscribe: () => {
    const supabase = getSupabase();
    
    // Always fall back to local if no supabase
    if (!supabase) {
        set({ settings: defaultSettings, draftSettings: defaultSettings, isLoaded: true });
        return () => {};
    }
    
    // Load setting collections
    const loadData = async () => {
      const supabase = getSupabase();
      if (!supabase) return;

      // 1. Load from main settings
      const { data: settingsData, error: settingsError } = await supabase.from('settings').select('*').eq('id', 'global').limit(1);
      
      // 2. Load from store_identity (Priority Source of Truth for identity fields)
      const { data: identityData, error: identityError } = await supabase.from('store_identity').select('*').eq('id', 'global').limit(1);

      let mergedSettings = { ...defaultSettings };

      if (!settingsError && settingsData && settingsData.length > 0) {
          const row = settingsData[0];
          // Support both flat columns and JSON wrapper
          if (row.value) {
            try {
              const parsedValue = typeof row.value === 'string' ? JSON.parse(row.value) : row.value;
              mergedSettings = { ...mergedSettings, ...objectToCamel(parsedValue) };
            } catch (e) {
              mergedSettings = { ...mergedSettings, ...objectToCamel(row) };
            }
          } else {
            mergedSettings = { ...mergedSettings, ...objectToCamel(row) };
          }
      }

      if (!identityError && identityData && identityData.length > 0) {
          const idData = objectToCamel(identityData[0]);
          mergedSettings = {
            ...mergedSettings,
            storeName: idData.storeName || mergedSettings.storeName,
            storeSlug: idData.storeSlug || mergedSettings.storeSlug,
            storeDescription: idData.storeDescription || mergedSettings.storeDescription,
            supportEmail: idData.supportEmail || idData.storeEmail || mergedSettings.supportEmail,
            contactNumber: idData.contactNumber || mergedSettings.contactNumber,
            websiteUrl: idData.websiteUrl || mergedSettings.websiteUrl,
            timezone: idData.timezone || mergedSettings.timezone,
            businessType: idData.industry || idData.businessType || mergedSettings.businessType,
            storeLogo: idData.primaryLogo || idData.storeLogo || mergedSettings.storeLogo
          };
      }

      set({ settings: mergedSettings, draftSettings: mergedSettings, isLoaded: true });
      get().fetchLatestLogo();
    };

    loadData();

    const channel = supabase
      .channel('public:settings:' + Math.random().toString(36).substring(2, 9))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, (payload) => {
        loadData();
      })
      .subscribe();

    // Setup listener on store_identity
    const channelIdentity = supabase
      .channel('public:store_identity:' + Math.random().toString(36).substring(2, 9))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'store_identity' }, (payload) => {
        loadData();
      })
      .subscribe();
      
    // Setup listener on specialized site_settings table as well
    const channelLogo = supabase
      .channel('public:site_settings:' + Math.random().toString(36).substring(2, 9))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, (payload) => {
        console.log("Real-time site_settings update received!");
        get().fetchLatestLogo();
      })
      .subscribe();
      
    return () => {
        supabase.removeChannel(channel);
        supabase.removeChannel(channelLogo);
        supabase.removeChannel(channelIdentity);
    }
  }
}));
