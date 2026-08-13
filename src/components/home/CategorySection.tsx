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
    <div className="w-full py-4 bg-white border-b border-gray-100 select-none">
      <div className="flex gap-4 overflow-x-auto px-4 scrollbar-hide scroll-smooth">
        {categories.map((cat, idx) => (
          <Link
            key={cat.id || idx}
            to={cat.link}
            className="flex flex-col items-center w-[72px] sm:w-20 md:w-24 shrink-0 group text-center"
          >
            <div className="w-full aspect-square rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center bg-slate-50 transition-all duration-300 group-hover:border-black group-hover:shadow-xs group-hover:-translate-y-0.5">
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
            </div>
            <span 
              title={cat.name}
              className="mt-2 w-full text-[10px] sm:text-xs font-bold text-neutral-800 uppercase tracking-wide text-center truncate whitespace-nowrap block px-0.5"
            >
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
