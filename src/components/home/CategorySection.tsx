import React from 'react';
import { Link } from 'react-router-dom';

export interface CategoryItem {
  id?: string;
  name: string;
  image: string;
  link: string;
}

interface CategorySectionProps {
  categories: CategoryItem[];
}

export function CategorySection({ categories }: CategorySectionProps) {
  if (!categories || categories.length === 0) return null;

  return (
    <div className="w-full py-2.5 bg-white border-b border-gray-100">
      <div className="flex gap-4 overflow-x-auto px-3 scrollbar-hide scroll-smooth">
        {categories.map((cat, idx) => (
          <Link
            key={cat.id || idx}
            to={cat.link}
            className="flex flex-col items-center min-w-[64px] shrink-0"
          >
            <div className="w-[54px] h-[54px] rounded-full overflow-hidden border border-slate-200 flex items-center justify-center bg-slate-50 transition-all hover:border-black hover:-translate-y-0.5">
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="mt-1.5 text-[11px] font-semibold text-neutral-800 uppercase tracking-wide text-center whitespace-nowrap">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
