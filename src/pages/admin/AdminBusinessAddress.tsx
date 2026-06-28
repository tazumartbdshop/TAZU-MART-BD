import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Save, 
  Info, 
  Check, 
  Globe,
  Settings,
  HelpCircle,
  Map,
  Loader2
} from 'lucide-react';
import { useSettingsStore, AppSettings } from '../../store/useSettingsStore';

export default function AdminBusinessAddress() {
  const { settings, updateSettings, updateDraftSettings } = useSettingsStore();
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form states loaded from store
  const [businessName, setBusinessName] = useState(settings.businessName || '');
  const [contactPerson, setContactPerson] = useState(settings.contactPerson || '');
  const [houseBuilding, setHouseBuilding] = useState(settings.houseBuilding || '');
  const [roadStreet, setRoadStreet] = useState(settings.roadStreet || '');
  const [areaThana, setAreaThana] = useState(settings.areaThana || '');
  const [city, setCity] = useState(settings.city || '');
  const [division, setDivision] = useState(settings.division || '');
  const [district, setDistrict] = useState(settings.district || '');
  const [zipCode, setZipCode] = useState(settings.zipCode || '');
  const [country, setCountry] = useState(settings.country || '');
  const [phone, setPhone] = useState(settings.phone || '');
  const [email, setEmail] = useState(settings.email || '');
  const [googleMapLink, setGoogleMapLink] = useState(settings.googleMapLink || '');

  useEffect(() => {
    if (settings) {
      setBusinessName(settings.businessName || '');
      setContactPerson(settings.contactPerson || '');
      setHouseBuilding(settings.houseBuilding || '');
      setRoadStreet(settings.roadStreet || '');
      setAreaThana(settings.areaThana || '');
      setCity(settings.city || '');
      setDivision(settings.division || '');
      setDistrict(settings.district || '');
      setZipCode(settings.zipCode || '');
      setCountry(settings.country || '');
      setPhone(settings.phone || '');
      setEmail(settings.email || '');
      setGoogleMapLink(settings.googleMapLink || '');
    }
  }, [settings]);

  const triggerFeedback = (message: string) => {
    setSaveFeedback(message);
    setTimeout(() => {
      setSaveFeedback(null);
    }, 4000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const updates = {
      businessName,
      contactPerson,
      houseBuilding,
      roadStreet,
      areaThana,
      city,
      division,
      district,
      zipCode,
      country,
      phone,
      email,
      googleMapLink
    };

    try {
      await updateSettings(updates);
      updateDraftSettings(updates);
      triggerFeedback('📍 Business location details saved successfully!');
    } catch (err) {
      console.error(err);
      triggerFeedback('❌ Failed to save business location details');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div id="admin-business-address-page" className="space-y-6 max-w-4xl mx-auto pb-16 font-sans text-neutral-900 text-left">
      
      {/* Toast Feedback Notification */}
      {saveFeedback && (
        <div id="toast-address-success" className="fixed top-20 right-6 z-[110] bg-neutral-900 text-white border border-neutral-800 px-4 py-3 shadow-xl flex items-center gap-2.5 max-w-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider">{saveFeedback}</span>
        </div>
      )}

      {/* Hero Header Card */}
      <div className="bg-white border border-neutral-200 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <MapPin className="w-6 h-6 text-purple-650" />
            <h2 className="text-xl font-black text-neutral-950 uppercase tracking-widest leading-none">
              📍 BUSINESS OFFICE & LOCATION ADDRESSES
            </h2>
          </div>
          <p className="text-xs text-neutral-500 mt-1.5 uppercase font-semibold">
            Define corporate headquarters, physical shipping hub details, and render embedded interactive Google Maps components.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Helper Sidecard */}
        <div className="md:col-span-4 space-y-6">
          <div className="bg-white border border-neutral-200 p-5 space-y-4">
            <h3 className="text-xs font-black uppercase text-neutral-900 tracking-wider flex items-center gap-2 pb-3 border-b border-neutral-100">
              <Globe className="w-4 h-4 text-neutral-500" />
              GLOBAL LOCATION
            </h3>
            
            <p className="text-xs text-neutral-500 leading-relaxed font-semibold uppercase">
              These address records automatically map to dynamic checkout maps, support widgets, footer coordinates, and physical receipts.
            </p>

            <div className="bg-neutral-50 p-3 text-[10.5px] text-neutral-500 leading-relaxed space-y-2 font-sans border border-neutral-200">
              <span className="font-extrabold text-[11px] block uppercase text-neutral-700">Google map embed tip:</span>
              <p>
                Provide the full custom HTML iframe node copied from Google Maps share modal (e.g. <code>&lt;iframe src="..."&gt;&lt;/iframe&gt;</code>). The storefront renders this as an interactive responsive frame on the contact page.
              </p>
            </div>
          </div>
        </div>

        {/* Inputs Fields Form */}
        <div className="md:col-span-8 space-y-6">
          <div className="bg-white border border-neutral-200 p-5 space-y-5">
            <h3 className="text-xs font-black uppercase text-neutral-900 tracking-wider pb-3 border-b border-neutral-100 flex items-center gap-2">
              <Map className="w-4 h-4 text-neutral-500" />
              PHYSICAL OFFICE ADRESSES
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider block">Business Name</label>
                <input 
                  type="text" 
                  value={businessName} 
                  onChange={(e) => setBusinessName(e.target.value)}                
                  className="w-full h-11 border border-neutral-200 px-3 text-xs focus:outline-none focus:border-neutral-900 rounded-none bg-white text-neutral-900 font-bold" 
                  placeholder="e.g. Tazu Mart BD"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider block">Contact Person</label>
                <input 
                  type="text" 
                  value={contactPerson} 
                  onChange={(e) => setContactPerson(e.target.value)}                
                  className="w-full h-11 border border-neutral-200 px-3 text-xs focus:outline-none focus:border-neutral-900 rounded-none bg-white text-neutral-900 font-bold" 
                  placeholder="e.g. CEO Name"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider block">House / Building</label>
                <input 
                  type="text" 
                  value={houseBuilding} 
                  onChange={(e) => setHouseBuilding(e.target.value)}                
                  className="w-full h-11 border border-neutral-200 px-3 text-xs focus:outline-none focus:border-neutral-900 rounded-none bg-white text-neutral-900 font-bold" 
                  placeholder="e.g. 39 Kazi Bhaban"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider block">Road / Street</label>
                <input 
                  type="text" 
                  value={roadStreet} 
                  onChange={(e) => setRoadStreet(e.target.value)}                
                  className="w-full h-11 border border-neutral-200 px-3 text-xs focus:outline-none focus:border-neutral-900 rounded-none bg-white text-neutral-900 font-bold" 
                  placeholder="e.g. Road no 12"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider block">Area / Thana</label>
                <input 
                  type="text" 
                  value={areaThana} 
                  onChange={(e) => setAreaThana(e.target.value)}                
                  className="w-full h-11 border border-neutral-200 px-3 text-xs focus:outline-none focus:border-neutral-900 rounded-none bg-white text-neutral-900 font-bold" 
                  placeholder="e.g. Mirpur"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider block">City</label>
                <input 
                  type="text" 
                  value={city} 
                  onChange={(e) => setCity(e.target.value)}                
                  className="w-full h-11 border border-neutral-200 px-3 text-xs focus:outline-none focus:border-neutral-900 rounded-none bg-white text-neutral-900 font-bold" 
                  placeholder="e.g. Dhaka"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider block">District</label>
                <input 
                  type="text" 
                  value={district} 
                  onChange={(e) => setDistrict(e.target.value)}                
                  className="w-full h-11 border border-neutral-200 px-3 text-xs focus:outline-none focus:border-neutral-900 rounded-none bg-white text-neutral-900 font-bold" 
                  placeholder="e.g. Dhaka"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider block">Division</label>
                <input 
                  type="text" 
                  value={division} 
                  onChange={(e) => setDivision(e.target.value)}                
                  className="w-full h-11 border border-neutral-200 px-3 text-xs focus:outline-none focus:border-neutral-900 rounded-none bg-white text-neutral-900 font-bold" 
                  placeholder="e.g. Dhaka"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider block">Postal Code</label>
                <input 
                  type="text" 
                  value={zipCode} 
                  onChange={(e) => setZipCode(e.target.value)}                
                  className="w-full h-11 border border-neutral-200 px-3 text-xs focus:outline-none focus:border-neutral-900 rounded-none bg-white text-neutral-900 font-bold" 
                  placeholder="e.g. 1212"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider block">Country</label>
                <input 
                  type="text" 
                  value={country} 
                  onChange={(e) => setCountry(e.target.value)}                
                  className="w-full h-11 border border-neutral-200 px-3 text-xs focus:outline-none focus:border-neutral-900 rounded-none bg-white text-neutral-900 font-bold" 
                  placeholder="e.g. Bangladesh"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider block">Phone Number</label>
                <input 
                  type="text" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)}                
                  className="w-full h-11 border border-neutral-200 px-3 text-xs focus:outline-none focus:border-neutral-900 rounded-none bg-white text-neutral-900 font-bold" 
                  placeholder="e.g. +880..."
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider block">Email Address</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}                
                  className="w-full h-11 border border-neutral-200 px-3 text-xs focus:outline-none focus:border-neutral-900 rounded-none bg-white text-neutral-900 font-bold" 
                  placeholder="e.g. contact@..."
                />
              </div>
            </div>

            <h3 className="text-xs font-black uppercase text-neutral-900 tracking-wider pt-4 pb-2 border-b border-neutral-100 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-neutral-500" />
              LIVE GOOGLE MAP PREVIEW
            </h3>

            <div className="space-y-2">
			  <p className="text-[10.5px] text-neutral-500 font-semibold mb-2">Live map preview will update based on the saved address. Use specific building names or road numbers for better accuracy.</p>
              <div className="w-full h-48 bg-neutral-100 border border-neutral-200 flex items-center justify-center">
                  <iframe 
					src={`https://www.google.com/maps?q=${encodeURIComponent(`${businessName}, ${roadStreet}, ${areaThana}, ${city}, ${country}`)}&output=embed`}
					width="100%" 
					height="100%" 
					style={{border:0}} 
					allowFullScreen={true} 
					loading="lazy"
				  />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-neutral-100 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="bg-neutral-900 hover:bg-black text-white h-11 px-8 text-xs font-black uppercase tracking-widest transition-all cursor-pointer select-none flex items-center justify-center gap-2 disabled:bg-neutral-500 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 text-emerald-400" />
                    <span>Save Location Details</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>

      </form>
    </div>
  );
}
