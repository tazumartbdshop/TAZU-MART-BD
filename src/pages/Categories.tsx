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
      <div className="p-4">
        {/* Loading State Floor */}
        {!isLoaded && (
          <div className="grid grid-cols-2 gap-4 animate-pulse pt-4">
             {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="aspect-square bg-neutral-100 rounded-2xl flex flex-col items-center justify-center">
                   <ImageIcon className="w-8 h-8 text-neutral-300 mb-2" />
                   <div className="h-3 w-1/2 bg-neutral-200 rounded"></div>
                </div>
             ))}
          </div>
        )}

        {/* Strictly 2 category per row as per instruction */}
        {isLoaded && (
          <div className="grid grid-cols-2 gap-4">
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
                  className="block group"
                >
                  <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden rounded-2xl border border-gray-100 group-hover:border-black/20 transition-all">
                    {catImage ? (
                      <img
                        src={catImage}
                        alt={cat.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 opacity-20">
                        <ImageIcon className="w-12 h-12" />
                      </div>
                    )}
                  </div>
                  <div className="mt-3 text-center">
                    <h3 className="text-[14px] font-black text-gray-900 group-hover:text-neutral-700 transition-colors uppercase tracking-wider truncate px-2">
                       {cat.name}
                    </h3>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
        )}
      </div>
    </div>
  );
}
