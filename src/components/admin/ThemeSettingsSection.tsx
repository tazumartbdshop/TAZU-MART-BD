import React from 'react';
import { CheckCircle2, Moon, Sun, Sparkles } from 'lucide-react';
import { ThemeMode } from '../../services/themeSettingsService';

interface ThemeSettingsSectionProps {
  sectionTitle?: string;
  selectedTheme: ThemeMode;
  onSelectTheme: (theme: ThemeMode) => void;
  disabled?: boolean;
}

export function ThemeSettingsSection({
  sectionTitle = 'Section 6: Theme Settings',
  selectedTheme,
  onSelectTheme,
  disabled = false
}: ThemeSettingsSectionProps) {
  return (
    <div className="space-y-6 pt-4 border-t border-zinc-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-3">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-800">{sectionTitle}</h2>
          <p className="text-xs text-zinc-500 mt-0.5">Control the primary visual theme color of the Flutter Customer App</p>
        </div>

        {/* Currently Selected Theme Badge */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Selected Theme:</span>
          <div className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border shadow-2xs ${
            selectedTheme === 'black'
              ? 'bg-zinc-950 text-white border-zinc-800'
              : 'bg-white text-zinc-900 border-zinc-300'
          }`}>
            {selectedTheme === 'black' ? (
              <>
                <Moon className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>⚫ Black Theme</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>⚪ White Theme</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Theme Options Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Black Theme Option Card */}
        <div 
          onClick={() => !disabled && onSelectTheme('black')}
          className={`relative p-5 rounded-2xl border-2 transition-all flex flex-col justify-between overflow-hidden group ${
            disabled ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
          } ${
            selectedTheme === 'black'
              ? 'bg-zinc-950 text-white border-amber-500 ring-2 ring-amber-500/30 shadow-xl'
              : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700'
          }`}
        >
          {selectedTheme === 'black' && (
            <div className="absolute top-3 right-3 bg-amber-500 text-black p-1 rounded-full">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-zinc-800 text-amber-400 flex items-center justify-center font-bold text-lg shadow-inner">
                ⚫
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white tracking-tight">Black Theme</h3>
                <p className="text-xs text-zinc-400 font-medium">Dark sleek aesthetic for high contrast</p>
              </div>
            </div>

            {/* Mini UI Visual Mockup */}
            <div className="p-3 bg-black rounded-xl border border-zinc-800 space-y-2 text-[10px]">
              <div className="h-4 bg-zinc-900 rounded flex items-center justify-between px-2 text-zinc-400 font-mono">
                <span>Navbar (Dark)</span>
                <Sparkles className="w-2.5 h-2.5 text-amber-400" />
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <div className="h-10 bg-zinc-900 rounded-lg p-1.5 border border-zinc-800">
                  <div className="w-full h-1.5 bg-zinc-800 rounded mb-1"></div>
                  <div className="w-2/3 h-1 bg-amber-500 rounded"></div>
                </div>
                <div className="h-10 bg-zinc-900 rounded-lg p-1.5 border border-zinc-800">
                  <div className="w-full h-1.5 bg-zinc-800 rounded mb-1"></div>
                  <div className="w-2/3 h-1 bg-amber-500 rounded"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-zinc-400 uppercase">Select Black</span>
            <input 
              type="radio" 
              name="theme_mode" 
              checked={selectedTheme === 'black'} 
              onChange={() => !disabled && onSelectTheme('black')}
              disabled={disabled}
              className="w-4 h-4 accent-amber-500"
            />
          </div>
        </div>

        {/* White Theme Option Card */}
        <div 
          onClick={() => !disabled && onSelectTheme('white')}
          className={`relative p-5 rounded-2xl border-2 transition-all flex flex-col justify-between overflow-hidden group ${
            disabled ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
          } ${
            selectedTheme === 'white'
              ? 'bg-white text-zinc-900 border-black ring-2 ring-black/10 shadow-xl'
              : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:border-zinc-300'
          }`}
        >
          {selectedTheme === 'white' && (
            <div className="absolute top-3 right-3 bg-black text-white p-1 rounded-full">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-zinc-200 text-zinc-900 flex items-center justify-center font-bold text-lg shadow-inner">
                ⚪
              </div>
              <div>
                <h3 className="font-extrabold text-base text-zinc-900 tracking-tight">White Theme</h3>
                <p className="text-xs text-zinc-500 font-medium">Clean light aesthetic for clarity</p>
              </div>
            </div>

            {/* Mini UI Visual Mockup */}
            <div className="p-3 bg-white rounded-xl border border-zinc-200 space-y-2 text-[10px]">
              <div className="h-4 bg-zinc-100 rounded flex items-center justify-between px-2 text-zinc-600 font-mono">
                <span>Navbar (Light)</span>
                <Sun className="w-2.5 h-2.5 text-amber-500" />
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <div className="h-10 bg-zinc-50 rounded-lg p-1.5 border border-zinc-200">
                  <div className="w-full h-1.5 bg-zinc-300 rounded mb-1"></div>
                  <div className="w-2/3 h-1 bg-black rounded"></div>
                </div>
                <div className="h-10 bg-zinc-50 rounded-lg p-1.5 border border-zinc-200">
                  <div className="w-full h-1.5 bg-zinc-300 rounded mb-1"></div>
                  <div className="w-2/3 h-1 bg-black rounded"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-200 flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-zinc-600 uppercase">Select White</span>
            <input 
              type="radio" 
              name="theme_mode" 
              checked={selectedTheme === 'white'} 
              onChange={() => !disabled && onSelectTheme('white')}
              disabled={disabled}
              className="w-4 h-4 accent-black"
            />
          </div>
        </div>

      </div>
    </div>
  );
}

