import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LogoutModal({ isOpen, onClose }: LogoutModalProps) {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/login');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-[100] overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="bg-white rounded-3xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4)] border border-gray-100 max-w-md w-full p-6 md:p-8 text-center relative overflow-hidden"
          >
            {/* Background design elements */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-50 rounded-full pointer-events-none z-0 opacity-60"></div>
            <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-red-50 rounded-full pointer-events-none z-0 opacity-60"></div>

            <div className="relative z-10">
              <div className="mx-auto w-20 h-20 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 mb-6 border border-orange-100 relative group">
                <div className="absolute inset-0 bg-orange-500 rounded-2xl opacity-10 animate-ping"></div>
                <LogOut className="w-8 h-8 transition-transform duration-300 group-hover:translate-x-1" />
              </div>

              <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                Are you leaving so soon?
              </h3>

              <p className="text-sm text-gray-500 leading-relaxed mt-3 px-2 font-medium">
                We will be eagerly waiting for your next visit! Serving you always brings us immense joy. Hope to see you back around soon.
              </p>

              <div className="w-16 h-1 bg-gradient-to-r from-orange-400 to-red-500 mx-auto my-6 rounded-full"></div>

              <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 mt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-5 py-3.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold text-sm tracking-wide border border-gray-200 transition-all duration-200 active:scale-95 focus:outline-none"
                >
                  No, Stay Logged In
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex-1 px-5 py-3.5 rounded-xl bg-slate-900 hover:bg-red-600 text-white font-bold text-sm tracking-wide shadow-md shadow-slate-900/10 hover:shadow-red-600/20 transition-all duration-200 active:scale-95 focus:outline-none flex items-center justify-center gap-2"
                >
                  <span>Yes, Logout</span>
                  <ChevronRight className="w-4 h-4 opacity-70" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
