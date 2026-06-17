import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Lock, Smartphone, User, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, MapPin } from 'lucide-react';
import { getSupabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { useCustomerStore } from '../store/useCustomerStore';
import { bdAddressData, divisions } from '../data/addressData';
import { pixelService } from '../utils/pixelService';
import { cn } from '../lib/utils';

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuthStore();
  const { addCustomer } = useCustomerStore();

  const from = location.state?.from?.pathname || '/account/dashboard';

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    division: '',
    district: '',
    upazila: '',
    area: '',
    postalCode: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: '',
  });

  useEffect(() => {
    if (isAuthenticated && !success) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from, success]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Mobile Number is required';
    if (!formData.password.trim()) newErrors.password = 'Password is required';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.address.trim()) newErrors.address = 'Full Address is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setError('Please fix the errors below.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const supabase = getSupabase();
      if (!supabase) throw new Error("Database connection not ready");

      const signupEmail = formData.email ? formData.email.toLowerCase().trim() : `${formData.phone.trim()}@tazumart.com`;
      
      // 1. Register with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: signupEmail,
        password: formData.password,
        options: {
          data: {
            name: formData.fullName,
            phone: formData.phone.trim(),
            role: 'customer'
          }
        }
      });

      if (authError) throw new Error(authError.message);

      if (!authData.user) throw new Error("Registration failed");

      // 2. Save user profile to 'users' table
      const { error: dbError } = await supabase.from('users').insert([{
        id: authData.user.id,
        uid: authData.user.id,
        name: formData.fullName,
        email: formData.email.toLowerCase().trim() || null,
        phone: formData.phone.trim(),
        role: 'customer',
        status: 'Active',
        password: formData.password, // Storing for phone-login fallback
        createdAt: new Date().toISOString(),
        gender: formData.gender,
        address: formData.address.trim(),
        division: formData.division,
        district: formData.district,
        upazila: formData.upazila,
        area: formData.area,
        postalCode: formData.postalCode,
      }]);

      if (dbError) console.warn("Profile table insert failed:", dbError.message);

      // 3. Update Stores
      addCustomer({
        id: authData.user.id,
        name: formData.fullName,
        phones: [formData.phone.trim()],
        emails: formData.email ? [formData.email.toLowerCase().trim()] : [],
        address: {
          country: 'Bangladesh',
          city: formData.district,
          area: formData.area || formData.upazila,
          street: formData.address.trim(),
          division: formData.division,
          district: formData.district,
          upazila: formData.upazila,
          zipCode: formData.postalCode,
        },
        gender: formData.gender,
        status: 'Active',
        customerType: 'New',
        totalOrders: 0,
        totalSpend: 0,
        lastLogin: Date.now(),
        totalLogins: 1,
        socialLinks: []
      });

      login({
        id: authData.user.id,
        name: formData.fullName,
        email: formData.email.toLowerCase().trim() || '',
        phone: formData.phone.trim(),
        role: 'customer',
        gender: formData.gender,
        address: formData.address.trim(),
        division: formData.division,
        district: formData.district,
        upazila: formData.upazila,
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
        <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-[440px] bg-white p-8 rounded-[24px] border border-neutral-150 space-y-4">
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
          <h2 className="text-lg font-bold">Account Created</h2>
          <p className="text-xs text-neutral-500">Welcome to Tazu Mart. Logging you in...</p>
          <Loader2 className="w-4 h-4 animate-spin mx-auto text-neutral-900" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50/50 flex flex-col items-center justify-center p-4 font-sans text-neutral-900">
      <motion.div initial={{ opacity: 0, scale: 0.98, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="w-full max-w-[500px] bg-white p-6 md:p-8 rounded-[24px] border border-neutral-150 shadow-sm">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-neutral-950 rounded-lg flex items-center justify-center text-white font-extrabold text-sm">T</div>
            <span className="text-base font-black tracking-tight uppercase">Tazu Mart</span>
          </Link>
          <h2 className="text-lg font-bold">Create Account</h2>
          <p className="text-xs text-neutral-500">Join us to start secure shopping.</p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 text-red-700 text-xs font-medium border border-red-100 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 space-y-1.5">
            <label className="block text-[11px] font-bold text-neutral-500 uppercase ml-1">Full Name *</label>
            <div className="relative">
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required className="w-full h-[50px] border border-[#E5E5E5] rounded-[14px] pl-10 pr-4 text-sm" placeholder="John Doe" />
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-neutral-500 uppercase ml-1">Phone Number *</label>
            <div className="relative">
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="w-full h-[50px] border border-[#E5E5E5] rounded-[14px] pl-10 pr-4 text-sm" placeholder="+8801700000000" />
              <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-neutral-500 uppercase ml-1">Email (Optional)</label>
            <div className="relative">
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full h-[50px] border border-[#E5E5E5] rounded-[14px] pl-10 pr-4 text-sm" placeholder="john@example.com" />
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-neutral-500 uppercase ml-1">Password *</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} required className="w-full h-[50px] border border-[#E5E5E5] rounded-[14px] pl-10 pr-4 text-sm" placeholder="••••••••" />
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-neutral-500 uppercase ml-1">Confirm Password *</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required className="w-full h-[50px] border border-[#E5E5E5] rounded-[14px] pl-10 pr-4 text-sm" placeholder="••••••••" />
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            </div>
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label className="block text-[11px] font-bold text-neutral-500 uppercase ml-1">Gender *</label>
            <div className="flex gap-4">
              {['Male', 'Female', 'Other'].map(g => (
                <label key={g} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="gender" value={g} checked={formData.gender === g} onChange={handleChange} className="w-4 h-4 accent-black" />
                  <span className="text-sm font-medium">{g}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 border-t border-neutral-100 pt-4 mt-2">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-neutral-400" />
              <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Address Details</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <select name="division" value={formData.division} onChange={handleChange} className="h-[46px] border border-[#E5E5E5] rounded-[12px] px-3 text-xs font-semibold">
                <option value="">Division</option>
                {divisions.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <input type="text" name="district" value={formData.district} onChange={handleChange} placeholder="District" className="h-[46px] border border-[#E5E5E5] rounded-[12px] px-3 text-xs font-semibold" />
              <input type="text" name="area" value={formData.area} onChange={handleChange} placeholder="Area" className="h-[46px] border border-[#E5E5E5] rounded-[12px] px-3 text-xs font-semibold" />
              <input type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} placeholder="Post Code" className="h-[46px] border border-[#E5E5E5] rounded-[12px] px-3 text-xs font-semibold" />
              <textarea name="address" value={formData.address} onChange={handleChange} required placeholder="Street / House Address *" className="col-span-2 h-[80px] border border-[#E5E5E5] rounded-[12px] p-3 text-xs font-semibold resize-none" />
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="md:col-span-2 h-[54px] bg-neutral-950 text-white rounded-[14px] font-bold uppercase tracking-wider text-xs flex justify-center items-center gap-2 mt-2">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'REGISTER NOW'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-neutral-500">
          Already have an account? <Link to="/login" className="text-neutral-950 font-bold">Sign In</Link>
        </div>
      </motion.div>
    </div>
  );
}
