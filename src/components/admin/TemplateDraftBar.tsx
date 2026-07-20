import React, { useState } from 'react';
import { Eye, Save, Send, RotateCcw, CheckCircle2, Loader2, X, Monitor, Tablet, Smartphone } from 'lucide-react';
import { useThemeStore } from '../../store/useThemeStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useBannerStore } from '../../store/useBannerStore';
import { useSupportBannerStore } from '../../store/useSupportBannerStore';
import { motion, AnimatePresence } from 'motion/react';

export default function TemplateDraftBar() {
  const { publishTheme, resetDraftTheme } = useThemeStore();
  const { publishSettings, resetDraftSettings } = useSettingsStore();
  const { publishBanners, resetDraftBanners } = useBannerStore();
  const { publishBanner: publishSupportBanner, resetDraftBanner: resetDraftSupportBanner } = useSupportBannerStore();
  
  const [isPublishing, setIsPublishing] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showStatus, setShowStatus] = useState<string | null>(null);

  const handlePublish = async () => {
    if (!confirm('Are you sure you want to publish these changes to the LIVE website?')) return;
    
    setIsPublishing(true);
    try {
      await publishTheme();
      await publishSettings();
      await publishBanners();
      await publishSupportBanner();
      
      setIsPublishing(false);
      setShowStatus('Website Published Successfully! 🚀');
      setTimeout(() => setShowStatus(null), 3000);
    } catch (error) {
      console.error('Publishing failed:', error);
      setIsPublishing(false);
      alert('Publishing failed. Please try again.');
    }
  };

  const handleReset = () => {
    if (!confirm('Are you sure you want to discard all unpublished changes and reset to the live version?')) return;
    
    setIsResetting(true);
    setTimeout(() => {
      resetDraftTheme();
      resetDraftSettings();
      resetDraftBanners();
      resetDraftSupportBanner();
      setIsResetting(false);
      setShowStatus('Draft Reset to Live Version');
      setTimeout(() => setShowStatus(null), 3000);
    }, 1000);
  };

  const handleSaveDraft = () => {
    setShowStatus('Draft Changes Saved! (Auto-saved to storage)');
    setTimeout(() => setShowStatus(null), 3000);
  };

  return (
    <>
      {/* Toast Notification */}
      <AnimatePresence>
        {showStatus && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] bg-zinc-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-zinc-800"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-bold uppercase tracking-widest">{showStatus}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Professional Bottom Fixed Toolbar */}
      <div className="fixed bottom-0 left-0 w-full z-[90] flex items-center justify-between bg-white border-t border-gray-200 h-16 md:h-20 px-4 md:px-8">
        <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
           <div className="flex items-center gap-2 pr-4 border-r border-gray-100 shrink-0">
             <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
             <span className="text-[9px] md:text-[11px] font-black uppercase tracking-widest text-neutral-900 whitespace-nowrap">Staging</span>
           </div>
           <p className="hidden lg:block text-[9px] text-gray-400 font-bold uppercase tracking-widest truncate">Unpublished changes are visible only in this session</p>
        </div>

        <div className="flex items-center h-full">
          <button 
            onClick={handleSaveDraft}
            className="flex items-center gap-2 px-3 md:px-8 h-full hover:bg-gray-50 transition-colors text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-600 border-x border-gray-100"
          >
            <Save className="w-3.5 md:w-4 h-3.5 md:h-4" /> <span className="hidden sm:inline">Save Draft</span>
          </button>

          <button 
            onClick={handleReset}
            disabled={isResetting}
            className="flex items-center gap-2 px-3 md:px-8 h-full hover:bg-red-50 transition-colors text-[9px] md:text-[10px] font-black uppercase tracking-widest text-red-500 border-r border-gray-100"
          >
            {isResetting ? <Loader2 className="w-3.5 md:w-4 h-3.5 md:h-4 animate-spin" /> : <RotateCcw className="w-3.5 md:w-4 h-3.5 md:h-4" />} <span className="hidden sm:inline">Discard</span>
          </button>

          <button 
            onClick={handlePublish}
            disabled={isPublishing}
            className="flex items-center gap-2 md:gap-3 px-4 md:px-12 h-full bg-neutral-950 text-white hover:bg-neutral-800 transition-all text-[9px] md:text-[11px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] shadow-lg disabled:opacity-50"
          >
            {isPublishing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-3.5 md:w-4 h-3.5 md:h-4" />
            )}
            Publish <span className="hidden md:inline">to Live Website</span>
          </button>
        </div>
      </div>
    </>
  );
}
