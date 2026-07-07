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
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 p-1 hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
        
        <div className="flex items-center gap-3 mb-4 text-red-600">
          <AlertTriangle className="w-8 h-8" />
          <h2 className="text-xl font-black uppercase tracking-wider">Delete Order</h2>
        </div>
        
        <div className="space-y-4 mb-6">
          <p className="text-gray-700 font-medium">Are you sure you want to permanently delete this order?</p>
          <p className="text-gray-500 text-sm font-semibold">This action cannot be undone.</p>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={onClose}
            className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-black font-black uppercase tracking-widest text-sm transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest text-sm transition-all"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
};
