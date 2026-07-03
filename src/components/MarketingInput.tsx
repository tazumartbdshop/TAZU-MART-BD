import React from 'react';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface MarketingInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  helperText?: string;
  error?: string;
  isValid?: boolean;
  isValidating?: boolean;
}

export default function MarketingInput({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
  helperText,
  error,
  isValid,
  isValidating
}: MarketingInputProps) {
  const getBorderColor = () => {
    if (error) return 'border-red-500';
    if (isValid) return 'border-emerald-500';
    if (value && !isValidating) return 'border-zinc-300';
    return 'border-zinc-200';
  };

  return (
    <div className="space-y-1.5 w-full">
      <label className="block text-xs font-medium text-zinc-700 uppercase tracking-wider">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full h-10 px-3 pr-10 border rounded-none text-sm focus:outline-none transition-colors bg-white ${getBorderColor()}`}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {isValidating && <Loader2 className="w-4 h-4 animate-spin text-amber-500" />}
          {!isValidating && isValid && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
          {!isValidating && error && <AlertCircle className="w-4 h-4 text-red-500" />}
        </div>
      </div>
      <div className="flex justify-between items-start">
        {helperText && <p className="text-[10px] text-zinc-500 leading-tight">{helperText}</p>}
        {error && <p className="text-[10px] text-red-500 leading-tight ml-auto">{error}</p>}
        {isValidating && <p className="text-[10px] text-amber-600 leading-tight ml-auto">Checking...</p>}
        {!isValidating && isValid && <p className="text-[10px] text-emerald-600 leading-tight ml-auto">Valid</p>}
      </div>
    </div>
  );
}
