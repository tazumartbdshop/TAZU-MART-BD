import { create } from 'zustand';
import { getSupabase } from '../lib/supabase';
import { objectToSnake, objectToCamel } from '../lib/supabaseUtils';

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
  storeName: 'TAZU MART BD',
  storeEmail: 'admin@tazumartbd.com',
  contactNumber: '+880 1711223344',
  timezone: 'Asia/Dhaka (GMT+6)',
  websiteUrl: 'https://tazumart.bd',
  storeSlug: 'tazumart',
  businessType: 'Retail E-commerce',
  storeTagline: 'Quality Products at Best Prices',

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
  updateSettings: (updates: Partial<AppSettings>) => void;
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
    const newSettings = { ...get().settings, ...updates };
    set({ settings: newSettings });
    
    const supabase = getSupabase();
    if (supabase) {
        const dbPayload = objectToSnake({ id: 'global', ...newSettings });
        // Assume document structure with id 'global'
        const { error } = await supabase.from('settings').upsert([dbPayload]);
        if (error && error.code !== '42P01') console.error("Supabase settings update fail", error);
        
        // Also save to specialized site_settings table if storeLogo is updated
        if (updates.storeLogo) {
          await saveLogoToSiteSettings(updates.storeLogo);
        }
    }
  },
  updateDraftSettings: (updates) => {
    set((state) => ({ draftSettings: { ...state.draftSettings, ...updates } }));
  },
  publishSettings: async () => {
    try {
      const draft = get().draftSettings;

      const supabase = getSupabase();
      if (supabase) {
          const dbPayload = objectToSnake({ id: 'global', ...draft });
          const { error } = await supabase.from('settings').upsert([dbPayload]);
          if (error && error.code !== '42P01') throw error;
          
          // Also save to specialized site_settings table if storeLogo exists in draft
          if (draft.storeLogo) {
            await saveLogoToSiteSettings(draft.storeLogo);
          }
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
    supabase.from('settings').select('*').eq('id', 'global').limit(1).then(({ data, error }) => {
        if (!error && data && data.length > 0) {
            const camelData = objectToCamel(data[0]);
            const mergedSettings = { ...defaultSettings, ...camelData };
            set({ settings: mergedSettings, draftSettings: mergedSettings, isLoaded: true });
        } else {
            // Initial seed if not exist
            const dbPayload = objectToSnake({ id: 'global', ...defaultSettings });
            supabase.from('settings').upsert([dbPayload]).then(({error}) => error && console.warn(error));
            set({ settings: defaultSettings, draftSettings: defaultSettings, isLoaded: true });
        }
        
        // Always load latest logo from site_settings immediately on page initialization
        get().fetchLatestLogo();
    });

    const channel = supabase
      .channel('public:settings:' + Math.random().toString(36).substring(2, 9))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, (payload) => {
        supabase.from('settings').select('*').eq('id', 'global').limit(1).then(({ data, error }) => {
            if (!error && data && data.length > 0) {
                const camelData = objectToCamel(data[0]);
                const mergedSettings = { ...defaultSettings, ...camelData };
                set({ settings: mergedSettings, draftSettings: mergedSettings, isLoaded: true });
                get().fetchLatestLogo();
            }
        });
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
    }
  }
}));
