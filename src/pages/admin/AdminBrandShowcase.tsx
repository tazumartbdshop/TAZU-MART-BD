import React, { useState, useRef } from 'react';
import { 
  Sparkles, Plus, Trash2, Save, Clock, Upload, Layers, Sliders, Monitor
} from 'lucide-react';
import { useBrandShowcaseStore, BrandShowcaseSlide } from '../../store/useBrandShowcaseStore';

export default function AdminBrandShowcase() {
  const { 
    slides, 
    autoScrollSpeed, 
    companyName, 
    companySubtext, 
    addSlide, 
    updateSlide, 
    removeSlide, 
    setConfig 
  } = useBrandShowcaseStore();

  const [localCompanyName, setLocalCompanyName] = useState(companyName);
  const [localCompanySubtext, setLocalCompanySubtext] = useState(companySubtext);
  const [localSpeed, setLocalSpeed] = useState(autoScrollSpeed);
  const [toastMsg, setToastMsg] = useState('');

  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setConfig({
      companyName: localCompanyName,
      companySubtext: localCompanySubtext,
      autoScrollSpeed: Number(localSpeed),
    });
    triggerToast('⚡ Core Brand Showcase Header settings modified successfully.');
  };

  const handleImageFileChange = (slideId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        triggerToast('❌ Error: Image file must be under 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        updateSlide(slideId, { image: reader.result as string });
        triggerToast('✅ Slide brand banner asset successfully uploaded!');
      };
      reader.readAsDataURL(file);
    }
  };

  const calculateScheduleStatus = (slide: BrandShowcaseSlide) => {
    if (!slide.isActive) return { status: 'inactive', label: 'OFF / INACTIVE', color: 'border-red-400 text-red-500 bg-red-50/50' };
    
    const now = new Date();
    if (slide.scheduledStart) {
      const start = new Date(slide.scheduledStart);
      if (now < start) {
        return { status: 'scheduled', label: 'SCHEDULED (PENDING)', color: 'border-blue-400 text-blue-500 bg-blue-50/50' };
      }
    }
    if (slide.scheduledEnd) {
      const end = new Date(slide.scheduledEnd);
      if (now > end) {
        return { status: 'expired', label: 'EXPIRED', color: 'border-amber-400 text-amber-500 bg-amber-50/50' };
      }
    }
    return { status: 'active', label: 'ACTIVE & LIVE NOW', color: 'border-emerald-600 text-emerald-700 bg-emerald-50/50' };
  };

  const [previewSlideIdx, setPreviewSlideIdx] = useState(0);

  return (
    <div className="font-mono text-[#111111] p-4 max-w-7xl mx-auto space-y-6">
      
      {/* Toast Alert System - Minimal Rectangle Pop */}
      {toastMsg && (
        <div className="fixed top-4 right-4 bg-[#111111] text-white px-4 py-3 shadow-none z-50 rounded-none border border-zinc-700 flex items-center gap-3 font-mono text-[10px] uppercase tracking-wider animate-slide-up">
          <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Admin Flat Showcase Title Page Panel */}
      <div className="bg-white border border-[#111111] p-6 rounded-none flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Layers className="w-5 h-5 text-purple-600 shrink-0" />
            <h1 className="text-lg font-bold uppercase tracking-wider text-zinc-950">Brand Showcase Controls</h1>
          </div>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">
            Dynamic Apple-style slider management replacing generic footers on Categories, Support, Offers, and Accounts.
          </p>
        </div>
        <div className="bg-zinc-100 border border-[#111111] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-800 self-start md:self-auto">
          {slides.length} BANNER SLIDES REGISTERED
        </div>
      </div>

      {/* Grid containing brand layout controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Brand Core Properties Side - FLAT DESIGN ONLY */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-[#111111] p-6 rounded-none">
            <div className="pb-3 border-b border-[#111111] mb-5 flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider">Store Header Configuration</h2>
              <Sliders className="w-4 h-4 text-[#111111]" />
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-600 mb-1 tracking-wider">Store / Company Name</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. TAZU MART"
                  value={localCompanyName}
                  onChange={(e) => setLocalCompanyName(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-[#111111] rounded-none text-xs font-bold focus:outline-none focus:ring-0 focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-600 mb-1 tracking-wider">Tagline / Subtext Statement</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Premium Ecommerce Platform"
                  value={localCompanySubtext}
                  onChange={(e) => setLocalCompanySubtext(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-[#111111] rounded-none text-xs font-bold focus:outline-none focus:ring-0 focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-600 mb-1 tracking-wider">Auto Slidetime Speed</label>
                <select 
                  value={localSpeed}
                  onChange={(e) => setLocalSpeed(Number(e.target.value))}
                  className="w-full h-10 px-2 bg-white border border-[#111111] rounded-none text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-purple-600"
                >
                  <option value={2000}>2 Seconds / Slide</option>
                  <option value={3000}>3 Seconds / Slide</option>
                  <option value={4000}>4 Seconds / Slide</option>
                  <option value={5000}>5 Seconds / Slide</option>
                  <option value={8000}>8 Seconds / Slide</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full h-11 bg-zinc-950 hover:bg-zinc-850 text-white rounded-none text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
                Apply Branding Info
              </button>
            </form>
          </div>

          <div className="border border-[#111111] bg-purple-50/40 p-5 rounded-none space-y-2">
            <h3 className="text-[11px] font-bold uppercase text-purple-950 tracking-wider">Showcase Policy Summary</h3>
            <p className="text-[9px] text-purple-900 leading-normal uppercase">
              Brand Showcase items automatically replace traditional static footers at the lower bounds of main tab panels. Slide assets automatically normalize into landscape layout blocks.
            </p>
          </div>
        </div>

        {/* Main List Management Panel - No curves, sharp elements inside */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white border border-[#111111] p-6 rounded-none">
            <div className="pb-3 border-b border-[#111111] mb-5 flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider">Slideshow Array</h2>
              <span className="text-[10px] font-bold text-gray-400">TOTAL: {slides.length}</span>
            </div>

            <div className="space-y-6">
              {slides.map((slide, index) => {
                const schedule = calculateScheduleStatus(slide);
                return (
                  <div 
                    key={slide.id}
                    className="border border-[#111111] rounded-none bg-white p-5 space-y-5 relative"
                  >
                    {/* Header bar controls inside list */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#111111]/10">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-[#111111] text-white flex items-center justify-center text-[10px] font-bold rounded-none">
                          {index + 1}
                        </span>
                        <span className={`text-[9px] font-bold border px-2 py-0.5 tracking-wider rounded-none ${schedule.color}`}>
                          {schedule.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 self-end">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                            {slide.isActive ? 'Active state' : 'Draft mode'}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              updateSlide(slide.id, { isActive: !slide.isActive });
                              triggerToast(`${slide.isActive ? 'Drafted' : 'Activated'} Slide #${index + 1}`);
                            }}
                            className={`w-10 h-5 border border-[#111111] rounded-none relative transition-colors ${
                              slide.isActive ? 'bg-purple-600' : 'bg-gray-100'
                            }`}
                          >
                            <span className={`absolute top-[1px] w-4 h-4 bg-white border border-[#111111] transition-all ${
                              slide.isActive ? 'right-[1px]' : 'left-[1px]'
                            }`} />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (confirm('Permanently delete this brand showcase banner?')) {
                              removeSlide(slide.id);
                              triggerToast('Showcase slide deleted.');
                            }
                          }}
                          className="bg-red-50 text-red-600 hover:bg-red-100 p-1.5 border border-red-200 rounded-none transition-colors"
                          title="Delete Segment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* FLAT ASPECT-RATIO 16:9 BANNER DISPLAY & MEDIA UPLOADER */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold uppercase text-zinc-500 tracking-wider">
                        Aspect-Crop Slider Graphic (16:9 Ratio Container)
                      </label>
                      <input 
                        type="file"
                        accept="image/*"
                        ref={el => fileInputRefs.current[slide.id] = el}
                        onChange={(e) => handleImageFileChange(slide.id, e)}
                        className="hidden"
                      />

                      <div 
                        onClick={() => fileInputRefs.current[slide.id]?.click()}
                        className="relative w-full aspect-video rounded-none overflow-hidden cursor-pointer border border-[#111111] bg-zinc-50 flex flex-col justify-center items-center text-center group"
                      >
                        {slide.image ? (
                          <>
                            <img 
                              src={slide.image} 
                              alt={slide.title} 
                              className="absolute inset-0 w-full h-full object-cover rounded-none" 
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-[#111111]/85 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center text-white p-4">
                              <Upload className="w-5 h-5 mb-2 text-purple-400 stroke-[3]" />
                              <span className="text-[10px] font-bold uppercase tracking-widest">Replace Brand Media File</span>
                            </div>
                          </>
                        ) : (
                          <div className="p-6 flex flex-col items-center">
                            <Upload className="w-6 h-6 text-purple-600 mb-2 stroke-[2.5]" />
                            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-800">
                              Pick Device Photo
                            </span>
                            <span className="text-[8px] text-gray-400 font-bold uppercase mt-1">
                              Instant mobile files picker upload
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Text Title & Subtitles form section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1 tracking-wider">Banner Display Headline</label>
                        <input 
                          type="text"
                          required
                          value={slide.title}
                          onChange={(e) => updateSlide(slide.id, { title: e.target.value })}
                          placeholder="e.g. FINE JEWELRY SELECTION"
                          className="w-full h-10 px-3 bg-white border border-[#111111] rounded-none text-xs font-bold focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1 tracking-wider">Slide Subtext Tagline</label>
                        <input 
                          type="text"
                          value={slide.tagline || ''}
                          onChange={(e) => updateSlide(slide.id, { tagline: e.target.value })}
                          placeholder="e.g. Masterful alignment of luxury elements"
                          className="w-full h-10 px-3 bg-white border border-[#111111] rounded-none text-xs font-bold focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Pathway parameters */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1 tracking-wider">Navigation On-Tap Redirect Pathway</label>
                      <select 
                        value={slide.redirectLink || ''}
                        onChange={(e) => updateSlide(slide.id, { redirectLink: e.target.value })}
                        className="w-full h-10 px-2 bg-white border border-[#111111] rounded-none text-xs font-bold uppercase tracking-wider focus:outline-none"
                      >
                        <option value="">No action (Static Display Mode)</option>
                        <option value="/categories">Category Collection Gallery</option>
                        <option value="/offers">Offers Campaign Section</option>
                        <option value="/support">Live Customer Helpdesk</option>
                        <option value="/account/dashboard">Account Profile Control</option>
                        <option value="/">Revert Main Homepage</option>
                      </select>
                    </div>

                    {/* Datetime constraints and schedule properties */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[9px] font-bold uppercase text-zinc-500 mb-1 tracking-widest flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-zinc-950 stroke-[2.5]" />
                          <span>GMT START TIME limit</span>
                        </label>
                        <input 
                          type="datetime-local"
                          value={slide.scheduledStart || ''}
                          onChange={(e) => updateSlide(slide.id, { scheduledStart: e.target.value || undefined })}
                          className="w-full h-10 px-2 bg-white border border-[#111111] rounded-none text-[10px] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold uppercase text-zinc-500 mb-1 tracking-widest flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-zinc-950 stroke-[2.5]" />
                          <span>GMT EXPIRY TIME limit</span>
                        </label>
                        <input 
                          type="datetime-local"
                          value={slide.scheduledEnd || ''}
                          onChange={(e) => updateSlide(slide.id, { scheduledEnd: e.target.value || undefined })}
                          className="w-full h-10 px-2 bg-white border border-[#111111] rounded-none text-[10px] outline-none"
                        />
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* PLUS SYSTEM DYNAMIC ADD BANNER BUTTON */}
            <div className="pt-6 flex justify-center border-t border-[#111111]/10 mt-6">
              <button 
                type="button"
                onClick={() => {
                  addSlide({
                    image: '', 
                    title: 'PREMIUM BRAND SELECTION',
                    tagline: 'Delight in digital perfection',
                    redirectLink: '',
                    isActive: true
                  });
                  triggerToast('✨ Generated new draft slideshow container card. Select your media!');
                }}
                className="w-full h-12 bg-zinc-950 hover:bg-zinc-850 text-white text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 rounded-none border border-[#111111] transition-all"
              >
                <Plus className="w-4 h-4 text-purple-400 stroke-[3]" />
                Add New Banner Card
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Visual Live Mobile/Shop Showcase Preview */}
      <div className="bg-[#111111] p-6 rounded-none text-white border border-[#111111] space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <span className="text-[9px] text-purple-400 font-bold uppercase tracking-wider">SHOWCASE LIVE INTERFACE ACCORD</span>
          <span className="bg-emerald-600 text-white text-[8px] font-bold px-2 py-0.5 uppercase tracking-wide">SYSTEM REALTIME</span>
        </div>
        
        {slides.filter(s => s.isActive).length > 0 ? (
          <div className="space-y-4">
            <div className="relative aspect-video w-full bg-zinc-950 border border-zinc-800 rounded-none overflow-hidden">
              {slides.filter(s => s.isActive)[previewSlideIdx]?.image ? (
                <img 
                  src={slides.filter(s => s.isActive)[previewSlideIdx]?.image} 
                  alt="preview" 
                  className="w-full h-full object-cover brightness-75 rounded-none" 
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 text-xs p-6 font-mono">
                  <span>[ Slide image asset empty ]</span>
                </div>
              )}
              
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/40 to-transparent p-4 flex flex-col justify-end">
                <div className="inline-flex max-w-max bg-purple-600 text-white text-[8px] font-black px-2 py-0.5 uppercase tracking-widest rounded-none mb-1.5">
                  SLIDE {previewSlideIdx + 1}
                </div>
                <h3 className="text-xs sm:text-sm font-bold uppercase text-white truncate max-w-xl tracking-wider">
                  {slides.filter(s => s.isActive)[previewSlideIdx]?.title || 'Example Title'}
                </h3>
                <p className="text-[9px] text-zinc-400 font-semibold tracking-wider">
                  {slides.filter(s => s.isActive)[previewSlideIdx]?.tagline || 'Example Tagline'}
                </p>
              </div>
            </div>

            {slides.filter(s => s.isActive).length > 1 && (
              <div className="flex gap-1.5 justify-center">
                {slides.filter(s => s.isActive).map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPreviewSlideIdx(idx)}
                    className={`px-2.5 py-1 text-[8px] font-black uppercase rounded-none border ${
                      previewSlideIdx === idx 
                        ? 'bg-white text-zinc-950 border-white' 
                        : 'bg-transparent text-zinc-500 border-zinc-800'
                    }`}
                  >
                    SLIDE {idx + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="py-10 text-center text-zinc-500 text-xs">
            [ No active slides available for preview ]
          </div>
        )}

        <div className="text-center pt-6 border-t border-zinc-900 flex flex-col items-center">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-[0.2em] text-white">
            {localCompanyName || 'TAZU MART'}
          </h2>
          <div className="w-16 h-[1.5px] bg-purple-600 mt-2 mb-1.5" />
          <p className="text-[9px] text-zinc-500 font-extrabold uppercase tracking-widest">
            {localCompanySubtext || 'Premium Ecommerce Platform'}
          </p>
        </div>
      </div>

    </div>
  );
}
