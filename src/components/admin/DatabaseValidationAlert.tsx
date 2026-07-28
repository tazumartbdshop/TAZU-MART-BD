import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, Copy, Check } from 'lucide-react';
import { ValidationResult } from '../../services/businessPagesService';

interface Props {
  validationResult: ValidationResult | null;
  successMessage: string | null;
}

export function DatabaseValidationAlert({ validationResult, successMessage }: Props) {
  const [copied, setCopied] = useState(false);

  if (successMessage) {
    return (
      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-3 font-medium text-sm my-4 animate-fadeIn">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
        <span>{successMessage}</span>
      </div>
    );
  }

  if (!validationResult || validationResult.isValid) return null;

  const handleCopySql = () => {
    if (validationResult.sqlSnippet) {
      navigator.clipboard.writeText(validationResult.sqlSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-amber-50/90 border-2 border-amber-300 text-amber-950 space-y-4 my-6 shadow-xs animate-fadeIn">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-amber-100 rounded-xl text-amber-700 flex-shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="space-y-2 flex-1">
          <h4 className="text-base font-bold text-amber-950 tracking-tight">Database Schema Validation Notice</h4>
          <div className="font-mono text-xs md:text-sm bg-white/80 p-3.5 rounded-xl border border-amber-200/80 whitespace-pre-wrap leading-relaxed text-amber-900 font-semibold">
            {validationResult.errorMessage}
          </div>
        </div>
      </div>

      {validationResult.sqlSnippet && (
        <div className="border-t border-amber-200/60 pt-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-amber-900 uppercase tracking-wider">
            <span>Required SQL Fix Query</span>
            <button
              onClick={handleCopySql}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-900 text-white hover:bg-black text-xs font-bold transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied SQL' : 'Copy SQL Script'}
            </button>
          </div>
          <pre className="p-3 bg-zinc-900 text-emerald-400 rounded-xl text-xs font-mono overflow-x-auto border border-zinc-800">
            {validationResult.sqlSnippet}
          </pre>
        </div>
      )}
    </div>
  );
}
