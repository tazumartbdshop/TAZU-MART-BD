import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, RotateCcw, ExternalLink, ShieldCheck, Loader2 } from 'lucide-react';

export default function WebViewViewer() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const url = searchParams.get('url');
  const title = searchParams.get('title') || 'External Page';
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!url) {
      navigate('/');
    }
  }, [url, navigate]);

  if (!url) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] md:h-screen bg-gray-50 overflow-hidden">
      {/* Top Bar */}
      <div className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4 shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex flex-col">
            <h1 className="text-[13px] font-black text-gray-900 uppercase tracking-tight leading-tight truncate max-w-[150px] sm:max-w-[300px]">
              {title}
            </h1>
            <div className="flex items-center gap-1.5 opacity-50">
               <ShieldCheck className="w-3 h-3 text-green-600" />
               <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest truncate max-w-[120px] sm:max-w-none">
                 {new URL(url).hostname}
               </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button 
            onClick={() => window.location.reload()}
            className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
            title="Reload"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
            title="Open in Browser"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* WebView Container */}
      <div className="flex-1 relative bg-white">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-0">
             <Loader2 className="w-8 h-8 animate-spin text-black mb-3" />
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Securing Connection...</p>
          </div>
        )}
        <iframe 
          src={url}
          className="w-full h-full border-none relative z-10"
          onLoad={() => setLoading(false)}
          title="Dynamic Viewer"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        />
      </div>

      {/* Mobile Safety Banner */}
      <div className="md:hidden bg-zinc-900 text-white py-2 px-4 flex items-center justify-center gap-2">
         <ShieldCheck className="w-3 h-3 text-green-400" />
         <p className="text-[9px] font-bold uppercase tracking-widest opacity-80 text-center">
           Browsing through Secure Portal
         </p>
      </div>
    </div>
  );
}
