import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Lock, Smartphone, User, Eye, EyeOff, Loader2, AlertCircle, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useCustomerStore } from '../store/useCustomerStore';
import { useModeratorStore } from '../store/useModeratorStore';
import { useLoginHistoryStore } from '../store/useLoginHistoryStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { useWebsitesStore } from '../store/useWebsitesStore';
import { cn } from '../lib/utils';
import { pixelService } from '../utils/pixelService';

export default function Login() {
  const { settings } = useSettingsStore();
  const ADMIN_EMAIL = (settings.adminEmail && settings.adminEmail !== "admin@tazumart.com" ? settings.adminEmail : "admin.tazumartbd@gmail.com").toLowerCase().trim();
  const ADMIN_PASSWORD = settings.adminPassword && settings.adminPassword !== "12345678" ? settings.adminPassword : "8963885522";

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user } = useAuthStore();
  const { customers } = useCustomerStore();

  const from = location.state?.from?.pathname || '/account/dashboard';
  const adminFrom = location.state?.from?.pathname || '/admin';

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      if (user?.role === 'admin') {
        navigate(adminFrom, { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    }
  }, [isAuthenticated, navigate, user, isLoading]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setError('Please enter your credentials');
      return;
    }

    setIsLoading(true);
    setError('');

    setTimeout(() => {
      setIsLoading(false);
      
      const normalizedIdentifier = identifier.toLowerCase().trim();
      const isEmail = normalizedIdentifier.includes('@');

      // Check Dynamic Website Admin First
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
            id: 'admin_' + matchedSite.domain,
            name: matchedSite.website_name + ' Admin',
            email: matchedSite.admin_email,
            role: 'admin',
            permissions: ['all']
          });
          navigate(`/site-admin/${matchedSite.domain}`);
          return;
        }

        // Check Admin
        if (normalizedIdentifier === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
          useLoginHistoryStore.getState().addLoginEvent({
            name: 'Super Admin',
            email: ADMIN_EMAIL,
            method: 'Manual Login',
            password: password,
          });
          login({
            id: 'admin_primary',
            name: 'Super Admin',
            email: ADMIN_EMAIL,
            role: 'admin',
            permissions: ['all'] // Admin has all permissions
          });
          navigate('/admin');
          return;
        }

        // Check Real Moderators (Also treated as Admin role for access)
        const moderator = useModeratorStore.getState().getModeratorByEmail(normalizedIdentifier);
        if (moderator && moderator.password === password && moderator.status === 'Active') {
          useLoginHistoryStore.getState().addLoginEvent({
            name: moderator.name,
            email: moderator.email,
            method: 'Manual Login',
            password: password,
          });
          login({
            id: moderator.id,
            name: moderator.name,
            email: moderator.email,
            role: 'admin', // Treated as admin role for access separation
            permissions: moderator.permissions
          });
          navigate('/admin');
          return;
        }
      }

      // Check Real Customers from store
      const customer = customers.find(c => {
        if (isEmail) {
          return c.emails.some(e => e.toLowerCase().trim() === normalizedIdentifier) && c.password === password;
        } else {
          return c.phones.some(p => p.trim() === normalizedIdentifier) && c.password === password;
        }
      });

      if (customer) {
        useLoginHistoryStore.getState().addLoginEvent({
          name: customer.name,
          email: customer.emails[0] || '',
          method: isEmail ? 'Manual Login (Email)' : 'Manual Login (Mobile)',
          password: password,
          profileImage: customer.profileImage,
        });
        login({
          id: customer.id,
          name: customer.name,
          email: customer.emails[0] || '',
          phone: customer.phones[0] || '',
          role: 'customer',
          profileImage: customer.profileImage,
        });
        pixelService.trackLogin(customer.id);
        navigate('/account/dashboard');
        return;
      }

      setError('Invalid credentials.');
    }, 1200);
  };

  // Determine dynamic input icon for premium experience
  const isEmailInput = identifier.includes('@');
  const isPhoneInput = /^\+?[0-9\s-]*$/.test(identifier) && identifier.length > 2;

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-50/50 flex flex-col items-center justify-center p-4 font-sans text-neutral-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="w-full max-w-[440px] bg-white p-6 md:p-8 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-neutral-150 text-center"
        >
          <div className="flex flex-col items-center mb-6">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-neutral-950 rounded-lg flex items-center justify-center text-white font-extrabold text-sm select-none">
                T
              </div>
              <span className="text-base font-bold tracking-tight text-neutral-950 uppercase">Tazu Mart BD</span>
            </Link>
            
            <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center border border-neutral-100 mb-4 text-emerald-600">
              <ShieldCheck className="w-8 h-8" />
            </div>
            
            <h2 className="text-lg font-bold text-neutral-900">Session Verified</h2>
            <p className="text-xs text-neutral-500 mt-1">
              You are signed in as a <span className="font-semibold text-neutral-800 uppercase text-[10px] bg-neutral-100 px-2 py-0.5 rounded-full">{user?.role}</span>
            </p>
          </div>

          <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 text-left mb-6 space-y-1">
            <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Account Active</div>
            <div className="text-sm font-bold text-neutral-800 truncate">{user?.name}</div>
            <div className="text-xs text-neutral-500 font-medium truncate">{user?.email || 'No email attached'}</div>
          </div>

          <div className="space-y-3">
            <Link 
              to={user?.role === 'admin' ? '/admin' : '/account/dashboard'}
              className="w-full h-12 bg-neutral-950 text-white rounded-[14px] text-xs font-bold uppercase tracking-wider hover:bg-neutral-900 transition-all flex justify-center items-center gap-2 active:scale-[0.98] cursor-pointer"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            
            <button 
              onClick={() => useAuthStore.getState().logout()}
              className="w-full h-11 bg-white border border-neutral-200 text-neutral-600 rounded-[14px] text-xs font-semibold hover:bg-neutral-50 hover:text-neutral-800 transition-all cursor-pointer"
            >
              Sign Out Securely
            </button>
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
            <span className="text-base font-black tracking-tight text-neutral-950 uppercase">Tazu Mart BD</span>
          </Link>
          <h2 className="text-lg font-bold text-neutral-900 leading-tight">Welcome Back</h2>
          <p className="text-xs text-neutral-500 mt-1">Sign in to continue shopping securely.</p>
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

        {/* Input Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5 text-left">
            <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider ml-1">
              Email or Mobile Number
            </label>
            <div className="relative">
              <input 
                type="text" 
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required 
                className="w-full h-[52px] bg-white border border-[#E5E5E5] text-neutral-900 pl-11 pr-4 rounded-[14px] focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all text-sm font-semibold placeholder:text-neutral-300" 
                placeholder="Enter Email or Phone Number"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 transition-colors pointer-events-none">
                <Mail className="w-4.5 h-4.5 text-neutral-600" />
              </span>
            </div>
          </div>

          <div className="space-y-1.5 text-left">
            <div className="flex items-center justify-between ml-1 leading-none">
              <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Password</label>
              <Link 
                to="/forgot-password" 
                className="text-[11px] font-bold text-neutral-400 hover:text-black hover:underline transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                className="w-full h-[52px] bg-white border border-[#E5E5E5] text-neutral-900 pl-11 pr-11 rounded-[14px] focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all text-sm font-semibold placeholder:text-neutral-300" 
                placeholder="Enter Password"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                <Lock className="w-4.5 h-4.5" />
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

          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="remember" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4.5 h-4.5 rounded-md border-neutral-300 text-neutral-900 focus:ring-black accent-black cursor-pointer" 
              />
              <label htmlFor="remember" className="text-xs font-semibold text-neutral-500 cursor-pointer select-none">Remember Me</label>
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full h-[54px] bg-neutral-950 text-white rounded-[14px] font-bold uppercase tracking-wider text-xs hover:opacity-90 active:scale-[0.98] transition-all duration-200 flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : (
              <span>SIGN IN</span>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="my-5 flex items-center gap-3">
          <div className="h-px bg-neutral-200 flex-1"></div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-300 select-none">or continue with</span>
          <div className="h-px bg-neutral-200 flex-1"></div>
        </div>

        {/* Social Authentication */}
        <div className="grid grid-cols-2 gap-3">
          <button 
            type="button"
            onClick={() => {
              setIsLoading(true);
              setError('');
              setTimeout(() => {
                setIsLoading(false);
                useLoginHistoryStore.getState().addLoginEvent({
                  name: 'Google User',
                  email: 'mdimtiazkhan.devolop@gmail.com',
                  method: 'Google Login',
                });
                login({
                  id: 'cust_google_demo',
                  name: 'Google User',
                  email: 'mdimtiazkhan.devolop@gmail.com',
                  role: 'customer'
                });
                navigate('/account/dashboard');
              }, 1000);
            }}
            className="h-11 border border-neutral-200 rounded-[14px] bg-white text-xs font-bold text-neutral-700 hover:bg-neutral-50 flex items-center justify-center gap-2 transition-all cursor-pointer select-none"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4 h-4" alt="Google" />
            <span>Google</span>
          </button>
          
          <button 
            type="button"
            onClick={() => {
              setIsLoading(true);
              setError('');
              setTimeout(() => {
                setIsLoading(false);
                useLoginHistoryStore.getState().addLoginEvent({
                  name: 'Facebook User',
                  email: 'mdimtiazkhan.devolop@gmail.com',
                  method: 'Facebook Login',
                });
                login({
                  id: 'cust_fb_demo',
                  name: 'Facebook User',
                  email: 'mdimtiazkhan.devolop@gmail.com',
                  role: 'customer'
                });
                navigate('/account/dashboard');
              }, 1000);
            }}
            className="h-11 border border-neutral-200 rounded-[14px] bg-white text-xs font-bold text-neutral-700 hover:bg-neutral-50 flex items-center justify-center gap-2 transition-all cursor-pointer select-none"
          >
            <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" className="w-4 h-4" alt="Facebook" />
            <span>Facebook</span>
          </button>
        </div>

        {/* Auth Switch Link */}
        <div className="mt-6 text-center pt-5 border-t border-neutral-100">
          <p className="text-xs text-neutral-500 leading-normal">
            Don't have an account?{' '}
            <Link to="/register" className="text-neutral-950 font-bold hover:underline ml-1">
              Create Account
            </Link>
          </p>
        </div>

        {/* Security Badge */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-neutral-400 text-[10px] font-semibold">
          <Lock className="w-3.5 h-3.5 text-emerald-500" />
          <span>Secure SSL Login</span>
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

