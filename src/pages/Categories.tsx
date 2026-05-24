import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useCategoryStore } from '../store/useCategoryStore';
import { Image as ImageIcon } from 'lucide-react';

export default function Categories() {
  const { categories } = useCategoryStore();

  const activeCategories = [...categories]
    .filter(c => c.status === 'Active')
    .sort((a, b) => {
      const orderA = a.displayOrder !== undefined && a.displayOrder !== null && a.displayOrder !== 0 ? Number(a.displayOrder) : Infinity;
      const orderB = b.displayOrder !== undefined && b.displayOrder !== null && b.displayOrder !== 0 ? Number(b.displayOrder) : Infinity;
      return orderA - orderB;
    });

  return (
    <div className="bg-white min-h-screen pb-32">
      <div className="p-4">
        {/* Strictly 2 category per row as per instruction */}
        <div className="grid grid-cols-2 gap-4">
          {activeCategories.map((cat, idx) => {
            const catImage = cat.iconImage || cat.bannerImage;
            
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
                  <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden rounded-2xl border border-gray-100 group-hover:border-blue-500 transition-all">
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
                    <h3 className="text-[15px] font-bold text-gray-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight truncate px-2">
                       {cat.name}
                    </h3>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
