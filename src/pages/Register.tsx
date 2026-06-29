import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, Smartphone, User, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, Camera, Upload, Trash2, Plus, Check, MapPin } from 'lucide-react';
import { getSupabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { useCustomerStore } from '../store/useCustomerStore';
import { useBrandingStore } from '../store/useBrandingStore';
import { pixelService } from '../utils/pixelService';
import { cn } from '../lib/utils';

interface SpecialDay {
  name: string;
  date: string;
}

const SPECIAL_DAY_OPTIONS = [
  'Happy Birthday',
  'Marriage Day',
  'Anniversary',
  'Engagement',
  'Graduation',
  'First Job',
  'Baby Birthday',
  'Parents Anniversary',
  'Eid Celebration',
  'Victory Day',
  'Independence Day',
  'Personal Reminder',
  'Custom Occasion'
];

export default function Register() {
  const { settings: branding } = useBrandingStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuthStore();
  const { addCustomer } = useCustomerStore();

  const from = location.state?.from?.pathname || '/account/dashboard';

  // Form fields
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: '',
  });

  // Profile Picture
  const [profileImage, setProfileImage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Address ref for auto-expand
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Special Days
  const [specialDays, setSpecialDays] = useState<SpecialDay[]>([
    { name: 'Happy Birthday', date: '' }
  ]);

  // Track fields touched for live validation feedback
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isAuthenticated && !success) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from, success]);

  // Adjust Address text area height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [formData.address]);

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Specific phone change to strip non-digits and limit length
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 11);
    setFormData(prev => ({ ...prev, phone: val }));
  };

  // Profile Image handlers
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setProfileImage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Password Strength Logic
  const evaluatePasswordStrength = (pass: string) => {
    if (!pass) return { strength: 'empty', message: '', borderClass: 'border-[#E5E5E5]' };

    const hasLetter = /[a-zA-Z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    const hasSpecial = /[@#$!%*?&]/.test(pass);
    const isOnlyNumbers = /^[0-9]+$/.test(pass);

    // Rule 1: Only numbers
    if (isOnlyNumbers) {
      return {
        strength: 'weak',
        message: 'Password must include letters and special characters.',
        borderClass: 'border-red-500 focus:border-red-600 focus:ring-red-500/10'
      };
    }

    // Rule 3: Strong (Letter, Number, Special char (@ or # etc), and length >= 6)
    if (hasLetter && hasNumber && hasSpecial && pass.length >= 6) {
      return {
        strength: 'strong',
        message: 'Strong Password',
        borderClass: 'border-emerald-500 focus:border-emerald-600 focus:ring-emerald-500/10'
      };
    }

    // Rule 2: Medium
    return {
      strength: 'medium',
      message: 'Medium Password',
      borderClass: 'border-amber-500 focus:border-amber-600 focus:ring-amber-500/10'
    };
  };

  const passStrength = evaluatePasswordStrength(formData.password);
  const isConfirmDisabled = passStrength.strength === 'weak' || passStrength.strength === 'empty';

  // Dynamic Password Suggestions based on Full Name
  const generatePasswordSuggestions = (name: string) => {
    const cleanName = name.trim();
    if (!cleanName) return [];

    const nameWithoutSpaces = cleanName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const firstWord = cleanName.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '');
    const firstWordCap = firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();

    return [
      `${nameWithoutSpaces}@2026`,
      `${firstWordCap}@1234`,
      `${firstWordCap}Mart#2026`
    ];
  };

  const suggestions = generatePasswordSuggestions(formData.fullName);

  const applySuggestion = (suggestion: string) => {
    setFormData(prev => ({
      ...prev,
      password: suggestion,
      confirmPassword: suggestion
    }));
  };

  // Special Days Handlers
  const handleAddSpecialDay = () => {
    setSpecialDays(prev => [...prev, { name: 'Happy Birthday', date: '' }]);
  };

  const handleRemoveSpecialDay = (index: number) => {
    if (specialDays.length <= 1) {
      setSpecialDays([{ name: 'Happy Birthday', date: '' }]);
    } else {
      setSpecialDays(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSpecialDayChange = (index: number, field: keyof SpecialDay, value: string) => {
    setSpecialDays(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  // Live Validations for Fields
  const isNameValid = formData.fullName.trim().length > 0;
  const isPhoneValid = formData.phone.length === 10 || formData.phone.length === 11;
  const isAddressValid = formData.address.trim().length >= 5;
  const isPasswordsMatching = formData.password && formData.password === formData.confirmPassword;

  // Form submit handler
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Mark all as touched to trigger visual validation
    setTouched({
      fullName: true,
      phone: true,
      address: true,
      password: true,
      confirmPassword: true,
      gender: true
    });

    if (!isNameValid) {
      setError('Full Name is required.');
      return;
    }
    if (!isPhoneValid) {
      setError('Phone number must contain only 10 or 11 digits.');
      return;
    }
    if (!isAddressValid) {
      setError('Please provide a complete address (minimum 5 characters).');
      return;
    }
    if (passStrength.strength === 'weak') {
      setError('Please choose a stronger password.');
      return;
    }
    if (!isPasswordsMatching) {
      setError('Passwords do not match.');
      return;
    }
    if (!formData.gender) {
      setError('Gender selection is required.');
      return;
    }

    setIsLoading(true);

    try {
      const supabase = getSupabase();
      if (!supabase) throw new Error("Database connection not ready");

      const fullPhoneNumber = `+880${formData.phone.trim()}`;
      const signupEmail = formData.email ? formData.email.toLowerCase().trim() : `${fullPhoneNumber}@tazumart.com`;
      
      // 1. Register with Supabase Auth
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

      // Serialize special days to save in database
      const occasionJson = JSON.stringify(specialDays);

      // 2. Save user profile to 'users' table
      const { error: dbError } = await supabase.from('users').insert([{
        id: authData.user.id,
        uid: authData.user.id,
        name: formData.fullName,
        email: formData.email.toLowerCase().trim() || null,
        phone: fullPhoneNumber,
        role: 'customer',
        status: 'Active',
        createdAt: new Date().toISOString(),
        gender: formData.gender,
        address: formData.address.trim(),
        profileImage: profileImage || null,
        profile_image: profileImage || null,
        occasionName: occasionJson,
        occasion_name: occasionJson,
        loginProvider: 'Email',
        registrationDate: new Date().toISOString(),
        division: '',
        district: '',
        upazila: '',
        area: '',
        postalCode: '',
      }]);

      if (dbError) console.warn("Profile table insert failed:", dbError.message);

      // 3. Update Stores - Removed addCustomer call (Redundant with syncCustomerFromAuth)
      login({
        id: authData.user.id,
        name: formData.fullName,
        email: formData.email.toLowerCase().trim() || '',
        phone: fullPhoneNumber,
        role: 'customer',
        gender: formData.gender,
        address: formData.address.trim(),
        profileImage: profileImage || '',
        occasionName: occasionJson,
      });

      pixelService.trackRegister(authData.user.id);
      setSuccess(true);
      setTimeout(() => navigate(from, { replace: true }), 1500);

    } catch (err: any) {
      console.error("Registration Error:", err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-neutral-50/50 flex flex-col items-center justify-center p-4 font-sans text-neutral-900 text-center">
        <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-[440px] bg-white p-8 rounded-[24px] border border-neutral-150 space-y-4 shadow-sm">
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
          <h2 className="text-lg font-bold">Account Created</h2>
          <p className="text-xs text-neutral-500">Welcome to {branding.site_name || 'Tazu Mart BD'}. Logging you in...</p>
          <Loader2 className="w-4 h-4 animate-spin mx-auto text-neutral-900" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50/50 flex flex-col items-center justify-center p-4 py-12 font-sans text-neutral-900">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: 12 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        className="w-full max-w-[550px] bg-white p-6 md:p-8 rounded-[24px] border border-neutral-200 shadow-sm"
      >
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-neutral-950 rounded-lg flex items-center justify-center text-white font-extrabold text-sm overflow-hidden">
              {branding.signup_logo || branding.primary_logo || branding.desktop_logo ? (
                <img 
                  src={branding.signup_logo || branding.primary_logo || branding.desktop_logo} 
                  alt={branding.site_short_name || 'Logo'} 
                  className="w-full h-full object-contain" 
                  referrerPolicy="no-referrer" 
                />
              ) : (
                (branding.site_name || 'T')[0]
              )}
            </div>
            <span className="text-base font-black tracking-tight uppercase">
              {branding.site_name || 'Tazu Mart'}
            </span>
          </Link>
          <h2 className="text-xl font-black tracking-tight uppercase">Create Account</h2>
          <p className="text-xs text-neutral-500 mt-1">Join us to start secure shopping with premium service.</p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 text-red-700 text-xs font-semibold border border-red-100 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          
          {/* 3. Profile Picture Box (1:1 Square) */}
          <div className="flex flex-col items-center space-y-2 mb-4">
            <label className="block text-[11px] font-extrabold text-neutral-500 uppercase tracking-wider">
              Profile Picture
            </label>
            <div 
              onClick={handleImageClick}
              className="relative w-28 h-28 rounded-2xl border-2 border-dashed border-neutral-200 hover:border-black bg-neutral-50 flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all duration-200 group shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
            >
              {profileImage ? (
                <>
                  <img src={profileImage} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white space-y-1">
                    <Camera className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Change</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center text-center p-3 text-neutral-400 group-hover:text-neutral-600 transition-colors">
                  <Camera className="w-5 h-5 mb-1 text-neutral-400 group-hover:text-black transition-colors" />
                  <Upload className="w-3.5 h-3.5 text-neutral-300 group-hover:text-black transition-colors mb-1.5" />
                  <span className="text-[9px] font-extrabold uppercase tracking-widest leading-none">Tap to Upload</span>
                </div>
              )}
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                onChange={handleImageChange} 
                className="hidden" 
              />
            </div>
            {profileImage && (
              <button 
                type="button" 
                onClick={handleRemoveImage}
                className="text-[10px] font-extrabold text-red-500 hover:text-red-600 uppercase tracking-wider"
              >
                Remove Image
              </button>
            )}
          </div>

          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-black text-neutral-500 uppercase tracking-wider ml-1">Full Name *</label>
            <div className="relative">
              <input 
                type="text" 
                name="fullName" 
                value={formData.fullName} 
                onChange={handleChange} 
                onBlur={() => handleBlur('fullName')}
                required 
                className={cn(
                  "w-full h-[50px] border rounded-[14px] pl-10 pr-10 text-sm transition-all duration-150 outline-none",
                  touched.fullName 
                    ? isNameValid 
                      ? "border-emerald-500 bg-emerald-50/5 focus:ring-1 focus:ring-emerald-500" 
                      : "border-red-500 bg-red-50/5 focus:ring-1 focus:ring-red-500"
                    : "border-[#E5E5E5] focus:border-black focus:ring-1 focus:ring-black"
                )}
                placeholder="TAZU MART BD" 
              />
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              {touched.fullName && (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center">
                  {isNameValid ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Phone Number with Fixed +880 Prefix */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-black text-neutral-500 uppercase tracking-wider ml-1">Phone Number *</label>
            <div className="relative flex items-center">
              {/* Prefix Box */}
              <span className="absolute left-10 text-sm font-bold text-neutral-800 border-r border-neutral-200 pr-2 h-5 flex items-center select-none">
                +880
              </span>
              <input 
                type="tel" 
                name="phone" 
                value={formData.phone} 
                onChange={handlePhoneChange} 
                onBlur={() => handleBlur('phone')}
                required 
                className={cn(
                  "w-full h-[50px] border rounded-[14px] pl-24 pr-10 text-sm transition-all duration-150 outline-none",
                  touched.phone 
                    ? isPhoneValid 
                      ? "border-emerald-500 bg-emerald-50/5 focus:ring-1 focus:ring-emerald-500" 
                      : "border-red-500 bg-red-50/5 focus:ring-1 focus:ring-red-500"
                    : "border-[#E5E5E5] focus:border-black focus:ring-1 focus:ring-black"
                )}
                placeholder="1834800916" 
              />
              <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              {touched.phone && (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center">
                  {isPhoneValid ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
              )}
            </div>
            {touched.phone && !isPhoneValid && (
              <p className="text-[10.5px] text-red-500 font-bold uppercase tracking-wider ml-1 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Phone number must contain only 10 or 11 digits.
              </p>
            )}
            {touched.phone && isPhoneValid && (
              <p className="text-[10.5px] text-emerald-500 font-bold uppercase tracking-wider ml-1 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Valid Phone Number
              </p>
            )}
          </div>

          {/* 4. Address Field (Auto Expand Text Area) - Placed above Email */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-black text-neutral-500 uppercase tracking-wider ml-1">Address *</label>
            <div className="relative">
              <textarea 
                ref={textareaRef}
                name="address" 
                value={formData.address} 
                onChange={handleChange} 
                onBlur={() => handleBlur('address')}
                required 
                className={cn(
                  "w-full h-[50px] min-h-[50px] max-h-[180px] border rounded-[14px] py-3.5 pl-10 pr-10 text-sm transition-all duration-150 outline-none resize-none overflow-y-auto block leading-relaxed",
                  touched.address 
                    ? isAddressValid 
                      ? "border-emerald-500 bg-emerald-50/5 focus:ring-1 focus:ring-emerald-500" 
                      : "border-red-500 bg-red-50/5 focus:ring-1 focus:ring-red-500"
                    : "border-[#E5E5E5] focus:border-black focus:ring-1 focus:ring-black"
                )}
                placeholder="Street Address, Village/City, Division *" 
              />
              <MapPin className="absolute left-3.5 top-[15px] w-4 h-4 text-neutral-400" />
              {touched.address && (
                <div className="absolute right-3.5 top-[15px] flex items-center">
                  {isAddressValid ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Email (Optional) */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-black text-neutral-500 uppercase tracking-wider ml-1">Email (Optional)</label>
            <div className="relative">
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                className="w-full h-[50px] border border-[#E5E5E5] rounded-[14px] pl-10 pr-4 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                placeholder="john@example.com" 
              />
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            </div>
          </div>

          {/* Password with Intelligent Strength Meter */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center px-1">
              <label className="block text-[11px] font-black text-neutral-500 uppercase tracking-wider">Password *</label>
              {passStrength.strength !== 'empty' && (
                <span className={cn(
                  "text-[10px] font-extrabold uppercase tracking-widest",
                  passStrength.strength === 'weak' && "text-red-500",
                  passStrength.strength === 'medium' && "text-amber-500",
                  passStrength.strength === 'strong' && "text-emerald-500"
                )}>
                  {passStrength.message}
                </span>
              )}
            </div>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'} 
                name="password" 
                value={formData.password} 
                onChange={handleChange} 
                onBlur={() => handleBlur('password')}
                required 
                className={cn(
                  "w-full h-[50px] border rounded-[14px] pl-10 pr-12 text-sm outline-none transition-all duration-150",
                  touched.password ? passStrength.borderClass : "border-[#E5E5E5] focus:border-black focus:ring-1 focus:ring-black"
                )}
                placeholder="••••••••" 
              />
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Smart Password Suggestions pills */}
            {formData.fullName.trim().length >= 3 && (
              <div className="mt-2 space-y-1.5 bg-neutral-50 p-2.5 rounded-xl border border-neutral-100">
                <span className="text-[10px] font-black uppercase text-neutral-400 tracking-wider block">Suggested Strong Passwords:</span>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applySuggestion(s)}
                      className="px-2.5 py-1.5 bg-white border border-neutral-200 hover:border-black rounded-lg text-[11px] font-extrabold text-neutral-700 hover:text-neutral-900 transition-all shadow-[0_1px_3px_rgba(0,0,0,0.02)] active:scale-95"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password - Disabled unless Strength is Medium or Strong */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-black text-neutral-500 uppercase tracking-wider ml-1">Confirm Password *</label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'} 
                name="confirmPassword" 
                value={formData.confirmPassword} 
                onChange={handleChange} 
                onBlur={() => handleBlur('confirmPassword')}
                disabled={isConfirmDisabled}
                required 
                className={cn(
                  "w-full h-[50px] border rounded-[14px] pl-10 pr-10 text-sm outline-none transition-all duration-150",
                  isConfirmDisabled 
                    ? "bg-neutral-50/80 border-neutral-150 text-neutral-400 cursor-not-allowed" 
                    : touched.confirmPassword 
                      ? isPasswordsMatching 
                        ? "border-emerald-500 bg-emerald-50/5 focus:ring-1 focus:ring-emerald-500" 
                        : "border-red-500 bg-red-50/5 focus:ring-1 focus:ring-red-500"
                      : "border-[#E5E5E5] focus:border-black focus:ring-1 focus:ring-black"
                )}
                placeholder={isConfirmDisabled ? "Stronger password required" : "••••••••"} 
              />
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              {touched.confirmPassword && !isConfirmDisabled && (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center">
                  {isPasswordsMatching ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
              )}
            </div>
            {touched.confirmPassword && !isConfirmDisabled && !isPasswordsMatching && (
              <p className="text-[10.5px] text-red-500 font-bold uppercase tracking-wider ml-1 mt-1">
                Password does not match.
              </p>
            )}
          </div>

          {/* Gender selection */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-black text-neutral-500 uppercase tracking-wider ml-1">Gender *</label>
            <div className="flex gap-6 pl-1 pt-1">
              {['Male', 'Female', 'Other'].map(g => (
                <label key={g} className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="radio" 
                    name="gender" 
                    value={g} 
                    checked={formData.gender === g} 
                    onChange={handleChange} 
                    className="w-4.5 h-4.5 accent-black text-black border-neutral-300 focus:ring-0" 
                  />
                  <span className="text-sm font-semibold text-neutral-700 group-hover:text-black transition-colors">{g}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 9. Special Days Section - Replaces the old Address Section */}
          <div className="border-t border-neutral-100 pt-5 mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-neutral-400" />
                <span className="text-[11px] font-black text-neutral-500 uppercase tracking-widest">Special Days</span>
              </div>
              {/* 11. Add More Button */}
              <button
                type="button"
                onClick={handleAddSpecialDay}
                className="w-7 h-7 bg-neutral-900 hover:bg-black text-white rounded-full flex items-center justify-center transition-all shadow-sm active:scale-90"
                title="Add Special Day Row"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[10.5px] text-neutral-400 font-medium leading-relaxed uppercase tracking-wider">
              Save your important days (e.g. birthday, anniversary) for exclusive offers & gifts!
            </p>

            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {specialDays.map((sd, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="flex gap-2.5 items-center bg-neutral-50/50 p-2.5 rounded-xl border border-neutral-100"
                  >
                    {/* Left Column: Special Day Dropdown */}
                    <div className="flex-1">
                      <select 
                        value={sd.name} 
                        onChange={(e) => handleSpecialDayChange(index, 'name', e.target.value)}
                        className="w-full h-[44px] border border-[#E5E5E5] rounded-[10px] px-3 text-xs font-bold bg-white focus:border-black outline-none transition-colors"
                      >
                        {SPECIAL_DAY_OPTIONS.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>

                    {/* Right Column: Special Date Input (Text) */}
                    <div className="flex-1">
                      <input 
                        type="text" 
                        value={sd.date} 
                        onChange={(e) => handleSpecialDayChange(index, 'date', e.target.value)}
                        placeholder="e.g. 21 June 2026" 
                        className="w-full h-[44px] border border-[#E5E5E5] rounded-[10px] px-3 text-xs font-semibold bg-white focus:border-black outline-none transition-colors"
                      />
                    </div>

                    {/* Remove Row Button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveSpecialDay(index)}
                      className="w-9 h-9 border border-neutral-200 hover:border-red-200 hover:bg-red-50 text-neutral-400 hover:text-red-500 rounded-xl flex items-center justify-center transition-all active:scale-95"
                      title="Remove Row"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={isLoading} 
            className="w-full h-[54px] bg-neutral-950 hover:bg-neutral-900 text-white rounded-[16px] font-black uppercase tracking-widest text-xs flex justify-center items-center gap-2 mt-4 transition-all duration-150 active:scale-98 shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'REGISTER NOW'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs font-semibold text-neutral-500">
          Already have an account? <Link to="/login" className="text-neutral-950 font-black hover:underline ml-1">Sign In</Link>
        </div>
      </motion.div>
    </div>
  );
}
