import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Lock, Smartphone, User, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, ShieldCheck, ArrowRight, Plus } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useCustomerStore } from '../store/useCustomerStore';

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuthStore();
  const { addCustomer } = useCustomerStore();

  const from = location.state?.from?.pathname || '/account/dashboard';

  useEffect(() => {
    if (isAuthenticated && !success) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from, success]);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    email: '',
    password: '',
    confirmPassword: '',
    occasionName: '',
    specialDate: '',
    profileImage: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, profileImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (value.length > 8) value = value.slice(0, 8); // Limit to 8 digits

    let maskedValue = value;
    if (value.length > 4) {
      maskedValue = `${value.slice(0, 2)}-${value.slice(2, 4)}-${value.slice(4)}`;
    } else if (value.length > 2) {
      maskedValue = `${value.slice(0, 2)}-${value.slice(2)}`;
    }

    setFormData(prev => ({ ...prev, specialDate: maskedValue }));
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!formData.phone.trim()) {
      setError('Please enter your mobile number');
      return;
    }
    if (!formData.password.trim()) {
      setError('Please create a secure password');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');

    setTimeout(() => {
      setIsLoading(false);
      setSuccess(true);
      
      // Persist the custom customer securely in customer store so they can log back in
      const newCustomer = {
        name: formData.fullName,
        phones: [formData.phone.trim()],
        emails: formData.email ? [formData.email.toLowerCase().trim()] : [],
        password: formData.password,
        address: {
          country: 'Bangladesh',
          city: '',
          area: '',
          street: formData.address.trim(),
        },
        profileImage: formData.profileImage,
        occasionName: formData.occasionName,
        specialDate: formData.specialDate,
        socialLinks: [],
        status: 'Active' as const,
      };

      addCustomer(newCustomer);

      // Login immediately into active session
      login({
        id: 'cust_reg_' + Math.floor(Math.random() * 100000),
        name: formData.fullName,
        email: formData.email ? formData.email.toLowerCase().trim() : '',
        phone: formData.phone.trim(),
        role: 'customer'
      });

      setTimeout(() => {
        navigate(from, { replace: true });
      }, 1800);
    }, 1400);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-neutral-50/50 flex flex-col items-center justify-center p-4 font-sans text-neutral-900">
        <motion.div 
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-[440px] bg-white p-6 md:p-8 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-neutral-150 text-center space-y-5"
        >
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100 shadow-sm animate-pulse">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          
          <div className="space-y-1.5">
            <h2 className="text-lg font-bold text-neutral-900 uppercase tracking-wide">Account Created</h2>
            <p className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">Welcome To Tazu Mart</p>
          </div>

          <p className="text-xs text-neutral-500 font-medium leading-relaxed bg-neutral-50 p-3.5 rounded-xl border border-neutral-150">
            Your premium shop profile has been activated. Logging you in automatically...
          </p>

          <div className="flex items-center justify-center gap-2 text-[11px] font-bold text-neutral-600 pt-2">
            <Loader2 className="w-4 h-4 animate-spin text-neutral-900" />
            <span>Redirecting to Checkout / Account...</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50/50 flex flex-col items-center justify-center p-4 font-sans text-neutral-900">
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[440px] bg-white p-6 md:p-8 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-neutral-150"
      >
        {/* Header Section */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-neutral-950 rounded-lg flex items-center justify-center text-white font-extrabold text-sm select-none">
              T
            </div>
            <span className="text-base font-black tracking-tight text-neutral-950 uppercase">Tazu Mart</span>
          </Link>
          <h2 className="text-lg font-bold text-neutral-900 leading-tight">Create Account</h2>
          <p className="text-xs text-neutral-500 mt-1">Register to start secure shopping.</p>
        </div>

        {/* Error Notification */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 p-3.5 rounded-xl bg-red-50 text-red-700 text-xs font-medium border border-red-100 flex items-start gap-2.5 text-left"
          >
            <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5 text-red-500" />
            <div>{error}</div>
          </motion.div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          {/* Profile Picture Upload */}
          <div className="space-y-2 text-left">
            <div className="flex justify-between items-center ml-1 leading-none">
              <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Profile Picture</label>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Optional</span>
            </div>
            
            <label className="relative flex flex-col items-center justify-center w-full h-[130px] border-2 border-dashed border-neutral-300 rounded-[14px] bg-neutral-50 hover:bg-neutral-100 transition-all cursor-pointer overflow-hidden group">
              {formData.profileImage ? (
                <img src={formData.profileImage} alt="Profile Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Plus className="w-8 h-8 text-neutral-400 group-hover:text-black transition-colors" />
                  <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest group-hover:text-black transition-colors">Upload Profile Photo</span>
                </div>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
          </div>

          <div className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5 text-left">
              <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider ml-1">Full Name</label>
              <div className="relative">
                <input 
                  type="text" 
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required 
                  className="w-full h-[52px] bg-white border border-[#E5E5E5] text-neutral-900 pl-11 pr-4 rounded-[14px] focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all text-sm font-semibold placeholder:text-neutral-300" 
                  placeholder="e.g. Imtiaz Khan"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                  <User className="w-4.5 h-4.5" />
                </span>
              </div>
            </div>

            {/* Mobile Number */}
            <div className="space-y-1.5 text-left">
              <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider ml-1">Mobile Number</label>
              <div className="relative">
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required 
                  className="w-full h-[52px] bg-white border border-[#E5E5E5] text-neutral-900 pl-11 pr-4 rounded-[14px] focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all text-sm font-semibold placeholder:text-neutral-300" 
                  placeholder="+880 1XXXXXXXXX"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                  <Smartphone className="w-4.5 h-4.5" />
                </span>
              </div>
            </div>

            {/* Full Address */}
            <div className="space-y-1.5 text-left">
              <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider ml-1">Full Address</label>
              <div className="relative">
                <textarea 
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required 
                  rows={2}
                  className="w-full bg-white border border-[#E5E5E5] text-neutral-900 px-4 py-3 rounded-[14px] focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all text-sm font-semibold placeholder:text-neutral-300 resize-none" 
                  placeholder="Enter your detailed delivery address"
                />
              </div>
            </div>

            {/* Email (Optional) */}
            <div className="space-y-1.5 text-left">
              <div className="flex justify-between items-center ml-1 leading-none">
                <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Email Address</label>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Optional</span>
              </div>
              <div className="relative">
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full h-[52px] bg-white border border-[#E5E5E5] text-neutral-900 pl-11 pr-4 rounded-[14px] focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all text-sm font-semibold placeholder:text-neutral-300" 
                  placeholder="name@example.com"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                  <Mail className="w-4.5 h-4.5" />
                </span>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5 text-left">
              <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider ml-1">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required 
                  className="w-full h-[52px] bg-white border border-[#E5E5E5] text-neutral-900 pl-11 pr-11 rounded-[14px] focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all text-sm font-semibold placeholder:text-neutral-300" 
                  placeholder="At least 6 characters"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                  <Lock className="w-4.5 h-4.5" />
                </span>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5 text-left">
              <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider ml-1">Confirm Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required 
                  className="w-full h-[52px] bg-white border border-[#E5E5E5] text-neutral-900 pl-11 pr-11 rounded-[14px] focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all text-sm font-semibold placeholder:text-neutral-300" 
                  placeholder="Repeat your password"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                  <ShieldCheck className="w-4.5 h-4.5" />
                </span>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Your Special Day */}
          <div className="space-y-4 text-left pt-2 pb-2">
            <div className="flex justify-between items-center border-b border-neutral-100 pb-2">
              <h3 className="text-sm font-bold text-neutral-900">Your Special Day</h3>
              <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase">OPTIONAL</span>
            </div>
            
            <div className="space-y-1.5">
              <input 
                type="text" 
                name="occasionName"
                value={formData.occasionName}
                onChange={handleChange}
                placeholder="e.g. Birthday / Anniversary"
                className="w-full h-[58px] bg-white border border-[#ddd] pl-4 rounded-[8px] focus:outline-none focus:border-blue-500 transition-all text-base" 
              />
              <p style={{ fontSize: '13px', color: '#1565ff', marginTop: '8px', fontWeight: 500 }}>
                On this special day you will get extra facilities.
              </p>
            </div>
            
            <div className="space-y-1.5">
              <input 
                type="text" 
                name="specialDate"
                value={formData.specialDate}
                onChange={handleDateChange}
                placeholder="DD-MM-YYYY"
                maxLength={10}
                className="w-full h-[58px] bg-white border border-[#ddd] pl-4 rounded-[8px] focus:outline-none focus:border-blue-500 transition-all text-base" 
              />
            </div>
          </div>

          {/* Button Submit */}
          <div className="pt-2">
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full h-[54px] bg-neutral-950 text-white rounded-[14px] font-bold uppercase tracking-wider text-xs hover:opacity-90 active:scale-[0.98] transition-all duration-200 flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : (
                <span>CREATE ACCOUNT</span>
              )}
            </button>
          </div>
        </form>

        {/* Existing User Redirect Link */}
        <div className="mt-6 text-center pt-5 border-t border-neutral-100">
          <p className="text-xs text-neutral-500 leading-normal">
            Already have an account?{' '}
            <Link to="/login" className="text-neutral-950 font-bold hover:underline ml-1">
              Sign In
            </Link>
          </p>
        </div>

        {/* Security Badge */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-neutral-400 text-[10px] font-semibold">
          <Lock className="w-3.5 h-3.5 text-emerald-500" />
          <span>Secure SSL Registration</span>
        </div>
      </motion.div>

      {/* Footer System Pages */}
      <div className="mt-6 flex justify-center gap-5 text-[10px] text-neutral-400 font-semibold">
        <button type="button" className="hover:text-neutral-700 transition-colors cursor-pointer select-none">Privacy Policy</button>
        <span className="text-neutral-200 select-none">•</span>
        <button type="button" className="hover:text-neutral-700 transition-colors cursor-pointer select-none">Terms & Conditions</button>
      </div>
    </div>
  );
}
