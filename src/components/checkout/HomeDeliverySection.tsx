import React from 'react';
import { Navigation, AlertCircle, Save, MapPin, Home, Building2, Map } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';
import { bdAddressData, divisions } from '../../data/addressData';

interface HomeDeliverySectionProps {
  formData: any;
  handleInputChange: (field: string, value: any) => void;
  handleUseLocation: () => void;
  errors: any;
}

export const HomeDeliverySection: React.FC<HomeDeliverySectionProps> = ({ 
  formData, 
  handleInputChange, 
  handleUseLocation, 
  errors 
}) => {
  const districtData = formData.division ? bdAddressData[formData.division as keyof typeof bdAddressData] : null;
  const districts = districtData ? Object.keys(districtData) : [];
  const upazilas = (formData.division && formData.district) ? bdAddressData[formData.division as keyof typeof bdAddressData]?.[formData.district] : [];

  return (
    <motion.div
      key="home-delivery-grid"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className="space-y-4"
    >
      {/* Address Hierarchy Dropdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Division */}
        <div>
          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest pl-0.5 block mb-1">
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Division (Optional)</span>
          </label>
          <select 
            value={formData.division}
            onChange={(e) => {
              handleInputChange('division', e.target.value);
              handleInputChange('district', '');
              handleInputChange('upazila', '');
            }}
            className="w-full bg-white border border-neutral-250 px-3.5 h-10 rounded-lg focus:outline-none focus:border-black text-xs font-bold transition-all cursor-pointer"
          >
            <option value="">Select Division</option>
            {divisions.map(div => (
              <option key={div} value={div}>{div}</option>
            ))}
          </select>
        </div>

        {/* District */}
        <div>
          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest pl-0.5 block mb-1">
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> District (Optional)</span>
          </label>
          <select 
            value={formData.district}
            onChange={(e) => {
              handleInputChange('district', e.target.value);
              handleInputChange('upazila', '');
            }}
            disabled={!formData.division}
            className="w-full bg-white border border-neutral-250 px-3.5 h-10 rounded-lg focus:outline-none focus:border-black text-xs font-bold transition-all cursor-pointer disabled:bg-gray-50 disabled:cursor-not-allowed"
          >
            <option value="">Select District</option>
            {districts.map(dist => (
              <option key={dist} value={dist}>{dist}</option>
            ))}
          </select>
        </div>

        {/* Upazila */}
        <div className="sm:col-span-2">
          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest pl-0.5 block mb-1">
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Thana / Upazila (Optional)</span>
          </label>
          <select 
            value={formData.upazila}
            onChange={(e) => handleInputChange('upazila', e.target.value)}
            disabled={!formData.district}
            className="w-full bg-white border border-neutral-250 px-3.5 h-10 rounded-lg focus:outline-none focus:border-black text-xs font-bold transition-all cursor-pointer disabled:bg-gray-50 disabled:cursor-not-allowed"
          >
            <option value="">Select Upazila</option>
            {upazilas.map(up => (
              <option key={up} value={up}>{up}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest pl-0.5 block">
            <span className="flex items-center gap-1"><Home className="w-3 h-3" /> Full Address *</span>
          </label>
          <button 
            type="button"
            onClick={handleUseLocation}
            className="text-[9px] font-black uppercase text-[#000000] hover:text-neutral-600 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Navigation className="w-3 h-3 text-neutral-900" /> Auto Fill Demo
          </button>
        </div>
        <textarea 
          rows={2}
          placeholder="Enter your detailed house/road information" 
          value={formData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          className={cn(
            "w-full bg-white border px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-black text-xs font-bold leading-relaxed placeholder:font-normal placeholder:text-neutral-400 resize-none",
            errors.address ? "border-red-500 bg-red-50/5" : "border-neutral-250"
          )} 
        />
        {errors.address && <p className="text-[10px] text-red-500 font-bold mt-1.5 flex items-center gap-1 pl-1 uppercase"><AlertCircle className="w-3.5 h-3.5" /> {errors.address}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest pl-0.5 block mb-1">
            <span className="flex items-center gap-1"><Map className="w-3 h-3" /> Nearby Landmark (Optional)</span>
          </label>
          <input 
            type="text" 
            placeholder="E.g. Opposite Scholastica School" 
            value={formData.landmark}
            onChange={(e) => handleInputChange('landmark', e.target.value)}
            className="w-full bg-white border border-neutral-250 px-3.5 h-10 rounded-lg focus:outline-none focus:border-black text-xs font-semibold placeholder:font-normal placeholder:text-neutral-400"
          />
        </div>

        <div>
          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest pl-0.5 block mb-1">
            <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> Postal Code (ঐচ্ছিক)</span>
          </label>
          <input 
            type="text" 
            placeholder="Post Code" 
            value={formData.postalCode}
            onChange={(e) => handleInputChange('postalCode', e.target.value)}
            className="w-full bg-white border border-neutral-250 px-3.5 h-10 rounded-lg focus:outline-none focus:border-black text-xs font-semibold placeholder:font-normal placeholder:text-neutral-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 mt-2 pl-1">
        <button 
          type="button"
          onClick={() => handleInputChange('saveAddress', !formData.saveAddress)}
          className={cn(
            "w-4 h-4 rounded border flex items-center justify-center transition-colors cursor-pointer",
            formData.saveAddress ? "bg-black border-black text-white" : "border-neutral-300"
          )}
        >
          {formData.saveAddress && <Save className="w-2.5 h-2.5 text-white" />}
        </button>
        <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500 cursor-pointer select-none" onClick={() => handleInputChange('saveAddress', !formData.saveAddress)}>
          Save address to profile
        </span>
      </div>
    </motion.div>
  );
};
