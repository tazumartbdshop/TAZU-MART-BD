import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  Trash2, 
  Image as ImageIcon, 
  Check, 
  Loader2, 
  User, 
  Sparkles,
  Info,
  ExternalLink
} from 'lucide-react';
import { useBrandingStore } from '../../store/useBrandingStore';
import { uploadImage } from '../../lib/imageUtils';
import { loginBannerService } from '../../services/loginBannerService';

export default function AdminAuthImages() {
  const { settings: branding, updateBranding, isLoaded } = useBrandingStore();

  const [maleImage, setMaleImage] = useState(branding.male_profile_image || '');
  const [femaleImage, setFemaleImage] = useState(branding.female_profile_image || '');
  const [guestImage, setGuestImage] = useState(branding.default_profile_image || '');
  const [loginBanner, setLoginBanner] = useState(branding.login_banner || '');

  const [isSaving, setIsSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isLoaded) {
      setMaleImage(branding.male_profile_image || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80');
      setFemaleImage(branding.female_profile_image || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80');
      setGuestImage(branding.default_profile_image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80');
      setLoginBanner(branding.login_banner || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&auto=format&fit=crop&q=80');
    }
  }, [branding, isLoaded]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'male' | 'female' | 'guest' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingField(field);
    try {
      const url = await uploadImage(file, 'auth_assets', `${field}_${Date.now()}`);
      if (field === 'male') setMaleImage(url);
      else if (field === 'female') setFemaleImage(url);
      else if (field === 'guest') setGuestImage(url);
      else if (field === 'banner') setLoginBanner(url);
    } catch (err) {
      console.error(`Failed to upload ${field} image:`, err);
      alert('Image upload failed. Please try again.');
    } finally {
      setUploadingField(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const payload = {
        male_profile_image: maleImage.trim(),
        female_profile_image: femaleImage.trim(),
        default_profile_image: guestImage.trim(),
        login_banner: loginBanner.trim(),
      };

      await updateBranding(payload);

      if (loginBanner.trim()) {
        await loginBannerService.saveLoginBanner({
          image_url: loginBanner.trim(),
          title: 'Login Banner',
          is_active: true
        });
      }

      await fetch('/api/account-characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err: any) {
      console.error('Failed to save auth images:', err);
      alert('Failed to save settings: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 font-sans text-left text-neutral-900">
      {/* Header */}
      <div className="bg-white border border-neutral-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <ImageIcon className="w-6 h-6 text-neutral-900" />
            <h1 className="text-xl font-black uppercase tracking-wider text-neutral-950">
              Account & Login Image Management
            </h1>
          </div>
          <p className="text-xs text-neutral-500 mt-1 font-medium leading-relaxed">
            Configure default customer profile images (Male / Female) and the Login/Create Account banner.
          </p>
        </div>

        {saveSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-4 py-2 flex items-center gap-2 rounded-sm shrink-0">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Saved Successfully!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 3 Dedicated Image Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* 1. Male Image */}
          <div className="bg-white border border-neutral-200 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-neutral-700" />
                  <h2 className="text-sm font-black uppercase tracking-wider text-neutral-900">
                    1. Male Profile Image
                  </h2>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded">
                  Default Avatar
                </span>
              </div>

              <p className="text-xs text-neutral-500 mb-4 leading-relaxed">
                Customer যদি <strong>Male</strong> হিসেবে নির্বাচন করে এবং নিজের Profile Image না দেয়, তাহলে এই Image Circular Profile Image হিসেবে দেখাবে।
              </p>

              {/* Circular Avatar Preview */}
              <div className="flex items-center gap-4 mb-4">
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-neutral-300 bg-neutral-100 shrink-0 shadow-xs">
                  {maleImage ? (
                    <img 
                      src={maleImage} 
                      alt="Male Profile Default" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-400">
                      <User className="w-8 h-8" />
                    </div>
                  )}
                  {uploadingField === 'male' && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white">
                      <Loader2 className="w-5 h-5 animate-spin" />
                    </div>
                  )}
                </div>

                <div className="space-y-2 flex-1">
                  <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-neutral-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider cursor-pointer rounded transition-all">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Image</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handleFileUpload(e, 'male')} 
                      className="hidden" 
                    />
                  </label>
                  {maleImage && (
                    <button 
                      type="button" 
                      onClick={() => setMaleImage('')}
                      className="block text-[11px] font-bold text-red-600 hover:text-red-700 uppercase tracking-wider"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Image URL Input */}
              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-neutral-500">
                  Image Direct URL
                </label>
                <input 
                  type="text" 
                  value={maleImage} 
                  onChange={(e) => setMaleImage(e.target.value)}
                  placeholder="https://example.com/male-avatar.jpg"
                  className="w-full h-10 border border-neutral-200 px-3 text-xs focus:border-neutral-950 outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* 2. Female Image */}
          <div className="bg-white border border-neutral-200 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-neutral-700" />
                  <h2 className="text-sm font-black uppercase tracking-wider text-neutral-900">
                    2. Female Profile Image
                  </h2>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded">
                  Default Avatar
                </span>
              </div>

              <p className="text-xs text-neutral-500 mb-4 leading-relaxed">
                Customer যদি <strong>Female</strong> হিসেবে নির্বাচন করে এবং নিজের Profile Image না দেয়, তাহলে এই Image Circular Profile Image হিসেবে দেখাবে।
              </p>

              {/* Circular Avatar Preview */}
              <div className="flex items-center gap-4 mb-4">
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-neutral-300 bg-neutral-100 shrink-0 shadow-xs">
                  {femaleImage ? (
                    <img 
                      src={femaleImage} 
                      alt="Female Profile Default" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-400">
                      <User className="w-8 h-8" />
                    </div>
                  )}
                  {uploadingField === 'female' && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white">
                      <Loader2 className="w-5 h-5 animate-spin" />
                    </div>
                  )}
                </div>

                <div className="space-y-2 flex-1">
                  <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-neutral-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider cursor-pointer rounded transition-all">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Image</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handleFileUpload(e, 'female')} 
                      className="hidden" 
                    />
                  </label>
                  {femaleImage && (
                    <button 
                      type="button" 
                      onClick={() => setFemaleImage('')}
                      className="block text-[11px] font-bold text-red-600 hover:text-red-700 uppercase tracking-wider"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Image URL Input */}
              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-neutral-500">
                  Image Direct URL
                </label>
                <input 
                  type="text" 
                  value={femaleImage} 
                  onChange={(e) => setFemaleImage(e.target.value)}
                  placeholder="https://example.com/female-avatar.jpg"
                  className="w-full h-10 border border-neutral-200 px-3 text-xs focus:border-neutral-950 outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* 3. Guest Profile Image */}
          <div className="bg-white border border-neutral-200 p-6 flex flex-col justify-between md:col-span-2">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-neutral-700" />
                  <h2 className="text-sm font-black uppercase tracking-wider text-neutral-900">
                    3. Guest Character Profile Image
                  </h2>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded">
                  Default Avatar
                </span>
              </div>

              <p className="text-xs text-neutral-500 mb-4 leading-relaxed">
                Customer/Guest Profile-এ gender নির্দিষ্ট না করা থাকলে বা <strong>Guest Character</strong> হিসেবে এই Circular Avatar Image দেখাবে।
              </p>

              {/* Circular Avatar Preview */}
              <div className="flex items-center gap-4 mb-4">
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-neutral-300 bg-neutral-100 shrink-0 shadow-xs">
                  {guestImage ? (
                    <img 
                      src={guestImage} 
                      alt="Guest Profile Default" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-400">
                      <User className="w-8 h-8" />
                    </div>
                  )}
                  {uploadingField === 'guest' && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white">
                      <Loader2 className="w-5 h-5 animate-spin" />
                    </div>
                  )}
                </div>

                <div className="space-y-2 flex-1">
                  <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-neutral-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider cursor-pointer rounded transition-all">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Image</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handleFileUpload(e, 'guest')} 
                      className="hidden" 
                    />
                  </label>
                  {guestImage && (
                    <button 
                      type="button" 
                      onClick={() => setGuestImage('')}
                      className="block text-[11px] font-bold text-red-600 hover:text-red-700 uppercase tracking-wider"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Image URL Input */}
              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-neutral-500">
                  Image Direct URL
                </label>
                <input 
                  type="text" 
                  value={guestImage} 
                  onChange={(e) => setGuestImage(e.target.value)}
                  placeholder="https://example.com/guest-avatar.jpg"
                  className="w-full h-10 border border-neutral-200 px-3 text-xs focus:border-neutral-950 outline-none transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 3. Login / Account Banner */}
        <div className="bg-white border border-neutral-200 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-neutral-700" />
              <h2 className="text-sm font-black uppercase tracking-wider text-neutral-900">
                3. Login & Account Banner
              </h2>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded">
              High Resolution Banner
            </span>
          </div>

          <p className="text-xs text-neutral-500 leading-relaxed">
            Customer Login / Create Account Section-এর পাশে/নির্ধারিত Banner Area-তে এই Image দেখাবে। Banner-এর জন্য Image-এর আসল প্রয়োজন অনুযায়ী পর্যাপ্ত প্রাকৃতিক আকার রাখা হয়েছে।
          </p>

          {/* Banner Preview Area - Spacious & Natural Aspect Ratio */}
          <div className="relative w-full rounded-md overflow-hidden border border-neutral-200 bg-neutral-100">
            {loginBanner ? (
              <div className="relative w-full max-h-[360px] overflow-hidden flex items-center justify-center bg-neutral-900">
                <img 
                  src={loginBanner} 
                  alt="Login & Create Account Banner" 
                  className="w-full h-full max-h-[360px] object-cover"
                />
              </div>
            ) : (
              <div className="w-full h-48 flex flex-col items-center justify-center text-neutral-400 gap-2">
                <ImageIcon className="w-8 h-8" />
                <span className="text-xs font-semibold">No Banner Selected</span>
              </div>
            )}
            {uploadingField === 'banner' && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-neutral-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider cursor-pointer rounded transition-all">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Banner</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleFileUpload(e, 'banner')} 
                  className="hidden" 
                />
              </label>

              {loginBanner && (
                <button 
                  type="button" 
                  onClick={() => setLoginBanner('')}
                  className="px-3 py-2 border border-neutral-300 hover:border-red-400 hover:text-red-600 text-neutral-600 text-xs font-bold uppercase tracking-wider rounded transition-colors"
                >
                  Clear Banner
                </button>
              )}
            </div>

            <div className="w-full sm:w-80">
              <input 
                type="text" 
                value={loginBanner} 
                onChange={(e) => setLoginBanner(e.target.value)}
                placeholder="Direct Banner URL (https://...)"
                className="w-full h-10 border border-neutral-200 px-3 text-xs focus:border-neutral-950 outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-neutral-200">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3.5 bg-neutral-950 hover:bg-black text-white text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-sm active:scale-98 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Save All 3 Image Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
