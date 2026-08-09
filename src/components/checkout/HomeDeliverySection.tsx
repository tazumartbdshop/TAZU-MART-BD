import React from 'react';
import { AlertCircle, Save, MapPin, Home, Map } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';
import { bdAddressData, divisions } from '../../data/addressData';
import { useTranslation } from '../../store/useLanguageStore';

interface HomeDeliverySectionProps {
  formData: any;
  handleInputChange: (field: string, value: any) => void;
  errors: any;
}

export const HomeDeliverySection: React.FC<HomeDeliverySectionProps> = ({ 
  formData, 
  handleInputChange, 
}) => {
  const { language, t } = useTranslation();
  const districtData = formData.division ? bdAddressData[formData.division as keyof typeof bdAddressData] : null;
  const districts = districtData ? Object.keys(districtData) : [];
  const upazilas = (formData.division && formData.district) ? bdAddressData[formData.division as keyof typeof bdAddressData]?.[formData.district] : [];

  const addressVal = formData.address ? formData.address.trim() : "";
  const addressWords = addressVal.split(/\s+/).filter((w: string) => w.length >= 2);
  const isAddressValid = addressWords.length >= 3;
  const isAddressEmpty = addressVal === "";

  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.max(54, scrollHeight)}px`;
    }
  }, [formData.address]);

  const isBn = language === 'bn';

  return (
    <motion.div
      key="home-delivery-grid"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className="space-y-3.5 text-left"
    >
      {/* 1. Full Address */}
      <div className="space-y-1">
        <div className="mb-0.5">
          <label className="text-[11px] font-black text-text-primary uppercase tracking-widest pl-1 block">
            <span className="flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5 text-[#D4AF37]" /> 
              {isBn ? 'সম্পূর্ণ ঠিকানা' : 'Full Address'} <span className="text-[#D4AF37]">*</span>
            </span>
          </label>
        </div>
        <div className="relative">
          <textarea 
            ref={textareaRef}
            id="checkout-address"
            rows={1}
            placeholder={isBn ? 'আপনার বিস্তারিত ঠিকানা লিখুন (বাসা/হোন্ডিং, রোড, এলাকা)' : 'Enter your full address (house, road, area)'} 
            value={formData.address || ''}
            onChange={(e) => handleInputChange('address', e.target.value)}
            className={cn(
              "w-full bg-bg-primary text-text-primary border px-4 py-3.5 rounded-[12px] focus:outline-none text-xs font-bold leading-relaxed placeholder:font-normal placeholder:text-text-secondary resize-none transition-all duration-200 min-h-[54px] overflow-hidden",
              isAddressEmpty
                ? "border-border-theme focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                : isAddressValid
                  ? "border-emerald-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" 
                  : "border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
            )} 
          />
          {!isAddressEmpty && (
            <div className="absolute right-3.5 bottom-3.5">
              {isAddressValid ? (
                <span className="text-emerald-600 font-extrabold text-[10px] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {isBn ? '✓ সঠিক' : '✓ Valid'}
                </span>
              ) : (
                <span className="text-rose-500 font-extrabold text-[10px] bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                  {isBn ? 'খুব ছোট' : 'Too Short'}
                </span>
              )}
            </div>
          )}
        </div>
        {!isAddressEmpty && !isAddressValid && (
          <p className="text-[10px] text-rose-500 font-bold mt-1 flex items-center gap-1 pl-1 uppercase">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" /> 
            {isBn ? 'অনুগ্রহ করে বিস্তারিত ঠিকানা দিন (কমপক্ষে ৩টি শব্দ)' : 'Please enter a detailed address (at least 3 words)'}
          </p>
        )}
      </div>

      {/* Division & District Dropdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Division */}
        <div className="space-y-1">
          <label className="text-[11px] font-black text-text-primary uppercase tracking-widest pl-1 block">
            <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-[#D4AF37]" /> {isBn ? 'বিভাগ (ঐচ্ছিক)' : 'Division (Optional)'}</span>
          </label>
          <select 
            id="checkout-division"
            value={formData.division || ''}
            onChange={(e) => {
              handleInputChange('division', e.target.value);
              handleInputChange('district', '');
              handleInputChange('upazila', '');
            }}
            className="w-full bg-bg-primary text-text-primary border border-border-theme px-4 h-[54px] rounded-[12px] focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] text-xs font-bold transition-all duration-200 cursor-pointer"
          >
            <option value="">{isBn ? 'বিভাগ নির্বাচন করুন' : 'Select Division'}</option>
            {divisions.map(div => (
              <option key={div} value={div}>{div}</option>
            ))}
          </select>
        </div>

        {/* District */}
        <div className="space-y-1">
          <label className="text-[11px] font-black text-text-primary uppercase tracking-widest pl-1 block">
            <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-[#D4AF37]" /> {isBn ? 'জেলা' : 'District'}</span>
          </label>
          <select 
            id="checkout-district"
            value={formData.district || ''}
            onChange={(e) => {
              handleInputChange('district', e.target.value);
              handleInputChange('upazila', '');
            }}
            disabled={!formData.division}
            className="w-full bg-bg-primary text-text-primary border border-border-theme px-4 h-[54px] rounded-[12px] focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] text-xs font-bold transition-all duration-200 cursor-pointer disabled:bg-bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">{t.selectDistrict}</option>
            {districts.map(dist => (
              <option key={dist} value={dist}>{dist}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Upazila */}
      <div className="space-y-1">
        <label className="text-[11px] font-black text-text-primary uppercase tracking-widest pl-1 block">
          <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-[#D4AF37]" /> {isBn ? 'থানা / উপজেলা' : 'Thana / Upazila'}</span>
        </label>
        <select 
          id="checkout-upazila"
          value={formData.upazila || ''}
          onChange={(e) => handleInputChange('upazila', e.target.value)}
          disabled={!formData.district}
          className="w-full bg-bg-primary text-text-primary border border-border-theme px-4 h-[54px] rounded-[12px] focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] text-xs font-bold transition-all duration-200 cursor-pointer disabled:bg-bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">{t.selectUpazila}</option>
          {upazilas.map(up => (
            <option key={up} value={up}>{up}</option>
          ))}
        </select>
      </div>

      {/* Nearby Landmark */}
      <div className="space-y-1">
        <label className="text-[11px] font-black text-text-primary uppercase tracking-widest pl-1 block">
          <span className="flex items-center gap-1.5"><Map className="w-3.5 h-3.5 text-[#D4AF37]" /> {isBn ? 'নিকটস্থ পরিচিত স্থান (ঐচ্ছিক)' : 'Nearby Landmark (Optional)'}</span>
        </label>
        <input 
          id="checkout-landmark"
          type="text" 
          placeholder={isBn ? 'যেমন: স্কুলের সামনে বা বাজারের পাশে' : 'E.g. Opposite Scholastica School'} 
          value={formData.landmark}
          onChange={(e) => handleInputChange('landmark', e.target.value)}
          className="w-full bg-bg-primary text-text-primary border border-border-theme px-4 h-[54px] rounded-[12px] focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] text-xs font-bold placeholder:font-normal placeholder:text-text-secondary transition-all duration-200"
        />
      </div>

      {/* Save Address Toggle */}
      <div className="flex items-center gap-2 mt-1 pl-1">
        <button 
          id="checkout-save-address-check"
          type="button"
          onClick={() => handleInputChange('saveAddress', !formData.saveAddress)}
          className={cn(
            "w-4 h-4 rounded border flex items-center justify-center transition-colors cursor-pointer",
            formData.saveAddress ? "bg-text-primary border-text-primary text-bg-primary" : "border-border-theme"
          )}
        >
          {formData.saveAddress && <Save className="w-2.5 h-2.5 text-bg-primary" />}
        </button>
        <span 
          id="checkout-save-address-label" 
          className="text-[10px] font-black uppercase tracking-wider text-text-secondary cursor-pointer select-none" 
          onClick={() => handleInputChange('saveAddress', !formData.saveAddress)}
        >
          {isBn ? 'ঠিকানাটি প্রোফাইলে সংরক্ষণ করুন' : 'Save address to profile'}
        </span>
      </div>
    </motion.div>
  );
};
