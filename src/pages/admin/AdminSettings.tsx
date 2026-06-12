import React, { useState } from 'react';
import { 
  Store, Palette, MapPin, User, Users, ShoppingBag, 
  Truck, CreditCard, Bell, FileText, Search, Share2, 
  Shield, Monitor, ShoppingCart, HeadphonesIcon, Zap,
  Image as ImageIcon, Database, Menu, X, Plus, Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore, AppSettings } from '../../store/useSettingsStore';
import TemplateDraftBar from '../../components/admin/TemplateDraftBar';
import { useCategoryStore } from '../../store/useCategoryStore';
import { useProductStore } from '../../store/useProductStore';
import { useCustomerStore } from '../../store/useCustomerStore';
import { useOrderStore } from '../../store/useOrderStore';

const SETTING_MODULES = [
  { id: 'owner', name: 'Business Owner', icon: User, desc: 'Owner Information' },
  { id: 'login', name: 'Customer Login', icon: Users, desc: 'Registration & Login Config' },
  { id: 'order', name: 'Order Settings', icon: ShoppingBag, desc: 'Invoices & Tracking' },
  { id: 'delivery', name: 'Delivery & Shipping', icon: Truck, desc: 'Delivery Charges & Areas' },
  { id: 'payment', name: 'Payment Settings', icon: CreditCard, desc: 'Payment Gateways & Methods' },
  { id: 'notification', name: 'Email & Notification', icon: Bell, desc: 'SMTP, SMS, Push' },
  { id: 'invoice', name: 'Invoice Management', icon: FileText, desc: 'Company Branding, Customization & Themes' },
  { id: 'seo', name: 'SEO Settings', icon: Search, desc: 'Meta tags & Tracking' },
  { id: 'security', name: 'Security', icon: Shield, desc: '2FA & Login Protection' },
  { id: 'appearance', name: 'Appearance', icon: Monitor, desc: 'Dark Mode, Font, Layout' },
  { id: 'checkout', name: 'Checkout', icon: ShoppingCart, desc: 'Guest Checkout & Requirements' },
  { id: 'support', name: 'Customer Support', icon: HeadphonesIcon, desc: 'Hotline, Chat, Email' },
  { id: 'media', name: 'File & Media', icon: ImageIcon, desc: 'Upload Limits & Types' },
  { id: 'promotion', name: 'Promotion & Offers', icon: Zap, desc: 'Flash Sale, Discounts' },
  { id: 'supabase', name: 'Supabase Config', icon: Database, desc: 'Supabase Database Connection' },
  { id: 'system', name: 'Backup & System', icon: Database, desc: 'Backups & Cache' },
];

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('owner');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { settings, draftSettings, updateDraftSettings } = useSettingsStore();

  const categories = useCategoryStore((s) => s.categories);
  const products = useProductStore((s) => s.products);
  const customers = useCustomerStore((s) => s.customers);
  const orders = useOrderStore((s) => s.orders);

  const [formState, setFormState] = useState<AppSettings>(draftSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [nextTab, setNextTab] = useState<string | null>(null);

  // States for Image Removal Premium Popup System
  const [confirmRemoveField, setConfirmRemoveField] = useState<keyof AppSettings | null>(null);
  const [removeLabel, setRemoveLabel] = useState<string>('');

  // Sync with global store on mount / store changes
  React.useEffect(() => {
    setFormState(draftSettings);
  }, [draftSettings]);

  const activeModule = SETTING_MODULES.find(m => m.id === activeTab);

  const isDirty = JSON.stringify(formState) !== JSON.stringify(draftSettings);

  // Prompt before window close / page reload if dirty
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const handleUpdate = (key: keyof AppSettings, value: any) => {
    setFormState(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Premium 800ms state response delay
    await new Promise(resolve => setTimeout(resolve, 800));
    updateDraftSettings(formState);
    setIsSaving(false);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const handleCancel = () => {
    setFormState(draftSettings);
  };

  const handleTabChange = (tabId: string) => {
    if (isDirty) {
      setNextTab(tabId);
      setShowWarningModal(true);
    } else {
      setActiveTab(tabId);
    }
  };

  const Toggle = ({ label, field }: { label: string, field: keyof AppSettings }) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 border border-[#EEEEEE] rounded-none">
      <span className="text-sm font-black text-[#000000] uppercase tracking-widest">{label}</span>
      <button 
        type="button"
        onClick={() => handleUpdate(field, !formState[field])}
        className={`w-12 h-6 rounded-none p-1 transition-colors relative ${formState[field] ? 'bg-black' : 'bg-gray-300'}`}
      >
        <div className={`w-4 h-4 bg-white rounded-none transition-transform ${formState[field] ? 'translate-x-6' : 'translate-x-0'}`} />
      </button>
    </div>
  );

  const Input = ({ label, field, type = 'text', placeholder = '' }: { label: string, field: keyof AppSettings, type?: string, placeholder?: string }) => (
    <div>
      <label className="block text-[10px] font-black text-[#000000] mb-2 uppercase tracking-widest font-mono">{label}</label>
      <input 
        type={type} 
        value={(formState[field] ?? '') as string | number}
        onChange={(e) => handleUpdate(field, type === 'number' ? Number(e.target.value) : e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-white border border-[#222] rounded-none focus:outline-none focus:ring-1 focus:ring-black transition-all font-bold text-sm" 
      />
    </div>
  );

  const ImageUpload = ({ label, field }: { label: string, field: keyof AppSettings }) => (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-[#000000]">{label}</label>
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 bg-gray-50 border-2 border-dashed border-gray-300 rounded-[12px] flex items-center justify-center overflow-hidden">
          {(formState[field] as string) ? (
            <img src={formState[field] as string} alt="" className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="w-6 h-6 text-gray-400" />
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-block bg-white border border-[#000000] text-[#000000] px-4 py-2 rounded-[8px] text-sm font-bold hover:bg-gray-50 transition-colors cursor-pointer font-sans">
            Upload Image
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const { uploadImage } = await import('../../lib/imageUtils');
                  try {
                    const url = await uploadImage(file, 'banners', `settings-${field}-${Date.now()}`);
                    handleUpdate(field, url);
                  } catch (err) {
                    console.error('Failed to upload image:', err);
                    alert('Image upload failed');
                  }
                }
              }} 
            />
          </label>
          {(formState[field] as string) && (
            <button
              type="button"
              onClick={() => {
                setConfirmRemoveField(field);
                setRemoveLabel(label);
              }}
              style={{ borderRadius: '14px', fontWeight: 600 }}
              className="bg-[#FFEAEA] text-[#E53935] hover:bg-[#ffd5d5] px-4 py-2 text-sm font-semibold transition-colors cursor-pointer font-sans"
            >
              Remove Image
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'identity': return (
        <div className="space-y-6 max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-300">
          <Input label="Store Name" field="storeName" />
          <Input label="Store Tagline / Slogan" field="storeTagline" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Store Email" field="storeEmail" type="email" />
            <Input label="Contact Number" field="contactNumber" />
            <Input label="Website URL" field="websiteUrl" />
            <Input label="Store Slug / Code" field="storeSlug" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-[#000000] mb-2">Timezone</label>
              <select value={formState.timezone} onChange={e => handleUpdate('timezone', e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-[#EEEEEE] rounded-[10px] focus:outline-none focus:border-[#000000]">
                <option>Asia/Dhaka (GMT+6)</option>
                <option>Asia/Kolkata (GMT+5:30)</option>
                <option>UTC (GMT+0)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#000000] mb-2">Business Type</label>
              <select value={formState.businessType} onChange={e => handleUpdate('businessType', e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-[#EEEEEE] rounded-[10px] focus:outline-none focus:border-[#000000]">
                <option>Retail E-commerce</option>
                <option>Wholesale B2B</option>
                <option>Services</option>
              </select>
            </div>
          </div>
        </div>
      );
      case 'branding': return (
        <div className="space-y-8 max-w-3xl animate-in fade-in py-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-[#EEEEEE]">
            <ImageUpload label="Store Logo" field="storeLogo" />
            <ImageUpload label="Favicon" field="favicon" />
            <ImageUpload label="Mobile Splash Logo" field="mobileSplash" />
            <ImageUpload label="Invoice Logo" field="invoiceLogo" />
            <ImageUpload label="Packaging Logo" field="packagingLogo" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-[#000000] mb-2">Primary Color</label>
              <div className="flex gap-2">
                <input type="color" value={formState.primaryColor} onChange={e => handleUpdate('primaryColor', e.target.value)} className="w-12 h-10 rounded border-0 p-0 cursor-pointer" />
                <input type="text" value={formState.primaryColor} onChange={e => handleUpdate('primaryColor', e.target.value)} className="flex-1 px-4 py-2 bg-gray-50 border border-[#EEEEEE] rounded-[8px]" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#000000] mb-2">Secondary Color</label>
              <div className="flex gap-2">
                <input type="color" value={formState.secondaryColor} onChange={e => handleUpdate('secondaryColor', e.target.value)} className="w-12 h-10 rounded border-0 p-0 cursor-pointer" />
                <input type="text" value={formState.secondaryColor} onChange={e => handleUpdate('secondaryColor', e.target.value)} className="flex-1 px-4 py-2 bg-gray-50 border border-[#EEEEEE] rounded-[8px]" />
              </div>
            </div>
          </div>
        </div>
      );
      case 'address': return (
        <div className="space-y-6 max-w-3xl animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Business Name" field="businessName" />
            <Input label="Contact Person" field="contactPerson" />
            <Input label="House / Building" field="houseBuilding" />
            <Input label="Road / Street" field="roadStreet" />
            <Input label="Area / Thana" field="areaThana" />
            <Input label="City" field="city" />
            <Input label="Division" field="division" />
            <Input label="District" field="district" />
            <Input label="ZIP Code" field="zipCode" />
            <Input label="Country" field="country" />
            <Input label="Phone" field="phone" />
            <Input label="Email" field="email" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#000000] mb-2">Google Map Link</label>
            <textarea 
              value={formState.googleMapLink} 
              onChange={e => handleUpdate('googleMapLink', e.target.value)}
              rows={3} 
              className="w-full px-4 py-3 bg-gray-50 border border-[#EEEEEE] rounded-[10px] focus:outline-none focus:border-[#000000] transition-colors resize-none font-mono text-xs" 
              placeholder="https://maps.google.com/..."
            />
          </div>
        </div>
      );
      case 'owner': return (
        <div className="space-y-6 max-w-3xl animate-in fade-in">
          <ImageUpload label="Owner Profile Photo" field="ownerProfilePhoto" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Owner Name" field="ownerName" />
            <Input label="Owner Email" field="ownerEmail" type="email" />
            <Input label="Owner Phone" field="ownerPhone" />
            <Input label="National ID (Optional)" field="nationalId" />
          </div>
        </div>
      );
      case 'login': return (
        <div className="space-y-4 max-w-3xl animate-in fade-in">
          <Toggle label="Customer Registration" field="customerRegistration" />
          <Toggle label="OTP Login" field="otpLogin" />
          <Toggle label="Gmail Login (Google OAuth)" field="gmailLogin" />
          <Toggle label="Password Login" field="passwordLogin" />
          <Toggle label="Auto Account Create After Checkout" field="autoAccountCreate" />
        </div>
      );
      case 'order': return (
        <div className="space-y-4 max-w-3xl animate-in fade-in">
          <Toggle label="Auto Order ID Generate" field="autoOrderId" />
          <Toggle label="Auto Invoice Generate" field="autoInvoice" />
          <Toggle label="Order Tracking Enable" field="orderTracking" />
          <Toggle label="Delivery Status Enable" field="deliveryStatus" />
          <Toggle label="Cancel Order Option for Customers" field="cancelOrder" />
          <Toggle label="Return Order Option for Customers" field="returnOrder" />
        </div>
      );
      case 'delivery': return (
        <div className="space-y-6 max-w-3xl animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Default Delivery Charge (৳)" field="defaultDeliveryCharge" type="number" />
            <Input label="Inside City Charge (৳)" field="insideCityCharge" type="number" />
            <Input label="Outside City Charge (৳)" field="outsideCityCharge" type="number" />
            <Input label="Express Delivery Charge (৳)" field="expressDeliveryCharge" type="number" />
            <Input label="Estimated Delivery Time" field="estimatedDeliveryTime" placeholder="e.g. 2-3 Days" />
          </div>
        </div>
      );
      case 'payment': return (
        <div className="space-y-8 max-w-3xl animate-in fade-in">
          <div className="space-y-4">
             <h4 className="font-bold text-lg">Active Methods</h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <Toggle label="Cash On Delivery" field="codEnabled" />
               <Toggle label="Card Payment" field="cardEnabled" />
               <Toggle label="bKash" field="bkashEnabled" />
               <Toggle label="Nagad" field="nagadEnabled" />
               <Toggle label="Rocket" field="rocketEnabled" />
               <Toggle label="Bank Transfer" field="bankTransferEnabled" />
             </div>
          </div>
          <div className="space-y-6">
             <h4 className="font-bold text-lg">Account Details</h4>
             <Input label="bKash Number" field="bkashNumber" />
             <Input label="Nagad Number" field="nagadNumber" />
             <Input label="Rocket Number" field="rocketNumber" />
             <div>
               <label className="block text-sm font-semibold text-[#000000] mb-2">Bank Details</label>
               <textarea rows={3} value={settings.bankDetails} onChange={e => handleUpdate('bankDetails', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-[#EEEEEE] rounded-[10px]" placeholder="Bank Name, Account No, Routing..." />
             </div>
             <div>
               <label className="block text-sm font-semibold text-[#000000] mb-2">Payment Instructions (Shown at Checkout)</label>
               <textarea rows={2} value={settings.paymentInstructions} onChange={e => handleUpdate('paymentInstructions', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-[#EEEEEE] rounded-[10px]" />
             </div>
          </div>
        </div>
      );
      case 'notification': return (
        <div className="space-y-6 max-w-3xl animate-in fade-in">
          <Toggle label="Order Confirmation Email" field="orderConfirmationEmail" />
          <Toggle label="SMS Notification" field="smsNotification" />
          <Toggle label="Push Notification" field="pushNotification" />
          <Toggle label="Shipping Update Notification" field="shippingUpdate" />
          
          <div className="pt-4 border-t border-[#EEEEEE]">
             <label className="block text-sm font-semibold text-[#000000] mb-2">SMTP Email Settings JSON</label>
             <textarea rows={4} value={formState.smtpSettings} onChange={e => handleUpdate('smtpSettings', e.target.value)} className="w-full px-4 py-3 bg-[#0a0a0a] text-green-400 font-mono text-xs border border-gray-800 rounded-[10px] focus:outline-none" placeholder='{"host": "smtp.gmail.com", "port": 465}' />
          </div>
        </div>
      );
      case 'invoice': return (
        <div className="space-y-6 max-w-3xl animate-in fade-in">
          {/* Company Branding */}
          <div>
            <h3 className="font-bold text-lg mb-4">Company Branding</h3>
            <div className="space-y-4">
              <ImageUpload label="Company Logo" field="invoiceLogo" />
              <Input label="Company Name" field="storeName" placeholder="TAZU MART BD" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Support Gmail" field="storeEmail" placeholder="support@tazumartbd.com" />
                <Input label="Support Phone" field="contactNumber" placeholder="+8801XXXXXXXXX" />
              </div>
              <Input label="Website Link" field="websiteUrl" placeholder="www.tazumartbd.com" />
            </div>
          </div>

          {/* Customization */}
          <div className="pt-4 border-t border-gray-100">
            <h3 className="font-bold text-lg mb-4">Invoice Customization</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Invoice Prefix" field="invoicePrefix" placeholder="INV-" />
                <Input label="Currency Symbol" field="currencySymbol" placeholder="৳" />
              </div>
              <Input label="Footer Text" field="invoiceFooterText" placeholder="Thank you for shopping..." />
              <Input label="Return Policy" field="returnPolicy" placeholder="7 days exchange available." />
            </div>
          </div>

          {/* Theme */}
          <div className="pt-4 border-t border-gray-100">
            <h3 className="font-bold text-lg mb-4">Theme Settings</h3>
            <div>
              <label className="block text-sm font-semibold text-[#000000] mb-2">Invoice Theme</label>
              <select value={formState.invoiceTheme} onChange={e => handleUpdate('invoiceTheme', e.target.value as any)} className="w-full px-4 py-2.5 bg-gray-50 border border-[#EEEEEE] rounded-[10px] focus:outline-none focus:border-[#000000]">
                <option value="white-black">White & Black</option>
                <option value="dark">Dark</option>
                <option value="minimal">Minimal</option>
              </select>
            </div>
          </div>
        </div>
      );
      case 'seo': return (
        <div className="space-y-6 max-w-3xl animate-in fade-in">
          <Input label="Meta Title" field="metaTitle" />
          <Input label="Meta Description" field="metaDescription" />
          <Input label="Keywords" field="keywords" placeholder="ecommerce, shop, online" />
          <ImageUpload label="Open Graph (OG) Image" field="openGraphImage" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-[#000000] mb-2">Google Analytics Tracking ID</label>
              <input type="text" value={formState.googleAnalyticsCode} onChange={e => handleUpdate('googleAnalyticsCode', e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-[#EEEEEE] rounded-[10px]" placeholder="G-XXXXXXXXXX" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#000000] mb-2">Facebook Pixel ID</label>
              <input type="text" value={formState.facebookPixelCode} onChange={e => handleUpdate('facebookPixelCode', e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-[#EEEEEE] rounded-[10px]" placeholder="1234567890" />
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#000000] mb-2">
                Google Search Console Verification
              </label>
              <textarea
                value={formState.googleSearchConsoleCode || ''}
                onChange={e => handleUpdate('googleSearchConsoleCode', e.target.value)}
                className="w-full h-24 px-4 py-3 bg-gray-50 border border-[#EEEEEE] rounded-[10px] focus:outline-none focus:border-[#000000] font-mono text-xs text-gray-700 leading-normal"
                placeholder='<meta name="google-site-verification" content="RZG35iUF5Hzynte8o1WGNJG7-OtqhsoEkE_LpHD88qc" />'
              />
              <p className="text-xs text-gray-500 mt-1">
                Paste the Google Search Console HTML Meta tag or verification code here.
              </p>
            </div>
            <div>
              <button
                type="button"
                onClick={async () => {
                  setIsSaving(true);
                  try {
                    updateDraftSettings({ googleSearchConsoleCode: formState.googleSearchConsoleCode });
                    await useSettingsStore.getState().publishSettings();
                    setShowToast(true);
                    setTimeout(() => {
                      setShowToast(false);
                    }, 3000);
                  } catch (err) {
                    console.error("Save Verification Tag failed:", err);
                  } finally {
                    setIsSaving(false);
                  }
                }}
                disabled={isSaving}
                className="inline-flex items-center gap-2 bg-[#000000] text-[#FFFFFF] px-6 py-2.5 rounded-[10px] text-sm font-bold hover:bg-neutral-800 transition-colors duration-150 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save Verification Tag'}
              </button>
            </div>
          </div>
        </div>
      );
      case 'security': return (
        <div className="space-y-4 max-w-3xl animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-gray-100">
            <Input label="Admin Login Email" field="adminEmail" />
            <Input label="Admin Login Password" field="adminPassword" />
          </div>
          <Toggle label="Admin 2FA (Two Factor Auth)" field="admin2fa" />
          <Toggle label="Login Device History" field="loginDeviceHistory" />
          <Toggle label="Failed Login Protection" field="failedLoginProtection" />
          <Toggle label="IP Restriction" field="ipRestriction" />
          <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <button type="button" className="bg-gray-100 font-bold px-4 py-3 rounded-[10px] hover:bg-gray-200">Force Logout All Sessions</button>
            <button type="button" className="bg-black text-white font-bold px-4 py-3 rounded-[10px] hover:bg-gray-900">Change Admin Password</button>
          </div>
        </div>
      );
      case 'appearance': return (
        <div className="space-y-6 max-w-3xl animate-in fade-in">
           <Toggle label="Dark Mode Toggle Support" field="darkModeToggle" />
           <Toggle label="Mobile Layout Toggle (App Like)" field="mobileLayoutToggle" />
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <Input label="Theme Primary Color override" field="themeColor" />
             <div>
               <label className="block text-sm font-semibold text-[#000000] mb-2">Font Style</label>
               <select value={formState.fontStyle} onChange={e => handleUpdate('fontStyle', e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-[#EEEEEE] rounded-[10px] focus:outline-none focus:border-[#000000]">
                 <option>Inter (Modern UI)</option>
                 <option>Outfit (Brand tech)</option>
                 <option>Playfair Display (Editorial)</option>
               </select>
             </div>
           </div>
        </div>
      );
      case 'checkout': return (
        <div className="space-y-4 max-w-3xl animate-in fade-in">
          <Toggle label="Guest Checkout ON/OFF" field="guestCheckout" />
          <Toggle label="Gmail Required" field="gmailRequired" />
          <Toggle label="Phone Required" field="phoneRequired" />
          <Toggle label="Address Required" field="addressRequired" />
          <Toggle label="Checkout Note Enable" field="checkoutNote" />
        </div>
      );
      case 'support': return (
        <div className="space-y-6 max-w-3xl animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
            <Input label="Hotline Number" field="hotlineNumber" />
            <Input label="Support Email" field="supportEmail" />
          </div>
          <Toggle label="Live Chat Enable" field="liveChatEnable" />
          <Toggle label="WhatsApp Chat Button" field="whatsappChatButton" />
          <Toggle label="AI Chat Support (Experimental)" field="aiChatSupport" />
        </div>
      );
      case 'media': return (
        <div className="space-y-6 max-w-3xl animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Maximum Upload Size" field="maxUploadSize" placeholder="e.g. 5MB" />
            <Input label="Allowed File Types" field="allowedFileTypes" placeholder="PNG, JPG, PDF" />
          </div>
          <Toggle label="Video Upload Enable" field="videoUploadEnable" />
          <Toggle label="Cloud Storage Enable (AWS S3)" field="cloudStorageEnable" />
        </div>
      );
      case 'promotion': return (
        <div className="space-y-6 max-w-3xl animate-in fade-in">
           <Toggle label="Flash Sale Mode" field="flashSaleEnabled" />
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Flash Sale End Time" field="flashSaleEndTime" type="datetime-local" />
           </div>
           <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest pl-4 border-l-2 border-zinc-100">
             * Sets the global countdown timer for flash sale products.
           </p>
           
           <div className="space-y-3 pt-4 border-t border-zinc-150">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-[#000000] font-sans">Double Discount Protection (Stack Rules)</h4>
              <Toggle label="Allow Stack Discount (Campaign/Flash Sale + Coupons)" field="allowStackDiscount" />
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest pl-4 border-l-2 border-zinc-100 font-sans leading-relaxed">
                * When ENABLED, customers can combine campaign list prices with active coupon code discounts.<br />
                * When DISABLED / BLOCKED (Recommended), coupon discounts will not be applicable on lists that contain promo items.
              </p>
           </div>
        </div>
      );
      case 'supabase': return (
        <div className="space-y-6 max-w-3xl animate-in fade-in">
           <Input label="Supabase URL" field="supabaseUrl" placeholder="https://xyz.supabase.co" />
           <Input label="Supabase Key" field="supabaseKey" placeholder="Your Supabase ANON Key" />
        </div>
      );
      case 'system': return (
        <div className="space-y-8 max-w-4xl animate-in fade-in font-mono">
          {/* Demo & Showcase Data Manager */}
          <div className="bg-red-50/70 border border-red-300 p-6 space-y-4 rounded-none">
             <div className="flex items-start gap-4">
               <Database className="w-8 h-8 text-red-600 shrink-0 mt-0.5" />
               <div>
                 <h3 className="text-sm font-black text-red-900 uppercase tracking-widest font-mono">Demo Showcase Database</h3>
                 <p className="text-xs text-red-700/80 mt-2 leading-relaxed">
                    This website is pre-packaged with 20+ Categories, 250+ Products, 20+ Customers, and 50+ diverse Orders to fully test checkout, invoicing, tracking, and dashboard reporting out-of-the-box.
                 </p>
               </div>
             </div>
             
             {/* Stats list */}
             <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white p-4 border border-red-200 font-mono">
               <div className="text-center p-2 border-r border-red-100 last:border-0">
                 <span className="block text-xl font-black text-red-600">{categories.filter(c => c.isDemo).length}</span>
                 <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Demo Categories</span>
               </div>
               <div className="text-center p-2 border-r border-red-100 last:border-0">
                 <span className="block text-xl font-black text-red-600">{products.filter(p => p.isDemo).length}</span>
                 <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Demo Products</span>
               </div>
               <div className="text-center p-2 border-r border-red-100 last:border-0">
                 <span className="block text-xl font-black text-red-600">{customers.filter(c => c.isDemo).length}</span>
                 <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Demo Customers</span>
               </div>
               <div className="text-center p-2">
                 <span className="block text-xl font-black text-red-600">{orders.filter(o => o.isDemo).length}</span>
                 <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Demo Orders</span>
               </div>
             </div>

             <div className="pt-2">
               <button 
                 type="button"
                 onClick={() => {
                   if (window.confirm('IRREVERSIBLE ACTION: Are you sure you want to completely purge all demo categories, demo products, demo customers, and demo orders from the store database? All of your non-demo database items will be preserved.')) {
                     useCategoryStore.getState().clearDemoData();
                     useProductStore.getState().clearDemoData();
                     useCustomerStore.getState().clearDemoData();
                     useOrderStore.getState().clearDemoData();
                     alert('SUCCESS: All 20+ Categories, 200+ Products, 20+ Customers, and 50+ Orders have been successfully cleared from the database.');
                   }
                 }}
                 className="px-5 py-3 bg-red-650 hover:bg-red-700 text-white border border-black font-mono text-[10px] font-bold uppercase tracking-widest cursor-pointer transition-colors"
               >
                 Remove Demo Data
               </button>
             </div>
          </div>

          <div className="border border-black p-6 space-y-6 bg-white">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#000000]">System Backups & Control</h3>
            <Toggle label="Auto Backup Database" field="autoBackup" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
               <button className="bg-black text-white font-bold p-4 text-[10px] uppercase tracking-widest hover:bg-zinc-800 flex items-center justify-center gap-2 border border-black cursor-pointer transition-colors">
                  <Database className="w-4 h-4 text-purple-400" /> Export Database
               </button>
               <button className="bg-gray-150 text-gray-700 border border-black font-bold p-4 text-[10px] uppercase tracking-widest hover:bg-gray-200 flex items-center justify-center gap-2 cursor-pointer transition-colors">
                  Restore System Backup
               </button>
               <button className="bg-gray-50 text-gray-600 border border-[#DDD] font-bold p-4 text-[10px] uppercase tracking-widest hover:bg-gray-100 flex items-center justify-center gap-2 md:col-span-2 cursor-pointer transition-colors">
                  Clear Application Cache
               </button>
            </div>
          </div>
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="relative min-h-[70vh] flex flex-col md:flex-row gap-6">
      {/* Draft Toolbar (Publish/Save/Reset) */}
      <TemplateDraftBar />

      {/* Sidebar Navigation */}
      <div className="hidden md:block w-72 shrink-0 bg-white rounded-none border border-[#222] p-4 h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar">
         <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4 px-3 pt-2 font-mono">Settings Modules</h3>
         <div className="space-y-1">
           {SETTING_MODULES.map(module => (
             <button
               key={module.id}
               type="button"
               onClick={() => handleTabChange(module.id)}
               className={`w-full flex items-center gap-3 px-3 py-3 rounded-none text-[12px] font-black uppercase tracking-wider transition-all ${
                 activeTab === module.id 
                 ? 'bg-black text-white shadow-xl shadow-black/10' 
                 : 'text-gray-500 hover:bg-gray-50 hover:text-black'
               }`}
             >
               <module.icon className={`w-4 h-4 shrink-0 ${activeTab === module.id ? 'text-white' : 'text-gray-400'}`} />
               <span className="truncate">{module.name}</span>
             </button>
           ))}
         </div>
      </div>

      {/* Main Settings Content */}
      <div className="flex-1 bg-white rounded-none border border-[#222] flex flex-col min-h-0 md:h-[calc(100vh-140px)] relative z-10 w-full overflow-hidden">
        {/* Content Header */}
        <div className="p-6 lg:p-8 border-b border-[#222] flex justify-between items-center shrink-0 bg-black text-white sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 -ml-2 bg-zinc-800 text-white border border-zinc-700 hover:bg-zinc-700 rounded-none"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-3 uppercase tracking-tighter">
                 <div className="p-2 bg-zinc-800 rounded-none hidden md:block border border-zinc-700">
                    {activeModule && <activeModule.icon className="w-5 h-5 text-zinc-300" />}
                 </div>
                 {activeModule?.name}
              </h2>
              <p className="hidden sm:block text-zinc-400 text-[10px] uppercase tracking-widest font-black mt-1">{activeModule?.desc}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             {isDirty ? (
               <span className="hidden lg:flex items-center gap-2 text-[10px] font-black text-white bg-zinc-800 px-4 py-2 rounded-none border border-zinc-700 uppercase tracking-widest animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-none bg-white"></span>
                  Unsaved Changes
               </span>
             ) : (
               <span className="hidden lg:flex items-center gap-2 text-[10px] font-black text-zinc-400 bg-zinc-900 px-4 py-2 rounded-none border border-zinc-800 uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-none bg-zinc-600"></span>
                  Enterprise Secure
               </span>
             )}
          </div>
        </div>

        {/* Dynamic Content Area with option 1 footer button */}
        <div className="p-6 lg:p-8 overflow-y-auto flex-1 relative custom-scrollbar bg-white pb-24">
          {renderContent()}

          {/* Option 1: Inline Action Save Button */}
          <div className="mt-12 pt-6 border-t border-[#E5E5E5]">
            <button
              onClick={handleSave}
              disabled={isSaving}
              style={{ height: '54px' }}
              className="w-full md:w-auto px-10 bg-[#000000] hover:bg-zinc-800 text-white font-black text-[12px] uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-200 shadow-xl shadow-black/10 disabled:bg-zinc-500 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99] rounded-none"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  SAVING CONFIG...
                </>
              ) : (
                'SAVE SETTINGS'
              )}
            </button>
          </div>
        </div>

        {/* Option 2: Sticky Bottom Save Bar */}
        <AnimatePresence>
          {isDirty && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.2 }}
              className="shrink-0 bg-white border-t border-[#EEEEEE] p-4 pr-6 flex items-center justify-between shadow-[0_-8px_25px_rgba(0,0,0,0.04)] z-30 rounded-b-[20px] font-sans"
            >
              <div className="flex items-center gap-2 pl-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                <span className="text-sm font-semibold text-zinc-700">You have unsaved changes</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-5 py-2.5 bg-zinc-50 hover:bg-zinc-100 text-[#000000] font-bold rounded-[14px] text-sm border border-zinc-200 transition-all hover:scale-[1.01] active:scale-[0.99] font-sans"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  style={{ height: '44px', borderRadius: '14px' }}
                  className="px-6 bg-[#000000] hover:bg-zinc-800 text-white font-bold flex items-center justify-center gap-2 text-sm transition-all disabled:bg-zinc-500 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99] font-sans shadow-sm"
                >
                  {isSaving ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Success Save Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center"
          >
            <div className="bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 font-semibold text-sm border border-emerald-500 font-sans">
              <svg className="w-5 h-5 text-white shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>✓ Saved Successfully</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Unsaved Changes Warning Modal */}
      <AnimatePresence>
        {showWarningModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowWarningModal(false)}
            />
            
            {/* Modal Body */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-[#EEEEEE] text-center z-10 font-sans"
            >
              <div className="mx-auto w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1 font-sans">Unsaved Changes</h3>
              <p className="text-gray-500 text-sm mb-6 font-sans">You have unsaved changes. Are you sure you want to leave?</p>
              
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setFormState(settings); // discard changes & reload
                    if (nextTab) {
                      setActiveTab(nextTab);
                      setNextTab(null);
                    }
                    setShowWarningModal(false);
                  }}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl text-sm transition-colors font-sans"
                >
                  Leave & Discard Changes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowWarningModal(false);
                    setNextTab(null);
                  }}
                  className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-2xl text-sm transition-colors font-sans"
                >
                  Keep Editing
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Remove Image Confirmation Popup */}
      <AnimatePresence>
        {confirmRemoveField && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setConfirmRemoveField(null)}
            />
            
            {/* Modal Body */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-[#EEEEEE] text-center z-10 font-sans"
            >
              <div className="mx-auto w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#E53935]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1 font-sans">
                {confirmRemoveField === 'storeLogo' ? 'Remove current logo?' : `Remove current ${removeLabel}?`}
              </h3>
              <p className="text-gray-500 text-sm mb-6 font-sans">Are you sure you want to remove this image? This action cannot be undone.</p>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmRemoveField(null)}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-2xl text-sm transition-colors font-sans"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleUpdate(confirmRemoveField, '');
                    setConfirmRemoveField(null);
                  }}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl text-sm transition-colors font-sans"
                >
                  Remove
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Floating Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
               onClick={() => setIsMenuOpen(false)}
            />
            
            <motion.div 
               initial={{ opacity: 0, x: -50 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -50 }}
               transition={{ duration: 0.2 }}
               className="fixed top-0 left-0 bottom-0 z-50 w-72 bg-white shadow-2xl overflow-y-auto p-4 md:hidden"
            >
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <span className="font-sans font-black text-lg">Settings</span>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-gray-50 rounded-xl"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-1">
                {SETTING_MODULES.map(module => (
                  <button
                    key={module.id}
                    type="button"
                    onClick={() => {
                      handleTabChange(module.id);
                      setIsMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-[12px] text-sm font-bold transition-all ${
                      activeTab === module.id 
                      ? 'bg-black text-white shadow-lg shadow-black/10' 
                      : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <module.icon className={`w-4 h-4 shrink-0 ${activeTab === module.id ? 'text-white' : 'text-gray-400'}`} />
                    <span className="truncate">{module.name}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
