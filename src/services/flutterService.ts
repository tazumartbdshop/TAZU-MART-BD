export interface FlutterBrandConfig {
  name: string;
  logoUrl: string;
  brandColor: string;
  footerBgColor: string;
  textColor: string;
  footerContentColor?: string;
  footerHeadingColor?: string;
  footerMutedColor?: string;
  footerIconColor?: string;
  footerSmallTextColor?: string;
  footerCopyrightColor?: string;
  autoContrast?: boolean;
}

export interface FlutterDescriptionConfig {
  short: string;
  long: string;
  copyright: string;
}

export interface SocialLink {
  platform: string;
  icon: string;
  url: string;
  enabled: boolean;
}

export interface QuickLink {
  name: string;
  url: string;
  order: number;
}

export interface ContactConfig {
  address: string;
  phone: string;
  email: string;
  officeTime: string;
  mapLink: string;
}

export interface DesignConfig {
  padding: number;
  borderRadius: number;
  divider: boolean;
  shadow: boolean;
  iconSize: number;
  textSize: number;
  layout: 'compact' | 'premium' | 'minimal';
}

export interface FlutterConfig {
  brand: FlutterBrandConfig;
  description: FlutterDescriptionConfig;
  socialLinks: SocialLink[];
  quickLinks: QuickLink[];
  contact: ContactConfig;
  design: DesignConfig;
}

const DEFAULT_CONFIG: FlutterConfig = {
  brand: {
    name: 'TAZU MART BD',
    logoUrl: '',
    brandColor: '#000000',
    footerBgColor: '#000000',
    textColor: '#ffffff',
    footerContentColor: '#E5E5E5',
    footerHeadingColor: '#FFFFFF',
    footerMutedColor: '#B8B8B8',
    footerIconColor: '#DADADA',
    footerSmallTextColor: '#B8B8B8',
    footerCopyrightColor: '#888888',
    autoContrast: true,
  },
  description: {
    short: 'Premium E-commerce platform offering the finest collection of luxury items.',
    long: 'We provide high-quality products directly to your doorstep with the best customer service in Bangladesh.',
    copyright: '© 2026 TAZU MART BD. All rights reserved.',
  },
  socialLinks: [
    { platform: 'Facebook', icon: 'facebook', url: '', enabled: true },
    { platform: 'Instagram', icon: 'instagram', url: '', enabled: true },
    { platform: 'TikTok', icon: 'music-2', url: '', enabled: false },
    { platform: 'YouTube', icon: 'youtube', url: '', enabled: false },
    { platform: 'WhatsApp', icon: 'message-circle', url: '', enabled: true },
  ],
  quickLinks: [
    { name: 'About Us', url: '/about', order: 1 },
    { name: 'Contact', url: '/contact', order: 2 },
    { name: 'Privacy Policy', url: '/privacy', order: 3 },
    { name: 'Terms & Conditions', url: '/terms', order: 4 },
    { name: 'Refund Policy', url: '/refund', order: 5 },
  ],
  contact: {
    address: '123 E-commerce St, Dhaka, Bangladesh',
    phone: '+880 1234 567 890',
    email: 'support@tazumart.bd',
    officeTime: 'Sat - Thu: 10AM - 8PM',
    mapLink: '',
  },
  design: {
    padding: 32,
    borderRadius: 0,
    divider: true,
    shadow: true,
    iconSize: 22,
    textSize: 14,
    layout: 'premium',
  },
};

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/db';

export const getFlutterConfig = async (): Promise<FlutterConfig> => {
  try {
    const docSnap = await getDoc(doc(db, 'settings', 'flutter_config'));
    if (docSnap.exists()) {
      return docSnap.data() as FlutterConfig;
    } else {
      // Seed default config into Firestore on first load
      await setDoc(doc(db, 'settings', 'flutter_config'), DEFAULT_CONFIG);
      return DEFAULT_CONFIG;
    }
  } catch (err: any) {
    console.warn("Could not read flutter config from Firestore:", err?.message || err);
    return DEFAULT_CONFIG;
  }
};

export const saveFlutterConfig = async (config: FlutterConfig): Promise<void> => {
  try {
    await setDoc(doc(db, 'settings', 'flutter_config'), config, { merge: true });
  } catch (err: any) {
    console.error("Could not save flutter config to Firestore:", err?.message || err);
    throw err;
  }
};
