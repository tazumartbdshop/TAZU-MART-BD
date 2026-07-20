import React, { useState } from 'react';
import { 
  Shield, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle 
} from 'lucide-react';
import { motion } from 'motion/react';

interface SecureLockScreenProps {
  title: string;
  subtitle?: string;
  onUnlock: (password: string) => boolean;
  logoText?: string;
  logoSubText?: string;
  errorMessage?: string;
  buttonText?: string;
}

export default function SecureLockScreen({ 
  title, 
  subtitle = "Restricted Area • Authorized Admin Only", 
  onUnlock,
  logoText = "Aistudio Security",
  logoSubText = "Restricted Admin Access",
  errorMessage = "Invalid Security Password",
  buttonText = "UNLOCK & CONTINUE"
}: SecureLockScreenProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUnlock(password)) {
      setError(false);
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 sm:p-8 font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white border border-[#EEEEEE] shadow-[0_20px_60px_rgba(0,0,0,0.05)] p-10 sm:p-12 text-center"
      >
        <div className="mb-10">
           <div className="flex justify-center items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-black flex items-center justify-center text-white">
                 <Shield className="w-6 h-6" />
              </div>
              <div className="text-left">
                 <h1 className="text-lg font-black uppercase tracking-widest leading-none">Aistudio Security</h1>
                 <p className="text-[9px] font-black uppercase tracking-[0.2em] text-purple-600">{logoSubText}</p>
              </div>
           </div>
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">Protected Area Control</p>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900 mb-2">{title}</h2>
          <p className="text-xs font-bold text-gray-400 leading-relaxed max-w-[280px] mx-auto uppercase tracking-wide">
            {subtitle}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2 text-left">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Administrator Access Key</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Security Password"
                className={`w-full pl-11 pr-11 py-4 bg-[#F9F9FB] border focus:outline-none transition-all font-bold text-sm ${
                  error ? 'border-red-500 bg-red-50/30' : 'border-[#EEEEEE] focus:border-purple-500 focus:bg-white'
                }`}
                autoFocus
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && (
              <div className="flex items-center justify-center gap-2 mt-3 text-red-500">
                <AlertCircle className="w-4 h-4" />
                <p className="text-[9px] font-black uppercase tracking-widest italic">{errorMessage}</p>
              </div>
            )}
          </div>

          <button 
            type="submit"
            className="w-full py-4.5 bg-gradient-to-r from-purple-700 via-purple-600 to-black text-white font-black uppercase tracking-[0.2em] text-xs hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-purple-200"
          >
            {buttonText}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-gray-100 text-left">
          <div className="flex items-center gap-3 mb-2">
             <Shield className="w-4 h-4 text-purple-600" />
             <span className="text-[10px] font-black uppercase tracking-widest text-gray-900">Encryption Status</span>
          </div>
          <p className="text-[10px] font-bold text-gray-400 leading-relaxed uppercase tracking-tight">
            Unauthorized access is strictly prohibited under administrative protocol.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
