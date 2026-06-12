import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, Image as ImageIcon, Layers, Plus, Crop, Upload } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useBannerStore, Banner } from '../../store/useBannerStore';
import { db } from '../../lib/firebase';
import { doc, deleteDoc } from 'firebase/firestore';

enum OperationType {
  DELETE = 'delete',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
    },
    operationType,
    path
  };
  const errorMsg = JSON.stringify(errInfo);
  if (errInfo.error.includes('Quota limit exceeded')) {
    console.warn("Firestore Quota Exceeded.");
  } else {
    console.error('Firestore Error: ', errorMsg);
  }
}

export default function BannerListing() {
  const { banners, sliderConfig } = useBannerStore();
  const navigate = useNavigate();

  const handleEditClick = (banner: Banner, action?: string) => {
    let url = `/admin/banner/create?editId=${banner.id}`;
    if (action) {
      url += `&action=${action}`;
    }
    navigate(url);
  };

  const handleDeleteBanner = async (bannerId: string) => {
    if (confirm('Are you sure you want to delete this banner?')) {
      try {
        useBannerStore.getState().removeBanner(bannerId);
        useBannerStore.getState().removeDraftBanner(bannerId);
        toast.success("✅ Banner deleted successfully!");
      } catch (err) {
        console.error(err);
        toast.error("❌ Failed to delete banner");
      }
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (!isNaN(dragIndex) && dragIndex !== dropIndex) {
      useBannerStore.getState().reorderBanners(dragIndex, dropIndex);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  return (
    <div id="admin-banner-listing" className="p-6 max-w-5xl mx-auto space-y-8 font-sans pb-24">
      {/* Hero Header Card */}
      <header className="bg-neutral-900 border border-neutral-800 text-white rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-12 translate-y-12">
          <Layers className="w-64 h-64" />
        </div>
        <div className="space-y-3 relative z-10">
          <div className="flex items-start md:items-center justify-between gap-4 flex-col md:flex-row">
            <div className="space-y-1.5 animate-fade-in">
              <div className="flex items-center gap-2">
                <span className="p-1 px-2.5 bg-neutral-800 rounded-full text-[10px] uppercase font-mono tracking-widest text-zinc-300">SYSTEM CORE</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[10px] uppercase text-emerald-400 font-mono">REAL-TIME DB LINK ACTIVE</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black uppercase tracking-wider font-mono">Banner List</h1>
            </div>
            {/* Nav to Add Banner */}
            <button 
              onClick={() => navigate('/admin/banner/create')}
              className="p-3 bg-white text-black hover:bg-zinc-100 font-mono text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2 self-start md:self-center select-none cursor-pointer"
              id="goto-create-banner-btn"
            >
              <Plus className="w-4 h-4" /> Add Banner
            </button>
          </div>
          <p className="text-zinc-400 text-xs max-w-2xl uppercase font-mono tracking-wide">
            Detailed slider banner catalogue directory. Modify specific layout settings or wipe slides with instant refresh-free updates.
          </p>
        </div>
      </header>

      {/* Main Sequence Panel */}
      <section className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm space-y-6">
        <div className="border-b border-zinc-100 pb-3 flex justify-between items-center flex-wrap gap-2">
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-neutral-900">
              🗂️ Mounted Banners ({banners.length})
            </h2>
            <p className="text-[10px] text-zinc-400 uppercase font-black tracking-widest mt-0.5">Drag to sequence</p>
          </div>
          
          {/* Slider Auto Slide settings widget */}
          <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-xl font-mono text-[8.5px]">
            <span className={`w-1.5 h-1.5 rounded-full ${sliderConfig.autoSlide ? 'bg-emerald-500' : 'bg-rose-400'}`} />
            <span className="font-extrabold uppercase text-zinc-650 tracking-wider">
              Auto slide: {sliderConfig.autoSlide ? 'Active' : 'Halted'} ({sliderConfig.duration}s)
            </span>
          </div>
        </div>

        {banners.length > 0 ? (
          <div>
            <div className="flex items-center justify-between text-[10px] font-mono font-black text-zinc-400 uppercase tracking-widest mb-3 px-2">
              <span>← First Slide</span>
              <span>Horizontal Scroll Area</span>
            </div>
            
            <div 
              className="flex overflow-x-auto gap-3 pb-4 snap-x pt-2"
              style={{ scrollBehavior: 'smooth' }}
            >
              {banners.map((banner, index) => (
                <BannerThumbnailItem 
                  key={banner.id}
                  banner={banner}
                  index={index}
                  onDelete={() => handleDeleteBanner(banner.id)}
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragOver={handleDragOver}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="border border-dashed border-zinc-200 rounded-xl p-16 text-center text-zinc-400 space-y-4 bg-zinc-50/50">
            <ImageIcon className="w-10 h-10 text-neutral-300 mx-auto" />
            <h4 className="text-xs font-black uppercase tracking-wider text-neutral-900">No Mounted Banners Found</h4>
            <p className="text-[10px] uppercase text-zinc-400 font-extrabold max-w-sm mx-auto leading-relaxed">
              No slideshow banners currently exist in the database directory. Click the Add Banner trigger above to configure your first homepage slide!
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

interface BannerThumbnailItemProps {
  banner: Banner;
  index: number;
  onDelete: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
}

const BannerThumbnailItem: React.FC<BannerThumbnailItemProps> = ({ 
  banner, 
  index, 
  onDelete, 
  onDragStart, 
  onDrop, 
  onDragOver 
}) => {
  // Pad the index with 0 for single digits
  const formatIndex = (idx: number) => (idx + 1).toString().padStart(2, '0');

  return (
    <div 
      className="shrink-0 w-32 snap-center relative group select-none cursor-grab active:cursor-grabbing"
      draggable
      onDragStart={onDragStart}
      onDrop={onDrop}
      onDragOver={onDragOver}
    >
      <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden flex flex-col h-full shadow-sm">
        
        {/* Top absolute actions */}
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-sm hover:bg-rose-600 scale-90 z-20"
          title="Remove Banner"
        >
          ✕
        </button>

        {/* Thumbnail Image */}
        <div 
          className="aspect-[21/9] w-full bg-neutral-950 overflow-hidden relative border-b border-zinc-150 flex items-center justify-center cursor-pointer pointer-events-none"
        >
          {banner.image ? (
            <img 
              src={banner.image} 
              alt={banner.name || 'Banner'} 
              className="w-full h-full object-cover" 
            />
          ) : (
            <div className="text-[10px] text-zinc-500 font-black uppercase">No Image</div>
          )}
        </div>

        {/* Meta */}
        <div className="p-1.5 bg-zinc-50 border-t border-zinc-100 flex justify-center items-center">
          <span className="text-[9px] font-black text-neutral-900 uppercase tracking-widest bg-zinc-200 px-2 py-0.5 rounded-full">
            {formatIndex(index)}
          </span>
        </div>
      </div>
    </div>
  );
}
