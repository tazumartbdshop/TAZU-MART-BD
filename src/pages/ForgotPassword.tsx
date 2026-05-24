import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, ArrowLeft, CheckCircle2, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError('');

    // Simulate link sending
    setTimeout(() => {
      setIsLoading(false);
      if (email.includes('@')) {
        setIsSent(true);
      } else {
        setError('Please enter a valid email address.');
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-neutral-50/50 flex flex-col justify-center items-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[440px] relative z-10"
      >
        <div className="bg-white border border-neutral-150 rounded-[24px] p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] text-center">
           <AnimatePresence mode="wait">
             {!isSent ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                >
                  {/* Shop Logo Header */}
                  <div className="text-center mb-6">
                    <Link to="/" className="inline-flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 bg-neutral-950 rounded-lg flex items-center justify-center text-white font-extrabold text-sm select-none">
                        T
                      </div>
                      <span className="text-base font-black tracking-tight text-neutral-950 uppercase">Tazu Mart</span>
                    </Link>
                    <h2 className="text-lg font-bold text-neutral-900 leading-tight">Reset Password</h2>
                    <p className="text-xs text-neutral-500 mt-1">
                      Enter your address below to authorize password recovery securely.
                    </p>
                  </div>

                  {error && (
                    <div className="mb-5 p-3.5 rounded-xl bg-red-50 text-red-700 text-xs font-medium border border-red-100 flex items-start gap-2.5 text-left">
                       <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5 text-red-500" />
                       <div>{error}</div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                     <div className="text-left space-y-1.5">
                        <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider ml-1">Email Address</label>
                        <div className="relative">
                           <input 
                              type="email" 
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required 
                              className="w-full h-[52px] bg-white border border-[#E5E5E5] text-neutral-900 pl-11 pr-4 rounded-[14px] focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all text-sm font-semibold placeholder:text-neutral-300" 
                              placeholder="name@example.com"
                           />
                           <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                             <Mail className="w-4.5 h-4.5 text-neutral-400" />
                           </span>
                        </div>
                     </div>

                     <div className="space-y-3 pt-2">
                        <button 
                           type="submit"
                           disabled={isLoading || !email}
                           className="w-full h-[54px] bg-neutral-950 text-white rounded-[14px] font-bold uppercase tracking-wider text-xs hover:opacity-90 active:scale-[0.98] transition-all duration-200 flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm"
                        >
                           {isLoading ? (
                              <Loader2 className="w-5 h-5 animate-spin text-white" />
                           ) : (
                              <span>SEND RECOVERY LINK</span>
                           )}
                        </button>

                        <div className="mt-4 text-center pt-4 border-t border-neutral-100">
                          <p className="text-xs text-neutral-500 leading-normal">
                            Remember your details?{' '}
                            <Link to="/login" className="text-neutral-950 font-bold hover:underline ml-1">
                              Sign In
                            </Link>
                          </p>
                        </div>
                     </div>
                  </form>

                  <div className="mt-4 flex items-center justify-center gap-1.5 text-neutral-400 text-[10px] font-semibold">
                     <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                     <span>Secure Password Protection</span>
                  </div>
                </motion.div>
             ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-4 space-y-5"
                >
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100 shadow-sm animate-pulse">
                     <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div className="space-y-1.5">
                    <h2 className="text-lg font-bold text-neutral-900 uppercase tracking-wide">Verification Sent</h2>
                    <p className="text-xs text-neutral-400 font-semibold uppercase tracking-wider leading-none">Check Your Inbox</p>
                  </div>

                  <p className="text-xs text-neutral-500 font-medium leading-relaxed bg-neutral-50 p-4 rounded-xl border border-neutral-150 text-left">
                     We've dispatched a unique reset link to <span className="font-bold text-neutral-900 truncate block mt-0.5">{email}</span>. Click the link in the email to set your new password.
                  </p>

                  <div className="space-y-2.5 pt-2">
                     <Link 
                       to="/login" 
                       className="w-full h-12 bg-neutral-950 text-white rounded-[14px] text-xs font-bold uppercase tracking-wider hover:bg-neutral-900 transition-all flex justify-center items-center gap-2 active:scale-[0.98] cursor-pointer animate-none"
                     >
                       Return to Login
                     </Link>
                     <button 
                       onClick={() => setIsSent(false)}
                       className="block w-full text-neutral-400 hover:text-neutral-700 text-[10px] font-bold uppercase tracking-wider transition-colors py-1 cursor-pointer select-none"
                     >
                       Didn't get an email? Try again
                     </button>
                  </div>
                </motion.div>
             )}
           </AnimatePresence>
        </div>
      </motion.div>

      {/* Footer System Pages */}
      <div className="mt-6 flex justify-center gap-5 text-[10px] text-neutral-400 font-semibold relative z-10">
        <button type="button" className="hover:text-neutral-700 transition-colors cursor-pointer select-none">Privacy Policy</button>
        <span className="text-neutral-200 select-none">•</span>
        <button type="button" className="hover:text-neutral-700 transition-colors cursor-pointer select-none">Terms & Conditions</button>
      </div>
    </div>
  );
}
