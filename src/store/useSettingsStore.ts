import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  businessAddress: string;
  country: string;
  division: string;
  city: string;
  zipCode: string;
  googleMapEmbed: string;

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

  // 12. Social Media Settings
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  youtubeUrl: string;
  whatsappNumber: string;
  telegramLink: string;

  // 13. Security Settings
  admin2fa: boolean;
  loginDeviceHistory: boolean;
  failedLoginProtection: boolean;
  ipRestriction: boolean;

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

  businessAddress: '123 Luxury Avenue, Gulshan 2',
  country: 'Bangladesh',
  division: 'Dhaka',
  city: 'Dhaka',
  zipCode: '1212',
  googleMapEmbed: '',

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

  facebookUrl: '',
  instagramUrl: '',
  tiktokUrl: '',
  youtubeUrl: '',
  whatsappNumber: '',
  telegramLink: '',

  admin2fa: false,
  loginDeviceHistory: true,
  failedLoginProtection: true,
  ipRestriction: false,

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
};

interface SettingsState {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      updateSettings: (updates) => set((state) => ({ settings: { ...state.settings, ...updates } })),
    }),
    {
      name: 'luxemart-settings-v2',
    }
  )
);
