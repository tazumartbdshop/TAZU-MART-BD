import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { useBrandingStore } from '../store/useBrandingStore';
import { useWebsitesStore } from '../store/useWebsitesStore';
import { useModeratorStore } from '../store/useModeratorStore';
import { useLoginHistoryStore } from '../store/useLoginHistoryStore';
import { getSupabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import { pixelService } from '../utils/pixelService';
import { getProviderIcon } from '../components/ProviderIcon';

export default function Login() {
  const { settings } = useSettingsStore();
  const { settings: branding } = useBrandingStore();
  const ADMIN_EMAIL = (settings.adminEmail && settings.adminEmail !== "admin@tazumart.com" ? settings.adminEmail : "admin.tazumartbd@gmail.com").toLowerCase().trim();
  const ADMIN_PASSWORD = settings.adminPassword && settings.adminPassword !== "12345678" ? settings.adminPassword : "8963885522";

  const [loginTab, setLoginTab] = useState<'email' | 'phone'>('email');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  
  // Phone OTP States
  const [phoneStep, setPhoneStep] = useState<'input' | 'verify'>('input');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpError, setOtpError] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user } = useAuthStore();

  const searchParams = new URLSearchParams(location.search);
  const redirectPath = searchParams.get('redirect');
  const message = location.state?.message;

  const from = redirectPath || location.state?.from?.pathname || '/account/dashboard';
  const adminFrom = location.state?.from?.pathname || '/admin';

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      if (user?.role === 'admin') {
        navigate(adminFrom, { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    }
  }, [isAuthenticated, navigate, user, isLoading]);

  const handleSendOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSendingOtp || timer > 0) return;
    
    if (!phoneNumber.trim()) {
      setOtpError('Please enter a valid phone number');
      return;
    }

    setIsSendingOtp(true);
    setOtpError('');

    try {
      const supabase = getSupabase();
      if (!supabase) throw new Error("Database connection not ready.");

      // Format phone number to E.164 if needed (e.g. +880...)
      let formattedPhone = phoneNumber.trim();
      if (!formattedPhone.startsWith('+')) {
        // Assume BD if starts with 01
        if (formattedPhone.startsWith('01')) {
          formattedPhone = '+88' + formattedPhone;
        } else {
          // Add default prefix or alert
        }
      }

      const { error: otpErr } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });

      if (otpErr) throw otpErr;

      setPhoneStep('verify');
      setTimer(60);
    } catch (err: any) {
      console.error("OTP Error:", err);
      setOtpError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = otpCode.join('');
    if (token.length !== 6) {
      setOtpError('Please enter a valid 6-digit code');
      return;
    }

    setIsLoading(true);
    setOtpError('');

    try {
      const supabase = getSupabase();
      if (!supabase) throw new Error("Database connection not ready.");

      let formattedPhone = phoneNumber.trim();
      if (!formattedPhone.startsWith('+') && formattedPhone.startsWith('01')) {
        formattedPhone = '+88' + formattedPhone;
      }

      const { data, error: verifyErr } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: token,
        type: 'sms'
      });

      if (verifyErr) throw verifyErr;

      if (data.user) {
        // Fetch user details from 'users' table
        const { data: dbUser } = await supabase.from('users').select('*').eq('id', data.user.id).single();
        
        const userData = {
          id: data.user.id,
          name: dbUser?.name || data.user.user_metadata?.name || 'Customer',
          email: data.user.email || '',
          role: 'customer' as const,
          phone: dbUser?.phone || data.user.phone || formattedPhone,
          profileImage: dbUser?.profileImage || data.user.user_metadata?.profileImage || '',
        };

        login(userData);
        pixelService.trackLogin(data.user.id);
        navigate('/account/dashboard');
      }
    } catch (err: any) {
      console.error("Verify OTP Error:", err);
      setOtpError(err.message || 'Invalid or expired OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otpCode];
    newOtp[index] = value.slice(-1);
    setOtpCode(newOtp);

    // Auto focus next
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const activeProviders = [
    { id: 'google', name: 'Google' },
    { id: 'facebook', name: 'Facebook' }
  ];
  const isEmailPasswordEnabled = true;

  const handleOAuthLogin = async (providerId: string) => {
    try {
      setOauthLoading(providerId);
      setError('');
      const supabase = getSupabase();
      if (!supabase) throw new Error("Database connection not ready.");

      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: providerId as any,
        options: {
          redirectTo: `${window.location.origin}/account/dashboard`,
        }
      });

      if (authError) throw new Error(authError.message);
      
    } catch (err: any) {
      console.error(`${providerId} login error:`, err);
      setError(err.message || `Failed to sign in with ${providerId}`);
      setOauthLoading(null);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    if (!identifier.trim() || !password.trim()) {
      setError('Please enter your credentials');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const normalizedIdentifier = identifier.toLowerCase().trim();
      const isEmail = normalizedIdentifier.includes('@');
      const supabase = getSupabase();

      if (!supabase) {
        throw new Error("Database connection not ready.");
      }

      // 1. Check Dynamic Website Admin
      if (isEmail) {
        const websites = useWebsitesStore.getState().websites;
        const matchedSite = websites.find(w => w.admin_email.toLowerCase().trim() === normalizedIdentifier && w.admin_password === password);
        
        if (matchedSite) {
           useLoginHistoryStore.getState().addLoginEvent({
              name: matchedSite.website_name + ' Admin',
              email: matchedSite.admin_email,
              method: 'Manual Login',
              password: password,
            });

            login({
              id: `site_admin_${matchedSite.domain}`,
              name: matchedSite.website_name + ' Admin',
              email: matchedSite.admin_email,
              role: 'admin',
              permissions: ['all']
            });

            navigate(`/site-admin/${matchedSite.domain}`);
            return;
        }

        // 2. Check Super Admin
        if (normalizedIdentifier === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
            useLoginHistoryStore.getState().addLoginEvent({
              name: 'Super Admin',
              email: ADMIN_EMAIL,
              method: 'Manual Login',
              password: password,
            });

            login({
              id: 'super_admin_id',
              name: 'Super Admin',
              email: ADMIN_EMAIL,
              role: 'admin',
              permissions: ['all']
            });

            navigate('/admin');
            return;
        }

        // 3. Check Moderator
        const moderator = useModeratorStore.getState().getModeratorByEmail(normalizedIdentifier);
        if (moderator && moderator.password === password && moderator.status === 'Active') {
            useLoginHistoryStore.getState().addLoginEvent({
              name: moderator.name,
              email: moderator.email,
              method: 'Manual Login',
              password: password,
            });

            login({
              id: `moderator_${moderator.id}`,
              name: moderator.name,
              email: moderator.email,
              role: 'admin',
              permissions: moderator.permissions
            });

            navigate('/admin');
            return;
        }
      }

      // 4. Regular Customer Login via Supabase Auth
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: normalizedIdentifier,
        password: password,
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (data.user) {
        // Fetch user details from 'users' table
        const { data: dbUser } = await supabase.from('users').select('*').eq('id', data.user.id).single();
        
        const userData = {
          id: data.user.id,
          name: dbUser?.name || data.user.user_metadata?.name || 'Customer',
          email: data.user.email!,
          role: 'customer' as const,
          phone: dbUser?.phone || data.user.user_metadata?.phone || '',
          profileImage: dbUser?.profileImage || data.user.user_metadata?.profileImage || '',
        };

        login(userData);
        pixelService.trackLogin(data.user.id);
        navigate('/account/dashboard');
        return;
      }

    } catch (err: any) {
      console.error("Login Error:", err);
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthenticated) return null;

  return (
    <div className="w-full min-h-[calc(100vh-64px)] bg-neutral-50/50 flex flex-col items-center justify-start px-4 pt-6 pb-8 font-sans text-neutral-900">
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-[440px] bg-white px-6 py-5 md:px-8 md:py-6 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-neutral-150"
      >
        <div className="text-center mb-6">
          <Link to="/" className="flex flex-col items-center gap-2 mb-3">
            <div className="flex items-center justify-center select-none leading-none">
              {(settings.storeLogo || branding.primary_logo || branding.login_logo || branding.desktop_logo) && (
                <img 
                  src={settings.storeLogo || branding.primary_logo || branding.login_logo || branding.desktop_logo} 
                  alt={settings.storeName || 'Logo'} 
                  className="h-12 max-w-[160px] object-contain" 
                  referrerPolicy="no-referrer" 
                />
              )}
            </div>
            <h1 className="text-lg font-black tracking-tight text-neutral-950 uppercase leading-none">
              {settings.storeName || 'TAZU MART BD'}
            </h1>
          </Link>
          <p className="text-[13px] md:text-[14px] text-[#6B7280] text-center leading-[1.3] px-2 max-w-[400px] mx-auto">
            Sign in to unlock exclusive deals, faster checkout & member rewards.
          </p>
        </div>

        {message && (
          <div className="mb-5 p-3.5 rounded-xl bg-amber-50 text-amber-700 text-xs font-medium border border-amber-100 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
            <div>{message}</div>
          </div>
        )}

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 text-red-700 text-xs font-medium border border-red-100 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
            <div>{error}</div>
          </div>
        )}

        {/* Login Tabs */}
        <div className="flex bg-neutral-100 p-1 rounded-2xl mb-6">
          <button
            onClick={() => setLoginTab('email')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all",
              loginTab === 'email' ? "bg-white text-black shadow-sm" : "text-neutral-500 hover:text-neutral-700"
            )}
          >
            <Mail className="w-4 h-4" />
            EMAIL LOGIN
          </button>
          <button
            onClick={() => setLoginTab('phone')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all",
              loginTab === 'phone' ? "bg-white text-black shadow-sm" : "text-neutral-500 hover:text-neutral-700"
            )}
          >
            <span className="text-base leading-none">📱</span>
            PHONE LOGIN
          </button>
        </div>

        {isEmailPasswordEnabled && loginTab === 'email' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider ml-1">Email Address</label>
              <div className="relative">
                <input 
                  id="login-identifier"
                  type="email" 
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  autoComplete="email"
                  required 
                  className="w-full h-[52px] bg-white border border-[#E5E5E5] text-neutral-900 pl-11 pr-4 rounded-[14px] focus:outline-none focus:border-black focus:ring-1 focus:ring-black text-sm font-semibold" 
                  placeholder="Enter your email"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-neutral-400" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between ml-1">
                <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Password</label>
                <Link to="/forgot-password" size="sm" className="text-[11px] font-bold text-neutral-400 hover:text-black">Forgot Password?</Link>
              </div>
              <div className="relative">
                <input 
                  id="login-password"
                  type={showPassword ? 'text' : 'password'} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required 
                  className="w-full h-[52px] bg-white border border-[#E5E5E5] text-neutral-900 pl-11 pr-11 rounded-[14px] focus:outline-none focus:border-black focus:ring-1 focus:ring-black text-sm font-semibold" 
                  placeholder="Enter Password"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-neutral-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full h-[54px] bg-neutral-950 text-white rounded-[14px] font-bold uppercase tracking-wider text-xs hover:opacity-90 active:scale-[0.98] transition-all flex justify-center items-center gap-2"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'SIGN IN'}
            </button>
          </form>
        )}

        {loginTab === 'phone' && (
          <div className="space-y-4">
            {otpError && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-[11px] font-medium border border-red-100 flex items-start gap-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <div>{otpError}</div>
              </div>
            )}

            {phoneStep === 'input' ? (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider ml-1">Phone Number</label>
                  <div className="relative">
                    <input 
                      type="tel" 
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required 
                      className="w-full h-[52px] bg-white border border-[#E5E5E5] text-neutral-900 pl-11 pr-4 rounded-[14px] focus:outline-none focus:border-black focus:ring-1 focus:ring-black text-sm font-semibold" 
                      placeholder="e.g. 017XXXXXXXX"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">📱</div>
                  </div>
                </div>
                <button 
                  type="submit"
                  disabled={isSendingOtp}
                  className="w-full h-[54px] bg-neutral-950 text-white rounded-[14px] font-bold uppercase tracking-wider text-xs hover:opacity-90 active:scale-[0.98] transition-all flex justify-center items-center gap-2"
                >
                  {isSendingOtp ? <Loader2 className="w-4 h-4 animate-spin" /> : 'SEND OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <div className="text-center">
                  <p className="text-xs text-neutral-500 mb-4">
                    Enter the 6-digit code sent to <span className="text-black font-bold">{phoneNumber}</span>
                  </p>
                  <div className="flex justify-between gap-2 max-w-[320px] mx-auto">
                    {otpCode.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`otp-${idx}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        className="w-full aspect-square text-center text-xl font-black bg-neutral-50 border-2 border-neutral-150 rounded-xl focus:border-black focus:bg-white focus:outline-none transition-all"
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <button 
                    type="submit"
                    disabled={isLoading || otpCode.some(d => !d)}
                    className="w-full h-[54px] bg-neutral-950 text-white rounded-[14px] font-bold uppercase tracking-wider text-xs hover:opacity-90 active:scale-[0.98] transition-all flex justify-center items-center gap-2 disabled:bg-neutral-300"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'VERIFY & LOGIN'}
                  </button>
                  
                  <div className="flex flex-col items-center gap-3">
                    {timer > 0 ? (
                      <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                        Resend OTP in {timer}s
                      </p>
                    ) : (
                      <button 
                        type="button"
                        onClick={() => handleSendOTP()}
                        className="text-[11px] font-bold text-black uppercase tracking-wider hover:underline"
                      >
                        Resend OTP
                      </button>
                    )}
                    
                    <button 
                      type="button"
                      onClick={() => {
                        setPhoneStep('input');
                        setOtpError('');
                        setOtpCode(['', '', '', '', '', '']);
                      }}
                      className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider hover:text-black"
                    >
                      Change Phone Number
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        )}

        {activeProviders.length > 0 && (
          <div className="mt-6">
            {isEmailPasswordEnabled && (
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-2 text-neutral-500 font-medium">Or continue with</span>
                </div>
              </div>
            )}
            
            <div className={cn(
              "grid gap-3",
              activeProviders.length === 1 ? "grid-cols-1" : "grid-cols-2"
            )}>
              {activeProviders.map(p => (
                <button 
                  key={p.id}
                  onClick={() => handleOAuthLogin(p.id)}
                  disabled={!!oauthLoading}
                  className="group h-[48px] bg-white rounded-[14px] border border-neutral-200 flex items-center justify-center gap-2.5 font-semibold text-[13px] text-neutral-700 shadow-[0_2px_8px_rgb(0,0,0,0.02)] transition-all hover:bg-neutral-50 active:scale-[0.98] disabled:opacity-50"
                >
                  {oauthLoading === p.id ? (
                    <Loader2 className="w-4.5 h-4.5 animate-spin" />
                  ) : (
                    getProviderIcon(p.id)
                  )}
                  <span className="truncate">{p.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 text-center pt-5 border-t border-neutral-100">
          <p className="text-xs text-neutral-500">
            Don't have an account? <Link to="/register" className="text-neutral-950 font-bold hover:underline">Create Account</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
