import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Eye, 
  EyeOff, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Camera, 
  Check, 
  X 
} from 'lucide-react';
import { getSupabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { useCustomerStore } from '../store/useCustomerStore';
import { useBrandingStore } from '../store/useBrandingStore';
import { pixelService } from '../utils/pixelService';
import { cn } from '../lib/utils';
import { uploadImage } from '../lib/imageUtils';
import { bdAddressData } from '../data/addressData';
import { useLoginBanner } from '../services/loginBannerService';

export default function Register() {
  const { settings: branding } = useBrandingStore();
  const { bannerUrl: liveLoginBanner } = useLoginBanner();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuthStore();
  const { addCustomer } = useCustomerStore();

  const from = location.state?.from?.pathname || '/account/dashboard';

  // Form state with required fields: Full Name, Phone Number, Address, District, Upazila, Thana
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    district: '',
    upazila: '',
    thana: '',
    gender: 'Male',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Customer custom uploaded profile photo
  const [customPhoto, setCustomPhoto] = useState<string>('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Address textarea auto-resize
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Touched state for live field validations
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isAuthenticated && !success) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from, success]);

  // Adjust Address textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 100)}px`;
    }
  }, [formData.address]);

  // All 64 Districts flattened
  const allDistricts = useMemo(() => {
    const districtsSet = new Set<string>();
    Object.values(bdAddressData).forEach(divObj => {
      Object.keys(divObj).forEach(d => districtsSet.add(d));
    });
    return Array.from(districtsSet).sort();
  }, []);

  // Available Upazilas / Thanas for selected district
  const availableUpazilas = useMemo(() => {
    if (!formData.district) return [];
    for (const div of Object.values(bdAddressData)) {
      if (div[formData.district]) {
        return div[formData.district];
      }
    }
    return [];
  }, [formData.district]);

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const next = { ...prev, [name]: value };
      if (name === 'district') {
        next.upazila = '';
        next.thana = '';
      }
      return next;
    });
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 11);
    setFormData(prev => ({ ...prev, phone: val }));
  };

  // Image Upload Handler
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      // Local preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to storage
      const uploadedUrl = await uploadImage(file, 'profiles', `customer_${Date.now()}`);
      if (uploadedUrl) {
        setCustomPhoto(uploadedUrl);
      }
    } catch (err) {
      console.warn("Local image preview fallback:", err);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCustomPhoto('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Default avatars from Admin Branding settings
  const defaultMaleImg = branding.male_profile_image || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80';
  const defaultFemaleImg = branding.female_profile_image || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80';
  const defaultGuestImg = branding.default_profile_image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80';
  const defaultBannerImg = liveLoginBanner || branding.login_banner || '';

  const effectiveAvatar = customPhoto 
    ? customPhoto 
    : formData.gender === 'Female' 
      ? defaultFemaleImg 
      : formData.gender === 'Male'
        ? defaultMaleImg
        : defaultGuestImg;

  // Live Validations
  const isNameValid = formData.fullName.trim().length > 0;
  const isPhoneValid = formData.phone.length === 10 || formData.phone.length === 11;
  const isAddressValid = formData.address.trim().length >= 3;
  const isDistrictValid = formData.district.trim().length > 0;
  const isUpazilaValid = formData.upazila.trim().length > 0;
  const isThanaValid = formData.thana.trim().length > 0;
  const isPasswordValid = formData.password.length >= 6;
  const isPasswordsMatching = formData.password && formData.password === formData.confirmPassword;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    setTouched({
      fullName: true,
      phone: true,
      address: true,
      district: true,
      upazila: true,
      thana: true,
      password: true,
      confirmPassword: true,
    });

    if (!isNameValid) {
      setError('অনুগ্রহ করে আপনার পুরো নাম (Full Name) লিখুন।');
      return;
    }
    if (!isPhoneValid) {
      setError('সঠিক ১০ বা ১১ ডিজিটের ফোন নম্বর দিন।');
      return;
    }
    if (!isAddressValid) {
      setError('অনুগ্রহ করে ডেলিভারি ঠিকানা (Address) লিখুন।');
      return;
    }
    if (!isDistrictValid) {
      setError('অনুগ্রহ করে District নির্বাচন বা লিখুন।');
      return;
    }
    if (!isUpazilaValid) {
      setError('অনুগ্রহ করে Upazila নির্বাচন বা লিখুন।');
      return;
    }
    if (!isThanaValid) {
      setError('অনুগ্রহ করে Thana নির্বাচন বা লিখুন।');
      return;
    }
    if (!isPasswordValid) {
      setError('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
      return;
    }
    if (!isPasswordsMatching) {
      setError('পাসওয়ার্ড দুটি মিলছে না। আবার চেক করুন।');
      return;
    }

    setIsLoading(true);

    try {
      const supabase = getSupabase();
      if (!supabase) throw new Error("Database connection not ready");

      const fullPhoneNumber = `+880${formData.phone.trim()}`;
      const signupEmail = formData.email?.trim() 
        ? formData.email.toLowerCase().trim() 
        : `${fullPhoneNumber}@tazumart.com`;
      
      const chosenAvatarUrl = effectiveAvatar;

      // 1. Supabase Auth signup
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: signupEmail,
        password: formData.password,
        options: {
          data: {
            name: formData.fullName,
            phone: fullPhoneNumber,
            role: 'customer'
          }
        }
      });

      if (authError) throw new Error(authError.message);
      if (!authData.user) throw new Error("Registration failed");

      const fullFormattedAddress = `${formData.address.trim()}, Thana: ${formData.thana.trim()}, Upazila: ${formData.upazila.trim()}, District: ${formData.district.trim()}`;

      // 2. Insert into 'users' table
      const { error: dbError } = await supabase.from('users').insert([{
        id: authData.user.id,
        uid: authData.user.id,
        name: formData.fullName,
        email: formData.email?.trim()?.toLowerCase() || '',
        phone: fullPhoneNumber,
        role: 'customer',
        status: 'Active',
        created_at: new Date().toISOString(),
        gender: formData.gender,
        address: fullFormattedAddress,
        profile_image: chosenAvatarUrl,
        postal_code: '',
        division: '',
        district: formData.district.trim(),
        upazila: formData.upazila.trim(),
        area: formData.thana.trim(),
      }]);

      if (dbError) {
        console.error("Users table insert error:", dbError);
      }

      // 3. Insert into 'customers' table
      const { error: customerError } = await supabase.from('customers').insert([{
        id: authData.user.id,
        name: formData.fullName,
        email: formData.email?.trim()?.toLowerCase() || '',
        phone: fullPhoneNumber,
        address: {
          street: formData.address.trim(),
          district: formData.district.trim(),
          upazila: formData.upazila.trim(),
          thana: formData.thana.trim(),
          division: '',
          zipCode: ''
        },
        profile_image: chosenAvatarUrl,
        gender: formData.gender,
        status: 'Active',
        customer_type: 'Regular',
        created_at: new Date().toISOString()
      }]);

      if (customerError) {
        console.error("Customer table insert error:", customerError);
      }

      // 4. Update Client State
      login({
        id: authData.user.id,
        name: formData.fullName,
        email: formData.email?.trim()?.toLowerCase() || '',
        phone: fullPhoneNumber,
        role: 'customer',
        gender: formData.gender,
        address: fullFormattedAddress,
        district: formData.district.trim(),
        upazila: formData.upazila.trim(),
        profileImage: chosenAvatarUrl,
      });

      pixelService.trackRegister(authData.user.id);
      setSuccess(true);
      setTimeout(() => navigate(from, { replace: true }), 1200);

    } catch (err: any) {
      console.error("Registration Error:", err);
      if (err.message?.includes('rate limit')) {
        setError('Email rate limit exceeded. Please try again shortly or contact support.');
      } else {
        setError(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 font-sans text-neutral-900 text-center">
        <div className="w-full max-w-sm space-y-4 text-center">
          <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto" />
          <h2 className="text-xl font-black uppercase tracking-tight">অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে</h2>
          <p className="text-xs text-neutral-500 font-medium">TAZU MART BD-তে আপনাকে স্বাগতম। লগইন হচ্ছে...</p>
          <Loader2 className="w-5 h-5 animate-spin mx-auto text-neutral-950 mt-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans p-0 m-0 w-full">
      {/* Container with 0px horizontal margin/padding on edges, max readable width centered */}
      <div className="w-full max-w-2xl mx-auto p-0 m-0">
        
        {/* ======================================================================= */}
        {/* 1. FULL WIDTH BANNER IMAGE (0px margin, 0px bottom gap)                 */}
        {/* ======================================================================= */}
        {defaultBannerImg && (
          <div className="w-full p-0 m-0 block">
            <img 
              src={defaultBannerImg} 
              alt="Account Banner" 
              className="w-full h-auto object-contain block m-0 p-0 border-0"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        {/* ======================================================================= */}
        {/* 2. CREATE ACCOUNT HEADER (Directly below banner with 0px gap)           */}
        {/* Single horizontal line: "CREATE ACCOUNT" (Left) | Circular Avatar (Right) */}
        {/* ======================================================================= */}
        <div className="w-full px-4 py-3 flex justify-between items-center m-0">
          {/* Left Side: Clean Title Text Only (No Logo, No Tagline) */}
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-neutral-950 m-0 p-0">
            CREATE ACCOUNT
          </h1>

          {/* Right Side: Circular Profile Image with Camera Icon */}
          <div className="flex items-center gap-2 shrink-0">
            <div 
              onClick={handleImageClick}
              className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-neutral-300 hover:border-black bg-neutral-100 cursor-pointer overflow-hidden transition-all duration-150 group shadow-xs shrink-0 select-none"
              title="Tap to upload profile picture"
            >
              <img 
                src={effectiveAvatar} 
                alt="Profile Avatar" 
                className="w-full h-full object-cover rounded-full"
              />

              {isUploadingPhoto && (
                <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center text-white">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              )}

              {/* Small Camera Icon */}
              <div className="absolute bottom-0 right-0 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-neutral-900 text-white flex items-center justify-center shadow border border-white group-hover:bg-black transition-colors">
                <Camera className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              </div>

              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                className="hidden" 
              />
            </div>

            {customPhoto && (
              <button 
                type="button" 
                onClick={handleRemovePhoto}
                className="text-[10px] font-bold text-red-600 hover:text-red-700 uppercase"
                title="Remove uploaded photo"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* ======================================================================= */}
        {/* 3. DIRECT FORM (Pure White Background, Necessary Spacing Only)          */}
        {/* ======================================================================= */}
        <div className="w-full px-4 pb-12">
          
          {/* Error Notice if any */}
          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-50 text-red-700 text-xs font-semibold border border-red-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            
            {/* 1. Full Name * */}
            <div className="space-y-1 text-left">
              <label htmlFor="fullName" className="block text-xs font-black text-neutral-800 uppercase tracking-wider">
                Full Name *
              </label>
              <div className="relative">
                <input 
                  id="fullName"
                  type="text" 
                  name="fullName" 
                  value={formData.fullName} 
                  onChange={handleChange} 
                  onBlur={() => handleBlur('fullName')}
                  autoComplete="name"
                  required 
                  placeholder="আপনার পুরো নাম লিখুন (e.g. Imtiaz Ahmed)" 
                  className={cn(
                    "w-full h-11 border rounded px-3.5 text-sm transition-colors outline-none",
                    touched.fullName && !isNameValid
                      ? "border-red-500 bg-red-50/10 focus:border-red-600"
                      : "border-neutral-300 focus:border-neutral-950"
                  )}
                />
                {touched.fullName && isNameValid && (
                  <Check className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                )}
              </div>
            </div>

            {/* 2. Phone Number * */}
            <div className="space-y-1 text-left">
              <label htmlFor="phone" className="block text-xs font-black text-neutral-800 uppercase tracking-wider">
                Phone Number *
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-xs font-bold text-neutral-800 border-r border-neutral-300 pr-2.5 select-none">
                  +880
                </span>
                <input 
                  id="phone"
                  type="tel" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handlePhoneChange} 
                  onBlur={() => handleBlur('phone')}
                  autoComplete="tel"
                  required 
                  placeholder="1834800916" 
                  className={cn(
                    "w-full h-11 border rounded pl-20 pr-10 text-sm transition-colors outline-none font-mono",
                    touched.phone && !isPhoneValid
                      ? "border-red-500 bg-red-50/10 focus:border-red-600"
                      : "border-neutral-300 focus:border-neutral-950"
                  )}
                />
                {touched.phone && (
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                    {isPhoneValid ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 3. Address * */}
            <div className="space-y-1 text-left">
              <label htmlFor="address" className="block text-xs font-black text-neutral-800 uppercase tracking-wider">
                Address *
              </label>
              <textarea 
                id="address"
                ref={textareaRef}
                name="address" 
                value={formData.address} 
                onChange={handleChange} 
                onBlur={() => handleBlur('address')}
                required 
                rows={2}
                placeholder="বাসা/রোড নম্বর ও এলাকার নাম লিখুন" 
                className={cn(
                  "w-full min-h-[44px] max-h-[100px] border rounded py-2.5 px-3.5 text-sm transition-colors outline-none resize-none leading-relaxed",
                  touched.address && !isAddressValid
                    ? "border-red-500 bg-red-50/10 focus:border-red-600"
                    : "border-neutral-300 focus:border-neutral-950"
                )}
              />
            </div>

            {/* 4. District * */}
            <div className="space-y-1 text-left">
              <label htmlFor="district" className="block text-xs font-black text-neutral-800 uppercase tracking-wider">
                District *
              </label>
              <div className="relative">
                <input 
                  id="district"
                  type="text" 
                  name="district" 
                  list="district-list"
                  value={formData.district} 
                  onChange={handleChange} 
                  onBlur={() => handleBlur('district')}
                  required 
                  placeholder="Select or type District (e.g. Dhaka, Chattogram)" 
                  className={cn(
                    "w-full h-11 border rounded px-3.5 text-sm transition-colors outline-none bg-white",
                    touched.district && !isDistrictValid
                      ? "border-red-500 bg-red-50/10 focus:border-red-600"
                      : "border-neutral-300 focus:border-neutral-950"
                  )}
                />
                <datalist id="district-list">
                  {allDistricts.map(dist => (
                    <option key={dist} value={dist} />
                  ))}
                </datalist>
                {touched.district && isDistrictValid && (
                  <Check className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                )}
              </div>
            </div>

            {/* 5. Upazila * */}
            <div className="space-y-1 text-left">
              <label htmlFor="upazila" className="block text-xs font-black text-neutral-800 uppercase tracking-wider">
                Upazila *
              </label>
              <div className="relative">
                <input 
                  id="upazila"
                  type="text" 
                  name="upazila" 
                  list="upazila-list"
                  value={formData.upazila} 
                  onChange={handleChange} 
                  onBlur={() => handleBlur('upazila')}
                  required 
                  placeholder="Select or type Upazila" 
                  className={cn(
                    "w-full h-11 border rounded px-3.5 text-sm transition-colors outline-none bg-white",
                    touched.upazila && !isUpazilaValid
                      ? "border-red-500 bg-red-50/10 focus:border-red-600"
                      : "border-neutral-300 focus:border-neutral-950"
                  )}
                />
                <datalist id="upazila-list">
                  {availableUpazilas.map(up => (
                    <option key={up} value={up} />
                  ))}
                </datalist>
                {touched.upazila && isUpazilaValid && (
                  <Check className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                )}
              </div>
            </div>

            {/* 6. Thana * */}
            <div className="space-y-1 text-left">
              <label htmlFor="thana" className="block text-xs font-black text-neutral-800 uppercase tracking-wider">
                Thana *
              </label>
              <div className="relative">
                <input 
                  id="thana"
                  type="text" 
                  name="thana" 
                  list="thana-list"
                  value={formData.thana} 
                  onChange={handleChange} 
                  onBlur={() => handleBlur('thana')}
                  required 
                  placeholder="Select or type Thana" 
                  className={cn(
                    "w-full h-11 border rounded px-3.5 text-sm transition-colors outline-none bg-white",
                    touched.thana && !isThanaValid
                      ? "border-red-500 bg-red-50/10 focus:border-red-600"
                      : "border-neutral-300 focus:border-neutral-950"
                  )}
                />
                <datalist id="thana-list">
                  {availableUpazilas.map(th => (
                    <option key={th} value={th} />
                  ))}
                </datalist>
                {touched.thana && isThanaValid && (
                  <Check className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                )}
              </div>
            </div>

            {/* Gender Selection with Dynamic Character Display from Admin */}
            <div className="space-y-1.5 text-left pt-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-black text-neutral-800 uppercase tracking-wider">
                  Gender *
                </label>
                <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">
                  {formData.gender} Selected
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-2.5 pt-0.5">
                {[
                  { id: 'Male', label: 'Male', img: defaultMaleImg },
                  { id: 'Female', label: 'Female', img: defaultFemaleImg },
                  { id: 'Other', label: 'Other', img: defaultGuestImg },
                ].map(({ id, label, img }) => {
                  const isSelected = formData.gender === id;
                  return (
                    <label
                      key={id}
                      className={cn(
                        "relative flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 px-2 py-2 sm:px-2.5 sm:py-2 border cursor-pointer transition-all duration-150 select-none overflow-hidden",
                        isSelected
                          ? "border-neutral-950 bg-neutral-100/70 ring-1.5 ring-neutral-950 shadow-xs"
                          : "border-neutral-200 bg-white hover:border-neutral-400 hover:bg-neutral-50"
                      )}
                    >
                      {/* Hidden semantic radio */}
                      <input 
                        type="radio" 
                        name="gender" 
                        value={id} 
                        checked={isSelected} 
                        onChange={handleChange} 
                        className="sr-only" 
                      />

                      {/* Square character container with transparent fit and clean scaling */}
                      <div className="relative w-8 h-8 sm:w-9 sm:h-9 shrink-0 flex items-center justify-center p-0.5 overflow-hidden">
                        <img 
                          src={img} 
                          alt={`${label} Character`} 
                          className="w-full h-full object-contain object-center transition-transform duration-200"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      {/* Clean bold label without truncation on mobile */}
                      <div className="min-w-0 flex-1">
                        <span className={cn(
                          "block text-[11px] sm:text-xs uppercase tracking-wider whitespace-nowrap text-center sm:text-left",
                          isSelected ? "font-black text-neutral-950" : "font-bold text-neutral-700"
                        )}>
                          {label}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1 text-left pt-1">
              <label htmlFor="password" className="block text-xs font-black text-neutral-800 uppercase tracking-wider">
                Password *
              </label>
              <div className="relative">
                <input 
                  id="password"
                  type={showPassword ? 'text' : 'password'} 
                  name="password" 
                  value={formData.password} 
                  onChange={handleChange} 
                  onBlur={() => handleBlur('password')}
                  autoComplete="new-password"
                  required 
                  placeholder="••••••••" 
                  className={cn(
                    "w-full h-11 border rounded pl-3.5 pr-11 text-sm outline-none transition-colors",
                    touched.password && !isPasswordValid
                      ? "border-red-500 bg-red-50/10 focus:border-red-600"
                      : "border-neutral-300 focus:border-neutral-950"
                  )}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1 text-left">
              <label htmlFor="confirmPassword" className="block text-xs font-black text-neutral-800 uppercase tracking-wider">
                Confirm Password *
              </label>
              <div className="relative">
                <input 
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'} 
                  name="confirmPassword" 
                  value={formData.confirmPassword} 
                  onChange={handleChange} 
                  onBlur={() => handleBlur('confirmPassword')}
                  autoComplete="new-password"
                  required 
                  placeholder="••••••••" 
                  className={cn(
                    "w-full h-11 border rounded pl-3.5 pr-11 text-sm outline-none transition-colors",
                    touched.confirmPassword && !isPasswordsMatching
                      ? "border-red-500 bg-red-50/10 focus:border-red-600"
                      : "border-neutral-300 focus:border-neutral-950"
                  )}
                />
                {touched.confirmPassword && isPasswordsMatching && (
                  <Check className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button 
                type="submit" 
                disabled={isLoading} 
                className="w-full h-12 bg-neutral-950 hover:bg-black text-white rounded font-black uppercase tracking-widest text-xs flex justify-center items-center gap-2 transition-all active:scale-99 disabled:opacity-60 shadow-xs"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <span>CREATE ACCOUNT</span>
                )}
              </button>
            </div>
          </form>

          {/* Bottom Sign In Link */}
          <div className="mt-6 text-center text-xs font-medium text-neutral-500">
            পূর্বেই অ্যাকাউন্ট আছে? <Link to="/login" className="text-neutral-950 font-black hover:underline ml-1">লগইন করুন (Sign In)</Link>
          </div>

        </div>

      </div>
    </div>
  );
}
