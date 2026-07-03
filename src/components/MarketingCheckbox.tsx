import React from 'react';

interface MarketingCheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export default function MarketingCheckbox({
  label,
  checked,
  onChange
}: MarketingCheckboxProps) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div className="relative flex items-center justify-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer appearance-none w-4 h-4 border border-zinc-300 rounded-none checked:bg-zinc-900 checked:border-zinc-900 focus:ring-0 focus:ring-offset-0 transition-all cursor-pointer"
        />
        <svg
          className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-zinc-700 group-hover:text-black transition-colors">{label}</span>
        <span className={`text-[10px] uppercase font-bold tracking-widest ${checked ? 'text-emerald-500' : 'text-red-500'}`}>
          {checked ? '✓ Enabled' : 'Disabled'}
        </span>
      </div>
    </label>
  );
}
