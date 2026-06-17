import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useCategoryStore, resolveCategoryThumbnail } from '../store/useCategoryStore';
import { Image as ImageIcon } from 'lucide-react';

export default function Categories() {
  const { categories, isLoaded } = useCategoryStore();

  console.log("[Categories Page Debug] Total categories in store:", categories.length, "Items:", categories);
  const activeCategories = [...categories]
    .filter(c => c && c.status === 'Active')
    .sort((a, b) => {
      const orderA = a.displayOrder !== undefined && a.displayOrder !== null && Number(a.displayOrder) !== 0 ? Number(a.displayOrder) : Infinity;
      const orderB = b.displayOrder !== undefined && b.displayOrder !== null && Number(b.displayOrder) !== 0 ? Number(b.displayOrder) : Infinity;
      return orderA - orderB;
    });
  console.log("[Categories Page Debug] Rendered on categories page after sorting:", activeCategories.length, "Items:", activeCategories);

  return (
    <div className="bg-white min-h-screen pb-32">
      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        {/* Title Indicator matching premium layouts */}
        <div className="text-center mb-8">
          <p className="text-[10px] font-black uppercase text-neutral-400 tracking-[0.2em] mb-1">Collections</p>
          <h1 className="text-2xl font-black uppercase tracking-wider text-neutral-900 font-sans">All Categories</h1>
          <div className="h-[2px] w-8 bg-neutral-900 mx-auto mt-3"></div>
        </div>

        {/* Loading State Floor */}
        {!isLoaded && (
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 animate-pulse pt-4">
             {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="flex flex-col items-center">
                   <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center">
                     <ImageIcon className="w-6 h-6 text-neutral-300" />
                   </div>
                   <div className="h-2.5 w-14 bg-neutral-200 mt-2.5 rounded"></div>
                </div>
             ))}
          </div>
        )}

        {/* Circular Layout matches the Homepage style, 100% database-driven */}
        {isLoaded && (
          activeCategories.length > 0 ? (
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 py-4">
              {activeCategories.map((cat, idx) => {
                const catImage = resolveCategoryThumbnail(cat);
                
                return (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Link
                      to={`/category/${cat.id}`}
                      className="flex flex-col items-center group select-none text-center"
                    >
                      <div className="relative w-[20vw] h-[20vw] max-w-[100px] max-h-[100px] min-w-[72px] min-h-[72px] rounded-full overflow-hidden border border-neutral-100 bg-neutral-50 shadow-sm flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:border-black/25 group-hover:shadow-md">
                        {catImage ? (
                          <img
                            src={catImage}
                            alt={cat.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-1 opacity-20">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] sm:text-xs font-black uppercase text-neutral-800 tracking-wider mt-2.5 transition-colors group-hover:text-black leading-tight max-w-[110px] truncate">
                        {cat.name}
                      </span>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-[11px] font-black uppercase tracking-widest text-neutral-400">No active categories found in database</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
