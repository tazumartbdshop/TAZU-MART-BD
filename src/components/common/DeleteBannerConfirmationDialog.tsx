import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2 } from 'lucide-react';

interface DeleteBannerConfirmationDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

export default function DeleteBannerConfirmationDialog({
  isOpen,
  onConfirm,
  onCancel,
  isDeleting = false
}: DeleteBannerConfirmationDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop with soft fade-in */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />
          
          {/* Square Style Dialog Box with Border Radius 12px, Width 420px */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", duration: 0.25 }}
            className="relative w-full max-w-[420px] bg-white rounded-[12px] p-6 shadow-2xl z-10 border border-zinc-200 overflow-hidden"
          >
            <div className="flex flex-col items-center text-center space-y-5 font-sans">
              {/* Warning/Delete Icon */}
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center border border-red-100 shadow-sm animate-pulse">
                <Trash2 className="w-7 h-7 text-red-500" />
              </div>
              
              {/* Typography Section */}
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-black tracking-tight">
                  Delete Banner?
                </h3>
                <p className="text-sm text-zinc-500 leading-relaxed font-semibold">
                  আপনি কি নিশ্চিত যে এই ব্যানারটি স্থায়ীভাবে ডাটাবেজ থেকে মুছে ফেলতে চান? এই কাজটি একবার করলে তা আর ফিরিয়ে আনা যাবে না।
                </p>
              </div>
              
              {/* Buttons: Left (Cancel, White/Gray) and Right (Delete, Red #DC2626) */}
              <div className="flex flex-col sm:flex-row gap-3 w-full pt-3">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={onCancel}
                  className="flex-1 px-4 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 hover:text-black font-extrabold text-xs uppercase tracking-wider rounded-[12px] cursor-pointer transition-colors border border-neutral-200 select-none disabled:opacity-50"
                >
                  ❌ ভুলবশত চাপ লেগেছে
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={onConfirm}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-[12px] cursor-pointer transition-all shadow-md select-none disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isDeleting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>🗑️ হ্যাঁ, ডাটাবেজ থেকে রিমুভ করুন</span>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
