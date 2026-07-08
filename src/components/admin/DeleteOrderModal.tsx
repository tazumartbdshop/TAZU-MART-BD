import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteOrderModal: React.FC<DeleteOrderModalProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/85 flex items-center justify-center p-4 select-none">
      <div className="bg-white border-2 border-black w-full max-w-md p-6 relative rounded-none shadow-[8px_8px_0px_rgba(0,0,0,1)]">
        <button 
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 border border-transparent hover:border-black hover:bg-zinc-100 transition-all rounded-none"
        >
          <X className="w-4 h-4 text-black" />
        </button>
        
        <div className="flex items-center gap-3 mb-5 text-red-600 border-b-2 border-black pb-3">
          <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
          <h2 className="text-sm font-black uppercase tracking-widest text-black">Delete Order</h2>
        </div>
        
        <div className="space-y-2 mb-6">
          <p className="text-black font-black text-xs uppercase tracking-wider">Are you sure you want to permanently delete this order?</p>
          <p className="text-zinc-500 font-bold text-[11px] uppercase tracking-wider">This action cannot be undone.</p>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <button 
            type="button"
            onClick={onClose}
            className="w-full py-3.5 bg-zinc-100 hover:bg-zinc-200 text-black font-black uppercase tracking-widest text-[10px] border border-zinc-300 rounded-none transition-colors"
          >
            CANCEL
          </button>
          <button 
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest text-[10px] border border-red-700 rounded-none transition-colors"
          >
            YES, DELETE
          </button>
        </div>
      </div>
    </div>
  );
};
