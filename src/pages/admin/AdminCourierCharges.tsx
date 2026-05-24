import React, { useState } from 'react';
import { Sliders, Save, MapPin, Truck, CheckCircle, Info } from 'lucide-react';
import { useDeliveryStore } from '../../store/useDeliveryStore';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminCourierCharges() {
  const { divisionCharges, updateDivisionCharge } = useDeliveryStore();
  const [localCharges, setLocalCharges] = useState<{ [key: string]: number }>(
    Object.fromEntries(divisionCharges.map(d => [d.id, d.charge]))
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleChargeChange = (id: string, value: string) => {
    const numValue = value === '' ? 0 : parseInt(value);
    if (!isNaN(numValue)) {
      setLocalCharges(prev => ({ ...prev, [id]: numValue }));
    }
  };

  const handleSaveAll = () => {
    setIsSaving(true);
    // Simulate API delay
    setTimeout(() => {
      Object.entries(localCharges).forEach(([id, charge]) => {
        updateDivisionCharge(id, charge as number);
      });
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
            <Truck className="w-5 h-5 text-purple-600" /> Courier Charge Management
          </h2>
          <p className="text-gray-500 text-sm mt-1">Configure division-wise delivery rates for your customers.</p>
        </div>
        
        <button
          onClick={handleSaveAll}
          disabled={isSaving}
          className={cn(
            "px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95",
            saveSuccess 
              ? "bg-green-600 text-white" 
              : "bg-black text-white hover:bg-gray-800"
          )}
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : saveSuccess ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saveSuccess ? 'CONFIG SAVED' : 'SAVE ALL CHARGES'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {divisionCharges.map((division) => (
          <div 
            key={division.id}
            className="bg-white p-5 rounded-[20px] border border-gray-100 shadow-sm flex items-center justify-between hover:border-purple-200 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-purple-50 group-hover:text-purple-600 transition-all">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 uppercase tracking-tight text-sm">{division.name}</h3>
                <span className="text-[10px] font-black text-gray-400 tracking-widest uppercase">Division Branch</span>
              </div>
            </div>

            <div className="relative w-[130px]">
              <input
                type="number"
                value={localCharges[division.id]}
                onChange={(e) => handleChargeChange(division.id, e.target.value)}
                className="w-full h-11 bg-gray-50 border border-gray-100 rounded-xl px-4 font-black text-sm text-gray-900 focus:outline-none focus:border-purple-300 focus:bg-white transition-all pr-12"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400 uppercase">TK</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-purple-50 p-6 rounded-[24px] border border-purple-100 flex items-start gap-4">
        <div className="p-2 bg-purple-100 text-purple-600 rounded-xl shrink-0">
          <Info className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="font-black text-xs text-purple-900 uppercase tracking-widest">Dynamic Price Logic</h4>
          <p className="text-purple-700/70 text-sm leading-relaxed font-medium">
            The values configured here will be automatically applied to the total order amount in the checkout screen once the customer selects their division. Make sure to keep these rates competitive based on your selected courier provider's pricing.
          </p>
        </div>
      </div>
    </div>
  );
}
