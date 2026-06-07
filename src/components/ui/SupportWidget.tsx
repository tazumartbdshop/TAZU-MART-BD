import React, { useState } from 'react';
import { MessageSquare, X, Headset } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SupportCenter } from './SupportCenter';

export function SupportWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-20 md:bottom-6 right-6 z-50" id="tazu-global-support-widget">
      
      {/* Floating Button Icon Trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className="group relative w-12 h-12 md:w-14 md:h-14 bg-slate-950 text-amber-400 hover:text-white rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 cursor-pointer border border-slate-800"
        title="24/7 Support Desk"
      >
        {/* Pulsing visual glow ring */}
        <span className="absolute -inset-1.5 rounded-full bg-amber-400/20 group-hover:bg-amber-400/40 animate-ping duration-1000 -z-10" />
        <MessageSquare className="w-5 h-5 md:w-6 md:h-6 shrink-0 transition-transform group-hover:rotate-12" />
        
        {/* Help Badge Attention Tag */}
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 text-[8px] font-black uppercase text-white items-center justify-center">
            LIVE
          </span>
        </span>
      </button>

      {/* Floating Modal System */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Dark glass backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 flex items-center justify-center p-4 md:p-6"
            />

            {/* Modal Body Card Wrapper */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-full max-w-4xl h-[90vh] max-h-[750px] bg-white rounded-3xl overflow-hidden z-50 flex flex-col shadow-2xl border border-slate-250 animate-fade-in"
              id="global-support-modal-body"
            >
              {/* Escape close key helper */}
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-white hover:text-amber-400 z-50 p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors cursor-pointer"
                title="Close Support Portal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex-1 overflow-y-auto no-scrollbar">
                <SupportCenter isModal={true} onClose={() => setIsOpen(false)} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
export default SupportWidget;
