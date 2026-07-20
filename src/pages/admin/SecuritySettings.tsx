import React, { useState } from 'react';
import { Shield, Lock, Eye, EyeOff, Save, CheckCircle, AlertCircle } from 'lucide-react';
import { useModeratorStore } from '../../store/useModeratorStore';
import { motion } from 'motion/react';

import SecureLockScreen from '../../components/admin/SecureLockScreen';

export default function SecuritySettings() {
  const { sectionPassword, setSectionPassword, isUnlocked, setUnlocked } = useModeratorStore();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleUnlock = (pwd: string) => {
    if (pwd === sectionPassword) {
      setUnlocked(true);
      return true;
    }
    return false;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSectionPassword(password);
    setSuccess(true);
    setPassword('');
    setConfirmPassword('');
    
    setTimeout(() => setSuccess(false), 3000);
  };

  if (!isUnlocked) {
    return (
      <SecureLockScreen 
        title="SECURE SETTINGS ACCESS"
        onUnlock={handleUnlock}
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 font-sans">
       <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900 leading-none">Security Settings</h2>
            <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-widest">Manage access protection & encryption</p>
          </div>
      </div>

        <div className="bg-white border border-[#EEEEEE] overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-purple-600" />
              <h3 className="text-sm font-black text-black uppercase tracking-widest">Global Security Configuration</h3>
            </div>
          </div>

          <div className="p-8">
            <div className="mb-8">
              <p className="text-xs font-bold text-gray-500 leading-relaxed uppercase tracking-wide bg-purple-50 p-4 border border-purple-100 mb-6">
                Change the global security password that protects both the Moderator Management and SIM Lock Security sections. 
                Only users with Super Admin authority should manage this setting.
              </p>

              <form onSubmit={handleSave} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Set Security Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter new 6+ digit password"
                        className="w-full pl-11 pr-11 py-4 bg-[#F9F9FB] border border-[#EEEEEE] focus:outline-none focus:border-purple-500 focus:bg-white transition-all font-bold text-sm"
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Confirm Security Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-type new password"
                        className="w-full pl-11 pr-4 py-4 bg-[#F9F9FB] border border-[#EEEEEE] focus:outline-none focus:border-purple-500 focus:bg-white transition-all font-bold text-sm"
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-red-500 text-[10px] font-black uppercase tracking-widest italic">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {error}
                  </div>
                )}

                {success && (
                  <div className="flex items-center gap-2 text-green-500 text-[10px] font-black uppercase tracking-widest italic bg-green-50 p-3 border border-green-100">
                    <CheckCircle className="w-4 h-4" />
                    Security Password Updated Successfully.
                  </div>
                )}

                <button 
                  type="submit"
                  className="w-full py-4.5 bg-black text-white font-black uppercase tracking-[0.2em] text-xs hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-3"
                >
                  <Save className="w-4 h-4" />
                  Save Security Password
                </button>
              </form>
            </div>

            <div className="pt-8 border-t border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-4 h-4 text-purple-600" />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-900">Current Security Status</span>
              </div>
              <div className="flex items-center gap-4">
                 <div className="flex-1 p-4 bg-gray-50 border border-gray-100">
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Protection State</p>
                    <p className="text-xs font-bold text-green-600 flex items-center gap-2">
                       <CheckCircle className="w-3 h-3" />
                       Active Encryption
                    </p>
                 </div>
                 <div className="flex-1 p-4 bg-gray-50 border border-gray-100">
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Restricted Access</p>
                    <p className="text-xs font-bold text-gray-700">Moderator Panel Protected</p>
                 </div>
              </div>
            </div>
          </div>
       </div>
    </div>
  );
}
