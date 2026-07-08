import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle } from 'lucide-react';

interface UnsavedChangesDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  cancelText?: string;
  confirmText?: string;
}

export default function UnsavedChangesDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  cancelText = 'Cancel',
  confirmText = 'Yes, Leave'
}: UnsavedChangesDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop with soft fade-in - backdrop click disabled as per spec */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
          />
          
          {/* Square Style Dialog Box with Border Radius 12px, Width 420px */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", duration: 0.25 }}
            className="relative w-full max-w-[420px] bg-white rounded-[12px] p-6 shadow-2xl z-10 border border-zinc-200 overflow-hidden"
          >
            <div className="flex flex-col items-center text-center space-y-5">
              {/* Alert Icon (Amber Warning Icon) */}
              <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center border border-amber-100">
                <AlertTriangle className="w-6 h-6 text-amber-500" />
              </div>
              
              {/* Typography Section */}
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-black font-sans">
                  {title}
                </h3>
                <p className="text-sm text-zinc-500 leading-relaxed font-medium">
                  {message}
                </p>
              </div>
              
              {/* Buttons: Left (Cancel, White/Gray/Black text) and Right (Yes Leave, Red #EF4444) */}
              <div className="flex gap-3 w-full pt-3">
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 px-4 py-3 bg-white border border-gray-300 text-black hover:bg-gray-50 font-bold text-sm rounded-[12px] cursor-pointer transition-colors"
                >
                  {cancelText}
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  style={{ backgroundColor: '#EF4444' }}
                  className="flex-1 px-4 py-3 text-white hover:opacity-90 font-bold text-sm rounded-[12px] cursor-pointer transition-all shadow-md"
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
