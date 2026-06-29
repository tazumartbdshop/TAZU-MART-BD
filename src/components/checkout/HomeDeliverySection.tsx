import React from 'react';
import { AlertCircle, Save, MapPin, Home, Building2, Map } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';
import { bdAddressData, divisions } from '../../data/addressData';

interface HomeDeliverySectionProps {
  formData: any;
  handleInputChange: (field: string, value: any) => void;
  errors: any;
}

export const HomeDeliverySection: React.FC<HomeDeliverySectionProps> = ({ 
  formData, 
  handleInputChange, 
  errors 
}) => {
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
      // initial height is around 54px, but let it grow as text wraps
      textareaRef.current.style.height = `${Math.max(54, scrollHeight)}px`;
    }
  }, [formData.address]);

  return (
    <motion.div
      key="home-delivery-grid"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className="space-y-3.5"
    >
      {/* 3. Full Address (Moved to Top) */}
      <div className="space-y-1">
        <div className="mb-0.5">
          <label className="text-[11px] font-black text-neutral-800 uppercase tracking-widest pl-1 block">
            <span className="flex items-center gap-1"><Home className="w-3.5 h-3.5" /> Full Address *</span>
          </label>
        </div>
        <div className="relative">
          <textarea 
            ref={textareaRef}
            id="checkout-address"
            rows={1}
            placeholder="Enter your full address" 
            value={formData.address || ''}
            onChange={(e) => handleInputChange('address', e.target.value)}
            className={cn(
              "w-full bg-white border-2 px-4 py-3 rounded-[20px] focus:outline-none text-xs font-bold leading-relaxed placeholder:font-normal placeholder:text-neutral-400 resize-none shadow-[0_4px_12px_rgba(0,0,0,0.03)] transition-all duration-300 min-h-[54px] overflow-hidden",
              isAddressEmpty
                ? "border-neutral-200 focus:border-neutral-400"
                : isAddressValid
                  ? "border-emerald-400 focus:border-emerald-500" 
                  : "border-rose-400 focus:border-rose-500"
            )} 
          />
          {!isAddressEmpty && (
            <div className="absolute right-3.5 bottom-3.5">
              {isAddressValid ? (
                <span className="text-emerald-500 font-extrabold text-[10px] bg-white px-2 py-0.5 rounded-lg shadow-xs border border-emerald-100">✓ Valid</span>
              ) : (
                <span className="text-rose-500 font-extrabold text-[10px] bg-white px-2 py-0.5 rounded-lg shadow-xs border border-rose-100">Too Short</span>
              )}
            </div>
          )}
        </div>
        {!isAddressEmpty && !isAddressValid && (
          <p className="text-[10px] text-rose-500 font-bold mt-1.5 flex items-center gap-1 pl-1 uppercase">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" /> Please enter a detailed address (at least 3 meaningful words describing holding, road, etc.)
          </p>
        )}
      </div>

      {/* Address Hierarchy Dropdowns (Division & District) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* 4. Division */}
        <div className="space-y-1">
          <label className="text-[11px] font-black text-neutral-800 uppercase tracking-widest pl-1 block">
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Division (Optional)</span>
          </label>
          <select 
            id="checkout-division"
            value={formData.division || ''}
            onChange={(e) => {
              handleInputChange('division', e.target.value);
              handleInputChange('district', '');
              handleInputChange('upazila', '');
            }}
            className="w-full bg-white border-2 border-neutral-200 px-4 h-[54px] rounded-[20px] focus:outline-none focus:border-neutral-400 text-xs font-bold transition-all duration-300 cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.03)]"
          >
            <option value="">Select Division</option>
            {divisions.map(div => (
              <option key={div} value={div}>{div}</option>
            ))}
          </select>
        </div>

        {/* 5. District */}
        <div className="space-y-1">
          <label className="text-[11px] font-black text-neutral-800 uppercase tracking-widest pl-1 block">
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> District (Optional)</span>
          </label>
          <select 
            id="checkout-district"
            value={formData.district || ''}
            onChange={(e) => {
              handleInputChange('district', e.target.value);
              handleInputChange('upazila', '');
            }}
            disabled={!formData.division}
            className="w-full bg-white border-2 border-neutral-200 px-4 h-[54px] rounded-[20px] focus:outline-none focus:border-neutral-400 text-xs font-bold transition-all duration-300 cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.03)] disabled:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Select District</option>
            {districts.map(dist => (
              <option key={dist} value={dist}>{dist}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 6. Thana / Upazila */}
      <div className="space-y-1">
        <label className="text-[11px] font-black text-neutral-800 uppercase tracking-widest pl-1 block">
          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Thana / Upazila (Optional)</span>
        </label>
        <select 
          id="checkout-upazila"
          value={formData.upazila || ''}
          onChange={(e) => handleInputChange('upazila', e.target.value)}
          disabled={!formData.district}
          className="w-full bg-white border-2 border-neutral-200 px-4 h-[54px] rounded-[20px] focus:outline-none focus:border-neutral-400 text-xs font-bold transition-all duration-300 cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.03)] disabled:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Select Upazila</option>
          {upazilas.map(up => (
            <option key={up} value={up}>{up}</option>
          ))}
        </select>
      </div>

      {/* 7. Nearby Landmark */}
      <div className="space-y-1">
        <label className="text-[11px] font-black text-neutral-800 uppercase tracking-widest pl-1 block">
          <span className="flex items-center gap-1"><Map className="w-3.5 h-3.5" /> Nearby Landmark (Optional)</span>
        </label>
        <input 
          id="checkout-landmark"
          type="text" 
          placeholder="E.g. Opposite Scholastica School" 
          value={formData.landmark}
          onChange={(e) => handleInputChange('landmark', e.target.value)}
          className="w-full bg-white border-2 border-neutral-200 px-4 h-[54px] rounded-[20px] focus:outline-none focus:border-neutral-400 text-xs font-bold placeholder:font-normal placeholder:text-neutral-400 shadow-[0_4px_12px_rgba(0,0,0,0.03)] transition-all duration-300"
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
            formData.saveAddress ? "bg-black border-black text-white" : "border-neutral-300"
          )}
        >
          {formData.saveAddress && <Save className="w-2.5 h-2.5 text-white" />}
        </button>
        <span id="checkout-save-address-label" className="text-[10px] font-black uppercase tracking-wider text-neutral-500 cursor-pointer select-none" onClick={() => handleInputChange('saveAddress', !formData.saveAddress)}>
          Save address to profile
        </span>
      </div>
    </motion.div>
  );
};
