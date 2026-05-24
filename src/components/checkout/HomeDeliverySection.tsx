import React from 'react';
import { Navigation, AlertCircle, Save } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';

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
  return (
    <motion.div
      key="home-delivery-grid"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className="space-y-3"
    >
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest pl-0.5 block">Full Delivery Address (Required)</label>
          <button 
            type="button"
            onClick={handleUseLocation}
            className="text-[9px] font-black uppercase text-[#000000] hover:text-neutral-600 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Navigation className="w-3 h-3 text-neutral-900" /> Auto Fill Dhanmondi Demo
          </button>
        </div>
        <textarea 
          rows={3}
          placeholder="House description, road name, block and detailed location" 
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
          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest pl-0.5 block mb-1">Nearby Landmark (Optional)</label>
          <input 
            type="text" 
            placeholder="E.g. Opposite Scholastica School" 
            value={formData.landmark}
            onChange={(e) => handleInputChange('landmark', e.target.value)}
            className="w-full bg-white border border-neutral-250 px-3.5 h-10 rounded-lg focus:outline-none focus:border-black text-xs font-semibold placeholder:font-normal placeholder:text-neutral-400"
          />
        </div>

        <div className="flex items-center gap-2 mt-4 sm:mt-6 pl-1">
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
            Save default address
          </span>
        </div>
      </div>
    </motion.div>
  );
};
