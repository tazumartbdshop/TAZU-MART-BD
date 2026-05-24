import React from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { LogIn, UserPlus, ArrowRight, Star, ShieldCheck, ShoppingBag, ArrowLeft } from 'lucide-react';

export default function AuthGate() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#fcfcfc] flex flex-col items-center justify-center p-6 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[480px] bg-white p-8 md:p-12 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 text-center"
      >
        {/* Header */}
        <div className="mb-10">
          <Link to="/" className="inline-block mb-8">
            <h1 className="text-2xl font-black uppercase tracking-tighter text-black">TAZU MART BD</h1>
          </Link>
          <h2 className="text-3xl font-black text-black uppercase tracking-tight mb-2">Member Portal</h2>
          <p className="text-gray-400 font-bold text-[11px] uppercase tracking-widest max-w-[280px] mx-auto leading-relaxed">
            {isAuthenticated 
              ? `Authorized as ${user?.role}. Choose your next destination.`
              : 'Sign in to access your orders and premium member dashboard.'}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {isAuthenticated ? (
            <>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 mb-2">
                 <div className="flex items-center justify-center gap-3 mb-1">
                    <Star className="w-4 h-4 fill-black" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-black">Active Session</span>
                 </div>
                 <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{user?.email}</p>
              </div>

              <Link 
                to={user?.role === 'admin' ? '/admin' : '/account/dashboard'}
                className="group relative flex items-center justify-between p-6 bg-black text-white rounded-2xl shadow-xl shadow-black/10 hover:scale-[1.02] transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                    <Star className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-[11px] font-black uppercase tracking-widest mb-0.5">Go to Dashboard</div>
                    <div className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Access your {user?.role} panel</div>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <button 
                onClick={() => logout()}
                className="group flex items-center justify-between p-6 bg-white border border-gray-100 text-black rounded-2xl hover:border-red-100 hover:text-red-600 transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center group-hover:bg-red-50 transition-colors">
                    <LogIn className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-[11px] font-black uppercase tracking-widest mb-0.5">Sign Out</div>
                    <div className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">End your current session</div>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform opacity-0 group-hover:opacity-100" />
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/login"
                className="group relative flex items-center justify-between p-6 bg-black text-white rounded-2xl shadow-xl shadow-black/10 hover:scale-[1.02] transition-all active:scale-[0.98] overflow-hidden"
              >
                <div className="flex items-center gap-4 z-10">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                    <LogIn className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-[11px] font-black uppercase tracking-widest mb-0.5">SIGN IN</div>
                    <div className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Already have an account</div>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform z-10" />
              </Link>

              <Link 
                to="/register"
                className="group flex items-center justify-between p-6 bg-white border border-gray-100 text-black rounded-2xl hover:border-black transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-[11px] font-black uppercase tracking-widest mb-0.5">JOIN COMMUNITY</div>
                    <div className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Create a free account</div>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </>
          )}
        </div>

        <div className="mt-12 pt-8 border-t border-gray-50 flex justify-center gap-6">
           <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-black" />
              <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Secure</span>
           </div>
           <div className="flex items-center gap-2">
              <ShoppingBag className="w-3.5 h-3.5 text-black" />
              <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Premium</span>
           </div>
           <div className="flex items-center gap-2">
              <Star className="w-3.5 h-3.5 text-black" />
              <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Exclusive</span>
           </div>
        </div>
      </motion.div>
      
      <div className="mt-8">
        <Link to="/" className="text-[10px] font-black text-gray-300 uppercase tracking-widest hover:text-black transition-colors flex items-center gap-2">
           <ArrowLeft className="w-3.5 h-3.5" /> Back to Store
        </Link>
      </div>
    </div>
  );
}
