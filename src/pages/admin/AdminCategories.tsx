import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import CategoryList from './CategoryList';
import AddCategory from './AddCategory';

export default function AdminCategories() {
  const location = useLocation();
  const path = location.pathname;

  const isAdd = path.includes('/add');
  const isEdit = path.includes('/edit');
  const isListing = !isAdd && !isEdit;

  return (
    <div className="space-y-6 min-h-full flex flex-col">
      {/* Category Tabs Menu System */}
      <div className="flex border-b border-zinc-200 select-none bg-white">
        <Link 
          to="/admin/category-listing" 
          className={`px-8 py-4 text-xs font-black uppercase tracking-[0.2em] border-b-2 transition-all ${
            isListing 
              ? 'border-b-4 border-black text-black' 
              : 'border-transparent text-gray-400 hover:text-black hover:border-zinc-300'
          }`}
        >
          Category Listing
        </Link>
        <Link 
          to="/admin/categories/add" 
          className={`px-8 py-4 text-xs font-black uppercase tracking-[0.2em] border-b-2 transition-all ${
            isAdd || isEdit
              ? 'border-b-4 border-black text-black' 
              : 'border-transparent text-gray-400 hover:text-black hover:border-zinc-300'
          }`}
        >
          {isEdit ? 'EDITING CATEGORY' : 'ADD CATEGORY'}
        </Link>
      </div>

      <div className="flex-1">
        <Routes>
          <Route path="/" element={<CategoryList />} />
          <Route path="/add" element={<AddCategory />} />
          <Route path="/edit/:id" element={<AddCategory />} />
        </Routes>
      </div>
    </div>
  );
}
